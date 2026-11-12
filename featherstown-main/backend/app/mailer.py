import os
import socket
import ssl
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from pathlib import Path

from app.config import (
    MAIL_HOST,
    MAIL_PORT,
    MAIL_SECURE,
    MAIL_USER,
    MAIL_PASS,
    MAIL_FROM_ADDRESS,
    MAIL_FROM_NAME,
    WELCOME_SUBJECT,
    TEMPLATES_DIR,
    IS_PROD,
)

# Template cache
welcome_email_html = "<p>Welcome to FeatherTown 🦜</p>"
template_path = TEMPLATES_DIR / "welcome_email.html"

if template_path.exists():
    try:
        welcome_email_html = template_path.read_text(encoding="utf-8")
        print("✅ Email template loaded")
    except Exception as e:
        print(f"⚠️ Template error: {e}")
else:
    print("⚠️ Template not found, using fallback")

welcome_email_text = "\n".join([
    "Welcome to FeatherTown 🦜",
    "",
    "Thanks for subscribing! You'll now get expert bird-care tips, nutrition",
    "guides, and a first look at our newest arrivals — straight to your inbox.",
    "",
    "Explore our birds:  https://www.feathertown.online",
    "Chat on WhatsApp:   https://wa.me/919556747518",
    "",
    "FeatherTown · Sundargarh, Odisha, India",
    "support@feathertown.online · +91 9556747518",
    "",
    "You're receiving this because you subscribed at feathertown.online.",
    "To unsubscribe, reply to this email with the subject 'Unsubscribe'.",
])

mail_enabled = bool(MAIL_HOST and MAIL_USER and MAIL_PASS)

# IPv4 resolution helper (Render IPv6 workaround)
resolved_mail_host = MAIL_HOST
if mail_enabled:
    try:
        infos = socket.getaddrinfo(MAIL_HOST, MAIL_PORT, socket.AF_INET)
        if infos:
            resolved_mail_host = infos[0][4][0]
            print(f"📧 Resolved {MAIL_HOST} → IPv4 {resolved_mail_host}")
    except Exception as e:
        print(f"⚠️ IPv4 resolve failed for {MAIL_HOST}; using hostname. {e}")

if not IS_PROD:
    print("📧 MAIL DEBUG:", {
        "host": MAIL_HOST,
        "port": MAIL_PORT,
        "user": MAIL_USER,
        "from": MAIL_FROM_ADDRESS,
        "pass": "EXISTS" if MAIL_PASS else "MISSING",
    })

def send_welcome_email(email_to: str):
    """Sends automated welcome email via SMTP in background."""
    if not mail_enabled:
        print(f"⚠️ Email not sent (transporter missing) for: {email_to}")
        return

    try:
        msg = MIMEMultipart("alternative")
        msg["From"] = f'"{MAIL_FROM_NAME}" <{MAIL_FROM_ADDRESS}>'
        msg["To"] = email_to
        msg["Reply-To"] = MAIL_FROM_ADDRESS
        msg["Subject"] = WELCOME_SUBJECT
        msg["List-Unsubscribe"] = f"<mailto:{MAIL_FROM_ADDRESS}?subject=Unsubscribe>"

        part_text = MIMEText(welcome_email_text, "plain", "utf-8")
        part_html = MIMEText(welcome_email_html, "html", "utf-8")
        msg.attach(part_text)
        msg.attach(part_html)

        context = ssl.create_default_context()
        context.check_hostname = False
        context.verify_mode = ssl.CERT_NONE

        if MAIL_PORT == 465 or MAIL_SECURE:
            with smtplib.SMTP_SSL(resolved_mail_host, MAIL_PORT, context=context, timeout=15) as server:
                server.login(MAIL_USER, MAIL_PASS)
                server.sendmail(MAIL_FROM_ADDRESS, [email_to], msg.as_string())
        else:
            with smtplib.SMTP(resolved_mail_host, MAIL_PORT, timeout=15) as server:
                if MAIL_SECURE:
                    server.starttls(context=context)
                server.login(MAIL_USER, MAIL_PASS)
                server.sendmail(MAIL_FROM_ADDRESS, [email_to], msg.as_string())

        print(f"✅ Welcome email sent to: {email_to}")
    except Exception as e:
        print(f"❌ Email send failed for {email_to} - {e}")

