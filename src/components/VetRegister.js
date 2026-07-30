import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../constants';

export default function VetRegister() {
  const navigate = useNavigate();
  const [centers, setCenters] = useState([]);
  const [form, setForm] = useState({
    username: '', email: '', password: '', confirm: '',
    name: '', clinic: '', phone: '', specialization: 'General', center_id: '',
  });
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/centers`)
      .then(r => r.json())
      .then(setCenters)
      .catch(() => {});
  }, []);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { setMessage('Passwords do not match'); return; }
    if (form.password.length < 6) { setMessage('Password must be at least 6 characters'); return; }
    if (!form.center_id) { setMessage('Please select your rescue center'); return; }
    setLoading(true); setMessage('');
    try {
      const res = await fetch(`${API_BASE_URL}/register/vet`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, center_id: parseInt(form.center_id) }),
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
        <img src="https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=800&q=75"
          alt="vet" className="absolute inset-0 w-full h-full object-cover" loading="eager" />
        <div className="absolute inset-0 bg-gradient-to-br from-teal-900/92 via-teal-800/80 to-teal-600/70" />
        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          <button onClick={() => navigate('/')} className="flex items-center gap-2.5 bg-transparent border-0 cursor-pointer text-white w-fit">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center"><span className="text-lg">🐾</span></div>
            <span className="text-xl font-black">RescueMePets</span>
          </button>
          <div>
            <h2 className="text-5xl font-black leading-tight mb-5">Join as a<br />Vet Partner.</h2>
            <p className="text-white/65 text-lg leading-relaxed mb-8">
              Register your vet account to access your portal, manage support tickets, and help adopted animals thrive.
            </p>
            <div className="space-y-3">
              {['Manage support tickets assigned to you', 'View animals at your rescue center', 'Communicate with adopters'].map((item, i) => (
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
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-gradient-to-br from-teal-50/60 via-white to-cream-50/30 overflow-y-auto">
        <div className="w-full max-w-md animate-fade-up">
          <div className="mb-6">
            <h1 className="text-3xl font-black text-gray-900 mb-1">Vet Registration</h1>
            <p className="text-gray-500 text-sm">Create your vet account</p>
          </div>

          <div className="bg-white rounded-3xl shadow-card border border-teal-50 p-8">
            {success ? (
              <div className="text-center py-8 animate-scale-in">
                <div className="w-20 h-20 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-5 shadow-glow-teal">🏥</div>
                <h3 className="text-2xl font-black text-gray-900 mb-2">Vet Account Created!</h3>
                <p className="text-gray-500 text-sm">Redirecting you to login...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <p className="text-xs font-black text-teal-600 uppercase tracking-widest">Account Details</p>
                {[
                  { key: 'username', label: 'Username',         type: 'text',     placeholder: 'Choose a username'    },
                  { key: 'email',    label: 'Email',            type: 'email',    placeholder: 'your@email.com'       },
                  { key: 'password', label: 'Password',         type: 'password', placeholder: 'Min. 6 characters'    },
                  { key: 'confirm',  label: 'Confirm Password', type: 'password', placeholder: 'Repeat your password' },
                ].map(({ key, label, type, placeholder }) => (
                  <div key={key}>
                    <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">{label}</label>
                    <input type={type} value={form[key]} onChange={set(key)} placeholder={placeholder} required className="input-field" />
                  </div>
                ))}

                <p className="text-xs font-black text-teal-600 uppercase tracking-widest pt-2">Vet Details</p>
                {[
                  { key: 'name',   label: 'Full Name',   type: 'text', placeholder: 'Dr. Jane Doe'       },
                  { key: 'clinic', label: 'Clinic Name', type: 'text', placeholder: 'Paws Veterinary Clinic' },
                  { key: 'phone',  label: 'Phone',       type: 'text', placeholder: '0712345678'          },
                ].map(({ key, label, type, placeholder }) => (
                  <div key={key}>
                    <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">{label}</label>
                    <input type={type} value={form[key]} onChange={set(key)} placeholder={placeholder} required className="input-field" />
                  </div>
                ))}

                <div>
                  <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Specialization</label>
                  <select value={form.specialization} onChange={set('specialization')} className="input-field">
                    {['General', 'Surgery', 'Dentistry', 'Dermatology', 'Nutrition', 'Behaviour'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Rescue Center</label>
                  <select value={form.center_id} onChange={set('center_id')} required className="input-field">
                    <option value="">Select your center...</option>
                    {centers.map(c => <option key={c.id} value={c.id}>{c.name} — {c.location}</option>)}
                  </select>
                </div>

                {message && (
                  <div className="flex items-center gap-2 bg-coral-50 ring-1 ring-coral-200 text-coral-700 text-sm px-4 py-3 rounded-xl font-medium animate-scale-in">
                    ⚠️ {message}
                  </div>
                )}

                <button type="submit" disabled={loading}
                  className={`w-full py-3.5 rounded-2xl font-bold text-base transition-all border-0 mt-2
                    ${loading ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'btn-primary shadow-lg shadow-teal-200/50'}`}>
                  {loading ? '⏳ Creating account...' : '🏥 Register as Vet'}
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
}
