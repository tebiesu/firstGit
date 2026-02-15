from base64 import urlsafe_b64encode
from cryptography.fernet import Fernet

from app.core.config import settings


def _build_key() -> bytes:
    if settings.encryption_key:
        raw = settings.encryption_key.encode("utf-8")
        return urlsafe_b64encode(raw[:32].ljust(32, b"0"))
    return Fernet.generate_key()


_cipher = Fernet(_build_key())


def encrypt_secret(value: str) -> str:
    return _cipher.encrypt(value.encode("utf-8")).decode("utf-8")


def decrypt_secret(value: str) -> str:
    return _cipher.decrypt(value.encode("utf-8")).decode("utf-8")
