from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.deps import get_db
from app.models.user import HealthProfile, User
from app.schemas.user import HealthProfileUpdate, UserProfileOut

router = APIRouter()


@router.get("", response_model=UserProfileOut)
def get_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db.refresh(current_user)
    return current_user


@router.put("", response_model=UserProfileOut)
def update_profile(
    payload: HealthProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = db.query(HealthProfile).filter(HealthProfile.user_id == current_user.id).first()
    if not profile:
        profile = HealthProfile(user_id=current_user.id)
        db.add(profile)

    profile.goal_type = payload.goal_type
    profile.calorie_target = payload.calorie_target
    profile.allergies = payload.allergies
    profile.chronic_conditions = payload.chronic_conditions
    profile.food_restrictions = payload.food_restrictions

    db.commit()
    db.refresh(current_user)
    return current_user
