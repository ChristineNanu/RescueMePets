import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../constants';
import { apiFetch } from '../api';

const ADOPTER_LINKS = [
  { to: '/dashboard', label: 'Home'    },
  { to: '/animals',   label: 'Animals' },
  { to: '/centers',   label: 'Centers' },
  { to: '/adoption',  label: 'Adopt'   },
  { to: '/shop',      label: '🛒 Shop' },
];

export default function Navbar({ isLoggedIn, role, onLogout }) {
  const NAV_LINKS = ADOPTER_LINKS;
  const location = useLocation();
  const navigate  = useNavigate();
  const userId    = localStorage.getItem('user_id');
  const [menuOpen, setMenuOpen] = useState(false);
  const [unread, setUnread]     = useState(0);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!userId || isNaN(parseInt(userId))) return;
    const load = () =>
      apiFetch(`${API_BASE_URL}/notifications/unread-count?user_id=${parseInt(userId)}`)
        .then(r => r.ok ? r.json() : null)
        .then(d => d && setUnread(d.count || 0))
        .catch(() => {});
    load();
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, [userId]);

  useEffect(() => {
    if (location.pathname === '/my-profile' && userId && unread > 0) {
      apiFetch(`${API_BASE_URL}/notifications/mark-read?user_id=${parseInt(userId)}`, { method: 'POST' })
        .then(() => setUnread(0)).catch(() => {});
    }
  }, [location.pathname, userId, unread]);

  const handleLogout = () => { onLogout(); navigate('/'); }; // eslint-disable-line no-unused-vars

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300
      ${scrolled
        ? 'bg-white/95 backdrop-blur-xl shadow-lg shadow-teal-900/5 border-b border-teal-100/60'
        : 'bg-white/90 backdrop-blur-xl border-b border-teal-100/40'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to={isLoggedIn ? '/dashboard' : '/'} className="flex items-center gap-2.5 no-underline group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-md shadow-teal-200 group-hover:shadow-glow-teal transition-all duration-300">
              <span className="text-lg">🐾</span>
            </div>
            <span className="text-lg font-black text-gradient hidden sm:block">RescueMePets</span>
          </Link>

          {/* Desktop Nav */}
          {isLoggedIn && (
            <div className="hidden md:flex items-center bg-teal-50/80 rounded-2xl p-1 gap-0.5">
              {NAV_LINKS.map(({ to, label }) => {
                const active = location.pathname === to;
                return (
                  <Link key={to} to={to}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 no-underline
                      ${active
                        ? 'bg-white text-teal-700 shadow-sm shadow-teal-100'
                        : 'text-teal-600/70 hover:text-teal-700 hover:bg-white/70'}`}>
                    {label}
                  </Link>
                );
              })}
            </div>
          )}

          {/* Right */}
          <div className="flex items-center gap-2">
            {isLoggedIn ? (
              <>
                <button onClick={() => navigate('/my-profile')}
                  className="hidden md:flex relative items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold
                    text-teal-700 hover:bg-teal-50 transition-all duration-200 border-0 bg-transparent cursor-pointer">
                  My Profile
                  {unread > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-coral-500 rounded-full
                      flex items-center justify-center text-white text-[10px] font-black border-2 border-white px-1">
                      {unread > 9 ? '9+' : unread}
                    </span>
                  )}
                </button>
                <button onClick={() => setMenuOpen(!menuOpen)}
                  className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl
                    text-teal-600 hover:bg-teal-50 border-0 bg-transparent cursor-pointer transition-all">
                  {menuOpen ? <span className="text-lg font-bold">✕</span> : <span className="text-xl">☰</span>}
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login"
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-teal-700
                    hover:bg-teal-50 transition-all no-underline">
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
        <div className="md:hidden border-t border-teal-100 bg-white px-4 py-3 space-y-1 animate-slide-down">
          {NAV_LINKS.map(({ to, label }) => {
            const active = location.pathname === to;
            return (
              <Link key={to} to={to} onClick={() => setMenuOpen(false)}
                className={`flex items-center px-4 py-3 rounded-xl text-sm font-semibold no-underline transition-all
                  ${active ? 'bg-teal-50 text-teal-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                {label}
              </Link>
            );
          })}
          <Link to="/my-profile" onClick={() => setMenuOpen(false)}
            className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold no-underline text-gray-600 hover:bg-gray-50 transition-all">
            My Profile
            {unread > 0 && <span className="bg-coral-500 text-white text-xs font-black px-2 py-0.5 rounded-full">{unread}</span>}
          </Link>
        </div>
      )}
    </nav>
  );
}
