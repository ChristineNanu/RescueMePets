import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../constants';

export const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [pass, setPass] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    try {
      const res = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password: pass }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('user_id', data.user_id);
        localStorage.setItem('username', data.username);
        if (onLogin) onLogin();
        navigate('/dashboard');
      } else {
        setMessage(data.detail);
      }
    } catch { setMessage('Connection error. Is the server running?'); }
    finally { setIsLoading(false); }
  };

  return (
    <div className="flex min-h-screen">

      {/* Left — Photo Panel */}
      <div className="hidden md:flex md:w-1/2 relative">
        <img
          src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=900&q=80"
          alt="pets"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/85 to-purple-800/80" />
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <div className="text-5xl mb-6">🐾</div>
          <h2 className="text-4xl font-extrabold leading-tight mb-4">
            Welcome back to<br />RescueMePets
          </h2>
          <p className="text-violet-200 text-lg leading-relaxed">
            Thousands of animals are waiting for their forever home. Your next best friend is just a click away.
          </p>
          <div className="mt-8 flex flex-col gap-3">
            {['Browse animals available for adoption', 'Save your favorites with one click', 'Track your adoption applications'].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-violet-100">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs flex-shrink-0">✓</div>
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — Form */}
      <div className="flex-1 flex items-center justify-center bg-slate-50 px-6 py-12">
        <div className="w-full max-w-md">

          {/* Logo */}
          <div className="text-center mb-8">
            <button onClick={() => navigate('/')}
              className="text-2xl font-extrabold bg-gradient-to-r from-violet-600 to-purple-700 bg-clip-text text-transparent bg-transparent border-0 cursor-pointer mb-2 block w-full">
              🐾 RescueMePets
            </button>
            <h1 className="text-2xl font-extrabold text-gray-800 mb-1">Welcome back!</h1>
            <p className="text-gray-400 text-sm">Sign in to continue your adoption journey</p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-3xl shadow-xl shadow-gray-100 border border-gray-100 p-8">
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-violet-500 focus:outline-none text-gray-700 text-sm bg-gray-50 focus:bg-white transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700">Password</label>
                <input
                  type="password"
                  value={pass}
                  onChange={e => setPass(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-violet-500 focus:outline-none text-gray-700 text-sm bg-gray-50 focus:bg-white transition-colors"
                />
              </div>

              {message && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                  ⚠️ {message}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3.5 rounded-xl font-bold text-base transition-all border-0
                  ${isLoading
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-violet-600 to-purple-700 text-white cursor-pointer hover:shadow-lg hover:shadow-violet-200 hover:-translate-y-0.5'}`}>
                {isLoading ? '⏳ Signing in...' : '🔐 Sign In'}
              </button>
            </form>

            <div className="text-center mt-6 text-sm text-gray-400">
              Don't have an account?{' '}
              <button onClick={() => navigate('/register')}
                className="text-violet-600 font-bold bg-transparent border-0 cursor-pointer hover:text-purple-700">
                Register here
              </button>
            </div>
          </div>

          <div className="text-center mt-5">
            <button onClick={() => navigate('/')}
              className="text-gray-400 text-sm bg-transparent border-0 cursor-pointer hover:text-gray-600 transition-colors">
              ← Back to home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
