import uuid
from datetime import datetime, timezone

from pydantic import ConfigDict
from sqlalchemy import DateTime
from sqlmodel import Field, SQLModel


def get_datetime_utc() -> datetime:
    return datetime.now(timezone.utc)


# ── 1. Base Schema (shared fields) ──
class WarehouseBase(SQLModel):
    code: str = Field(
        max_length=20,
        unique=True,
        index=True,
        description="Mã kho (VD: KHO01, WH-HCM)",
    )
    name: str = Field(min_length=1, max_length=255, description="Tên kho")
    address: str | None = Field(
        default=None, max_length=500, description="Địa chỉ kho"
    )
    is_archived: bool = Field(default=False, description="Lưu trữ")


# ── 2. Create Schema ──
class WarehouseCreate(WarehouseBase):
    pass


# ── 3. Update Schema (tất cả field optional) ──
class WarehouseUpdate(SQLModel):
    code: str | None = Field(default=None, max_length=20)
    name: str | None = Field(default=None, min_length=1, max_length=255)
    address: str | None = Field(default=None, max_length=500)
    is_archived: bool | None = Field(default=None)


# ── 4. Database Model (table=True) ──
class Warehouse(WarehouseBase, table=True):
    __tablename__ = "warehouses"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    created_at: datetime | None = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  # type: ignore
    )


# ── 5. Public Schema (trả về qua API) ──
class WarehousePublic(WarehouseBase):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    created_at: datetime | None = None


# ── 6. List Schema (phân trang) ──
class WarehousesPublic(SQLModel):
    data: list[WarehousePublic]
    count: int
