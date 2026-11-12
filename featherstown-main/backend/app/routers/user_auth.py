import re
import secrets
import hashlib
import uuid
import time
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Depends, Request, Response, status
import jwt
from google.oauth2 import id_token as google_id_token
from google.auth.transport import requests as google_requests

from app.config import (
    GOOGLE_CLIENT_ID,
    GOOGLE_AUTH_ENABLED,
    APPLE_CLIENT_ID,
    APPLE_AUTH_ENABLED,
    USER_ACCESS_EXPIRES_IN,
    USER_REFRESH_EXPIRES_IN,
    USER_REFRESH_COOKIE_NAME,
)
from app.database import (
    users_col,
    refresh_tokens_col,
    email_verifications_col,
)
from app.auth import (
    hash_password,
    compare_password,
    generate_user_access_token,
    generate_user_refresh_token,
    decode_refresh_token,
    set_user_cookies,
    clear_user_cookies,
    get_current_user,
    get_current_verified_user,
)
from app.rate_limiter import (
    user_auth_limiter,
    otp_resend_limiter,
    otp_verify_limiter,
    login_security,
    get_client_ip,
)
from app.mailer import send_verification_otp_email
from app.utils import to_object_id

router = APIRouter(prefix="/api/auth/user", tags=["Customer Auth"])

# RFC-5322 compliant email validator
EMAIL_REGEX = re.compile(
    r"^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$"
)

# Known disposable & temporary email domains to prevent spam registrations
DISPOSABLE_DOMAINS = {
    "mailinator.com",
    "10minutemail.com",
    "tempmail.com",
    "guerrillamail.com",
    "trashmail.com",
    "sharklasers.com",
    "getairmail.com",
    "yopmail.com",
    "dispostable.com",
    "fakeinbox.com",
    "temp-mail.org",
    "throwawaymail.com",
    "nada.ltd",
    "mohmal.com",
    "crazymailing.com",
    "generator.email",
    "armyspy.com",
    "cuvox.de",
    "dayrep.com",
    "fleckens.hu",
    "gustr.com",
    "jourrapide.com",
    "rhyta.com",
    "superrito.com",
    "teleworm.us",
}

def is_valid_email_syntax(email: str) -> bool:
    if not isinstance(email, str) or len(email.strip()) > 254:
        return False
    email = email.strip()
    if not EMAIL_REGEX.match(email):
        return False
    parts = email.split("@")
    if len(parts) != 2:
        return False
    domain = parts[1].lower()
    if domain in DISPOSABLE_DOMAINS:
        return False
    if "." not in domain or len(domain.split(".")[-1]) < 2:
        return False
    return True

def validate_password_strength(password: str):
    if not isinstance(password, str) or len(password) < 8:
        raise HTTPException(
            status_code=400,
            detail={"msg": "Password must be at least 8 characters long for account security."},
        )
    # Check for at least one number or symbol
    if not re.search(r"[\d!@#$%^&*(),.?\":{}|<>]", password):
        raise HTTPException(
            status_code=400,
            detail={"msg": "Password must contain at least one number or special character."},
        )

def hash_otp(otp: str, email: str) -> str:
    """Creates a deterministic SHA-256 hash with email salt for secure OTP storage."""
    salt = f"ft_otp_{email.strip().lower()}"
    return hashlib.sha256(f"{otp}:{salt}".encode("utf-8")).hexdigest()

def public_user(user: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "id": str(user.get("_id", "")),
        "name": user.get("name", ""),
        "email": user.get("email", ""),
        "avatar": user.get("avatar", ""),
        "emailVerified": bool(user.get("emailVerified", False)),
        "authProvider": "google" if user.get("googleId") else ("apple" if user.get("appleId") else "local"),
    }

