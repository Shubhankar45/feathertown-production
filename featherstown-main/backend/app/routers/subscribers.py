import re
from datetime import datetime, timezone
from typing import Dict, Any
from fastapi import APIRouter, HTTPException, BackgroundTasks, Depends, status

from app.database import subscribers_col
from app.rate_limiter import subscribe_limiter
from app.mailer import send_welcome_email

router = APIRouter(prefix="/api/subscribe", tags=["Subscribers"])

EMAIL_PATTERN = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")

@router.post("", dependencies=[Depends(subscribe_limiter)])
@router.post("/", dependencies=[Depends(subscribe_limiter)])
async def subscribe(body: Dict[str, Any], background_tasks: BackgroundTasks):
    # Spam & Bot Honeypot Trap
    hp = body.get("hp") or body.get("user_confirm_hp")
    if hp and str(hp).strip():
        print("🛡️ Bot subscribe attempt silently discarded via honeypot.")
        return {"msg": "Subscribed 🎉"}

    raw_email = body.get("email")
    email = str(raw_email).strip().lower() if isinstance(raw_email, str) else ""

    if not email or not EMAIL_PATTERN.match(email) or len(email) > 254:
        raise HTTPException(status_code=400, detail={"msg": "Invalid email"})

    exists = await subscribers_col.find_one({"email": email})
    if exists:
        return {"msg": "Already subscribed 🌿"}

    now = datetime.now(timezone.utc)
    await subscribers_col.insert_one({
        "email": email,
        "createdAt": now,
        "updatedAt": now,
    })

    # Trigger welcome email in background
    background_tasks.add_task(send_welcome_email, email)

    return {"msg": "Subscribed 🎉"}
