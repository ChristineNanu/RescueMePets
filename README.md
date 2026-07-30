# RescueMePets 🐾

RescueMePets is a full-stack pet adoption web application that connects animals in rescue centers with loving homes. Built with React and FastAPI, it offers a clean and intuitive experience for adopters, vets, and administrators — from browsing pets to completing an adoption with M-Pesa payment.

---

## What It Does

At its core, RescueMePets is a platform where:

- **Visitors** can explore available animals, learn how adoption works, and take a quiz to find their ideal pet match
- **Adopters** can create an account, browse and filter animals, submit adoption applications, pay the adoption fee via M-Pesa, track their application status, and message their assigned vet through a support ticket system
- **Vets** can self-register, manage support tickets assigned to them, message adopters, view animals at their rescue center, and resolve tickets with a resolution note
- **Administrators** can manage the full animal database, approve or reject adoption applications, view all users, and run raw SQL queries through a built-in SQL interface

---

## Design System

The UI was built with a cohesive design system inspired by platforms like Petfinder and Adopt-a-Pet. Every page shares the same visual language:

- **Color palette** — Teal as the primary brand color, coral for key call-to-action buttons (adopt, submit), and warm cream/stone tones for backgrounds
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
Login and Register pages use a clean single-form layout with a `teal-50 → white → cream-50` background. Inputs have teal focus states and errors are shown in coral. On login, the backend returns the user's role and redirects automatically — adopters go to the Dashboard, vets go to the Vet Portal, admins go to the Admin Dashboard. Logout is accessible from the My Profile page (adopters), Vet Portal header, and Admin Dashboard header.

### 📊 Dashboard
The home screen for logged-in adopters. Features:
- A teal hero banner with a personalized greeting and animated animal count
- Stat cards (total animals, available, adoption rate, rescue centers) with a `useCountUp` animation hook
- An animated teal progress bar showing the adoption success rate
- Quick action buttons and rotating adoption tips
- A live list of the user's recent applications
- A 🔔 notification banner that appears on login when there are unread application updates or new vet messages, with a "View Now" link to the relevant page

### 🐾 Animals
Browse all animals with advanced filtering by species (Dog, Cat, Rabbit, Bird), status (Available, Pending, Adopted), and health attributes (vaccinated, neutered, microchipped). Search by name or breed. Each card has:
- A teal "Adopt Me!" button for quick access to the application form
- A heart/favorite toggle
- A status badge (Available / Pending / Adopted)

Clicking a card opens a detailed modal with health badges, personality traits, and a coral "Apply to Adopt" button.

### 🏥 Rescue Centers
Browse all rescue centers with location and contact details. Click into any center to see its full animal inventory. Teal hero header, teal stat row, and coral "Apply to Adopt" buttons on animal cards.

### 📝 Adoption Application
A multi-step form with teal step indicators and selection states. Submitting triggers an M-Pesa STK Push payment flow. A teal info banner explains the M-Pesa process before the user submits.

### 💳 M-Pesa Payments
Full Safaricom Daraja API integration:
- STK Push sends a payment prompt directly to the adopter's phone
- Frontend polls payment status every 5 seconds (up to 120 seconds) with a countdown timer
- Safaricom confirms payment via a `/pay/callback` webhook
- On success, the adoption application is automatically approved and an M-Pesa receipt number is displayed

### 📋 My Applications
A dedicated page showing all of the user's adoption applications with status (Pending / Approved / Rejected), application dates, and unread notification indicators. Includes:
- A teal wallet card and coral sign-out button
- Edit and withdraw buttons on pending applications
- A **Need Help?** button to open a support ticket for any application
- Once a vet is assigned, a **Message Vet** button opens a chat thread directly
- A 🔔 notification banner showing a preview of the latest vet message with a tap-to-open-chat link
- Resolution notes displayed when a ticket is resolved

### 🩺 Vet Portal
A dedicated portal for registered vets. Features:
- **Active Tickets** tab — all open/in-progress support tickets assigned to the vet, with Message, Start, and Resolve buttons
- **Resolved Tickets** tab — completed tickets with resolution notes and a View Thread button
- **Center Animals** tab — all animals at the vet's assigned rescue center with health badges
- A 🔔 notification banner that shows a preview of the latest adopter message per ticket, disappears automatically once the thread is opened
- A coral unread badge on the 💬 Message button for each ticket with unread messages
- Resolve flow requires a written resolution note before marking a ticket as resolved
- Polls for new messages every 15 seconds

