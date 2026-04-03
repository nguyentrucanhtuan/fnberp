import uuid

from fastapi.testclient import TestClient
from sqlmodel import Session

from app.core.config import settings
from app.modules.warehouse.tests.utils import create_random_warehouse


def test_create_warehouse(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    data = {"code": "KHO01", "name": "Kho Chính", "address": "123 Đường ABC"}
    response = client.post(
        f"{settings.API_V1_STR}/warehouses/",
        headers=superuser_token_headers,
        json=data,
    )
    assert response.status_code == 200
    content = response.json()
    assert content["name"] == data["name"]
    assert content["code"] == data["code"]
    assert content["address"] == data["address"]
    assert "id" in content


def test_create_warehouse_duplicate_code(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    warehouse = create_random_warehouse(db)
    data = {"code": warehouse.code, "name": "Kho Trùng", "address": "456 Đường DEF"}
    response = client.post(
        f"{settings.API_V1_STR}/warehouses/",
        headers=superuser_token_headers,
        json=data,
    )
    assert response.status_code == 409


def test_read_warehouses(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    create_random_warehouse(db)
    create_random_warehouse(db)
    response = client.get(
        f"{settings.API_V1_STR}/warehouses/",
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
    content = response.json()
    assert len(content["data"]) >= 2
    assert "count" in content


def test_read_warehouse(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    warehouse = create_random_warehouse(db)
    response = client.get(
        f"{settings.API_V1_STR}/warehouses/{warehouse.id}",
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
    assert response.json()["id"] == str(warehouse.id)


def test_read_warehouse_not_found(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    response = client.get(
        f"{settings.API_V1_STR}/warehouses/{uuid.uuid4()}",
        headers=superuser_token_headers,
    )
    assert response.status_code == 404


def test_update_warehouse(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    warehouse = create_random_warehouse(db)
    response = client.put(
        f"{settings.API_V1_STR}/warehouses/{warehouse.id}",
        headers=superuser_token_headers,
        json={"name": "Kho Cập Nhật"},
    )
    assert response.status_code == 200
    assert response.json()["name"] == "Kho Cập Nhật"


def test_update_warehouse_duplicate_code(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    warehouse1 = create_random_warehouse(db)
    warehouse2 = create_random_warehouse(db)
    response = client.put(
        f"{settings.API_V1_STR}/warehouses/{warehouse2.id}",
        headers=superuser_token_headers,
        json={"code": warehouse1.code},
    )
    assert response.status_code == 409


def test_delete_warehouse(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    warehouse = create_random_warehouse(db)
    response = client.delete(
        f"{settings.API_V1_STR}/warehouses/{warehouse.id}",
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
    assert response.json()["message"] == "Warehouse deleted successfully"


def test_delete_warehouse_not_found(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    response = client.delete(
        f"{settings.API_V1_STR}/warehouses/{uuid.uuid4()}",
        headers=superuser_token_headers,
    )
    assert response.status_code == 404
