import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../constants';

const CENTER_IMAGES = [
  'https://images.unsplash.com/photo-1601758124510-52d02ddb7cbd?w=800&q=80',
  'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&q=80',
  'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=80',
  'https://images.unsplash.com/photo-1544568100-847a948585b9?w=800&q=80',
];

const STATUS_COLORS = {
  available: { bg: '#f0fff4', color: '#276749', label: '🟢 Available' },
  pending:   { bg: '#fffbeb', color: '#92400e', label: '🟡 Pending' },
  adopted:   { bg: '#fff5f5', color: '#9b2c2c', label: '🔴 Adopted' },
};

function Centers() {
  const [centers, setCenters] = useState([]);
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [centerAnimals, setCenterAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [animalsLoading, setAnimalsLoading] = useState(false);
  const navigate = useNavigate();
  const userId = localStorage.getItem('user_id');

  useEffect(() => {
    fetch(`${API_BASE_URL}/centers`)
      .then(r => r.json())
      .then(data => { setCenters(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleVisitCenter = (center) => {
    setSelectedCenter(center);
    setAnimalsLoading(true);
    const params = userId ? `?user_id=${userId}` : '';
    fetch(`${API_BASE_URL}/animals${params}`)
      .then(r => r.json())
      .then(animals => {
        setCenterAnimals(animals.filter(a => a.center?.id === center.id));
        setAnimalsLoading(false);
      });
  };

  const toggleFavorite = async (e, animalId) => {
    e.stopPropagation();
    if (!userId) { navigate('/login'); return; }
    const res = await fetch(`${API_BASE_URL}/favorites`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: parseInt(userId), animal_id: animalId })
    });
    const data = await res.json();
    setCenterAnimals(prev => prev.map(a => a.id === animalId ? { ...a, is_favorited: data.favorited } : a));
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f5f7fa, #c3cfe2)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🏠</div>
        <div style={{ fontSize: '1.2rem', color: '#667eea', fontWeight: 600 }}>Loading centers...</div>
      </div>
    </div>
  );

  // Center detail view
  if (selectedCenter) {
    const available = centerAnimals.filter(a => a.status === 'available').length;
    return (
      <div className="app-container">
        {/* Center Hero */}
        <div style={{ position: 'relative', height: '300px', overflow: 'hidden' }}>
          <img src={CENTER_IMAGES[(selectedCenter.id - 1) % CENTER_IMAGES.length]} alt={selectedCenter.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 100%)' }} />
          <button onClick={() => { setSelectedCenter(null); setCenterAnimals([]); }}
            style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.3)', color: 'white', padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem' }}>
            ← Back to Centers
          </button>
          <div style={{ position: 'absolute', bottom: '2rem', left: '2rem', color: 'white' }}>
            <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 800, textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>{selectedCenter.name}</h1>
            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.75rem', fontSize: '1rem', opacity: 0.9 }}>
              <span>📍 {selectedCenter.location}</span>
              <span>📧 {selectedCenter.contact}</span>
              <span>🐾 {available} available</span>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div style={{ background: 'white', padding: '1.5rem 2rem', display: 'flex', gap: '3rem', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', justifyContent: 'center' }}>
          {[
            { label: 'Total Animals', value: centerAnimals.length, color: '#667eea' },
            { label: 'Available', value: centerAnimals.filter(a => a.status === 'available').length, color: '#48bb78' },
            { label: 'Pending', value: centerAnimals.filter(a => a.status === 'pending').length, color: '#ed8936' },
            { label: 'Adopted', value: centerAnimals.filter(a => a.status === 'adopted').length, color: '#e53e3e' },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ color: '#718096', fontSize: '0.9rem' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Animals */}
        <div style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 2rem' }}>
          <h2 style={{ color: '#2d3748', fontWeight: 700, marginBottom: '1.5rem' }}>Animals at {selectedCenter.name}</h2>
          {animalsLoading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#667eea' }}>Loading animals...</div>
          ) : centerAnimals.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', background: 'white', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🐾</div>
              <h3 style={{ color: '#2d3748' }}>No animals at this center yet</h3>
              <p style={{ color: '#718096' }}>Check back soon!</p>
            </div>
          ) : (
            <div className="animal-list" style={{ padding: 0 }}>
              {centerAnimals.map(animal => (
                <div className="animal-card fade-in" key={animal.id}>
                  <div style={{ position: 'absolute', top: '1rem', left: '1rem', zIndex: 2, padding: '0.3rem 0.75rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, background: STATUS_COLORS[animal.status]?.bg, color: STATUS_COLORS[animal.status]?.color }}>
                    {STATUS_COLORS[animal.status]?.label}
                  </div>
                  <button onClick={(e) => toggleFavorite(e, animal.id)} style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 2, background: 'white', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', fontSize: '1.2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {animal.is_favorited ? '❤️' : '🤍'}
                  </button>
                  <img src={animal.image} alt={animal.name} className="animal-image"
                    onError={e => e.target.src = 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&q=80'} />
                  <div className="animal-card-content">
                    <h3 className="animal-name">{animal.name}</h3>
                    <div className="animal-details">
                      <div className="animal-detail"><strong>Species:</strong> {animal.species}</div>
                      <div className="animal-detail"><strong>Breed:</strong> {animal.breed}</div>
                      <div className="animal-detail"><strong>Age:</strong> {animal.age} yr{animal.age !== 1 ? 's' : ''}</div>
                    </div>
                    {animal.tags?.length > 0 && (
                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', margin: '0.75rem 0' }}>
                        {animal.tags.map((tag, i) => (
                          <span key={i} style={{ padding: '0.2rem 0.6rem', background: 'rgba(102,126,234,0.1)', color: '#667eea', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600 }}>{tag}</span>
                        ))}
                      </div>
                    )}
                    <p className="animal-description">{animal.description}</p>
                    <button onClick={() => navigate(`/adoption?animalId=${animal.id}`)} disabled={animal.status === 'adopted'}
                      style={{ opacity: animal.status === 'adopted' ? 0.5 : 1, cursor: animal.status === 'adopted' ? 'not-allowed' : 'pointer' }}>
                      {animal.status === 'adopted' ? '🏠 Already Adopted' : '🐾 Adopt Me!'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Centers list view
  return (
    <div className="app-container">
      <div className="page-header">
        <h1>🏠 Rescue Centers</h1>
        <p>Visit our {centers.length} partner rescue centers and meet the animals</p>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(520px, 1fr))', gap: '2rem' }}>
          {centers.map((center, idx) => (
            <div key={center.id} style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 8px 30px rgba(0,0,0,0.1)', transition: 'all 0.3s', cursor: 'pointer' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(102,126,234,0.2)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.1)'; }}
              onClick={() => handleVisitCenter(center)}>
              <div style={{ position: 'relative', height: '200px' }}>
                <img src={CENTER_IMAGES[idx % CENTER_IMAGES.length]} alt={center.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)' }} />
                <div style={{ position: 'absolute', bottom: '1rem', right: '1rem', background: 'rgba(255,255,255,0.95)', borderRadius: '20px', padding: '0.4rem 1rem', fontWeight: 700, color: '#667eea', fontSize: '0.9rem' }}>
                  🐾 {center.animal_count} available
                </div>
              </div>
              <div style={{ padding: '1.5rem' }}>
                <h3 style={{ margin: '0 0 0.75rem', fontSize: '1.4rem', fontWeight: 700, color: '#2d3748' }}>{center.name}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1.25rem' }}>
                  <div style={{ color: '#718096', fontSize: '0.95rem' }}>📍 {center.location}</div>
                  <div style={{ color: '#718096', fontSize: '0.95rem' }}>📧 {center.contact}</div>
                </div>
                <button className="center-button" onClick={e => { e.stopPropagation(); handleVisitCenter(center); }}>
                  Visit Center →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Centers;
