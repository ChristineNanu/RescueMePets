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
      <Link to="/" className="Navbar-logo">🐾 RescueMe Pets</Link>
      <ul className="Navbar-nav">
        {isLoggedIn ? (
          <>
            <li><Link to="/animals" className={location.pathname === '/animals' ? 'active' : ''}>🐕 Animals</Link></li>
            <li><Link to="/centers" className={location.pathname === '/centers' ? 'active' : ''}>🏠 Centers</Link></li>
            <li><Link to="/manage" className={location.pathname === '/manage' ? 'active' : ''}>⚙️ Manage</Link></li>
            <li><Link to="/sql" className={location.pathname === '/sql' ? 'active' : ''}>🗄️ SQL</Link></li>
            <li><Link to="/adoption" className={location.pathname === '/adoption' ? 'active' : ''}>📋 Adopt</Link></li>
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
