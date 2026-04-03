import uuid
from typing import Any

from fastapi import APIRouter, HTTPException

from app.api.deps import CurrentUser, SessionDep
from app.models import Message
from app.modules.payment_method import crud as pm_crud
from app.modules.payment_method.models import (
    PaymentMethodCreate,
    PaymentMethodPublic,
    PaymentMethodsPublic,
    PaymentMethodUpdate,
)

router = APIRouter(prefix="/payment-methods", tags=["payment-methods"])


@router.get("/", response_model=PaymentMethodsPublic)
def read_payment_methods(
    session: SessionDep,
    _: CurrentUser,
    skip: int = 0,
    limit: int = 100,
    include_archived: bool = False,
) -> Any:
    """Lấy danh sách phương thức thanh toán."""
    items, count = pm_crud.get_payment_methods(
        session, skip=skip, limit=limit, include_archived=include_archived
    )
    return PaymentMethodsPublic(data=items, count=count)


@router.get("/{id}", response_model=PaymentMethodPublic)
def read_payment_method(
    session: SessionDep,
    _: CurrentUser,
    id: uuid.UUID,
) -> Any:
    """Lấy phương thức thanh toán theo ID."""
    pm = pm_crud.get_payment_method(session, id)
    if not pm:
        raise HTTPException(status_code=404, detail="Payment method not found")
    return pm


@router.post("/", response_model=PaymentMethodPublic)
def create_payment_method(
    *,
    session: SessionDep,
    _: CurrentUser,
    pm_in: PaymentMethodCreate,
) -> Any:
    """Tạo phương thức thanh toán mới."""
    if pm_crud.get_payment_method_by_code(session, pm_in.code):
        raise HTTPException(
            status_code=409, detail="Payment method code already exists"
        )
    return pm_crud.create_payment_method(session, pm_in)


@router.put("/{id}", response_model=PaymentMethodPublic)
def update_payment_method(
    *,
    session: SessionDep,
    _: CurrentUser,
    id: uuid.UUID,
    pm_in: PaymentMethodUpdate,
) -> Any:
    """Cập nhật phương thức thanh toán."""
    pm = pm_crud.get_payment_method(session, id)
    if not pm:
        raise HTTPException(status_code=404, detail="Payment method not found")
    # Kiểm tra trùng code nếu đổi code
    if pm_in.code and pm_in.code != pm.code:
        if pm_crud.get_payment_method_by_code(session, pm_in.code):
            raise HTTPException(
                status_code=409, detail="Payment method code already exists"
            )
    return pm_crud.update_payment_method(session, pm, pm_in)


@router.delete("/{id}")
def delete_payment_method(
    session: SessionDep,
    _: CurrentUser,
    id: uuid.UUID,
) -> Message:
    """Xoá phương thức thanh toán."""
    pm = pm_crud.get_payment_method(session, id)
    if not pm:
        raise HTTPException(status_code=404, detail="Payment method not found")
    pm_crud.delete_payment_method(session, pm)
    return Message(message="Payment method deleted successfully")
