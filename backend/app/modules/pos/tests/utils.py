from sqlmodel import Session

from app.modules.pos.models import Pos, PosCreate
from tests.utils.utils import random_lower_string


def create_random_pos(db: Session) -> Pos:
    name = f"CoffeeTree {random_lower_string()}"
    pos_in = PosCreate(name=name)
    pos = Pos.model_validate(pos_in)
    db.add(pos)
    db.commit()
    db.refresh(pos)
    return pos
