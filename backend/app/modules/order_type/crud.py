"""CRUD helpers cho module OrderType."""

import uuid
from sqlmodel import Session, col, func, select
from app.modules.order_type.models import OrderType, OrderTypeCreate, OrderTypeUpdate


# ── READ ──

def get_order_type(session: Session, order_type_id: uuid.UUID) -> OrderType | None:
    """Lấy loại đơn hàng theo ID."""
    return session.exec(select(OrderType).where(OrderType.id == order_type_id)).first()


def get_order_type_by_name(session: Session, name: str) -> OrderType | None:
    """Lấy loại đơn hàng theo tên."""
    return session.exec(select(OrderType).where(OrderType.name == name)).first()


def get_order_types(
    session: Session,
    *,
    skip: int = 0,
    limit: int = 100,
    include_archived: bool = False,
) -> tuple[list[OrderType], int]:
    """Lấy danh sách các loại đơn hàng có phân trang."""
    statement = select(OrderType)
    if not include_archived:
        statement = statement.where(OrderType.is_archived == False)  # noqa: E712
    
    count = session.exec(
        select(func.count()).select_from(statement.subquery())
    ).one()
    
    order_types = session.exec(
        statement
        .order_by(col(OrderType.created_at).desc())
        .offset(skip)
        .limit(limit)
    ).all()
    
    return list(order_types), count


# ── CREATE ──

def create_order_type(session: Session, order_type_in: OrderTypeCreate) -> OrderType:
    """Tạo loại đơn hàng mới."""
    order_type = OrderType.model_validate(order_type_in)
    session.add(order_type)
    session.commit()
    session.refresh(order_type)
    return order_type


# ── UPDATE ──

def update_order_type(
    session: Session, order_type: OrderType, order_type_in: OrderTypeUpdate
) -> OrderType:
    """Cập nhật loại đơn hàng (partial update)."""
    update_dict = order_type_in.model_dump(exclude_unset=True)
    order_type.sqlmodel_update(update_dict)
    session.add(order_type)
    session.commit()
    session.refresh(order_type)
    return order_type


# ── DELETE ──

def delete_order_type(session: Session, order_type: OrderType) -> None:
    """Xoá loại đơn hàng."""
    session.delete(order_type)
    session.commit()
