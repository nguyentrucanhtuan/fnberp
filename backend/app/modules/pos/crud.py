"""CRUD helpers cho module POS (Quầy bán hàng)."""

import uuid

from sqlmodel import Session, col, func, select

from app.modules.pos.models import Pos, PosCreate, PosUpdate


def get_pos(session: Session, pos_id: uuid.UUID) -> Pos | None:
    """Lấy quầy bán hàng theo ID."""
    return session.exec(select(Pos).where(Pos.id == pos_id)).first()


def get_poss(
    session: Session,
    *,
    skip: int = 0,
    limit: int = 100,
    include_archived: bool = False,
) -> tuple[list[Pos], int]:
    """Lấy danh sách quầy bán hàng có phân trang."""
    statement = select(Pos)
    if not include_archived:
        statement = statement.where(Pos.is_archived == False)  # noqa: E712
    count = session.exec(
        select(func.count()).select_from(statement.subquery())
    ).one()
    items = session.exec(
        statement.order_by(col(Pos.name)).offset(skip).limit(limit)
    ).all()
    return list(items), count


def _sync_payment_methods(
    session: Session, pos: Pos, payment_method_ids: list[uuid.UUID]
) -> None:
    """Đồng bộ quan hệ N-N giữa POS và PaymentMethod."""
    from app.modules.payment_method.models import PaymentMethod

    methods = session.exec(
        select(PaymentMethod).where(
            col(PaymentMethod.id).in_(payment_method_ids)
        )
    ).all()
    pos.payment_methods = list(methods)


def create_pos(session: Session, pos_in: PosCreate) -> Pos:
    """Tạo quầy bán hàng mới kèm đồng bộ phương thức thanh toán."""
    payment_method_ids = pos_in.payment_method_ids
    data = pos_in.model_dump(exclude={"payment_method_ids"})
    pos = Pos.model_validate(data)
    session.add(pos)
    session.flush()  # Lấy ID trước khi sync
    _sync_payment_methods(session, pos, payment_method_ids)
    session.commit()
    session.refresh(pos)
    return pos


def update_pos(session: Session, pos: Pos, pos_in: PosUpdate) -> Pos:
    """Cập nhật quầy bán hàng (partial update) kèm đồng bộ phương thức thanh toán."""
    update_dict = pos_in.model_dump(exclude_unset=True, exclude={"payment_method_ids"})
    pos.sqlmodel_update(update_dict)
    if pos_in.payment_method_ids is not None:
        _sync_payment_methods(session, pos, pos_in.payment_method_ids)
    session.add(pos)
    session.commit()
    session.refresh(pos)
    return pos


def delete_pos(session: Session, pos: Pos) -> None:
    """Xoá quầy bán hàng."""
    session.delete(pos)
    session.commit()
