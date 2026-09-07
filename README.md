# RescueMePets

RescueMePets is a full-stack pet adoption platform built with React on the frontend and FastAPI on the backend. It supports animal browsing, adoption and foster applications, vet workflows, admin operations, messaging, notifications, and payment flows.

## Overview

The project combines a public pet marketplace with internal workflows for:

- adopters browsing and applying for animals
- vets managing rescue-center animals and medical records
- admins reviewing applications, analytics, and reports
- secure authentication and role-based access
- real-time support chats and notification updates

## Key features

- animal catalog with filter/search and favorite support
- adoption and foster-to-adopt application flow
- M-Pesa integration for adoption payments
- vet portal with ticket handling and medical record logging
- real-time messaging and push notification support
- admin dashboard for animals, users, applications, and reports
- pet-matching quiz and support chatbot

## Tech stack

### Frontend
- React 18
- React Router
- Tailwind CSS
- Service worker for push notifications

### Backend
- FastAPI
- SQLAlchemy
- SQLite for local development
- PostgreSQL-ready configuration for production
- JWT authentication
- Pydantic validation
- Python dotenv and related service integrations

## Repository structure

```text
RescueMePets/
├── backend/
│   ├── main.py
│   ├── auth.py
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   ├── daraja.py
│   ├── push.py
│   ├── sql_engine.py
│   ├── sample_data.py
│   ├── requirements.txt
│   ├── render.yaml
│   ├── runtime.txt
│   ├── .env.example
│   └── README.md
├── public/
│   └── sw.js
├── src/
│   ├── components/
│   ├── contexts/
│   ├── utils/
│   ├── App.js
│   ├── api.js
│   ├── constants.js
│   ├── push.js
│   └── index.js
├── package.json
├── tailwind.config.js
├── netlify.toml
├── README.md
└── .gitignore
```

## Local development

### Prerequisites

- Node.js 22+
- Python 3.11+

### Frontend

```bash
npm install
npm start
```

