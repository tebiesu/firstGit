from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr


class HealthProfileUpdate(BaseModel):
    goal_type: str = "maintain"
    calorie_target: int | None = None
    allergies: str | None = None
    chronic_conditions: str | None = None
    food_restrictions: str | None = None


class HealthProfileOut(HealthProfileUpdate):
    id: int
    user_id: int

    model_config = ConfigDict(from_attributes=True)


class UserProfileOut(BaseModel):
    id: int
    email: EmailStr
    role: str
    full_name: str | None = None
    age: int | None = None
    created_at: datetime
    profile: HealthProfileOut | None = None

    model_config = ConfigDict(from_attributes=True)
