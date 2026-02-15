from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "EmoVision Nutrition System"
    env: str = "dev"
    secret_key: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24

    database_url: str = "postgresql+psycopg2://postgres:postgres@postgres:5432/emovision"
    redis_url: str = "redis://redis:6379/0"

    uploads_dir: str = "uploads"
    cors_allow_origins: str = "http://localhost:5173,http://127.0.0.1:5173"

    encryption_key: str = ""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


settings = Settings()