The frontend runs on http://localhost:3000 by default.

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload
```

The API runs on http://localhost:8000.

## Environment configuration

Create a backend environment file from the template:

```bash
cp backend/.env.example backend/.env
```

The template includes settings for:

- app environment
- JWT secret
- admin bootstrap values
- CORS origins
- database URL
- M-Pesa credentials
- VAPID keys for push notifications

Important:

- never commit real secrets
- do not use a default admin password in production
- keep `ENV=production` for deployed environments and leave development-only features disabled there

## Deployment notes

The backend includes a Render deployment config in `backend/render.yaml` and the frontend is structured for a modern static hosting setup. The app expects environment variables to be set in the deployment platform rather than hardcoded into source.

## Notes

This repository is a working product app rather than a simple starter template. Some features depend on external services such as M-Pesa and VAPID push delivery, so local testing requires valid credentials in the backend environment.

For backend-specific details and setup instructions, see [backend/README.md](backend/README.md).

### PostAdoptionCheckins
| Column | Type | Notes |
|---|---|---|
| id | Integer | Primary Key |
| adoption_id, user_id | Integer | Foreign Keys |
| checkin_type | String | 1_week / 1_month / 6_months |
| wellbeing | String | great / good / okay / struggling |
| notes, photo_url | | |

### Payments
| Column | Type | Notes |
|---|---|---|
| id | Integer | Primary Key |
| user_id, adoption_id | Integer | Foreign Keys |
| phone, amount | | |
| status | String | pending / completed / failed |
| checkout_request_id | String | M-Pesa reference |
| mpesa_receipt | String | Receipt number on success |

### MerchOrders
| Column | Type | Notes |
|---|---|---|
| id | Integer | Primary Key |
| user_id | Integer | Foreign Key → Users |
| product_name, product_price | String | Display strings — no online checkout yet |
| variant | String | e.g. `"Size: M, Color: Teal"`, nullable |
| quantity | Integer | |
| status | String | requested / contacted / fulfilled / cancelled |

### SupportTickets / TicketMessages
Support tickets link an adoption to a vet; ticket messages are the chat log between adopter and vet (delivered live over WebSocket). See `resolution_note`, `vet_read`, `is_read`.

### Auth / Notifications infrastructure
| Table | Purpose |
|---|---|
| RefreshTokens | Hashed, revocable refresh tokens for JWT auth |
| PushSubscriptions | Web Push subscription endpoints per user |
| AuditLogs | who/what/when for admin and money-moving actions |
| CenterSubscriptions | Center-side listing plan (free/pro/premium) — unrelated to user auth |

---

## API Endpoints

All endpoints requiring auth expect `Authorization: Bearer <access_token>`. WebSocket connections carry the token as `?token=` (browsers can't set custom headers on a `ws://` handshake).

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/register` | Register a new adopter account |
| POST | `/register/vet` | Register a new vet account with center assignment |
| POST | `/login` | Authenticate — returns a token pair + role |
| POST | `/auth/refresh` | Exchange a refresh token for a new token pair (rotates) |
| POST | `/auth/logout` | Revoke a refresh token |

### Animals & Centers
| Method | Endpoint | Description |
|---|---|---|
| GET | `/animals` | List animals (filters; optional auth for favorite state) |
| GET | `/animals/{id}` | Get one animal |
| POST/PUT/DELETE | `/animals[/{id}]` | Manage animals (admin) |
| GET | `/centers`, `/centers/{id}`, `/centers/{id}/stories` | Center listings, detail, rescue stories |
| GET | `/vets` | List vets (optionally by center) |
| POST | `/vets/{id}/message` | Public "ask a vet" contact form |
| GET | `/stats` | Platform-wide stats |
| GET | `/landing/animals`, `/landing/stories` | No-auth previews (real animals/rescue stories) for the logged-out landing page |

### Shop
| Method | Endpoint | Description |
|---|---|---|
| POST | `/shop/orders` | Submit a single order request |
| POST | `/shop/orders/bulk` | Submit an entire cart as one order request |
| GET | `/shop/my-orders` | Current user's order requests |
| GET | `/admin/shop-orders` | All order requests (admin) |
| PUT | `/admin/shop-orders/{id}/status` | Update an order's status (admin) |

### Applications & Foster-to-Adopt
| Method | Endpoint | Description |
|---|---|---|
| POST | `/adopt` | Submit an adoption or foster application |
| GET | `/my-applications` | Current user's applications |
| PATCH/DELETE | `/applications/{id}` | Edit or withdraw a pending application |
| PUT | `/applications/{id}/status` | Approve/reject an application (admin) |
| GET | `/adoptions/{id}/journal` | View a foster journal |
| POST | `/adoptions/{id}/journal` | Add a foster journal entry |
| POST | `/adoptions/{id}/finalize-foster` | Convert a foster into a full adoption |
| POST/GET | `/favorites` | Toggle / list favorited animals |
| POST/GET | `/waitlist[/{animal_id}]` | Join / check a Pending animal's waitlist |
| GET/PATCH | `/profile` | View/update the current user's profile |

### Medical Records
| Method | Endpoint | Description |
|---|---|---|
| GET | `/animals/{id}/medical-records` | Public read of an animal's medical history |
| POST | `/animals/{id}/medical-records` | Log a new record (vet/admin) |
| DELETE | `/medical-records/{id}` | Remove a record (vet/admin) |

### Notifications & Push
| Method | Endpoint | Description |
|---|---|---|
| GET/POST | `/notifications/unread-count`, `/notifications/mark-read` | Adopter application-update notifications |
| GET | `/push/vapid-public-key` | Public key for subscribing |
| POST | `/push/subscribe`, `/push/unsubscribe` | Manage a device's push subscription |

### Support Tickets & Real-Time Messaging
| Method | Endpoint | Description |
|---|---|---|
| POST/GET/DELETE | `/support[/{id}]` | Create, list, withdraw a support ticket |
| GET | `/support/all` | All tickets (admin) |
| PATCH | `/support/{id}` | Update status / assign vet / resolve |
| GET/POST | `/tickets/{id}/messages` | Read / send ticket messages |
| PATCH | `/tickets/{id}/messages/read` | Mark messages read |
| GET | `/tickets/{id}/unread-count` | Unread count for the current reader |
| WS | `/ws/ticket/{id}` | Real-time ticket chat channel |
| WS | `/ws/notifications/{user_id}` | Real-time notification channel |

### Vet Portal
| Method | Endpoint | Description |
|---|---|---|
| GET | `/vet/profile`, `/vet/tickets`, `/vet/center-animals`, `/vet/unread-count` | Vet's own data |
| POST | `/vet/mark-read` | Mark all vet tickets read |

### M-Pesa
| Method | Endpoint | Description |
|---|---|---|
| POST | `/pay/stk-push` | Initiate STK Push to adopter's phone |
| GET | `/pay/status/{payment_id}` | Poll payment status |
| POST | `/pay/callback` | Safaricom webhook for payment confirmation |
| POST | `/pay/test-complete/{id}` | Manually complete a payment (dev-only) |
| GET | `/my-payments` | Current user's payment history |
| POST | `/pay/b2c` | Initiate a B2C payout (admin) |
| POST | `/pay/b2c-callback` | Safaricom B2C webhook |

### Admin: Analytics & Reports
| Method | Endpoint | Description |
|---|---|---|
| GET | `/admin/applications`, `/admin/users` | Admin data views |
| GET | `/admin/analytics` | Funnel, revenue, most-favorited, center breakdown, trend |
| GET | `/admin/reports/summary` | Compliance report for a date range |
| GET | `/admin/reports/export.csv` | CSV export (applications / payments) |

### Quiz
| Method | Endpoint | Description |
|---|---|---|
| POST | `/quiz/match` | Get pet recommendations from quiz answers |

### SQL & Database (development only — disabled when `ENV=production`)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/sql/query` | Execute a SQL query (admin) |
| GET | `/tables` | Get database schema (admin) |
| POST | `/reset-db` | Clear all data (admin) |
| POST | `/load-sample-data` | Seed sample data (admin) |

