# RescueMePets 🐾

A modern, full-stack pet adoption web application built with React, FastAPI, and a custom RDBMS. Features premium UI/UX with glassmorphism, interactive dashboards, pet matching quiz, M-Pesa payment integration, and comprehensive adoption management system.

## ✨ Key Highlights

- 🎨 **Premium UI/UX** - Modern glassmorphism design with animated gradients and hover effects
- 🐾 **Pet Adoption Platform** - Browse, filter, and adopt pets with detailed profiles
- 📊 **Interactive Dashboard** - User dashboard with adoption stats and application tracking
- 🧠 **AI-Powered Quiz** - "Find My Match" pet recommendation system
- 💬 **Chatbot Support** - Built-in chatbot for adoption guidance
- 🏥 **Health Tracking** - Vaccination, neutering, microchip status for each animal
- 📱 **Fully Responsive** - Works seamlessly on desktop, tablet, and mobile
- 🔐 **Secure Authentication** - User registration with password hashing
- 📋 **Application Tracking** - Track adoption applications with status updates
- 🗄️ **Custom SQL Engine** - Full RDBMS with interactive query interface
- 💳 **M-Pesa Payments** - Real M-Pesa STK Push integration via Safaricom Daraja API

## Features

### 🎨 **Modern UI/UX Design**
- **Glassmorphism Effects** - Frosted glass cards with backdrop blur
- **Animated Gradients** - Multi-color gradients on buttons and headers
- **Premium Shadows** - Colored drop shadows for depth
- **Smooth Animations** - Hover effects, bounce animations, scale transforms
- **Tailwind CSS** - Built with cutting-edge utility-first CSS framework
- **Color Scheme** - Warm amber/orange palette throughout the app

### 🐕 **Pet Adoption Features**
- **Advanced Filtering** - Filter by species, status, energy level, health attributes
- **Detailed Pet Profiles** - Name, breed, age, health status, personality traits
- **Health Badges** - Visual indicators for vaccinated, neutered, microchipped status
- **Heart Favorites** - Save favorite animals for later
- **Quick Adopt Button** - One-click access to adoption form
- **Image Gallery** - High-quality pet photos from multiple sources
- **Status Indicators** - Available/Pending/Adopted status with visual badges

### 📊 **Dashboard Features**
- **Adoption Statistics** - Total animals, available count, adoption rate, rescue centers
- **Color-coded Stat Cards** - Orange, emerald, rose, and purple stat indicators
- **Animated Progress Bar** - Visual adoption success rate tracker
- **Application Tracking** - View all active adoption applications
- **Quick Actions Menu** - Fast access to common features
- **Adoption Tips** - Helpful guidance for adopters
- **Welcome Banner** - Personalized greeting with available animal count

### 🧠 **Pet Matching Quiz**
- **Interactive Quiz** - Multi-step questionnaire to find perfect pet match
- **Personalized Recommendations** - AI-powered pet suggestions based on answers
- **Lifestyle Compatibility** - Questions about home, activity level, family situation
- **Animal Preferences** - Size, type, energy level preferences

### 💬 **Chatbot Integration**
- **AI Assistant** - Chat support for adoption questions and guidance
- **Real-time Responses** - Instant answers to common queries
- **Adoption Advice** - Tips on preparing for pet adoption
- **Application Help** - Guidance through the adoption process

### 🏠 **Rescue Centers**
- **Center Listings** - Browse all rescue centers
- **Location Information** - Full details about each center
- **Animal Inventory** - See all animals at specific centers
- **Visit Center** - Dedicated center detail pages

### 📝 **Adoption Application Process**
- **Application Form** - Simple, intuitive adoption form
- **Status Tracking** - Monitor application progress (Pending/Approved/Rejected)
- **Status Updates** - Real-time notifications when application status changes
- **Application History** - View all past and current applications
- **Unread Notifications** - Indicator for new application updates

### 🔐 **User Authentication & Profile**
- **User Registration** - Create account with email validation
- **Secure Login** - Password hashing with Passlib
- **User Profile** - Avatar and username display
- **Session Management** - Persistent login with localStorage
- **Logout Functionality** - Secure session termination

