import uuid
from typing import Any, List, Tuple

from fastapi import APIRouter, HTTPException

from app.api.deps import CurrentUser, SessionDep
from app.models import Message
from app.modules.kitchen_screen import crud as kitchen_screen_crud
from app.modules.kitchen_screen.models import (
    KitchenScreenCreate,
    KitchenScreenPublic,
    KitchenScreensPublic,
    KitchenScreenUpdate,
)
from app.modules.pos import crud as pos_crud

router = APIRouter(prefix="/kitchen_screens", tags=["kitchen_screens"])


@router.get("", response_model=KitchenScreensPublic)
def read_screens(
    session: SessionDep,
    _: CurrentUser,
    skip: int = 0,
    limit: int = 100,
) -> KitchenScreensPublic:
    """Lấy danh sách màn hình nhà bếp."""
    screens, count = kitchen_screen_crud.get_screens(session, skip=skip, limit=limit)
    return KitchenScreensPublic(
        data=[KitchenScreenPublic.model_validate(s) for s in screens],
        count=count
    )


@router.get("/{id}", response_model=KitchenScreenPublic)
def read_screen(
    session: SessionDep, _: CurrentUser, id: uuid.UUID
) -> KitchenScreenPublic:
    """Lấy thông tin chi tiết một màn hình nhà bếp."""
    screen = kitchen_screen_crud.get_screen(session, id)
    if not screen:
        raise HTTPException(status_code=404, detail="Kitchen screen not found")
    return KitchenScreenPublic.model_validate(screen)


@router.post("", response_model=KitchenScreenPublic)
def create_screen(
    *, session: SessionDep, _: CurrentUser, screen_in: KitchenScreenCreate
) -> KitchenScreenPublic:
    """Tạo màn hình nhà bếp mới."""
    if not pos_crud.get_pos(session, screen_in.pos_id):
        raise HTTPException(status_code=404, detail="POS location not found")
    
    screen = kitchen_screen_crud.create_screen(session, screen_in)
    return KitchenScreenPublic.model_validate(screen)


@router.put("/{id}", response_model=KitchenScreenPublic)
def update_screen(
    *,
    session: SessionDep,
    _: CurrentUser,
    id: uuid.UUID,
    screen_in: KitchenScreenUpdate,
) -> KitchenScreenPublic:
    """Cập nhật thông tin màn hình nhà bếp."""
    screen = kitchen_screen_crud.get_screen(session, id)
    if not screen:
        raise HTTPException(status_code=404, detail="Kitchen screen not found")
    
    if screen_in.pos_id and not pos_crud.get_pos(session, screen_in.pos_id):
        raise HTTPException(status_code=404, detail="POS location not found")

    updated_screen = kitchen_screen_crud.update_screen(session, screen, screen_in)
    return KitchenScreenPublic.model_validate(updated_screen)


@router.delete("/{id}")
def delete_screen(
    session: SessionDep, _: CurrentUser, id: uuid.UUID
) -> Message:
    """Xoá màn hình nhà bếp."""
    screen = kitchen_screen_crud.get_screen(session, id)
    if not screen:
        raise HTTPException(status_code=404, detail="Kitchen screen not found")
    
    kitchen_screen_crud.delete_screen(session, screen)
    return Message(message="Kitchen screen deleted successfully")
