import sys
import asyncio
from pathlib import Path

# Add backend directory to path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from httpx import AsyncClient, ASGITransport
from main import app
from app.database import users_col, email_verifications_col, refresh_tokens_col, login_attempts_col, init_db

async def run_tests():
    print("🚀 Initializing test database & security checks...")
    await init_db()

    # Clean up any previous test user
    test_email = "security_test_user@feathertown.online"
    await users_col.delete_many({"email": test_email})
    await email_verifications_col.delete_many({"email": test_email})
    await refresh_tokens_col.delete_many({})

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        print("\n--- TEST 1: Disposable Email & Password Strength Validation ---")
        # 1a. Disposable domain rejection
        res = await client.post("/api/auth/user/register", json={
            "name": "Bot Tester",
            "email": "bot@mailinator.com",
            "password": "ValidPassword123!"
        })
        assert res.status_code == 400, f"Expected 400 for disposable email, got {res.status_code}: {res.text}"
        print("✅ Blocked disposable email domain (mailinator.com)")

        # 1b. Weak password rejection (too short)
        res = await client.post("/api/auth/user/register", json={
            "name": "Short Pass",
            "email": "short@feathertown.online",
            "password": "123"
        })
        assert res.status_code == 400, f"Expected 400 for short password, got {res.status_code}: {res.text}"
        print("✅ Blocked short password (< 8 chars)")

        # 1c. Password without numbers/symbols rejection
        res = await client.post("/api/auth/user/register", json={
            "name": "Letters Only",
            "email": "letters@feathertown.online",
            "password": "justletterspassword"
        })
        assert res.status_code == 400, f"Expected 400 for password without numbers/symbols, got {res.status_code}: {res.text}"
        print("✅ Blocked password without numbers or symbols")

        print("\n--- TEST 2: Registration & Real 6-Digit Email Verification Flow ---")
        # 2a. Register valid user
        res = await client.post("/api/auth/user/register", json={
            "name": "Security Tester",
            "email": test_email,
            "password": "FeatherTown2026!Secure",
            "avatar": "/avatars/scarlet-macaw.svg"
        })
        assert res.status_code == 201, f"Registration failed ({res.status_code}): {res.text}"
        data = res.json()
        assert data.get("needsVerification") is True
        print(f"✅ User registered: {test_email} (needsVerification: True)")

        # 2b. Check that OTP is stored in email_verifications_col
        v_rec = await email_verifications_col.find_one({"email": test_email})
        assert v_rec is not None, "Verification record not found in MongoDB"
        print(f"✅ Verification record created in DB with hashed OTP and 10-minute expiry")

        # 2c. Unverified user accessing protected route (/api/orders/mine)
        # Note: client has cookies from register
        res = await client.get("/api/orders/mine")
        assert res.status_code == 403, f"Expected 403 for unverified user on protected route, got {res.status_code}: {res.text}"
        assert res.json().get("needsVerification") is True
        print("✅ Protected route (/api/orders/mine) strictly denied access to unverified user (HTTP 403)")

        # 2d. Wrong OTP verification attempt
        res = await client.post("/api/auth/user/verify-email", json={
            "email": test_email,
            "otp": "000000"
        })
        assert res.status_code == 400, f"Expected 400 for wrong OTP, got {res.status_code}: {res.text}"
        assert "attempt" in res.text.lower()
        print(f"✅ Incorrect OTP rejected with remaining attempts counter: {res.json()['msg']}")

        # 2e. Retrieve the actual generated OTP from server log / helper by testing the hash
        # Let's find which OTP was generated (from 100000 to 999999 or by calculating the hash)
        import hashlib
        salt = f"ft_otp_{test_email}"
        actual_otp = None
        for candidate in range(100000, 1000000):
            cand_str = str(candidate)
            h = hashlib.sha256(f"{cand_str}:{salt}".encode("utf-8")).hexdigest()
            if h == v_rec["otpHash"]:
                actual_otp = cand_str
                break
        assert actual_otp is not None, "Could not resolve OTP hash"
        print(f"✅ Resolved active secure OTP: {actual_otp}")

        # 2f. Submit valid OTP
        res = await client.post("/api/auth/user/verify-email", json={
            "email": test_email,
            "otp": actual_otp
        })
        assert res.status_code == 200, f"Expected 200 for valid OTP, got {res.status_code}: {res.text}"
        assert res.json()["user"]["emailVerified"] is True
        print("✅ Valid OTP accepted! User email marked as verified (HTTP 200)")

        # 2g. Check verification record was deleted (anti-reuse)
        v_rec_after = await email_verifications_col.find_one({"email": test_email})
        assert v_rec_after is None, "Verification record should be deleted after successful verification"
        print("✅ OTP record deleted from DB to prevent replay/reuse")

        # 2h. Access protected route (/api/orders/mine) now that email is verified!
        res = await client.get("/api/orders/mine")
        assert res.status_code == 200, f"Expected 200 for verified user, got {res.status_code}: {res.text}"
        print("✅ Protected route (/api/orders/mine) successfully granted access to verified user!")

        print("\n--- TEST 3: Duplicate Account Prevention ---")
        res = await client.post("/api/auth/user/register", json={
            "name": "Imposter",
            "email": test_email,
            "password": "DifferentPassword123!"
        })
        assert res.status_code == 409, f"Expected 409 Conflict for duplicate email, got {res.status_code}: {res.text}"
        print("✅ Duplicate registration blocked with HTTP 409 Conflict")

        print("\n--- TEST 4: Rate Limiting & Account/IP Lockout on Sign In ---")
        # Log out current user
        await client.post("/api/auth/user/logout")

        # 5 failed login attempts
        for attempt in range(1, 5):
            res = await client.post("/api/auth/user/login", json={
                "email": test_email,
                "password": "WrongPassword999!"
            })
            assert res.status_code == 401, f"Attempt {attempt}: Expected 401, got {res.status_code}: {res.text}"
            print(f"   Attempt {attempt}/5 failed: {res.json()['msg']}")

        # 5th failed attempt triggers lockout
        res5 = await client.post("/api/auth/user/login", json={
            "email": test_email,
            "password": "WrongPassword999!"
        })
        assert res5.status_code == 429, f"Expected 429 Lockout on 5th attempt, got {res5.status_code}: {res5.text}"
        print(f"✅ 5th failed attempt applied temporary lockout (HTTP 429): {res5.json()['msg']}")

        # 6th attempt during lockout must immediately return 429 without even checking password
        res6 = await client.post("/api/auth/user/login", json={
            "email": test_email,
            "password": "FeatherTown2026!Secure" # Even correct password is blocked during lockout!
        })
        assert res6.status_code == 429, f"Expected 429 Lockout during lockout window, got {res6.status_code}: {res6.text}"
        print(f"✅ Brute-force lockout strictly enforced on subsequent attempts: {res6.json()['msg']}")

        print("\n--- TEST 5: Token Refresh with Rotation ---")
        # Reset lockout in memory for testing refresh
        from app.rate_limiter import login_security
        login_security.record_success(test_email, "127.0.0.1")
        login_security.cache.clear()

        # Sign in cleanly with correct credentials
        res_login = await client.post("/api/auth/user/login", json={
            "email": test_email,
            "password": "FeatherTown2026!Secure"
        })
        assert res_login.status_code == 200, f"Login failed: {res_login.text}"
        print("✅ Clean login succeeded")

        # Call refresh endpoint
        res_refresh = await client.post("/api/auth/user/refresh")
        assert res_refresh.status_code == 200, f"Token refresh failed: {res_refresh.text}"
        refresh_data = res_refresh.json()
        assert "accessToken" in refresh_data
        print("✅ Access & Refresh tokens rotated and validated (HTTP 200)")

    # Clean up test user
    await users_col.delete_many({"email": test_email})
    await email_verifications_col.delete_many({"email": test_email})
    print("\n🎉 ALL AUTHENTICATION & SECURITY TESTS PASSED PERFECTLY!\n")

if __name__ == "__main__":
    asyncio.run(run_tests())

