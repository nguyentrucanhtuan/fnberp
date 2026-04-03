import uuid
from typing import Any

from fastapi import APIRouter, HTTPException

from app.api.deps import CurrentUser, SessionDep
from app.models import Message
from app.modules.warehouse import crud as warehouse_crud
from app.modules.warehouse.models import (
    WarehouseCreate,
    WarehousePublic,
    WarehousesPublic,
    WarehouseUpdate,
)

router = APIRouter(prefix="/warehouses", tags=["warehouses"])


@router.get("/", response_model=WarehousesPublic)
def read_warehouses(
    session: SessionDep,
    _: CurrentUser,
    skip: int = 0,
    limit: int = 100,
    include_archived: bool = False,
) -> Any:
    """Lấy danh sách kho."""
    warehouses, count = warehouse_crud.get_warehouses(
        session, skip=skip, limit=limit, include_archived=include_archived
    )
    return WarehousesPublic(data=warehouses, count=count)


@router.get("/{id}", response_model=WarehousePublic)
def read_warehouse(
    session: SessionDep,
    _: CurrentUser,
    id: uuid.UUID,
) -> Any:
    """Lấy kho theo ID."""
    warehouse = warehouse_crud.get_warehouse(session, id)
    if not warehouse:
        raise HTTPException(status_code=404, detail="Warehouse not found")
    return warehouse


@router.post("/", response_model=WarehousePublic)
def create_warehouse(
    *,
    session: SessionDep,
    _: CurrentUser,
    warehouse_in: WarehouseCreate,
) -> Any:
    """Tạo kho mới."""
    if warehouse_crud.get_warehouse_by_code(session, warehouse_in.code):
        raise HTTPException(
            status_code=409,
            detail=f"Warehouse with code '{warehouse_in.code}' already exists",
        )
    return warehouse_crud.create_warehouse(session, warehouse_in)


@router.put("/{id}", response_model=WarehousePublic)
def update_warehouse(
    *,
    session: SessionDep,
    _: CurrentUser,
    id: uuid.UUID,
    warehouse_in: WarehouseUpdate,
) -> Any:
    """Cập nhật thông tin kho."""
    warehouse = warehouse_crud.get_warehouse(session, id)
    if not warehouse:
        raise HTTPException(status_code=404, detail="Warehouse not found")
    if warehouse_in.code is not None and warehouse_in.code != warehouse.code:
        if warehouse_crud.get_warehouse_by_code(session, warehouse_in.code):
            raise HTTPException(
                status_code=409,
                detail=f"Warehouse with code '{warehouse_in.code}' already exists",
            )
    return warehouse_crud.update_warehouse(session, warehouse, warehouse_in)


@router.delete("/{id}")
def delete_warehouse(
    session: SessionDep,
    _: CurrentUser,
    id: uuid.UUID,
) -> Message:
    """Xoá kho."""
    warehouse = warehouse_crud.get_warehouse(session, id)
    if not warehouse:
        raise HTTPException(status_code=404, detail="Warehouse not found")
    warehouse_crud.delete_warehouse(session, warehouse)
    return Message(message="Warehouse deleted successfully")
