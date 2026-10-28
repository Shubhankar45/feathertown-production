import os
import sys
import io
from pathlib import Path
from dotenv import load_dotenv

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

# Root backend directory
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(dotenv_path=BASE_DIR / ".env")

# Required environment check (fail fast if missing)
MONGO_URI = os.getenv("MONGO_URI")
JWT_SECRET = os.getenv("JWT_SECRET")

missing_env = []
if not MONGO_URI:
    missing_env.append("MONGO_URI")
if not JWT_SECRET:
    missing_env.append("JWT_SECRET")

if missing_env:
    print(f"❌ Missing required environment variables: {', '.join(missing_env)}", file=sys.stderr)
    sys.exit(1)

# App environment
NODE_ENV = os.getenv("NODE_ENV", "development")
IS_PROD = NODE_ENV.lower() == "production"
PORT = int(os.getenv("PORT", 5000))

# JWT durations
JWT_EXPIRES_IN = os.getenv("JWT_EXPIRES_IN", "8h")
USER_JWT_EXPIRES_IN = os.getenv("USER_JWT_EXPIRES_IN", "30d")

# Cookie names
ADMIN_COOKIE_NAME = "ft_admin_session"
USER_COOKIE_NAME = "ft_user_session"

# Razorpay
RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "").strip()
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "").strip()
PAYMENTS_ENABLED = bool(RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET)

# Google OAuth
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "").strip()
GOOGLE_AUTH_ENABLED = bool(GOOGLE_CLIENT_ID)

# Outbound Email
MAIL_HOST = os.getenv("MAIL_HOST", "").strip()
MAIL_PORT = int(os.getenv("MAIL_PORT", 465))
mail_secure_env = os.getenv("MAIL_SECURE")
if mail_secure_env is not None:
    MAIL_SECURE = mail_secure_env.lower() == "true"
else:
    MAIL_SECURE = MAIL_PORT == 465

MAIL_USER = os.getenv("MAIL_USER", "").strip()
MAIL_PASS = os.getenv("MAIL_PASS", "").strip()
MAIL_FROM_ADDRESS = os.getenv("MAIL_FROM", "").strip() or MAIL_USER
MAIL_FROM_NAME = os.getenv("MAIL_FROM_NAME", "FeatherTown 🦜").strip()
WELCOME_SUBJECT = "Welcome to FeatherTown 🦜"

# Paths
FRONTEND_PATH = (BASE_DIR.parent / "frontend" / "dist").resolve()
INDEX_PATH = FRONTEND_PATH / "index.html"
TEMPLATES_DIR = (BASE_DIR / "templates").resolve()
PUBLIC_FRONTEND_PATH = (BASE_DIR.parent / "frontend" / "public").resolve()

# Allowed CORS Origins
env_origins = [
    os.getenv("FRONTEND_URL"),
    os.getenv("CLIENT_URL"),
    *(os.getenv("ALLOWED_ORIGINS", "").split(",") if os.getenv("ALLOWED_ORIGINS") else [])
]
env_origins = [u.strip().rstrip("/") for u in env_origins if u and u.strip()]

ALLOWED_ORIGINS = list({
    "http://localhost:5173",
    "http://localhost:3000",
    "https://feathertown.online",
    "https://www.feathertown.online",
    *env_origins
})
