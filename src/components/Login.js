import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../constants';
import { setTokens } from '../api';

export const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [pass, setPass]         = useState('');
  const [message, setMessage]   = useState('');
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setMessage('');
    try {
      const res  = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password: pass }),
      });
      const data = await res.json();
      if (res.ok && data.user_id) {
        localStorage.setItem('user_id', data.user_id);
        localStorage.setItem('username', data.username);
        localStorage.setItem('role', data.role);
        if (data.vet_id) localStorage.setItem('vet_id', data.vet_id);
        setTokens(data);
        if (onLogin) onLogin();
        if (data.role === 'admin')   navigate('/admin');
        else if (data.role === 'vet') navigate('/vet-portal');
        else navigate('/dashboard');
      } else setMessage(data.detail || 'Login failed');
    } catch { setMessage('Connection error. Is the server running?'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden bg-teal-800">
        <img src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=75"
          alt="pets" className="absolute inset-0 w-full h-full object-cover"
          loading="eager" fetchpriority="high" decoding="async" />
        <div className="absolute inset-0 bg-gradient-to-br from-teal-900/92 via-teal-800/80 to-teal-600/70" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-coral-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-300/10 rounded-full blur-3xl" />
        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          <button onClick={() => navigate('/')} className="flex items-center gap-2.5 bg-transparent border-0 cursor-pointer text-white w-fit">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center"><span className="text-lg">🐾</span></div>
            <span className="text-xl font-black">RescueMePets</span>
          </button>
          <div>
            <h2 className="text-5xl font-black leading-tight mb-5 animate-fade-up">
              Every pet deserves<br />a loving home.
            </h2>
            <p className="text-white/65 text-lg leading-relaxed mb-8 animate-fade-up-1">
              Thousands of animals are waiting for their forever family. Your next best friend is just a click away.
            </p>
            <div className="space-y-3 animate-fade-up-2">
              {['Browse animals available for adoption', 'Save your favorites with one click', 'Track your adoption applications'].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-white/80 text-sm font-medium">
                  <div className="w-5 h-5 rounded-full bg-teal-400/30 border border-teal-300/40 flex items-center justify-center text-xs font-bold flex-shrink-0 text-teal-200">✓</div>
                  {item}
                </div>
              ))}
            </div>
          </div>
          <p className="text-white/30 text-xs">© 2026 RescueMePets</p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-gradient-to-br from-teal-50/60 via-white to-cream-50/30">
        <div className="w-full max-w-md animate-fade-up">
          <div className="lg:hidden text-center mb-8">
            <button onClick={() => navigate('/')} className="bg-transparent border-0 cursor-pointer inline-flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-md"><span className="text-lg">🐾</span></div>
              <span className="text-xl font-black text-gradient">RescueMePets</span>
            </button>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-black text-gray-900 mb-1">Welcome back!</h1>
            <p className="text-gray-500 text-sm">Sign in to continue your journey</p>
          </div>

          <div className="bg-white rounded-3xl shadow-card border border-teal-50 p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Username</label>
                <input type="text" value={username} onChange={e => setUsername(e.target.value)}
                  placeholder="Enter your username" required className="input-field" />
              </div>
              <div>
                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Password</label>
                <input type="password" value={pass} onChange={e => setPass(e.target.value)}
                  placeholder="Enter your password" required className="input-field" />
              </div>

              {message && (
                <div className="flex items-center gap-2 bg-coral-50 ring-1 ring-coral-200 text-coral-700 text-sm px-4 py-3 rounded-xl font-medium animate-scale-in">
                  ⚠️ {message}
                </div>
              )}

              <button type="submit" disabled={loading}
                className={`w-full py-3.5 rounded-2xl font-bold text-base transition-all border-0
                  ${loading ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'btn-primary shadow-lg shadow-teal-200/50'}`}>
                {loading ? '⏳ Signing in...' : '🔐 Sign In'}
              </button>
            </form>

            <div className="text-center mt-6 text-sm text-gray-500">
              Don't have an account?{' '}
              <button onClick={() => navigate('/register')}
                className="text-teal-600 font-bold bg-transparent border-0 cursor-pointer hover:text-teal-700 hover:underline">
                Register here
              </button>
            </div>
          </div>

          <div className="text-center mt-5">
            <button onClick={() => navigate('/')}
              className="text-gray-400 text-sm bg-transparent border-0 cursor-pointer hover:text-gray-600 transition-colors font-medium">
              ← Back to home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
