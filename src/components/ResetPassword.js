import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { API_BASE_URL } from '../constants';

export const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setMessage('Missing or invalid reset token.');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    if (password !== confirm) {
      setMessage('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setMessage('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, new_password: password }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        setMessage(data.detail || data.message || 'Password reset successful');
      } else {
        setMessage(data.detail || 'Invalid or expired reset token');
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
            <h1 className="text-3xl font-black text-gray-900 mb-1">{success ? 'Password updated' : 'Reset your password'}</h1>
            <p className="text-gray-500 text-sm">
              {success
                ? 'Your password has been changed. You can now log in.'
                : 'Enter a new password for your account.'}
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-card border border-teal-50 p-8">
            {!success ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">New Password</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="At least 6 characters" required className="input-field" />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Confirm Password</label>
                  <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
                    placeholder="Repeat your password" required className="input-field" />
                </div>

                {message && (
                  <div className={`flex items-center gap-2 text-sm px-4 py-3 rounded-xl font-medium animate-scale-in ${
                    message.includes('do not match') || message.includes('Invalid')
                      ? 'bg-coral-50 ring-1 ring-coral-200 text-coral-700'
                      : 'bg-teal-50 ring-1 ring-teal-200 text-teal-700'
                  }`}>
                    {message.includes('do not match') || message.includes('Invalid') ? '⚠️' : '✅'} {message}
                  </div>
                )}

                <button type="submit" disabled={loading || !token}
                  className={`w-full py-3.5 rounded-2xl font-bold text-base transition-all border-0
                    ${loading || !token ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'btn-primary shadow-lg shadow-teal-200/50'}`}>
                  {loading ? '⏳ Updating...' : '🔒 Update Password'}
                </button>
              </form>
            ) : (
              <div className="space-y-5">
                <div className="flex items-center gap-2 bg-teal-50 ring-1 ring-teal-200 text-teal-700 text-sm px-4 py-3 rounded-xl font-medium animate-scale-in">
                  ✅ {message}
                </div>
                <button onClick={() => navigate('/login')}
                  className="w-full py-3.5 rounded-2xl font-bold text-base transition-all border-0 btn-primary shadow-lg shadow-teal-200/50">
                  Go to Login
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

export default ResetPassword;
