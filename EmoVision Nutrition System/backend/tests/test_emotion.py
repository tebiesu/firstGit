from app.services.emotion import analyze_emotion


def test_emotion_high_risk():
    result = analyze_emotion("今天很焦虑，压力大，想暴食", stress=8, hunger=7)
    assert result["risk_score"] >= 0.7


def test_emotion_stable():
    result = analyze_emotion("今天还不错", stress=2, hunger=3)
    assert result["risk_score"] < 0.5
