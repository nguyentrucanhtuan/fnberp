"""CRUD helpers cho module ProductCategory."""

import uuid

from sqlmodel import Session, col, func, select

from app.modules.product_category.models import (
    ProductCategory,
    ProductCategoryCreate,
    ProductCategoryUpdate,
)


# ── READ ──

def get_category(session: Session, category_id: uuid.UUID) -> ProductCategory | None:
    """Lấy category theo ID."""
    return session.exec(
        select(ProductCategory).where(ProductCategory.id == category_id)
    ).first()


def get_category_by_name(session: Session, name: str) -> ProductCategory | None:
    """Lấy category theo name (kiểm tra trùng)."""
    return session.exec(
        select(ProductCategory).where(ProductCategory.name == name)
    ).first()


def get_categories(
    session: Session,
    *,
    skip: int = 0,
    limit: int = 100,
    include_archived: bool = False,
) -> tuple[list[ProductCategory], int]:
    """Lấy danh sách categories có phân trang. Trả về (items, total_count)."""
    statement = select(ProductCategory)
    if not include_archived:
        statement = statement.where(ProductCategory.is_archived == False)  # noqa: E712
    count = session.exec(
        select(func.count()).select_from(statement.subquery())
    ).one()
    categories = session.exec(
        statement
        .order_by(col(ProductCategory.name))
        .offset(skip)
        .limit(limit)
    ).all()
    return list(categories), count


# ── CREATE ──

def create_category(
    session: Session, category_in: ProductCategoryCreate
) -> ProductCategory:
    """Tạo category mới."""
    category = ProductCategory.model_validate(category_in)
    session.add(category)
    session.commit()
    session.refresh(category)
    return category


# ── UPDATE ──

def update_category(
    session: Session, category: ProductCategory, category_in: ProductCategoryUpdate
) -> ProductCategory:
    """Cập nhật category (partial update)."""
    update_dict = category_in.model_dump(exclude_unset=True)
    category.sqlmodel_update(update_dict)
    session.add(category)
    session.commit()
    session.refresh(category)
    return category


# ── DELETE (xoá vật lý) ──

def delete_category(session: Session, category: ProductCategory) -> None:
    """Xoá category vật lý khỏi DB."""
    session.delete(category)
    session.commit()