---

## Installation & Setup

### Prerequisites
- Node.js v14+
- Python 3.8+
- npm or yarn
- pip

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create `backend/.env`:

```env
# M-Pesa (Safaricom Daraja Portal: https://developer.safaricom.co.ke)
MPESA_CONSUMER_KEY=<your_consumer_key>
MPESA_CONSUMER_SECRET=<your_consumer_secret>
MPESA_SHORTCODE=174379
MPESA_PASSKEY=<your_passkey>
MPESA_CALLBACK_URL=https://<your-domain>/pay/callback
MPESA_ENV=sandbox

# Auth
JWT_SECRET=<a long random string>

# Web Push (generate with: python -c "from py_vapid import Vapid02; ...")
VAPID_PRIVATE_KEY=<vapid_private_key>
VAPID_PUBLIC_KEY=<vapid_public_key>
VAPID_CLAIM_EMAIL=admin@example.com

# Set to "production" to disable the raw SQL interface and dev-only test endpoints
ENV=development
```

```bash
uvicorn main:app --reload
```

Backend runs at `http://localhost:8000` — Swagger docs at `http://localhost:8000/docs`

> On first startup, the admin account is automatically seeded: **username:** `admin` **password:** `admin1234`

### Frontend

```bash
cd RescueMePets
npm install
npm start
```

Frontend runs at `http://localhost:3000`

---

## User Roles

### 👤 Visitor
- Browse the landing page and featured animals
- Take the pet matching quiz
- Register as an adopter or vet

### 🐾 Adopter
- View the dashboard with live adoption stats and real-time notifications
- Browse and filter animals; view an animal's medical history before applying
- Save favorite animals; join a waitlist on Pending animals
- Apply to **adopt** (M-Pesa fee) or **foster-to-adopt** (no fee, trial basis with a journal)
- Track application status and finalize a foster into a full adoption anytime
- Open support tickets and message the assigned vet in real time
- Turn push notifications on/off; get the first-run welcome tour
- Use the chatbot for general support

### 🩺 Vet
- Self-register via `/register/vet` with center and specialization
- Access the Vet Portal at `/vet-portal`
- View and manage support tickets assigned to them, messaging adopters in real time
- Log medical records for animals at their assigned rescue center
- Resolve tickets with a required resolution note
- Turn push notifications on/off; get the first-run welcome tour

### 👨‍💼 Administrator
- Access the Admin Dashboard at `/admin`
- Add, edit, and delete animals
- Approve or reject adoption/foster applications
- View all registered users and their roles
- Review the analytics dashboard and export compliance/grant reports
- Access the SQL interface for raw database queries (local development only)

> Admin account is seeded on startup: `admin` / `admin1234`

---

## Roadmap

Actively developed against a phased roadmap. Status as of this writing:

- ✅ **Phase 1 — Foundation hardening**: Postgres-ready, bcrypt, audit log, soft deletes, SQL interface gated to dev-only, full JWT auth
- ✅ **Phase 2 — Real-time & engagement**: WebSocket messaging/notifications, medical records module, Web Push notifications
- 🚧 **Phase 3 — Business differentiators**: Analytics dashboard ✅, compliance/grant reports ✅ · multi-tenancy, finer-grained roles (center-manager), and WhatsApp Business API integration still open
- 🚧 **Phase 4 — Growth features**: Waitlists ✅, foster-to-adopt ✅ (replaced the earlier sponsor-an-animal feature), merch shop with cart & checkout ✅ · shareable adoption certificates still open
- ⬜ **Phase 5 — Polish & trust signals**: automated tests, CI/CD, error monitoring, staging environment — not yet started

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

## License

MIT License — see the LICENSE file for details.

---

**Made with ❤️ for animals everywhere. Help a pet find their forever home. 🐾**
