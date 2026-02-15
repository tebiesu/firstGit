from __future__ import annotations

from sqlalchemy.orm import Session

from app.models.provider import AuditLog


def write_audit_log(db: Session, user_id: int | None, action: str, details: dict | None = None) -> None:
    log = AuditLog(user_id=user_id, action=action, details=details or {})
    db.add(log)
    db.commit()
