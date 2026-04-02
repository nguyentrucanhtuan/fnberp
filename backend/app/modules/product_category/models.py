import uuid
from datetime import datetime, timezone

from pydantic import ConfigDict
from sqlalchemy import DateTime
from sqlmodel import Field, SQLModel


def get_datetime_utc() -> datetime:
    return datetime.now(timezone.utc)


# ── 1. Base Schema (shared fields) ──
class ProductCategoryBase(SQLModel):
    name: str = Field(min_length=1, max_length=255, description="Tên danh mục")
    color: str | None = Field(default=None, max_length=7, description="Màu sắc")
    image: str | None = Field(default=None, max_length=255, description="Hình ảnh")
    description: str | None = Field(default=None, max_length=500, description="Mô tả")
    is_archived: bool = Field(default=False, description="Lưu trữ")


# ── 2. Create Schema ──
class ProductCategoryCreate(ProductCategoryBase):
    pass


# ── 3. Update Schema (tất cả field optional) ──
class ProductCategoryUpdate(SQLModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    color: str | None = Field(default=None, max_length=7)
    image: str | None = Field(default=None, max_length=255)
    description: str | None = Field(default=None, max_length=500)
    is_archived: bool | None = Field(default=None)


# ── 4. Database Model (table=True) ──
class ProductCategory(ProductCategoryBase, table=True):
    __tablename__ = "product_categories"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    created_at: datetime | None = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  # type: ignore
    )


# ── 5. Public Schema (trả về qua API) ──
class ProductCategoryPublic(ProductCategoryBase):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    created_at: datetime | None = None


# ── 6. List Schema (phân trang) ──
class ProductCategoriesPublic(SQLModel):
    data: list[ProductCategoryPublic]
    count: int
