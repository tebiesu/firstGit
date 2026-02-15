import asyncio
from datetime import datetime

from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session, sessionmaker

from app.core.crypto import encrypt_secret
from app.db.base import Base
from app.models.provider import ProviderCallLog, ProviderConfig
from app.services import provider_router as router_mod
from app.services.provider_router import ProviderRouterService


class _FailThenSucceedProvider:
    def __init__(self):
        self.calls = 0

    async def chat(self, _request):
        self.calls += 1
        if self.calls == 1:
            return type("R", (), {"ok": False, "content": "", "latency_ms": 10, "error": "temp fail"})()
        return type("R", (), {"ok": True, "content": "ok", "latency_ms": 8, "error": None})()

    async def vision(self, request):
        return await self.chat(request)


class _AlwaysSuccessProvider:
    async def chat(self, _request):
        return type("R", (), {"ok": True, "content": "backup", "latency_ms": 7, "error": None})()

    async def vision(self, request):
        return await self.chat(request)


class _AlwaysFailProvider:
    async def chat(self, _request):
        return type("R", (), {"ok": False, "content": "", "latency_ms": 9, "error": "fail"})()

    async def vision(self, request):
        return await self.chat(request)


def _build_db() -> Session:
    engine = create_engine("sqlite+pysqlite:///:memory:", future=True)
    Base.metadata.create_all(bind=engine)
    local_session = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    return local_session()


def test_provider_retry_then_success(monkeypatch):
    db = _build_db()
    db.add(
        ProviderConfig(
            provider_type="openai_compatible",
            name="p1",
            base_url="http://x",
            encrypted_api_key=encrypt_secret("k"),
            model_map={"default": "m"},
            priority=1,
            enabled=True,
        )
    )
    db.commit()

    provider = _FailThenSucceedProvider()
    monkeypatch.setattr(router_mod, "build_provider", lambda **kwargs: provider)
    monkeypatch.setattr(router_mod.settings, "provider_max_retries", 2)
    monkeypatch.setattr(router_mod.settings, "provider_retry_backoff_seconds", 0)

    result = asyncio.run(ProviderRouterService(db).call_with_fallback(task="recommend", prompt="x"))
    assert result["ok"] is True
    assert result["attempt"] == 2

    logs = list(db.scalars(select(ProviderCallLog)).all())
    assert len(logs) == 2
    assert [log.status for log in logs] == ["failed", "ok"]


def test_provider_fallback_to_next_provider(monkeypatch):
    db = _build_db()
    db.add_all(
        [
            ProviderConfig(
                provider_type="openai_compatible",
                name="p1",
                base_url="http://x",
                encrypted_api_key=encrypt_secret("k"),
                model_map={"default": "m"},
                priority=1,
                enabled=True,
            ),
            ProviderConfig(
                provider_type="gemini",
                name="p2",
                base_url="http://y",
                encrypted_api_key=encrypt_secret("k2"),
                model_map={"default": "m2"},
                priority=2,
                enabled=True,
            ),
        ]
    )
    db.commit()

    providers = {"openai_compatible": _AlwaysFailProvider(), "gemini": _AlwaysSuccessProvider()}

    def _factory(provider_type: str, **kwargs):
        return providers[provider_type]

    monkeypatch.setattr(router_mod, "build_provider", _factory)
    monkeypatch.setattr(router_mod.settings, "provider_max_retries", 1)
    monkeypatch.setattr(router_mod.settings, "provider_retry_backoff_seconds", 0)

    result = asyncio.run(ProviderRouterService(db).call_with_fallback(task="recommend", prompt="x"))
    assert result["ok"] is True
    assert result["provider_id"] == 2


def test_provider_circuit_open_skips_unhealthy_provider(monkeypatch):
    db = _build_db()
    db.add_all(
        [
            ProviderConfig(
                provider_type="openai_compatible",
                name="p1",
                base_url="http://x",
                encrypted_api_key=encrypt_secret("k"),
                model_map={"default": "m"},
                priority=1,
                enabled=True,
            ),
            ProviderConfig(
                provider_type="gemini",
                name="p2",
                base_url="http://y",
                encrypted_api_key=encrypt_secret("k2"),
                model_map={"default": "m2"},
                priority=2,
                enabled=True,
            ),
        ]
    )
    db.commit()

    db.add_all(
        [
            ProviderCallLog(
                provider_id=1,
                task_type="recommend",
                attempt=1,
                latency_ms=10,
                status="failed",
                error_message="e1",
                created_at=datetime.utcnow(),
            ),
            ProviderCallLog(
                provider_id=1,
                task_type="recommend",
                attempt=1,
                latency_ms=11,
                status="failed",
                error_message="e2",
                created_at=datetime.utcnow(),
            ),
        ]
    )
    db.commit()

    providers = {"openai_compatible": _AlwaysFailProvider(), "gemini": _AlwaysSuccessProvider()}

    def _factory(provider_type: str, **kwargs):
        return providers[provider_type]

    monkeypatch.setattr(router_mod, "build_provider", _factory)
    monkeypatch.setattr(router_mod.settings, "provider_max_retries", 1)
    monkeypatch.setattr(router_mod.settings, "provider_retry_backoff_seconds", 0)
    monkeypatch.setattr(router_mod.settings, "provider_circuit_failure_threshold", 2)
    monkeypatch.setattr(router_mod.settings, "provider_circuit_window_seconds", 300)

    result = asyncio.run(ProviderRouterService(db).call_with_fallback(task="recommend", prompt="x"))
    assert result["ok"] is True
    assert result["provider_id"] == 2

    statuses = [row.status for row in db.scalars(select(ProviderCallLog).order_by(ProviderCallLog.id)).all()]
    assert "skipped_circuit_open" in statuses
