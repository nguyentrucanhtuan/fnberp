"""CRUD helpers cho module UOM."""

import uuid
from typing import Any, cast
from sqlalchemy.orm import selectinload
from sqlmodel import Session, col, func, select

from app.modules.uom.models import Uom, UomCreate, UomUpdate


def get_uom(session: Session, uom_id: uuid.UUID) -> Uom | None:
    """Lấy UOM theo ID kèm đơn vị gốc."""
    return session.exec(
        select(Uom).where(Uom.id == uom_id).options(selectinload(cast(Any, Uom.base_uom)))
    ).first()


def get_uom_by_code(session: Session, code: str) -> Uom | None:
    """Lấy UOM theo code (unique)."""
    return session.exec(select(Uom).where(Uom.code == code)).first()


def get_uoms(
    session: Session,
    *,
    skip: int = 0,
    limit: int = 100,
    include_archived: bool = False,
) -> tuple[list[Uom], int]:
    """Lấy danh sách UOM có phân trang. Trả về (items, total_count)."""
    statement = select(Uom)
    if not include_archived:
        statement = statement.where(Uom.is_archived == False)  # noqa: E712
    count = session.exec(select(func.count()).select_from(statement.subquery())).one()
    uoms = session.exec(
        statement.options(selectinload(cast(Any, Uom.base_uom)))
        .order_by(col(Uom.code))
        .offset(skip)
        .limit(limit)
    ).all()
    return list(uoms), count


def create_uom(session: Session, uom_in: UomCreate) -> Uom:
    """Tạo UOM mới (không kiểm tra trùng code — caller tự validate)."""
    uom = Uom.model_validate(uom_in)
    session.add(uom)
    session.commit()
    session.refresh(uom)
    return uom


def update_uom(session: Session, uom: Uom, uom_in: UomUpdate) -> Uom:
    """Cập nhật UOM (partial update)."""
    update_dict = uom_in.model_dump(exclude_unset=True)
    uom.sqlmodel_update(update_dict)
    session.add(uom)
    session.commit()
    session.refresh(uom)
    return uom


def delete_uom(session: Session, uom: Uom) -> None:
    """Xoá UOM."""
    session.delete(uom)
    session.commit()
