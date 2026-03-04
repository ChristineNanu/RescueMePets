import React from 'react';
import { useNavigate } from 'react-router-dom';

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      padding: '2rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated background elements */}
      <div style={{
        position: 'absolute',
        top: '10%',
        right: '10%',
        width: '300px',
        height: '300px',
        background: 'radial-gradient(circle, rgba(6, 182, 212, 0.1) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(40px)'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '10%',
        left: '10%',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(168, 85, 247, 0.1) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(40px)'
      }} />

      <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', color: 'white', marginBottom: '4rem', paddingTop: '4rem' }}>
          <div style={{ 
            fontSize: '5rem', 
            marginBottom: '1rem',
            background: 'linear-gradient(135deg, #06b6d4, #a855f7)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            🤖
          </div>
          
          <h1 style={{
            fontSize: '4.5rem',
            fontWeight: '900',
            marginBottom: '1.5rem',
            background: 'linear-gradient(135deg, #06b6d4, #a855f7)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '-2px'
          }}>
            AgentHub
          </h1>
          
          <p style={{
            fontSize: '1.8rem',
            marginBottom: '1rem',
            color: '#94a3b8',
            fontWeight: '300'
          }}>
            Deploy AI Agents That Work 24/7
          </p>
          
          <p style={{
            fontSize: '1.2rem',
            marginBottom: '3rem',
            color: '#64748b',
            maxWidth: '700px',
            margin: '0 auto 3rem'
          }}>
            Automate emails, scheduling, data entry, customer support, and more with pre-built AI agents. No coding required.
          </p>
          
          <div style={{
            display: 'flex',
            gap: '1.5rem',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={() => navigate('/register')}
              style={{
                padding: '1.25rem 3rem',
                fontSize: '1.2rem',
                fontWeight: '700',
                background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                boxShadow: '0 10px 40px rgba(6, 182, 212, 0.4)',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-3px)';
                e.target.style.boxShadow = '0 15px 50px rgba(6, 182, 212, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 10px 40px rgba(6, 182, 212, 0.4)';
              }}
            >
              Start Free Trial
            </button>
            
            <button
              onClick={() => navigate('/login')}
              style={{
                padding: '1.25rem 3rem',
                fontSize: '1.2rem',
                fontWeight: '700',
                background: 'rgba(255, 255, 255, 0.05)',
                color: 'white',
                border: '2px solid rgba(6, 182, 212, 0.3)',
                borderRadius: '12px',
                cursor: 'pointer',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(6, 182, 212, 0.1)';
                e.target.style.borderColor = '#06b6d4';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                e.target.style.borderColor = 'rgba(6, 182, 212, 0.3)';
              }}
            >
              Sign In
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2rem',
          marginTop: '5rem'
        }}>
          {[
            { icon: '📧', title: 'Email Automation', desc: 'Auto-respond to customer emails' },
            { icon: '📅', title: 'Smart Scheduling', desc: 'AI-powered meeting coordination' },
            { icon: '💬', title: '24/7 Support', desc: 'Never miss a customer inquiry' },
            { icon: '📊', title: 'Data Processing', desc: 'Extract & organize data instantly' },
            { icon: '✍️', title: 'Content Creation', desc: 'Generate marketing copy & posts' },
            { icon: '🔍', title: 'Lead Research', desc: 'Find & qualify prospects automatically' }
          ].map((feature, i) => (
            <div
              key={i}
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                padding: '2rem',
                textAlign: 'center',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(6, 182, 212, 0.05)';
                e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.3)';
                e.currentTarget.style.transform = 'translateY(-5px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{feature.icon}</div>
              <h3 style={{ color: 'white', fontSize: '1.3rem', marginBottom: '0.5rem', fontWeight: '700' }}>
                {feature.title}
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '2rem',
          marginTop: '5rem',
          padding: '3rem',
          background: 'rgba(6, 182, 212, 0.05)',
          borderRadius: '20px',
          border: '1px solid rgba(6, 182, 212, 0.2)'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', fontWeight: '800', color: '#06b6d4', marginBottom: '0.5rem' }}>
              8+
            </div>
            <div style={{ color: '#94a3b8', fontSize: '1.1rem' }}>AI Agents</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', fontWeight: '800', color: '#a855f7', marginBottom: '0.5rem' }}>
              1000+
            </div>
            <div style={{ color: '#94a3b8', fontSize: '1.1rem' }}>Companies</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', fontWeight: '800', color: '#06b6d4', marginBottom: '0.5rem' }}>
              50k+
            </div>
            <div style={{ color: '#94a3b8', fontSize: '1.1rem' }}>Tasks Automated</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
