# RescueMePets 🐾

RescueMePets is a full-stack pet adoption web application that connects animals in rescue centers with loving homes. Built with React and FastAPI, it offers a clean and intuitive experience for adopters, administrators, and database managers — from browsing pets to completing an adoption with M-Pesa payment.

---

## What It Does

At its core, RescueMePets is a platform where:

- **Visitors** can explore available animals, learn how adoption works, and take a quiz to find their ideal pet match
- **Adopters** can create an account, browse and filter animals, submit adoption applications, pay the adoption fee via M-Pesa, and track their application status
- **Administrators** can manage the animal database — adding, editing, and deleting animals, assigning them to rescue centers, and updating application statuses
- **Database Admins** can run raw SQL queries, manage the schema, and reset or seed the database through a built-in SQL interface

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
The entry point for new visitors. Includes a teal hero section with live adoption stats, a step-by-step "How It Works" guide, featured animal previews, adopter testimonials, and a prominent "Find My Match" quiz button. Coral CTA buttons guide visitors toward registering.

### 🔐 Authentication
Login and Register pages use a split-panel layout — a teal-overlaid photo on the left, a clean form on the right with a `teal-50 → white → cream-50` background. Inputs have teal focus states, and errors are shown in coral. Logout is accessible only from the My Profile page (not the navbar).

### 📊 Dashboard
The home screen for logged-in users. Features:
- A teal hero banner with a personalized welcome and animated animal count
- Stat cards (total animals, available, adoption rate, rescue centers) with a `useCountUp` animation hook
- An animated teal progress bar showing the adoption success rate
- Quick action buttons and adoption tips
- A live list of the user's active applications

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
A dedicated page showing all of the user's adoption applications with status (Pending / Approved / Rejected), application dates, and unread notification indicators. Includes a teal wallet card and a coral sign-out button. Users can initiate M-Pesa payment directly from a pending application.

### 🧠 Pet Matching Quiz
An interactive multi-step questionnaire that recommends animals based on the user's lifestyle, home environment, activity level, and preferences. Teal progress bar, teal option hover/active states, and teal result cards with a star badge on the top match.

### 💬 Chatbot
A floating chat widget (teal button with glow shadow) that provides instant answers to adoption questions. Teal header, teal user message bubbles, teal quick-question pills, and a teal send button. Supports pre-built quick questions and free-text input.

### ⚙️ Admin — Animal Management
Admins access a Manage tab to add, edit, and delete animals. Forms include health attribute toggles (vaccinated, neutered, microchipped) and rescue center assignment. Changes reflect immediately across the app.

### 🗄️ SQL Interface
A built-in SQL query editor for database administrators. Supports SELECT, INSERT, UPDATE, DELETE, CREATE TABLE, DROP TABLE, CREATE INDEX, SHOW TABLES, SHOW COLUMNS, and SHOW INDEXES. Includes command history navigation, formatted table output, and buttons to reset the database or load sample data.

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
- **Passlib** — Password hashing
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
│   │   ├── LandingPage.js      # Hero, how it works, testimonials
│   │   ├── Dashboard.js        # Stats, applications, quick actions
│   │   ├── AnimalList.js       # Browse and filter animals
│   │   ├── Centers.js          # Rescue center listings
│   │   ├── AdoptionForm.js     # Multi-step adoption form
│   │   ├── MyApplications.js   # Application tracking and payments
│   │   ├── MpesaPayment.js     # M-Pesa STK Push modal
│   │   ├── Quiz.js             # Pet matching questionnaire
│   │   ├── Chatbot.js          # Floating chat widget
│   │   ├── Login.js            # Split-panel login page
│   │   ├── Register.js         # Split-panel registration page
│   │   ├── SQLInterface.js     # Interactive SQL editor
│   │   └── Navbar.js           # Top navigation bar
│   ├── contexts/
│   │   └── AnimalContext.js    # Global animal state
│   ├── utils/
│   │   └── logger.js           # Dev logging utility
│   ├── App.js                  # Root component and routing
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
| password | String | Hashed with Passlib |

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
| center_id | Integer | Foreign Key → Centers |

### Centers
| Column | Type | Notes |
|---|---|---|
| id | Integer | Primary Key |
| name | String | |
| location | String | |
| contact | String | |

### Adoptions
| Column | Type | Notes |
|---|---|---|
| id | Integer | Primary Key |
| user_id | Integer | Foreign Key → Users |
| animal_id | Integer | Foreign Key → Animals |
| message | Text | |
| status | String | pending / approved / rejected |
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

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/register` | Create a new user account |
| POST | `/login` | Authenticate and start session |

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
| GET | `/my-applications/{id}` | Get a specific application |
| PUT | `/applications/{id}/status` | Update application status (admin) |
| POST | `/favorites` | Toggle an animal as a favorite |

### Quiz & Chatbot
| Method | Endpoint | Description |
|---|---|---|
| POST | `/quiz` | Get pet recommendations from quiz answers |
| POST | `/chat` | Send a message to the chatbot |

### M-Pesa
| Method | Endpoint | Description |
|---|---|---|
| POST | `/pay/stk-push` | Initiate STK Push to adopter's phone |
| GET | `/pay/status/{payment_id}` | Poll payment status |
| POST | `/pay/callback` | Safaricom webhook for payment confirmation |

### SQL & Database
| Method | Endpoint | Description |
|---|---|---|
| POST | `/sql` | Execute a SQL query |
| GET | `/tables` | Get database schema |
| POST | `/reset-db` | Clear all data |
| POST | `/load-sample-data` | Seed sample data |

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

### Frontend

```bash
cd RescueMePets
npm install
npm start
```

Frontend runs at `http://localhost:3000`


## User Roles

### 👤 Visitor
- Browse the landing page and featured animals
- Take the pet matching quiz
- Register or log in

### 🐾 Adopter
- View the dashboard with live adoption stats
- Browse and filter animals by species, status, and health attributes
- Save favorite animals
- Submit adoption applications
- Pay the adoption fee via M-Pesa STK Push
- Track application status and receive notifications
- Use the chatbot for support

### 👨‍💼 Administrator
- All adopter features
- Add, edit, and delete animals
- Mark health attributes and assign animals to centers
- Update adoption application statuses

### 👨‍💻 Database Administrator
- All admin features
- Write and execute custom SQL queries
- Create and drop tables, create indexes
- View the full database schema
- Reset the database or load sample data

---

## Future Enhancements

- 📧 Email notifications for application status changes
- 🗺️ Map view for rescue center locations
- 📸 Profile photo upload for users
- ⭐ Rating and review system for completed adoptions
- 🔔 Push notifications
- 🌐 Multi-language support
- 📊 Advanced analytics for admins

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
