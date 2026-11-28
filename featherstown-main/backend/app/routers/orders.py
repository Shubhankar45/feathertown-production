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
from app.database import accessories_col, orders_col, notifications_col, customers_col, invoices_col, transactions_col
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

async def generate_order_number() -> str:
    now = datetime.now(timezone.utc)
    year = now.strftime("%Y")
    count = await orders_col.count_documents({}) + 1
    candidate = f"FT-ORD-{year}-{count:04d}"
    while await orders_col.find_one({"orderNumber": candidate}):
        count += 1
        candidate = f"FT-ORD-{year}-{count:04d}"
    return candidate

async def sync_customer_profile(customer: Dict[str, Any], order_amount: float) -> None:
    phone = str(customer.get("phone") or "").strip()
    email = str(customer.get("email") or "").strip().lower()
    if not phone and not email:
        return
    now = datetime.now(timezone.utc)
    query = []
    if phone:
        query.append({"phone": phone})
    if email:
        query.append({"email": email})
    existing = await customers_col.find_one({"$or": query}) if query else None
    if existing:
        await customers_col.update_one(
            {"_id": existing["_id"]},
            {
                "$inc": {"totalOrders": 1, "totalSpent": float(order_amount)},
                "$set": {
                    "name": customer.get("name") or existing.get("name"),
                    "address": customer.get("address") or existing.get("address"),
                    "city": customer.get("city") or existing.get("city"),
                    "state": customer.get("state") or existing.get("state"),
                    "pincode": customer.get("pincode") or existing.get("pincode"),
                    "updatedAt": now,
                },
            },
        )
    else:
        await customers_col.insert_one({
            "name": customer.get("name", "Customer"),
            "phone": phone,
            "email": email,
            "address": customer.get("address", ""),
            "city": customer.get("city", ""),
            "state": customer.get("state", ""),
            "pincode": customer.get("pincode", ""),
            "totalOrders": 1,
            "totalSpent": float(order_amount),
            "customerType": "regular",
            "createdAt": now,
            "updatedAt": now,
        })

