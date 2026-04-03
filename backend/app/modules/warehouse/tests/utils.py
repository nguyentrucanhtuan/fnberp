from sqlmodel import Session

from app.modules.warehouse.models import Warehouse, WarehouseCreate
from tests.utils.utils import random_lower_string


def create_random_warehouse(db: Session) -> Warehouse:
    code = random_lower_string()[:20]
    name = random_lower_string()
    address = random_lower_string()
    warehouse_in = WarehouseCreate(code=code, name=name, address=address)
    warehouse = Warehouse.model_validate(warehouse_in)
    db.add(warehouse)
    db.commit()
    db.refresh(warehouse)
    return warehouse
