# RescueMePets 🐾

RescueMePets is a full-stack pet adoption platform that connects animals in rescue centers with loving homes. Built with React and FastAPI, it covers the full journey — browsing pets, applying to adopt or foster, paying the adoption fee via M-Pesa, tracking medical history, and staying in touch with vets and shelters in real time — backed by JWT authentication and role-based access for adopters, vets, and admins.

---

## What It Does

- **Visitors** can explore available animals, learn how adoption works, and take a quiz to find their ideal pet match
- **Adopters** can create an account, browse and filter animals, apply to **adopt or foster-to-adopt**, pay the adoption fee via M-Pesa, track application status, view an animal's medical history before applying, message their assigned vet in real time, and get push notifications even when the tab is closed
- **Vets** can self-register, manage support tickets assigned to them, message adopters in real time, log medical records for animals at their center, and resolve tickets with a resolution note
- **Administrators** can manage the animal database, approve or reject applications, view all users, review an analytics dashboard, export compliance/grant reports, and (in local development only) run raw SQL queries

---

## Security

Hardened over the course of this project's development — worth calling out explicitly since it's what a technical reviewer checks first:

- **JWT authentication** — short-lived access tokens (30 min) + rotating, revocable refresh tokens (30 days, hashed at rest), replacing an earlier design where every endpoint trusted a caller-supplied `user_id`
- **bcrypt password hashing** (migrated from SHA-256, with automatic migration of legacy hashes on login)
- **Audit log** — tracks admin actions (approvals, rejections, deletions, payouts, SQL queries) with who/what/when
- **Soft deletes** — animals and users are never hard-deleted (`deleted_at`), preventing irreversible data loss
- **Raw SQL interface disabled in production** (`ENV=production`) — only usable in local development
- **Ownership checks** on every resource-scoped endpoint (you can't read or modify another user's application, payment, ticket, or foster journal by guessing an ID)
- **WebSocket authentication** — real-time channels verify the connecting user is an actual participant before accepting the connection
- Secrets (`.env`, `database.db`) are git-ignored, not committed

---

## Design System

The UI was built with a cohesive design system inspired by platforms like Petfinder and Adopt-a-Pet. Every page shares the same visual language:

- **Color palette** — Teal as the primary brand color, coral for key call-to-action buttons (adopt, submit), warm cream/stone tones for backgrounds and foster-related UI
- **Background** — Soft `teal-50 → white → cream-50` gradient across all pages (`.page-bg`)
- **Cards** — Clean white cards with subtle shadows and teal accent borders
- **Glassmorphism** — Frosted glass effect (`.glass`) used on modals, auth forms, and overlays
- **Animations** — `fadeUp`, `scaleIn`, `float`, `wiggle`, `shimmer`, `gradientShift`, and `pulse-ring` defined in `index.css`
- **Custom Tailwind config** — Extended with `teal`, `coral`, and `cream` color tokens, plus `shadow-glow-teal`, `shadow-glow-coral`, `shadow-card`, and `shadow-card-hover`

### Shared Utility Classes (`index.css`)

| Class | Purpose |
|---|---|
| `.page-bg` | Full-page teal/white/cream gradient background |
| `.btn-primary` | Teal gradient button with hover glow |
| `.btn-coral` | Coral gradient button for primary CTAs |
| `.btn-ghost` | Transparent outlined button |
| `.card` | White card with shadow and hover lift |
| `.input-field` | Styled input with teal focus ring |
| `.badge` | Small status/label pill |
| `.glass` | Frosted glass panel |
| `.section-label` | Teal uppercase section heading |

---

## Features

### 🏠 Landing Page
The entry point for new visitors. Includes a teal hero section with live adoption stats, a step-by-step "How It Works" guide, featured animal previews, adopter testimonials, and a prominent "Find My Match" quiz button. Two CTAs guide visitors: **I Want to Adopt** → `/register` and **I'm a Vet** → `/register/vet`.

### 🔐 Authentication
JWT-based auth with access + refresh tokens. Login and Register pages use a clean single-form layout; inputs have teal focus states and errors show in coral. On login, the backend issues a token pair and returns the user's role — adopters go to the Dashboard, vets go to the Vet Portal, admins go to the Admin Dashboard. The frontend automatically refreshes an expired access token once and retries the request before forcing a re-login. Logging out revokes the refresh token server-side.

