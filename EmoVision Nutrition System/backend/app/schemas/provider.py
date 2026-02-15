from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ProviderConfigCreate(BaseModel):
    provider_type: str
    name: str
    base_url: str
    api_key: str
    model_map: dict = {}
    priority: int = 100
    enabled: bool = True


class ProviderConfigUpdate(BaseModel):
    base_url: str | None = None
    api_key: str | None = None
    model_map: dict | None = None
    priority: int | None = None
    enabled: bool | None = None


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


class AuditLogOut(BaseModel):
    id: int
    user_id: int | None = None
    action: str
    details: dict
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
