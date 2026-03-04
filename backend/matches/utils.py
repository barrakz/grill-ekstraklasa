import re
import unicodedata
from difflib import SequenceMatcher


def normalize_text(value: str) -> str:
    if not value:
        return ""

    value = value.translate(
        str.maketrans(
            {
                "ł": "l",
                "Ł": "L",
            }
        )
    )
    normalized = unicodedata.normalize("NFKD", value)
    ascii_text = normalized.encode("ascii", "ignore").decode("ascii")
    ascii_text = ascii_text.lower()
    ascii_text = re.sub(r"[^a-z0-9]+", " ", ascii_text)
    return re.sub(r"\s+", " ", ascii_text).strip()


def similarity(left: str, right: str) -> float:
    if not left or not right:
        return 0.0
    return SequenceMatcher(None, normalize_text(left), normalize_text(right)).ratio()


def slugify_value(value: str) -> str:
    return normalize_text(value).replace(" ", "-")