### 👋 Welcome Guide
A short, dismissible onboarding tour shown automatically the first time a new adopter or vet lands on their dashboard — a few cards covering the key things to do next (browse & favorite, apply or foster, track applications, chat with Paws). Never nags twice: remembered per-role in `localStorage`. Reopen it anytime via the **❓** button in the navbar (adopters) or the Vet Portal header (vets).

### 📊 Dashboard
The home screen for logged-in adopters. Features:
- A teal hero banner with a personalized greeting and animated animal count
- Stat cards (total animals, available, adoption rate, rescue centers) with a `useCountUp` animation hook
- An animated teal progress bar showing the adoption success rate
- Quick action buttons and rotating adoption tips
- A live list of the user's recent applications
- A real-time notification banner (WebSocket-driven) that updates the instant there's an unread application update or new vet message

### 🐾 Animals
Browse all animals with advanced filtering by species (Dog, Cat, Rabbit, Bird), status (Available, Pending, Adopted), and health attributes (vaccinated, neutered, microchipped). Search by name or breed. Each card has:
- A teal "Adopt Me!" button for quick access to the application form
- A heart/favorite toggle
- A status badge (Available / Pending / Adopted)

Clicking a card opens a detailed modal with health badges, personality traits, a **medical history timeline** (vaccinations, treatments, checkups logged by vets), a foster-to-adopt callout, and a coral "Apply to Adopt" button.

### 🩺 Medical Records
Vets can log medical records for any animal at their center — vaccinations, treatments, checkups, medications, and weight entries — from the Vet Portal's Center Animals tab. Adopters see the resulting timeline (with the logging vet's name) directly on the animal's profile, before they apply — real clinical history instead of static yes/no badges.

### 🏡 Foster-to-Adopt
When applying, adopters choose between a full adoption (M-Pesa fee, as below) or **Foster-to-Adopt** — take the animal home on a trial basis with no fee. Once approved, the adopter gets a **Foster Journal**: a timeline where they log how it's going (with an optional photo per entry), and a **Finalize Adoption** button to convert the foster into a permanent adoption whenever they're ready. Tracked in My Profile, the Admin Analytics dashboard, and Compliance Reports.

### 🏥 Rescue Centers
Browse all rescue centers with location and contact details. Click into any center to see its full animal inventory and its **Veterinary Team** — each vet's specialty, a phone number to call, and a form to message them directly (no account required).

### 📝 Adoption Application
A multi-step form with teal step indicators and selection states, including the adopt-vs-foster choice. Submitting a full adoption triggers an M-Pesa STK Push payment flow; foster applications skip payment entirely.

### 💳 M-Pesa Payments
Full Safaricom Daraja API integration:
- STK Push sends a payment prompt directly to the adopter's phone
- Frontend polls payment status every 5 seconds (up to 120 seconds) with a countdown timer
- Safaricom confirms payment via a `/pay/callback` webhook
- On success, the adoption application is automatically approved and an M-Pesa receipt number is displayed

### 📋 My Applications
A dedicated page (`/my-profile`) showing all of the user's adoption/foster applications with status, application dates, and unread notification indicators. Includes:
- A push-notification on/off toggle (see below)
- Foster badges and a **Foster Journal** button on foster applications
- Edit and withdraw buttons on pending applications
- A **Need Help?** button to open a support ticket for any application
- Once a vet is assigned, a **Message Vet** button opens a real-time chat thread
- Resolution notes displayed when a ticket is resolved

### 🩺 Vet Portal
A dedicated portal for registered vets (`/vet-portal`). Tabs:
- **Active Tickets** — open/in-progress support tickets assigned to the vet, with Message, Start, and Resolve buttons
- **Resolved Tickets** — completed tickets with resolution notes and a View Thread button
- **Center Animals** — all animals at the vet's assigned rescue center, each with a **Medical Records** button to log a new entry or review the animal's history
- A push-notification on/off toggle and a real-time unread badge on the Active Tickets tab

