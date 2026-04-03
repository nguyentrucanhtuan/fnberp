"""CRUD helpers cho module Warehouse."""

import uuid

from sqlmodel import Session, col, func, select

from app.modules.warehouse.models import Warehouse, WarehouseCreate, WarehouseUpdate


# ── READ ──

def get_warehouse(session: Session, warehouse_id: uuid.UUID) -> Warehouse | None:
    """Lấy warehouse theo ID."""
    return session.exec(
        select(Warehouse).where(Warehouse.id == warehouse_id)
    ).first()


def get_warehouse_by_code(session: Session, code: str) -> Warehouse | None:
    """Lấy warehouse theo code (unique)."""
    return session.exec(
        select(Warehouse).where(Warehouse.code == code)
    ).first()


def get_warehouses(
    session: Session,
    *,
    skip: int = 0,
    limit: int = 100,
    include_archived: bool = False,
) -> tuple[list[Warehouse], int]:
    """Lấy danh sách Warehouse có phân trang. Trả về (items, total_count)."""
    statement = select(Warehouse)
    if not include_archived:
        statement = statement.where(Warehouse.is_archived == False)  # noqa: E712
    count = session.exec(
        select(func.count()).select_from(statement.subquery())
    ).one()
    warehouses = session.exec(
        statement
        .order_by(col(Warehouse.code))
        .offset(skip)
        .limit(limit)
    ).all()
    return list(warehouses), count


# ── CREATE ──

def create_warehouse(session: Session, warehouse_in: WarehouseCreate) -> Warehouse:
    """Tạo Warehouse mới."""
    warehouse = Warehouse.model_validate(warehouse_in)
    session.add(warehouse)
    session.commit()
    session.refresh(warehouse)
    return warehouse


# ── UPDATE ──

def update_warehouse(
    session: Session, warehouse: Warehouse, warehouse_in: WarehouseUpdate
) -> Warehouse:
    """Cập nhật Warehouse (partial update)."""
    update_dict = warehouse_in.model_dump(exclude_unset=True)
    warehouse.sqlmodel_update(update_dict)
    session.add(warehouse)
    session.commit()
    session.refresh(warehouse)
    return warehouse


# ── DELETE ──

def delete_warehouse(session: Session, warehouse: Warehouse) -> None:
    """Xoá Warehouse."""
    session.delete(warehouse)
    session.commit()
