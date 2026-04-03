import uuid
from datetime import datetime, timezone
from typing import Literal

from pydantic import ConfigDict
from sqlalchemy import Column, DateTime
from sqlalchemy import Enum as SaEnum
from sqlmodel import Field, SQLModel


def get_datetime_utc() -> datetime:
    return datetime.now(timezone.utc)


# ── Enum type ──
PrinterType = Literal["invoice", "label", "kitchen_order_ticket"]

PRINTER_TYPE_ENUM = SaEnum(
    "invoice",
    "label",
    "kitchen_order_ticket",
    name="printertype",
)


# ── 1. Base Schema ──
class PrinterBase(SQLModel):
    name: str = Field(min_length=1, max_length=255, description="Tên thiết bị máy in")
    ip: str = Field(min_length=1, max_length=255, description="Địa chỉ IP máy in")
    port: int = Field(default=9100, ge=1, le=65535, description="Cổng kết nối")
    printer_type: PrinterType = Field(
        default="invoice",
        sa_column=Column(PRINTER_TYPE_ENUM, nullable=False),
        description="Loại máy in",
    )
    is_active: bool = Field(default=True, description="Máy in đang hoạt động")
    is_archived: bool = Field(default=False, description="Lưu trữ")


# ── 2. Create Schema ──
class PrinterCreate(PrinterBase):
    pass


# ── 3. Update Schema (tất cả field optional) ──
class PrinterUpdate(SQLModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    ip: str | None = Field(default=None, min_length=1, max_length=255)
    port: int | None = Field(default=None, ge=1, le=65535)
    printer_type: PrinterType | None = Field(default=None)
    is_active: bool | None = Field(default=None)
    is_archived: bool | None = Field(default=None)


# ── 4. Database Model ──
class Printer(PrinterBase, table=True):
    __tablename__ = "printers"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    created_at: datetime | None = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  # type: ignore
    )


# ── 5. Public Schema ──
class PrinterPublic(PrinterBase):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    created_at: datetime | None = None


# ── 6. List Schema ──
class PrintersPublic(SQLModel):
    data: list[PrinterPublic]
    count: int
