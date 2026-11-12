import re
import time
import hmac
import hashlib
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List
from fastapi import APIRouter, HTTPException, Depends, status
import razorpay

from app.config import (
    RAZORPAY_KEY_ID,
    RAZORPAY_KEY_SECRET,
    PAYMENTS_ENABLED,
)
from app.database import accessories_col, orders_col
from app.auth import get_optional_user, get_current_user, get_current_verified_user
from app.rate_limiter import checkout_limiter
from app.utils import is_valid_object_id, to_object_id, serialize_doc

router = APIRouter(prefix="/api/orders", tags=["Orders"])

# Initialize Razorpay client if configured
razorpay_client = None
if PAYMENTS_ENABLED:
    razorpay_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))
else:
    print("[WARNING] Razorpay disabled (RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET missing) - checkout will fall back to Cash on Delivery")

EMAIL_PATTERN = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")

def is_non_empty_str(v: Any, max_len: int = 500) -> bool:
    return isinstance(v, str) and 0 < len(v.strip()) <= max_len

async def validate_and_price_cart(body: Dict[str, Any]) -> Dict[str, Any]:
    items = body.get("items")
    customer = body.get("customer")

    if not isinstance(items, list) or len(items) == 0:
        raise HTTPException(status_code=400, detail={"msg": "Cart is empty"})
    if len(items) > 50:
        raise HTTPException(status_code=400, detail={"msg": "Too many items"})

    c = customer or {}
    required_fields = ["name", "email", "phone", "address", "city", "state", "pincode"]
    for field in required_fields:
        max_l = 400 if field == "address" else 120
        if not is_non_empty_str(c.get(field), max_l):
            raise HTTPException(status_code=400, detail={"msg": f"Please provide a valid {field}"})

    if not EMAIL_PATTERN.match(str(c.get("email", "")).strip()):
        raise HTTPException(status_code=400, detail={"msg": "Invalid email"})

    order_items: List[Dict[str, Any]] = []
    amount = 0

    for raw in items:
        if not isinstance(raw, dict):
            raise HTTPException(status_code=400, detail={"msg": "Invalid cart item"})

        item_id = raw.get("id")
        try:
            qty = int(raw.get("quantity"))
        except (ValueError, TypeError):
            raise HTTPException(status_code=400, detail={"msg": "Invalid cart item"})

        if not item_id or qty < 1 or qty > 99 or not is_valid_object_id(item_id):
            raise HTTPException(status_code=400, detail={"msg": "Invalid cart item"})

        accessory = await accessories_col.find_one({"_id": to_object_id(item_id), "isActive": True})
        if not accessory:
            raise HTTPException(status_code=400, detail={"msg": "An item in your cart is no longer available"})

        if accessory.get("stock", 0) < qty:
            raise HTTPException(status_code=400, detail={"msg": f"Only {accessory.get('stock', 0)} left of \"{accessory.get('name')}\""})

        images = accessory.get("images", [])
        image_url = images[0] if (isinstance(images, list) and len(images) > 0) else ""

        price = accessory.get("price", 0)
        order_items.append({
            "accessory": accessory["_id"],
            "name": accessory.get("name", ""),
            "price": price,
            "quantity": qty,
            "image": image_url,
        })
        amount += price * qty

    if amount <= 0:
        raise HTTPException(status_code=400, detail={"msg": "Invalid order amount"})

    return {
        "orderItems": order_items,
        "amount": amount,
        "customer": {
            "name": c["name"].strip(),
            "email": c["email"].strip().lower(),
            "phone": c["phone"].strip(),
            "address": c["address"].strip(),
            "city": c["city"].strip(),
            "state": c["state"].strip(),
            "pincode": c["pincode"].strip(),
        },
    }

