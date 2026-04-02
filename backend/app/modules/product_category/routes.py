import uuid
from typing import Any

from fastapi import APIRouter, HTTPException

from app.api.deps import CurrentUser, SessionDep
from app.models import Message
from app.modules.product_category import crud as category_crud
from app.modules.product_category.models import (
    ProductCategoriesPublic,
    ProductCategoryCreate,
    ProductCategoryPublic,
    ProductCategoryUpdate,
)

router = APIRouter(prefix="/product-categories", tags=["product-categories"])


@router.get("/", response_model=ProductCategoriesPublic)
def read_categories(
    session: SessionDep,
    _: CurrentUser,
    skip: int = 0,
    limit: int = 100,
    include_archived: bool = False,
) -> Any:
    """Lấy danh sách danh mục sản phẩm."""
    categories, count = category_crud.get_categories(
        session, skip=skip, limit=limit, include_archived=include_archived
    )
    return ProductCategoriesPublic(data=categories, count=count)


@router.get("/{id}", response_model=ProductCategoryPublic)
def read_category(
    session: SessionDep,
    _: CurrentUser,
    id: uuid.UUID,
) -> Any:
    """Lấy danh mục theo ID."""
    category = category_crud.get_category(session, id)
    if not category:
        raise HTTPException(status_code=404, detail="Product category not found")
    return category


@router.post("/", response_model=ProductCategoryPublic)
def create_category(
    *,
    session: SessionDep,
    _: CurrentUser,
    category_in: ProductCategoryCreate,
) -> Any:
    """Tạo danh mục sản phẩm mới."""
    if category_crud.get_category_by_name(session, category_in.name):
        raise HTTPException(
            status_code=409,
            detail=f"Category with name '{category_in.name}' already exists",
        )
    return category_crud.create_category(session, category_in)


@router.put("/{id}", response_model=ProductCategoryPublic)
def update_category(
    *,
    session: SessionDep,
    _: CurrentUser,
    id: uuid.UUID,
    category_in: ProductCategoryUpdate,
) -> Any:
    """Cập nhật danh mục sản phẩm (dùng để lưu trữ/bỏ lưu trữ)."""
    category = category_crud.get_category(session, id)
    if not category:
        raise HTTPException(status_code=404, detail="Product category not found")
    if category_in.name is not None and category_in.name != category.name:
        if category_crud.get_category_by_name(session, category_in.name):
            raise HTTPException(
                status_code=409,
                detail=f"Category with name '{category_in.name}' already exists",
            )
    return category_crud.update_category(session, category, category_in)


@router.delete("/{id}")
def delete_category(
    session: SessionDep,
    _: CurrentUser,
    id: uuid.UUID,
) -> Message:
    """Xoá vật lý danh mục sản phẩm."""
    category = category_crud.get_category(session, id)
    if not category:
        raise HTTPException(status_code=404, detail="Product category not found")
    category_crud.delete_category(session, category)
    return Message(message="Product category deleted successfully")
