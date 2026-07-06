import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../constants';

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
        if (onLogin) onLogin();
        navigate('/dashboard');
      } else setMessage(data.detail || 'Login failed');
    } catch { setMessage('Connection error. Is the server running?'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex bg-stone-50">

      {/* Left photo panel */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden">
        <img src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1200&q=85"
          alt="pets" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-amber-600/90 via-orange-600/80 to-rose-700/85" />
        {/* content */}
        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 bg-transparent border-0 cursor-pointer text-white w-fit">
            <span className="text-2xl animate-float inline-block">🐾</span>
            <span className="text-xl font-black">RescueMePets</span>
          </button>
          <div>
            <h2 className="text-5xl font-black leading-tight mb-5 animate-fade-up">
              Every pet deserves<br />a loving home.
            </h2>
            <p className="text-white/75 text-lg leading-relaxed mb-8 animate-fade-up-1">
              Thousands of animals are waiting for their forever family. Your next best friend is just a click away.
            </p>
            <div className="space-y-3 animate-fade-up-2">
              {['Browse animals available for adoption', 'Save your favorites with one click', 'Track your adoption applications'].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-white/90 text-sm font-medium">
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold flex-shrink-0">✓</div>
                  {item}
                </div>
              ))}
            </div>
          </div>
          <p className="text-white/40 text-xs">© 2026 RescueMePets</p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md animate-fade-up">

          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <button onClick={() => navigate('/')} className="bg-transparent border-0 cursor-pointer">
              <span className="text-3xl font-black text-gradient">🐾 RescueMePets</span>
            </button>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-black text-gray-900 mb-1">Welcome back!</h1>
            <p className="text-gray-500 text-sm">Sign in to continue your adoption journey</p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl shadow-black/5 border border-gray-100 p-8">
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
                <div className="flex items-center gap-2 bg-red-50 ring-1 ring-red-200 text-red-600 text-sm px-4 py-3 rounded-xl font-medium animate-scale-in">
                  ⚠️ {message}
                </div>
              )}

              <button type="submit" disabled={loading}
                className={`w-full py-3.5 rounded-2xl font-bold text-base transition-all border-0
                  ${loading ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'btn-primary shadow-lg shadow-amber-200/50'}`}>
                {loading ? '⏳ Signing in...' : '🔐 Sign In'}
              </button>
            </form>

            <div className="text-center mt-6 text-sm text-gray-500">
              Don't have an account?{' '}
              <button onClick={() => navigate('/register')}
                className="text-amber-600 font-bold bg-transparent border-0 cursor-pointer hover:text-amber-700 hover:underline">
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
