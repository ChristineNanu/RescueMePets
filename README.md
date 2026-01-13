# RescueMePets 🐾

A full-stack relational database management system (RDBMS) with a pet adoption web application demo. Features custom SQL query engine, interactive REPL interface, and complete CRUD operations.

## Features

### 🗄️ **RDBMS Core Features**
- **Custom SQL Engine**: Built-in SQL parser supporting SELECT, INSERT, UPDATE, DELETE, CREATE, DROP
- **Interactive SQL REPL**: Web-based query interface with command history
- **Table Management**: Create/drop tables dynamically via SQL
- **Indexing Support**: Create custom indexes for performance
- **JOIN Operations**: Full support for table joins
- **Multiple Data Types**: String, Integer, Text, DateTime support
- **Primary & Unique Keys**: Automatic and custom key constraints
- **Schema Introspection**: View tables, columns, and indexes

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

### ⚙️ **Animal Management (Admin)**
- **Add New Animals**: Complete form with validation
- **Edit Existing Animals**: Inline editing with real-time updates
- **Delete Animals**: Safe deletion with confirmation
- **Bulk Operations**: Manage multiple animals efficiently
- **Center Assignment**: Link animals to rescue centers

### 🗄️ **SQL Interface (Database Admin)**
- **Interactive Query Editor**: Write and execute SQL commands
- **Command History**: Navigate previous queries with Ctrl+↑/↓
- **Example Queries**: Pre-built queries for learning
- **Schema Management**: Create tables, indexes, view structure
- **Database Reset**: Clear all data or load sample data
- **Real-time Results**: Formatted table output with error handling

### 📝 **Adoption Process**
- Streamlined adoption application form
- Pre-select animals from listings or center pages
- User-friendly form with validation
- Submit adoption requests directly

### 🔐 **User Authentication**
- User registration and login
- Secure password hashing
- Session management with localStorage

## Navigation Guide

### 🐕 **Animals Tab** - *For Adopters*
**When to use**: Browse animals available for adoption
- View all animals with photos and details
- Click "Adopt Me!" to start adoption process
- Clean, user-friendly interface for potential adopters
- No admin functions - just browsing and adopting

### 🏠 **Centers Tab** - *For Adopters*
**When to use**: Explore rescue centers and their animals
- Browse rescue centers by location
- Click "Visit Center" to see animals at specific locations
- Learn about different rescue organizations

### ⚙️ **Manage Tab** - *For Administrators*
**When to use**: Administrative animal management
- **Add new animals** to the database
- **Edit existing animals** (name, breed, age, description, etc.)
- **Delete animals** that have been adopted or are no longer available
- **Assign animals to rescue centers**
- Full CRUD operations with user-friendly forms

### 🗄️ **SQL Tab** - *For Database Administrators & Developers*
**When to use**: Direct database operations and learning
- **Write custom SQL queries** (SELECT, INSERT, UPDATE, DELETE)
- **Create new tables** and modify database schema
- **Create indexes** for better performance
- **View database structure** (tables, columns, indexes)
- **Reset database** or load sample data
- **Learn SQL** with interactive examples
- **Debug and analyze** data with complex queries

### 📝 **Adopt Tab** - *For Adopters*
**When to use**: Submit adoption applications
- Fill out adoption forms for specific animals
- Provide personal information and adoption message
- Submit formal adoption requests

## Tech Stack

### Frontend
- **React** - Component-based UI framework
- **React Router** - Client-side routing
- **CSS3** - Custom styling with modern design
- **Tailwind CSS** - Utility-first CSS framework

### Backend
- **FastAPI** - Modern, fast web framework for Python
- **Custom SQL Engine** - Built-in SQL parser and query executor
- **SQLAlchemy** - ORM for database operations
- **SQLite** - Lightweight relational database
- **Pydantic** - Data validation and serialization
- **Passlib** - Password hashing and security

## Project Structure

