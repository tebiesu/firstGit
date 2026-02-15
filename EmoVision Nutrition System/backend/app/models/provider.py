from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class ProviderConfig(Base):
    __tablename__ = "provider_configs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    provider_type: Mapped[str] = mapped_column(String(64), index=True)
    name: Mapped[str] = mapped_column(String(120), unique=True)
    base_url: Mapped[str] = mapped_column(String(500))
    encrypted_api_key: Mapped[str] = mapped_column(Text)
    model_map: Mapped[dict] = mapped_column(JSON, default=dict)
    priority: Mapped[int] = mapped_column(Integer, default=100, index=True)
    enabled: Mapped[bool] = mapped_column(Boolean, default=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class ProviderCallLog(Base):
    __tablename__ = "provider_call_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    provider_id: Mapped[int | None] = mapped_column(ForeignKey("provider_configs.id"), nullable=True, index=True)
    task_type: Mapped[str] = mapped_column(String(64), index=True)
    attempt: Mapped[int] = mapped_column(Integer, default=1)
    latency_ms: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[str] = mapped_column(String(32), default="ok")
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True, index=True)
    action: Mapped[str] = mapped_column(String(120), index=True)
    details: Mapped[dict] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)
