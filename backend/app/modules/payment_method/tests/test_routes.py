import uuid

from fastapi.testclient import TestClient
from sqlmodel import Session

from app.core.config import settings
from app.modules.payment_method.tests.utils import create_random_payment_method


def test_create_payment_method(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    data = {"name": "Tiền mặt", "code": "CASH"}
    response = client.post(
        f"{settings.API_V1_STR}/payment-methods/",
        headers=superuser_token_headers,
        json=data,
    )
    assert response.status_code == 200
    content = response.json()
    assert content["name"] == data["name"]
    assert content["code"] == data["code"]
    assert "id" in content


def test_create_payment_method_duplicate_code(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    pm = create_random_payment_method(db)
    response = client.post(
        f"{settings.API_V1_STR}/payment-methods/",
        headers=superuser_token_headers,
        json={"name": "Another", "code": pm.code},
    )
    assert response.status_code == 409


def test_read_payment_methods(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    create_random_payment_method(db)
    create_random_payment_method(db)
    response = client.get(
        f"{settings.API_V1_STR}/payment-methods/",
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
    assert len(response.json()["data"]) >= 2


def test_read_payment_method(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    pm = create_random_payment_method(db)
    response = client.get(
        f"{settings.API_V1_STR}/payment-methods/{pm.id}",
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
    assert response.json()["id"] == str(pm.id)


def test_read_payment_method_not_found(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    response = client.get(
        f"{settings.API_V1_STR}/payment-methods/{uuid.uuid4()}",
        headers=superuser_token_headers,
    )
    assert response.status_code == 404


def test_update_payment_method(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    pm = create_random_payment_method(db)
    response = client.put(
        f"{settings.API_V1_STR}/payment-methods/{pm.id}",
        headers=superuser_token_headers,
        json={"name": "Chuyển khoản", "code": "BANK"},
    )
    assert response.status_code == 200
    assert response.json()["name"] == "Chuyển khoản"


def test_delete_payment_method(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    pm = create_random_payment_method(db)
    response = client.delete(
        f"{settings.API_V1_STR}/payment-methods/{pm.id}",
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
    assert response.json()["message"] == "Payment method deleted successfully"


def test_delete_payment_method_not_found(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    response = client.delete(
        f"{settings.API_V1_STR}/payment-methods/{uuid.uuid4()}",
        headers=superuser_token_headers,
    )
    assert response.status_code == 404
