from fastapi import APIRouter
from app.routers.categories import get_or_create_settings
from app.utils import serialize_doc

router = APIRouter(prefix="/api/settings", tags=["Settings"])

@router.get("")
@router.get("/")
async def get_settings():
    doc = await get_or_create_settings()
    res = serialize_doc(doc)
    if isinstance(res, dict):
        res["announcement"] = {
            "text": res.get("announcementText", ""),
            "enabled": res.get("announcementActive", True),
        }
        res["contact"] = {
            "phone": res.get("phone", ""),
            "whatsapp": res.get("whatsapp", ""),
            "email": res.get("email", ""),
            "address": res.get("address", ""),
        }
        res["hero"] = {
            "title": res.get("heroTitle", ""),
            "subtitle": res.get("heroSubtitle", ""),
            "image": res.get("heroImage", ""),
        }
        res["shipping"] = {
            "freeShippingThreshold": res.get("freeShippingThreshold", 999),
            "standardShippingFee": res.get("standardShippingFee", 99),
        }
    return res
