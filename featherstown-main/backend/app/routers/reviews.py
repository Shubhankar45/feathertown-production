from datetime import datetime, timezone
from typing import Dict, Any, Optional
from fastapi import APIRouter, HTTPException, status
from pymongo import DESCENDING

from app.database import reviews_col
from app.utils import serialize_doc

router = APIRouter(prefix="/api/reviews", tags=["Reviews"])

@router.get("")
@router.get("/")
async def get_reviews():
    cursor = reviews_col.find({"status": "approved"}).sort("createdAt", DESCENDING).limit(100)
    reviews = await cursor.to_list(length=100)
    return serialize_doc(reviews)

@router.post("", status_code=status.HTTP_201_CREATED)
@router.post("/", status_code=status.HTTP_201_CREATED)
async def add_review(body: Dict[str, Any]):
    name = body.get("name")
    comment = body.get("comment")
    rating = body.get("rating")
    location = body.get("location")
    avatar = body.get("avatar")

    if not name or not isinstance(name, str) or not name.strip():
        raise HTTPException(status_code=400, detail={"msg": "Name is required"})
    if not comment or not isinstance(comment, str) or not comment.strip():
        raise HTTPException(status_code=400, detail={"msg": "Comment is required"})

    try:
        r_num = int(rating) if rating is not None else 5
        r_num = max(1, min(5, r_num))
    except (ValueError, TypeError):
        r_num = 5

    now = datetime.now(timezone.utc)
    review_doc = {
        "name": name.strip(),
        "rating": r_num,
        "comment": comment.strip(),
        "location": str(location).strip() if location else "India",
        "avatar": str(avatar).strip() if avatar else "",
        "isVerified": False,
        "status": "approved",
        "createdAt": now,
        "updatedAt": now,
    }

    result = await reviews_col.insert_one(review_doc)
    review_doc["_id"] = result.inserted_id
    return serialize_doc(review_doc)

@router.get("/all")
async def get_all_reviews():
    cursor = reviews_col.find().sort("createdAt", DESCENDING).limit(200)
    reviews = await cursor.to_list(length=200)
    return serialize_doc(reviews)

@router.post("/add", status_code=status.HTTP_201_CREATED)
async def add_review_legacy(body: Dict[str, Any]):
    name = body.get("name")
    comment = body.get("comment")
    rating = body.get("rating")

    if (
        not name or not isinstance(name, str) or not name.strip() or len(name) > 80 or
        not comment or not isinstance(comment, str) or not comment.strip() or len(comment) > 1000 or
        rating is None
    ):
        raise HTTPException(status_code=400, detail={"msg": "All fields required and must be valid"})

    try:
        r_num = int(rating)
        if r_num < 1 or r_num > 5:
            raise ValueError()
    except (ValueError, TypeError):
        raise HTTPException(status_code=400, detail={"msg": "All fields required and must be valid"})

    now = datetime.now(timezone.utc)
    review_doc = {
        "name": name.strip(),
        "rating": r_num,
        "comment": comment.strip(),
        "location": "India",
        "avatar": "",
        "isVerified": False,
        "status": "approved",
        "createdAt": now,
        "updatedAt": now,
    }

    result = await reviews_col.insert_one(review_doc)
    review_doc["_id"] = result.inserted_id
    return serialize_doc(review_doc)
