import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../constants';

export const Register = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (pass !== confirmPass) { setMessage('Passwords do not match'); return; }
    if (pass.length < 6) { setMessage('Password must be at least 6 characters'); return; }
    setIsLoading(true);
    setMessage('');
    try {
      const res = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password: pass }),
      });
      const data = await res.json();
      if (res.ok) { setIsSuccess(true); setTimeout(() => navigate('/login'), 2000); }
      else setMessage(data.detail);
    } catch { setMessage('Connection error. Is the server running?'); }
    finally { setIsLoading(false); }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Left - Photo */}
      <div style={{ flex: 1, position: 'relative', minWidth: '45%', display: 'none' }} className="auth-photo-panel">
        <img src="https://images.unsplash.com/photo-1552053831-71594a27632d?w=900&q=80" alt="pets"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(102,126,234,0.8), rgba(118,75,162,0.7))' }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '3rem', color: 'white' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏠</div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem', lineHeight: 1.2 }}>Give a pet a forever home</h2>
          <p style={{ fontSize: '1.1rem', opacity: 0.9, lineHeight: 1.7 }}>Join our community of animal lovers and help rescue pets find the loving families they deserve.</p>
          <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {['Browse 21+ animals available for adoption', 'Save your favorites with one click', 'Track your adoption applications'].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1rem' }}>
                <div style={{ width: '24px', height: '24px', background: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', flexShrink: 0 }}>✓</div>
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right - Form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f9ff', padding: '2rem' }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div onClick={() => navigate('/')} style={{ fontSize: '1.8rem', fontWeight: 800, background: 'linear-gradient(135deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', cursor: 'pointer', marginBottom: '0.5rem' }}>
              🐾 RescueMePets
            </div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#2d3748', margin: '0 0 0.5rem' }}>Create your account</h1>
            <p style={{ color: '#718096', margin: 0 }}>Start your adoption journey today — it's free!</p>
          </div>

          <div style={{ background: 'white', borderRadius: '20px', padding: '2.5rem', boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}>
            {isSuccess ? (
              <div style={{ textAlign: 'center', padding: '1rem' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
                <h3 style={{ color: '#2d3748', marginBottom: '0.5rem' }}>Account Created!</h3>
                <p style={{ color: '#718096' }}>Redirecting you to login...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                <div className="form-group">
                  <label className="form-label">Username</label>
                  <input value={username} onChange={e => setUsername(e.target.value)} type="text"
                    placeholder="Choose a username" className="auth-input" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input value={email} onChange={e => setEmail(e.target.value)} type="email"
                    placeholder="your@email.com" className="auth-input" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input value={pass} onChange={e => setPass(e.target.value)} type="password"
                    placeholder="Min. 6 characters" className="auth-input" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm Password</label>
                  <input value={confirmPass} onChange={e => setConfirmPass(e.target.value)} type="password"
                    placeholder="Repeat your password" className="auth-input" required />
                </div>

                {message && <div className="error-message">{message}</div>}

                <button type="submit" className="auth-button" disabled={isLoading}>
                  {isLoading ? '⏳ Creating account...' : '🐾 Create Account'}
                </button>
              </form>
            )}

            {!isSuccess && (
              <div style={{ textAlign: 'center', marginTop: '1.5rem', color: '#718096' }}>
                Already have an account?{' '}
                <button onClick={() => navigate('/login')} style={{ background: 'none', border: 'none', color: '#667eea', fontWeight: 700, cursor: 'pointer', fontSize: '1rem' }}>
                  Sign in
                </button>
              </div>
            )}
          </div>

          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: '#a0aec0', cursor: 'pointer', fontSize: '0.9rem' }}>
              ← Back to home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
