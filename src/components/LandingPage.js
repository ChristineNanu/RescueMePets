import React from 'react';
import { useNavigate } from 'react-router-dom';

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div style={{
        textAlign: 'center',
        color: 'white',
        maxWidth: '600px'
      }}>
        <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>🐾</div>
        
        <h1 style={{
          fontSize: '3.5rem',
          fontWeight: '700',
          marginBottom: '1rem'
        }}>
          RescueMePets
        </h1>
        
        <p style={{
          fontSize: '1.3rem',
          marginBottom: '3rem',
          opacity: 0.9
        }}>
          Give a rescue animal a loving home
        </p>
        
        <div style={{
          display: 'flex',
          gap: '1.5rem',
          justifyContent: 'center'
        }}>
          <button
            onClick={() => navigate('/login')}
            style={{
              padding: '1rem 2.5rem',
              fontSize: '1.1rem',
              fontWeight: '600',
              background: 'white',
              color: '#667eea',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'transform 0.2s'
            }}
            onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
          >
            Login
          </button>
          
          <button
            onClick={() => navigate('/register')}
            style={{
              padding: '1rem 2.5rem',
              fontSize: '1.1rem',
              fontWeight: '600',
              background: 'transparent',
              color: 'white',
              border: '2px solid white',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.target.style.background = 'white';
              e.target.style.color = '#667eea';
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'transparent';
              e.target.style.color = 'white';
            }}
          >
            Register
          </button>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
