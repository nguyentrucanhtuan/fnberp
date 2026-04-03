import uuid
from typing import Any

from fastapi import APIRouter, HTTPException

from app.api.deps import CurrentUser, SessionDep
from app.models import Message
from app.modules.pos import crud as pos_crud
from app.modules.pos.models import PosCreate, PosPublic, PossPublic, PosUpdate

router = APIRouter(prefix="/pos", tags=["pos"])


@router.get("/", response_model=PossPublic)
def read_poss(
    session: SessionDep,
    _: CurrentUser,
    skip: int = 0,
    limit: int = 100,
    include_archived: bool = False,
) -> Any:
    """Lấy danh sách quầy bán hàng."""
    items, count = pos_crud.get_poss(
        session, skip=skip, limit=limit, include_archived=include_archived
    )
    return PossPublic(data=items, count=count)


@router.get("/{id}", response_model=PosPublic)
def read_pos(
    session: SessionDep,
    _: CurrentUser,
    id: uuid.UUID,
) -> Any:
    """Lấy quầy bán hàng theo ID."""
    pos = pos_crud.get_pos(session, id)
    if not pos:
        raise HTTPException(status_code=404, detail="POS location not found")
    return pos


@router.post("/", response_model=PosPublic)
def create_pos(
    *,
    session: SessionDep,
    _: CurrentUser,
    pos_in: PosCreate,
) -> Any:
    """Tạo quầy bán hàng mới."""
    return pos_crud.create_pos(session, pos_in)


@router.put("/{id}", response_model=PosPublic)
def update_pos(
    *,
    session: SessionDep,
    _: CurrentUser,
    id: uuid.UUID,
    pos_in: PosUpdate,
) -> Any:
    """Cập nhật quầy bán hàng."""
    pos = pos_crud.get_pos(session, id)
    if not pos:
        raise HTTPException(status_code=404, detail="POS location not found")
    return pos_crud.update_pos(session, pos, pos_in)


@router.delete("/{id}")
def delete_pos(
    session: SessionDep,
    _: CurrentUser,
    id: uuid.UUID,
) -> Message:
    """Xoá quầy bán hàng."""
    pos = pos_crud.get_pos(session, id)
    if not pos:
        raise HTTPException(status_code=404, detail="POS location not found")
    pos_crud.delete_pos(session, pos)
    return Message(message="POS location deleted successfully")