### 💬 Ticket Messaging
A full chat-style messaging system between vets and adopters on support tickets:
- Messages are stored in the database and persist across sessions
- Chat thread shows sender name, role icon, timestamp, and ✓/✓✓ read receipts
- Auto-scrolls to the latest message
- Input is disabled on resolved tickets
- Both parties are notified of new messages via unread banners and badges
- Polls every 10 seconds for new messages while the thread is open

### 🧠 Pet Matching Quiz
An interactive multi-step questionnaire that recommends animals based on the user's lifestyle, home environment, activity level, and preferences. Teal progress bar, teal option hover/active states, and teal result cards with a star badge on the top match.

### 💬 Chatbot
A floating chat widget (teal button with glow shadow) that provides instant answers to adoption questions. Teal header, teal user message bubbles, teal quick-question pills, and a teal send button. Supports pre-built quick questions and free-text input.

### ⚙️ Admin Dashboard
A dedicated dashboard for admins at `/admin`. Tabs:
- **Animals** — full CRUD table (add, edit, delete) with a modal form including health toggles and center assignment
- **Applications** — approve or reject pending adoption applications
- **Users** — view all registered users with their roles (adopter / vet / admin)
- **SQL** — embedded SQL interface for running raw queries

### 🗄️ SQL Interface
A built-in SQL query editor accessible to admins. Supports SELECT, INSERT, UPDATE, DELETE, CREATE TABLE, DROP TABLE, CREATE INDEX, SHOW TABLES, SHOW COLUMNS, and SHOW INDEXES. Includes command history navigation (Ctrl+↑/↓), formatted table output, and buttons to reset the database or load sample data.

---

## Tech Stack

### Frontend
- **React 18** with hooks and context API
- **React Router** for client-side navigation
- **Tailwind CSS 3** with custom `teal`, `coral`, and `cream` color tokens
- **Custom CSS animations** defined in `index.css`

### Backend
- **FastAPI** — Python web framework with automatic OpenAPI docs
- **SQLAlchemy** — ORM for database models
- **SQLite** — Lightweight relational database (`backend/database.db`)
- **Custom SQL Engine** — Built-in SQL parser and query executor (`sql_engine.py`)
- **Hashlib (SHA-256)** — Password hashing
- **Pydantic** — Request/response validation
- **Safaricom Daraja API** — M-Pesa STK Push, payment status polling, B2C payouts
- **python-dotenv** — Environment variable management

---

## Project Structure

```
RescueMePets/
├── backend/
│   ├── main.py            # All FastAPI endpoints
│   ├── models.py          # SQLAlchemy models
│   ├── schemas.py         # Pydantic schemas
│   ├── sql_engine.py      # Custom SQL parser and executor
│   ├── database.py        # DB connection and session config
│   ├── sample_data.py     # Sample data seeding
│   ├── daraja.py          # M-Pesa Daraja API integration
│   ├── render.yaml        # Render deployment config
│   ├── runtime.txt        # Python version spec
│   ├── .env               # API credentials (not committed)
│   └── requirements.txt   # Python dependencies
├── src/
│   ├── components/
│   │   ├── LandingPage.js      # Hero, how it works, testimonials, role CTAs
│   │   ├── Dashboard.js        # Stats, applications, notifications, quick actions
│   │   ├── AnimalList.js       # Browse and filter animals
│   │   ├── Centers.js          # Rescue center listings
│   │   ├── AdoptionForm.js     # Multi-step adoption form
│   │   ├── MyApplications.js   # Application tracking, payments, ticket messaging
│   │   ├── MpesaPayment.js     # M-Pesa STK Push modal
│   │   ├── Quiz.js             # Pet matching questionnaire
│   │   ├── Chatbot.js          # Floating chat widget
│   │   ├── Login.js            # Login page with role-based redirect
│   │   ├── Register.js         # Adopter registration page
│   │   ├── VetRegister.js      # Vet self-registration with center picker
│   │   ├── AdminDashboard.js   # Admin CRUD, applications, users, SQL tabs
│   │   ├── VetPortal.js        # Vet tickets, messaging, center animals
│   │   ├── TicketThread.js     # Chat-style ticket message thread
│   │   ├── SQLInterface.js     # Interactive SQL editor
│   │   └── Navbar.js           # Top navigation bar
│   ├── contexts/
│   │   └── AnimalContext.js    # Global animal state
│   ├── utils/
│   │   └── logger.js           # Dev logging utility
│   ├── App.js                  # Root component and role-based routing
│   ├── constants.js            # API base URL config
│   └── index.js                # React entry point
├── tailwind.config.js          # Custom colors and shadows
├── public/
└── package.json
```

