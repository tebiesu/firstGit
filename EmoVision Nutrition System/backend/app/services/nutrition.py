from __future__ import annotations


def estimate_nutrition(image_count: int, mood_text: str | None = None) -> tuple[dict, dict]:
    foods = [
        {"name": "米饭", "confidence": 0.74, "portion": "1碗"},
        {"name": "鸡胸肉", "confidence": 0.68, "portion": "120g"},
        {"name": "西兰花", "confidence": 0.65, "portion": "80g"},
    ]
    calorie_bias = 80 if (mood_text and "甜" in mood_text) else 0
    calories = 380 + (image_count - 1) * 120 + calorie_bias
    nutrition = {
        "calories": float(calories),
        "protein": 28.0,
        "fat": 12.0,
        "carbs": 45.0,
    }
    return {"items": foods}, nutrition
