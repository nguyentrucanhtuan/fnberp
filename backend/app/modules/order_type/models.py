import uuid
from datetime import datetime, timezone
from pydantic import ConfigDict
from sqlalchemy import Column, DateTime
from sqlmodel import Field, SQLModel


def get_datetime_utc() -> datetime:
    return datetime.now(timezone.utc)


# ── 1. Base Schema (shared fields) ──
class OrderTypeBase(SQLModel):
    name: str = Field(min_length=1, max_length=255, description="Tên loại đơn hàng (Ví dụ: Mang đi, Tại chỗ, Grab...)")
    is_active: bool = Field(default=True, description="Trạng thái hoạt động")
    is_archived: bool = Field(default=False, description="Lưu trữ")


# ── 2. Create Schema ──
class OrderTypeCreate(OrderTypeBase):
    pass


# ── 3. Update Schema (TẤT CẢ field optional) ──
class OrderTypeUpdate(SQLModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    is_active: bool | None = Field(default=None)
    is_archived: bool | None = Field(default=None)


# ── 4. Database Model (table=True) ──
class OrderType(OrderTypeBase, table=True):
    __tablename__ = "order_types"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    created_at: datetime | None = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  # type: ignore
    )


# ── 5. Public Schema (trả về qua API) ──
class OrderTypePublic(OrderTypeBase):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    created_at: datetime | None = None


# ── 6. List Schema (phân trang) ──
class OrderTypesPublic(SQLModel):
    data: list[OrderTypePublic]
    count: int
