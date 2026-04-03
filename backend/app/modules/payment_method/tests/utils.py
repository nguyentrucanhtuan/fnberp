from sqlmodel import Session

from app.modules.payment_method.models import PaymentMethod, PaymentMethodCreate
from tests.utils.utils import random_lower_string


def create_random_payment_method(db: Session) -> PaymentMethod:
    name = random_lower_string()
    code = random_lower_string()[:10].upper()
    pm_in = PaymentMethodCreate(name=name, code=code)
    pm = PaymentMethod.model_validate(pm_in)
    db.add(pm)
    db.commit()
    db.refresh(pm)
    return pm
