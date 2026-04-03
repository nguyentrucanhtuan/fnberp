from fastapi import APIRouter

from app.api.routes import items, login, private, users, utils
from app.core.config import settings
from app.modules.kitchen_screen import routes as kitchen_screen_routes
from app.modules.order_type import routes as order_type_routes
from app.modules.payment_method import routes as payment_method_routes
from app.modules.pos import routes as pos_routes
from app.modules.printer import routes as printer_routes
from app.modules.product import routes as product_routes
from app.modules.product_category import routes as product_category_routes
from app.modules.uom import routes as uom_routes
from app.modules.warehouse import routes as warehouse_routes

api_router = APIRouter()
api_router.include_router(login.router)
api_router.include_router(users.router)
api_router.include_router(utils.router)
api_router.include_router(items.router)
api_router.include_router(uom_routes.router)
api_router.include_router(product_category_routes.router)
api_router.include_router(product_routes.router)
api_router.include_router(warehouse_routes.router)
api_router.include_router(pos_routes.router)
api_router.include_router(payment_method_routes.router)
api_router.include_router(printer_routes.router)
api_router.include_router(order_type_routes.router)
api_router.include_router(kitchen_screen_routes.router)


if settings.ENVIRONMENT == "local":
    api_router.include_router(private.router)
