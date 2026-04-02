import uuid
from datetime import datetime, timezone
from typing import Literal, TYPE_CHECKING

from pydantic import ConfigDict
from sqlalchemy import Column, DateTime, ForeignKey, Table
from sqlalchemy import Enum as SaEnum
from sqlalchemy.orm import relationship as sa_relationship
from sqlmodel import Field, Relationship, SQLModel

from app.modules.product_category.models import ProductCategory
from app.modules.uom.models import UomPublic

if TYPE_CHECKING:
    from app.modules.uom.models import Uom


def get_datetime_utc() -> datetime:
    return datetime.now(timezone.utc)


# ── Junction Tables ──

# N-N giữa Product và ProductCategory
product_category_link = Table(
    "product_category_link",
    SQLModel.metadata,
    Column(
        "product_id", ForeignKey("products.id", ondelete="CASCADE"), primary_key=True
    ),
    Column(
        "category_id",
        ForeignKey("product_categories.id", ondelete="CASCADE"),
        primary_key=True,
    ),
)

# N-N giữa Product và Uom (cho các đơn vị phụ)
product_uom_link = Table(
    "product_uom_link",
    SQLModel.metadata,
    Column("product_id", ForeignKey("products.id", ondelete="CASCADE"), primary_key=True),
    Column("uom_id", ForeignKey("uoms.id", ondelete="CASCADE"), primary_key=True),
)


# ── 1. Base Schema (shared fields) ──
class ProductBase(SQLModel):
    name: str = Field(min_length=1, max_length=255, description="Tên sản phẩm")
    sku: str = Field(min_length=1, max_length=255, description="Mã sản phẩm")
    image: str = Field(default="", max_length=255, description="Hình ảnh")

    type: Literal["consu", "service", "combo"] = Field(
        default="consu",
        description="Loại sản phẩm (consu: hàng hoá, service: dịch vụ, combo: bộ)",
        sa_column=Column(
            SaEnum("consu", "service", "combo", name="producttype"), nullable=False
        ),
    )

    description: str | None = Field(default=None, max_length=500, description="Mô tả")

    # Đơn vị tính chính (1-1)
    uom_id: uuid.UUID | None = Field(
        default=None, foreign_key="uoms.id", description="Đơn vị tính chính"
    )

    price: float = Field(default=0, ge=0, description="Giá bán")
    cost: float = Field(default=0, ge=0, description="Giá vốn")
    vat_sale: float = Field(default=0, ge=0, description="VAT bán ra (%)")
    vat_purchase: float = Field(default=0, ge=0, description="VAT mua vào (%)")

    is_purchase: bool = Field(default=False, description="Có thể mua")
    is_sale: bool = Field(default=True, description="Có thể bán")
    is_manufacture: bool = Field(default=False, description="Dùng để sản xuất")
    is_storable: bool = Field(default=False, description="Theo dõi tồn kho")

    is_archived: bool = Field(default=False, description="Lưu trữ")


# ── 2. Create Schema ──
class ProductCreate(ProductBase):
    category_ids: list[uuid.UUID] = Field(
        default_factory=list, description="Danh sách ID danh mục"
    )
    uom_ids: list[uuid.UUID] = Field(
        default_factory=list, description="Danh sách ID đơn vị phụ"
    )


# ── 3. Update Schema (tất cả field optional) ──
class ProductUpdate(SQLModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    sku: str | None = Field(default=None, min_length=1, max_length=255)
    image: str | None = Field(default=None, max_length=255)
    type: Literal["consu", "service", "combo"] | None = Field(default=None)
    description: str | None = Field(default=None, max_length=500)
    uom_id: uuid.UUID | None = Field(default=None)
    price: float | None = Field(default=None, ge=0)
    cost: float | None = Field(default=None, ge=0)
    vat_sale: float | None = Field(default=None, ge=0)
    vat_purchase: float | None = Field(default=None, ge=0)
    is_purchase: bool | None = Field(default=None)
    is_sale: bool | None = Field(default=None)
    is_manufacture: bool | None = Field(default=None)
    is_storable: bool | None = Field(default=None)
    is_archived: bool | None = Field(default=None)
    
    # IDs để cập nhật quan hệ N-N
    category_ids: list[uuid.UUID] | None = Field(default=None)
    uom_ids: list[uuid.UUID] | None = Field(default=None, description="Danh sách đơn vị phụ")


# ── 4. Database Model (table=True) ──
class Product(ProductBase, table=True):
    __tablename__ = "products"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    created_at: datetime | None = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  # type: ignore
    )

    # 1-N: Đơn vị chính
    uom: "Uom" = Relationship(sa_relationship_kwargs={"lazy": "selectin"})

    # N-N: Danh mục
    categories: list[ProductCategory] = Relationship(
        sa_relationship=sa_relationship(
            "ProductCategory",
            secondary=product_category_link,
            lazy="selectin",
        )
    )

    # N-N: Đơn vị phụ
    uoms: list["Uom"] = Relationship(
        sa_relationship=sa_relationship(
            "Uom",
            secondary=product_uom_link,
            lazy="selectin",
        )
    )


# ── 5. Public Schema (trả về qua API) ──
class CategoryInProduct(SQLModel):
    """Schema nhẹ cho category khi lồng trong Product response."""

    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    name: str
    description: str | None = None


class ProductPublic(ProductBase):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    created_at: datetime | None = None
    categories: list[CategoryInProduct] = []

    # Thêm thông tin UOM vào response
    uom: UomPublic | None = None
    uoms: list[UomPublic] = []


# ── 6. List Schema (phân trang) ──
class ProductsPublic(SQLModel):
    data: list[ProductPublic]
    count: int
