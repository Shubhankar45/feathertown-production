import re
import time
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List
from fastapi import APIRouter, HTTPException, Depends, Query, status
from pymongo import ASCENDING, DESCENDING

from app.auth import get_current_admin
from app.database import (
    birds_col,
    accessories_col,
    orders_col,
    reviews_col,
    subscribers_col,
    settings_col,
)
from app.routers.categories import (
    get_or_create_settings,
    get_categories_payload,
)
from app.seed_data import DEFAULT_BIRD_CATEGORIES, DEFAULT_ACCESSORY_CATEGORIES
from app.utils import slugify, is_valid_object_id, to_object_id, serialize_doc

router = APIRouter(
    prefix="/api/admin",
    tags=["Admin Management"],
    dependencies=[Depends(get_current_admin)],
)

# ═══════════════════════════════════════════════════════════
# 1. BIRDS
# ═══════════════════════════════════════════════════════════

@router.get("/birds")
async def admin_list_birds(
    category: Optional[str] = Query(None),
    status_param: Optional[str] = Query(None, alias="status"),
    q: Optional[str] = Query(None),
):
    query_filter: Dict[str, Any] = {}

    if category and category.lower() != "all":
        query_filter["category"] = category

    if status_param and status_param.lower() != "all":
        query_filter["status"] = status_param

    if q and q.strip():
        regex = {"$regex": re.escape(q.strip()), "$options": "i"}
        query_filter["$or"] = [
            {"name": regex},
            {"category": regex},
            {"description": regex},
        ]

    cursor = birds_col.find(query_filter).sort([("order", ASCENDING), ("createdAt", DESCENDING)])
    birds = await cursor.to_list(length=500)
    return serialize_doc(birds)

@router.post("/birds", status_code=status.HTTP_201_CREATED)
async def admin_create_bird(body: Dict[str, Any]):
    name = body.get("name")
    category = body.get("category")
    price = body.get("price")

    if not name or not isinstance(name, str) or not name.strip():
        raise HTTPException(status_code=400, detail={"msg": "Bird name is required"})
    if not category or not isinstance(category, str) or not category.strip():
        raise HTTPException(status_code=400, detail={"msg": "Category is required"})
    if not price or not isinstance(price, str) or not price.strip():
        raise HTTPException(status_code=400, detail={"msg": "Price is required"})

    base_slug = slugify(name)
    slug = base_slug
    suffix = 1
    while await birds_col.find_one({"slug": slug}):
        slug = f"{base_slug}-{suffix}"
        suffix += 1

    now = datetime.now(timezone.utc)
    bird_doc = {
        "name": name.strip(),
        "slug": slug,
        "category": category.strip(),
        "image": body.get("image", ""),
        "price": price.strip(),
        "minPrice": float(body.get("minPrice") or 0),
        "status": body.get("status") or "available",
        "description": body.get("description", ""),
        "lifespan": body.get("lifespan") or "20-30 years",
        "origin": body.get("origin") or "South America",
        "size": body.get("size") or "Medium",
        "diet": body.get("diet") or "Fruits, seeds, pellets",
        "behavior": body.get("behavior") or "Social and active",
        "talkingAbility": body.get("talkingAbility") or "Medium",
        "difficulty": body.get("difficulty") or "Medium",
        "noiseLevel": body.get("noiseLevel") or "Medium",
        "training": body.get("training") or {
            "basic": ["Step Up", "Recall", "Human friendly bonding", "Indoor free flying"],
            "advanced": ["Outdoor free flying", "Harness training", "Spin trick", "Wave trick"],
        },
        "care": body.get("care") if isinstance(body.get("care"), list) else [
            "Provide large cage",
            "Daily interaction required",
            "Balanced diet essential",
        ],
        "featured": bool(body.get("featured", True)),
        "isActive": bool(body.get("isActive", True)),
        "order": int(body.get("order") or 0),
        "createdAt": now,
        "updatedAt": now,
    }

    result = await birds_col.insert_one(bird_doc)
    bird_doc["_id"] = result.inserted_id
    return serialize_doc(bird_doc)

