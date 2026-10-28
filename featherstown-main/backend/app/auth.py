from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, Any
import bcrypt
import jwt
from fastapi import Request, HTTPException, status, Response

from app.config import (
    JWT_SECRET,
    JWT_EXPIRES_IN,
    USER_JWT_EXPIRES_IN,
    ADMIN_COOKIE_NAME,
    USER_COOKIE_NAME,
    IS_PROD,
)
from app.utils import parse_duration_seconds

def hash_password(plain: str) -> str:
    """Hash password using bcrypt."""
    return bcrypt.hashpw(plain.encode("utf-8"), bcrypt.gensalt(12)).decode("utf-8")

def compare_password(plain: str, hashed: str) -> bool:
    """Compare plain password with bcrypt hash."""
    if not hashed:
        return False
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False

def generate_admin_token(admin_doc: Dict[str, Any]) -> str:
    """Generates admin JWT."""
    exp_seconds = parse_duration_seconds(JWT_EXPIRES_IN, 28800)
    exp = datetime.now(timezone.utc) + timedelta(seconds=exp_seconds)
    payload = {
        "sub": str(admin_doc["_id"]),
        "username": admin_doc["username"],
        "role": admin_doc.get("role", "admin"),
        "exp": exp,
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")

def generate_user_token(user_doc: Dict[str, Any]) -> str:
    """Generates customer JWT."""
    exp_seconds = parse_duration_seconds(USER_JWT_EXPIRES_IN, 2592000)
    exp = datetime.now(timezone.utc) + timedelta(seconds=exp_seconds)
    payload = {
        "sub": str(user_doc["_id"]),
        "email": user_doc["email"],
        "role": "user",
        "exp": exp,
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")

def set_admin_cookie(response: Response, token: str):
    max_age = parse_duration_seconds(JWT_EXPIRES_IN, 28800)
    response.set_cookie(
        key=ADMIN_COOKIE_NAME,
        value=token,
        max_age=max_age,
        httponly=True,
        secure=IS_PROD,
        samesite="lax",
        path="/",
    )

def clear_admin_cookie(response: Response):
    response.delete_cookie(
        key=ADMIN_COOKIE_NAME,
        path="/",
        httponly=True,
        secure=IS_PROD,
        samesite="lax",
    )

def set_user_cookie(response: Response, token: str):
    max_age = parse_duration_seconds(USER_JWT_EXPIRES_IN, 2592000)
    response.set_cookie(
        key=USER_COOKIE_NAME,
        value=token,
        max_age=max_age,
        httponly=True,
        secure=IS_PROD,
        samesite="lax",
        path="/",
    )

def clear_user_cookie(response: Response):
    response.delete_cookie(
        key=USER_COOKIE_NAME,
        path="/",
        httponly=True,
        secure=IS_PROD,
        samesite="lax",
    )

async def get_current_admin(request: Request) -> Dict[str, Any]:
    """Dependency: protects admin-only routes."""
    cookie_token = request.cookies.get(ADMIN_COOKIE_NAME)
    header = request.headers.get("authorization", "")
    header_token = header[7:] if header.startswith("Bearer ") else None
    token = cookie_token or header_token

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"msg": "Not authenticated"},
        )

    try:
        decoded = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"msg": "Session expired, please log in again"},
        )

    if decoded.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"msg": "Not authorized"},
        )

    return decoded

def decode_user_token(request: Request) -> Optional[Dict[str, Any]]:
    token = request.cookies.get(USER_COOKIE_NAME)
    if not token:
        return None
    try:
        decoded = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        if decoded.get("role") != "user":
            return None
        return decoded
    except Exception:
        return None

async def get_current_user(request: Request) -> Dict[str, Any]:
    """Dependency: requires valid user session."""
    user = decode_user_token(request)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"msg": "Please sign in to continue"},
        )
    return user

async def get_optional_user(request: Request) -> Optional[Dict[str, Any]]:
    """Dependency: returns user if signed in, None otherwise."""
    return decode_user_token(request)
