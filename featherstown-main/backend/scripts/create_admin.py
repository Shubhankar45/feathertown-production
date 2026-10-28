"""
Creates (or resets the password of) the admin account in MongoDB.
Usage (from /backend):
  python scripts/create_admin.py <username> <password>

Example:
  python scripts/create_admin.py owner "Str0ng!Passw0rd"
"""
import sys
import os
from pathlib import Path
from datetime import datetime, timezone
import asyncio

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from app.config import MONGO_URI
from app.database import client, admins_col
from app.auth import hash_password

async def main():
    if len(sys.argv) < 3:
        print("Usage: python scripts/create_admin.py <username> <password>", file=sys.stderr)
        sys.exit(1)

    username = sys.argv[1].strip()
    password = sys.argv[2]

    if not username or not password:
        print("❌ Username and password are required.", file=sys.stderr)
        sys.exit(1)

    if len(password) < 8:
        print("❌ Password must be at least 8 characters.", file=sys.stderr)
        sys.exit(1)

    normalized_username = username.lower()
    password_hash = hash_password(password)
    now = datetime.now(timezone.utc)

    admin = await admins_col.find_one_and_update(
        {"username": normalized_username},
        {
            "$set": {
                "username": normalized_username,
                "passwordHash": password_hash,
                "role": "admin",
                "updatedAt": now,
            },
            "$setOnInsert": {
                "createdAt": now,
            },
        },
        upsert=True,
        return_document=True,
    )

    print(f"✅ Admin account ready: {admin['username']}")
    client.close()

if __name__ == "__main__":
    asyncio.run(main())