### ⚙️ **Admin Features**
- **Animal Management** - Add, edit, delete animals
- **Health Attributes** - Track vaccination, neutering, microchip status
- **Center Assignment** - Link animals to rescue centers
- **Bulk Operations** - Efficient animal database management
- **Real-time Updates** - Changes reflect immediately across app

### 💳 **M-Pesa Payment Integration**
- **STK Push** - Initiates M-Pesa payment prompt directly to adopter's phone
- **Payment Polling** - Auto-polls payment status every 5 seconds with 120s timeout
- **Callback Handling** - Webhook endpoint for Safaricom payment confirmation
- **Auto-Approval** - Adoption application automatically approved on payment success
- **Receipt Display** - Shows M-PESA receipt number after successful payment
- **B2C Payouts** - Business-to-customer disbursement support
- **Sandbox Support** - Full sandbox/production environment toggle

### 🗄️ **SQL Interface (Database Admin)**
- **Interactive Query Editor** - Write and execute SQL commands
- **Command History** - Navigate previous queries with keyboard shortcuts
- **Schema Management** - Create tables, indexes, view structure
- **Database Reset** - Clear all data or load sample data
- **Real-time Results** - Formatted table output with error handling
- **Example Queries** - Pre-built queries for learning

## Navigation Guide

### 🏠 **Landing Page** - *First Time Visitors*
- Hero section with adoption statistics
- "How It Works" step-by-step guide
- Featured animal previews
- Success stories from adopters
- Call-to-action buttons to register
- Prominent "Find My Match" quiz button

### 🐕 **Dashboard** - *Logged In Users*
- Personalized welcome banner
- Adoption statistics overview
- Available animals carousel
- My Applications tracker
- Quick action menu
- Adoption tips section

### 🐕 **Animals Tab** - *For Adopters*
- Browse all animals with advanced filtering
- Species filter (Dog, Cat, Rabbit, Bird, All)
- Status filter (Available, Pending, Adopted)
- Search by name or breed
- Heart/favorite functionality
- Click to view detailed animal modal
- "Adopt Me!" button for quick applications

### 🏠 **Centers Tab** - *For Adopters*
- Browse all rescue centers
- Click to view center details and animals
- See full animal inventory at each center
- Back navigation to centers list

### ⚙️ **Manage Tab** - *For Administrators*
- **Add Animals** - Comprehensive form with validation
- **Edit Animals** - Inline editing with real-time updates
- **Delete Animals** - Safe deletion with confirmation
- **Health Attributes** - Mark vaccinated, neutered, microchipped
- **Center Assignment** - Assign to rescue centers

### 🗄️ **SQL Tab** - *For Database Administrators*
- **Write SQL Queries** - SELECT, INSERT, UPDATE, DELETE
- **Schema Operations** - CREATE TABLE, DROP TABLE, CREATE INDEX
- **View Schema** - SHOW TABLES, SHOW COLUMNS, SHOW INDEXES
- **Database Management** - Reset or load sample data

### 📝 **My Applications** - *Track Adoptions*
- View all adoption applications
- See application status (Pending/Approved/Rejected)
- Track application dates
- Get notified of status updates
- Pay adoption fee via M-Pesa directly from application

### ✨ **Quiz** - *Find Your Match*
- Interactive pet matching questionnaire
- Personalized animal recommendations
- Based on lifestyle and preferences

## Tech Stack

### Frontend
- **React 18** - Component-based UI framework with hooks
- **React Router** - Client-side routing and navigation
- **Tailwind CSS 3** - Utility-first CSS with advanced features:
  - Glassmorphism (`backdrop-blur-xl`, `bg-white/80`)
  - Advanced gradients (`via-` color stops)
  - Smooth animations and transitions
  - Hover and active state effects
  - Responsive design utilities
- **CSS3 Animations** - Custom animations and transitions
- **Modern JavaScript** - ES6+ features and async/await

### Backend
- **FastAPI** - Modern, fast Python web framework
- **Custom SQL Engine** - Built-in SQL parser and query executor
- **SQLAlchemy** - ORM for database operations
- **SQLite** - Lightweight relational database
- **Pydantic** - Data validation and serialization
- **Passlib** - Password hashing and security
- **Safaricom Daraja API** - M-Pesa STK Push, payment status query, B2C payouts
- **python-dotenv** - Environment variable management for API credentials

