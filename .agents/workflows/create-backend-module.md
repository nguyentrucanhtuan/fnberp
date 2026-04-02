---
description: Quy trình tạo một module backend CRUD hoàn chỉnh (truy vết từ module Item)
---

# Workflow: Tạo Module Backend CRUD Mới

Quy trình này được truy vết từ module `Item` trong Full Stack FastAPI Template.
Source gốc (Item, User, login...) **giữ nguyên vị trí**, module mới tạo theo cấu trúc `modules/`.

---

## Cấu trúc thư mục

Mỗi module mới là **1 thư mục tự chứa** trong `backend/app/modules/`:

```
backend/app/
├── models.py                ← Source gốc: User, Message, Token... (KHÔNG SỬA)
├── api/
│   ├── main.py              ← Đăng ký router module mới ở đây
│   ├── deps.py              ← SessionDep, CurrentUser (KHÔNG SỬA)
│   └── routes/              ← Source gốc: items, login, users (KHÔNG SỬA)
├── alembic/
│   └── env.py               ← Thêm import model module mới ở đây
├── modules/                 ← THƯ MỤC CHỨA TẤT CẢ MODULE MỚI
│   ├── __init__.py          ← File rỗng
│   └── product/             ← ★ Ví dụ: module product ★
│       ├── __init__.py      ← File rỗng
│       ├── models.py        ← Models + Schemas
│       ├── routes.py        ← 5 API endpoints
│       ├── crud.py          ← CRUD helpers
│       └── tests/
│           ├── __init__.py  ← File rỗng
│           ├── test_routes.py
│           └── utils.py
```

> **Nguyên tắc:** Tạo module mới = tạo 1 thư mục + đăng ký 2 dòng import. Không sửa gì source gốc.

---

## Bước 1: Tạo thư mục module

```bash
# Thay "product" bằng tên module thực tế
mkdir -p backend/app/modules/product/tests
touch backend/app/modules/__init__.py
touch backend/app/modules/product/__init__.py
touch backend/app/modules/product/tests/__init__.py
```

---

## Bước 2: Tạo Models & Schemas

**File:** `backend/app/modules/product/models.py`

Mỗi module cần tối thiểu **5 class** (truy vết từ Item trong `app/models.py`):

```python
import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime
from sqlmodel import Field, Relationship, SQLModel


def get_datetime_utc() -> datetime:
    return datetime.now(timezone.utc)


# ── 1. Base Schema (shared fields) ──
class ProductBase(SQLModel):
    name: str = Field(min_length=1, max_length=255)
    description: str | None = Field(default=None, max_length=255)
    price: float = Field(default=0, ge=0)


# ── 2. Create Schema (nhận từ API khi tạo) ──
class ProductCreate(ProductBase):
    pass


# ── 3. Update Schema (TẤT CẢ field optional) ──
class ProductUpdate(ProductBase):
    name: str | None = Field(default=None, min_length=1, max_length=255)  # type: ignore
    price: float | None = Field(default=None, ge=0)  # type: ignore


# ── 4. Database Model (table=True) ──
class Product(ProductBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    created_at: datetime | None = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  # type: ignore
    )
    # FK đến User — copy pattern từ Item
    owner_id: uuid.UUID = Field(
        foreign_key="user.id", nullable=False, ondelete="CASCADE"
    )
    # Relationship: KHÔNG cần thêm reverse vào User nếu không dùng navigation
    # Nếu cần, thêm: owner: User | None = Relationship(back_populates="products")


# ── 5. Public Schema (trả về qua API) ──
class ProductPublic(ProductBase):
    model_config = ConfigDict(from_attributes=True)  # Cho phép lồng object từ ORM
    id: uuid.UUID
    owner_id: uuid.UUID
    created_at: datetime | None = None
    # Lồng object liên quan (ví dụ: thông tin owner)
    # owner: UserPublic | None = None 


# ── 6. List Schema (phân trang) ──
class ProductsPublic(SQLModel):
    data: list[ProductPublic]
    count: int


# ── 7. Advanced: Self-referencing Relationship (Vídụ UOM) ──
# Nếu một bản ghi trỏ tới bản ghi khác cùng bảng (cha-con):
# class Category(SQLModel, table=True):
#     id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
#     parent_id: uuid.UUID | None = Field(default=None, foreign_key="category.id")
#     parent: Optional["Category"] = Relationship(
#         sa_relationship=relationship("Category", remote_side="Category.id")
#     )
```

