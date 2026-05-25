import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../constants';

function LandingPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total_animals: 21, available: 19, adopted: 1, centers: 4 });

  useEffect(() => {
    fetch(`${API_BASE_URL}/stats`).then(r => r.json()).then(setStats).catch(() => {});
  }, []);

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: '#fff' }}>

      {/* Navbar */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.2rem 3rem', background: 'white', boxShadow: '0 2px 20px rgba(0,0,0,0.08)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ fontSize: '1.6rem', fontWeight: 800, background: 'linear-gradient(135deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          🐾 RescueMePets
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={() => navigate('/login')} style={{ padding: '0.6rem 1.5rem', border: '2px solid #667eea', borderRadius: '8px', background: 'transparent', color: '#667eea', fontWeight: 600, cursor: 'pointer', fontSize: '1rem' }}>
            Login
          </button>
          <button onClick={() => navigate('/register')} style={{ padding: '0.6rem 1.5rem', border: 'none', borderRadius: '8px', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', fontWeight: 600, cursor: 'pointer', fontSize: '1rem' }}>
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ position: 'relative', minHeight: '92vh', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
        <img src="https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=1600&q=80" alt="hero"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(102,126,234,0.85) 0%, rgba(118,75,162,0.75) 100%)' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '700px', padding: '0 3rem', color: 'white' }}>
          <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.2)', padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 600, marginBottom: '1.5rem', backdropFilter: 'blur(10px)' }}>
            🐾 Find your perfect companion
          </div>
          <h1 style={{ fontSize: '4rem', fontWeight: 900, lineHeight: 1.1, marginBottom: '1.5rem', textShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
            Give a Pet a<br />Forever Home 🏠
          </h1>
          <p style={{ fontSize: '1.25rem', opacity: 0.9, marginBottom: '2.5rem', lineHeight: 1.7 }}>
            Browse hundreds of loving animals waiting for their perfect family. Adopt, don't shop — every pet deserves a second chance.
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/register')} style={{ padding: '1rem 2.5rem', fontSize: '1.1rem', fontWeight: 700, background: 'white', color: '#667eea', border: 'none', borderRadius: '12px', cursor: 'pointer', boxShadow: '0 8px 30px rgba(0,0,0,0.2)', transition: 'all 0.3s' }}
              onMouseEnter={e => e.target.style.transform = 'translateY(-3px)'}
              onMouseLeave={e => e.target.style.transform = 'translateY(0)'}>
              🐾 Start Adopting
            </button>
            <button onClick={() => navigate('/login')} style={{ padding: '1rem 2.5rem', fontSize: '1.1rem', fontWeight: 700, background: 'rgba(255,255,255,0.15)', color: 'white', border: '2px solid rgba(255,255,255,0.5)', borderRadius: '12px', cursor: 'pointer', backdropFilter: 'blur(10px)', transition: 'all 0.3s' }}
              onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.25)'}
              onMouseLeave={e => e.target.style.background = 'rgba(255,255,255,0.15)'}>
              Sign In
            </button>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', padding: '2.5rem 3rem' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem', textAlign: 'center' }}>
          {[
            { value: `${stats.total_animals}+`, label: 'Animals Listed' },
            { value: `${stats.available}`, label: 'Available Now' },
            { value: `${stats.adopted}+`, label: 'Happy Adoptions' },
            { value: `${stats.centers}`, label: 'Rescue Centers' },
          ].map((s, i) => (
            <div key={i}>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'white' }}>{s.value}</div>
              <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1rem', marginTop: '0.25rem' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div style={{ padding: '5rem 3rem', background: '#f8f9ff' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem', color: '#2d3748' }}>How It Works</h2>
          <p style={{ textAlign: 'center', color: '#718096', marginBottom: '3rem', fontSize: '1.1rem' }}>Adopting a pet has never been easier</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem' }}>
            {[
              { step: '01', icon: '🔍', title: 'Browse Animals', desc: 'Search and filter through our available pets by species, breed, and personality.' },
              { step: '02', icon: '❤️', title: 'Save Favorites', desc: 'Heart the animals you love and build your shortlist of potential companions.' },
              { step: '03', icon: '📋', title: 'Apply to Adopt', desc: 'Submit your adoption application with a personal message to the rescue center.' },
              { step: '04', icon: '🏠', title: 'Welcome Home', desc: 'Get approved and bring your new best friend home to their forever family.' },
            ].map((item, i) => (
              <div key={i} style={{ background: 'white', borderRadius: '20px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', textAlign: 'center', transition: 'all 0.3s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(102,126,234,0.2)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.06)'; }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#667eea', letterSpacing: '2px', marginBottom: '0.5rem' }}>STEP {item.step}</div>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{item.icon}</div>
                <h3 style={{ fontWeight: 700, color: '#2d3748', marginBottom: '0.5rem' }}>{item.title}</h3>
                <p style={{ color: '#718096', fontSize: '0.95rem', lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Animal Preview */}
      <div style={{ padding: '5rem 3rem', background: 'white' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem', color: '#2d3748' }}>Meet Some of Our Animals</h2>
          <p style={{ textAlign: 'center', color: '#718096', marginBottom: '3rem', fontSize: '1.1rem' }}>Every one of them is waiting for you</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
            {[
              { name: 'Buddy', breed: 'Golden Retriever', img: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&q=80' },
              { name: 'Whiskers', breed: 'Siamese Cat', img: 'https://images.unsplash.com/photo-1555685812-4b943f1cb0eb?w=400&q=80' },
              { name: 'Luna', breed: 'Siberian Husky', img: 'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=400&q=80' },
            ].map((a, i) => (
              <div key={i} style={{ borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', cursor: 'pointer', transition: 'all 0.3s' }}
                onClick={() => navigate('/register')}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-6px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                <img src={a.img} alt={a.name} style={{ width: '100%', height: '220px', objectFit: 'cover' }} />
                <div style={{ padding: '1rem 1.2rem', background: 'white' }}>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#2d3748' }}>{a.name}</div>
                  <div style={{ color: '#718096', fontSize: '0.9rem' }}>{a.breed}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
            <button onClick={() => navigate('/register')} style={{ padding: '1rem 3rem', fontSize: '1.1rem', fontWeight: 700, background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', boxShadow: '0 8px 25px rgba(102,126,234,0.4)' }}>
              View All Animals →
            </button>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: '5rem 3rem', background: 'linear-gradient(135deg, #667eea, #764ba2)', textAlign: 'center', color: 'white' }}>
        <h2 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '1rem' }}>Ready to Find Your Best Friend?</h2>
        <p style={{ fontSize: '1.2rem', opacity: 0.9, marginBottom: '2rem' }}>Join thousands of happy adopters who found their perfect companion</p>
        <button onClick={() => navigate('/register')} style={{ padding: '1.2rem 3rem', fontSize: '1.2rem', fontWeight: 700, background: 'white', color: '#667eea', border: 'none', borderRadius: '12px', cursor: 'pointer', boxShadow: '0 8px 30px rgba(0,0,0,0.2)' }}>
          🐾 Adopt Today — It's Free
        </button>
      </div>

      {/* Footer */}
      <div style={{ background: '#1a202c', color: '#a0aec0', padding: '2rem 3rem', textAlign: 'center', fontSize: '0.95rem' }}>
        © 2026 RescueMePets · Built with ❤️ for animals everywhere
      </div>
    </div>
  );
}

export default LandingPage;
