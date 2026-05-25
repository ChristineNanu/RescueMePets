import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import AnimalList from './components/AnimalList';
import AdoptionForm from './components/AdoptionForm';
import Centers from './components/Centers';
import MyApplications from './components/MyApplications';
import { Login } from './components/Login';
import { Register } from './components/Register';
import './App.css';

const HIDDEN_NAV = ['/', '/login', '/register'];

function AppContent({ isLoggedIn, handleLogin, handleLogout }) {
  const location = useLocation();
  const showNav = isLoggedIn && !HIDDEN_NAV.includes(location.pathname);

  return (
    <div className="App">
      {showNav && <Navbar isLoggedIn={isLoggedIn} onLogout={handleLogout} />}
      <Routes>
        {/* Public */}
        <Route path="/" element={isLoggedIn ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
        <Route path="/login" element={isLoggedIn ? <Navigate to="/dashboard" replace /> : <Login onLogin={handleLogin} />} />
        <Route path="/register" element={isLoggedIn ? <Navigate to="/dashboard" replace /> : <Register />} />

        {/* Protected */}
        <Route path="/dashboard" element={isLoggedIn ? <Dashboard /> : <Navigate to="/" replace />} />
        <Route path="/animals"   element={isLoggedIn ? <AnimalList /> : <Navigate to="/" replace />} />
        <Route path="/centers"   element={isLoggedIn ? <Centers /> : <Navigate to="/" replace />} />
        <Route path="/adoption"  element={isLoggedIn ? <AdoptionForm /> : <Navigate to="/" replace />} />
        <Route path="/my-profile" element={isLoggedIn ? <MyApplications /> : <Navigate to="/" replace />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to={isLoggedIn ? '/dashboard' : '/'} replace />} />
      </Routes>
    </div>
  );
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('user_id'));
  }, []);

  return (
    <Router>
      <AppContent
        isLoggedIn={isLoggedIn}
        handleLogin={() => setIsLoggedIn(true)}
        handleLogout={() => { localStorage.removeItem('user_id'); localStorage.removeItem('username'); setIsLoggedIn(false); }}
      />
    </Router>
  );
}

export default App;
