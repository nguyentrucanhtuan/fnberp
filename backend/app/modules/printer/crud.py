"""CRUD helpers cho module Printer (Thiết bị máy in)."""

import uuid

from sqlmodel import Session, col, func, select

from app.modules.printer.models import Printer, PrinterCreate, PrinterUpdate


def get_printer(session: Session, printer_id: uuid.UUID) -> Printer | None:
    """Lấy máy in theo ID."""
    return session.exec(select(Printer).where(Printer.id == printer_id)).first()


def get_printers(
    session: Session,
    *,
    skip: int = 0,
    limit: int = 100,
    include_archived: bool = False,
) -> tuple[list[Printer], int]:
    """Lấy danh sách máy in có phân trang."""
    statement = select(Printer)
    if not include_archived:
        statement = statement.where(Printer.is_archived == False)  # noqa: E712
    count = session.exec(
        select(func.count()).select_from(statement.subquery())
    ).one()
    items = session.exec(
        statement.order_by(col(Printer.name)).offset(skip).limit(limit)
    ).all()
    return list(items), count


def create_printer(session: Session, printer_in: PrinterCreate) -> Printer:
    """Tạo máy in mới."""
    printer = Printer.model_validate(printer_in)
    session.add(printer)
    session.commit()
    session.refresh(printer)
    return printer


def update_printer(
    session: Session, printer: Printer, printer_in: PrinterUpdate
) -> Printer:
    """Cập nhật máy in (partial update)."""
    update_dict = printer_in.model_dump(exclude_unset=True)
    printer.sqlmodel_update(update_dict)
    session.add(printer)
    session.commit()
    session.refresh(printer)
    return printer


def delete_printer(session: Session, printer: Printer) -> None:
    """Xoá máy in."""
    session.delete(printer)
    session.commit()
