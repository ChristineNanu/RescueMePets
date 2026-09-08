import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../constants';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setMessage('');
    try {
      const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setSent(true);
        setMessage(data.detail || data.message || 'If an account exists, a reset link was sent.');
      } else {
        setMessage(data.detail || 'Something went wrong. Please try again.');
      }
    } catch {
      setMessage('Connection error. Is the server running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
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
            <h2 className="text-5xl font-black leading-tight mb-5">
              Every pet deserves<br />a loving home.
            </h2>
            <p className="text-white/65 text-lg leading-relaxed mb-8">
              Thousands of animals are waiting for their forever family. Your next best friend is just a click away.
            </p>
          </div>
          <p className="text-white/30 text-xs">© 2026 RescueMePets</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-gradient-to-br from-teal-50/60 via-white to-cream-50/30">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <button onClick={() => navigate('/')} className="bg-transparent border-0 cursor-pointer inline-flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-md"><span className="text-lg">🐾</span></div>
              <span className="text-xl font-black text-gradient">RescueMePets</span>
            </button>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-black text-gray-900 mb-1">{sent ? 'Check your email' : 'Forgot password?'}</h1>
            <p className="text-gray-500 text-sm">
              {sent
                ? 'We sent a password reset link to your email address.'
                : 'Enter your email and we will send you a reset link.'}
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-card border border-teal-50 p-8">
            {!sent ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Email</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com" required className="input-field" />
                </div>

                {message && (
                  <div className="flex items-center gap-2 bg-coral-50 ring-1 ring-coral-200 text-coral-700 text-sm px-4 py-3 rounded-xl font-medium animate-scale-in">
                    ⚠️ {message}
                  </div>
                )}

                <button type="submit" disabled={loading}
                  className={`w-full py-3.5 rounded-2xl font-bold text-base transition-all border-0
                    ${loading ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'btn-primary shadow-lg shadow-teal-200/50'}`}>
                  {loading ? '⏳ Sending...' : '📧 Send Reset Link'}
                </button>
              </form>
            ) : (
              <div className="space-y-5">
                <div className="flex items-center gap-2 bg-teal-50 ring-1 ring-teal-200 text-teal-700 text-sm px-4 py-3 rounded-xl font-medium animate-scale-in">
                  ✉️ {message}
                </div>
                <button onClick={() => navigate('/login')}
                  className="w-full py-3.5 rounded-2xl font-bold text-base transition-all border-0 btn-primary shadow-lg shadow-teal-200/50">
                  Back to Login
                </button>
              </div>
            )}
          </div>

          <div className="text-center mt-5">
            <button onClick={() => navigate('/login')}
              className="text-gray-400 text-sm bg-transparent border-0 cursor-pointer hover:text-gray-600 transition-colors font-medium">
              ← Back to login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