## Project Structure

`
RescueMePets/
├── backend/
│   ├── main.py          # FastAPI application with all endpoints
│   ├── models.py        # SQLAlchemy database models
│   ├── schemas.py       # Pydantic schemas for validation
│   ├── sql_engine.py    # Custom SQL parser and query executor
│   ├── database.py      # Database configuration
│   ├── sample_data.py   # Sample data creation
│   ├── daraja.py        # Safaricom Daraja M-Pesa integration
│   ├── render.yaml      # Render deployment configuration
│   ├── runtime.txt      # Python runtime specification
│   ├── .env             # Environment variables (API keys - not committed)
│   └── requirements.txt # Python dependencies
├── src/
│   ├── components/
│   │   ├── LandingPage.js        # Hero landing page with adoption info
│   │   ├── Dashboard.js          # User dashboard with stats
│   │   ├── AnimalList.js         # Animals browsing (for adopters)
│   │   ├── Centers.js            # Rescue centers exploration
│   │   ├── AdoptionForm.js       # Adoption application form
│   │   ├── MyApplications.js     # Application tracking
│   │   ├── MpesaPayment.js       # M-Pesa STK Push payment modal
│   │   ├── Quiz.js               # Pet matching quiz
│   │   ├── Chatbot.js            # AI chatbot interface
│   │   ├── Login.js              # User login with glassmorphism UI
│   │   ├── Register.js           # User registration with glassmorphism UI
│   │   ├── SQLInterface.js       # Interactive SQL query editor
│   │   └── Navbar.js             # Navigation bar with user profile
│   ├── contexts/
│   │   └── AnimalContext.js      # Global animal state management
│   ├── utils/
│   │   └── logger.js             # Development logging utility
│   ├── App.js                    # Main React application
│   ├── constants.js              # API configuration constants
│   └── index.js                  # React entry point
├── public/                       # Static assets
└── package.json                  # Node.js dependencies
```

## API Endpoints

### Authentication
- `POST /register` - Register a new user
- `POST /login` - User login and session creation

### Animals & Centers
- `GET /animals` - Get all available animals (with optional filters)
- `POST /animals` - Create new animal (admin)
- `PUT /animals/{id}` - Update animal details (admin)
- `DELETE /animals/{id}` - Delete animal (admin)
- `GET /centers` - Get all rescue centers
- `GET /centers/{id}` - Get specific center details
- `GET /stats` - Get adoption statistics

### Adoption & Applications
- `POST /adopt` - Submit adoption application
- `GET /my-applications` - Get user's adoption applications
- `GET /my-applications/{id}` - Get specific application details
- `PUT /applications/{id}/status` - Update application status
- `POST /favorites` - Add/remove animal from favorites

### Quiz & Chatbot
- `POST /quiz` - Get pet recommendations from quiz answers
- `POST /chat` - Send message to chatbot

### M-Pesa Payments
- `POST /pay/stk-push` - Initiate M-Pesa STK Push payment
- `GET /pay/status/{payment_id}` - Poll payment status
- `POST /pay/callback` - Safaricom payment confirmation webhook

### SQL Interface (Admin)
- `POST /sql` - Execute SQL query
- `GET /tables` - Get database schema information

