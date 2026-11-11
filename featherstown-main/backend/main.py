import os
import sys
import io
import time

if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass
if hasattr(sys.stderr, "reconfigure"):
    try:
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass
from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI, Request, Response, HTTPException, status
from fastapi.responses import JSONResponse, FileResponse, PlainTextResponse, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.exceptions import RequestValidationError
import uvicorn

from fastapi.staticfiles import StaticFiles

# Ensure backend root is on sys.path
backend_dir = Path(__file__).resolve().parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.config import (
    PORT,
    NODE_ENV,
    IS_PROD,
    ALLOWED_ORIGINS,
    FRONTEND_PATH,
    INDEX_PATH,
    PUBLIC_FRONTEND_PATH,
    UPLOADS_DIR,
)
from app.database import init_db
from app.rate_limiter import api_limiter
from app.routers import (
    birds,
    accessories,
    categories,
    orders,
    reviews,
    settings,
    subscribers,
    auth,
    user_auth,
    admin,
    common,
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("Connecting to database and initializing...")
    await init_db()
    print(f"🚀 Server running on port {PORT} ({'production' if IS_PROD else 'development'})")
    yield
    # Shutdown
    print("Shutting down cleanly...")

app = FastAPI(
    title="FeatherTown API",
    description="Backend API for FeatherTown Aviary & Shop",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs" if not IS_PROD else None,
    redoc_url=None,
)

# ───────── SECURITY HEADERS & RATE LIMITING MIDDLEWARE ─────────
@app.middleware("http")
async def security_and_https_middleware(request: Request, call_next):
    # General API rate limiting for /api routes
    path = request.url.path
    if path.startswith("/api") and path not in ("/api/health", "/api/config", "/api/log-error"):
        try:
            await api_limiter(request)
        except HTTPException as e:
            return JSONResponse(status_code=e.status_code, content=e.detail)

    response = await call_next(request)

    # Security Headers matching Helmet
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "SAMEORIGIN"
    response.headers["Cross-Origin-Resource-Policy"] = "cross-origin"

    proto = request.headers.get("x-forwarded-proto", "")
    if IS_PROD and proto.lower() == "https":
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload"

    return response

# ───────── GZIP COMPRESSION ─────────
app.add_middleware(GZipMiddleware, minimum_size=1000)

# ───────── CORS ─────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ───────── EXCEPTION HANDLERS (Uniform {"msg": ...} format) ─────────
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    if isinstance(exc.detail, dict):
        return JSONResponse(status_code=exc.status_code, content=exc.detail)
    return JSONResponse(status_code=exc.status_code, content={"msg": str(exc.detail)})

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = exc.errors()
    first_msg = errors[0].get("msg") if errors else "Invalid request data"
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={"msg": first_msg},
    )

@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    print(f"Unhandled error: {exc}", file=sys.stderr)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"msg": "Internal server error"},
    )

# ───────── MOUNT API ROUTERS ─────────
app.include_router(birds.router)
app.include_router(accessories.router)
app.include_router(categories.router)
app.include_router(orders.router)
app.include_router(reviews.router)
app.include_router(settings.router)
app.include_router(subscribers.router)
app.include_router(auth.router)
app.include_router(user_auth.router)
app.include_router(admin.router)
app.include_router(common.router)

# ───────── STATIC UPLOADS DIRECTORY ─────────
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")

# ───────── SEO ROUTES: SITEMAP & ROBOTS & FAVICON ─────────
@app.get("/sitemap.xml", include_in_schema=False)
async def get_sitemap():
    sitemap_dist = FRONTEND_PATH / "sitemap.xml"
    sitemap_pub = PUBLIC_FRONTEND_PATH / "sitemap.xml"
    target = sitemap_dist if sitemap_dist.exists() else sitemap_pub
    if target.exists():
        return FileResponse(target, media_type="application/xml")
    return Response("Sitemap not found", status_code=404, media_type="text/plain")

@app.get("/robots.txt", include_in_schema=False)
async def get_robots():
    robots_dist = FRONTEND_PATH / "robots.txt"
    robots_pub = PUBLIC_FRONTEND_PATH / "robots.txt"
    target = robots_dist if robots_dist.exists() else robots_pub
    if target.exists():
        return FileResponse(target, media_type="text/plain")
    return Response("Robots not found", status_code=404, media_type="text/plain")

@app.get("/favicon.ico", include_in_schema=False)
async def get_favicon():
    fav_dist = FRONTEND_PATH / "favicon.ico"
    fav_pub = PUBLIC_FRONTEND_PATH / "favicon.ico"
    target = fav_dist if fav_dist.exists() else fav_pub
    if target.exists():
        return FileResponse(target)
    return Response(status_code=204)

# ───────── STATIC FRONTEND WITH AGGRESSIVE CACHING & SPA CATCH-ALL ─────────
@app.get("/{full_path:path}", include_in_schema=False)
async def serve_static_or_spa(full_path: str):
    # Reject non-existing /api endpoints with 404 JSON
    if full_path.startswith("api"):
        return JSONResponse(status_code=404, content={"msg": "API not found"})

    # Check if a physical static file exists in frontend/dist
    requested_file = (FRONTEND_PATH / full_path).resolve()
    # Ensure no path traversal outside FRONTEND_PATH
    if requested_file.is_relative_to(FRONTEND_PATH) and requested_file.is_file():
        headers = {}
        if "/assets/" in str(requested_file).replace("\\", "/"):
            headers["Cache-Control"] = "public, max-age=31536000, immutable"
        elif requested_file.name == "index.html":
            headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
        return FileResponse(requested_file, headers=headers)

    # SPA Catch-All fallback: serve index.html for all browser routes
    if INDEX_PATH.exists():
        return FileResponse(
            INDEX_PATH,
            headers={"Cache-Control": "no-cache, no-store, must-revalidate"},
        )

    return Response("Frontend build not found", status_code=500, media_type="text/plain")

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=PORT,
        reload=not IS_PROD,
    )
