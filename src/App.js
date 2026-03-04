import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import AgentMarketplace from './components/AgentMarketplace';
import MyAgents from './components/MyAgents';
import { Login } from "./components/Login";
import { Register } from "./components/Register";
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem('user');
    setIsLoggedIn(!!user);
  }, []);

  const toggleForm = (formName) => {
    // Not used anymore but keeping for compatibility
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setIsLoggedIn(false);
  };

  return (
    <Router>
      <div className="App">
        {isLoggedIn && <Navbar isLoggedIn={isLoggedIn} onLogout={handleLogout} />}

        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/marketplace"
            element={isLoggedIn ? <AgentMarketplace /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/my-agents"
            element={isLoggedIn ? <MyAgents /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/login"
            element={
              isLoggedIn ? (
                <Navigate to="/marketplace" replace />
              ) : (
                <Login onFormSwitch={toggleForm} onLogin={handleLogin} />
              )
            }
          />
          <Route
            path="/register"
            element={
              isLoggedIn ? (
                <Navigate to="/marketplace" replace />
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
