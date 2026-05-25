import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const NAV_LINKS = [
  { to: '/dashboard', icon: '📊', label: 'Dashboard' },
  { to: '/animals',   icon: '🐾', label: 'Animals' },
  { to: '/centers',   icon: '🏠', label: 'Centers' },
  { to: '/adoption',  icon: '📋', label: 'Adopt' },
  { to: '/my-profile',icon: '👤', label: 'My Profile' },
];

function Navbar({ isLoggedIn, onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();
  const username = localStorage.getItem('username');
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => { onLogout(); navigate('/'); };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to={isLoggedIn ? '/dashboard' : '/'} className="flex items-center gap-2 no-underline">
            <span className="text-2xl">🐾</span>
            <span className="text-xl font-extrabold bg-gradient-to-r from-violet-600 to-purple-700 bg-clip-text text-transparent">
              RescueMePets
            </span>
          </Link>

          {/* Desktop Nav */}
          {isLoggedIn && (
            <div className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map(({ to, icon, label }) => {
                const active = location.pathname === to;
                return (
                  <Link key={to} to={to}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 no-underline
                      ${active
                        ? 'bg-gradient-to-r from-violet-600 to-purple-700 text-white shadow-md shadow-violet-200'
                        : 'text-gray-500 hover:text-violet-600 hover:bg-violet-50'}`}>
                    <span className="text-base">{icon}</span>
                    {label}
                  </Link>
                );
              })}
            </div>
          )}

          {/* Right side */}
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <>
                {/* Avatar + username */}
                <div className="hidden md:flex items-center gap-2 bg-violet-50 rounded-full px-3 py-1.5">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                    {username?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="text-sm font-semibold text-gray-700">{username}</span>
                </div>
                <button onClick={handleLogout}
                  className="hidden md:flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold text-gray-500 hover:text-red-500 hover:bg-red-50 transition-all duration-200 border-0 bg-transparent cursor-pointer">
                  🚪 Logout
                </button>
                {/* Mobile hamburger */}
                <button onClick={() => setMenuOpen(!menuOpen)}
                  className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 border-0 bg-transparent cursor-pointer">
                  {menuOpen ? '✕' : '☰'}
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login"
                  className="px-4 py-2 rounded-full text-sm font-semibold text-violet-600 border-2 border-violet-200 hover:border-violet-400 hover:bg-violet-50 transition-all no-underline">
                  Login
                </Link>
                <Link to="/register"
                  className="px-4 py-2 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-purple-700 hover:shadow-lg hover:shadow-violet-200 transition-all no-underline">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isLoggedIn && menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 flex flex-col gap-1">
          {NAV_LINKS.map(({ to, icon, label }) => {
            const active = location.pathname === to;
            return (
              <Link key={to} to={to} onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold no-underline transition-all
                  ${active ? 'bg-violet-600 text-white' : 'text-gray-600 hover:bg-violet-50 hover:text-violet-600'}`}>
                <span>{icon}</span>{label}
              </Link>
            );
          })}
          <button onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 border-0 bg-transparent cursor-pointer text-left">
            🚪 Logout
          </button>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
