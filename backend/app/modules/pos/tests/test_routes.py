import uuid

from fastapi.testclient import TestClient
from sqlmodel import Session

from app.core.config import settings
from app.modules.pos.tests.utils import create_random_pos


def test_create_pos(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    data = {"name": "CoffeeTree Trương Văn Bang"}
    response = client.post(
        f"{settings.API_V1_STR}/pos/",
        headers=superuser_token_headers,
        json=data,
    )
    assert response.status_code == 200
    content = response.json()
    assert content["name"] == data["name"]
    assert "id" in content


def test_read_poss(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    create_random_pos(db)
    create_random_pos(db)
    response = client.get(
        f"{settings.API_V1_STR}/pos/",
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
    content = response.json()
    assert len(content["data"]) >= 2
    assert "count" in content


def test_read_pos(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    pos = create_random_pos(db)
    response = client.get(
        f"{settings.API_V1_STR}/pos/{pos.id}",
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
    assert response.json()["id"] == str(pos.id)


def test_read_pos_not_found(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    response = client.get(
        f"{settings.API_V1_STR}/pos/{uuid.uuid4()}",
        headers=superuser_token_headers,
    )
    assert response.status_code == 404


def test_update_pos(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    pos = create_random_pos(db)
    response = client.put(
        f"{settings.API_V1_STR}/pos/{pos.id}",
        headers=superuser_token_headers,
        json={"name": "CoffeeTree Updated"},
    )
    assert response.status_code == 200
    assert response.json()["name"] == "CoffeeTree Updated"


def test_delete_pos(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    pos = create_random_pos(db)
    response = client.delete(
        f"{settings.API_V1_STR}/pos/{pos.id}",
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
    assert response.json()["message"] == "POS location deleted successfully"


def test_delete_pos_not_found(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    response = client.delete(
        f"{settings.API_V1_STR}/pos/{uuid.uuid4()}",
        headers=superuser_token_headers,
    )
    assert response.status_code == 404
