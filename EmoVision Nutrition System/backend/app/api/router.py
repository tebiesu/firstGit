from fastapi import APIRouter

from app.api.routes import admin, auth, meal, profile, report

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(profile.router, prefix="/profile", tags=["profile"])
api_router.include_router(meal.router, prefix="/meal", tags=["meal"])
api_router.include_router(report.router, prefix="/report", tags=["report"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
