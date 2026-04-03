import uuid
from typing import Any

from fastapi import APIRouter, HTTPException

from app.api.deps import CurrentUser, SessionDep
from app.models import Message
from app.modules.printer import crud as printer_crud
from app.modules.printer.models import (
    PrinterCreate,
    PrinterPublic,
    PrintersPublic,
    PrinterUpdate,
)

router = APIRouter(prefix="/printers", tags=["printers"])


@router.get("/", response_model=PrintersPublic)
def read_printers(
    session: SessionDep,
    _: CurrentUser,
    skip: int = 0,
    limit: int = 100,
    include_archived: bool = False,
) -> Any:
    """Lấy danh sách máy in."""
    items, count = printer_crud.get_printers(
        session, skip=skip, limit=limit, include_archived=include_archived
    )
    return PrintersPublic(data=items, count=count)


@router.get("/{id}", response_model=PrinterPublic)
def read_printer(
    session: SessionDep,
    _: CurrentUser,
    id: uuid.UUID,
) -> Any:
    """Lấy máy in theo ID."""
    printer = printer_crud.get_printer(session, id)
    if not printer:
        raise HTTPException(status_code=404, detail="Printer not found")
    return printer


@router.post("/", response_model=PrinterPublic)
def create_printer(
    *,
    session: SessionDep,
    _: CurrentUser,
    printer_in: PrinterCreate,
) -> Any:
    """Tạo máy in mới."""
    return printer_crud.create_printer(session, printer_in)


@router.put("/{id}", response_model=PrinterPublic)
def update_printer(
    *,
    session: SessionDep,
    _: CurrentUser,
    id: uuid.UUID,
    printer_in: PrinterUpdate,
) -> Any:
    """Cập nhật máy in."""
    printer = printer_crud.get_printer(session, id)
    if not printer:
        raise HTTPException(status_code=404, detail="Printer not found")
    return printer_crud.update_printer(session, printer, printer_in)


@router.delete("/{id}")
def delete_printer(
    session: SessionDep,
    _: CurrentUser,
    id: uuid.UUID,
) -> Message:
    """Xoá máy in."""
    printer = printer_crud.get_printer(session, id)
    if not printer:
        raise HTTPException(status_code=404, detail="Printer not found")
    printer_crud.delete_printer(session, printer)
    return Message(message="Printer deleted successfully")
