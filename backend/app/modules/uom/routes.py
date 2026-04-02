import uuid
from typing import Any

from fastapi import APIRouter, HTTPException

from app.api.deps import CurrentUser, SessionDep
from app.models import Message
from app.modules.uom import crud as uom_crud
from app.modules.uom.models import (
    UomBase,
    UomCreate,
    UomPublic,
    UomsPublic,
    UomUpdate,
)

router = APIRouter(prefix="/uoms", tags=["uoms"])


@router.get("/", response_model=UomsPublic)
def read_uoms(
    session: SessionDep,
    _: CurrentUser,
    skip: int = 0,
    limit: int = 100,
    include_archived: bool = False,
) -> Any:
    """Lấy danh sách đơn vị tính."""
    uoms, count = uom_crud.get_uoms(
        session, skip=skip, limit=limit, include_archived=include_archived
    )
    # Populate base_uom relationship for the public schema
    data = []
    for u in uoms:
        u_public = UomPublic.model_validate(u)
        if u.base_uom:
            u_public.base_uom = UomBase.model_validate(u.base_uom)
        data.append(u_public)
    return UomsPublic(data=data, count=count)


@router.get("/{id}", response_model=UomPublic)
def read_uom(
    session: SessionDep,
    _: CurrentUser,
    id: uuid.UUID,
) -> Any:
    """Lấy đơn vị tính theo ID."""
    uom = uom_crud.get_uom(session, id)
    if not uom:
        raise HTTPException(status_code=404, detail="Uom not found")
    u_public = UomPublic.model_validate(uom)
    if uom.base_uom:
        u_public.base_uom = UomBase.model_validate(uom.base_uom)
    return u_public


@router.post("/", response_model=UomPublic)
def create_uom(
    *,
    session: SessionDep,
    _: CurrentUser,
    uom_in: UomCreate,
) -> Any:
    """Tạo đơn vị tính mới."""
    if uom_crud.get_uom_by_code(session, uom_in.code):
        raise HTTPException(
            status_code=409,
            detail=f"Uom with code '{uom_in.code}' already exists",
        )
    if uom_in.relative_uom_id is not None:
        if not uom_crud.get_uom(session, uom_in.relative_uom_id):
            raise HTTPException(
                status_code=404,
                detail="Referenced relative_uom_id not found",
            )
    return uom_crud.create_uom(session, uom_in)


@router.put("/{id}", response_model=UomPublic)
def update_uom(
    *,
    session: SessionDep,
    _: CurrentUser,
    id: uuid.UUID,
    uom_in: UomUpdate,
) -> Any:
    """Cập nhật đơn vị tính."""
    uom = uom_crud.get_uom(session, id)
    if not uom:
        raise HTTPException(status_code=404, detail="Uom not found")
    if uom_in.code is not None and uom_in.code != uom.code:
        if uom_crud.get_uom_by_code(session, uom_in.code):
            raise HTTPException(
                status_code=409,
                detail=f"Uom with code '{uom_in.code}' already exists",
            )
    if uom_in.relative_uom_id is not None:
        if uom_in.relative_uom_id == id:
            raise HTTPException(
                status_code=422,
                detail="Uom cannot reference itself as relative_uom",
            )
        if not uom_crud.get_uom(session, uom_in.relative_uom_id):
            raise HTTPException(
                status_code=404,
                detail="Referenced relative_uom_id not found",
            )
    return uom_crud.update_uom(session, uom, uom_in)


@router.delete("/{id}")
def delete_uom(
    session: SessionDep,
    _: CurrentUser,
    id: uuid.UUID,
) -> Message:
    """Xoá đơn vị tính."""
    uom = uom_crud.get_uom(session, id)
    if not uom:
        raise HTTPException(status_code=404, detail="Uom not found")
    uom_crud.delete_uom(session, uom)
    return Message(message="Uom deleted successfully")
