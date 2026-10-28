from typing import Dict, Any
from fastapi import APIRouter

from app.database import settings_col, birds_col, accessories_col
from app.seed_data import DEFAULT_BIRD_CATEGORIES, DEFAULT_ACCESSORY_CATEGORIES, DEFAULT_SETTINGS

router = APIRouter(prefix="/api/categories", tags=["Categories"])

async def get_or_create_settings():
    doc = await settings_col.find_one({"key": "store_settings"})
    if not doc:
        doc = {**DEFAULT_SETTINGS}
        await settings_col.insert_one(doc)
    else:
        modified = False
        updates = {}
        if not doc.get("birdCategories"):
            updates["birdCategories"] = DEFAULT_BIRD_CATEGORIES
            modified = True
        if not doc.get("accessoryCategories"):
            updates["accessoryCategories"] = DEFAULT_ACCESSORY_CATEGORIES
            modified = True
        if modified:
            await settings_col.update_one({"key": "store_settings"}, {"$set": updates})
            doc = await settings_col.find_one({"key": "store_settings"})
    return doc

async def get_categories_payload() -> Dict[str, Any]:
    settings = await get_or_create_settings()

    distinct_bird_cats = await birds_col.distinct("category")
    distinct_acc_cats = await accessories_col.distinct("category")

    base_bird = settings.get("birdCategories") or DEFAULT_BIRD_CATEGORIES
    base_acc = settings.get("accessoryCategories") or DEFAULT_ACCESSORY_CATEGORIES

    bird_categories = list(dict.fromkeys(base_bird + [c for c in distinct_bird_cats if c]))
    accessory_categories = list(dict.fromkeys(base_acc + [c for c in distinct_acc_cats if c]))

    bird_agg = await birds_col.aggregate([
        {"$group": {"_id": "$category", "count": {"$sum": 1}}}
    ]).to_list(length=None)
    bird_counts = {b["_id"]: b["count"] for b in bird_agg if b.get("_id")}

    acc_agg = await accessories_col.aggregate([
        {"$group": {"_id": "$category", "count": {"$sum": 1}}}
    ]).to_list(length=None)
    accessory_counts = {a["_id"]: a["count"] for a in acc_agg if a.get("_id")}

    return {
        "birdCategories": bird_categories,
        "accessoryCategories": accessory_categories,
        "birdCounts": bird_counts,
        "accessoryCounts": accessory_counts,
    }

@router.get("")
@router.get("/")
async def get_categories():
    return await get_categories_payload()
