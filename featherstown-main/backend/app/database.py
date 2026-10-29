import sys
from datetime import datetime, timezone
from urllib.parse import urlparse
import motor.motor_asyncio
from pymongo import ASCENDING, TEXT

from app.config import MONGO_URI, IS_PROD
from app.seed_data import (
    INITIAL_BIRDS,
    INITIAL_ACCESSORIES,
    INITIAL_REVIEWS,
    DEFAULT_SETTINGS,
)

# Parse database name from URI or default to feathertown
parsed = urlparse(MONGO_URI)
db_name = parsed.path.lstrip("/").split("?")[0] if parsed.path else ""
if not db_name:
    db_name = "feathertown"

client = motor.motor_asyncio.AsyncIOMotorClient(
    MONGO_URI,
    serverSelectionTimeoutMS=5000,
    connectTimeoutMS=5000,
)
db = client[db_name]

# Collection references
birds_col = db["birds"]
accessories_col = db["accessories"]
orders_col = db["orders"]
reviews_col = db["reviews"]
subscribers_col = db["subscribers"]
settings_col = db["settings"]
users_col = db["users"]
admins_col = db["admins"]

async def init_db():
    """Initializes indexes and seeds the database if empty."""
    try:
        # Ping database
        await client.admin.command("ping")
        print(f"MongoDB Connected ({db_name})")

        # 1. Birds indexes
        await birds_col.create_index([("slug", ASCENDING)], unique=True)
        await birds_col.create_index([("name", TEXT), ("description", TEXT), ("category", TEXT)])

        # 2. Accessories indexes
        await accessories_col.create_index([("slug", ASCENDING)], unique=True)
        await accessories_col.create_index([("name", TEXT), ("description", TEXT)])

        # 3. Admins indexes
        await admins_col.create_index([("username", ASCENDING)], unique=True)

        # 4. Subscribers indexes
        await subscribers_col.create_index([("email", ASCENDING)], unique=True)

        # 5. Users indexes
        await users_col.create_index([("email", ASCENDING)], unique=True)
        await users_col.create_index([("googleId", ASCENDING)], unique=True, sparse=True)

        # 6. Orders indexes
        await orders_col.create_index([("razorpayOrderId", ASCENDING)], unique=True, sparse=True)

        # 7. Settings indexes
        await settings_col.create_index([("key", ASCENDING)], unique=True)

        # Auto-seed Birds
        bird_count = await birds_col.count_documents({})
        if bird_count == 0:
            print("🌱 Auto-seeding initial bird catalog in MongoDB...")
            now = datetime.now(timezone.utc)
            seeded_birds = [{**b, "createdAt": now, "updatedAt": now} for b in INITIAL_BIRDS]
            await birds_col.insert_many(seeded_birds)
            print("✅ Seeded 6 authentic birds successfully.")

        # Auto-seed Accessories
        acc_count = await accessories_col.count_documents({})
        if acc_count == 0:
            print("🌱 Auto-seeding initial accessories catalog in MongoDB...")
            now = datetime.now(timezone.utc)
            seeded_accs = [{**a, "createdAt": now, "updatedAt": now} for a in INITIAL_ACCESSORIES]
            await accessories_col.insert_many(seeded_accs)
            print("✅ Seeded initial accessories successfully.")

        # Auto-seed Reviews (development bootstrap only)
        rev_count = await reviews_col.count_documents({})
        if rev_count == 0 and not IS_PROD:
            print("🌱 Auto-seeding initial reviews catalog in MongoDB...")
            now = datetime.now(timezone.utc)
            seeded_revs = [{**r, "createdAt": now, "updatedAt": now} for r in INITIAL_REVIEWS]
            await reviews_col.insert_many(seeded_revs)
            print("✅ Seeded initial reviews successfully.")

        # Ensure Store Settings exist and backfill any missing schema fields
        settings_doc = await settings_col.find_one({"key": "store_settings"})
        now = datetime.now(timezone.utc)
        if not settings_doc:
            await settings_col.insert_one({**DEFAULT_SETTINGS, "createdAt": now, "updatedAt": now})
        else:
            missing_fields = {}
            for k, v in DEFAULT_SETTINGS.items():
                if k not in settings_doc:
                    missing_fields[k] = v
            if missing_fields:
                missing_fields["updatedAt"] = now
                await settings_col.update_one({"key": "store_settings"}, {"$set": missing_fields})

    except Exception as e:
        print(f"❌ MongoDB initialization error: {e}", file=sys.stderr)
