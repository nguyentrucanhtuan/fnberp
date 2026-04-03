from sqlmodel import Session

from app.modules.printer.models import Printer, PrinterCreate
from tests.utils.utils import random_lower_string


def create_random_printer(db: Session) -> Printer:
    name = f"Printer-{random_lower_string()[:8]}"
    printer_in = PrinterCreate(
        name=name,
        ip="192.168.1.100",
        port=9100,
        printer_type="invoice",
    )
    printer = Printer.model_validate(printer_in)
    db.add(printer)
    db.commit()
    db.refresh(printer)
    return printer
