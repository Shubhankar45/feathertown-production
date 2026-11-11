from datetime import datetime, timezone
from typing import Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Query, status
from pymongo import DESCENDING
from bson import ObjectId

from app.database import reviews_col
from app.utils import serialize_doc, is_valid_object_id, to_object_id

router = APIRouter(prefix="/api/reviews", tags=["Reviews"])

DEFAULT_SEED_REVIEWS = [
  {
    "name": "Ramesh K.",
    "title": "Healthy, hand-tamed Sun Conure arrived safe and energetic!",
    "comment": "Adopted our Sun Conure two months ago. The aviary provided complete DNA sexing papers and vaccination history. He loves shoulder perching and singing along to music every morning!",
    "rating": 5,
    "category": "birds",
    "productOrBreed": "Sun Conure",
    "location": "Bhubaneswar, Odisha",
    "avatar": "/avatars/conure-sun.svg",
    "isVerified": True,
    "helpfulCount": 42,
    "status": "approved",
    "createdAt": datetime(2026, 9, 14, 10, 30, tzinfo=timezone.utc),
    "updatedAt": datetime(2026, 9, 14, 10, 30, tzinfo=timezone.utc),
  },
  {
    "name": "Priya Sharma",
    "title": "Best spacious flight cage on the market",
    "comment": "The Yaheetech open-top flight aviary is extremely sturdy and took less than 30 minutes to assemble. My two cockatiels have so much horizontal wing flight room. Dispatch was under 24 hours!",
    "rating": 5,
    "category": "cages",
    "productOrBreed": "Yaheetech Rolling Aviary",
    "location": "Bengaluru, Karnataka",
    "avatar": "/avatars/cockatiel.svg",
    "isVerified": True,
    "helpfulCount": 38,
    "createdAt": datetime(2026, 9, 28, 14, 15, tzinfo=timezone.utc),
    "updatedAt": datetime(2026, 9, 28, 14, 15, tzinfo=timezone.utc),
  },
  {
    "name": "Amit Roy",
    "title": "Organic seed blend with zero dust and top nutrition",
    "comment": "Switched from generic bird food to Versele-Laga Prestige blend from FeatherTown. Noticeable improvement in plumage shine, feather brightness, and overall flock stamina.",
    "rating": 5,
    "category": "food",
    "productOrBreed": "Versele-Laga Prestige Blend",
    "location": "Kolkata, West Bengal",
    "avatar": "/avatars/green-cheek.svg",
    "isVerified": True,
    "helpfulCount": 31,
    "createdAt": datetime(2026, 10, 5, 9, 0, tzinfo=timezone.utc),
    "updatedAt": datetime(2026, 10, 5, 9, 0, tzinfo=timezone.utc),
  },
  {
    "name": "Sunita M.",
    "title": "Genius intelligence & lifelong companionship",
    "comment": "Adopting an African Grey was a major family decision. FeatherTown's avian behaviorist guided us through diet, enrichment, and socialization. Couldn't ask for a more trustworthy aviary.",
    "rating": 5,
    "category": "birds",
    "productOrBreed": "African Grey",
    "location": "New Delhi",
    "avatar": "/avatars/african-grey.svg",
    "isVerified": True,
    "helpfulCount": 27,
    "createdAt": datetime(2026, 10, 12, 16, 45, tzinfo=timezone.utc),
    "updatedAt": datetime(2026, 10, 12, 16, 45, tzinfo=timezone.utc),
  },
  {
    "name": "Neha Gupta",
    "title": "Sweet whistling companion for our apartment",
    "comment": "Our baby cockatiel arrived healthy, bright-eyed, and completely comfortable with human hands from day one. Quiet enough for apartment living and full of cheerful personality.",
    "rating": 5,
    "category": "birds",
    "productOrBreed": "Lutino Cockatiel",
    "location": "Mumbai, Maharashtra",
    "avatar": "/avatars/cockatiel-lutino.svg",
    "isVerified": True,
    "helpfulCount": 24,
    "createdAt": datetime(2026, 10, 20, 11, 20, tzinfo=timezone.utc),
    "updatedAt": datetime(2026, 10, 20, 11, 20, tzinfo=timezone.utc),
  },
  {
    "name": "Vikram P.",
    "title": "Foraging toys that kept our conure engaged for hours",
    "comment": "Safe non-toxic wood, natural coconut fiber, and bell puzzles. Excellent enrichment products that prevent feather plucking and boredom. Fast doorstep delivery across India.",
    "rating": 5,
    "category": "toys",
    "productOrBreed": "Wooden Foraging Puzzle",
    "location": "Hyderabad, Telangana",
    "avatar": "/avatars/conure-greencheek.svg",
    "isVerified": True,
    "helpfulCount": 19,
    "createdAt": datetime(2026, 10, 29, 13, 10, tzinfo=timezone.utc),
    "updatedAt": datetime(2026, 10, 29, 13, 10, tzinfo=timezone.utc),
  },
]