@router.put("/birds/{id}")
async def admin_update_bird(id: str, body: Dict[str, Any]):
    if not is_valid_object_id(id):
        raise HTTPException(status_code=404, detail={"msg": "Bird not found"})

    bird = await birds_col.find_one({"_id": to_object_id(id)})
    if not bird:
        raise HTTPException(status_code=404, detail={"msg": "Bird not found"})

    updates = {**body}
    updates.pop("_id", None)
    updates.pop("createdAt", None)

    if updates.get("name") and str(updates["name"]).strip() != bird.get("name"):
        base_slug = slugify(updates["name"])
        slug = base_slug
        suffix = 1
        while await birds_col.find_one({"slug": slug, "_id": {"$ne": bird["_id"]}}):
            slug = f"{base_slug}-{suffix}"
            suffix += 1
        updates["slug"] = slug

    if "minPrice" in updates:
        try:
            updates["minPrice"] = float(updates["minPrice"])
        except (ValueError, TypeError):
            updates["minPrice"] = 0

    if "order" in updates:
        try:
            updates["order"] = int(updates["order"])
        except (ValueError, TypeError):
            updates["order"] = 0

    updates["updatedAt"] = datetime.now(timezone.utc)

    await birds_col.update_one({"_id": bird["_id"]}, {"$set": updates})
    updated_bird = await birds_col.find_one({"_id": bird["_id"]})
    return serialize_doc(updated_bird)

@router.delete("/birds/{id}")
async def admin_delete_bird(id: str):
    if not is_valid_object_id(id):
        raise HTTPException(status_code=404, detail={"msg": "Bird not found"})

    res = await birds_col.delete_one({"_id": to_object_id(id)})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail={"msg": "Bird not found"})

    return {"msg": "Bird deleted successfully", "id": id}

@router.patch("/birds/{id}/status")
async def admin_toggle_bird_status(id: str, body: Dict[str, Any]):
    if not is_valid_object_id(id):
        raise HTTPException(status_code=404, detail={"msg": "Bird not found"})

    new_status = body.get("status")
    allowed = ["available", "reserved", "sold out", "coming soon"]
    if new_status not in allowed:
        raise HTTPException(status_code=400, detail={"msg": "Invalid status"})

    now = datetime.now(timezone.utc)
    res = await birds_col.find_one_and_update(
        {"_id": to_object_id(id)},
        {"$set": {"status": new_status, "updatedAt": now}},
        return_document=True,
    )
    if not res:
        raise HTTPException(status_code=404, detail={"msg": "Bird not found"})

    return serialize_doc(res)

# ═══════════════════════════════════════════════════════════
# 2. ACCESSORIES
# ═══════════════════════════════════════════════════════════

def validate_accessory_body(body: Dict[str, Any], partial: bool = False) -> Optional[str]:
    name = body.get("name")
    category = body.get("category")
    price = body.get("price")
    stock = body.get("stock")

    if not partial or "name" in body:
        if not name or not isinstance(name, str) or not name.strip():
            return "Name is required"

    if not partial or "category" in body:
        if not category or not isinstance(category, str) or not category.strip():
            return "Category is required"

    if not partial or "price" in body:
        try:
            p = float(price)
            if p < 0:
                return "Valid price is required"
        except (ValueError, TypeError):
            return "Valid price is required"

    if not partial or "stock" in body:
        try:
            s = int(stock)
            if s < 0:
                return "Valid stock is required"
        except (ValueError, TypeError):
            return "Valid stock is required"

    return None

@router.get("/accessories")
async def admin_list_accessories():
    cursor = accessories_col.find().sort("createdAt", DESCENDING)
    items = await cursor.to_list(length=1000)
    return serialize_doc(items)

@router.post("/accessories", status_code=status.HTTP_201_CREATED)
async def admin_create_accessory(body: Dict[str, Any]):
    err = validate_accessory_body(body)
    if err:
        raise HTTPException(status_code=400, detail={"msg": err})

    name = str(body["name"]).strip()
    slug = slugify(name)
    existing = await accessories_col.find_one({"slug": slug})
    if existing:
        slug = f"{slug}-{hex(int(time.time() * 1000))[2:]}"

    now = datetime.now(timezone.utc)
    images = body.get("images")
    if not isinstance(images, list):
        images = []
    clean_images = [img for img in images if img][:8]

    mrp = body.get("mrp")
    mrp_val = float(mrp) if mrp not in (None, "") else None

    acc_doc = {
        "name": name,
        "slug": slug,
        "category": str(body["category"]).strip(),
        "description": str(body.get("description", "")).strip(),
        "price": float(body["price"]),
        "mrp": mrp_val,
        "images": clean_images,
        "stock": int(body["stock"]),
        "isActive": bool(body.get("isActive", True)),
        "isBestSeller": bool(body.get("isBestSeller", False)),
        "badge": str(body.get("badge", "")).strip(),
        "rating": 5.0,
        "reviewsCount": 1,
        "createdAt": now,
        "updatedAt": now,
    }

    result = await accessories_col.insert_one(acc_doc)
    acc_doc["_id"] = result.inserted_id
    return serialize_doc(acc_doc)

