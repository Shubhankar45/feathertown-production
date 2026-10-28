from fastapi import APIRouter
from app.routers.categories import get_or_create_settings
from app.utils import serialize_doc

router = APIRouter(prefix="/api/settings", tags=["Settings"])

@router.get("")
@router.get("/")
async def get_settings():
    doc = await get_or_create_settings()
    return serialize_doc(doc)