```
RescueMePets/
├── backend/
│   ├── main.py          # FastAPI application with all endpoints
│   ├── models.py        # SQLAlchemy database models
│   ├── schemas.py       # Pydantic schemas for validation
│   ├── sql_engine.py    # Custom SQL parser and query executor
│   ├── database.py      # Database configuration
│   ├── sample_data.py   # Sample data creation
│   └── requirements.txt # Python dependencies
├── src/
│   ├── components/
│   │   ├── AnimalList.js        # Animals browsing (for adopters)
│   │   ├── AnimalManagement.js  # Admin animal management
│   │   ├── SQLInterface.js      # Interactive SQL REPL
│   │   ├── Centers.js           # Rescue centers page
│   │   ├── AdoptionForm.js      # Adoption application form
│   │   ├── Login.js             # User login component
│   │   ├── Register.js          # User registration component
│   │   └── Navbar.js            # Navigation bar
│   ├── utils/
│   │   └── logger.js            # Development logging utility
│   ├── App.js                   # Main React application
│   ├── App.css                  # Main application styles
│   └── index.js                 # React entry point
├── public/                      # Static assets
└── package.json                 # Node.js dependencies
```

## API Endpoints

### Authentication
- `POST /register` - Register a new user
- `POST /login` - User login

### Animals & Centers
- `GET /animals` - Get all available animals
- `POST /animals` - Create new animal (admin)
- `PUT /animals/{id}` - Update animal (admin)
- `DELETE /animals/{id}` - Delete animal (admin)
- `GET /centers` - Get all rescue centers

### Adoption
- `POST /adopt` - Submit adoption application

### SQL Interface
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

### For Pet Adopters
1. **Register/Login**: Create an account or log in to existing account
2. **Browse Animals**: View all available animals on the Animals tab
3. **Explore Centers**: Visit the Centers tab to see rescue locations and their animals
4. **Adopt**: Click "Adopt Me!" on any animal to start the adoption process
5. **Submit Application**: Fill out the adoption form and submit your request

### For Administrators
1. **Manage Animals**: Use the Manage tab to add, edit, or delete animals
2. **Add New Animals**: Click "Add New Animal" and fill out the form
3. **Edit Animals**: Click "Edit" on any animal card to modify details
4. **Delete Animals**: Click "Delete" to remove animals (with confirmation)
5. **Assign Centers**: Link animals to appropriate rescue centers

### For Database Administrators
1. **SQL Queries**: Use the SQL tab to write and execute custom queries
2. **Create Tables**: Use `CREATE TABLE` commands to add new tables
3. **Create Indexes**: Use `CREATE INDEX` to improve query performance
4. **View Schema**: Use `SHOW TABLES`, `SHOW COLUMNS`, `SHOW INDEXES` commands
5. **Reset Database**: Use database management buttons to reset or load sample data
6. **Learn SQL**: Try the example queries to learn SQL syntax

### For Developers
- **API Documentation**: Visit `http://localhost:8002/docs` for interactive API docs
- **Database**: SQLite database file is created automatically in `backend/database.db`
- **Sample Data**: Sample centers and animals are created on server startup
- **SQL Interface**: Test queries and database operations through the web interface

## Features in Detail

### 🗄️ **SQL Interface (RDBMS Core)**
- **Interactive Query Editor** with syntax highlighting
- **Command History** - navigate with Ctrl+↑/↓
- **Example Queries** for learning SQL
- **Real-time Results** with formatted table output
- **Error Handling** with helpful error messages
- **Schema Management** - create tables, indexes, view structure
- **Database Reset/Load** functionality

**Supported SQL Commands:**
- `SELECT` - Query data with JOINs, WHERE clauses, etc.
- `INSERT` - Add new records
- `UPDATE` - Modify existing records  
- `DELETE` - Remove records
- `CREATE TABLE` - Create new tables with constraints
- `DROP TABLE` - Remove tables
- `CREATE INDEX` - Add indexes for performance
- `SHOW TABLES` - List all tables
- `SHOW COLUMNS FROM table` - View table structure
- `SHOW INDEXES FROM table` - View table indexes

### ⚙️ **Animal Management (Admin Interface)**
- **Add New Animals** with comprehensive form validation
- **Edit Existing Animals** with inline editing
- **Delete Animals** with confirmation dialogs
- **Image Upload Support** with URL validation
- **Center Assignment** with dropdown selection
- **Real-time Updates** - changes reflect immediately

### 🔍 **Advanced Database Features**
- **Primary Keys** - Automatic ID generation
- **Foreign Keys** - Proper table relationships
- **Unique Constraints** - Username/email uniqueness
- **Data Types** - String, Integer, Text, DateTime support
- **Indexing** - Custom indexes for query optimization
- **JOIN Operations** - Complex multi-table queries
- **Transaction Support** - ACID compliance

### 🌐 **Web Application Demo**
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
