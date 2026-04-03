from sqlmodel import Session
from app.modules.order_type.models import OrderType, OrderTypeCreate
from tests.utils.utils import random_lower_string


def create_random_order_type(db: Session) -> OrderType:
    name = random_lower_string()
    order_type_in = OrderTypeCreate(name=name)
    order_type = OrderType.model_validate(order_type_in)
    db.add(order_type)
    db.commit()
    db.refresh(order_type)
    return order_type