def send_verification_otp_email(email_to: str, otp: str, user_name: str = "Bird Lover"):
    """Sends 6-digit security OTP email to verify new customer accounts."""
    print(f"🔐 [AUTH OTP DISPATCH] To: {email_to} | Code: {otp} | User: {user_name}")

    if not mail_enabled:
        print(f"⚠️ SMTP not configured. OTP logged above for development/testing.")
        return True

    try:
        msg = MIMEMultipart("alternative")
        msg["From"] = f'"{MAIL_FROM_NAME}" <{MAIL_FROM_ADDRESS}>'
        msg["To"] = email_to
        msg["Reply-To"] = MAIL_FROM_ADDRESS
        msg["Subject"] = f"{otp} is your FeatherTown Verification Code"

        text_content = (
            f"Hello {user_name},\n\n"
            f"Your FeatherTown verification code is: {otp}\n\n"
            "This code is valid for 10 minutes. For your security, never share this code with anyone.\n\n"
            "If you didn't create an account with FeatherTown, you can safely ignore this message.\n\n"
            "— The FeatherTown Aviary Team\n"
            "support@feathertown.online · https://www.feathertown.online"
        )

        html_content = f"""
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FAF8F5; margin: 0; padding: 24px; color: #152B17; }}
    .container {{ max-width: 540px; margin: 0 auto; background: #FFFFFF; border-radius: 20px; border: 1px solid #E2DDD3; overflow: hidden; box-shadow: 0 4px 20px rgba(27, 59, 34, 0.06); }}
    .header {{ background: #1B3B22; padding: 28px 24px; text-align: center; color: #FAF8F5; }}
    .brand {{ font-size: 24px; font-weight: 900; letter-spacing: -0.02em; }}
    .brand-red {{ color: #D9381E; }}
    .body {{ padding: 32px 28px; }}
    .otp-box {{ background: #FAF8F5; border: 2px dashed #1B3B22; border-radius: 14px; padding: 18px; text-align: center; margin: 24px 0; }}
    .otp-code {{ font-size: 34px; font-weight: 900; letter-spacing: 8px; color: #1B3B22; font-family: monospace, monospace; }}
    .notice {{ font-size: 13px; color: #736B5E; line-height: 1.5; margin-top: 20px; border-top: 1px solid #E2DDD3; padding-top: 16px; }}
    .footer {{ background: #FAF8F5; padding: 18px 24px; text-align: center; font-size: 12px; color: #736B5E; border-top: 1px solid #E2DDD3; }}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand">Feather<span class="brand-red">Town</span>.</div>
      <div style="font-size: 12px; opacity: 0.85; margin-top: 4px; text-transform: uppercase; letter-spacing: 1px;">Security &amp; Verification</div>
    </div>
    <div class="body">
      <h2 style="margin: 0 0 12px 0; font-size: 20px; color: #152B17;">Verify Your Email Address</h2>
      <p style="font-size: 14.5px; line-height: 1.6; color: #4B463E; margin: 0 0 16px 0;">
        Hello <strong>{user_name}</strong>, thank you for joining FeatherTown. Please enter this 6-digit verification code to activate your customer account:
      </p>

      <div class="otp-box">
        <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #736B5E; margin-bottom: 6px;">Your 6-Digit Code</div>
        <div class="otp-code">{otp}</div>
      </div>

      <p style="font-size: 13px; color: #736B5E; text-align: center; margin: 0 0 16px 0;">
        ⏱️ This code expires in <strong>10 minutes</strong>. Single use only.
      </p>

      <div class="notice">
        <strong>Security Tip:</strong> FeatherTown staff will never ask for your code. If you did not request this verification, someone may have entered your email by mistake — you can safely ignore this email.
      </div>
    </div>
    <div class="footer">
      FeatherTown Aviary · Certified Ethical Companion Birds &amp; Supplies<br>
      Sundargarh, Odisha, India · <a href="https://www.feathertown.online" style="color: #1B3B22;">feathertown.online</a>
    </div>
  </div>
</body>
</html>
"""

        part_text = MIMEText(text_content, "plain", "utf-8")
        part_html = MIMEText(html_content, "html", "utf-8")
        msg.attach(part_text)
        msg.attach(part_html)

        context = ssl.create_default_context()
        context.check_hostname = False
        context.verify_mode = ssl.CERT_NONE

        if MAIL_PORT == 465 or MAIL_SECURE:
            with smtplib.SMTP_SSL(resolved_mail_host, MAIL_PORT, context=context, timeout=15) as server:
                server.login(MAIL_USER, MAIL_PASS)
                server.sendmail(MAIL_FROM_ADDRESS, [email_to], msg.as_string())
        else:
            with smtplib.SMTP(resolved_mail_host, MAIL_PORT, timeout=15) as server:
                if MAIL_SECURE:
                    server.starttls(context=context)
                server.login(MAIL_USER, MAIL_PASS)
                server.sendmail(MAIL_FROM_ADDRESS, [email_to], msg.as_string())

        print(f"✅ Verification OTP email dispatched to: {email_to}")
        return True
    except Exception as e:
        print(f"❌ Failed to dispatch verification email to {email_to}: {e}")
        return False