### Quy tắc:
- `Base` → chứa field chung + validation
- `Create` → kế thừa Base, thêm field bắt buộc khi tạo
- `Update` → override TẤT CẢ required fields thành `Optional` + `# type: ignore`
- DB Model → **phải** có `id` (uuid), nên có `created_at`
- `Public` → phải include `id`, và thêm các field `Relationship` nếu muốn trả về object lồng nhau.
- **Quan trọng:** `Public` schema cần `model_config = ConfigDict(from_attributes=True)` để Pydantic có thể đọc dữ liệu từ SQLModel relationship.
- Import `Message` từ `app.models` khi cần (shared schema)

---

## Bước 3: Tạo CRUD Helpers

**File:** `backend/app/modules/product/crud.py`

File này **tách toàn bộ logic truy vấn DB** ra khỏi routes. Routes chỉ gọi hàm CRUD, không viết query trực tiếp.

> **Tại sao cần `crud.py`?**
> - **Tách trách nhiệm:** Routes xử lý HTTP (validation, response), CRUD xử lý DB.
> - **Tái sử dụng:** Module khác cần truy vấn Product → import `from app.modules.product import crud as product_crud`.
> - **Dễ test:** Mock được tầng CRUD khi unit test routes.

```python
"""CRUD helpers cho module Product."""

import uuid
from typing import Any

from sqlalchemy.orm import selectinload  # dùng khi cần eager-load relationship
from sqlmodel import Session, col, func, select

from app.modules.product.models import Product, ProductCreate, ProductUpdate


# ── READ ──

def get_product(session: Session, product_id: uuid.UUID) -> Product | None:
    """Lấy product theo ID."""
    return session.exec(
        select(Product).where(Product.id == product_id)
        # Nếu có relationship, thêm: .options(selectinload(cast(Any, Product.owner)))
    ).first()


def get_product_by_name(session: Session, name: str) -> Product | None:
    """Lấy product theo name (nếu unique). Bỏ hàm này nếu name không unique."""
    return session.exec(select(Product).where(Product.name == name)).first()


def get_products(
    session: Session,
    *,
    skip: int = 0,
    limit: int = 100,
    owner_id: uuid.UUID | None = None,
) -> tuple[list[Product], int]:
    """Lấy danh sách Product có phân trang. Trả về (items, total_count)."""
    statement = select(Product)
    if owner_id is not None:
        statement = statement.where(Product.owner_id == owner_id)
    count = session.exec(
        select(func.count()).select_from(statement.subquery())
    ).one()
    products = session.exec(
        statement
        .order_by(col(Product.created_at).desc())
        .offset(skip)
        .limit(limit)
    ).all()
    return list(products), count


# ── CREATE ──

def create_product(
    session: Session, product_in: ProductCreate, owner_id: uuid.UUID
) -> Product:
    """Tạo Product mới."""
    product = Product.model_validate(product_in, update={"owner_id": owner_id})
    session.add(product)
    session.commit()
    session.refresh(product)
    return product


# ── UPDATE ──

def update_product(
    session: Session, product: Product, product_in: ProductUpdate
) -> Product:
    """Cập nhật Product (partial update)."""
    update_dict = product_in.model_dump(exclude_unset=True)
    product.sqlmodel_update(update_dict)
    session.add(product)
    session.commit()
    session.refresh(product)
    return product


# ── DELETE ──

def delete_product(session: Session, product: Product) -> None:
    """Xoá Product."""
    session.delete(product)
    session.commit()
```

### Pattern chung cho mọi `crud.py`:

| Hàm | Signature | Mô tả |
|-----|-----------|--------|
| `get_{tên}` | `(session, id) → Model \| None` | Lấy theo ID, kèm `selectinload` nếu cần |
| `get_{tên}_by_{field}` | `(session, value) → Model \| None` | Lấy theo unique field (tuỳ chọn) |
| `get_{tên}s` | `(session, *, skip, limit, **filters) → (list, count)` | Danh sách + tổng số, có filter |
| `create_{tên}` | `(session, schema_in, **extra) → Model` | Tạo mới |
| `update_{tên}` | `(session, db_obj, schema_in) → Model` | Partial update |
| `delete_{tên}` | `(session, db_obj) → None` | Xoá |

> **Lưu ý:** CRUD KHÔNG raise HTTPException. Đó là trách nhiệm của routes.
> CRUD chỉ trả về `None` khi không tìm thấy — routes tự quyết định trả 404 hay xử lý khác.

---

## Bước 4: Tạo API Routes (dùng CRUD)

**File:** `backend/app/modules/product/routes.py`

Routes **chỉ xử lý HTTP logic**: nhận request, validate, gọi CRUD, trả response.
**KHÔNG** viết query DB trực tiếp trong routes.