@router.put("/accessories/{id}")
async def admin_update_accessory(id: str, body: Dict[str, Any]):
    if not is_valid_object_id(id):
        raise HTTPException(status_code=404, detail={"msg": "Not found"})

    err = validate_accessory_body(body, partial=True)
    if err:
        raise HTTPException(status_code=400, detail={"msg": err})

    acc = await accessories_col.find_one({"_id": to_object_id(id)})
    if not acc:
        raise HTTPException(status_code=404, detail={"msg": "Not found"})

    updates: Dict[str, Any] = {}

    if "name" in body:
        name = str(body["name"]).strip()
        updates["name"] = name
        new_slug = slugify(name)
        if new_slug != acc.get("slug"):
            clash = await accessories_col.find_one({"slug": new_slug, "_id": {"$ne": acc["_id"]}})
            updates["slug"] = f"{new_slug}-{hex(int(time.time() * 1000))[2:]}" if clash else new_slug

    if "category" in body:
        updates["category"] = str(body["category"]).strip()
    if "description" in body:
        updates["description"] = str(body.get("description") or "").strip()
    if "price" in body:
        updates["price"] = float(body["price"])
    if "mrp" in body:
        mrp = body.get("mrp")
        updates["mrp"] = None if mrp in (None, "") else float(mrp)
    if "images" in body:
        images = body.get("images")
        updates["images"] = [img for img in images if img][:8] if isinstance(images, list) else []
    if "stock" in body:
        updates["stock"] = int(body["stock"])
    if "isActive" in body:
        updates["isActive"] = bool(body["isActive"])
    if "isBestSeller" in body:
        updates["isBestSeller"] = bool(body["isBestSeller"])
    if "badge" in body:
        updates["badge"] = str(body.get("badge") or "").strip()

    updates["updatedAt"] = datetime.now(timezone.utc)

    await accessories_col.update_one({"_id": acc["_id"]}, {"$set": updates})
    updated = await accessories_col.find_one({"_id": acc["_id"]})
    return serialize_doc(updated)

@router.delete("/accessories/{id}")
async def admin_delete_accessory(id: str):
    if not is_valid_object_id(id):
        raise HTTPException(status_code=404, detail={"msg": "Not found"})

    res = await accessories_col.delete_one({"_id": to_object_id(id)})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail={"msg": "Not found"})

    return {"msg": "Deleted"}

# ═══════════════════════════════════════════════════════════
# 3. CATEGORIES
# ═══════════════════════════════════════════════════════════

@router.get("/categories")
async def admin_get_categories():
    return await get_categories_payload()

@router.post("/categories")
async def admin_add_category(body: Dict[str, Any]):
    cat_type = body.get("type")
    name = body.get("name")

    if not name or not str(name).strip():
        raise HTTPException(status_code=400, detail={"msg": "Category name is required"})

    clean_name = str(name).strip()
    settings = await get_or_create_settings()

    if cat_type == "birds":
        current = settings.get("birdCategories") or DEFAULT_BIRD_CATEGORIES
        if not any(c.lower() == clean_name.lower() for c in current):
            await settings_col.update_one(
                {"key": "store_settings"},
                {"$push": {"birdCategories": clean_name}, "$set": {"updatedAt": datetime.now(timezone.utc)}},
            )
    elif cat_type == "accessories":
        current = settings.get("accessoryCategories") or DEFAULT_ACCESSORY_CATEGORIES
        if not any(c.lower() == clean_name.lower() for c in current):
            await settings_col.update_one(
                {"key": "store_settings"},
                {"$push": {"accessoryCategories": clean_name}, "$set": {"updatedAt": datetime.now(timezone.utc)}},
            )
    else:
        raise HTTPException(
            status_code=400,
            detail={"msg": "Invalid category type. Must be 'birds' or 'accessories'"},
        )

    return await get_categories_payload()

