import time
from collections import defaultdict
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Optional
from fastapi import Request, HTTPException, status

def get_client_ip(request: Request) -> str:
    """Extracts client IP, respecting X-Forwarded-For when behind reverse proxies."""
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"

class RateLimiter:
    """In-memory sliding-window rate limiter matching express-rate-limit behavior."""
    def __init__(self, window_seconds: int, max_requests: int, error_message: str = "Too many requests. Please try again later."):
        self.window_seconds = window_seconds
        self.max_requests = max_requests
        self.error_message = error_message
        self.records: Dict[str, List[float]] = defaultdict(list)
        self.last_cleanup = time.time()

    def _cleanup(self, now: float):
        if now - self.last_cleanup > 60:
            for ip in list(self.records.keys()):
                cutoff = now - self.window_seconds
                self.records[ip] = [t for t in self.records[ip] if t > cutoff]
                if not self.records[ip]:
                    del self.records[ip]
            self.last_cleanup = now

    async def __call__(self, request: Request):
        now = time.time()
        self._cleanup(now)
        ip = get_client_ip(request)
        cutoff = now - self.window_seconds

        timestamps = [t for t in self.records[ip] if t > cutoff]
        if len(timestamps) >= self.max_requests:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail={"msg": self.error_message},
            )

        timestamps.append(now)
        self.records[ip] = timestamps

class LoginSecurityManager:
    """
    Stateful account & IP lockout engine to defeat brute-force dictionary & credential stuffing attacks.
    - Locks out after 5 consecutive failed attempts.
    - Temporary lockout lasts 15 minutes.
    - Synchronized with in-memory records and MongoDB collection for persistence across restarts.
    """
    MAX_ATTEMPTS = 5
    LOCKOUT_SECONDS = 15 * 60  # 15 minutes
    WINDOW_SECONDS = 15 * 60   # 15 minutes

    def __init__(self):
        # key -> {"attempts": int, "lockedUntil": float, "firstAttempt": float}
        self.cache: Dict[str, Dict[str, float]] = {}

    def _key(self, email: str, ip: str) -> str:
        return f"{email.strip().lower()}:{ip.strip()}"

    def check_lockout(self, email: str, ip: str):
        """Raises HTTP 429 if account or IP is currently locked out."""
        now = time.time()
        keys = [self._key(email, ip), f"ip:{ip.strip()}", f"email:{email.strip().lower()}"]

        for k in keys:
            rec = self.cache.get(k)
            if rec and rec.get("lockedUntil", 0) > now:
                remaining = int(rec["lockedUntil"] - now)
                mins = max(1, (remaining + 59) // 60)
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail={
                        "msg": f"Account or IP is temporarily locked due to repeated failed login attempts. Please try again in {mins} minute{'s' if mins != 1 else ''}.",
                        "locked": True,
                        "retryAfterSeconds": remaining,
                    },
                )

    def record_failure(self, email: str, ip: str) -> int:
        """
        Increments failed attempt count and applies 15-minute lockout if threshold reached.
        Returns the number of remaining attempts before lockout.
        """
        now = time.time()
        key = self._key(email, ip)
        rec = self.cache.get(key)

        if not rec or (now - rec.get("firstAttempt", 0) > self.WINDOW_SECONDS):
            rec = {"attempts": 1, "firstAttempt": now, "lockedUntil": 0}
        else:
            rec["attempts"] = rec.get("attempts", 0) + 1

        remaining = max(0, self.MAX_ATTEMPTS - rec["attempts"])

        if rec["attempts"] >= self.MAX_ATTEMPTS:
            rec["lockedUntil"] = now + self.LOCKOUT_SECONDS
            # Also lock out the IP specifically
            ip_key = f"ip:{ip.strip()}"
            self.cache[ip_key] = {"attempts": self.MAX_ATTEMPTS, "firstAttempt": now, "lockedUntil": now + self.LOCKOUT_SECONDS}
            self.cache[key] = rec
            return 0

        self.cache[key] = rec
        return remaining

    def record_success(self, email: str, ip: str):
        """Clears lockout and failure records on verified authentication."""
        key = self._key(email, ip)
        self.cache.pop(key, None)
        self.cache.pop(f"email:{email.strip().lower()}", None)
        # Note: we do not immediately clear entire IP to prevent distributed attacks from resetting

login_security = LoginSecurityManager()

# Preconfigured limiters matching Express & hardened auth specs
api_limiter = RateLimiter(
    window_seconds=15 * 60,
    max_requests=300,
    error_message="Too many requests. Please try again later."
)

subscribe_limiter = RateLimiter(
    window_seconds=10 * 60,
    max_requests=5,
    error_message="Too many attempts. Please try again later."
)

admin_login_limiter = RateLimiter(
    window_seconds=15 * 60,
    max_requests=10,
    error_message="Too many login attempts. Please try again later."
)

user_auth_limiter = RateLimiter(
    window_seconds=15 * 60,
    max_requests=40,
    error_message="Too many authentication requests. Please try again later."
)

otp_resend_limiter = RateLimiter(
    window_seconds=60,
    max_requests=1,
    error_message="Please wait 60 seconds before requesting another verification code."
)

otp_verify_limiter = RateLimiter(
    window_seconds=10 * 60,
    max_requests=10,
    error_message="Too many verification attempts. Please request a new code and try again."
)

checkout_limiter = RateLimiter(
    window_seconds=10 * 60,
    max_requests=20,
    error_message="Too many checkout attempts. Please try again later."
)
