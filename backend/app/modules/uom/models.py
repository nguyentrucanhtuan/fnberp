import uuid
from datetime import datetime, timezone
from typing import Optional

from pydantic import ConfigDict
from sqlalchemy import DateTime
from sqlalchemy.orm import relationship
from sqlmodel import Field, Relationship, SQLModel


def get_datetime_utc() -> datetime:
    return datetime.now(timezone.utc)


# ── 1. Base Schema (shared fields) ──
class UomBase(SQLModel):
    code: str = Field(
        max_length=20,
        unique=True,
        index=True,
        description="Mã đơn vị (VD: kg, lit, cai)",
    )

    name: str = Field(min_length=1, max_length=100, description="Tên đơn vị tính")

    relative_factor: float = Field(default=1.0, ge=0, description="Hệ số quy đổi")

    relative_uom_id: uuid.UUID | None = Field(
        default=None,
        foreign_key="uoms.id",
        description="Đơn vị quy đổi",
    )

    is_archived: bool = Field(default=False, description="Lưu trữ")


# ── 2. Create Schema ──
class UomCreate(UomBase):
    pass


# ── 3. Update Schema (tất cả field optional) ──
class UomUpdate(SQLModel):
    code: str | None = Field(default=None, max_length=20)
    name: str | None = Field(default=None, min_length=1, max_length=100)
    relative_factor: float | None = Field(default=None, ge=0)
    relative_uom_id: uuid.UUID | None = Field(default=None)
    is_archived: bool | None = Field(default=None)


# ── 4. Database Model (table=True) ──
class Uom(UomBase, table=True):
    __tablename__ = "uoms"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    created_at: datetime | None = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  # type: ignore
    )
    # Self-referencing relationship
    base_uom: Optional["Uom"] = Relationship(
        sa_relationship=relationship("Uom", remote_side="Uom.id")
    )


# ── 5. Public Schema (trả về qua API) ──
class UomPublic(UomBase):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    created_at: datetime | None = None
    base_uom: UomBase | None = None


# ── 6. List Schema (phân trang) ──
class UomsPublic(SQLModel):
    data: list[UomPublic]
    count: int
