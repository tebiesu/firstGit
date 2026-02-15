from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class MealAnalyzeResponse(BaseModel):
    meal_id: int
    emotion: dict
    nutrition: dict
    recommendation: dict
    risk_score: float


class MealHistoryItem(BaseModel):
    meal_id: int
    created_at: datetime
    mood_text: str | None = None
    emotion_label: str | None = None
    risk_score: float = 0.0
    nutrition: dict = Field(default_factory=dict)


class MealHistoryResponse(BaseModel):
    items: list[MealHistoryItem]


class MealHistoryQuery(BaseModel):
    limit: int = 20


class MealSimpleOut(BaseModel):
    id: int
    user_id: int
    image_path: str | None = None
    mood_text: str | None = None
    hunger_level: int | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
