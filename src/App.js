import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import AnimalList from './components/AnimalList';
import AdoptionForm from './components/AdoptionForm';
import Centers from './components/Centers';
import MyApplications from './components/MyApplications';
import Chatbot from './components/Chatbot';
import Quiz from './components/Quiz';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { ForgotPassword } from './components/ForgotPassword';
import { ResetPassword } from './components/ResetPassword';
import VetRegister from './components/VetRegister';
import AdminDashboard from './components/AdminDashboard';
import VetPortal from './components/VetPortal';
import Pricing from './components/Pricing';
import Shop from './components/Shop';
import { API_BASE_URL } from './constants';
import { getRefreshToken, clearAuth } from './api';
import { syncPushSubscription } from './push';
import './App.css';

function usePawParticles() {
  useEffect(() => {
    const handler = (e) => {
      const btn = e.target.closest('button, a');
      if (!btn) return;
      const text = btn.textContent || '';
      if (!text.includes('Adopt') && !text.includes('adopt') && !text.includes('🐾')) return;
      const paw = document.createElement('span');
      paw.className = 'paw-particle';
      paw.textContent = ['🐾','🐶','🐱','🐰'][Math.floor(Math.random()*4)];
      paw.style.left = `${e.clientX - 10}px`;
      paw.style.top  = `${e.clientY - 10}px`;
      document.body.appendChild(paw);
      setTimeout(() => paw.remove(), 900);
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);
}

  const HIDDEN_NAV = ['/', '/login', '/register', '/register/vet', '/admin', '/vet-portal', '/forgot-password', '/reset-password'];

function AppContent({ isLoggedIn, role, handleLogin, handleLogout }) {
  const location = useLocation();
  const showNav = isLoggedIn && !HIDDEN_NAV.includes(location.pathname);
  const [showQuiz, setShowQuiz] = useState(false);
  usePawParticles();

  const homeRedirect = () => {
    if (!isLoggedIn) return <Navigate to="/" replace />;
    if (role === 'admin') return <Navigate to="/admin" replace />;
    if (role === 'vet')   return <Navigate to="/vet-portal" replace />;
    return <Navigate to="/dashboard" replace />;
  };

  return (
    <div className="App">
      {showNav && <Navbar isLoggedIn={isLoggedIn} role={role} onLogout={handleLogout} />}
      <Routes>
        {/* Public */}
        <Route path="/" element={isLoggedIn ? homeRedirect() : <LandingPage />} />
        <Route path="/login"        element={isLoggedIn ? homeRedirect() : <Login onLogin={handleLogin} />} />
        <Route path="/register"     element={isLoggedIn ? homeRedirect() : <Register />} />
        <Route path="/register/vet" element={isLoggedIn ? homeRedirect() : <VetRegister />} />
        <Route path="/forgot-password" element={isLoggedIn ? homeRedirect() : <ForgotPassword />} />
        <Route path="/reset-password"  element={isLoggedIn ? homeRedirect() : <ResetPassword />} />

        {/* Adopter routes */}
        <Route path="/dashboard"  element={isLoggedIn && role === 'adopter' ? <Dashboard onOpenQuiz={() => setShowQuiz(true)} /> : homeRedirect()} />
        <Route path="/animals"    element={isLoggedIn && role !== 'vet'     ? <AnimalList onOpenQuiz={() => setShowQuiz(true)} /> : homeRedirect()} />
        <Route path="/centers"    element={isLoggedIn && role !== 'vet'     ? <Centers /> : homeRedirect()} />
        <Route path="/adoption"   element={isLoggedIn && role === 'adopter' ? <AdoptionForm /> : homeRedirect()} />
        <Route path="/my-profile" element={isLoggedIn && role === 'adopter' ? <MyApplications /> : homeRedirect()} />
        <Route path="/shop"       element={isLoggedIn && role === 'adopter' ? <Shop /> : homeRedirect()} />
        <Route path="/pricing"    element={<Pricing />} />

        {/* Admin routes */}
        <Route path="/admin" element={isLoggedIn && role === 'admin' ? <AdminDashboard onLogout={handleLogout} /> : homeRedirect()} />

        {/* Vet routes */}
        <Route path="/vet-portal" element={isLoggedIn && role === 'vet' ? <VetPortal onLogout={handleLogout} /> : homeRedirect()} />

        {/* Fallback */}
        <Route path="*" element={homeRedirect()} />
      </Routes>
      {isLoggedIn && role === 'adopter' && <Chatbot />}
      {isLoggedIn && role === 'adopter' && showQuiz && <Quiz onClose={() => setShowQuiz(false)} />}
    </div>
  );
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('user_id'));
  const [role, setRole] = useState(() => localStorage.getItem('role') || 'adopter');

  const handleLogin = () => {
    setIsLoggedIn(true);
    setRole(localStorage.getItem('role') || 'adopter');
  };

  // Single source of truth for push resync — EnableNotificationsBanner and
  // NotificationSettings used to each call this independently on mount, racing
  // each other and leaving stale "Off" state in the UI.
  useEffect(() => {
    if (isLoggedIn) syncPushSubscription();
  }, [isLoggedIn]);

  const handleLogout = () => {
    const refresh_token = getRefreshToken();
    if (refresh_token) {
      fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token }),
      }).catch(() => {});
    }
    clearAuth();
    setIsLoggedIn(false);
    setRole('adopter');
  };

  return (
    <Router>
      <AppContent
        isLoggedIn={isLoggedIn}
        role={role}
        handleLogin={handleLogin}
        handleLogout={handleLogout}
      />
    </Router>
  );
}

export default App;
