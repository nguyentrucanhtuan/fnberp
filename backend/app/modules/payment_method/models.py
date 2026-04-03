import uuid
from datetime import datetime, timezone

from pydantic import ConfigDict
from sqlalchemy import DateTime
from sqlmodel import Field, SQLModel


def get_datetime_utc() -> datetime:
    return datetime.now(timezone.utc)


# ── 1. Base Schema ──
class PaymentMethodBase(SQLModel):
    name: str = Field(min_length=1, max_length=255, description="Tên phương thức thanh toán")
    code: str = Field(min_length=1, max_length=50, description="Mã phương thức thanh toán")
    is_archived: bool = Field(default=False, description="Lưu trữ")


# ── 2. Create Schema ──
class PaymentMethodCreate(PaymentMethodBase):
    pass


# ── 3. Update Schema (tất cả field optional) ──
class PaymentMethodUpdate(SQLModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    code: str | None = Field(default=None, min_length=1, max_length=50)
    is_archived: bool | None = Field(default=None)


# ── 4. Database Model ──
class PaymentMethod(PaymentMethodBase, table=True):
    __tablename__ = "payment_methods"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    created_at: datetime | None = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  # type: ignore
    )


# ── 5. Public Schema ──
class PaymentMethodPublic(PaymentMethodBase):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    created_at: datetime | None = None


# ── 6. List Schema ──
class PaymentMethodsPublic(SQLModel):
    data: list[PaymentMethodPublic]
    count: int
