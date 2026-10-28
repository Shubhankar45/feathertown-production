from datetime import datetime, timezone
from typing import Dict, Any
from fastapi import APIRouter, HTTPException, Depends, Response, status

from app.database import admins_col
from app.auth import (
    compare_password,
    generate_admin_token,
    set_admin_cookie,
    clear_admin_cookie,
    get_current_admin,
)
from app.rate_limiter import admin_login_limiter

router = APIRouter(prefix="/api/auth", tags=["Admin Auth"])

INVALID_MSG = "Invalid username or password"

@router.post("/login", dependencies=[Depends(admin_login_limiter)])
async def admin_login(body: Dict[str, Any], response: Response):
    username = body.get("username")
    password = body.get("password")

    if not username or not isinstance(username, str) or not password or not isinstance(password, str):
        raise HTTPException(status_code=400, detail={"msg": INVALID_MSG})

    normalized_username = username.strip().lower()
    admin = await admins_col.find_one({"username": normalized_username})
    if not admin:
        raise HTTPException(status_code=401, detail={"msg": INVALID_MSG})

    if not compare_password(password, admin.get("passwordHash", "")):
        raise HTTPException(status_code=401, detail={"msg": INVALID_MSG})

    now = datetime.now(timezone.utc)
    await admins_col.update_one({"_id": admin["_id"]}, {"$set": {"lastLoginAt": now}})

    token = generate_admin_token(admin)
    set_admin_cookie(response, token)

    return {
        "msg": "Logged in",
        "admin": {
            "username": admin["username"],
            "role": admin.get("role", "admin"),
        },
    }

@router.post("/logout")
async def admin_logout(response: Response, _admin: Dict[str, Any] = Depends(get_current_admin)):
    clear_admin_cookie(response)
    return {"msg": "Logged out"}

@router.get("/me")
async def admin_me(admin: Dict[str, Any] = Depends(get_current_admin)):
    return {
        "username": admin["username"],
        "role": admin["role"],
    }
