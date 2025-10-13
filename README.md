# RescueMePets 🐾

A full-stack web application for pet adoption built with React frontend and FastAPI backend. Connect loving homes with animals in need through an intuitive and user-friendly platform.

## Features

### 🏠 **Rescue Centers**
- Browse available rescue centers
- View detailed information about each center
- See all animals available at specific centers
- Interactive center cards with modern UI

### 🐕 **Animal Listings**
- View all available animals for adoption
- Detailed animal profiles with images, breed, age, and descriptions
- Filter animals by rescue center
- Beautiful card-based layout

### 📝 **Adoption Process**
- Streamlined adoption application form
- Pre-select animals from listings or center pages
- User-friendly form with validation
- Submit adoption requests directly

### 🔐 **User Authentication**
- User registration and login
- Secure password hashing
- Session management with localStorage

## Tech Stack

### Frontend
- **React** - Component-based UI framework
- **React Router** - Client-side routing
- **CSS3** - Custom styling with modern design
- **Tailwind CSS** - Utility-first CSS framework

### Backend
- **FastAPI** - Modern, fast web framework for Python
- **SQLAlchemy** - ORM for database operations
- **SQLite** - Lightweight database
- **Pydantic** - Data validation
- **Passlib** - Password hashing

## Project Structure

```
RescueMePets/
├── backend/
│   ├── main.py          # FastAPI application with endpoints
│   ├── models.py        # SQLAlchemy database models
│   ├── schemas.py       # Pydantic schemas for validation
│   ├── database.py      # Database configuration
│   ├── sample_data.py   # Sample data creation
│   └── requirements.txt # Python dependencies
├── src/
│   ├── components/
│   │   ├── AnimalList.js     # Animals listing page
│   │   ├── Centers.js        # Rescue centers page
│   │   ├── AdoptionForm.js   # Adoption application form
│   │   ├── Login.js          # User login component
│   │   ├── Register.js       # User registration component
│   │   └── Navbar.js         # Navigation bar
│   ├── App.js                # Main React application
│   ├── App.css               # Main application styles
│   └── index.js              # React entry point
├── public/                   # Static assets
└── package.json             # Node.js dependencies
```

## API Endpoints

### Authentication
- `POST /register` - Register a new user
- `POST /login` - User login

### Animals & Centers
- `GET /animals` - Get all available animals
- `GET /centers` - Get all rescue centers

### Adoption
- `POST /adopt` - Submit adoption application

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- Python (v3.8 or higher)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Start the FastAPI server:
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

### For Users
1. **Register/Login**: Create an account or log in to existing account
2. **Browse Animals**: View all available animals on the main animals page
3. **Explore Centers**: Visit the centers page to see rescue locations and their animals
4. **Adopt**: Click "Adopt Me!" on any animal to start the adoption process
5. **Submit Application**: Fill out the adoption form and submit your request

### For Developers
- **API Documentation**: Visit `http://localhost:8002/docs` for interactive API docs
- **Database**: SQLite database file is created automatically in `backend/database.db`
- **Sample Data**: Sample centers and animals are created on server startup

## Features in Detail

### 🖼️ **Animal Cards**
- High-quality images from Picsum Photos
- Detailed information display
- Interactive "Adopt Me!" buttons with hover effects
- Responsive card layout

### 🏢 **Center Exploration**
- Click "Visit Center" to see animals at specific locations
- Back navigation to return to centers list
- Consistent UI across all pages

### 📋 **Adoption Form**
- Pre-populated animal selection
- User ID auto-detection from login
- Message field for personal adoption story
- Form validation and error handling

### 🎨 **UI/UX Design**
- Modern, clean interface
- Consistent color scheme
- Smooth animations and transitions
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
