import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

function Navbar({ isLoggedIn, onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  return (
    <nav className="Navbar">
      <Link to="/" className="Navbar-logo">🤖 AgentHub</Link>
      <ul className="Navbar-nav">
        {isLoggedIn ? (
          <>
            <li><Link to="/marketplace" className={location.pathname === '/marketplace' ? 'active' : ''}>🛒 Marketplace</Link></li>
            <li><Link to="/my-agents" className={location.pathname === '/my-agents' ? 'active' : ''}>⚡ My Agents</Link></li>
            <li><button onClick={handleLogout} className="logout-btn">🚪 Logout</button></li>
          </>
        ) : (
          <li><Link to="/login" className={location.pathname === '/login' ? 'active' : ''}>🔐 Login</Link></li>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;