---

## Database Schema

### Users
| Column | Type | Notes |
|---|---|---|
| id | Integer | Primary Key |
| username | String | Unique |
| email | String | Unique |
| password | String | SHA-256 hashed |
| role | String | adopter / vet / admin |

### Animals
| Column | Type | Notes |
|---|---|---|
| id | Integer | Primary Key |
| name | String | |
| species | String | Dog, Cat, Rabbit, Bird |
| breed | String | |
| age | Integer | |
| description | Text | |
| status | String | available / pending / adopted |
| vaccinated | Boolean | |
| neutered | Boolean | |
| microchipped | Boolean | |
| good_with_kids | Boolean | |
| good_with_pets | Boolean | |
| energy_level | String | low / medium / high |
| center_id | Integer | Foreign Key → Centers |

### Centers
| Column | Type | Notes |
|---|---|---|
| id | Integer | Primary Key |
| name | String | |
| location | String | |
| contact | String | |

### Vets
| Column | Type | Notes |
|---|---|---|
| id | Integer | Primary Key |
| name | String | |
| clinic | String | |
| phone | String | |
| specialization | String | |
| center_id | Integer | Foreign Key → Centers |
| user_id | Integer | Foreign Key → Users (nullable) |

### Adoptions
| Column | Type | Notes |
|---|---|---|
| id | Integer | Primary Key |
| user_id | Integer | Foreign Key → Users |
| animal_id | Integer | Foreign Key → Animals |
| message | Text | |
| status | String | pending / approved / rejected |
| read | Boolean | False when adopter has unread update |
| created_at | DateTime | |

### Payments
| Column | Type | Notes |
|---|---|---|
| id | Integer | Primary Key |
| user_id | Integer | Foreign Key → Users |
| adoption_id | Integer | Foreign Key → Adoptions |
| phone | String | |
| amount | Float | |
| status | String | pending / completed / failed |
| checkout_request_id | String | M-Pesa reference |
| mpesa_receipt | String | Receipt number on success |
| created_at | DateTime | |

### SupportTickets
| Column | Type | Notes |
|---|---|---|
| id | Integer | Primary Key |
| user_id | Integer | Foreign Key → Users |
| adoption_id | Integer | Foreign Key → Adoptions |
| vet_id | Integer | Foreign Key → Vets (nullable) |
| issue | Text | |
| status | String | open / in_progress / resolved |
| resolution_note | Text | Required on resolve |
| vet_read | Boolean | False when vet has unread update |
| created_at | DateTime | |

