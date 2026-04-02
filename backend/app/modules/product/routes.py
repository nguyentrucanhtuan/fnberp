import uuid
from typing import Any

from fastapi import APIRouter, HTTPException

from app.api.deps import CurrentUser, SessionDep
from app.models import Message
from app.modules.product import crud as product_crud
from app.modules.product_category import crud as category_crud
from app.modules.uom import crud as uom_crud
from app.modules.product.models import (
    ProductCreate,
    ProductPublic,
    ProductsPublic,
    ProductUpdate,
)

router = APIRouter(prefix="/products", tags=["products"])


@router.get("/", response_model=ProductsPublic)
def read_products(
    session: SessionDep,
    _: CurrentUser,
    skip: int = 0,
    limit: int = 100,
    include_archived: bool = False,
) -> Any:
    """Lấy danh sách sản phẩm."""
    products, count = product_crud.get_products(
        session, skip=skip, limit=limit, include_archived=include_archived
    )
    return ProductsPublic(
        data=[ProductPublic.model_validate(p) for p in products],
        count=count
    )


@router.get("/{id}", response_model=ProductPublic)
def read_product(
    session: SessionDep,
    _: CurrentUser,
    id: uuid.UUID,
) -> Any:
    """Lấy sản phẩm theo ID."""
    product = product_crud.get_product(session, id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.post("/", response_model=ProductPublic)
def create_product(
    *,
    session: SessionDep,
    _: CurrentUser,
    product_in: ProductCreate,
) -> Any:
    """Tạo sản phẩm mới (kèm danh mục nếu có)."""
    # Validate: kiểm tra tên trùng
    if product_crud.get_product_by_name(session, product_in.name):
        raise HTTPException(
            status_code=409,
            detail=f"Product with name '{product_in.name}' already exists",
        )
    # Validate: kiểm tra tất cả category_ids tồn tại
    _validate_category_ids(session, product_in.category_ids)
    
    # Validate: kiểm tra uom_id chính và danh sách uom_ids phụ tồn tại
    if product_in.uom_id:
        _validate_uom_ids(session, [product_in.uom_id])
    if product_in.uom_ids:
        _validate_uom_ids(session, product_in.uom_ids)

    return product_crud.create_product(session, product_in)


@router.put("/{id}", response_model=ProductPublic)
def update_product(
    *,
    session: SessionDep,
    _: CurrentUser,
    id: uuid.UUID,
    product_in: ProductUpdate,
) -> Any:
    """Cập nhật sản phẩm (dùng để lưu trữ/bỏ lưu trữ, đổi danh mục...)."""
    product = product_crud.get_product(session, id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    # Validate: kiểm tra tên trùng (nếu đổi tên)
    if product_in.name is not None and product_in.name != product.name:
        if product_crud.get_product_by_name(session, product_in.name):
            raise HTTPException(
                status_code=409,
                detail=f"Product with name '{product_in.name}' already exists",
            )
    # Validate: kiểm tra category_ids tồn tại (nếu gửi)
    if product_in.category_ids is not None:
        _validate_category_ids(session, product_in.category_ids)

    # Validate: kiểm tra uom_id & uom_ids (nếu gửi)
    if product_in.uom_id is not None:
        _validate_uom_ids(session, [product_in.uom_id])
    if product_in.uom_ids is not None:
        _validate_uom_ids(session, product_in.uom_ids)

    return product_crud.update_product(session, product, product_in)


@router.delete("/{id}")
def delete_product(
    session: SessionDep,
    _: CurrentUser,
    id: uuid.UUID,
) -> Message:
    """Xoá vật lý sản phẩm."""
    product = product_crud.get_product(session, id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    product_crud.delete_product(session, product)
    return Message(message="Product deleted successfully")


# ── PRIVATE HELPERS ──

def _validate_category_ids(session: SessionDep, category_ids: list[uuid.UUID]) -> None:
    """Kiểm tra tất cả category_ids đều tồn tại trong DB."""
    for cat_id in category_ids:
        if not category_crud.get_category(session, cat_id):
            raise HTTPException(
                status_code=404,
                detail=f"Category with id '{cat_id}' not found",
            )


def _validate_uom_ids(session: SessionDep, uom_ids: list[uuid.UUID]) -> None:
    """Kiểm tra tất cả uom_ids đều tồn tại trong DB."""
    for uom_id in uom_ids:
        if not uom_crud.get_uom(session, uom_id):
            raise HTTPException(
                status_code=404,
                detail=f"UOM with id '{uom_id}' not found",
            )
