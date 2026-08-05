# RescueMePets Backend

FastAPI backend for the RescueMePets application.

## Local Development

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Run the server:
```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

## Deployment to Render

`render.yaml` already configures the service, Python version, `ENV=production`, and `DATABASE_URL` (from Render's managed Postgres). You still need to add these as secret environment variables in the Render dashboard — they're intentionally not in `render.yaml` since that file is committed:

- `JWT_SECRET` — required in production (the app raises at startup without it)
- `VAPID_PRIVATE_KEY`, `VAPID_PUBLIC_KEY`, `VAPID_CLAIM_EMAIL` — for push notifications
- `MPESA_CONSUMER_KEY`, `MPESA_CONSUMER_SECRET`, `MPESA_SHORTCODE`, `MPESA_PASSKEY`, `MPESA_CALLBACK_URL`, `MPESA_ENV` — for M-Pesa payments

`ENV=production` also disables the raw SQL interface (`/sql/query`, `/tables`, `/reset-db`) and the M-Pesa test-completion endpoint — both are development-only.

## API Endpoints

See the [root README](../README.md#api-endpoints) for the full, current endpoint list — this backend has grown well past the original register/login/animals/adopt set to include JWT auth, WebSocket real-time messaging, medical records, foster-to-adopt, push notifications, and admin analytics/reports.

## CORS

The API allows requests from:
- `https://rescue-me-pets-zga1.vercel.app` (Vercel deployment)
- `http://localhost:3000` (local development)
