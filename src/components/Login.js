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
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Left - Photo */}
      <div style={{ flex: 1, position: 'relative', display: 'none', minWidth: '45%' }} className="auth-photo-panel">
        <img src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=900&q=80" alt="pets"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(102,126,234,0.8), rgba(118,75,162,0.7))' }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '3rem', color: 'white' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🐾</div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem', lineHeight: 1.2 }}>Welcome back to RescueMePets</h2>
          <p style={{ fontSize: '1.1rem', opacity: 0.9, lineHeight: 1.7 }}>Thousands of animals are waiting for their forever home. Your next best friend is just a click away.</p>
        </div>
      </div>

      {/* Right - Form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f9ff', padding: '2rem' }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div onClick={() => navigate('/')} style={{ fontSize: '1.8rem', fontWeight: 800, background: 'linear-gradient(135deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', cursor: 'pointer', marginBottom: '0.5rem' }}>
              🐾 RescueMePets
            </div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#2d3748', margin: '0 0 0.5rem' }}>Welcome back!</h1>
            <p style={{ color: '#718096', margin: 0 }}>Sign in to continue your adoption journey</p>
          </div>

          <div style={{ background: 'white', borderRadius: '20px', padding: '2.5rem', boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Username</label>
                <input value={username} onChange={e => setUsername(e.target.value)} type="text"
                  placeholder="Enter your username" className="auth-input" required />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input value={pass} onChange={e => setPass(e.target.value)} type="password"
                  placeholder="Enter your password" className="auth-input" required />
              </div>

              {message && <div className="error-message">{message}</div>}

              <button type="submit" className="auth-button" disabled={isLoading}>
                {isLoading ? '⏳ Signing in...' : '🔐 Sign In'}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '1.5rem', color: '#718096' }}>
              Don't have an account?{' '}
              <button onClick={() => navigate('/register')} style={{ background: 'none', border: 'none', color: '#667eea', fontWeight: 700, cursor: 'pointer', fontSize: '1rem' }}>
                Register here
              </button>
            </div>
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

export default Login;
