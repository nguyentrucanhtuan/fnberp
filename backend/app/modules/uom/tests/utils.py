import random
import string

from sqlmodel import Session

from app.modules.uom.models import Uom, UomCreate


def random_upper_code(length: int = 8) -> str:
    return "".join(random.choices(string.ascii_uppercase, k=length))


def create_random_uom(db: Session) -> Uom:
    code = random_upper_code()
    name = "".join(random.choices(string.ascii_lowercase, k=16))
    uom_in = UomCreate(code=code, name=name)
    uom = Uom.model_validate(uom_in)
    db.add(uom)
    db.commit()
    db.refresh(uom)
    return uom
