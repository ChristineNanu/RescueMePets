import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import AnimalList from './components/AnimalList';
import AdoptionForm from './components/AdoptionForm';
import Centers from './components/Centers';
import MyApplications from './components/MyApplications';
import { Login } from './components/Login';
import { Register } from './components/Register';
import './App.css';

function AppContent({ isLoggedIn, handleLogin, handleLogout }) {
  const location = useLocation();
  const hiddenNavRoutes = ['/', '/login', '/register'];

  return (
    <div className="App">
      {!hiddenNavRoutes.includes(location.pathname) && (
        <Navbar isLoggedIn={isLoggedIn} onLogout={handleLogout} />
      )}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/animals" element={isLoggedIn ? <AnimalList /> : <Navigate to="/login" replace />} />
        <Route path="/centers" element={isLoggedIn ? <Centers /> : <Navigate to="/login" replace />} />
        <Route path="/adoption" element={isLoggedIn ? <AdoptionForm /> : <Navigate to="/login" replace />} />
        <Route path="/my-profile" element={isLoggedIn ? <MyApplications /> : <Navigate to="/login" replace />} />
        <Route path="/login" element={isLoggedIn ? <Navigate to="/animals" replace /> : <Login onLogin={handleLogin} />} />
        <Route path="/register" element={isLoggedIn ? <Navigate to="/animals" replace /> : <Register />} />
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
        handleLogout={() => { localStorage.removeItem('user_id'); setIsLoggedIn(false); }}
      />
    </Router>
  );
}

export default App;