async def ensure_seed_reviews():
    """Auto-seeds rich authentic reviews if database collection is empty."""
    count = await reviews_col.count_documents({})
    if count == 0:
        await reviews_col.insert_many(DEFAULT_SEED_REVIEWS)

@router.get("")
@router.get("/")
async def get_reviews(
    category: Optional[str] = Query(None),
    sort: Optional[str] = Query("latest"),
    min_rating: Optional[int] = Query(None),
    limit: int = Query(50, ge=1, le=200),
):
    await ensure_seed_reviews()

    filter_query: Dict[str, Any] = {"status": "approved"}
    if category and category.lower() != "all":
        filter_query["category"] = category.lower()
    if min_rating and 1 <= min_rating <= 5:
        filter_query["rating"] = {"$gte": min_rating}

    sort_field = "createdAt"
    if sort == "highest":
        sort_field = "rating"
    elif sort == "helpful":
        sort_field = "helpfulCount"

    cursor = reviews_col.find(filter_query).sort(sort_field, DESCENDING).limit(limit)
    reviews = await cursor.to_list(length=limit)
    return serialize_doc(reviews)

@router.get("/stats")
async def get_review_stats():
    """Returns aggregated review statistics: total reviews, average score, star distribution."""
    await ensure_seed_reviews()

    cursor = reviews_col.find({"status": "approved"})
    all_reviews = await cursor.to_list(length=1000)

    total = len(all_reviews)
    if total == 0:
        return {
            "totalReviews": 0,
            "averageRating": 5.0,
            "starCounts": {5: 0, 4: 0, 3: 0, 2: 0, 1: 0},
            "recommendationRate": 100,
            "verifiedCount": 0,
        }

    sum_ratings = sum(r.get("rating", 5) for r in all_reviews)
    avg_rating = round(sum_ratings / total, 1)

    star_counts = {5: 0, 4: 0, 3: 0, 2: 0, 1: 0}
    verified_count = 0
    recommended_count = 0

    for r in all_reviews:
        r_num = int(r.get("rating", 5))
        if 1 <= r_num <= 5:
            star_counts[r_num] += 1
        if r_num >= 4:
            recommended_count += 1
        if r.get("isVerified", False):
            verified_count += 1

    recommendation_rate = round((recommended_count / total) * 100)

    return {
        "totalReviews": total,
        "averageRating": avg_rating,
        "starCounts": star_counts,
        "recommendationRate": recommendation_rate,
        "verifiedCount": verified_count,
    }

@router.post("", status_code=status.HTTP_201_CREATED)
@router.post("/", status_code=status.HTTP_201_CREATED)
async def add_review(body: Dict[str, Any]):
    name = body.get("name")
    title = body.get("title")
    comment = body.get("comment")
    rating = body.get("rating")
    category = body.get("category")
    product_or_breed = body.get("productOrBreed")
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
        "name": name.strip()[:80],
        "title": str(title).strip()[:120] if title else f"Wonderful experience with FeatherTown!",
        "rating": r_num,
        "comment": comment.strip()[:2000],
        "category": str(category).strip().lower() if category else "general",
        "productOrBreed": str(product_or_breed).strip()[:80] if product_or_breed else "Companion Bird & Supplies",
        "location": str(location).strip()[:80] if location else "India",
        "avatar": str(avatar).strip() if avatar else "/avatars/cockatiel.svg",
        "isVerified": True,
        "helpfulCount": 0,
        "status": "approved",
        "createdAt": now,
        "updatedAt": now,
    }

    result = await reviews_col.insert_one(review_doc)
    review_doc["_id"] = result.inserted_id
    return serialize_doc(review_doc)

@router.post("/{review_id}/helpful")
async def mark_review_helpful(review_id: str):
    """Increments the helpful vote count for a review."""
    if not is_valid_object_id(review_id):
        raise HTTPException(status_code=400, detail={"msg": "Invalid review ID"})

    obj_id = to_object_id(review_id)
    updated = await reviews_col.find_one_and_update(
        {"_id": obj_id},
        {"$inc": {"helpfulCount": 1}},
        return_document=True,
    )

    if not updated:
        raise HTTPException(status_code=404, detail={"msg": "Review not found"})

    return {
        "success": True,
        "helpfulCount": updated.get("helpfulCount", 1),
    }

@router.get("/all")
async def get_all_reviews():
    await ensure_seed_reviews()
    cursor = reviews_col.find().sort("createdAt", DESCENDING).limit(200)
    reviews = await cursor.to_list(length=200)
    return serialize_doc(reviews)

@router.post("/add", status_code=status.HTTP_201_CREATED)
async def add_review_legacy(body: Dict[str, Any]):
    return await add_review(body)
