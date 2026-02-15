from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.config import settings
from app.db.models import Base
from app.db.session import engine


def create_application() -> FastAPI:
    app = FastAPI(title=settings.app_name, version="0.1.0")

    origins = [x.strip() for x in settings.cors_allow_origins.split(",") if x.strip()]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.on_event("startup")
    def on_startup() -> None:
        Path(settings.uploads_dir).mkdir(parents=True, exist_ok=True)
        if settings.auto_create_tables:
            Base.metadata.create_all(bind=engine)

    @app.get("/health")
    def health() -> dict:
        return {"status": "ok", "app": settings.app_name}

    app.include_router(api_router)
    return app


app = create_application()
