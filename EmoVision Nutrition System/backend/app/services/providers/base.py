from __future__ import annotations

from dataclasses import dataclass


@dataclass
class ProviderRequest:
    task: str
    prompt: str
    image_urls: list[str] | None = None
    temperature: float = 0.2


@dataclass
class ProviderResult:
    ok: bool
    content: str
    latency_ms: int
    error: str | None = None


class BaseProvider:
    def __init__(self, base_url: str, api_key: str, model_map: dict | None = None):
        self.base_url = base_url.rstrip("/")
        self.api_key = api_key
        self.model_map = model_map or {}

    def model_for(self, task: str) -> str:
        return self.model_map.get(task) or self.model_map.get("default") or "default-model"

    async def chat(self, request: ProviderRequest) -> ProviderResult:
        raise NotImplementedError

    async def vision(self, request: ProviderRequest) -> ProviderResult:
        raise NotImplementedError

    async def health_check(self) -> ProviderResult:
        raise NotImplementedError
