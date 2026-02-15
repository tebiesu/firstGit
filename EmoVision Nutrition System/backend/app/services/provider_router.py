from __future__ import annotations

from sqlalchemy import asc, select
from sqlalchemy.orm import Session

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

    async def call_with_fallback(self, task: str, prompt: str, image_urls: list[str] | None = None) -> dict:
        providers = self.list_enabled()
        if not providers:
            return {"ok": False, "content": "", "error": "no enabled providers"}

        for cfg in providers:
            try:
                provider = build_provider(
                    provider_type=cfg.provider_type,
                    base_url=cfg.base_url,
                    api_key=decrypt_secret(cfg.encrypted_api_key),
                    model_map=cfg.model_map,
                )
                request = ProviderRequest(task=task, prompt=prompt, image_urls=image_urls)
                if image_urls:
                    result = await provider.vision(request)
                else:
                    result = await provider.chat(request)

                self.db.add(
                    ProviderCallLog(
                        provider_id=cfg.id,
                        task_type=task,
                        latency_ms=result.latency_ms,
                        status="ok" if result.ok else "failed",
                        error_message=result.error,
                    )
                )
                self.db.commit()

                if result.ok:
                    return {"ok": True, "content": result.content, "provider_id": cfg.id}
            except Exception as exc:  # noqa: BLE001
                self.db.add(
                    ProviderCallLog(
                        provider_id=cfg.id,
                        task_type=task,
                        latency_ms=0,
                        status="failed",
                        error_message=str(exc),
                    )
                )
                self.db.commit()

        return {"ok": False, "content": "", "error": "all providers failed"}
