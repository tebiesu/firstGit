from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator


class ProviderConfigCreate(BaseModel):
    provider_type: Literal["openai_compatible", "new_api", "gemini", "claude"]
    name: str
    base_url: str
    api_key: str
    model_map: dict[str, str] = Field(default_factory=dict)
    priority: int = 100
    enabled: bool = True

    @field_validator("base_url")
    @classmethod
    def validate_base_url(cls, value: str) -> str:
        value = value.strip()
        if not value.startswith(("http://", "https://")):
            raise ValueError("base_url must start with http:// or https://")
        return value.rstrip("/")

    @field_validator("model_map")
    @classmethod
    def validate_model_map(cls, value: dict[str, str]) -> dict[str, str]:
        allowed_tasks = {"default", "emotion", "vision", "recommend"}
        invalid = [k for k in value.keys() if k not in allowed_tasks]
        if invalid:
            raise ValueError(f"model_map keys must be within {sorted(allowed_tasks)}")
        return value


class ProviderConfigUpdate(BaseModel):
    base_url: str | None = None
    api_key: str | None = None
    model_map: dict[str, str] | None = None
    priority: int | None = None
    enabled: bool | None = None

    @field_validator("base_url")
    @classmethod
    def validate_base_url(cls, value: str | None) -> str | None:
        if value is None:
            return None
        value = value.strip()
        if not value.startswith(("http://", "https://")):
            raise ValueError("base_url must start with http:// or https://")
        return value.rstrip("/")

    @field_validator("model_map")
    @classmethod
    def validate_model_map(cls, value: dict[str, str] | None) -> dict[str, str] | None:
        if value is None:
            return None
        allowed_tasks = {"default", "emotion", "vision", "recommend"}
        invalid = [k for k in value.keys() if k not in allowed_tasks]
        if invalid:
            raise ValueError(f"model_map keys must be within {sorted(allowed_tasks)}")
        return value


class ProviderConfigOut(BaseModel):
    id: int
    provider_type: str
    name: str
    base_url: str
    model_map: dict
    priority: int
    enabled: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ProviderHealthCheckResult(BaseModel):
    provider_id: int
    ok: bool
    detail: str


class ProviderTemplateOut(BaseModel):
    provider_type: str
    recommended_model_map: dict[str, str]


class AuditLogOut(BaseModel):
    id: int
    user_id: int | None = None
    action: str
    details: dict
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
