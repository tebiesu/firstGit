# EmoVision Nutrition System

## Backend quick start

```bash
cd backend
python -m venv .venv
. .venv/Scripts/activate
pip install -r requirements.txt
copy .env.example .env
alembic upgrade head
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Frontend quick start

```bash
cd frontend
npm install
npm run dev
```

## Docker quick start

```bash
docker compose up --build
```

## Implemented modules
- Auth: `/api/v1/auth/register`, `/api/v1/auth/login`
- Profile: `/api/v1/profile`
- Meal analyze/history: `/api/v1/meal/analyze`, `/api/v1/meal/history`
- Reports: `/api/v1/report/daily`, `/api/v1/report/weekly`
- Admin provider mgmt: `/api/v1/admin/providers`, `/api/v1/admin/providers/{id}/test`, `/api/v1/admin/audit-logs`
- Provider adapters: openai-compatible/new_api, gemini, claude

## Notes
- `provider_configs` API key is encrypted before storage.
- DB schema supports Alembic migrations (`backend/alembic`).
- For graduation project demo, meal nutrition and emotion scoring include deterministic fallback logic.
- If no provider is configured, meal analysis still returns baseline recommendations.
