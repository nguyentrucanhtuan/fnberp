import uuid
from typing import Tuple, List

from sqlmodel import Session, col, func, select

from app.modules.kitchen_screen.models import (
    KitchenScreen,
    KitchenScreenCreate,
    KitchenScreenUpdate,
)
from app.modules.product_category.models import ProductCategory


def get_screen(session: Session, screen_id: uuid.UUID) -> KitchenScreen | None:
    """Lấy màn hình nhà bếp theo ID."""
    return session.get(KitchenScreen, screen_id)


def get_screens(
    session: Session, *, skip: int = 0, limit: int = 100
) -> tuple[list[KitchenScreen], int]:
    """Lấy danh sách màn hình nhà bếp có phân trang."""
    statement = select(KitchenScreen)
    count = session.exec(select(func.count()).select_from(statement.subquery())).one()
    screens = session.exec(
        statement.order_by(col(KitchenScreen.created_at).desc())
        .offset(skip)
        .limit(limit)
    ).all()
    return list(screens), count


def create_screen(session: Session, screen_in: KitchenScreenCreate) -> KitchenScreen:
    """Tạo màn hình nhà bếp mới."""
    db_obj = KitchenScreen.model_validate(screen_in)
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)

    if screen_in.category_ids:
        sync_screen_categories(session, db_obj, screen_in.category_ids)

    return db_obj


def update_screen(
    session: Session, db_obj: KitchenScreen, screen_in: KitchenScreenUpdate
) -> KitchenScreen:
    """Cập nhật thông tin màn hình nhà bếp."""
    update_data = screen_in.model_dump(exclude_unset=True)
    db_obj.sqlmodel_update(update_data)
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)

    if screen_in.category_ids is not None:
        sync_screen_categories(session, db_obj, screen_in.category_ids)

    return db_obj


def delete_screen(session: Session, db_obj: KitchenScreen) -> None:
    """Xoá màn hình nhà bếp."""
    session.delete(db_obj)
    session.commit()


def sync_screen_categories(
    session: Session, screen: KitchenScreen, category_ids: list[uuid.UUID]
) -> None:
    """Đồng bộ quan hệ N-N giữa Màn hình và Danh mục sản phẩm."""
    categories = session.exec(
        select(ProductCategory).where(col(ProductCategory.id).in_(category_ids))
    ).all()
    screen.categories = list(categories)
    session.add(screen)
    session.commit()
    session.refresh(screen)
