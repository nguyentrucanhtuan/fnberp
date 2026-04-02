"""CRUD helpers cho module Product."""

import uuid

from sqlmodel import Session, col, func, select

from app.modules.product.models import Product, ProductCreate, ProductUpdate
from app.modules.product_category.models import ProductCategory
from app.modules.uom.models import Uom


# ── READ ──

def get_product(session: Session, product_id: uuid.UUID) -> Product | None:
    """Lấy product theo ID (categories tự eager-load qua sa_relationship_kwargs)."""
    return session.exec(
        select(Product).where(Product.id == product_id)
    ).first()


def get_product_by_name(session: Session, name: str) -> Product | None:
    """Lấy product theo name."""
    return session.exec(
        select(Product).where(Product.name == name)
    ).first()


def get_products(
    session: Session,
    *,
    skip: int = 0,
    limit: int = 100,
    include_archived: bool = False,
) -> tuple[list[Product], int]:
    """Lấy danh sách products có phân trang. Trả về (items, total_count)."""
    statement = select(Product)
    if not include_archived:
        statement = statement.where(Product.is_archived == False)  # noqa: E712
    count = session.exec(
        select(func.count()).select_from(statement.subquery())
    ).one()
    products = session.exec(
        statement
        .order_by(col(Product.created_at).desc())
        .offset(skip)
        .limit(limit)
    ).all()
    return list(products), count


# ── CREATE ──

def create_product(
    session: Session,
    product_in: ProductCreate,
) -> Product:
    """Tạo product mới + gắn categories & uoms phụ."""
    # Tách các ids quan hệ ra khỏi data chính
    category_ids = product_in.category_ids
    uom_ids = getattr(product_in, "uom_ids", []) # Lấy từ schema nếu có

    product_data = product_in.model_dump(exclude={"category_ids", "uom_ids"})
    product = Product.model_validate(product_data)

    # Gắn categories
    if category_ids:
        product.categories = _get_categories_by_ids(session, category_ids)

    # Gắn đơn vị phụ (N-N)
    if uom_ids:
        product.uoms = _get_uoms_by_ids(session, uom_ids)

    session.add(product)
    session.commit()
    session.refresh(product)
    return product


# ── UPDATE ──

def update_product(
    session: Session,
    product: Product,
    product_in: ProductUpdate,
) -> Product:
    """Cập nhật product (partial update) + sync categories & uoms phụ."""
    update_dict = product_in.model_dump(
        exclude_unset=True, exclude={"category_ids", "uom_ids"}
    )
    product.sqlmodel_update(update_dict)

    # Sync categories
    if product_in.category_ids is not None:
        product.categories = _get_categories_by_ids(session, product_in.category_ids)

    # Sync đơn vị phụ (uoms)
    if product_in.uom_ids is not None:
        product.uoms = _get_uoms_by_ids(session, product_in.uom_ids)

    session.add(product)
    session.commit()
    session.refresh(product)
    return product


# ── DELETE (xoá vật lý) ──

def delete_product(session: Session, product: Product) -> None:
    """Xoá product vật lý khỏi DB (cascade xoá link table)."""
    session.delete(product)
    session.commit()


# ── PRIVATE HELPERS ──

def _get_uoms_by_ids(
    session: Session, uom_ids: list[uuid.UUID]
) -> list[Uom]:
    """Lấy danh sách Uom theo list IDs."""
    if not uom_ids:
        return []
    uoms = session.exec(select(Uom).where(Uom.id.in_(uom_ids))).all()  # type: ignore
    return list(uoms)


def _get_categories_by_ids(
    session: Session, category_ids: list[uuid.UUID]
) -> list[ProductCategory]:
    """Lấy danh sách ProductCategory theo list IDs."""
    if not category_ids:
        return []
    categories = session.exec(
        select(ProductCategory).where(
            ProductCategory.id.in_(category_ids)  # type: ignore
        )
    ).all()
    return list(categories)