async def sync_order_to_finance(
    order_id,
    order_num: str,
    customer: Dict[str, Any],
    items: List[Dict[str, Any]],
    amount: float,
    payment_method: str,
    payment_status: str,
    now: Optional[datetime] = None,
):
    """Auto creates Tax Invoice and Income Transaction for every store order."""
    if not now:
        now = datetime.now(timezone.utc)
    amt = float(amount or 0.0)
    p_status = str(payment_status or "").lower()
    p_method = str(payment_method or "COD").upper()
    is_paid = p_status in ["paid", "delivered"] or p_method != "COD"

    # Check Invoice
    existing_inv = await invoices_col.find_one({"$or": [{"orderId": order_id}, {"orderNumber": order_num}]})
    if not existing_inv:
        inv_items = []
        for it in items:
            inv_items.append({
                "name": it.get("name", "Store Item"),
                "category": it.get("category", "Accessories"),
                "price": float(it.get("price") or 0.0),
                "quantity": int(it.get("quantity") or 1),
                "total": float(it.get("price") or 0.0) * int(it.get("quantity") or 1),
                "itemType": "accessory",
            })
        inv_doc = {
            "invoiceNumber": f"FT-INV-{order_num}",
            "orderId": order_id,
            "orderNumber": order_num,
            "customer": customer,
            "items": inv_items,
            "subtotal": amt,
            "taxRate": 0.0,
            "taxAmount": 0.0,
            "discount": 0.0,
            "totalAmount": amt,
            "paidAmount": amt if is_paid else 0.0,
            "balanceDue": 0.0 if is_paid else amt,
            "paymentStatus": "paid" if is_paid else ("pending" if p_method == "COD" else "paid"),
            "paymentMethod": p_method,
            "status": "issued",
            "notes": f"Tax Invoice for website order #{order_num} via {p_method}",
            "terms": "Official FeatherTown Store Tax Invoice. All items verified.",
            "createdAt": now,
            "updatedAt": now,
        }
        await invoices_col.insert_one(inv_doc)

    # Check Transaction
    existing_txn = await transactions_col.find_one({"$or": [{"orderId": order_id}, {"reference": order_num}]})
    if not existing_txn:
        txn_doc = {
            "transactionId": f"TXN-{order_num}",
            "orderId": order_id,
            "type": "income",
            "category": "Store Sales",
            "amount": amt,
            "description": f"Website Order #{order_num} - {customer.get('name', 'Customer')}",
            "reference": order_num,
            "paymentMethod": p_method,
            "customerOrPayee": customer.get("name", "Customer"),
            "date": now,
            "createdAt": now,
            "updatedAt": now,
        }
        await transactions_col.insert_one(txn_doc)

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
            "category": accessory.get("category", "Accessories"),
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
        order_num = await generate_order_number()
        order_doc = {
            "orderNumber": order_num,
            "items": order_items,
            "amount": amount,
            "customer": customer,
            "paymentMethod": "razorpay",
            "razorpayOrderId": razorpay_order["id"],
            "paymentStatus": "created",
            "orderStatus": "pending",
            "tracking": {
                "courier": "Pending Allocation",
                "trackingNumber": "",
                "trackingUrl": "",
                "estimatedDelivery": "",
                "currentStatus": "Order Placed",
                "history": [
                    {
                        "status": "Order Placed",
                        "description": "Order received and initialized via FeatherTown Store",
                        "timestamp": now.isoformat(),
                        "location": "Sundargarh, Odisha",
                    }
                ],
            },
            "createdAt": now,
            "updatedAt": now,
        }
        if user and user.get("sub"):
            order_doc["user"] = to_object_id(user["sub"])

        result = await orders_col.insert_one(order_doc)

        return {
            "orderId": str(result.inserted_id),
            "orderNumber": order_num,
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
        tracking = order.get("tracking") or {
            "courier": "Pending Allocation",
            "trackingNumber": "",
            "trackingUrl": "",
            "estimatedDelivery": "",
            "currentStatus": "Confirmed",
            "history": [],
        }
        hist = tracking.get("history") or []
        hist.append({
            "status": "Payment Confirmed",
            "description": f"Online payment verified via Razorpay ({razorpay_payment_id})",
            "timestamp": now.isoformat(),
            "location": "Sundargarh, Odisha",
        })
        tracking["history"] = hist
        tracking["currentStatus"] = "Confirmed"

        await orders_col.update_one(
            {"_id": order["_id"]},
            {
                "$set": {
                    "paymentStatus": "paid",
                    "orderStatus": "confirmed",
                    "razorpayPaymentId": razorpay_payment_id,
                    "razorpaySignature": razorpay_signature,
                    "tracking": tracking,
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

        # Auto sync customer
        cust = order.get("customer") or {}
        await sync_customer_profile(cust, float(order.get("amount") or 0))

        # Auto sync to finance (Tax Invoice + Ledger Income Transaction)
        await sync_order_to_finance(
            order_id=order["_id"],
            order_num=order.get("orderNumber", str(order["_id"])),
            customer=cust,
            items=order.get("items", []),
            amount=float(order.get("amount") or 0),
            payment_method=order.get("paymentMethod") or "online",
            payment_status="paid",
            now=now,
        )

        # Notify mobile admin
        await notifications_col.insert_one({
            "title": f"Payment Verified #{order.get('orderNumber', str(order['_id'])[-6:].upper())}",
            "body": f"₹{float(order.get('amount') or 0):,.0f} paid via Razorpay by {cust.get('name', 'Customer')}",
            "category": "billing",
            "priority": "high",
            "data": {"orderId": str(order["_id"]), "type": "payment"},
            "isRead": False,
            "createdAt": now,
            "updatedAt": now,
        })

    return {"msg": "Payment verified", "orderId": str(order["_id"]), "orderNumber": order.get("orderNumber")}

@router.post("/cod", status_code=status.HTTP_201_CREATED, dependencies=[Depends(checkout_limiter)])
async def create_cod_order(
    body: Dict[str, Any],
    user: Optional[Dict[str, Any]] = Depends(get_optional_user),
):
    try:
        cart = await validate_and_price_cart(body)
        order_items = cart["orderItems"]
        amount = cart["amount"]
        customer = cart["customer"]

        now = datetime.now(timezone.utc)
        order_num = await generate_order_number()
        order_doc = {
            "orderNumber": order_num,
            "items": order_items,
            "amount": amount,
            "customer": customer,
            "paymentMethod": "cod",
            "paymentStatus": "cod",
            "orderStatus": "confirmed",
            "tracking": {
                "courier": "Pending Dispatch",
                "trackingNumber": "",
                "trackingUrl": "",
                "estimatedDelivery": "",
                "currentStatus": "Confirmed",
                "history": [
                    {
                        "status": "Order Placed",
                        "description": "Cash on Delivery order received and confirmed via FeatherTown Store",
                        "timestamp": now.isoformat(),
                        "location": "Sundargarh, Odisha",
                    }
                ],
            },
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

        # Auto sync customer
        await sync_customer_profile(customer, amount)

        # Auto sync to finance (Tax Invoice + Ledger Income Transaction)
        await sync_order_to_finance(
            order_id=result.inserted_id,
            order_num=order_num,
            customer=customer,
            items=order_items,
            amount=amount,
            payment_method="cod",
            payment_status="cod",
            now=now,
        )

        # Notify mobile admin
        await notifications_col.insert_one({
            "title": f"New COD Order #{order_num}",
            "body": f"{customer.get('name', 'Customer')} placed a Cash on Delivery order for ₹{float(amount):,.0f} ({len(order_items)} items)",
            "category": "orders",
            "priority": "high",
            "data": {"orderId": str(result.inserted_id), "type": "order"},
            "isRead": False,
            "createdAt": now,
            "updatedAt": now,
        })

        return {"orderId": str(result.inserted_id), "orderNumber": order_num}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Create COD order error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"msg": "Failed to place order"},
        )

@router.get("/track/{query}")
async def public_track_order(query: str):
    clean = query.strip()
    if not clean:
        raise HTTPException(status_code=400, detail={"msg": "Please provide an Order ID or Phone number"})

    filter_q = []
    if is_valid_object_id(clean):
        filter_q.append({"_id": to_object_id(clean)})
    filter_q.append({"orderNumber": clean.upper()})
    filter_q.append({"orderNumber": clean})
    filter_q.append({"orderId": clean})
    filter_q.append({"customer.phone": clean})
    filter_q.append({"customer.email": clean.lower()})

    orders = await orders_col.find({"$or": filter_q}).sort("createdAt", -1).limit(5).to_list(length=5)
    if not orders:
        raise HTTPException(
            status_code=404,
            detail={"msg": f"No orders found matching '{clean}'. Please check your Order ID or 10-digit Phone number."},
        )

    results = []
    for o in orders:
        tracking = o.get("tracking") or {
            "courier": "Pending Allocation",
            "trackingNumber": "",
            "trackingUrl": "",
            "estimatedDelivery": "",
            "currentStatus": "Order Confirmed" if o.get("orderStatus") == "confirmed" else "Processing",
            "history": [
                {
                    "status": "Order Placed",
                    "description": "Order received and confirmed",
                    "timestamp": str(o.get("createdAt")),
                    "location": "Sundargarh, Odisha",
                }
            ],
        }
        results.append({
            "id": str(o["_id"]),
            "orderNumber": o.get("orderNumber") or o.get("orderId") or f"FT-ORD-{(str(o['_id']))[-6:].upper()}",
            "orderStatus": o.get("orderStatus", "pending"),
            "paymentStatus": o.get("paymentStatus", "pending"),
            "paymentMethod": o.get("paymentMethod", "cod"),
            "amount": o.get("amount", 0),
            "createdAt": o.get("createdAt"),
            "customer": {
                "name": (o.get("customer") or {}).get("name", "Customer"),
                "city": (o.get("customer") or {}).get("city", ""),
                "state": (o.get("customer") or {}).get("state", ""),
            },
            "items": [
                {
                    "name": it.get("name", "Product"),
                    "quantity": it.get("quantity", 1),
                    "price": it.get("price", 0),
                    "image": it.get("image", ""),
                }
                for it in (o.get("items") or o.get("orderItems") or [])
            ],
            "tracking": tracking,
        })

    return serialize_doc(results)

@router.get("/mine")
async def my_orders(user: Dict[str, Any] = Depends(get_current_verified_user)):
    user_id = to_object_id(user["sub"])
    cursor = orders_col.find({"user": user_id}).sort("createdAt", -1).limit(200)
    orders = await cursor.to_list(length=200)
    return serialize_doc(orders)
