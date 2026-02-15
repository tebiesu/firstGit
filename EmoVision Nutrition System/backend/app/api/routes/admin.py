from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import desc, select
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin
from app.core.crypto import decrypt_secret, encrypt_secret
from app.db.deps import get_db
from app.models.provider import AuditLog, ProviderConfig
from app.models.user import User
from app.schemas.provider import (
    AuditLogOut,
    ProviderConfigCreate,
    ProviderConfigOut,
    ProviderConfigUpdate,
    ProviderHealthCheckResult,
)
from app.services.audit import write_audit_log
from app.services.providers import build_provider

router = APIRouter()


@router.get("/providers", response_model=list[ProviderConfigOut])
def list_providers(_: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    rows = db.scalars(select(ProviderConfig).order_by(ProviderConfig.priority.asc())).all()
    return list(rows)


@router.post("/providers", response_model=ProviderConfigOut)
def create_provider(
    payload: ProviderConfigCreate,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    exists = db.scalar(select(ProviderConfig).where(ProviderConfig.name == payload.name))
    if exists:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Provider name exists")

    row = ProviderConfig(
        provider_type=payload.provider_type,
        name=payload.name,
        base_url=payload.base_url,
        encrypted_api_key=encrypt_secret(payload.api_key),
        model_map=payload.model_map,
        priority=payload.priority,
        enabled=payload.enabled,
    )
    db.add(row)
    db.commit()
    db.refresh(row)

    write_audit_log(db, user_id=admin.id, action="create_provider", details={"provider_id": row.id, "name": row.name})
    return row


@router.put("/providers/{provider_id}", response_model=ProviderConfigOut)
def update_provider(
    provider_id: int,
    payload: ProviderConfigUpdate,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    row = db.get(ProviderConfig, provider_id)
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Provider not found")

    if payload.base_url is not None:
        row.base_url = payload.base_url
    if payload.api_key is not None:
        row.encrypted_api_key = encrypt_secret(payload.api_key)
    if payload.model_map is not None:
        row.model_map = payload.model_map
    if payload.priority is not None:
        row.priority = payload.priority
    if payload.enabled is not None:
        row.enabled = payload.enabled

    db.commit()
    db.refresh(row)
    write_audit_log(db, user_id=admin.id, action="update_provider", details={"provider_id": row.id})
    return row


@router.post("/providers/{provider_id}/test", response_model=ProviderHealthCheckResult)
async def test_provider(provider_id: int, _: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    row = db.get(ProviderConfig, provider_id)
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Provider not found")

    provider = build_provider(
        provider_type=row.provider_type,
        base_url=row.base_url,
        api_key=decrypt_secret(row.encrypted_api_key),
        model_map=row.model_map,
    )
    result = await provider.health_check()
    return ProviderHealthCheckResult(provider_id=provider_id, ok=result.ok, detail=result.error or result.content)


@router.get("/audit-logs", response_model=list[AuditLogOut])
def list_audit_logs(_: User = Depends(get_current_admin), db: Session = Depends(get_db), limit: int = 50):
    rows = db.scalars(select(AuditLog).order_by(desc(AuditLog.created_at)).limit(min(max(limit, 1), 200))).all()
    return list(rows)