### 💬 Real-Time Messaging
Ticket messaging between vets and adopters runs over **WebSockets**, not polling — messages and notification badges appear instantly on both sides while a thread is open. Includes sender name, role icon, timestamp, and ✓/✓✓ read receipts. Input is disabled on resolved tickets.

### 🔔 Push Notifications
Real Web Push notifications (service worker + VAPID), separate from the in-app WebSocket banners — these arrive even when the app isn't open. Triggered on new ticket messages, application decisions, and ticket resolutions. Adopters and vets can turn them on/off anytime from a toggle in their profile/portal; a one-time prompt offers to enable them on first visit.

### 🧠 Pet Matching Quiz
An interactive multi-step questionnaire that recommends animals based on the user's lifestyle, home environment, activity level, and preferences. Teal progress bar, teal option hover/active states, and teal result cards with a star badge on the top match.

### 💬 Chatbot
A floating chat widget ("Paws") that answers common questions about adoption, fees, medical history, fostering, sponsorship-adjacent topics, vets, the quiz, notifications, and the merch shop — with greeting/thanks/farewell handling and word-boundary-safe keyword matching (so it doesn't misfire on unrelated words that happen to contain a trigger substring).

### ⚙️ Admin Dashboard
A dedicated dashboard for admins at `/admin`. Tabs:
- **Animals** — full CRUD table (add, edit, delete) with a modal form including health toggles and center assignment
- **Applications** — approve or reject pending adoption/foster applications
- **Users** — view all registered users with their roles (adopter / vet / admin)
- **📊 Analytics** — application funnel, approval rate, average decision time, most-favorited animals, adoption fee revenue, adoptions by center, monthly trend, and how many fosters are currently in progress
- **📄 Reports** — exportable compliance/grant reports for a chosen date range: a printable/PDF-ready summary plus CSV exports of raw applications and payments data
- **SQL** — raw SQL query interface (local development only — disabled when `ENV=production`)

---

## Tech Stack

### Frontend
- **React 18** with hooks and context API
- **React Router** for client-side navigation
- **Tailwind CSS 3** with custom `teal`, `coral`, and `cream` color tokens
- **Service Worker** (`public/sw.js`) for Web Push notifications
- **Custom CSS animations** defined in `index.css`

### Backend
- **FastAPI** — Python web framework with automatic OpenAPI docs, including WebSocket support
- **SQLAlchemy** — ORM for database models
- **SQLite** (local dev) / **PostgreSQL** (production, via `DATABASE_URL`)
- **PyJWT** — access + refresh token authentication
- **bcrypt** — password hashing
- **pywebpush** — Web Push notification delivery
- **Custom SQL Engine** — built-in SQL parser and query executor (`sql_engine.py`), dev-only
- **Pydantic** — request/response validation
- **Safaricom Daraja API** — M-Pesa STK Push, payment status polling, B2C payouts
- **python-dotenv** — environment variable management

---

## Project Structure

```
RescueMePets/
├── backend/
│   ├── main.py              # All FastAPI endpoints (REST + WebSocket)
│   ├── auth.py               # JWT issuance/verification, auth dependencies
│   ├── push.py                # Web Push sending (VAPID)
│   ├── models.py             # SQLAlchemy models
│   ├── schemas.py            # Pydantic schemas
│   ├── sql_engine.py         # Custom SQL parser and executor (dev-only)
│   ├── database.py           # DB connection and session config
│   ├── sample_data.py        # Sample data seeding
│   ├── daraja.py             # M-Pesa Daraja API integration
│   ├── render.yaml           # Render deployment config
│   ├── runtime.txt           # Python version spec
│   ├── .env                  # Secrets (not committed)
│   └── requirements.txt      # Python dependencies
├── public/
│   └── sw.js                  # Push notification service worker
├── src/
│   ├── components/
│   │   ├── LandingPage.js          # Hero, how it works, testimonials, role CTAs
│   │   ├── Dashboard.js            # Stats, applications, notifications, quick actions
│   │   ├── AnimalList.js           # Browse/filter animals, detail modal, medical history
│   │   ├── Centers.js              # Rescue center listings + vet team contact
│   │   ├── AdoptionForm.js         # Multi-step adoption/foster form
│   │   ├── MyApplications.js       # Application tracking, foster journal, notifications
│   │   ├── FosterJournal.js        # Foster trial timeline + finalize adoption
│   │   ├── MedicalRecordsPanel.js  # Vet-side medical record logging (Vet Portal)
│   │   ├── MpesaPayment.js         # M-Pesa STK Push modal
│   │   ├── Quiz.js                 # Pet matching questionnaire
│   │   ├── Chatbot.js              # Floating chat widget (FAQ bot)
│   │   ├── WelcomeGuide.js         # First-run onboarding tour
│   │   ├── EnableNotificationsBanner.js  # One-time push opt-in prompt
│   │   ├── NotificationSettings.js       # Push notification on/off toggle
│   │   ├── Login.js                # Login page with role-based redirect
│   │   ├── Register.js             # Adopter registration page
│   │   ├── VetRegister.js          # Vet self-registration with center picker
│   │   ├── AdminDashboard.js       # Admin CRUD, applications, users, analytics, reports, SQL
│   │   ├── AnalyticsDashboard.js   # Admin analytics tab
│   │   ├── ComplianceReports.js    # Admin exportable reports tab
│   │   ├── VetPortal.js            # Vet tickets, messaging, center animals
│   │   ├── TicketThread.js         # Real-time (WebSocket) ticket chat thread
│   │   ├── SQLInterface.js         # Interactive SQL editor (dev-only)
│   │   ├── Shop.js / Pricing.js    # Merch shop / center subscription plans
│   │   └── Navbar.js               # Top navigation bar
│   ├── contexts/
│   │   └── AnimalContext.js        # Global animal state
│   ├── api.js                      # Authenticated fetch wrapper (token attach + refresh)
│   ├── push.js                     # Push subscribe/unsubscribe helpers
│   ├── App.js                      # Root component and role-based routing
│   ├── constants.js                # API base URL config
│   └── index.js                    # React entry point
├── tailwind.config.js              # Custom colors and shadows
└── package.json
```

---

## Database Schema

Only the columns most relevant to understanding the data model are listed; see `backend/models.py` for the exact definitions.

### Users
| Column | Type | Notes |
|---|---|---|
| id | Integer | Primary Key |
| username | String | Unique |
| email | String | Unique |
| password | String | bcrypt hashed |
| avatar | String | |
| role | String | adopter / vet / admin |
| deleted_at | DateTime | Soft delete |

### Animals
| Column | Type | Notes |
|---|---|---|
| id | Integer | Primary Key |
| name, species, breed, age, description | | |
| status | String | available / pending / adopted |
| vaccinated, neutered, microchipped | Boolean | |
| good_with_kids, good_with_pets | Boolean | |
| energy_level | String | low / medium / high |
| photos, personality_badges | String | comma-separated |
| sponsored | Boolean | featured-listing flag (business/marketing use, unrelated to fostering) |
| center_id | Integer | Foreign Key → Centers |
| deleted_at | DateTime | Soft delete |

### Adoptions
| Column | Type | Notes |
|---|---|---|
| id | Integer | Primary Key |
| user_id, animal_id | Integer | Foreign Keys |
| message | Text | |
| status | String | pending / approved / rejected |
| application_type | String | adopt / foster |
| foster_finalized_at | DateTime | Set when a foster converts to a full adoption |
| read | Boolean | False = unread notification |
| created_at | DateTime | |

### FosterJournalEntries
| Column | Type | Notes |
|---|---|---|
| id | Integer | Primary Key |
| adoption_id | Integer | Foreign Key → Adoptions |
| user_id | Integer | Foreign Key → Users |
| note | Text | |
| photo_url | String | Optional |
| created_at | DateTime | |

### MedicalRecords
| Column | Type | Notes |
|---|---|---|
| id | Integer | Primary Key |
| animal_id | Integer | Foreign Key → Animals |
| vet_id | Integer | Foreign Key → Vets (nullable) |
| record_type | String | vaccination / treatment / checkup / medication / weight |
| title, description | | |
| weight_kg | Float | Optional |
| date | String | ISO date |

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
- 🚧 **Phase 4 — Growth features**: Sponsor-an-animal and waitlists (pre-existing) ✅, foster-to-adopt ✅ · shareable adoption certificates still open
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
