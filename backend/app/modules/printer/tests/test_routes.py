import uuid

from fastapi.testclient import TestClient
from sqlmodel import Session

from app.core.config import settings
from app.modules.printer.tests.utils import create_random_printer


def test_create_printer(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    data = {
        "name": "Máy in hoá đơn quầy 1",
        "ip": "192.168.1.50",
        "port": 9100,
        "printer_type": "invoice",
    }
    response = client.post(
        f"{settings.API_V1_STR}/printers/",
        headers=superuser_token_headers,
        json=data,
    )
    assert response.status_code == 200
    content = response.json()
    assert content["name"] == data["name"]
    assert content["printer_type"] == "invoice"
    assert "id" in content


def test_create_printer_all_types(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    for ptype in ["invoice", "label", "kitchen_order_ticket"]:
        data = {"name": f"Printer {ptype}", "ip": "10.0.0.1", "port": 9100, "printer_type": ptype}
        response = client.post(
            f"{settings.API_V1_STR}/printers/",
            headers=superuser_token_headers,
            json=data,
        )
        assert response.status_code == 200
        assert response.json()["printer_type"] == ptype


def test_read_printers(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    create_random_printer(db)
    create_random_printer(db)
    response = client.get(
        f"{settings.API_V1_STR}/printers/",
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
    assert len(response.json()["data"]) >= 2


def test_read_printer(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    printer = create_random_printer(db)
    response = client.get(
        f"{settings.API_V1_STR}/printers/{printer.id}",
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
    assert response.json()["id"] == str(printer.id)


def test_read_printer_not_found(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    response = client.get(
        f"{settings.API_V1_STR}/printers/{uuid.uuid4()}",
        headers=superuser_token_headers,
    )
    assert response.status_code == 404


def test_update_printer(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    printer = create_random_printer(db)
    response = client.put(
        f"{settings.API_V1_STR}/printers/{printer.id}",
        headers=superuser_token_headers,
        json={"printer_type": "label", "port": 9101},
    )
    assert response.status_code == 200
    content = response.json()
    assert content["printer_type"] == "label"
    assert content["port"] == 9101


def test_delete_printer(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    printer = create_random_printer(db)
    response = client.delete(
        f"{settings.API_V1_STR}/printers/{printer.id}",
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
    assert response.json()["message"] == "Printer deleted successfully"


def test_delete_printer_not_found(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    response = client.delete(
        f"{settings.API_V1_STR}/printers/{uuid.uuid4()}",
        headers=superuser_token_headers,
    )
    assert response.status_code == 404