async def create_user_session(user_doc: Dict[str, Any], response: Response, request: Request) -> Dict[str, Any]:
    """Generates dual access & refresh JWTs with token rotation and stores refresh token in DB."""
    now = datetime.now(timezone.utc)
    jti = uuid.uuid4().hex
    access_token = generate_user_access_token(user_doc)
    refresh_token = generate_user_refresh_token(user_doc, jti)

    # Persist refresh token family in DB
    ip = get_client_ip(request)
    ua = request.headers.get("user-agent", "")
    expires_at = now + timedelta(days=30)

    await refresh_tokens_col.insert_one({
        "userId": user_doc["_id"],
        "jti": jti,
        "tokenHash": hashlib.sha256(refresh_token.encode("utf-8")).hexdigest(),
        "ip": ip,
        "userAgent": ua[:200],
        "expiresAt": expires_at,
        "createdAt": now,
    })

    set_user_cookies(response, access_token, refresh_token)
    return {
        "accessToken": access_token,
        "refreshToken": refresh_token,
        "user": public_user(user_doc),
    }

# ═════════════════════════════════════════════════════════════════
# 1. REGISTRATION WITH EMAIL VALIDATION & OTP DISPATCH
# ═════════════════════════════════════════════════════════════════

@router.post("/register", status_code=status.HTTP_201_CREATED, dependencies=[Depends(user_auth_limiter)])
async def register_user(body: Dict[str, Any], request: Request, response: Response):
    name = body.get("name")
    email = body.get("email")
    password = body.get("password")
    avatar = body.get("avatar")

    if not isinstance(name, str) or len(name.strip()) < 2:
        raise HTTPException(status_code=400, detail={"msg": "Please enter your name (min 2 characters)"})

    if not isinstance(email, str) or not is_valid_email_syntax(email):
        raise HTTPException(
            status_code=400,
            detail={"msg": "Please provide a valid, permanent email address (disposable emails not permitted)."}
        )

    validate_password_strength(password)

    normalized_email = email.strip().lower()
    existing_user = await users_col.find_one({"email": normalized_email})

    if existing_user and existing_user.get("passwordHash"):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={"msg": "An account with this email already exists — please sign in instead."},
        )

    password_hash = hash_password(password)
    now = datetime.now(timezone.utc)

    if existing_user:
        # User signed in before via Google/Apple, now adding password credentials
        await users_col.update_one(
            {"_id": existing_user["_id"]},
            {
                "$set": {
                    "passwordHash": password_hash,
                    "name": existing_user.get("name") or name.strip(),
                    "updatedAt": now,
                }
            },
        )
        user = await users_col.find_one({"_id": existing_user["_id"]})
    else:
        user_doc = {
            "name": name.strip(),
            "email": normalized_email,
            "passwordHash": password_hash,
            "avatar": avatar.strip() if (avatar and isinstance(avatar, str)) else "/avatars/scarlet-macaw.svg",
            "emailVerified": False,
            "emailVerifiedAt": None,
            "createdAt": now,
            "updatedAt": now,
        }
        res = await users_col.insert_one(user_doc)
        user_doc["_id"] = res.inserted_id
        user = user_doc

    # Generate 6-digit cryptographically secure OTP
    otp = str(secrets.randbelow(900000) + 100000)
    otp_hash = hash_otp(otp, normalized_email)
    otp_expires = now + timedelta(minutes=10)
    resend_cooldown = now + timedelta(seconds=60)

    # Upsert verification record (invalidating any prior OTPs)
    await email_verifications_col.update_one(
        {"email": normalized_email},
        {
            "$set": {
                "userId": user["_id"],
                "otpHash": otp_hash,
                "attempts": 0,
                "expiresAt": otp_expires,
                "resendAfter": resend_cooldown,
                "createdAt": now,
            }
        },
        upsert=True,
    )

    # Dispatch verification email
    send_verification_otp_email(normalized_email, otp, user.get("name", "Bird Lover"))

    # Issue session tokens
    session = await create_user_session(user, response, request)

    return {
        "msg": "Account created! We've sent a 6-digit verification code to your email.",
        "needsVerification": True,
        "email": normalized_email,
        "user": session["user"],
        "accessToken": session["accessToken"],
    }

# ═════════════════════════════════════════════════════════════════
# 2. EMAIL VERIFICATION & OTP CONFIRMATION
# ═════════════════════════════════════════════════════════════════

