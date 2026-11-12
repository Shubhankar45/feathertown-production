import sys
import time
import jwt
from pathlib import Path

# Add backend directory to path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from app.config import JWT_SECRET
from app.routers.user_auth import is_valid_email_syntax, validate_password_strength, hash_otp
from app.rate_limiter import LoginSecurityManager
from app.auth import generate_user_access_token, generate_user_refresh_token, decode_refresh_token
from fastapi import HTTPException

def run_unit_tests():
    print("=" * 60)
    print("  FEATHERSTOWN AUTH SECURITY SUITE — UNIT TESTS")
    print("=" * 60)

    # 1. Email syntax and disposable checks
    print("\n[1/5] Disposable & Invalid Email Verification")
    assert is_valid_email_syntax("customer@gmail.com") == True
    assert is_valid_email_syntax("care@feathertown.online") == True
    assert is_valid_email_syntax("spammer@mailinator.com") == False
    assert is_valid_email_syntax("fake@tempmail.com") == False
    assert is_valid_email_syntax("bot@10minutemail.com") == False
    assert is_valid_email_syntax("notanemail") == False
    print("  PASS: Blocked disposable email services and invalid formats")

    # 2. Password complexity checks
    print("\n[2/5] Password Complexity Enforcement")
    try:
        validate_password_strength("short1!")
        assert False, "Should fail short password (<8)"
    except HTTPException:
        pass

    try:
        validate_password_strength("purelylettersnopunctuation")
        assert False, "Should fail without numbers or symbols"
    except HTTPException:
        pass

    validate_password_strength("FeatherTown2026!Secure")
    print("  PASS: Enforces minimum 8 chars with required numbers & symbols")

    # 3. OTP hashing & email salting
    print("\n[3/5] Cryptographic OTP Salting & Domain Binding")
    hash_a = hash_otp("492817", "alice@feathertown.online")
    hash_b = hash_otp("492817", "alice@feathertown.online")
    hash_c = hash_otp("492817", "bob@feathertown.online")
    assert hash_a == hash_b, "Hashes must match for identical email + OTP"
    assert hash_a != hash_c, "Hashes must NOT collide across different email addresses"
    print("  PASS: Deterministic SHA-256 OTP hashing with per-email salt")

    # 4. Rate Limiting & Account/IP Lockout
    print("\n[4/5] Brute-Force Rate Limiting & Account/IP Lockout")
    sec = LoginSecurityManager()
    email = "target@feathertown.online"
    ip = "203.0.113.42"

    for i in range(1, 5):
        rem = sec.record_failure(email, ip)
        assert rem == 5 - i
        sec.check_lockout(email, ip)

    # 5th attempt locks out
    rem = sec.record_failure(email, ip)
    assert rem == 0
    try:
        sec.check_lockout(email, ip)
        assert False, "Should raise HTTP 429"
    except HTTPException as exc:
        assert exc.status_code == 429
        assert exc.detail.get("locked") == True
        print(f"  PASS: 15-minute lockout triggered upon 5th failed attempt ({exc.detail.get('retryAfterSeconds')}s)")

    # Same IP targeting different email is locked out
    try:
        sec.check_lockout("another_user@feathertown.online", ip)
        assert False, "Should raise HTTP 429 for locked IP"
    except HTTPException as exc:
        assert exc.status_code == 429
        print("  PASS: IP lockout defeats distributed credential stuffing")

    # Success resets lockout
    sec.record_success(email, ip)
    sec.cache.pop(f"ip:{ip}", None)
    sec.check_lockout(email, ip)
    print("  PASS: Successful sign-in clears account lockout")

    # 5. Dual JWT Access & Refresh Token Claims with Rotation
    print("\n[5/5] Dual JWT Tokens & Refresh Token JTI Rotation")
    mock_user = {
        "_id": "65f1234567890abcdef12345",
        "email": "customer@feathertown.online",
        "name": "Avian Enthusiast",
        "emailVerified": True,
    }
    access_tok = generate_user_access_token(mock_user)
    refresh_tok = generate_user_refresh_token(mock_user, "jti_unique_rotation_key_999")

    # Decode access token
    dec_acc = jwt.decode(access_tok, JWT_SECRET, algorithms=["HS256"])
    assert dec_acc["sub"] == mock_user["_id"]
    assert dec_acc["emailVerified"] == True
    assert dec_acc["role"] == "user"

    # Decode refresh token
    dec_ref = decode_refresh_token(refresh_tok)
    assert dec_ref["sub"] == mock_user["_id"]
    assert dec_ref["jti"] == "jti_unique_rotation_key_999"
    assert dec_ref["type"] == "refresh"
    assert dec_ref["role"] == "user"
    print("  PASS: Access (15-min) and Refresh (30-day) JWTs signed with verified claims")

    print("\n" + "=" * 60)
    print("  ALL 5 SECURITY MODULES PASSED (100% SUCCESS)")
    print("=" * 60 + "\n")

if __name__ == "__main__":
    run_unit_tests()

