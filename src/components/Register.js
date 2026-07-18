import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../constants';

export const Register = () => {
  const navigate = useNavigate();
  const [form, setForm]       = useState({ username: '', email: '', password: '', confirm: '' });
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { setMessage('Passwords do not match'); return; }
    if (form.password.length < 6) { setMessage('Password must be at least 6 characters'); return; }
    setLoading(true); setMessage('');
    try {
      const res  = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: form.username, email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (res.ok) { setSuccess(true); setTimeout(() => navigate('/login'), 2200); }
      else setMessage(data.detail || 'Registration failed');
    } catch { setMessage('Connection error. Is the server running?'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden bg-teal-800">
        <img src="https://images.unsplash.com/photo-1552053831-71594a27632d?w=800&q=75"
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
              Give a pet a<br />forever home.
            </h2>
            <p className="text-white/65 text-lg leading-relaxed mb-8 animate-fade-up-1">
              Join our community of animal lovers and help rescue pets find the loving families they deserve.
            </p>
            <div className="space-y-3 animate-fade-up-2">
              {['Browse 21+ animals available for adoption', 'Save your favorites with one click', 'Track your adoption applications'].map((item, i) => (
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
            <h1 className="text-3xl font-black text-gray-900 mb-1">Create your account</h1>
            <p className="text-gray-500 text-sm">Start your adoption journey today — it's free!</p>
          </div>

          <div className="bg-white rounded-3xl shadow-card border border-teal-50 p-8">
            {success ? (
              <div className="text-center py-8 animate-scale-in">
                <div className="w-20 h-20 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-5 shadow-glow-teal">🎉</div>
                <h3 className="text-2xl font-black text-gray-900 mb-2">Account Created!</h3>
                <p className="text-gray-500 text-sm">Redirecting you to login...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {[
                  { key: 'username', label: 'Username',         type: 'text',     placeholder: 'Choose a username'    },
                  { key: 'email',    label: 'Email',            type: 'email',    placeholder: 'your@email.com'       },
                  { key: 'password', label: 'Password',         type: 'password', placeholder: 'Min. 6 characters'    },
                  { key: 'confirm',  label: 'Confirm Password', type: 'password', placeholder: 'Repeat your password' },
                ].map(({ key, label, type, placeholder }) => (
                  <div key={key}>
                    <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">{label}</label>
                    <input type={type} value={form[key]} onChange={set(key)}
                      placeholder={placeholder} required className="input-field" />
                  </div>
                ))}

                {message && (
                  <div className="flex items-center gap-2 bg-coral-50 ring-1 ring-coral-200 text-coral-700 text-sm px-4 py-3 rounded-xl font-medium animate-scale-in">
                    ⚠️ {message}
                  </div>
                )}

                <button type="submit" disabled={loading}
                  className={`w-full py-3.5 rounded-2xl font-bold text-base transition-all border-0 mt-2
                    ${loading ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'btn-primary shadow-lg shadow-teal-200/50'}`}>
                  {loading ? '⏳ Creating account...' : '🐾 Create Account'}
                </button>
              </form>
            )}

            {!success && (
              <div className="text-center mt-6 text-sm text-gray-500">
                Already have an account?{' '}
                <button onClick={() => navigate('/login')}
                  className="text-teal-600 font-bold bg-transparent border-0 cursor-pointer hover:text-teal-700 hover:underline">
                  Sign in
                </button>
              </div>
            )}
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

export default Register;