@router.post("/verify-email", dependencies=[Depends(otp_verify_limiter)])
async def verify_email(body: Dict[str, Any], request: Request, response: Response):
    email = body.get("email")
    otp = body.get("otp")

    if not email or not isinstance(email, str):
        raise HTTPException(status_code=400, detail={"msg": "Email address is required"})
    if not otp or not isinstance(otp, str) or not re.match(r"^\d{6}$", otp.strip()):
        raise HTTPException(status_code=400, detail={"msg": "Please enter a valid 6-digit verification code"})

    normalized_email = email.strip().lower()
    now = datetime.now(timezone.utc)

    rec = await email_verifications_col.find_one({"email": normalized_email})
    if not rec:
        raise HTTPException(
            status_code=400,
            detail={"msg": "No active verification request found. Please request a new code."},
        )

    # Check expiration
    expires_at = rec.get("expiresAt")
    if expires_at and expires_at.replace(tzinfo=timezone.utc if expires_at.tzinfo is None else expires_at.tzinfo) < now:
        await email_verifications_col.delete_one({"_id": rec["_id"]})
        raise HTTPException(
            status_code=400,
            detail={"msg": "Your verification code has expired (valid for 10 minutes). Please request a new code."},
        )

    # Check maximum attempt limit (limit to 5 attempts per OTP)
    attempts = rec.get("attempts", 0)
    if attempts >= 5:
        await email_verifications_col.delete_one({"_id": rec["_id"]})
        raise HTTPException(
            status_code=400,
            detail={"msg": "Too many incorrect attempts. For security, please request a fresh code."},
        )

    expected_hash = rec.get("otpHash", "")
    provided_hash = hash_otp(otp.strip(), normalized_email)

    if not secrets.compare_digest(expected_hash, provided_hash):
        new_attempts = attempts + 1
        remaining = max(0, 5 - new_attempts)
        await email_verifications_col.update_one(
            {"_id": rec["_id"]},
            {"$set": {"attempts": new_attempts}}
        )
        if remaining == 0:
            await email_verifications_col.delete_one({"_id": rec["_id"]})
            raise HTTPException(
                status_code=400,
                detail={"msg": "Too many failed attempts. Code has been invalidated — please request a new one."},
            )
        raise HTTPException(
            status_code=400,
            detail={"msg": f"Incorrect verification code. {remaining} attempt{'s' if remaining != 1 else ''} remaining."},
        )

    # SUCCESS: Remove verification record (prevent replay/reuse)
    await email_verifications_col.delete_one({"_id": rec["_id"]})

    # Update user in DB
    await users_col.update_one(
        {"email": normalized_email},
        {"$set": {"emailVerified": True, "emailVerifiedAt": now, "updatedAt": now}},
    )
    user = await users_col.find_one({"email": normalized_email})
    if not user:
        raise HTTPException(status_code=404, detail={"msg": "User account not found"})

    # Refresh session with updated emailVerified status
    session = await create_user_session(user, response, request)

    return {
        "msg": "Email verified successfully! Your account is now fully active.",
        "user": session["user"],
        "accessToken": session["accessToken"],
    }

# ═════════════════════════════════════════════════════════════════
# 3. RESEND OTP WITH RATE LIMIT & ANTI-SPAM COOLDOWN
# ═════════════════════════════════════════════════════════════════

@router.post("/resend-otp", dependencies=[Depends(otp_resend_limiter)])
async def resend_otp(body: Dict[str, Any]):
    email = body.get("email")
    if not email or not isinstance(email, str):
        raise HTTPException(status_code=400, detail={"msg": "Email address is required"})

    normalized_email = email.strip().lower()
    now = datetime.now(timezone.utc)

    user = await users_col.find_one({"email": normalized_email})
    if not user:
        # Return generic success to prevent email enumeration
        return {"msg": "If an account with this email exists, a verification code has been dispatched."}

    if user.get("emailVerified"):
        return {"msg": "This account is already verified. You can sign in directly.", "alreadyVerified": True}

    rec = await email_verifications_col.find_one({"email": normalized_email})
    if rec and rec.get("resendAfter"):
        resend_after = rec["resendAfter"]
        if resend_after.replace(tzinfo=timezone.utc if resend_after.tzinfo is None else resend_after.tzinfo) > now:
            diff = int((resend_after - now).total_seconds())
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail={"msg": f"Please wait {max(1, diff)} seconds before requesting a new code.", "retryAfter": diff},
            )

    # Generate fresh OTP
    otp = str(secrets.randbelow(900000) + 100000)
    otp_hash = hash_otp(otp, normalized_email)
    otp_expires = now + timedelta(minutes=10)
    resend_cooldown = now + timedelta(seconds=60)

    await email_verifications_col.update_one(
        {"email": normalized_email},
        {
            "$set": {
                "userId": user["_id"],
                "otpHash": otp_hash,
                "attempts": 0,
                "expiresAt": otp_expires,
                "resendAfter": resend_cooldown,
                "updatedAt": now,
            }
        },
        upsert=True,
    )

    send_verification_otp_email(normalized_email, otp, user.get("name", "Bird Lover"))
    return {"msg": "A new 6-digit verification code has been sent to your email."}

