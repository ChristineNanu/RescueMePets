import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import AnimalList from './components/AnimalList';
import AnimalManagement from './components/AnimalManagement';
import SQLInterface from './components/SQLInterface';
import AdoptionForm from './components/AdoptionForm';
import Centers from './components/Centers';
import { Login } from "./components/Login";
import { Register } from "./components/Register";
import './App.css';

function App() {
  const [currentForm, setCurrentForm] = useState('login');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const userId = localStorage.getItem('user_id');
    setIsLoggedIn(!!userId);
  }, []);

  const toggleForm = (formName) => {
    setCurrentForm(formName);
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('user_id');
    setIsLoggedIn(false);
  };

  return (
    <Router>
      <div className="App">
        <Navbar isLoggedIn={isLoggedIn} onLogout={handleLogout} />

        <Routes>
          <Route
            path="/"
            element={
              isLoggedIn ? (
                <Navigate to="/animals" replace />
              ) : (
                currentForm === 'login' ? (
                  <Login onFormSwitch={toggleForm} onLogin={handleLogin} />
                ) : (
                  <Register onFormSwitch={toggleForm} />
                )
              )
            }
          />
          <Route
            path="/animals"
            element={isLoggedIn ? <AnimalList /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/manage"
            element={isLoggedIn ? <AnimalManagement /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/sql"
            element={isLoggedIn ? <SQLInterface /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/centers"
            element={isLoggedIn ? <Centers /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/adoption"
            element={isLoggedIn ? <AdoptionForm /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/login"
            element={
              isLoggedIn ? (
                <Navigate to="/animals" replace />
              ) : (
                <Login onFormSwitch={toggleForm} onLogin={handleLogin} />
              )
            }
          />
          <Route
            path="/register"
            element={
              isLoggedIn ? (
                <Navigate to="/animals" replace />
              ) : (
                <Register onFormSwitch={toggleForm} />
              )
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
