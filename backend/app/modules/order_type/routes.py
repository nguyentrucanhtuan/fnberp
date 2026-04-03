import uuid
from typing import Any
from fastapi import APIRouter, HTTPException
from app.api.deps import CurrentUser, SessionDep
from app.models import Message
from app.modules.order_type import crud as order_type_crud
from app.modules.order_type.models import (
    OrderTypeCreate, OrderTypePublic, OrderTypesPublic, OrderTypeUpdate,
)

router = APIRouter(prefix="/order_types", tags=["order_types"])


@router.get("", response_model=OrderTypesPublic)
def read_order_types(
    session: SessionDep,
    _: CurrentUser,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """Lấy danh sách loại đơn hàng."""
    order_types, count = order_type_crud.get_order_types(
        session, skip=skip, limit=limit
    )
    return OrderTypesPublic(data=order_types, count=count)


@router.get("/{id}", response_model=OrderTypePublic)
def read_order_type(
    session: SessionDep, _: CurrentUser, id: uuid.UUID
) -> Any:
    """Lấy thông tin chi tiết của một loại đơn hàng theo ID."""
    order_type = order_type_crud.get_order_type(session, id)
    if not order_type:
        raise HTTPException(status_code=404, detail="Order type not found")
    return order_type


@router.post("", response_model=OrderTypePublic)
def create_order_type(
    *, session: SessionDep, _: CurrentUser, order_type_in: OrderTypeCreate
) -> Any:
    """Tạo loại đơn hàng mới."""
    # Kiểm tra trùng tên
    if order_type_crud.get_order_type_by_name(session, order_type_in.name):
        raise HTTPException(status_code=400, detail="Order type name already exists")
    return order_type_crud.create_order_type(session, order_type_in)


@router.put("/{id}", response_model=OrderTypePublic)
def update_order_type(
    *,
    session: SessionDep,
    _: CurrentUser,
    id: uuid.UUID,
    order_type_in: OrderTypeUpdate,
) -> Any:
    """Cập nhật thông tin của một loại đơn hàng."""
    order_type = order_type_crud.get_order_type(session, id)
    if not order_type:
        raise HTTPException(status_code=404, detail="Order type not found")
    return order_type_crud.update_order_type(session, order_type, order_type_in)


@router.delete("/{id}")
def delete_order_type(
    session: SessionDep, _: CurrentUser, id: uuid.UUID
) -> Message:
    """Xoá một loại đơn hàng."""
    order_type = order_type_crud.get_order_type(session, id)
    if not order_type:
        raise HTTPException(status_code=404, detail="Order type not found")
    order_type_crud.delete_order_type(session, order_type)
    return Message(message="Order type deleted successfully")