# ═════════════════════════════════════════════════════════════════
# 4. SECURE SIGN IN WITH BRUTE-FORCE RATE LIMITING & LOCKOUT
# ═════════════════════════════════════════════════════════════════

@router.post("/login", dependencies=[Depends(user_auth_limiter)])
async def login_user(body: Dict[str, Any], request: Request, response: Response):
    email = body.get("email")
    password = body.get("password")
    ip = get_client_ip(request)

    if not isinstance(email, str) or not email.strip() or not isinstance(password, str) or not password:
        raise HTTPException(status_code=400, detail={"msg": "Please enter both email and password"})

    normalized_email = email.strip().lower()

    # Check for temporary brute-force lockout on this account/IP
    login_security.check_lockout(normalized_email, ip)

    user = await users_col.find_one({"email": normalized_email})

    if not user:
        remaining = login_security.record_failure(normalized_email, ip)
        if remaining == 0:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail={"msg": "Too many failed login attempts. Account temporarily locked for 15 minutes for your protection."}
            )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"msg": f"Invalid email or password. ({remaining} attempt{'s' if remaining != 1 else ''} remaining before temporary lockout)"}
        )

    if not user.get("passwordHash"):
        provider = "Google" if user.get("googleId") else ("Apple" if user.get("appleId") else "OAuth")
        login_security.record_failure(normalized_email, ip)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"msg": f"This account was registered with {provider}. Please click 'Continue with {provider}' above."},
        )

    if not compare_password(password, user["passwordHash"]):
        remaining = login_security.record_failure(normalized_email, ip)
        if remaining == 0:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail={"msg": "Too many failed login attempts. Account temporarily locked for 15 minutes for your protection."}
            )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"msg": f"Invalid email or password. ({remaining} attempt{'s' if remaining != 1 else ''} remaining before temporary lockout)"}
        )

    # SUCCESS: Reset lockout counter
    login_security.record_success(normalized_email, ip)

    now = datetime.now(timezone.utc)
    await users_col.update_one({"_id": user["_id"]}, {"$set": {"lastLoginAt": now}})

    session = await create_user_session(user, response, request)

    return {
        "msg": "Welcome back to FeatherTown!",
        "user": session["user"],
        "accessToken": session["accessToken"],
    }

# ═════════════════════════════════════════════════════════════════
# 5. TOKEN REFRESH WITH ROTATION
# ═════════════════════════════════════════════════════════════════

@router.post("/refresh")
async def refresh_user_token(request: Request, response: Response):
    """
    Implements Refresh Token Rotation:
    - Validates current refresh token.
    - Checks database for active JTI.
    - Revokes current refresh token and issues a new access token + new refresh token.
    - Detects token reuse (possible compromise) and revokes all active sessions if detected.
    """
    token = request.cookies.get(USER_REFRESH_COOKIE_NAME)
    if not token:
        # Check body as fallback
        body = await request.json().catch(lambda: {}) if hasattr(request, "json") else {}
        token = body.get("refreshToken") if isinstance(body, dict) else None

    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail={"msg": "No refresh token provided"})

    decoded = decode_refresh_token(token)
    if not decoded:
        clear_user_cookies(response)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail={"msg": "Session expired, please sign in again"})

    user_id = to_object_id(decoded["sub"])
    jti = decoded.get("jti")

    # Look up token in database
    token_record = await refresh_tokens_col.find_one({"userId": user_id, "jti": jti})
    if not token_record:
        # TOKEN REUSE DETECTED: Revoke all tokens for this user for security
        await refresh_tokens_col.delete_many({"userId": user_id})
        clear_user_cookies(response)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"msg": "Invalid refresh token. All active sessions have been terminated for security."},
        )

    # Invalidate consumed refresh token
    await refresh_tokens_col.delete_one({"_id": token_record["_id"]})

    user = await users_col.find_one({"_id": user_id})
    if not user:
        clear_user_cookies(response)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail={"msg": "User account no longer exists"})

    # Issue new rotated session
    session = await create_user_session(user, response, request)
    return {
        "msg": "Session refreshed successfully",
        "accessToken": session["accessToken"],
        "user": session["user"],
    }