@router.put("/categories")
async def admin_update_category(body: Dict[str, Any]):
    cat_type = body.get("type")
    old_name = body.get("oldName")
    new_name = body.get("newName")
    update_products = body.get("updateProducts", True)

    if not old_name or not new_name or not str(new_name).strip():
        raise HTTPException(status_code=400, detail={"msg": "Old and new category names are required"})

    clean_new = str(new_name).strip()
    settings = await get_or_create_settings()

    now = datetime.now(timezone.utc)
    if cat_type == "birds":
        current = settings.get("birdCategories") or DEFAULT_BIRD_CATEGORIES
        updated_list = [clean_new if c.lower() == old_name.lower() else c for c in current]
        if clean_new not in updated_list:
            updated_list.append(clean_new)

        await settings_col.update_one(
            {"key": "store_settings"},
            {"$set": {"birdCategories": updated_list, "updatedAt": now}},
        )

        if update_products is not False:
            await birds_col.update_many({"category": old_name}, {"$set": {"category": clean_new}})

    elif cat_type == "accessories":
        current = settings.get("accessoryCategories") or DEFAULT_ACCESSORY_CATEGORIES
        updated_list = [clean_new if c.lower() == old_name.lower() else c for c in current]
        if clean_new not in updated_list:
            updated_list.append(clean_new)

        await settings_col.update_one(
            {"key": "store_settings"},
            {"$set": {"accessoryCategories": updated_list, "updatedAt": now}},
        )

        if update_products is not False:
            await accessories_col.update_many({"category": old_name}, {"$set": {"category": clean_new}})

    else:
        raise HTTPException(status_code=400, detail={"msg": "Invalid category type"})

    return await get_categories_payload()

@router.delete("/categories")
async def admin_delete_category(body: Dict[str, Any]):
    cat_type = body.get("type")
    name = body.get("name")

    if not name:
        raise HTTPException(status_code=400, detail={"msg": "Category name is required"})

    settings = await get_or_create_settings()
    now = datetime.now(timezone.utc)

    if cat_type == "birds":
        current = settings.get("birdCategories") or DEFAULT_BIRD_CATEGORIES
        updated_list = [c for c in current if c.lower() != str(name).lower()]
        await settings_col.update_one(
            {"key": "store_settings"},
            {"$set": {"birdCategories": updated_list, "updatedAt": now}},
        )
    elif cat_type == "accessories":
        current = settings.get("accessoryCategories") or DEFAULT_ACCESSORY_CATEGORIES
        updated_list = [c for c in current if c.lower() != str(name).lower()]
        await settings_col.update_one(
            {"key": "store_settings"},
            {"$set": {"accessoryCategories": updated_list, "updatedAt": now}},
        )
    else:
        raise HTTPException(status_code=400, detail={"msg": "Invalid category type"})

    return await get_categories_payload()

# ═══════════════════════════════════════════════════════════
# 4. ORDERS
# ═══════════════════════════════════════════════════════════

@router.get("/orders")
async def admin_list_orders(status_param: Optional[str] = Query(None, alias="status")):
    query_filter: Dict[str, Any] = {}
    if status_param and status_param.lower() != "all":
        query_filter["orderStatus"] = status_param

    cursor = orders_col.find(query_filter).sort("createdAt", DESCENDING).limit(500)
    orders = await cursor.to_list(length=500)
    return serialize_doc(orders)

@router.patch("/orders/{id}/status")
async def admin_update_order_status(id: str, body: Dict[str, Any]):
    if not is_valid_object_id(id):
        raise HTTPException(status_code=404, detail={"msg": "Not found"})

    order_status = body.get("orderStatus")
    allowed = ["pending", "confirmed", "shipped", "delivered", "cancelled"]
    if order_status not in allowed:
        raise HTTPException(status_code=400, detail={"msg": "Invalid status"})

    now = datetime.now(timezone.utc)
    res = await orders_col.find_one_and_update(
        {"_id": to_object_id(id)},
        {"$set": {"orderStatus": order_status, "updatedAt": now}},
        return_document=True,
    )
    if not res:
        raise HTTPException(status_code=404, detail={"msg": "Not found"})

    return serialize_doc(res)

# ═══════════════════════════════════════════════════════════
# 5. REVIEWS
# ═══════════════════════════════════════════════════════════

@router.get("/reviews")
async def admin_list_reviews():
    cursor = reviews_col.find().sort("createdAt", DESCENDING)
    reviews = await cursor.to_list(length=500)
    return serialize_doc(reviews)

