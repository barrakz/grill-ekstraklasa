"""Utilities for generating AI responses to user comments.
Currently uses a placeholder implementation; integrate real provider (e.g., Gemini) via requests.
"""

from __future__ import annotations

import os
import logging
from typing import Optional
from django.utils import timezone

import requests

logger = logging.getLogger(__name__)

GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-1.5-flash-latest")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")  # DO NOT hardcode keys; set in environment
GEMINI_URL_TMPL = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"

SYSTEM_INSTRUCTION = (
    "Jesteś sarkastycznym, ale inteligentnym komentatorem piłkarskim. "
    "Odpowiadasz krótko (1–2 zdania) na komentarz kibica."
)


def build_payload(user_comment: str):
    prompt = (
        "Jesteś szyderczym komentatorem sportowym. Twoim zadaniem jest zwięźle, "
        "ironicznie lub złośliwie skomentować poniższy komentarz kibica o piłkarzu.\n"
        "Maksymalnie 1–2 zdania. Możesz użyć inteligentnej ironii.\n\n"
        f'Komentarz kibica:\n"{user_comment}"'
    )
    return {
        "contents": [
            {
                "role": "user",
                "parts": [{"text": prompt}],
            }
        ],
        "generationConfig": {"temperature": 0.3},
        "system_instruction": {"parts": [{"text": SYSTEM_INSTRUCTION}]},
    }


def extract_text(resp_json) -> str:
    try:
        return resp_json["candidates"][0]["content"]["parts"][0]["text"].strip()
    except Exception:
        return ""


def generate_ai_response(comment_text: str) -> Optional[str]:
    """Call Gemini API; return short response or None on failure."""
    if not GEMINI_API_KEY:
        return None
    try:
        url = GEMINI_URL_TMPL.format(model=GEMINI_MODEL, api_key=GEMINI_API_KEY)
        payload = build_payload(comment_text)
        resp = requests.post(url, json=payload, timeout=30)
        if resp.status_code >= 400:
            return None
        text = extract_text(resp.json())
        return text or None
    except requests.RequestException:
        return None


def attach_ai_response(comment_obj, force: bool = False):
    """Generate and persist AI response if missing or force=True."""
    if comment_obj.ai_response and not force:
        return comment_obj.ai_response
    ai_text = generate_ai_response(comment_obj.content)
    if ai_text:
        comment_obj.ai_response = ai_text
        comment_obj.ai_generated_at = timezone.now()
        comment_obj.save(update_fields=["ai_response", "ai_generated_at"])
    return comment_obj.ai_response