```python
import uuid
from typing import Any

from fastapi import APIRouter, HTTPException

from app.api.deps import CurrentUser, SessionDep
from app.models import Message  # ← import shared schema từ gốc
from app.modules.product import crud as product_crud  # ★ import CRUD module
from app.modules.product.models import (
    ProductCreate, ProductPublic, ProductsPublic, ProductUpdate,
)

router = APIRouter(prefix="/products", tags=["products"])


@router.get("/", response_model=ProductsPublic)
def read_products(
    session: SessionDep,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """Retrieve products."""
    # Superuser thấy tất cả, user thường chỉ thấy của mình
    owner_filter = None if current_user.is_superuser else current_user.id
    products, count = product_crud.get_products(
        session, skip=skip, limit=limit, owner_id=owner_filter
    )
    return ProductsPublic(data=products, count=count)


@router.get("/{id}", response_model=ProductPublic)
def read_product(
    session: SessionDep, current_user: CurrentUser, id: uuid.UUID
) -> Any:
    """Get product by ID."""
    product = product_crud.get_product(session, id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if not current_user.is_superuser and (product.owner_id != current_user.id):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return product


@router.post("/", response_model=ProductPublic)
def create_product(
    *, session: SessionDep, current_user: CurrentUser, product_in: ProductCreate
) -> Any:
    """Create new product."""
    # Validation: kiểm tra trùng name (nếu unique)
    # if product_crud.get_product_by_name(session, product_in.name):
    #     raise HTTPException(status_code=409, detail="Product name already exists")
    return product_crud.create_product(session, product_in, owner_id=current_user.id)


@router.put("/{id}", response_model=ProductPublic)
def update_product(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: uuid.UUID,
    product_in: ProductUpdate,
) -> Any:
    """Update a product."""
    product = product_crud.get_product(session, id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if not current_user.is_superuser and (product.owner_id != current_user.id):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return product_crud.update_product(session, product, product_in)


@router.delete("/{id}")
def delete_product(
    session: SessionDep, current_user: CurrentUser, id: uuid.UUID
) -> Message:
    """Delete a product."""
    product = product_crud.get_product(session, id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if not current_user.is_superuser and (product.owner_id != current_user.id):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    product_crud.delete_product(session, product)
    return Message(message="Product deleted successfully")
```

### Phân tách trách nhiệm Routes vs CRUD:

| Trách nhiệm | Routes (`routes.py`) | CRUD (`crud.py`) |
|---|---|---|
| Nhận HTTP request | ✅ | ❌ |
| Validate business logic (trùng, quyền) | ✅ | ❌ |
| Raise HTTPException | ✅ | ❌ |
| Viết SQL query | ❌ | ✅ |
| `session.add/commit/refresh` | ❌ | ✅ |
| Trả HTTP response | ✅ | ❌ |

### So sánh import path:

| Nguồn | Item (gốc) | Product (module mới) |
|-------|-----------|---------------------|
| Models | `from app.models import Item, ItemCreate...` | `from app.modules.product.models import Product, ProductCreate...` |
| CRUD | Inline trong routes | `from app.modules.product import crud as product_crud` |
| Shared | — | `from app.models import Message` |
| Deps | `from app.api.deps import CurrentUser, SessionDep` | Giống hệt |

### Cross-module: Import CRUD từ module khác

Khi module Product cần truy vấn UOM (ví dụ validate FK):

```python
# Trong app/modules/product/routes.py
from app.modules.uom import crud as uom_crud

@router.post("/", response_model=ProductPublic)
def create_product(*, session: SessionDep, current_user: CurrentUser, product_in: ProductCreate) -> Any:
    # Validate FK: kiểm tra uom_id có tồn tại không
    if product_in.uom_id and not uom_crud.get_uom(session, product_in.uom_id):
        raise HTTPException(status_code=404, detail="UOM not found")
    return product_crud.create_product(session, product_in, owner_id=current_user.id)
```

---

## Bước 5: Đăng ký Module (2 file cần sửa)

### 4a. Đăng ký router

**File:** `backend/app/api/main.py`

Thêm **2 dòng** (1 import + 1 include):

```python
from app.api.routes import items, login, private, users, utils
from app.modules.product import routes as product_routes   # ← THÊM

api_router = APIRouter()
api_router.include_router(login.router)
api_router.include_router(users.router)
api_router.include_router(utils.router)
api_router.include_router(items.router)
api_router.include_router(product_routes.router)            # ← THÊM
```

> **Pattern đặt tên import:** `from app.modules.{tên} import routes as {tên}_routes`

### 4b. Đăng ký model cho Alembic

**File:** `backend/app/alembic/env.py`

Thêm **1 dòng** import (để Alembic nhận diện table khi autogenerate):

```python
from app.models import SQLModel  # noqa
from app.modules.product import models as product_models  # noqa  ← THÊM
from app.core.config import settings  # noqa
```

> **Pattern:** `from app.modules.{tên} import models as {tên}_models  # noqa`