@router.post("/reviews", status_code=status.HTTP_201_CREATED)
async def admin_create_review(body: Dict[str, Any]):
    name = body.get("name")
    comment = body.get("comment")

    if not name or not isinstance(name, str) or not name.strip():
        raise HTTPException(status_code=400, detail={"msg": "Name is required"})
    if not comment or not isinstance(comment, str) or not comment.strip():
        raise HTTPException(status_code=400, detail={"msg": "Comment is required"})

    try:
        r_num = int(body.get("rating") or 5)
    except (ValueError, TypeError):
        r_num = 5

    now = datetime.now(timezone.utc)
    review_doc = {
        "name": name.strip(),
        "rating": r_num,
        "comment": comment.strip(),
        "location": str(body.get("location") or "India").strip(),
        "avatar": str(body.get("avatar") or "").strip(),
        "isVerified": bool(body.get("isVerified", True)),
        "status": body.get("status") or "approved",
        "createdAt": now,
        "updatedAt": now,
    }

    result = await reviews_col.insert_one(review_doc)
    review_doc["_id"] = result.inserted_id
    return serialize_doc(review_doc)

@router.put("/reviews/{id}")
async def admin_update_review(id: str, body: Dict[str, Any]):
    if not is_valid_object_id(id):
        raise HTTPException(status_code=404, detail={"msg": "Review not found"})

    rev = await reviews_col.find_one({"_id": to_object_id(id)})
    if not rev:
        raise HTTPException(status_code=404, detail={"msg": "Review not found"})

    updates: Dict[str, Any] = {}
    if "name" in body:
        updates["name"] = str(body["name"]).strip()
    if "rating" in body:
        try:
            updates["rating"] = int(body["rating"])
        except (ValueError, TypeError):
            pass
    if "comment" in body:
        updates["comment"] = str(body["comment"]).strip()
    if "location" in body:
        updates["location"] = str(body.get("location") or "").strip()
    if "avatar" in body:
        updates["avatar"] = str(body.get("avatar") or "").strip()
    if "isVerified" in body:
        updates["isVerified"] = bool(body["isVerified"])
    if "status" in body:
        updates["status"] = body["status"]

    updates["updatedAt"] = datetime.now(timezone.utc)

    await reviews_col.update_one({"_id": rev["_id"]}, {"$set": updates})
    updated = await reviews_col.find_one({"_id": rev["_id"]})
    return serialize_doc(updated)

@router.delete("/reviews/{id}")
async def admin_delete_review(id: str):
    if not is_valid_object_id(id):
        raise HTTPException(status_code=404, detail={"msg": "Review not found"})

    res = await reviews_col.delete_one({"_id": to_object_id(id)})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail={"msg": "Review not found"})

    return {"msg": "Review deleted successfully", "id": id}

# ═══════════════════════════════════════════════════════════
# 6. SUBSCRIBERS
# ═══════════════════════════════════════════════════════════

@router.get("/subscribers")
async def admin_list_subscribers():
    cursor = subscribers_col.find().sort("createdAt", DESCENDING).limit(1000)
    subs = await cursor.to_list(length=1000)
    return serialize_doc(subs)

@router.delete("/subscribers/{id}")
async def admin_delete_subscriber(id: str):
    if not is_valid_object_id(id):
        raise HTTPException(status_code=404, detail={"msg": "Not found"})

    res = await subscribers_col.delete_one({"_id": to_object_id(id)})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail={"msg": "Not found"})

    return {"msg": "Deleted"}

# ═══════════════════════════════════════════════════════════
# 7. STORE SETTINGS
# ═══════════════════════════════════════════════════════════

@router.get("/settings")
async def admin_get_settings():
    doc = await get_or_create_settings()
    return serialize_doc(doc)

@router.put("/settings")
async def admin_update_settings(body: Dict[str, Any]):
    await get_or_create_settings()

    allowed_keys = [
        "phone",
        "whatsapp",
        "email",
        "address",
        "businessHours",
        "instagramUrl",
        "facebookUrl",
        "youtubeUrl",
        "announcementText",
        "announcementActive",
        "freeShippingThreshold",
        "standardShippingFee",
        "heroTitle",
        "heroSubtitle",
        "heroBadgeText",
        "heroFeatures",
        "heroCtaText",
        "heroCtaLink",
        "heroSecondaryCtaText",
        "heroSecondaryCtaLink",
        "promoBanners",
        "petCategories",
        "featuredCollections",
        "habitatEssentials",
        "careGuides",
        "faqs",
        "aboutTagline",
        "aboutTitle",
        "aboutStory",
        "aboutMission",
        "aboutCards",
        "birdCategories",
        "accessoryCategories",
    ]

    updates = {k: body[k] for k in allowed_keys if k in body}
    updates["updatedAt"] = datetime.now(timezone.utc)

    await settings_col.update_one({"key": "store_settings"}, {"$set": updates})
    updated = await settings_col.find_one({"key": "store_settings"})
    return serialize_doc(updated)
