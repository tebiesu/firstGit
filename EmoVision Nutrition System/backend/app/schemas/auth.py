from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserRegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str | None = None


class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserBrief(BaseModel):
    id: int
    email: EmailStr
    role: str
    full_name: str | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