@router.post("/create", status_code=status.HTTP_201_CREATED, dependencies=[Depends(checkout_limiter)])
async def create_razorpay_order(
    body: Dict[str, Any],
    user: Optional[Dict[str, Any]] = Depends(get_optional_user),
):
    if user and not user.get("emailVerified"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "msg": "Please verify your email address before placing an order.",
                "needsVerification": True,
                "email": user.get("email", ""),
            },
        )

    if not razorpay_client:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={"msg": "Online payment isn't set up yet — please use Cash on Delivery."},
        )

    try:
        cart = await validate_and_price_cart(body)
        order_items = cart["orderItems"]
        amount = cart["amount"]
        customer = cart["customer"]

        receipt_id = f"rcpt_{int(time.time() * 1000)}"
        razorpay_order = razorpay_client.order.create(data={
            "amount": int(round(amount * 100)),  # paise
            "currency": "INR",
            "receipt": receipt_id,
        })

        now = datetime.now(timezone.utc)
        order_doc = {
            "items": order_items,
            "amount": amount,
            "customer": customer,
            "paymentMethod": "razorpay",
            "razorpayOrderId": razorpay_order["id"],
            "paymentStatus": "created",
            "orderStatus": "pending",
            "createdAt": now,
            "updatedAt": now,
        }
        if user and user.get("sub"):
            order_doc["user"] = to_object_id(user["sub"])

        result = await orders_col.insert_one(order_doc)

        return {
            "orderId": str(result.inserted_id),
            "razorpayOrderId": razorpay_order["id"],
            "amount": razorpay_order["amount"],
            "currency": razorpay_order["currency"],
            "keyId": RAZORPAY_KEY_ID,
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Create Razorpay order error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"msg": "Failed to start checkout"},
        )

@router.post("/verify", dependencies=[Depends(checkout_limiter)])
async def verify_razorpay_payment(body: Dict[str, Any]):
    razorpay_order_id = body.get("razorpay_order_id")
    razorpay_payment_id = body.get("razorpay_payment_id")
    razorpay_signature = body.get("razorpay_signature")

    if not razorpay_order_id or not razorpay_payment_id or not razorpay_signature:
        raise HTTPException(status_code=400, detail={"msg": "Missing payment details"})

    order = await orders_col.find_one({"razorpayOrderId": razorpay_order_id})
    if not order:
        raise HTTPException(status_code=404, detail={"msg": "Order not found"})

    expected_signature = hmac.new(
        RAZORPAY_KEY_SECRET.encode("utf-8"),
        f"{razorpay_order_id}|{razorpay_payment_id}".encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()

    if expected_signature != razorpay_signature:
        await orders_col.update_one(
            {"_id": order["_id"]},
            {"$set": {"paymentStatus": "failed", "updatedAt": datetime.now(timezone.utc)}},
        )
        raise HTTPException(status_code=400, detail={"msg": "Payment verification failed"})

    if order.get("paymentStatus") != "paid":
        now = datetime.now(timezone.utc)
        await orders_col.update_one(
            {"_id": order["_id"]},
            {
                "$set": {
                    "paymentStatus": "paid",
                    "orderStatus": "confirmed",
                    "razorpayPaymentId": razorpay_payment_id,
                    "razorpaySignature": razorpay_signature,
                    "updatedAt": now,
                }
            },
        )

        # Decrement stock now that payment is confirmed
        for item in order.get("items", []):
            acc_id = item.get("accessory")
            qty = item.get("quantity", 0)
            if acc_id:
                await accessories_col.update_one(
                    {"_id": acc_id},
                    {"$inc": {"stock": -qty}},
                )

    return {"msg": "Payment verified", "orderId": str(order["_id"])}

@router.post("/cod", status_code=status.HTTP_201_CREATED, dependencies=[Depends(checkout_limiter)])
async def create_cod_order(
    body: Dict[str, Any],
    user: Optional[Dict[str, Any]] = Depends(get_optional_user),
):
    if user and not user.get("emailVerified"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "msg": "Please verify your email address before placing an order.",
                "needsVerification": True,
                "email": user.get("email", ""),
            },
        )

    try:
        cart = await validate_and_price_cart(body)
        order_items = cart["orderItems"]
        amount = cart["amount"]
        customer = cart["customer"]

        now = datetime.now(timezone.utc)
        order_doc = {
            "items": order_items,
            "amount": amount,
            "customer": customer,
            "paymentMethod": "cod",
            "paymentStatus": "cod",
            "orderStatus": "confirmed",
            "createdAt": now,
            "updatedAt": now,
        }
        if user and user.get("sub"):
            order_doc["user"] = to_object_id(user["sub"])

        result = await orders_col.insert_one(order_doc)

        # Decrement stock immediately
        for item in order_items:
            acc_id = item.get("accessory")
            qty = item.get("quantity", 0)
            if acc_id:
                await accessories_col.update_one(
                    {"_id": acc_id},
                    {"$inc": {"stock": -qty}},
                )

        return {"orderId": str(result.inserted_id)}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Create COD order error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"msg": "Failed to place order"},
        )

@router.get("/mine")
async def my_orders(user: Dict[str, Any] = Depends(get_current_verified_user)):
    user_id = to_object_id(user["sub"])
    cursor = orders_col.find({"user": user_id}).sort("createdAt", -1).limit(200)
    orders = await cursor.to_list(length=200)
    return serialize_doc(orders)
