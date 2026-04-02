import uuid

from fastapi.testclient import TestClient
from sqlmodel import Session

from app.core.config import settings
from app.modules.uom.tests.utils import create_random_uom


def test_create_uom(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    data = {"code": "KGTEST", "name": "Kilogram Test", "relative_factor": 1.0}
    response = client.post(
        f"{settings.API_V1_STR}/uoms/",
        headers=superuser_token_headers,
        json=data,
    )
    assert response.status_code == 200
    content = response.json()
    assert content["code"] == data["code"]
    assert content["name"] == data["name"]
    assert "id" in content


def test_create_uom_duplicate_code(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    uom = create_random_uom(db)
    data = {"code": uom.code, "name": "Duplicate"}
    response = client.post(
        f"{settings.API_V1_STR}/uoms/",
        headers=superuser_token_headers,
        json=data,
    )
    assert response.status_code == 409


def test_read_uoms(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    create_random_uom(db)
    create_random_uom(db)
    response = client.get(
        f"{settings.API_V1_STR}/uoms/",
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
    content = response.json()
    assert "data" in content
    assert "count" in content
    assert len(content["data"]) >= 2


def test_read_uom(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    uom = create_random_uom(db)
    response = client.get(
        f"{settings.API_V1_STR}/uoms/{uom.id}",
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
    content = response.json()
    assert content["id"] == str(uom.id)
    assert content["code"] == uom.code


def test_read_uom_not_found(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    response = client.get(
        f"{settings.API_V1_STR}/uoms/{uuid.uuid4()}",
        headers=superuser_token_headers,
    )
    assert response.status_code == 404


def test_update_uom(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    uom = create_random_uom(db)
    response = client.put(
        f"{settings.API_V1_STR}/uoms/{uom.id}",
        headers=superuser_token_headers,
        json={"name": "Updated Name", "relative_factor": 1000.0},
    )
    assert response.status_code == 200
    content = response.json()
    assert content["name"] == "Updated Name"
    assert content["relative_factor"] == 1000.0


def test_update_uom_self_reference(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    """Không thể set relative_uom_id trỏ về chính nó."""
    uom = create_random_uom(db)
    response = client.put(
        f"{settings.API_V1_STR}/uoms/{uom.id}",
        headers=superuser_token_headers,
        json={"relative_uom_id": str(uom.id)},
    )
    assert response.status_code == 422


def test_update_uom_not_found(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    response = client.put(
        f"{settings.API_V1_STR}/uoms/{uuid.uuid4()}",
        headers=superuser_token_headers,
        json={"name": "Ghost"},
    )
    assert response.status_code == 404


def test_archive_uom(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    uom = create_random_uom(db)
    response = client.put(
        f"{settings.API_V1_STR}/uoms/{uom.id}",
        headers=superuser_token_headers,
        json={"is_archived": True},
    )
    assert response.status_code == 200
    assert response.json()["is_archived"] is True


def test_delete_uom(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    uom = create_random_uom(db)
    response = client.delete(
        f"{settings.API_V1_STR}/uoms/{uom.id}",
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
    assert response.json()["message"] == "Uom deleted successfully"


def test_delete_uom_not_found(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    response = client.delete(
        f"{settings.API_V1_STR}/uoms/{uuid.uuid4()}",
        headers=superuser_token_headers,
    )
    assert response.status_code == 404
