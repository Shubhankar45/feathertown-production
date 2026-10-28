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
