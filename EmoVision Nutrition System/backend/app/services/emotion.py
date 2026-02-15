from __future__ import annotations


def analyze_emotion(mood_text: str | None, stress: int | None = None, hunger: int | None = None) -> dict:
    text = (mood_text or "").lower()
    label = "平稳"
    risk = 0.2

    if any(k in text for k in ["焦虑", "烦", "压力", "anxious", "stress"]):
        label = "焦虑"
        risk += 0.35
    if any(k in text for k in ["难过", "低落", "sad", "depressed"]):
        label = "低落"
        risk += 0.25
    if any(k in text for k in ["暴食", "停不下来", "binge"]):
        label = "高风险"
        risk += 0.45

    if stress is not None:
        risk += min(max(stress, 0), 10) * 0.03
    if hunger is not None:
        risk += min(max(hunger, 0), 10) * 0.02

    risk = min(round(risk, 2), 1.0)
    return {
        "label": label,
        "stress_score": round((stress or 5) / 10, 2),
        "negative_score": risk,
        "risk_score": risk,
    }
