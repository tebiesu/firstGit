from __future__ import annotations

import asyncio

from sqlalchemy import asc, select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.crypto import decrypt_secret
from app.models.provider import ProviderCallLog, ProviderConfig
from app.services.providers import ProviderRequest, build_provider


class ProviderRouterService:
    def __init__(self, db: Session):
        self.db = db

    def list_enabled(self) -> list[ProviderConfig]:
        stmt = (
            select(ProviderConfig)
            .where(ProviderConfig.enabled.is_(True))
            .order_by(asc(ProviderConfig.priority), asc(ProviderConfig.id))
        )
        return list(self.db.scalars(stmt).all())

    def _log_call(self, provider_id: int, task: str, attempt: int, latency_ms: int, ok: bool, error_message: str | None) -> None:
        self.db.add(
            ProviderCallLog(
                provider_id=provider_id,
                task_type=task,
                attempt=attempt,
                latency_ms=latency_ms,
                status="ok" if ok else "failed",
                error_message=error_message,
            )
        )
        self.db.commit()

    async def call_with_fallback(self, task: str, prompt: str, image_urls: list[str] | None = None) -> dict:
        providers = self.list_enabled()
        if not providers:
            return {"ok": False, "content": "", "error": "no enabled providers"}

        for cfg in providers:
            for attempt in range(1, settings.provider_max_retries + 1):
                try:
                    provider = build_provider(
                        provider_type=cfg.provider_type,
                        base_url=cfg.base_url,
                        api_key=decrypt_secret(cfg.encrypted_api_key),
                        model_map=cfg.model_map,
                    )
                    request = ProviderRequest(task=task, prompt=prompt, image_urls=image_urls)
                    result = await (provider.vision(request) if image_urls else provider.chat(request))

                    self._log_call(
                        provider_id=cfg.id,
                        task=task,
                        attempt=attempt,
                        latency_ms=result.latency_ms,
                        ok=result.ok,
                        error_message=result.error,
                    )
                    if result.ok:
                        return {"ok": True, "content": result.content, "provider_id": cfg.id, "attempt": attempt}
                except Exception as exc:  # noqa: BLE001
                    self._log_call(
                        provider_id=cfg.id,
                        task=task,
                        attempt=attempt,
                        latency_ms=0,
                        ok=False,
                        error_message=str(exc),
                    )

                if attempt < settings.provider_max_retries:
                    await asyncio.sleep(settings.provider_retry_backoff_seconds * attempt)

        return {"ok": False, "content": "", "error": "all providers failed"}
