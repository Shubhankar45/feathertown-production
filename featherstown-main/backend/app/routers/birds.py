from typing import Optional
from fastapi import APIRouter, HTTPException, Query, status
from pymongo import ASCENDING, DESCENDING

from app.database import birds_col
from app.utils import is_valid_object_id, to_object_id, serialize_doc

router = APIRouter(prefix="/api/birds", tags=["Birds"])

@router.get("")
@router.get("/")
async def list_birds(
    category: Optional[str] = Query(None),
    status_param: Optional[str] = Query(None, alias="status"),
    q: Optional[str] = Query(None),
    sort: Optional[str] = Query(None),
):
    query_filter = {"isActive": True}

    if category and category.lower() != "all":
        query_filter["category"] = category

    if status_param and status_param.lower() != "all":
        query_filter["status"] = status_param

    if q and q.strip():
        query_filter["$text"] = {"$search": q.strip()}

    cursor = birds_col.find(query_filter)

    if sort == "price_asc":
        cursor = cursor.sort([("minPrice", ASCENDING), ("order", ASCENDING)])
    elif sort == "price_desc":
        cursor = cursor.sort([("minPrice", DESCENDING), ("order", ASCENDING)])
    else:
        cursor = cursor.sort([("order", ASCENDING), ("createdAt", DESCENDING)])

    birds = await cursor.to_list(length=100)
    return serialize_doc(birds)

@router.get("/{idOrSlug}")
async def get_bird(idOrSlug: str):
    query = {"_id": to_object_id(idOrSlug)} if is_valid_object_id(idOrSlug) else {"slug": idOrSlug.lower()}
    query["isActive"] = True

    bird = await birds_col.find_one(query)
    if not bird:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"msg": "Bird not found"},
        )

    return serialize_doc(bird)
