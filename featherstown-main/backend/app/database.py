import sys
from datetime import datetime, timezone
from urllib.parse import urlparse
import motor.motor_asyncio
from pymongo import ASCENDING, DESCENDING, TEXT

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
refresh_tokens_col = db["refresh_tokens"]
email_verifications_col = db["email_verifications"]
login_attempts_col = db["login_attempts"]
invoices_col = db["invoices"]
transactions_col = db["transactions"]
customers_col = db["customers"]
audit_logs_col = db["audit_logs"]
notifications_col = db["notifications"]
fcm_tokens_col = db["fcm_tokens"]
ad_credentials_col = db["ad_credentials"]
ad_campaigns_col = db["ad_campaigns"]

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
        await users_col.create_index([("appleId", ASCENDING)], unique=True, sparse=True)

        # 6. Orders indexes
        await orders_col.create_index([("razorpayOrderId", ASCENDING)], unique=True, sparse=True)

        # 7. Settings indexes
        await settings_col.create_index([("key", ASCENDING)], unique=True)

        # 8. Refresh Tokens (Auto-expires on expiresAt)
        await refresh_tokens_col.create_index([("userId", ASCENDING), ("jti", ASCENDING)], unique=True)
        await refresh_tokens_col.create_index([("expiresAt", ASCENDING)], expireAfterSeconds=0)

        # 9. Email Verifications (Auto-expires on expiresAt)
        await email_verifications_col.create_index([("email", ASCENDING)], unique=True)
        await email_verifications_col.create_index([("expiresAt", ASCENDING)], expireAfterSeconds=0)

        # 10. Login Security & Brute-Force Lockouts (Auto-expires on lockedUntil)
        await login_attempts_col.create_index([("key", ASCENDING)], unique=True)
        await login_attempts_col.create_index([("lockedUntil", ASCENDING)], expireAfterSeconds=0)

        # 11. Invoices & Billing Indexes
        await invoices_col.create_index([("invoiceNumber", ASCENDING)], unique=True)
        await invoices_col.create_index([("orderId", ASCENDING)], sparse=True)
        await invoices_col.create_index([("paymentStatus", ASCENDING)])
        await invoices_col.create_index([("createdAt", DESCENDING)])
        await invoices_col.create_index([("customer.phone", ASCENDING)])

        # 12. Financial Transactions Ledger Indexes
        await transactions_col.create_index([("transactionId", ASCENDING)], unique=True)
        await transactions_col.create_index([("type", ASCENDING)])
        await transactions_col.create_index([("category", ASCENDING)])
        await transactions_col.create_index([("date", DESCENDING)])

        # 13. Customers Directory Indexes
        await customers_col.create_index([("phone", ASCENDING)], sparse=True)
        await customers_col.create_index([("email", ASCENDING)], sparse=True)
        await customers_col.create_index([("createdAt", DESCENDING)])
        await customers_col.create_index([("totalSpent", DESCENDING)])

        # 14. Audit Logs Indexes
        await audit_logs_col.create_index([("timestamp", DESCENDING)])
        await audit_logs_col.create_index([("entityType", ASCENDING)])
        await audit_logs_col.create_index([("adminUsername", ASCENDING)])

        # 15. Notifications Indexes
        await notifications_col.create_index([("createdAt", DESCENDING)])
        await notifications_col.create_index([("isRead", ASCENDING)])
        await notifications_col.create_index([("category", ASCENDING)])
        await fcm_tokens_col.create_index([("token", ASCENDING)], unique=True)

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