### TicketMessages
| Column | Type | Notes |
|---|---|---|
| id | Integer | Primary Key |
| ticket_id | Integer | Foreign Key → SupportTickets |
| sender_id | Integer | Foreign Key → Users |
| sender_role | String | vet / adopter |
| message | Text | |
| is_read | Boolean | |
| created_at | DateTime | |

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/register` | Register a new adopter account |
| POST | `/register/vet` | Register a new vet account with center assignment |
| POST | `/login` | Authenticate — returns role and vet_id |

### Animals & Centers
| Method | Endpoint | Description |
|---|---|---|
| GET | `/animals` | List animals (supports filters) |
| POST | `/animals` | Add a new animal (admin) |
| PUT | `/animals/{id}` | Update animal details (admin) |
| DELETE | `/animals/{id}` | Delete an animal (admin) |
| GET | `/centers` | List all rescue centers |
| GET | `/centers/{id}` | Get a specific center and its animals |
| GET | `/stats` | Get platform-wide adoption statistics |

### Applications
| Method | Endpoint | Description |
|---|---|---|
| POST | `/adopt` | Submit an adoption application |
| GET | `/my-applications` | Get the current user's applications |
| PATCH | `/applications/{id}` | Edit a pending application message |
| DELETE | `/applications/{id}` | Withdraw a pending application |
| PUT | `/applications/{id}/status` | Approve or reject an application (admin) |
| POST | `/favorites` | Toggle an animal as a favorite |
| GET | `/favorites` | Get the current user's favorited animals |

### Notifications
| Method | Endpoint | Description |
|---|---|---|
| GET | `/notifications/unread-count` | Get adopter's unread notification count |
| POST | `/notifications/mark-read` | Mark all adopter notifications as read |

### Support Tickets
| Method | Endpoint | Description |
|---|---|---|
| POST | `/support` | Create or update a support ticket |
| GET | `/support` | Get the current user's tickets |
| GET | `/support/all` | Get all tickets (admin) |
| PATCH | `/support/{id}` | Update ticket status / assign vet / resolve |
| DELETE | `/support/{id}` | Withdraw an open ticket (adopter) |

### Ticket Messaging
| Method | Endpoint | Description |
|---|---|---|
| GET | `/tickets/{id}/messages` | Get all messages on a ticket |
| POST | `/tickets/{id}/messages` | Send a message on a ticket |
| PATCH | `/tickets/{id}/messages/read` | Mark messages as read |
| GET | `/tickets/{id}/unread-count` | Get unread message count for a reader role |

### Vet Portal
| Method | Endpoint | Description |
|---|---|---|
| GET | `/vet/profile` | Get the logged-in vet's profile |
| GET | `/vet/tickets` | Get tickets assigned to the vet |
| GET | `/vet/center-animals` | Get animals at the vet's center |
| GET | `/vet/unread-count` | Get vet's unread ticket count |
| POST | `/vet/mark-read` | Mark all vet tickets as read |

### Admin
| Method | Endpoint | Description |
|---|---|---|
| GET | `/admin/applications` | Get all adoption applications (admin) |
| GET | `/admin/users` | Get all registered users (admin) |

### Quiz & Chatbot
| Method | Endpoint | Description |
|---|---|---|
| POST | `/quiz/match` | Get pet recommendations from quiz answers |

### M-Pesa
| Method | Endpoint | Description |
|---|---|---|
| POST | `/pay/stk-push` | Initiate STK Push to adopter's phone |
| GET | `/pay/status/{payment_id}` | Poll payment status |
| POST | `/pay/callback` | Safaricom webhook for payment confirmation |
| POST | `/pay/b2c` | Initiate B2C payout to a phone number |

### SQL & Database
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
MPESA_CONSUMER_KEY=<your_consumer_key>
MPESA_CONSUMER_SECRET=<your_consumer_secret>
MPESA_SHORTCODE=174379
MPESA_PASSKEY=<your_passkey>
MPESA_CALLBACK_URL=https://<your-domain>/pay/callback
MPESA_ENV=sandbox
```

> Get credentials from the [Safaricom Daraja Portal](https://developer.safaricom.co.ke)

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8002
```

Backend runs at `http://localhost:8002` — Swagger docs at `http://localhost:8002/docs`

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
- View the dashboard with live adoption stats and notifications
- Browse and filter animals by species, status, and health attributes
- Save favorite animals and sponsor animals
- Submit, edit, and withdraw adoption applications
- Pay the adoption fee via M-Pesa STK Push
- Track application status and receive unread notifications
- Open support tickets and message the assigned vet in a chat thread
- Use the chatbot for general support

### 🩺 Vet
- Self-register via `/register/vet` with center and specialization
- Access the Vet Portal at `/vet-portal`
- View and manage support tickets assigned to them
- Message adopters through the ticket chat thread
- View animals at their assigned rescue center
- Resolve tickets with a required resolution note
- Receive real-time message notifications with previews

### 👨‍💼 Administrator
- Access the Admin Dashboard at `/admin`
- Add, edit, and delete animals
- Approve or reject adoption applications
- View all registered users and their roles
- Access the SQL interface for raw database queries
- Reset the database or load sample data

> Admin account is seeded on startup: `admin` / `admin1234`

---

## Future Enhancements

- 📧 Email notifications for application status changes
- 🗺️ Map view for rescue center locations
- 📸 Profile photo upload for users and animals
- ⭐ Rating and review system for completed adoptions
- 🔔 WebSocket-based real-time messaging (replace polling)
- 🌐 Multi-language support
- 📊 Advanced analytics dashboard for admins

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
