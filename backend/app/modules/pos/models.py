import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING

from pydantic import ConfigDict
from sqlalchemy import Column, DateTime, ForeignKey, Table
from sqlalchemy.orm import relationship as sa_relationship
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.modules.payment_method.models import PaymentMethod


def get_datetime_utc() -> datetime:
    return datetime.now(timezone.utc)


# ── Junction Table (N-N): POS ↔ PaymentMethod ──
pos_payment_method_link = Table(
    "pos_payment_method_link",
    SQLModel.metadata,
    Column(
        "pos_id",
        ForeignKey("pos_locations.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column(
        "payment_method_id",
        ForeignKey("payment_methods.id", ondelete="CASCADE"),
        primary_key=True,
    ),
)


# ── 1. Base Schema ──
class PosBase(SQLModel):
    name: str = Field(min_length=1, max_length=255, description="Tên quầy bán hàng")
    is_archived: bool = Field(default=False, description="Lưu trữ")


# ── 2. Create Schema ──
class PosCreate(PosBase):
    payment_method_ids: list[uuid.UUID] = Field(default_factory=list)


# ── 3. Update Schema (tất cả field optional) ──
class PosUpdate(SQLModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    is_archived: bool | None = Field(default=None)
    payment_method_ids: list[uuid.UUID] | None = Field(default=None)


# ── 4. Database Model ──
class Pos(PosBase, table=True):
    __tablename__ = "pos_locations"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    created_at: datetime | None = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  # type: ignore
    )

    # N-N Relationship: Phương thức thanh toán
    payment_methods: list["PaymentMethod"] = Relationship(
        sa_relationship=sa_relationship(
            "PaymentMethod",
            secondary=pos_payment_method_link,
            lazy="selectin",
        )
    )


# ── 5a. Inline Public Schema cho PaymentMethod (tránh circular import) ──
class PaymentMethodInPos(SQLModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    name: str
    code: str


# ── 5. Public Schema ──
class PosPublic(PosBase):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    created_at: datetime | None = None
    payment_methods: list[PaymentMethodInPos] = []


# ── 6. List Schema ──
class PossPublic(SQLModel):
    data: list[PosPublic]
    count: int