### Database Management
- `POST /reset-db` - Reset database (clear all data)
- `POST /load-sample-data` - Load sample data for demo

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- Python (v3.8 or higher)
- npm or yarn
- pip (Python package manager)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment (recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure environment variables — create `backend/.env`:
   ```env
   MPESA_CONSUMER_KEY=<your_consumer_key>
   MPESA_CONSUMER_SECRET=<your_consumer_secret>
   MPESA_SHORTCODE=174379
   MPESA_PASSKEY=<your_passkey>
   MPESA_CALLBACK_URL=https://<your-domain>/pay/callback
   MPESA_ENV=sandbox
   ```
   > Get credentials from [Safaricom Daraja Portal](https://developer.safaricom.co.ke)

5. Start the FastAPI server:
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8002
   ```

The backend will be running at `http://localhost:8002`

### Frontend Setup

1. In a new terminal, navigate to the root directory:
   ```bash
   cd RescueMePets
   ```

2. Install Node.js dependencies:
   ```bash
   npm install
   ```

3. Start the React development server:
   ```bash
   npm start
   ```

The frontend will be running at `http://localhost:3000`

## Usage

### For Pet Adopters

1. **Visit Landing Page** - See "How It Works" and featured animals
2. **Register/Login** - Create account or sign in
3. **Browse Animals** - Use the Animals tab with filters for advanced search
4. **Explore Centers** - Visit the Centers tab to learn about rescue locations
5. **Find Your Match** - Take the "Find My Match" quiz for personalized recommendations
6. **Adopt a Pet** - Click "Adopt Me!" or "🐾 Apply to Adopt" to start the process
7. **Submit Application** - Fill out the adoption form with your information
8. **Pay Adoption Fee** - Complete payment via M-Pesa STK Push
9. **Track Status** - Monitor application status in "My Applications"
10. **Get Support** - Use the chatbot for adoption questions

### For Administrators

1. **Login** - Use admin credentials to login
2. **Access Dashboard** - View adoption statistics and overview
3. **Manage Animals** - Use the Manage tab to add, edit, or delete animals
4. **Add New Animals**:
   - Click "Add New Animal"
   - Fill in name, breed, age, description
   - Mark health attributes (vaccinated, neutered, microchipped)
   - Assign to rescue center
   - Submit form
5. **Edit Animals** - Click "Edit" on any animal card to modify details
6. **Delete Animals** - Click "Delete" with confirmation
7. **Track Applications** - Monitor and update adoption applications
8. **Update Status** - Mark applications as Approved/Rejected

### For Database Administrators

1. **Access SQL Tab** - Use the SQL interface for database operations
2. **Write Queries**:
   ```sql
   SELECT * FROM animals WHERE status = 'available';
   SELECT * FROM users WHERE username = 'adopter_name';
   SELECT COUNT(*) as total FROM animals;
   ```
3. **Create Tables**:
   ```sql
   CREATE TABLE centers (id INTEGER PRIMARY KEY, name TEXT, location TEXT);
   ```
4. **Create Indexes**:
   ```sql
   CREATE INDEX idx_animal_name ON animals(name);
   ```
5. **View Schema**:
   ```sql
   SHOW TABLES;
   SHOW COLUMNS FROM animals;
   SHOW INDEXES FROM animals;
   ```
6. **Database Management** - Reset or load sample data using buttons

### For Developers

- **API Documentation**: Visit `http://localhost:8002/docs` for interactive Swagger docs
- **Database File**: SQLite database located at `backend/database.db`
- **Sample Data**: Created automatically on first server startup
- **Development Mode**: Both frontend and backend support hot reload
- **Logging**: Check browser console and terminal for detailed logs

## Recent Updates (May 2026)

### 💳 M-Pesa Integration
- **Daraja API** - Full Safaricom M-Pesa integration via `daraja.py`
- **STK Push** - Sends payment prompt to adopter's phone on adoption
- **Payment Polling** - Frontend polls status every 5s with countdown timer
- **Webhook Callback** - `/pay/callback` endpoint for Safaricom confirmation
- **Auto-Approval** - Application status set to `approved` on payment success
- **B2C Support** - Business-to-customer payout capability added
- **Sandbox/Production** - Toggle via `MPESA_ENV` environment variable

### 🎨 UI/UX Enhancements
- **Glassmorphism Design** - Frosted glass effect on cards and modals
- **Animated Gradients** - Multi-color gradient overlays with animations
- **Premium Shadows** - Colored shadows for visual depth
- **Smooth Animations** - Scale, translate, and bounce effects
- **Enhanced Buttons** - Interactive hover effects with shadow and scale transforms
- **Color Consistency** - Warm amber/orange color scheme throughout

### 📊 Dashboard Improvements
- **Stat Card Redesign** - Color-coded stat cards with gradient backgrounds
- **Animated Progress Bar** - Glowing adoption success rate visualization
- **Better Typography** - Improved font sizing and weight hierarchy
- **Welcome Banner** - Eye-catching hero banner with gradient
- **Action Menu** - Quick access buttons with hover effects

### 🏠 Landing Page Updates
- **Enhanced Hero Section** - Larger typography, better visual hierarchy
- **Animated Emojis** - Staggered bounce animations
- **Improved Card Layouts** - Better spacing and shadow effects
- **Updated Testimonials** - Enhanced star rating display
- **Better CTA Buttons** - Prominent call-to-action sections

### 🔐 Authentication Forms
- **Glassmorphism Login/Register** - Modern frosted glass design
- **Better Input Fields** - Enhanced focus states with animations
- **Gradient Text Logos** - Animated logo text effects
- **Responsive Layout** - Mobile-friendly authentication pages
- **Improved Validation** - Better error message display

### 🐾 Animal Listings
- **Enhanced Modal** - Glassmorphism modal with better layout
- **Health Badge Redesign** - Color-coded health attribute badges
- **Favorite Button** - Scale animation on heart interaction
- **Status Badges** - Clear status indicators with proper colors
- **Better Image Overlays** - Gradient overlays on animal photos

## Supported Features by Role

### 👤 Visitor (Not Logged In)
- ✅ View landing page
- ✅ See "How It Works"
- ✅ View featured animals
- ✅ Take pet matching quiz
- ✅ Register for account
- ✅ Login to account

### 🐾 Adopter (Logged In User)
- ✅ View dashboard with stats
- ✅ Browse all animals
- ✅ Filter by species, status, health attributes
- ✅ Search by name/breed
- ✅ Save favorite animals
- ✅ View detailed animal profiles
- ✅ Explore rescue centers
- ✅ Submit adoption applications
- ✅ Pay adoption fee via M-Pesa
- ✅ Track adoption applications
- ✅ Get status notifications
- ✅ Use AI chatbot for support
- ✅ View user profile
- ✅ Logout

### 👨‍💼 Administrator (Logged In Admin)
- ✅ All adopter features
- ✅ Access management dashboard
- ✅ Add new animals
- ✅ Edit animal details
- ✅ Delete animals
- ✅ Mark health attributes
- ✅ Assign animals to centers
- ✅ Manage adoption applications
- ✅ Update application status

### 👨‍💻 Database Administrator
- ✅ All previous features
- ✅ Write custom SQL queries
- ✅ Create/drop tables
- ✅ Create indexes
- ✅ View database schema
- ✅ Reset database
- ✅ Load sample data

## Performance Features

- **Code Splitting** - Route-based code splitting for faster load times
- **Image Optimization** - Responsive image loading
- **CSS Minification** - Tailwind CSS production build
- **Database Indexing** - Custom indexes for query optimization
- **API Caching** - Smart caching of animal and center data
- **Responsive Design** - Mobile-optimized layouts

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Future Enhancements

- 📧 Email notifications for application status
- 🗺️ Map integration for rescue center locations
- ~~💳 Online payment for adoption fees~~ ✅ **Implemented** (M-Pesa STK Push)
- 📸 Photo upload for user profiles
- ⭐ Rating and review system for adoptions
- 🔔 Push notifications
- 🌐 Multi-language support
- 📊 Advanced analytics dashboard

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support & Contact

For issues, questions, or suggestions:
- Open an issue on GitHub
- Contact through the chatbot
- Check API documentation at `/docs`

---

**Made with ❤️ for animals everywhere. Give a pet a forever home! 🐾**
- Mobile-responsive design
- Accessible button and form elements

## Database Schema

### Users
- id (Primary Key)
- username (Unique)
- email (Unique)
- password (Hashed)

### Animals
- id (Primary Key)
- name
- species
- breed
- age
- description
- center_id (Foreign Key)

### Centers
- id (Primary Key)
- name
- location
- contact

### Adoptions
- id (Primary Key)
- user_id (Foreign Key)
- animal_id (Foreign Key)
- message
- status (pending/approved/rejected)
- created_at (Timestamp)

### Payments
- id (Primary Key)
- user_id (Foreign Key)
- adoption_id (Foreign Key)
- phone
- amount
- status (pending/completed/failed)
- checkout_request_id (M-Pesa reference)
- mpesa_receipt
- created_at (Timestamp)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with ❤️ for animal welfare
- Images courtesy of Picsum Photos
- Icons from Unicode emoji

---

**Happy coding and helping animals find homes! 🐾**
