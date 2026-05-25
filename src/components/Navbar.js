import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../constants';

const NAV_LINKS = [
  { to: '/animals',  icon: '🐾', label: 'Animals' },
  { to: '/centers',  icon: '🏠', label: 'Centers' },
  { to: '/adoption', icon: '📋', label: 'Adopt' },
];

function Navbar({ isLoggedIn, onLogout }) {
  const location = useLocation();
  const navigate  = useNavigate();
  const username  = localStorage.getItem('username');
  const userId    = localStorage.getItem('user_id');
  const [menuOpen, setMenuOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  // Poll for unread notifications every 30s
  useEffect(() => {
    if (!userId) return;
    const fetch_count = () => {
      fetch(`${API_BASE_URL}/notifications/unread-count?user_id=${userId}`)
        .then(r => r.json())
        .then(d => setUnread(d.count || 0))
        .catch(() => {});
    };
    fetch_count();
    const interval = setInterval(fetch_count, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  // Mark read when visiting profile
  useEffect(() => {
    if (location.pathname === '/my-profile' && userId && unread > 0) {
      fetch(`${API_BASE_URL}/notifications/mark-read?user_id=${userId}`, { method: 'POST' })
        .then(() => setUnread(0)).catch(() => {});
    }
  }, [location.pathname, userId, unread]);

  const handleLogout = () => { onLogout(); navigate('/'); }; // eslint-disable-line

  const activeCls = 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md shadow-amber-200';
  const idleCls   = 'text-gray-500 hover:text-amber-600 hover:bg-amber-50';

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-amber-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to={isLoggedIn ? '/dashboard' : '/'} className="flex items-center gap-2 no-underline">
            <span className="text-2xl">🐾</span>
            <span className="text-xl font-extrabold bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent">
              RescueMePets
            </span>
          </Link>

          {/* Desktop Nav */}
          {isLoggedIn && (
            <div className="hidden md:flex items-center gap-1">
              <Link to="/dashboard" title="Home"
                className={`w-9 h-9 flex items-center justify-center rounded-full transition-all duration-200 no-underline mr-1
                  ${location.pathname === '/dashboard' ? activeCls : idleCls}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7A1 1 0 003 11h1v6a1 1 0 001 1h4v-4h2v4h4a1 1 0 001-1v-6h1a1 1 0 00.707-1.707l-7-7z" />
                </svg>
              </Link>
              {NAV_LINKS.map(({ to, icon, label }) => (
                <Link key={to} to={to}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 no-underline
                    ${location.pathname === to ? activeCls : idleCls}`}>
                  <span className="text-base">{icon}</span>{label}
                </Link>
              ))}
            </div>
          )}

          {/* Right side */}
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <>
                {/* Avatar → Profile with notification badge */}
                <div onClick={() => navigate('/my-profile')} title={username}
                  className="hidden md:flex relative w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 items-center justify-center text-white text-sm font-bold cursor-pointer hover:shadow-md hover:scale-105 transition-all">
                  {username?.[0]?.toUpperCase() || 'U'}
                  {unread > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-black border-2 border-white">
                      {unread > 9 ? '9+' : unread}
                    </span>
                  )}
                </div>
                {/* Mobile hamburger */}
                <button onClick={() => setMenuOpen(!menuOpen)}
                  className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 border-0 bg-transparent cursor-pointer text-lg">
                  {menuOpen ? '✕' : '☰'}
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login"
                  className="px-4 py-2 rounded-full text-sm font-semibold text-amber-700 border-2 border-amber-200 hover:border-amber-400 hover:bg-amber-50 transition-all no-underline">
                  Login
                </Link>
                <Link to="/register"
                  className="px-4 py-2 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-amber-500 to-amber-600 hover:shadow-lg hover:shadow-amber-200 transition-all no-underline">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isLoggedIn && menuOpen && (
        <div className="md:hidden border-t border-amber-100 bg-white px-4 py-3 flex flex-col gap-1">
          <Link to="/dashboard" onClick={() => setMenuOpen(false)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold no-underline transition-all
              ${location.pathname === '/dashboard' ? 'bg-amber-500 text-white' : 'text-gray-600 hover:bg-amber-50 hover:text-amber-600'}`}>
            🏡 Home
          </Link>
          {NAV_LINKS.map(({ to, icon, label }) => (
            <Link key={to} to={to} onClick={() => setMenuOpen(false)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold no-underline transition-all
                ${location.pathname === to ? 'bg-amber-500 text-white' : 'text-gray-600 hover:bg-amber-50 hover:text-amber-600'}`}>
              <span>{icon}</span>{label}
            </Link>
          ))}
          <Link to="/my-profile" onClick={() => setMenuOpen(false)}
            className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-semibold no-underline transition-all
              ${location.pathname === '/my-profile' ? 'bg-amber-500 text-white' : 'text-gray-600 hover:bg-amber-50 hover:text-amber-600'}`}>
            <span>👤 Profile</span>
            {unread > 0 && <span className="bg-red-500 text-white text-xs font-black px-1.5 py-0.5 rounded-full">{unread}</span>}
          </Link>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
