import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING

from pydantic import ConfigDict
from sqlalchemy import Column, DateTime, ForeignKey, Table
from sqlalchemy.orm import relationship as sa_relationship
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.modules.pos.models import Pos
    from app.modules.product_category.models import ProductCategory


def get_datetime_utc() -> datetime:
    return datetime.now(timezone.utc)


# ── Junction Table (N-N): KitchenScreen ↔ ProductCategory ──
kitchen_screen_product_category_link = Table(
    "kitchen_screen_product_category_link",
    SQLModel.metadata,
    Column(
        "kitchen_screen_id",
        ForeignKey("kitchen_screens.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column(
        "category_id",
        ForeignKey("product_categories.id", ondelete="CASCADE"),
        primary_key=True,
    ),
)


# ── 1. Base Schema (shared fields) ──
class KitchenScreenBase(SQLModel):
    name: str = Field(min_length=1, max_length=255, description="Tên màn hình nhà bếp")
    pos_id: uuid.UUID = Field(foreign_key="pos_locations.id", description="POS áp dụng")
    is_active: bool = Field(default=True, description="Trạng thái hoạt động")


# ── 2. Create Schema ──
class KitchenScreenCreate(KitchenScreenBase):
    category_ids: list[uuid.UUID] = Field(default_factory=list, description="Danh mục áp dụng")


# ── 3. Update Schema (tất cả field optional) ──
class KitchenScreenUpdate(SQLModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    pos_id: uuid.UUID | None = Field(default=None)
    is_active: bool | None = Field(default=None)
    category_ids: list[uuid.UUID] | None = Field(default=None)


# ── 4. Database Model (table=True) ──
class KitchenScreen(KitchenScreenBase, table=True):
    __tablename__ = "kitchen_screens"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    created_at: datetime | None = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  # type: ignore
    )

    # 1-N Relationship: POS
    pos: "Pos" = Relationship(sa_relationship_kwargs={"lazy": "selectin"})

    # N-N Relationship: Danh mục sản phẩm
    categories: list["ProductCategory"] = Relationship(
        sa_relationship=sa_relationship(
            "ProductCategory",
            secondary=kitchen_screen_product_category_link,
            lazy="selectin",
        )
    )


# ── 5a. Inline Public Schemas (tránh circular import) ──
class PosInKitchenScreen(SQLModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    name: str


class CategoryInKitchenScreen(SQLModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    name: str


# ── 5. Public Schema (trả về qua API) ──
class KitchenScreenPublic(KitchenScreenBase):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    created_at: datetime | None = None
    pos: PosInKitchenScreen | None = None
    categories: list[CategoryInKitchenScreen] = []


# ── 6. List Schema (phân trang) ──
class KitchenScreensPublic(SQLModel):
    data: list[KitchenScreenPublic]
    count: int
