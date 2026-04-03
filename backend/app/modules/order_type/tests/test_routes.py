import uuid
from fastapi.testclient import TestClient
from sqlmodel import Session
from app.core.config import settings
from app.modules.order_type.tests.utils import create_random_order_type


def test_create_order_type(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    data = {"name": "Test Order Type"}
    response = client.post(
        f"{settings.API_V1_STR}/order-types/",
        headers=superuser_token_headers,
        json=data,
    )
    assert response.status_code == 200
    content = response.json()
    assert content["name"] == data["name"]
    assert "id" in content


def test_read_order_types(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    create_random_order_type(db)
    create_random_order_type(db)
    response = client.get(
        f"{settings.API_V1_STR}/order-types/",
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
    assert len(response.json()["data"]) >= 2


def test_read_order_type(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    order_type = create_random_order_type(db)
    response = client.get(
        f"{settings.API_V1_STR}/order-types/{order_type.id}",
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
    assert response.json()["id"] == str(order_type.id)


def test_update_order_type(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    order_type = create_random_order_type(db)
    response = client.put(
        f"{settings.API_V1_STR}/order-types/{order_type.id}",
        headers=superuser_token_headers,
        json={"name": "Updated Name"},
    )
    assert response.status_code == 200
    assert response.json()["name"] == "Updated Name"


def test_delete_order_type(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    order_type = create_random_order_type(db)
    response = client.delete(
        f"{settings.API_V1_STR}/order-types/{order_type.id}",
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
    assert response.json()["message"] == "Order type deleted successfully"
