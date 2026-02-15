from pydantic import BaseModel


class DailyReportResponse(BaseModel):
    date: str
    total_meals: int
    avg_risk_score: float
    total_calories: float


class WeeklyReportItem(BaseModel):
    date: str
    meals: int
    avg_risk_score: float
    total_calories: float


class WeeklyReportResponse(BaseModel):
    items: list[WeeklyReportItem]
