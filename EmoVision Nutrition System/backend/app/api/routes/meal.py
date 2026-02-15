from datetime import datetime
from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, UploadFile
from sqlalchemy import desc, select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.config import settings
from app.db.deps import get_db
from app.models.meal import EmotionRecord, Meal, MealAnalysis, Recommendation
from app.models.user import HealthProfile, User
from app.schemas.meal import MealAnalyzeResponse, MealHistoryItem, MealHistoryResponse
from app.services.emotion import analyze_emotion
from app.services.nutrition import estimate_nutrition
from app.services.provider_router import ProviderRouterService
from app.services.recommendation import generate_recommendation

router = APIRouter()


def _save_upload(file: UploadFile) -> str:
    upload_dir = Path(settings.uploads_dir)
    upload_dir.mkdir(parents=True, exist_ok=True)
    target = upload_dir / f"{datetime.utcnow().strftime('%Y%m%d%H%M%S%f')}_{file.filename}"
    data = file.file.read()
    target.write_bytes(data)
    return str(target.as_posix())


@router.post("/analyze", response_model=MealAnalyzeResponse)
async def analyze_meal(
    mood_text: str = Form(default=""),
    hunger_level: int | None = Form(default=None),
    stress_level: int | None = Form(default=None),
    images: list[UploadFile] = File(default=[]),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    image_paths: list[str] = []
    for image in images[:3]:
        image_paths.append(_save_upload(image))

    meal = Meal(
        user_id=current_user.id,
        image_path=image_paths[0] if image_paths else None,
        mood_text=mood_text,
        hunger_level=hunger_level,
    )
    db.add(meal)
    db.flush()

    emotion = analyze_emotion(mood_text=mood_text, stress=stress_level, hunger=hunger_level)
    foods, nutrition = estimate_nutrition(image_count=max(len(image_paths), 1), mood_text=mood_text)

    router_service = ProviderRouterService(db)
    llm_hint = await router_service.call_with_fallback(
        task="recommend",
        prompt=(
            "请根据用户情绪和营养信息给出JSON建议。"
            f"emotion={emotion}; nutrition={nutrition}; mood_text={mood_text}"
        ),
    )

    profile = db.scalar(select(HealthProfile).where(HealthProfile.user_id == current_user.id))
    recommendation_content = generate_recommendation(emotion=emotion, nutrition=nutrition, profile=profile.__dict__ if profile else None)

    if llm_hint.get("ok") and llm_hint.get("content"):
        recommendation_content["llm_raw"] = llm_hint["content"]

    db.add(
        MealAnalysis(
            meal_id=meal.id,
            foods=foods,
            nutrition=nutrition,
            risk_score=emotion["risk_score"],
            raw_model_output={"provider": llm_hint},
        )
    )
    db.add(
        EmotionRecord(
            meal_id=meal.id,
            label=emotion["label"],
            stress_score=emotion["stress_score"],
            negative_score=emotion["negative_score"],
        )
    )
    db.add(Recommendation(meal_id=meal.id, content=recommendation_content))
    db.commit()

    return MealAnalyzeResponse(
        meal_id=meal.id,
        emotion=emotion,
        nutrition=nutrition,
        recommendation=recommendation_content,
        risk_score=emotion["risk_score"],
    )


@router.get("/history", response_model=MealHistoryResponse)
def meal_history(
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    stmt = (
        select(Meal, MealAnalysis, EmotionRecord)
        .outerjoin(MealAnalysis, MealAnalysis.meal_id == Meal.id)
        .outerjoin(EmotionRecord, EmotionRecord.meal_id == Meal.id)
        .where(Meal.user_id == current_user.id)
        .order_by(desc(Meal.created_at))
        .limit(min(max(limit, 1), 100))
    )

    rows = db.execute(stmt).all()
    items: list[MealHistoryItem] = []
    for meal, analysis, emotion in rows:
        items.append(
            MealHistoryItem(
                meal_id=meal.id,
                created_at=meal.created_at,
                mood_text=meal.mood_text,
                emotion_label=emotion.label if emotion else None,
                risk_score=analysis.risk_score if analysis else 0.0,
                nutrition=analysis.nutrition if analysis else {},
            )
        )

    return MealHistoryResponse(items=items)
