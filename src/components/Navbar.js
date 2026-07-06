import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../constants';

const NAV_LINKS = [
  { to: '/dashboard', icon: '🏡', label: 'Home'    },
  { to: '/animals',   icon: '🐾', label: 'Animals' },
  { to: '/centers',   icon: '🏠', label: 'Centers' },
  { to: '/adoption',  icon: '📋', label: 'Adopt'   },
];

export default function Navbar({ isLoggedIn, onLogout }) {
  const location = useLocation();
  const navigate  = useNavigate();
  const username  = localStorage.getItem('username');
  const userId    = localStorage.getItem('user_id');
  const [menuOpen, setMenuOpen] = useState(false);
  const [unread, setUnread]     = useState(0);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!userId || isNaN(parseInt(userId))) return;
    const load = () =>
      fetch(`${API_BASE_URL}/notifications/unread-count?user_id=${parseInt(userId)}`)
        .then(r => r.ok ? r.json() : null)
        .then(d => d && setUnread(d.count || 0))
        .catch(() => {});
    load();
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, [userId]);

  useEffect(() => {
    if (location.pathname === '/my-profile' && userId && unread > 0) {
      fetch(`${API_BASE_URL}/notifications/mark-read?user_id=${parseInt(userId)}`, { method: 'POST' })
        .then(() => setUnread(0)).catch(() => {});
    }
  }, [location.pathname, userId, unread]);

  const handleLogout = () => { onLogout(); navigate('/'); };

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300
      ${scrolled ? 'bg-white shadow-md shadow-black/5 border-b border-gray-100' : 'bg-white/95 backdrop-blur-xl border-b border-gray-100'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to={isLoggedIn ? '/dashboard' : '/'} className="flex items-center gap-2 no-underline group">
            <span className="text-2xl group-hover:animate-wiggle inline-block transition-transform">🐾</span>
            <span className="text-lg font-black text-gradient hidden sm:block">RescueMePets</span>
          </Link>

          {/* Desktop Nav */}
          {isLoggedIn && (
            <div className="hidden md:flex items-center bg-gray-50 rounded-2xl p-1 gap-0.5">
              {NAV_LINKS.map(({ to, icon, label }) => {
                const active = location.pathname === to;
                return (
                  <Link key={to} to={to}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 no-underline
                      ${active
                        ? 'bg-white text-amber-600 shadow-sm shadow-black/5'
                        : 'text-gray-500 hover:text-gray-800 hover:bg-white/60'}`}>
                    <span className="text-base">{icon}</span>
                    <span>{label}</span>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Right */}
          <div className="flex items-center gap-2">
            {isLoggedIn ? (
              <>
                {/* Profile */}
                <button onClick={() => navigate('/my-profile')}
                  className="hidden md:flex relative items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl
                    hover:bg-gray-50 transition-all duration-200 border-0 bg-transparent cursor-pointer group">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500
                    flex items-center justify-center text-white text-sm font-black shadow-sm
                    group-hover:shadow-md group-hover:shadow-amber-200 transition-all">
                    {username?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="text-sm font-semibold text-gray-700 max-w-[80px] truncate">{username}</span>
                  {unread > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 rounded-full
                      flex items-center justify-center text-white text-[10px] font-black border-2 border-white px-1">
                      {unread > 9 ? '9+' : unread}
                    </span>
                  )}
                </button>
                <button onClick={handleLogout}
                  className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold
                    text-gray-500 hover:text-red-500 hover:bg-red-50 transition-all duration-200
                    border-0 bg-transparent cursor-pointer">
                  <span>↩</span> Logout
                </button>
                {/* Mobile hamburger */}
                <button onClick={() => setMenuOpen(!menuOpen)}
                  className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl
                    text-gray-600 hover:bg-gray-100 border-0 bg-transparent cursor-pointer transition-all">
                  {menuOpen
                    ? <span className="text-lg font-bold">✕</span>
                    : <span className="text-xl">☰</span>}
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login"
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600
                    hover:text-amber-600 hover:bg-amber-50 transition-all no-underline">
                  Login
                </Link>
                <Link to="/register"
                  className="px-4 py-2 rounded-xl text-sm font-bold text-white btn-primary no-underline">
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isLoggedIn && menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1 animate-slide-down">
          {NAV_LINKS.map(({ to, icon, label }) => {
            const active = location.pathname === to;
            return (
              <Link key={to} to={to} onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold no-underline transition-all
                  ${active ? 'bg-amber-50 text-amber-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                <span className="text-lg">{icon}</span>{label}
              </Link>
            );
          })}
          <Link to="/my-profile" onClick={() => setMenuOpen(false)}
            className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold no-underline text-gray-600 hover:bg-gray-50 transition-all">
            <span className="flex items-center gap-3"><span className="text-lg">👤</span>Profile</span>
            {unread > 0 && <span className="bg-red-500 text-white text-xs font-black px-2 py-0.5 rounded-full">{unread}</span>}
          </Link>
          <button onClick={() => { setMenuOpen(false); handleLogout(); }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold
              text-red-500 hover:bg-red-50 transition-all border-0 bg-transparent cursor-pointer text-left">
            <span className="text-lg">↩</span> Logout
          </button>
        </div>
      )}
    </nav>
  );
}
