from __future__ import annotations


def generate_recommendation(emotion: dict, nutrition: dict, profile: dict | None = None) -> dict:
    goal = (profile or {}).get("goal_type") or "maintain"
    risk = float(emotion.get("risk_score", 0.0))
    calories = float(nutrition.get("calories", 0.0))

    meal_tip = "本餐建议细嚼慢咽，控制进食速度。"
    if calories > 700:
        meal_tip = "本餐热量偏高，建议减少高油/高糖配菜并增加蔬菜比例。"

    next_meal = "下一餐保持均衡：优先蛋白质+蔬菜，避免补偿性极端节食。"
    behavior = "先喝300ml水，10分钟后再判断是否继续进食。"
    if risk >= 0.7:
        behavior = "检测到高风险情绪，建议先进行5分钟呼吸练习，再决定加餐。"

    return {
        "goal": goal,
        "meal_suggestion": meal_tip,
        "next_meal_suggestion": next_meal,
        "behavior_suggestion": behavior,
    }
