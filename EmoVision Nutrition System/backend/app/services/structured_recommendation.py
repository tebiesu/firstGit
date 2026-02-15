from __future__ import annotations

import json
from typing import Any

from pydantic import BaseModel, ValidationError

from app.services.recommendation import generate_recommendation


class LLMRecommendation(BaseModel):
    goal: str
    meal_suggestion: str
    next_meal_suggestion: str
    behavior_suggestion: str
    risk_alert: str | None = None


def _extract_json_blob(text: str) -> str:
    raw = text.strip()
    if raw.startswith("{") and raw.endswith("}"):
        return raw

    fence_start = raw.find("```json")
    if fence_start >= 0:
        fence_start += len("```json")
        fence_end = raw.find("```", fence_start)
        if fence_end > fence_start:
            candidate = raw[fence_start:fence_end].strip()
            if candidate:
                return candidate

    first = raw.find("{")
    last = raw.rfind("}")
    if first >= 0 and last > first:
        return raw[first : last + 1]
    raise ValueError("No JSON object found in model output")


def parse_llm_recommendation(text: str) -> dict[str, Any]:
    blob = _extract_json_blob(text)
    try:
        data = json.loads(blob)
    except json.JSONDecodeError as exc:
        raise ValueError(f"Invalid JSON: {exc}") from exc

    try:
        parsed = LLMRecommendation.model_validate(data)
    except ValidationError as exc:
        raise ValueError(f"Schema validation failed: {exc}") from exc

    return parsed.model_dump(exclude_none=True)


def build_recommendation_prompt(emotion: dict, nutrition: dict, mood_text: str, profile: dict | None) -> str:
    goal = (profile or {}).get("goal_type") or "maintain"
    return (
        "你是饮食健康助手，请只输出一个 JSON 对象，不要输出其他文字。"
        "JSON 字段必须包含: goal, meal_suggestion, next_meal_suggestion, behavior_suggestion, risk_alert(可为null)。"
        f"\n输入信息: emotion={emotion}, nutrition={nutrition}, mood_text={mood_text}, goal={goal}"
    )


def fallback_recommendation(emotion: dict, nutrition: dict, profile: dict | None, reason: str) -> dict[str, Any]:
    data = generate_recommendation(emotion=emotion, nutrition=nutrition, profile=profile)
    data["generation_mode"] = "fallback_rule"
    data["fallback_reason"] = reason
    return data
