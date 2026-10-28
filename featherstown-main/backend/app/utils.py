import re
from datetime import datetime, timezone
from typing import Any, Union
from bson import ObjectId

def slugify(text: str) -> str:
    """Converts a string to a clean URL slug, matching JavaScript implementation."""
    s = str(text or "").strip().lower()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    s = re.sub(r"(^-|-$)", "", s)
    return s

def is_valid_object_id(val: str) -> bool:
    """Checks if a string is a valid 24-character hex MongoDB ObjectId."""
    return bool(re.match(r"^[0-9a-fA-F]{24}$", str(val or "").strip()))

def to_object_id(val: Union[str, ObjectId]) -> ObjectId:
    if isinstance(val, ObjectId):
        return val
    return ObjectId(str(val))

def format_datetime(dt: datetime) -> str:
    """Format datetime to ISO 8601 string with Z suffix matching Node/Mongoose."""
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.%fZ")

def serialize_doc(doc: Any) -> Any:
    """Recursively serializes MongoDB documents for JSON response.
    - Converts ObjectId to str
    - Converts datetime to ISO-8601 string
    - Strips sensitive fields like passwordHash
    """
    if doc is None:
        return None

    if isinstance(doc, list):
        return [serialize_doc(item) for item in doc]

    if isinstance(doc, dict):
        result = {}
        for k, v in doc.items():
            if k == "passwordHash":
                # Never expose password hash in API responses
                continue
            if k == "_id" and isinstance(v, ObjectId):
                result["_id"] = str(v)
            elif isinstance(v, ObjectId):
                result[k] = str(v)
            elif isinstance(v, datetime):
                result[k] = format_datetime(v)
            elif isinstance(v, (dict, list)):
                result[k] = serialize_doc(v)
            else:
                result[k] = v
        return result

    if isinstance(doc, ObjectId):
        return str(doc)

    if isinstance(doc, datetime):
        return format_datetime(doc)

    return doc

def parse_duration_seconds(duration: str, default_seconds: int = 28800) -> int:
    """Parses duration strings like '8h', '30d', '15m' into seconds."""
    if not duration:
        return default_seconds
    match = re.match(r"^(\d+)\s*([smhdw])$", str(duration).strip().lower())
    if not match:
        try:
            return int(duration)
        except ValueError:
            return default_seconds
    num, unit = int(match.group(1)), match.group(2)
    units = {
        "s": 1,
        "m": 60,
        "h": 3600,
        "d": 86400,
        "w": 604800,
    }
    return num * units.get(unit, 1)