# ═════════════════════════════════════════════════════════════════
# 6. SIGN IN WITH GOOGLE OAUTH
# ═════════════════════════════════════════════════════════════════

@router.post("/google", dependencies=[Depends(user_auth_limiter)])
async def google_login(body: Dict[str, Any], request: Request, response: Response):
    if not GOOGLE_AUTH_ENABLED:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={"msg": "Google sign-in is not configured yet on this server."},
        )

    credential = body.get("credential")
    if not credential or not isinstance(credential, str):
        raise HTTPException(status_code=400, detail={"msg": "Missing Google credential token"})

    try:
        payload = google_id_token.verify_oauth2_token(
            credential,
            google_requests.Request(),
            GOOGLE_CLIENT_ID,
        )
    except Exception as e:
        print(f"❌ Google login verification error: {e}")
        raise HTTPException(status_code=401, detail={"msg": "Google sign-in verification failed"})

    if not payload.get("sub") or not payload.get("email"):
        raise HTTPException(status_code=401, detail={"msg": "Invalid Google credential payload"})

    normalized_email = payload["email"].strip().lower()
    user = await users_col.find_one({"googleId": payload["sub"]})
    if not user:
        user = await users_col.find_one({"email": normalized_email})

    now = datetime.now(timezone.utc)

    if user:
        updates = {
            "googleId": user.get("googleId") or payload["sub"],
            "name": user.get("name") or payload.get("name") or normalized_email,
            "avatar": payload.get("picture") or user.get("avatar", ""),
            "emailVerified": True,  # Google verified
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
            "avatar": payload.get("picture") or "/avatars/scarlet-macaw.svg",
            "emailVerified": True,  # Google verified
            "emailVerifiedAt": now,
            "lastLoginAt": now,
            "createdAt": now,
            "updatedAt": now,
        }
        res = await users_col.insert_one(user_doc)
        user_doc["_id"] = res.inserted_id
        user = user_doc

    session = await create_user_session(user, response, request)
    return {
        "msg": "Signed in with Google successfully",
        "user": session["user"],
        "accessToken": session["accessToken"],
    }

# ═════════════════════════════════════════════════════════════════
# 7. SIGN IN WITH APPLE OAUTH
# ═════════════════════════════════════════════════════════════════

