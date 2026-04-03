"""CRUD helpers cho module PaymentMethod (Phương thức thanh toán)."""

import uuid

from sqlmodel import Session, col, func, select

from app.modules.payment_method.models import (
    PaymentMethod,
    PaymentMethodCreate,
    PaymentMethodUpdate,
)


def get_payment_method(session: Session, pm_id: uuid.UUID) -> PaymentMethod | None:
    """Lấy phương thức thanh toán theo ID."""
    return session.exec(
        select(PaymentMethod).where(PaymentMethod.id == pm_id)
    ).first()


def get_payment_method_by_code(session: Session, code: str) -> PaymentMethod | None:
    """Lấy phương thức thanh toán theo mã (unique check)."""
    return session.exec(
        select(PaymentMethod).where(PaymentMethod.code == code)
    ).first()


def get_payment_methods(
    session: Session,
    *,
    skip: int = 0,
    limit: int = 100,
    include_archived: bool = False,
) -> tuple[list[PaymentMethod], int]:
    """Lấy danh sách phương thức thanh toán có phân trang."""
    statement = select(PaymentMethod)
    if not include_archived:
        statement = statement.where(PaymentMethod.is_archived == False)  # noqa: E712
    count = session.exec(
        select(func.count()).select_from(statement.subquery())
    ).one()
    items = session.exec(
        statement.order_by(col(PaymentMethod.name)).offset(skip).limit(limit)
    ).all()
    return list(items), count


def create_payment_method(
    session: Session, pm_in: PaymentMethodCreate
) -> PaymentMethod:
    """Tạo phương thức thanh toán mới."""
    pm = PaymentMethod.model_validate(pm_in)
    session.add(pm)
    session.commit()
    session.refresh(pm)
    return pm


def update_payment_method(
    session: Session, pm: PaymentMethod, pm_in: PaymentMethodUpdate
) -> PaymentMethod:
    """Cập nhật phương thức thanh toán (partial update)."""
    update_dict = pm_in.model_dump(exclude_unset=True)
    pm.sqlmodel_update(update_dict)
    session.add(pm)
    session.commit()
    session.refresh(pm)
    return pm


def delete_payment_method(session: Session, pm: PaymentMethod) -> None:
    """Xoá phương thức thanh toán."""
    session.delete(pm)
    session.commit()
