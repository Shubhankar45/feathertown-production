from typing import Optional
from fastapi import APIRouter, HTTPException, Query, status
from pymongo import ASCENDING, DESCENDING

from app.database import accessories_col
from app.utils import is_valid_object_id, to_object_id, serialize_doc

router = APIRouter(prefix="/api/accessories", tags=["Accessories"])

@router.get("")
@router.get("/")
async def list_accessories(
    category: Optional[str] = Query(None),
    q: Optional[str] = Query(None),
    sort: Optional[str] = Query(None),
    bestSeller: Optional[str] = Query(None),
    limit: Optional[int] = Query(200),
):
    query_filter = {"isActive": True}

    if category and category.lower() != "all":
        query_filter["category"] = category

    if bestSeller == "true":
        query_filter["isBestSeller"] = True

    if q and q.strip():
        query_filter["$text"] = {"$search": q.strip()}

    cursor = accessories_col.find(query_filter)

    if sort == "price_asc":
        cursor = cursor.sort([("price", ASCENDING)])
    elif sort == "price_desc":
        cursor = cursor.sort([("price", DESCENDING)])
    else:
        cursor = cursor.sort([("isBestSeller", DESCENDING), ("createdAt", DESCENDING)])

    max_items = limit if (limit and limit > 0) else 200
    accessories = await cursor.to_list(length=max_items)
    return serialize_doc(accessories)

@router.get("/categories")
async def list_categories():
    categories = await accessories_col.distinct("category", {"isActive": True})
    return sorted(categories)

@router.get("/{idOrSlug}")
async def get_accessory(idOrSlug: str):
    query = {"_id": to_object_id(idOrSlug)} if is_valid_object_id(idOrSlug) else {"slug": idOrSlug}
    query["isActive"] = True

    accessory = await accessories_col.find_one(query)
    if not accessory:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"msg": "Not found"},
        )

    return serialize_doc(accessory)
