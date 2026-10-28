import re
from datetime import datetime, timezone
from typing import Dict, Any
from fastapi import APIRouter, HTTPException, Depends, Response, status
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

from app.config import GOOGLE_CLIENT_ID, GOOGLE_AUTH_ENABLED
from app.database import users_col
from app.auth import (
    hash_password,
    compare_password,
    generate_user_token,
    set_user_cookie,
    clear_user_cookie,
    get_current_user,
)
from app.rate_limiter import user_auth_limiter
from app.utils import to_object_id

router = APIRouter(prefix="/api/auth/user", tags=["Customer Auth"])

EMAIL_PATTERN = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")

def is_non_empty_str(v: Any, max_len: int = 200) -> bool:
    return isinstance(v, str) and 0 < len(v.strip()) <= max_len

def public_user(user: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "name": user.get("name", ""),
        "email": user.get("email", ""),
        "avatar": user.get("avatar", ""),
    }

@router.post("/register", status_code=status.HTTP_201_CREATED, dependencies=[Depends(user_auth_limiter)])
async def register_user(body: Dict[str, Any], response: Response):
    name = body.get("name")
    email = body.get("email")
    password = body.get("password")
    avatar = body.get("avatar")

    if not is_non_empty_str(name, 100):
        raise HTTPException(status_code=400, detail={"msg": "Please enter your name"})
    if not is_non_empty_str(email, 254) or not EMAIL_PATTERN.match(str(email).strip()):
        raise HTTPException(status_code=400, detail={"msg": "Please enter a valid email"})
    if not isinstance(password, str) or len(password) < 8:
        raise HTTPException(status_code=400, detail={"msg": "Password must be at least 8 characters"})

    normalized_email = email.strip().lower()
    user = await users_col.find_one({"email": normalized_email})

    if user and user.get("passwordHash"):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={"msg": "An account with this email already exists — please sign in instead."},
        )

    password_hash = hash_password(password)
    now = datetime.now(timezone.utc)

    if user:
        # Account previously created via Google — link password to it
        update_data = {
            "passwordHash": password_hash,
            "name": user.get("name") or name.strip(),
            "lastLoginAt": now,
            "updatedAt": now,
        }
        if avatar and isinstance(avatar, str):
            update_data["avatar"] = avatar.strip()

        await users_col.update_one({"_id": user["_id"]}, {"$set": update_data})
        user = await users_col.find_one({"_id": user["_id"]})
    else:
        user_doc = {
            "name": name.strip(),
            "email": normalized_email,
            "passwordHash": password_hash,
            "avatar": avatar.strip() if (avatar and isinstance(avatar, str)) else "",
            "lastLoginAt": now,
            "createdAt": now,
            "updatedAt": now,
        }
        result = await users_col.insert_one(user_doc)
        user_doc["_id"] = result.inserted_id
        user = user_doc

    token = generate_user_token(user)
    set_user_cookie(response, token)

    return {"msg": "Account created", "user": public_user(user)}

@router.post("/login", dependencies=[Depends(user_auth_limiter)])
async def login_user(body: Dict[str, Any], response: Response):
    email = body.get("email")
    password = body.get("password")

    if not is_non_empty_str(email, 254) or not isinstance(password, str) or not password:
        raise HTTPException(status_code=400, detail={"msg": "Please enter your email and password"})

    user = await users_col.find_one({"email": email.strip().lower()})
    if not user:
        raise HTTPException(status_code=401, detail={"msg": "Invalid email or password"})

    if not user.get("passwordHash"):
        raise HTTPException(
            status_code=401,
            detail={"msg": "This email is registered via Google — use \"Continue with Google\" instead."},
        )

    if not compare_password(password, user["passwordHash"]):
        raise HTTPException(status_code=401, detail={"msg": "Invalid email or password"})

    now = datetime.now(timezone.utc)
    await users_col.update_one({"_id": user["_id"]}, {"$set": {"lastLoginAt": now}})

    token = generate_user_token(user)
    set_user_cookie(response, token)

    return {"msg": "Logged in", "user": public_user(user)}

@router.post("/google", dependencies=[Depends(user_auth_limiter)])
async def google_login(body: Dict[str, Any], response: Response):
    if not GOOGLE_AUTH_ENABLED:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={"msg": "Google sign-in isn't set up yet"},
        )

    credential = body.get("credential")
    if not credential or not isinstance(credential, str):
        raise HTTPException(status_code=400, detail={"msg": "Missing Google credential"})

    try:
        payload = id_token.verify_oauth2_token(
            credential,
            google_requests.Request(),
            GOOGLE_CLIENT_ID,
        )
    except Exception as e:
        print(f"Google login verification error: {e}")
        raise HTTPException(status_code=401, detail={"msg": "Google sign-in failed"})

    if not payload.get("sub") or not payload.get("email"):
        raise HTTPException(status_code=401, detail={"msg": "Invalid Google sign-in"})
    if not payload.get("email_verified"):
        raise HTTPException(status_code=401, detail={"msg": "Please use a verified Google account"})

    normalized_email = payload["email"].lower()
    user = await users_col.find_one({"googleId": payload["sub"]})
    if not user:
        user = await users_col.find_one({"email": normalized_email})

    now = datetime.now(timezone.utc)

    if user:
        updates = {
            "googleId": user.get("googleId") or payload["sub"],
            "name": user.get("name") or payload.get("name") or normalized_email,
            "avatar": payload.get("picture") or user.get("avatar", ""),
            "lastLoginAt": now,
            "updatedAt": now,
        }
        await users_col.update_one({"_id": user["_id"]}, {"$set": updates})
        user = await users_col.find_one({"_id": user["_id"]})
    else:
        user_doc = {
            "googleId": payload["sub"],
            "email": normalized_email,
            "name": payload.get("name") or normalized_email,
            "avatar": payload.get("picture") or "",
            "lastLoginAt": now,
            "createdAt": now,
            "updatedAt": now,
        }
        result = await users_col.insert_one(user_doc)
        user_doc["_id"] = result.inserted_id
        user = user_doc

    token = generate_user_token(user)
    set_user_cookie(response, token)

    return {"msg": "Logged in", "user": public_user(user)}

@router.post("/logout")
async def user_logout(response: Response):
    clear_user_cookie(response)
    return {"msg": "Logged out"}

@router.get("/me")
async def user_me(user: Dict[str, Any] = Depends(get_current_user)):
    user_doc = await users_col.find_one({"_id": to_object_id(user["sub"])})
    if not user_doc:
        raise HTTPException(status_code=401, detail={"msg": "Session expired"})
    return public_user(user_doc)

@router.put("/avatar")
async def update_user_avatar(body: Dict[str, Any], user: Dict[str, Any] = Depends(get_current_user)):
    avatar = body.get("avatar")
    if not avatar or not isinstance(avatar, str):
        raise HTTPException(status_code=400, detail={"msg": "Please select an avatar"})

    user_doc = await users_col.find_one({"_id": to_object_id(user["sub"])})
    if not user_doc:
        raise HTTPException(status_code=401, detail={"msg": "Session expired"})

    now = datetime.now(timezone.utc)
    await users_col.update_one(
        {"_id": user_doc["_id"]},
        {"$set": {"avatar": avatar.strip(), "updatedAt": now}},
    )
    user_doc["avatar"] = avatar.strip()

    return {
        "msg": "Profile avatar updated successfully! 🦜",
        "user": public_user(user_doc),
    }

@router.get("/status")
async def user_auth_status():
    return {"googleAuthEnabled": GOOGLE_AUTH_ENABLED}