---

## Bước 6: Tạo Database Migration

```bash
# Chạy trong container
docker compose exec backend alembic revision --autogenerate -m "add product table"
docker compose exec backend alembic upgrade head

# Hoặc local (trong thư mục backend/)
alembic revision --autogenerate -m "add product table"
alembic upgrade head
```

> Migration tự chạy khi restart container (qua `prestart.sh` → `alembic upgrade head`).

---

## Bước 7: Viết Tests

### 6a. Test Helper

**File:** `backend/app/modules/product/tests/utils.py`

```python
from sqlmodel import Session

from app.modules.product.models import Product, ProductCreate
from tests.utils.user import create_random_user
from tests.utils.utils import random_lower_string


def create_random_product(db: Session) -> Product:
    user = create_random_user(db)
    owner_id = user.id
    assert owner_id is not None
    name = random_lower_string()
    description = random_lower_string()
    product_in = ProductCreate(name=name, description=description, price=99.99)
    product = Product.model_validate(product_in, update={"owner_id": owner_id})
    db.add(product)
    db.commit()
    db.refresh(product)
    return product
```

### 6b. API Tests

**File:** `backend/app/modules/product/tests/test_routes.py`

```python
import uuid

from fastapi.testclient import TestClient
from sqlmodel import Session

from app.core.config import settings
from app.modules.product.tests.utils import create_random_product


def test_create_product(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    data = {"name": "Test Product", "description": "Desc", "price": 10.5}
    response = client.post(
        f"{settings.API_V1_STR}/products/",
        headers=superuser_token_headers,
        json=data,
    )
    assert response.status_code == 200
    content = response.json()
    assert content["name"] == data["name"]
    assert "id" in content


def test_read_products(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    create_random_product(db)
    create_random_product(db)
    response = client.get(
        f"{settings.API_V1_STR}/products/",
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
    assert len(response.json()["data"]) >= 2


def test_read_product(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    product = create_random_product(db)
    response = client.get(
        f"{settings.API_V1_STR}/products/{product.id}",
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
    assert response.json()["id"] == str(product.id)


def test_read_product_not_found(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    response = client.get(
        f"{settings.API_V1_STR}/products/{uuid.uuid4()}",
        headers=superuser_token_headers,
    )
    assert response.status_code == 404


def test_update_product(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    product = create_random_product(db)
    response = client.put(
        f"{settings.API_V1_STR}/products/{product.id}",
        headers=superuser_token_headers,
        json={"name": "Updated"},
    )
    assert response.status_code == 200
    assert response.json()["name"] == "Updated"


def test_delete_product(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    product = create_random_product(db)
    response = client.delete(
        f"{settings.API_V1_STR}/products/{product.id}",
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
    assert response.json()["message"] == "Product deleted successfully"


def test_delete_product_not_found(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    response = client.delete(
        f"{settings.API_V1_STR}/products/{uuid.uuid4()}",
        headers=superuser_token_headers,
    )
    assert response.status_code == 404
```

---

## Tóm tắt: Tạo module mới cần làm gì?

### Trong thư mục module (tạo mới):

| File | Nội dung |
|------|----------|
| `modules/{tên}/__init__.py` | Rỗng |
| `modules/{tên}/models.py` | 6 class: Base, Create, Update, DB Model, Public, ListPublic |
| `modules/{tên}/crud.py` | 6 hàm: get, get_by_field, get_list, create, update, delete |
| `modules/{tên}/routes.py` | 5 endpoints gọi CRUD, xử lý validation + HTTP response |
| `modules/{tên}/tests/__init__.py` | Rỗng |
| `modules/{tên}/tests/utils.py` | `create_random_{tên}()` |
| `modules/{tên}/tests/test_routes.py` | Tests cho 5 endpoints |

### Ngoài thư mục module (đăng ký — sửa 2 file):

| File | Thêm gì |
|------|---------|
| `api/main.py` | `from app.modules.{tên} import routes as {tên}_routes` + `api_router.include_router({tên}_routes.router)` |
| `alembic/env.py` | `from app.modules.{tên} import models as {tên}_models  # noqa` |

### Chạy migration:

```bash
docker compose exec backend alembic revision --autogenerate -m "add {tên} table"
docker compose exec backend alembic upgrade head
```

---

## Lệnh hữu ích

```bash
# Khởi động lại backend
docker compose restart backend

# Xem logs
docker compose logs -f backend

# Chạy tests (tất cả)
docker compose exec backend bash scripts/tests-start.sh

# Chạy tests (1 module)
docker compose exec backend python -m pytest app/modules/product/tests/ -v

# vừa build vừa khởi động lại các container ngay lập tức
docker compose up -d --build

# Swagger UI
open http://localhost:8000/docs
```
