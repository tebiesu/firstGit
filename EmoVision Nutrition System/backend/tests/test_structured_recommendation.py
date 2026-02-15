import pytest

from app.services.structured_recommendation import parse_llm_recommendation


def test_parse_llm_recommendation_valid_json():
    text = '{"goal":"maintain","meal_suggestion":"A","next_meal_suggestion":"B","behavior_suggestion":"C","risk_alert":null}'
    out = parse_llm_recommendation(text)
    assert out["goal"] == "maintain"
    assert out["meal_suggestion"] == "A"


def test_parse_llm_recommendation_valid_fenced_json():
    text = """这是建议\n```json
    {"goal":"fat_loss","meal_suggestion":"A","next_meal_suggestion":"B","behavior_suggestion":"C"}
    ```
    """
    out = parse_llm_recommendation(text)
    assert out["goal"] == "fat_loss"


def test_parse_llm_recommendation_invalid_schema():
    with pytest.raises(ValueError):
        parse_llm_recommendation('{"goal":"x"}')
