import json
import re
from typing import Any, Dict, List, Optional

import httpx

from ..config import settings
from ..exceptions import GroqUnavailableError

UNAVAILABLE_MSG = (
    "AI analysis is currently unavailable. Please check the configured Groq API/model."
)


def _extract_json_object(text: str) -> Dict[str, Any]:
    if not text or not text.strip():
        raise GroqUnavailableError("AI analysis returned empty output. The Groq response could not be validated.")
    raw = text.strip()
    if raw.startswith("```"):
        raw = re.sub(r"^```(?:json)?\s*", "", raw)
        raw = re.sub(r"\s*```$", "", raw)
    try:
        parsed = json.loads(raw)
        if isinstance(parsed, dict):
            return parsed
        raise GroqUnavailableError("AI analysis returned invalid JSON. Please retry the assessment.")
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", raw, re.DOTALL)
        if not match:
            raise GroqUnavailableError("AI analysis returned malformed JSON. Please retry the assessment.")
        try:
            parsed = json.loads(match.group(0))
        except json.JSONDecodeError as exc:
            raise GroqUnavailableError("AI analysis returned malformed JSON. Please retry the assessment.") from exc
        if not isinstance(parsed, dict):
            raise GroqUnavailableError("AI analysis returned invalid JSON. Please retry the assessment.")
        return parsed


def map_http_error(status_code: int, body: str) -> str:
    lower = (body or "").lower()
    if status_code in (401, 403):
        return UNAVAILABLE_MSG
    if status_code == 429:
        return "AI analysis is currently unavailable due to Groq rate limits. Please try again shortly."
    if status_code == 404 or "model" in lower and ("not found" in lower or "decommissioned" in lower or "does not exist" in lower):
        return UNAVAILABLE_MSG
    if status_code >= 500:
        return "AI analysis is currently unavailable because the Groq service returned an error."
    return UNAVAILABLE_MSG


async def groq_chat(
    messages: List[Dict[str, Any]],
    *,
    temperature: float = 0.1,
    max_tokens: int = 2200,
    json_mode: bool = True,
) -> Dict[str, Any]:
    if not settings.AI_API_KEY:
        raise GroqUnavailableError(UNAVAILABLE_MSG)
    if not settings.AI_MODEL_NAME:
        raise GroqUnavailableError(UNAVAILABLE_MSG)

    payload: Dict[str, Any] = {
        "model": settings.AI_MODEL_NAME,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
    }
    if json_mode:
        payload["response_format"] = {"type": "json_object"}

    headers = {
        "Authorization": f"Bearer {settings.AI_API_KEY}",
        "Content-Type": "application/json",
    }

    try:
        async with httpx.AsyncClient(timeout=settings.GROQ_TIMEOUT_SECONDS) as client:
            res = await client.post(settings.GROQ_API_URL, headers=headers, json=payload)
    except httpx.TimeoutException as exc:
        raise GroqUnavailableError(
            "AI analysis is currently unavailable because the Groq request timed out."
        ) from exc
    except httpx.RequestError as exc:
        raise GroqUnavailableError(
            "AI analysis is currently unavailable due to a network error contacting Groq."
        ) from exc

    if res.status_code != 200:
        # TEMP DEBUG: expose HTTP status and truncated Groq body. Remove after diagnosing.
        raise GroqUnavailableError(
            f"Groq API error (HTTP {res.status_code}): {map_http_error(res.status_code, res.text)} | Details: {(res.text or '')[:1000]}"
        )

    try:
        data = res.json()
        text = data["choices"][0]["message"]["content"]
    except (KeyError, IndexError, TypeError, ValueError) as exc:
        raise GroqUnavailableError("AI analysis is currently unavailable. Groq returned an unexpected payload.") from exc

    if json_mode:
        return _extract_json_object(text if isinstance(text, str) else json.dumps(text))
    return {"text": text if isinstance(text, str) else str(text)}
