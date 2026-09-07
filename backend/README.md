# RescueMePets Backend

This folder contains the FastAPI backend for the RescueMePets app. It exposes the API for user auth, animal listings, adoption workflows, vet tools, admin functions, notifications, and payment integrations.

## What this backend does

- authenticates adopters, vets, and admins with JWT tokens
- manages animal, user, ticket, application, and medical-record data
- handles adoption and foster-to-adopt logic
- integrates with Safaricom M-Pesa for payment workflows
- sends web push notifications and supports real-time messaging
- exposes admin-only reporting and analytics endpoints

## Local setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload
```

The API will be available at http://localhost:8000.

## Environment variables

Use `.env.example` as the template. The main values are:

```env
ENV=development
JWT_SECRET=<generate-a-long-random-secret>
ADMIN_PASSWORD=<set-only-when-bootstrapping-an-admin>
ADMIN_USERNAME=admin
ADMIN_EMAIL=admin@rescuemepets.local
CORS_ORIGINS=http://localhost:3000
DATABASE_URL=sqlite:///./database.db

MPESA_CONSUMER_KEY=<your-consumer-key>
MPESA_CONSUMER_SECRET=<your-consumer-secret>
MPESA_SHORTCODE=174379
MPESA_PASSKEY=<your-passkey>
MPESA_CALLBACK_URL=https://<your-domain>/pay/callback
MPESA_ENV=sandbox

VAPID_PRIVATE_KEY=<your-vapid-private-key>
VAPID_PUBLIC_KEY=<your-vapid-public-key>
VAPID_CLAIM_EMAIL=admin@rescuemepets.local
```

Notes:

- `JWT_SECRET` is required in production
- `ADMIN_PASSWORD` is optional and only used when bootstrapping the first admin account
- keep secrets out of version control
- do not reuse a weak default password in production

## Deployment

The app includes `render.yaml` for Render deployment. In production, set the sensitive values through your hosting dashboard environment variables rather than storing them in the repo.

A few production behaviors are intentionally restricted:

- development-only SQL endpoints are disabled when `ENV=production`
- M-Pesa dev-only test routes are disabled in production
- the app expects secrets to be provided via environment variables

## Key backend files

- `main.py` — FastAPI application, routes, and startup logic
- `auth.py` — JWT issuance, verification, and auth helpers
- `models.py` — SQLAlchemy models
- `schemas.py` — request and response validation models
- `database.py` — database session setup
- `daraja.py` — Safaricom M-Pesa integration
- `push.py` — web push notification delivery
- `sql_engine.py` — dev-only SQL engine
- `sample_data.py` — seed data for local development

## API notes

The backend exposes both REST endpoints and WebSocket-based messaging for live ticket threads and notifications. It is designed to support the frontend app directly and is not meant to be used as a generic API-only service.

## CORS

By default, the app allows common local frontend origins and production deployment origins configured through `CORS_ORIGINS`.
