import time
from typing import Optional, Any
from fastapi import APIRouter, Request, Response, status

from app.config import PAYMENTS_ENABLED, GOOGLE_AUTH_ENABLED

router = APIRouter(prefix="/api", tags=["Common"])
start_time = time.time()

@router.get("/config")
async def get_config():
    return {
        "paymentsEnabled": PAYMENTS_ENABLED,
        "googleAuthEnabled": GOOGLE_AUTH_ENABLED,
    }

@router.get("/health")
async def health_check():
    return {
        "status": "OK",
        "uptime": round(time.time() - start_time, 2),
    }

@router.post("/log-error", status_code=status.HTTP_204_NO_CONTENT)
async def log_error(request: Request):
    try:
        content_type = request.headers.get("content-type", "")
        if "application/json" in content_type:
            data = await request.json()
        else:
            raw = await request.body()
            import json
            data = json.loads(raw.decode("utf-8")) if raw else {}

        msg = data.get("message") if isinstance(data, dict) else str(data)
        src = data.get("source") if isinstance(data, dict) else ""
        print(f"⚠️ [Client Error Monitor]: {msg} from: {src}")
    except Exception:
        pass
    return Response(status_code=status.HTTP_204_NO_CONTENT)
