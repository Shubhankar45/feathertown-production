import time
from collections import defaultdict
from typing import Dict, List
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

# Preconfigured limiters matching Express
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
    max_requests=30,
    error_message="Too many attempts. Please try again later."
)

checkout_limiter = RateLimiter(
    window_seconds=10 * 60,
    max_requests=20,
    error_message="Too many checkout attempts. Please try again later."
)
