from datetime import date, datetime, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import and_, func, select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.deps import get_db
from app.models.meal import Meal, MealAnalysis
from app.models.user import User
from app.schemas.report import DailyReportResponse, WeeklyReportItem, WeeklyReportResponse

router = APIRouter()


@router.get("/daily", response_model=DailyReportResponse)
def daily_report(
    target_date: date | None = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    day = target_date or date.today()
    start = datetime.combine(day, datetime.min.time())
    end = datetime.combine(day, datetime.max.time())

    stmt = (
        select(
            func.count(Meal.id),
            func.coalesce(func.avg(MealAnalysis.risk_score), 0.0),
            func.coalesce(func.sum(MealAnalysis.nutrition["calories"].as_float()), 0.0),
        )
        .join(MealAnalysis, MealAnalysis.meal_id == Meal.id, isouter=True)
        .where(and_(Meal.user_id == current_user.id, Meal.created_at >= start, Meal.created_at <= end))
    )
    total_meals, avg_risk, total_cal = db.execute(stmt).one()
    return DailyReportResponse(
        date=day.isoformat(),
        total_meals=int(total_meals or 0),
        avg_risk_score=round(float(avg_risk or 0.0), 2),
        total_calories=round(float(total_cal or 0.0), 2),
    )


@router.get("/weekly", response_model=WeeklyReportResponse)
def weekly_report(
    end_date: date | None = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    final_day = end_date or date.today()
    items: list[WeeklyReportItem] = []

    for i in range(6, -1, -1):
        day = final_day - timedelta(days=i)
        start = datetime.combine(day, datetime.min.time())
        end = datetime.combine(day, datetime.max.time())
        stmt = (
            select(
                func.count(Meal.id),
                func.coalesce(func.avg(MealAnalysis.risk_score), 0.0),
                func.coalesce(func.sum(MealAnalysis.nutrition["calories"].as_float()), 0.0),
            )
            .join(MealAnalysis, MealAnalysis.meal_id == Meal.id, isouter=True)
            .where(and_(Meal.user_id == current_user.id, Meal.created_at >= start, Meal.created_at <= end))
        )
        meals, avg_risk, calories = db.execute(stmt).one()
        items.append(
            WeeklyReportItem(
                date=day.isoformat(),
                meals=int(meals or 0),
                avg_risk_score=round(float(avg_risk or 0.0), 2),
                total_calories=round(float(calories or 0.0), 2),
            )
        )

    return WeeklyReportResponse(items=items)