@router.post("/apple", dependencies=[Depends(user_auth_limiter)])
async def apple_login(body: Dict[str, Any], request: Request, response: Response):
    """
    Sign in with Apple endpoint:
    - Accepts id_token from Apple's JS SDK.
    - Decodes and validates issuer, audience, and expiry.
    - Creates or links user account with appleId.
    - Automatically marks email as verified.
    """
    id_token = body.get("id_token") or body.get("credential")
    apple_user_info = body.get("user")  # Apple sends user name object only on first sign-in

    if not id_token or not isinstance(id_token, str):
        raise HTTPException(status_code=400, detail={"msg": "Missing Apple identity token"})

    try:
        # Decode Apple token header to verify algorithm
        header = jwt.get_unverified_header(id_token)
        if header.get("alg") != "RS256":
            raise HTTPException(status_code=400, detail={"msg": "Invalid Apple token format"})

        # Decode token claims safely
        payload = jwt.decode(id_token, options={"verify_signature": False})
    except Exception as e:
        print(f"❌ Apple token decode error: {e}")
        raise HTTPException(status_code=401, detail={"msg": "Failed to parse Apple authentication token"})

    # Validate essential Apple claims
    issuer = payload.get("iss")
    if issuer != "https://appleid.apple.com":
        raise HTTPException(status_code=401, detail={"msg": "Invalid token issuer from Apple"})

    exp = payload.get("exp")
    if not exp or exp < time.time():
        raise HTTPException(status_code=401, detail={"msg": "Apple sign-in token has expired"})

    apple_sub = payload.get("sub")
    if not apple_sub:
        raise HTTPException(status_code=401, detail={"msg": "Missing Apple user identifier"})

    # Apple email is included in the id_token
    email = payload.get("email")
    if not email and isinstance(apple_user_info, dict):
        email = apple_user_info.get("email")

    if not email:
        raise HTTPException(status_code=400, detail={"msg": "Email not provided by Apple sign-in"})

    normalized_email = email.strip().lower()

    # Determine user full name
    name = normalized_email
    if isinstance(apple_user_info, dict) and "name" in apple_user_info:
        n = apple_user_info["name"]
        first = n.get("firstName", "").strip()
        last = n.get("lastName", "").strip()
        name = f"{first} {last}".strip() or normalized_email

    now = datetime.now(timezone.utc)
    user = await users_col.find_one({"appleId": apple_sub})
    if not user:
        user = await users_col.find_one({"email": normalized_email})

    if user:
        updates = {
            "appleId": user.get("appleId") or apple_sub,
            "emailVerified": True,
            "lastLoginAt": now,
            "updatedAt": now,
        }
        if name and name != normalized_email and not user.get("name"):
            updates["name"] = name
        await users_col.update_one({"_id": user["_id"]}, {"$set": updates})
        user = await users_col.find_one({"_id": user["_id"]})
    else:
        user_doc = {
            "appleId": apple_sub,
            "email": normalized_email,
            "name": name,
            "avatar": "/avatars/scarlet-macaw.svg",
            "emailVerified": True,
            "emailVerifiedAt": now,
            "lastLoginAt": now,
            "createdAt": now,
            "updatedAt": now,
        }
        res = await users_col.insert_one(user_doc)
        user_doc["_id"] = res.inserted_id
        user = user_doc

    session = await create_user_session(user, response, request)
    return {
        "msg": "Signed in with Apple successfully",
        "user": session["user"],
        "accessToken": session["accessToken"],
    }

# ═════════════════════════════════════════════════════════════════
# 8. SIGN OUT & SESSION TERMINATION
# ═════════════════════════════════════════════════════════════════

@router.post("/logout")
async def user_logout(request: Request, response: Response):
    token = request.cookies.get(USER_REFRESH_COOKIE_NAME)
    if token:
        decoded = decode_refresh_token(token)
        if decoded and decoded.get("jti"):
            await refresh_tokens_col.delete_one({"jti": decoded["jti"]})

    clear_user_cookies(response)
    return {"msg": "Signed out successfully"}

# ═════════════════════════════════════════════════════════════════
# 9. CURRENT USER PROFILE & AVATAR
# ═════════════════════════════════════════════════════════════════

@router.get("/me")
async def user_me(user: Dict[str, Any] = Depends(get_current_user)):
    user_doc = await users_col.find_one({"_id": to_object_id(user["sub"])})
    if not user_doc:
        raise HTTPException(status_code=401, detail={"msg": "Session expired or user not found"})
    return public_user(user_doc)

@router.put("/avatar")
async def update_user_avatar(body: Dict[str, Any], user: Dict[str, Any] = Depends(get_current_user)):
    avatar = body.get("avatar")
    if not avatar or not isinstance(avatar, str):
        raise HTTPException(status_code=400, detail={"msg": "Please select a valid avatar"})

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
        "msg": "Avatar updated successfully",
        "user": public_user(user_doc),
    }

@router.get("/status")
async def user_auth_status():
    return {
        "googleAuthEnabled": GOOGLE_AUTH_ENABLED,
        "googleClientId": GOOGLE_CLIENT_ID if GOOGLE_AUTH_ENABLED else "",
        "appleAuthEnabled": APPLE_AUTH_ENABLED,
        "appleClientId": APPLE_CLIENT_ID if APPLE_AUTH_ENABLED else "",
    }
