from fastapi import APIRouter

from app.api.routes import items, login, private, users, utils
from app.core.config import settings
from app.modules.uom import routes as uom_routes
from app.modules.product_category import routes as product_category_routes
from app.modules.product import routes as product_routes

api_router = APIRouter()
api_router.include_router(login.router)
api_router.include_router(users.router)
api_router.include_router(utils.router)
api_router.include_router(items.router)
api_router.include_router(uom_routes.router)
api_router.include_router(product_category_routes.router)
api_router.include_router(product_routes.router)


if settings.ENVIRONMENT == "local":
    api_router.include_router(private.router)
