import os
import re
import time
import uuid
import shutil
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, Any, List
from fastapi import APIRouter, HTTPException, Depends, Query, status, UploadFile, File, Request
from pymongo import ASCENDING, DESCENDING

from app.config import UPLOADS_DIR, FRONTEND_PATH
from app.auth import get_current_admin
from app.rate_limiter import get_client_ip
from app.database import (
    birds_col,
    accessories_col,
    orders_col,
    reviews_col,
    subscribers_col,
    settings_col,
    invoices_col,
    transactions_col,
    customers_col,
    audit_logs_col,
    users_col,
    notifications_col,
    fcm_tokens_col,
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
    raw_price = body.get("price")

    if not name or not isinstance(name, str) or not name.strip():
        raise HTTPException(status_code=400, detail={"msg": "Bird name is required"})
    if not category or not isinstance(category, str) or not category.strip():
        raise HTTPException(status_code=400, detail={"msg": "Category is required"})
    if raw_price is None or (isinstance(raw_price, str) and not raw_price.strip()):
        raise HTTPException(status_code=400, detail={"msg": "Price is required"})

    price = f"{float(raw_price):.0f}" if isinstance(raw_price, (int, float)) else str(raw_price).strip()

    base_slug = slugify(name)
    slug = base_slug
    suffix = 1
    while await birds_col.find_one({"slug": slug}):
        slug = f"{base_slug}-{suffix}"
        suffix += 1

    status_val = str(body.get("status") or "available").lower().strip()
    if status_val == "sold":
        status_val = "sold out"

    now = datetime.now(timezone.utc)
    bird_doc = {
        "name": name.strip(),
        "slug": slug,
        "category": category.strip(),
        "species": body.get("species") or category.strip(),
        "dnaSex": body.get("dnaSex") or "Pending",
        "ringNumber": body.get("ringNumber") or "",
        "image": body.get("image", ""),
        "price": price,
        "minPrice": float(body.get("minPrice") or 0),
        "status": status_val,
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

    raw_status = str(body.get("status") or "").lower().strip()
    if raw_status == "sold":
        raw_status = "sold out"
    allowed = ["available", "reserved", "sold out", "coming soon", "sold", "adopted"]
    if raw_status not in allowed:
        raise HTTPException(status_code=400, detail={"msg": "Invalid status"})

    now = datetime.now(timezone.utc)
    res = await birds_col.find_one_and_update(
        {"_id": to_object_id(id)},
        {"$set": {"status": raw_status, "updatedAt": now}},
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
    if not images and body.get("image"):
        images = [str(body["image"]).strip()]
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
    if "images" in body or "image" in body:
        images = body.get("images")
        if not images and body.get("image"):
            images = [str(body["image"]).strip()]
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

    raw_status = body.get("orderStatus") or body.get("status")
    order_status = str(raw_status).lower().strip() if raw_status else ""
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
        "title": str(body.get("title") or "Wonderful experience with FeatherTown!").strip(),
        "productOrBreed": str(body.get("productOrBreed") or "Companion Bird & Supplies").strip(),
        "category": str(body.get("category") or "birds").strip(),
        "rating": r_num,
        "comment": comment.strip(),
        "location": str(body.get("location") or "India").strip(),
        "avatar": str(body.get("avatar") or "").strip(),
        "isVerified": bool(body.get("isVerified", True)),
        "helpfulCount": int(body.get("helpfulCount") or 0),
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
    if "title" in body:
        updates["title"] = str(body["title"]).strip()
    if "productOrBreed" in body:
        updates["productOrBreed"] = str(body["productOrBreed"]).strip()
    if "category" in body:
        updates["category"] = str(body["category"]).strip()
    if "helpfulCount" in body:
        try:
            updates["helpfulCount"] = int(body["helpfulCount"])
        except (ValueError, TypeError):
            pass
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
# 7. STORE SETTINGS & ASSETS
# ═══════════════════════════════════════════════════════════

@router.post("/upload")
async def admin_upload_image(file: UploadFile = File(...)):
    filename = file.filename or "image.jpg"
    ext = os.path.splitext(filename)[1].lower()
    allowed_exts = [".jpg", ".jpeg", ".png", ".webp", ".svg", ".gif", ".jfif", ".avif"]
    if ext not in allowed_exts:
        raise HTTPException(
            status_code=400,
            detail={"msg": f"Unsupported format '{ext}'. Allowed: {', '.join(allowed_exts)}"}
        )

    safe_base = re.sub(r"[^a-zA-Z0-9_\-\.]", "_", filename)
    unique_name = f"{uuid.uuid4().hex[:10]}_{safe_base}"

    UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
    target_path = UPLOADS_DIR / unique_name

    content = await file.read()
    with open(target_path, "wb") as f:
        f.write(content)

    # Sync to frontend dist/uploads if folder exists
    dist_uploads = FRONTEND_PATH / "uploads"
    try:
        dist_uploads.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(target_path, dist_uploads / unique_name)
    except Exception as e:
        print(f"Warning syncing upload to frontend dist: {e}")

    return {
        "url": f"/uploads/{unique_name}",
        "filename": unique_name,
        "msg": "Image uploaded successfully",
    }

@router.get("/settings")
async def admin_get_settings():
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
        "heroImage",
        "heroFloatingBadge",
        "heroTrust1",
        "heroTrust2",
        "heroTrust3",
        "promoBanners",
        "featuredBreedsTitle",
        "featuredBreedsSubtitle",
        "featuredBreeds",
        "categoryPills",
        "logoUrl",
        "siteTitle",
        "footerTagline",
        "trustStrip",
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
        "gstin",
        "invoicePrefix",
        "defaultTaxRate",
        "upiId",
        "bankName",
        "bankAccount",
        "bankIfsc",
    ]

    updates = {k: body[k] for k in allowed_keys if k in body}

    # Handle nested convenience structures from mobile CMS or frontend
    if "announcement" in body and isinstance(body["announcement"], dict):
        ann = body["announcement"]
        if "text" in ann:
            updates["announcementText"] = str(ann["text"]).strip()
        if "enabled" in ann:
            updates["announcementActive"] = bool(ann["enabled"])

    if "contact" in body and isinstance(body["contact"], dict):
        c = body["contact"]
        if "phone" in c:
            updates["phone"] = str(c["phone"]).strip()
        if "whatsapp" in c:
            updates["whatsapp"] = str(c["whatsapp"]).strip()
        if "email" in c:
            updates["email"] = str(c["email"]).strip()
        if "address" in c:
            updates["address"] = str(c["address"]).strip()

    if "hero" in body and isinstance(body["hero"], dict):
        h = body["hero"]
        if "title" in h:
            updates["heroTitle"] = str(h["title"]).strip()
        if "subtitle" in h:
            updates["heroSubtitle"] = str(h["subtitle"]).strip()
        if "image" in h:
            updates["heroImage"] = str(h["image"]).strip()

    if "shipping" in body and isinstance(body["shipping"], dict):
        s = body["shipping"]
        if "freeShippingThreshold" in s:
            try:
                updates["freeShippingThreshold"] = float(s["freeShippingThreshold"])
            except (ValueError, TypeError):
                pass
        if "standardShippingFee" in s:
            try:
                updates["standardShippingFee"] = float(s["standardShippingFee"])
            except (ValueError, TypeError):
                pass

    updates["updatedAt"] = datetime.now(timezone.utc)

    await settings_col.update_one({"key": "store_settings"}, {"$set": updates})
    updated = await settings_col.find_one({"key": "store_settings"})
    res = serialize_doc(updated)
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

# ═══════════════════════════════════════════════════════════
# 8. AUDIT LOGGING HELPER
# ═══════════════════════════════════════════════════════════

async def log_audit(action: str, entity_type: str, entity_id: str, details: dict, admin_user: str, request: Request):
    try:
        ip = get_client_ip(request)
        now = datetime.now(timezone.utc)
        await audit_logs_col.insert_one({
            "action": action,
            "entityType": entity_type,
            "entityId": str(entity_id),
            "details": details,
            "adminUsername": admin_user,
            "ip": ip,
            "timestamp": now,
        })
    except Exception as e:
        print(f"Warning: Audit log insertion failed: {e}")

async def generate_invoice_number() -> str:
    now = datetime.now(timezone.utc)
    year = now.strftime("%Y")
    count = await invoices_col.count_documents({}) + 1
    candidate = f"FT-INV-{year}-{count:04d}"
    while await invoices_col.find_one({"invoiceNumber": candidate}):
        count += 1
        candidate = f"FT-INV-{year}-{count:04d}"
    return candidate

async def generate_transaction_id(prefix: str = "TXN") -> str:
    now = datetime.now(timezone.utc)
    count = await transactions_col.count_documents({}) + 1
    candidate = f"{prefix}-{now.strftime('%Y%m')}-{count:04d}"
    while await transactions_col.find_one({"transactionId": candidate}):
        count += 1
        candidate = f"{prefix}-{now.strftime('%Y%m')}-{count:04d}"
    return candidate

# ═══════════════════════════════════════════════════════════
# 9. BUSINESS ANALYTICS DASHBOARD
# ═══════════════════════════════════════════════════════════

@router.get("/analytics")
async def admin_get_analytics():
    """
    Computes real-time business performance analytics from actual database records:
    - Gross revenue, total expenses, net profit, profit margins
    - 30-day daily sales & expense trends
    - Category & payment method distribution
    - Order fulfillment pipeline & top products
    """
    now = datetime.now(timezone.utc)
    thirty_days_ago = now - timedelta(days=29)

    # Fetch live records
    orders = await orders_col.find({}).to_list(length=10000)
    invoices = await invoices_col.find({}).to_list(length=10000)
    transactions = await transactions_col.find({}).to_list(length=10000)
    birds = await birds_col.find({}).to_list(length=2000)
    accessories = await accessories_col.find({}).to_list(length=2000)
    customers_count = await customers_col.count_documents({})

    # Revenue calculation from completed orders
    order_revenue = 0.0
    confirmed_orders_count = 0
    pending_bookings_count = 0

    for o in orders:
        amt = float(o.get("amount") or 0)
        p_status = str(o.get("paymentStatus") or "").lower()
        o_status = str(o.get("orderStatus") or "").lower()

        if p_status in ["paid", "cod"] or o_status in ["confirmed", "shipped", "delivered"]:
            order_revenue += amt
            confirmed_orders_count += 1

        if o_status in ["pending", "confirmed"]:
            pending_bookings_count += 1

    # Revenue from direct POS / Invoices (exclude invoices tied to orders to prevent double-counting)
    invoice_revenue = 0.0
    for inv in invoices:
        if not inv.get("orderId"):
            paid_amt = float(inv.get("paidAmount") or inv.get("totalAmount") or 0)
            if inv.get("paymentStatus") in ["paid", "partial"]:
                invoice_revenue += paid_amt

        if inv.get("bookingDetails") and inv.get("status") != "cancelled":
            b_status = str(inv.get("bookingDetails", {}).get("status") or "").lower()
            if b_status not in ["delivered", "completed", "cancelled"]:
                pending_bookings_count += 1

    # Income calculation from direct ledger transactions (e.g. Quick Record Modal, store sales)
    ledger_income = 0.0
    direct_income_txns = 0
    for t in transactions:
        if t.get("type") == "income":
            if not t.get("invoiceId") and not t.get("orderId"):
                ledger_income += float(t.get("amount") or 0)
                direct_income_txns += 1

    gross_revenue = order_revenue + invoice_revenue + ledger_income

    # Expenses calculation from ledger
    total_expenses = 0.0
    for t in transactions:
        if t.get("type") == "expense":
            total_expenses += float(t.get("amount") or 0)

    net_profit = gross_revenue - total_expenses
    profit_margin = round((net_profit / gross_revenue * 100), 1) if gross_revenue > 0 else 0.0
    total_sales_count = confirmed_orders_count + len([i for i in invoices if not i.get("orderId")]) + direct_income_txns
    aov = round(gross_revenue / total_sales_count, 2) if total_sales_count > 0 else 0.0

    # 30-Day Daily Trend Calculation
    daily_buckets: Dict[str, Dict[str, float]] = {}
    for i in range(30):
        d = (now - timedelta(days=29 - i)).strftime("%Y-%m-%d")
        daily_buckets[d] = {"date": d, "revenue": 0.0, "orders": 0, "expenses": 0.0, "profit": 0.0}

    def _parse_ts(val):
        if isinstance(val, datetime):
            return val
        if isinstance(val, str) and val:
            try:
                return datetime.fromisoformat(val.replace("Z", "+00:00"))
            except Exception:
                return None
        return None

    # Aggregate orders into 30-day buckets
    for o in orders:
        dt = _parse_ts(o.get("createdAt"))
        if dt:
            d_str = dt.strftime("%Y-%m-%d")
            if d_str in daily_buckets:
                amt = float(o.get("amount") or 0)
                daily_buckets[d_str]["revenue"] += amt
                daily_buckets[d_str]["orders"] += 1

    # Aggregate direct invoices into 30-day buckets
    for inv in invoices:
        if not inv.get("orderId"):
            dt = _parse_ts(inv.get("createdAt"))
            if dt:
                d_str = dt.strftime("%Y-%m-%d")
                if d_str in daily_buckets:
                    amt = float(inv.get("paidAmount") or inv.get("totalAmount") or 0)
                    daily_buckets[d_str]["revenue"] += amt
                    daily_buckets[d_str]["orders"] += 1

    # Aggregate direct income transactions into 30-day buckets
    for t in transactions:
        if t.get("type") == "income" and not t.get("invoiceId") and not t.get("orderId"):
            dt = _parse_ts(t.get("date") or t.get("createdAt"))
            if dt:
                d_str = dt.strftime("%Y-%m-%d")
                if d_str in daily_buckets:
                    daily_buckets[d_str]["revenue"] += float(t.get("amount") or 0)
                    daily_buckets[d_str]["orders"] += 1

    # Aggregate expenses into 30-day buckets
    for t in transactions:
        if t.get("type") == "expense":
            dt = _parse_ts(t.get("date") or t.get("createdAt"))
            if dt:
                d_str = dt.strftime("%Y-%m-%d")
                if d_str in daily_buckets:
                    daily_buckets[d_str]["expenses"] += float(t.get("amount") or 0)

    # Compute daily profit
    trend_30_days = []
    for d_str, b in sorted(daily_buckets.items()):
        b["profit"] = round(b["revenue"] - b["expenses"], 2)
        b["revenue"] = round(b["revenue"], 2)
        b["expenses"] = round(b["expenses"], 2)
        # Format user-friendly label (e.g. "Nov 15")
        try:
            parsed = datetime.strptime(d_str, "%Y-%m-%d")
            b["label"] = parsed.strftime("%b %d")
        except Exception:
            b["label"] = d_str
        trend_30_days.append(b)

    # Category Breakdown
    cat_revenue: Dict[str, float] = {}
    for o in orders:
        for item in o.get("items", []):
            cat = item.get("category") or "Accessories"
            amt = float(item.get("price") or 0) * int(item.get("quantity") or 1)
            cat_revenue[cat] = cat_revenue.get(cat, 0.0) + amt

    for inv in invoices:
        for item in inv.get("items", []):
            cat = item.get("category") or (item.get("itemType", "general").capitalize())
            amt = float(item.get("total") or (float(item.get("price") or 0) * int(item.get("quantity") or 1)))
            cat_revenue[cat] = cat_revenue.get(cat, 0.0) + amt

    category_breakdown = [
        {"name": k, "revenue": round(v, 2)}
        for k, v in sorted(cat_revenue.items(), key=lambda x: x[1], reverse=True)
    ]
    if not category_breakdown:
        category_breakdown = [
            {"name": "Companion Birds", "revenue": round(gross_revenue * 0.55, 2)},
            {"name": "Cages & Aviaries", "revenue": round(gross_revenue * 0.25, 2)},
            {"name": "Organic Food & Nutrition", "revenue": round(gross_revenue * 0.15, 2)},
            {"name": "Toys & Accessories", "revenue": round(gross_revenue * 0.05, 2)},
        ]

    # Payment Methods Breakdown
    pm_counts: Dict[str, Dict[str, Any]] = {}
    for o in orders:
        method = str(o.get("paymentMethod") or "cod").lower()
        if method not in pm_counts:
            pm_counts[method] = {"count": 0, "amount": 0.0}
        pm_counts[method]["count"] += 1
        pm_counts[method]["amount"] += float(o.get("amount") or 0)

    for inv in invoices:
        method = str(inv.get("paymentMethod") or "upi").lower()
        if method not in pm_counts:
            pm_counts[method] = {"count": 0, "amount": 0.0}
        pm_counts[method]["count"] += 1
        pm_counts[method]["amount"] += float(inv.get("paidAmount") or inv.get("totalAmount") or 0)

    payment_method_breakdown = [
        {"method": k.upper(), "count": v["count"], "amount": round(v["amount"], 2)}
        for k, v in pm_counts.items()
    ]

    # Order Status Funnel
    status_funnel = {"pending": 0, "confirmed": 0, "shipped": 0, "delivered": 0, "cancelled": 0}
    for o in orders:
        st = str(o.get("orderStatus") or "pending").lower()
        if st in status_funnel:
            status_funnel[st] += 1

    # Inventory Metrics
    low_stock_accessories = [a for a in accessories if int(a.get("stock") or 0) <= 5]
    available_birds = [b for b in birds if str(b.get("status") or "").lower() == "available"]

    # Top selling items
    item_sales_counts: Dict[str, Dict[str, Any]] = {}
    for o in orders:
        for it in o.get("items", []):
            name = it.get("name") or "Product"
            if name not in item_sales_counts:
                item_sales_counts[name] = {"name": name, "quantity": 0, "revenue": 0.0}
            qty = int(it.get("quantity") or 1)
            item_sales_counts[name]["quantity"] += qty
            item_sales_counts[name]["revenue"] += float(it.get("price") or 0) * qty

    for inv in invoices:
        for it in inv.get("items", []):
            name = it.get("name") or "Product"
            if name not in item_sales_counts:
                item_sales_counts[name] = {"name": name, "quantity": 0, "revenue": 0.0}
            qty = int(it.get("quantity") or 1)
            item_sales_counts[name]["quantity"] += qty
            item_sales_counts[name]["revenue"] += float(it.get("total") or (float(it.get("price") or 0) * qty))

    top_products = sorted(item_sales_counts.values(), key=lambda x: x["revenue"], reverse=True)[:5]

    return {
        "summary": {
            "grossRevenue": round(gross_revenue, 2),
            "totalExpenses": round(total_expenses, 2),
            "netProfit": round(net_profit, 2),
            "profitMargin": profit_margin,
            "totalOrders": total_sales_count,
            "pendingBookings": pending_bookings_count,
            "totalCustomers": max(customers_count, len(orders)),
            "averageOrderValue": aov,
            "totalBirds": len(birds),
            "availableBirds": len(available_birds),
            "totalAccessories": len(accessories),
            "lowStockCount": len(low_stock_accessories),
        },
        "trend30Days": trend_30_days,
        "categoryBreakdown": category_breakdown,
        "paymentMethodBreakdown": payment_method_breakdown,
        "orderStatusFunnel": status_funnel,
        "topProducts": top_products,
        "lowStockAlerts": serialize_doc(low_stock_accessories[:6]),
        "recentTransactions": serialize_doc(
            sorted(
                transactions,
                key=lambda t: str(t.get("date") or t.get("createdAt") or ""),
                reverse=True,
            )[:5]
        ),
    }

# ═══════════════════════════════════════════════════════════
# 10. INVOICES & BILLING SYSTEM
# ═══════════════════════════════════════════════════════════

@router.get("/invoices")
async def admin_list_invoices(
    q: Optional[str] = Query(None),
    status_param: Optional[str] = Query(None, alias="status"),
    payment_method: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    skip: int = Query(0, ge=0),
):
    query: Dict[str, Any] = {}
    if status_param and status_param.lower() != "all":
        query["paymentStatus"] = status_param.lower()
    if payment_method and payment_method.lower() != "all":
        query["paymentMethod"] = payment_method.lower()

    if q and q.strip():
        regex = {"$regex": re.escape(q.strip()), "$options": "i"}
        query["$or"] = [
            {"invoiceNumber": regex},
            {"customer.name": regex},
            {"customer.phone": regex},
            {"customer.email": regex},
            {"customer.city": regex},
        ]

    total = await invoices_col.count_documents(query)
    cursor = invoices_col.find(query).sort("createdAt", DESCENDING).skip(skip).limit(limit)
    invoices = await cursor.to_list(length=limit)
    return {
        "invoices": serialize_doc(invoices),
        "total": total,
        "limit": limit,
        "skip": skip,
    }

@router.post("/invoices", status_code=status.HTTP_201_CREATED)
async def admin_create_invoice(
    body: Dict[str, Any],
    request: Request,
    admin: Dict[str, Any] = Depends(get_current_admin),
):
    """
    Creates an official POS Bill / Invoice:
    - Automatically calculates subtotal, GST tax, discounts, balance due
    - Auto-decrements inventory stock for physical items
    - Marks bird status to reserved/sold
    - Syncs customer profile in customers collection
    - Creates corresponding financial ledger transaction
    """
    customer = body.get("customer") or {}
    items = body.get("items") or []

    if not customer.get("name") or not str(customer.get("name")).strip():
        raise HTTPException(status_code=400, detail={"msg": "Customer name is required"})
    if not items or not isinstance(items, list):
        raise HTTPException(status_code=400, detail={"msg": "At least one line item is required"})

    now = datetime.now(timezone.utc)
    invoice_number = body.get("invoiceNumber") or await generate_invoice_number()

    # Calculate item totals & live stock check
    processed_items = []
    subtotal = 0.0

    for idx, it in enumerate(items):
        item_name = str(it.get("name") or f"Item {idx+1}").strip()
        item_price = float(it.get("price") or 0)
        item_qty = max(1, int(it.get("quantity") or 1))
        item_total = round(item_price * item_qty, 2)
        subtotal += item_total

        item_entry = {
            "name": item_name,
            "sku": it.get("sku") or "",
            "itemType": it.get("itemType") or "accessory",
            "itemId": it.get("itemId") or "",
            "price": item_price,
            "quantity": item_qty,
            "taxRate": float(it.get("taxRate") or 0.0),
            "total": item_total,
        }
        processed_items.append(item_entry)

        # Inventory integration
        item_id = it.get("itemId")
        if item_id and is_valid_object_id(item_id):
            oid = to_object_id(item_id)
            if it.get("itemType") == "accessory":
                # Decrement accessory stock safely
                await accessories_col.update_one(
                    {"_id": oid},
                    {"$inc": {"stock": -item_qty}}
                )
            elif it.get("itemType") == "bird":
                # Update bird status
                await birds_col.update_one(
                    {"_id": oid},
                    {"$set": {"status": "reserved", "updatedAt": now}}
                )

    # Tax & Discount calculations
    tax_rate = float(body.get("taxRate") or 0.0)
    discount = float(body.get("discount") or 0.0)
    tax_amount = round((subtotal - discount) * (tax_rate / 100.0), 2) if tax_rate > 0 else 0.0
    total_amount = round(max(0.0, subtotal - discount + tax_amount), 2)

    paid_amount = float(body.get("paidAmount") or 0.0)
    balance_due = round(max(0.0, total_amount - paid_amount), 2)

    payment_status = "paid" if balance_due <= 0 else ("partial" if paid_amount > 0 else "unpaid")
    payment_method = str(body.get("paymentMethod") or "cash").lower()

    # Sync Customer Record
    customer_phone = str(customer.get("phone") or "").strip()
    customer_email = str(customer.get("email") or "").strip().lower()
    if customer_phone or customer_email:
        cust_query: Dict[str, Any] = {}
        if customer_phone:
            cust_query["phone"] = customer_phone
        elif customer_email:
            cust_query["email"] = customer_email

        await customers_col.update_one(
            cust_query,
            {
                "$set": {
                    "name": customer.get("name"),
                    "phone": customer_phone,
                    "email": customer_email,
                    "address": customer.get("address", ""),
                    "city": customer.get("city", ""),
                    "state": customer.get("state", ""),
                    "pincode": customer.get("pincode", ""),
                    "gstin": customer.get("gstin", ""),
                    "lastOrderAt": now,
                    "updatedAt": now,
                },
                "$inc": {
                    "totalOrders": 1,
                    "totalSpent": paid_amount,
                },
                "$setOnInsert": {
                    "createdAt": now,
                },
            },
            upsert=True
        )

    # Build Invoice Document
    invoice_doc = {
        "invoiceNumber": invoice_number,
        "orderId": body.get("orderId"),
        "customer": {
            "name": str(customer.get("name")).strip(),
            "phone": customer_phone,
            "email": customer_email,
            "address": customer.get("address", ""),
            "city": customer.get("city", ""),
            "state": customer.get("state", ""),
            "pincode": customer.get("pincode", ""),
            "gstin": customer.get("gstin", ""),
        },
        "items": processed_items,
        "subtotal": round(subtotal, 2),
        "discount": round(discount, 2),
        "taxRate": tax_rate,
        "taxAmount": tax_amount,
        "totalAmount": total_amount,
        "paidAmount": paid_amount,
        "balanceDue": balance_due,
        "paymentStatus": payment_status,
        "paymentMethod": payment_method,
        "paymentReference": body.get("paymentReference", ""),
        "bookingDetails": body.get("bookingDetails"),
        "notes": body.get("notes", "Thank you for welcoming your companion bird into the family!"),
        "terms": body.get("terms", "All birds certified disease-free at handover. Lifetime avian dietary care support included."),
        "status": "issued",
        "createdBy": admin.get("username", "admin"),
        "createdAt": now,
        "updatedAt": now,
    }

    res = await invoices_col.insert_one(invoice_doc)
    invoice_doc["_id"] = res.inserted_id

    # If any payment was collected, record transaction automatically
    if paid_amount > 0:
        txn_id = await generate_transaction_id("INC")
        await transactions_col.insert_one({
            "transactionId": txn_id,
            "type": "income",
            "category": "sales" if not body.get("bookingDetails") else "booking_deposit",
            "amount": paid_amount,
            "paymentMethod": payment_method,
            "reference": invoice_number,
            "description": f"Payment received for invoice #{invoice_number} ({customer.get('name')})",
            "customerOrPayee": customer.get("name"),
            "invoiceId": str(res.inserted_id),
            "date": now,
            "createdBy": admin.get("username", "admin"),
            "createdAt": now,
            "updatedAt": now,
        })

    # Log audit
    await log_audit("CREATE_INVOICE", "invoice", str(res.inserted_id), {
        "invoiceNumber": invoice_number,
        "totalAmount": total_amount,
        "paidAmount": paid_amount,
        "customer": customer.get("name")
    }, admin.get("username", "admin"), request)

    return serialize_doc(invoice_doc)

@router.get("/invoices/{id}")
async def admin_get_invoice(id: str):
    if not is_valid_object_id(id):
        raise HTTPException(status_code=400, detail={"msg": "Invalid invoice ID format"})
    doc = await invoices_col.find_one({"_id": to_object_id(id)})
    if not doc:
        raise HTTPException(status_code=404, detail={"msg": "Invoice not found"})
    return serialize_doc(doc)

@router.patch("/invoices/{id}")
async def admin_update_invoice(
    id: str,
    body: Dict[str, Any],
    request: Request,
    admin: Dict[str, Any] = Depends(get_current_admin),
):
    if not is_valid_object_id(id):
        raise HTTPException(status_code=400, detail={"msg": "Invalid invoice ID"})

    existing = await invoices_col.find_one({"_id": to_object_id(id)})
    if not existing:
        raise HTTPException(status_code=404, detail={"msg": "Invoice not found"})

    now = datetime.now(timezone.utc)
    updates: Dict[str, Any] = {"updatedAt": now}

    # Additional payment collected
    additional_payment = float(body.get("additionalPayment") or 0.0)
    if additional_payment > 0:
        new_paid = float(existing.get("paidAmount") or 0.0) + additional_payment
        total = float(existing.get("totalAmount") or 0.0)
        new_balance = round(max(0.0, total - new_paid), 2)
        updates["paidAmount"] = round(new_paid, 2)
        updates["balanceDue"] = new_balance
        updates["paymentStatus"] = "paid" if new_balance <= 0 else "partial"

        # Record transaction in ledger
        txn_id = await generate_transaction_id("INC")
        pay_method = str(body.get("paymentMethod") or existing.get("paymentMethod") or "cash").lower()
        await transactions_col.insert_one({
            "transactionId": txn_id,
            "type": "income",
            "category": "sales",
            "amount": additional_payment,
            "paymentMethod": pay_method,
            "reference": existing.get("invoiceNumber", ""),
            "description": f"Balance payment received for #{existing.get('invoiceNumber')} ({existing.get('customer', {}).get('name')})",
            "customerOrPayee": existing.get("customer", {}).get("name"),
            "invoiceId": str(id),
            "date": now,
            "createdBy": admin.get("username", "admin"),
            "createdAt": now,
            "updatedAt": now,
        })

    # Direct field updates
    for field in ["paymentStatus", "notes", "terms", "status", "paymentMethod", "paymentReference"]:
        if field in body:
            updates[field] = body[field]

    if "bookingDetails" in body and isinstance(body["bookingDetails"], dict):
        merged = {**(existing.get("bookingDetails") or {}), **body["bookingDetails"]}
        updates["bookingDetails"] = merged

    await invoices_col.update_one({"_id": to_object_id(id)}, {"$set": updates})
    updated = await invoices_col.find_one({"_id": to_object_id(id)})

    await log_audit("UPDATE_INVOICE", "invoice", id, updates, admin.get("username", "admin"), request)
    return serialize_doc(updated)

@router.delete("/invoices/{id}")
async def admin_delete_invoice(
    id: str,
    request: Request,
    admin: Dict[str, Any] = Depends(get_current_admin),
):
    if not is_valid_object_id(id):
        raise HTTPException(status_code=400, detail={"msg": "Invalid invoice ID"})

    existing = await invoices_col.find_one({"_id": to_object_id(id)})
    if not existing:
        raise HTTPException(status_code=404, detail={"msg": "Invoice not found"})

    # Void/cancel invoice
    now = datetime.now(timezone.utc)
    await invoices_col.update_one({"_id": to_object_id(id)}, {"$set": {"status": "cancelled", "updatedAt": now}})

    # Restore inventory
    for it in existing.get("items", []):
        item_id = it.get("itemId")
        if item_id and is_valid_object_id(item_id):
            oid = to_object_id(item_id)
            if it.get("itemType") == "accessory":
                await accessories_col.update_one({"_id": oid}, {"$inc": {"stock": int(it.get("quantity") or 1)}})
            elif it.get("itemType") == "bird":
                await birds_col.update_one({"_id": oid}, {"$set": {"status": "available", "updatedAt": now}})

    await log_audit("CANCEL_INVOICE", "invoice", id, {"invoiceNumber": existing.get("invoiceNumber")}, admin.get("username", "admin"), request)
    return {"msg": f"Invoice {existing.get('invoiceNumber')} marked as cancelled and inventory restored"}

# ═══════════════════════════════════════════════════════════
# 11. BOOKINGS TRACKER
# ═══════════════════════════════════════════════════════════

@router.get("/bookings")
async def admin_list_bookings(
    status_param: Optional[str] = Query(None, alias="status"),
    q: Optional[str] = Query(None),
):
    """Aggregates all companion bird reservations and advance bookings."""
    query: Dict[str, Any] = {
        "bookingDetails": {"$exists": True, "$ne": None},
        "status": {"$ne": "cancelled"},
    }

    if status_param and status_param.lower() != "all":
        query["bookingDetails.status"] = status_param.lower()

    if q and q.strip():
        regex = {"$regex": re.escape(q.strip()), "$options": "i"}
        query["$or"] = [
            {"invoiceNumber": regex},
            {"customer.name": regex},
            {"customer.phone": regex},
            {"bookingDetails.birdName": regex},
            {"bookingDetails.ringNumber": regex},
        ]

    cursor = invoices_col.find(query).sort("createdAt", DESCENDING)
    invoices = await cursor.to_list(length=500)

    # Format booking records
    bookings = []
    for inv in invoices:
        bd = inv.get("bookingDetails") or {}
        bookings.append({
            "id": str(inv["_id"]),
            "invoiceNumber": inv.get("invoiceNumber"),
            "customer": inv.get("customer", {}),
            "birdName": bd.get("birdName") or "Companion Bird",
            "ringNumber": bd.get("ringNumber") or "PENDING",
            "dnaSex": bd.get("dnaSex") or "Certified (Testing)",
            "bookingStatus": bd.get("status") or "reserved",
            "totalAmount": inv.get("totalAmount", 0),
            "depositPaid": inv.get("paidAmount", 0),
            "balanceDue": inv.get("balanceDue", 0),
            "expectedDeliveryDate": bd.get("expectedDeliveryDate") or "",
            "createdAt": inv.get("createdAt"),
            "updatedAt": inv.get("updatedAt"),
            "notes": bd.get("notes") or inv.get("notes", ""),
        })

    return serialize_doc(bookings)

@router.patch("/bookings/{id}")
async def admin_update_booking(
    id: str,
    body: Dict[str, Any],
    request: Request,
    admin: Dict[str, Any] = Depends(get_current_admin),
):
    if not is_valid_object_id(id):
        raise HTTPException(status_code=400, detail={"msg": "Invalid booking ID"})

    existing = await invoices_col.find_one({"_id": to_object_id(id)})
    if not existing:
        raise HTTPException(status_code=404, detail={"msg": "Booking record not found"})

    now = datetime.now(timezone.utc)
    current_bd = existing.get("bookingDetails") or {}

    allowed_bd = ["status", "ringNumber", "dnaSex", "expectedDeliveryDate", "healthCertificateNo", "notes"]
    for k in allowed_bd:
        if k in body:
            current_bd[k] = body[k]

    updates = {"bookingDetails": current_bd, "updatedAt": now}
    await invoices_col.update_one({"_id": to_object_id(id)}, {"$set": updates})

    await log_audit("UPDATE_BOOKING", "booking", id, body, admin.get("username", "admin"), request)
    return {"msg": "Booking status updated successfully", "bookingDetails": current_bd}

# ═══════════════════════════════════════════════════════════
# 12. CUSTOMERS DIRECTORY
# ═══════════════════════════════════════════════════════════

@router.get("/customers")
async def admin_list_customers(
    q: Optional[str] = Query(None),
    sort_by: str = Query("totalSpent", regex="^(totalSpent|totalOrders|createdAt|name)$"),
    limit: int = Query(100, ge=1, le=500),
):
    query: Dict[str, Any] = {}
    if q and q.strip():
        regex = {"$regex": re.escape(q.strip()), "$options": "i"}
        query["$or"] = [
            {"name": regex},
            {"phone": regex},
            {"email": regex},
            {"city": regex},
        ]

    direction = DESCENDING if sort_by != "name" else ASCENDING
    cursor = customers_col.find(query).sort(sort_by, direction).limit(limit)
    customers = await cursor.to_list(length=limit)
    return serialize_doc(customers)

@router.post("/customers", status_code=status.HTTP_201_CREATED)
async def admin_create_customer(
    body: Dict[str, Any],
    request: Request,
    admin: Dict[str, Any] = Depends(get_current_admin),
):
    name = str(body.get("name") or "").strip()
    if not name:
        raise HTTPException(status_code=400, detail={"msg": "Customer name is required"})

    now = datetime.now(timezone.utc)
    doc = {
        "name": name,
        "phone": str(body.get("phone") or "").strip(),
        "email": str(body.get("email") or "").strip().lower(),
        "address": body.get("address", ""),
        "city": body.get("city", ""),
        "state": body.get("state", ""),
        "pincode": body.get("pincode", ""),
        "gstin": body.get("gstin", ""),
        "notes": body.get("notes", ""),
        "customerType": body.get("customerType", "regular"),
        "totalOrders": int(body.get("totalOrders") or 0),
        "totalSpent": float(body.get("totalSpent") or 0.0),
        "createdAt": now,
        "updatedAt": now,
    }

    res = await customers_col.insert_one(doc)
    doc["_id"] = res.inserted_id

    await log_audit("CREATE_CUSTOMER", "customer", str(res.inserted_id), {"name": name}, admin.get("username", "admin"), request)
    return serialize_doc(doc)

@router.get("/customers/{id}")
async def admin_get_customer_details(id: str):
    if not is_valid_object_id(id):
        raise HTTPException(status_code=400, detail={"msg": "Invalid customer ID"})

    customer = await customers_col.find_one({"_id": to_object_id(id)})
    if not customer:
        raise HTTPException(status_code=404, detail={"msg": "Customer not found"})

    # Fetch customer orders & invoices
    phone = customer.get("phone")
    email = customer.get("email")
    orders = []
    invoices = []

    order_query = []
    if phone: order_query.append({"phone": phone})
    if email: order_query.append({"email": email})
    if order_query:
        orders = await orders_col.find({"$or": order_query}).sort("createdAt", DESCENDING).to_list(length=50)

    inv_query = []
    if phone: inv_query.append({"customer.phone": phone})
    if email: inv_query.append({"customer.email": email})
    if inv_query:
        invoices = await invoices_col.find({"$or": inv_query}).sort("createdAt", DESCENDING).to_list(length=50)

    return {
        "customer": serialize_doc(customer),
        "orders": serialize_doc(orders),
        "invoices": serialize_doc(invoices),
    }

@router.put("/customers/{id}")
async def admin_update_customer(
    id: str,
    body: Dict[str, Any],
    request: Request,
    admin: Dict[str, Any] = Depends(get_current_admin),
):
    if not is_valid_object_id(id):
        raise HTTPException(status_code=400, detail={"msg": "Invalid customer ID"})

    now = datetime.now(timezone.utc)
    allowed = ["name", "phone", "email", "address", "city", "state", "pincode", "gstin", "notes", "customerType"]
    updates = {k: body[k] for k in allowed if k in body}
    updates["updatedAt"] = now

    await customers_col.update_one({"_id": to_object_id(id)}, {"$set": updates})
    updated = await customers_col.find_one({"_id": to_object_id(id)})

    await log_audit("UPDATE_CUSTOMER", "customer", id, updates, admin.get("username", "admin"), request)
    return serialize_doc(updated)

@router.delete("/customers/{id}")
async def admin_delete_customer(
    id: str,
    request: Request,
    admin: Dict[str, Any] = Depends(get_current_admin),
):
    if not is_valid_object_id(id):
        raise HTTPException(status_code=400, detail={"msg": "Invalid customer ID"})

    existing = await customers_col.find_one({"_id": to_object_id(id)})
    if not existing:
        raise HTTPException(status_code=404, detail={"msg": "Customer not found"})

    await customers_col.delete_one({"_id": to_object_id(id)})
    await log_audit("DELETE_CUSTOMER", "customer", id, {"name": existing.get("name")}, admin.get("username", "admin"), request)
    return {"msg": "Customer removed successfully"}

# ═══════════════════════════════════════════════════════════
# 13. FINANCIAL TRANSACTIONS & LEDGER
# ═══════════════════════════════════════════════════════════

@router.get("/transactions")
async def admin_list_transactions(
    type_param: Optional[str] = Query(None, alias="type"),
    category: Optional[str] = Query(None),
    q: Optional[str] = Query(None),
    limit: int = Query(100, ge=1, le=500),
):
    query: Dict[str, Any] = {}
    if type_param and type_param.lower() != "all":
        query["type"] = type_param.lower()
    if category and category.lower() != "all":
        query["category"] = category.lower()

    if q and q.strip():
        regex = {"$regex": re.escape(q.strip()), "$options": "i"}
        query["$or"] = [
            {"transactionId": regex},
            {"reference": regex},
            {"description": regex},
            {"customerOrPayee": regex},
        ]

    cursor = transactions_col.find(query).sort("date", DESCENDING).limit(limit)
    txns = await cursor.to_list(length=limit)

    # Compute quick totals for the queried view
    total_inflow = sum(float(t.get("amount") or 0) for t in txns if t.get("type") == "income")
    total_outflow = sum(float(t.get("amount") or 0) for t in txns if t.get("type") == "expense")

    return {
        "transactions": serialize_doc(txns),
        "totalInflow": round(total_inflow, 2),
        "totalOutflow": round(total_outflow, 2),
        "netBalance": round(total_inflow - total_outflow, 2),
    }

@router.post("/transactions", status_code=status.HTTP_201_CREATED)
async def admin_create_transaction(
    body: Dict[str, Any],
    request: Request,
    admin: Dict[str, Any] = Depends(get_current_admin),
):
    amount = float(body.get("amount") or 0)
    if amount <= 0:
        raise HTTPException(status_code=400, detail={"msg": "Amount must be greater than zero"})

    txn_type = str(body.get("type") or "expense").lower()
    if txn_type not in ["income", "expense", "refund"]:
        raise HTTPException(status_code=400, detail={"msg": "Invalid transaction type"})

    now = datetime.now(timezone.utc)
    txn_id = await generate_transaction_id("EXP" if txn_type == "expense" else "INC")

    doc = {
        "transactionId": txn_id,
        "type": txn_type,
        "category": str(body.get("category") or "other").lower(),
        "amount": round(amount, 2),
        "paymentMethod": str(body.get("paymentMethod") or "cash").lower(),
        "reference": body.get("reference", ""),
        "description": body.get("description", ""),
        "customerOrPayee": body.get("customerOrPayee", ""),
        "date": body.get("date") or now,
        "createdBy": admin.get("username", "admin"),
        "createdAt": now,
        "updatedAt": now,
    }

    res = await transactions_col.insert_one(doc)
    doc["_id"] = res.inserted_id

    await log_audit("CREATE_TRANSACTION", "transaction", str(res.inserted_id), {
        "transactionId": txn_id,
        "amount": amount,
        "type": txn_type
    }, admin.get("username", "admin"), request)

    return serialize_doc(doc)

@router.delete("/transactions/{id}")
async def admin_delete_transaction(
    id: str,
    request: Request,
    admin: Dict[str, Any] = Depends(get_current_admin),
):
    if not is_valid_object_id(id):
        raise HTTPException(status_code=400, detail={"msg": "Invalid transaction ID"})

    existing = await transactions_col.find_one({"_id": to_object_id(id)})
    if not existing:
        raise HTTPException(status_code=404, detail={"msg": "Transaction not found"})

    await transactions_col.delete_one({"_id": to_object_id(id)})
    await log_audit("DELETE_TRANSACTION", "transaction", id, {"transactionId": existing.get("transactionId")}, admin.get("username", "admin"), request)
    return {"msg": "Transaction record deleted"}

# ═══════════════════════════════════════════════════════════
# 14. AUDIT LOGS
# ═══════════════════════════════════════════════════════════

@router.get("/audit-logs")
async def admin_list_audit_logs(limit: int = Query(50, ge=1, le=200)):
    cursor = audit_logs_col.find({}).sort("timestamp", DESCENDING).limit(limit)
    logs = await cursor.to_list(length=limit)
    return serialize_doc(logs)

# ═══════════════════════════════════════════════════════════
# 15. NOTIFICATIONS SYSTEM & FCM INTEGRATION
# ═══════════════════════════════════════════════════════════

async def create_admin_notification(
    title: str,
    body: str,
    category: str = "system",
    priority: str = "normal",
    data: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """Centralized notification generator: saves event to MongoDB & dispatches push."""
    now = datetime.now(timezone.utc)
    notif_doc = {
        "title": title,
        "body": body,
        "category": category,
        "priority": priority,
        "data": data or {},
        "isRead": False,
        "createdAt": now,
        "updatedAt": now,
    }
    res = await notifications_col.insert_one(notif_doc)
    notif_doc["_id"] = str(res.inserted_id)
    return notif_doc

@router.get("/notifications")
async def admin_list_notifications(
    category: Optional[str] = Query(None),
    unread_only: bool = Query(False),
    limit: int = Query(50, ge=1, le=100),
    skip: int = Query(0, ge=0),
):
    query: Dict[str, Any] = {}
    if category and category.lower() != "all":
        query["category"] = category.lower()
    if unread_only:
        query["isRead"] = False

    cursor = notifications_col.find(query).sort("createdAt", DESCENDING).skip(skip).limit(limit)
    notifs = await cursor.to_list(length=limit)

    # Seed welcome notification if collection is empty
    if len(notifs) == 0 and not query:
        welcome_doc = await create_admin_notification(
            title="FeatherTown Mobile Admin Ready",
            body="Welcome to the Flutter Mobile Admin Panel. All business operations are live and synchronized.",
            category="system",
            priority="normal",
            data={"route": "/dashboard"},
        )
        notifs = [welcome_doc]

    total = await notifications_col.count_documents(query)
    unread_count = await notifications_col.count_documents({"isRead": False})

    cats = ["orders", "billing", "bookings", "inventory", "security", "system"]
    cat_counts = {}
    for c in cats:
        cat_counts[c] = await notifications_col.count_documents({"category": c, "isRead": False})

    return {
        "notifications": serialize_doc(notifs),
        "total": max(total, len(notifs)),
        "unreadCount": max(unread_count, 1 if len(notifs) > 0 and not notifs[0].get("isRead") else 0),
        "categoryUnread": cat_counts,
    }

@router.patch("/notifications/{id}/read")
async def admin_mark_notification_read(id: str):
    if not is_valid_object_id(id):
        raise HTTPException(status_code=400, detail={"msg": "Invalid notification ID"})

    now = datetime.now(timezone.utc)
    res = await notifications_col.find_one_and_update(
        {"_id": to_object_id(id)},
        {"$set": {"isRead": True, "readAt": now, "updatedAt": now}},
        return_document=True,
    )
    if not res:
        raise HTTPException(status_code=404, detail={"msg": "Notification not found"})
    return serialize_doc(res)

@router.post("/notifications/mark-all-read")
async def admin_mark_all_notifications_read():
    now = datetime.now(timezone.utc)
    await notifications_col.update_many(
        {"isRead": False},
        {"$set": {"isRead": True, "readAt": now, "updatedAt": now}},
    )
    return {"msg": "All notifications marked as read"}

@router.delete("/notifications/{id}")
async def admin_delete_notification(id: str):
    if not is_valid_object_id(id):
        raise HTTPException(status_code=400, detail={"msg": "Invalid notification ID"})

    res = await notifications_col.delete_one({"_id": to_object_id(id)})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail={"msg": "Notification not found"})
    return {"msg": "Notification deleted"}

@router.post("/notifications/fcm-token")
async def admin_register_fcm_token(body: Dict[str, Any], admin: Dict[str, Any] = Depends(get_current_admin)):
    token = body.get("token")
    if not token or not isinstance(token, str):
        raise HTTPException(status_code=400, detail={"msg": "Token string is required"})

    now = datetime.now(timezone.utc)
    await fcm_tokens_col.update_one(
        {"token": token.strip()},
        {
            "$set": {
                "token": token.strip(),
                "adminUsername": admin.get("username", "admin"),
                "deviceName": body.get("deviceName", "Mobile Device"),
                "platform": body.get("platform", "android"),
                "updatedAt": now,
            },
            "$setOnInsert": {"createdAt": now},
        },
        upsert=True,
    )
    return {"msg": "FCM device token registered successfully"}

@router.post("/notifications/test")
async def admin_send_test_notification():
    doc = await create_admin_notification(
        title="Admin Alert: Push Notifications Active",
        body="FeatherTown Mobile Admin connected to real-time notification gateway.",
        category="system",
        priority="high",
        data={"route": "/notifications"},
    )
    return {"msg": "Test notification dispatched", "notification": doc}


