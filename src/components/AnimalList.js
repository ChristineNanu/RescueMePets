import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../constants';

const STATUS_COLORS = {
  available: { bg: '#f0fff4', color: '#276749', label: '🟢 Available' },
  pending:   { bg: '#fffbeb', color: '#92400e', label: '🟡 Pending' },
  adopted:   { bg: '#fff5f5', color: '#9b2c2c', label: '🔴 Adopted' },
};

const SPECIES = ['All', 'Dog', 'Cat', 'Rabbit', 'Bird'];

function AnimalList() {
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [species, setSpecies] = useState('All');
  const [statusFilter, setStatusFilter] = useState('all');
  const [favorites, setFavorites] = useState([]);
  const navigate = useNavigate();
  const userId = localStorage.getItem('user_id');

  const fetchAnimals = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (species !== 'All') params.append('species', species);
      if (search) params.append('search', search);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (userId) params.append('user_id', userId);
      const res = await fetch(`${API_BASE_URL}/animals?${params}`);
      const data = await res.json();
      setAnimals(data);
      setFavorites(data.filter(a => a.is_favorited).map(a => a.id));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [species, search, statusFilter, userId]);

  useEffect(() => { fetchAnimals(); }, [fetchAnimals]);

  const toggleFavorite = async (e, animalId) => {
    e.stopPropagation();
    if (!userId) { navigate('/login'); return; }
    const res = await fetch(`${API_BASE_URL}/favorites`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: parseInt(userId), animal_id: animalId })
    });
    const data = await res.json();
    setFavorites(prev => data.favorited ? [...prev, animalId] : prev.filter(id => id !== animalId));
    setAnimals(prev => prev.map(a => a.id === animalId ? { ...a, is_favorited: data.favorited } : a));
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f5f7fa, #c3cfe2)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🐾</div>
        <div style={{ fontSize: '1.2rem', color: '#667eea', fontWeight: 600 }}>Loading animals...</div>
      </div>
    </div>
  );

  return (
    <div className="app-container">
      {/* Header */}
      <div className="page-header">
        <h1>Find Your Perfect Companion</h1>
        <p>Browse {animals.length} amazing animals waiting for their forever homes</p>
      </div>

      {/* Search & Filters */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.5rem 2rem 0' }}>
        {/* Search bar */}
        <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
          <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', fontSize: '1.2rem' }}>🔍</span>
          <input
            type="text"
            placeholder="Search by name or breed..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', borderRadius: '12px', border: '2px solid #e2e8f0', fontSize: '1rem', outline: 'none', background: 'white', boxSizing: 'border-box', transition: 'border-color 0.3s' }}
            onFocus={e => e.target.style.borderColor = '#667eea'}
            onBlur={e => e.target.style.borderColor = '#e2e8f0'}
          />
        </div>

        {/* Species filter */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          {SPECIES.map(s => (
            <button key={s} onClick={() => setSpecies(s)} style={{
              padding: '0.5rem 1.25rem', borderRadius: '20px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem', transition: 'all 0.2s',
              background: species === s ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'white',
              color: species === s ? 'white' : '#4a5568',
              boxShadow: species === s ? '0 4px 15px rgba(102,126,234,0.4)' : '0 2px 8px rgba(0,0,0,0.08)'
            }}>
              {s === 'All' ? '🐾' : s === 'Dog' ? '🐕' : s === 'Cat' ? '🐈' : s === 'Rabbit' ? '🐇' : '🦜'} {s}
            </button>
          ))}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
            {['all', 'available', 'pending', 'adopted'].map(st => (
              <button key={st} onClick={() => setStatusFilter(st)} style={{
                padding: '0.5rem 1rem', borderRadius: '20px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.2s', textTransform: 'capitalize',
                background: statusFilter === st ? '#2d3748' : 'white',
                color: statusFilter === st ? 'white' : '#4a5568',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
              }}>
                {st === 'all' ? 'All Status' : st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Animals Grid */}
      <div className="animal-list">
        {animals.length === 0 ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem', color: '#718096' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔍</div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>No animals found</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        ) : animals.map(animal => (
          <div className="animal-card fade-in" key={animal.id} style={{ cursor: 'pointer' }}>
            {/* Status badge */}
            <div style={{
              position: 'absolute', top: '1rem', left: '1rem', zIndex: 2,
              padding: '0.3rem 0.75rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700,
              background: STATUS_COLORS[animal.status]?.bg,
              color: STATUS_COLORS[animal.status]?.color,
            }}>
              {STATUS_COLORS[animal.status]?.label}
            </div>

            {/* Favorite button */}
            <button onClick={(e) => toggleFavorite(e, animal.id)} style={{
              position: 'absolute', top: '1rem', right: '1rem', zIndex: 2,
              background: 'white', border: 'none', borderRadius: '50%', width: '36px', height: '36px',
              cursor: 'pointer', fontSize: '1.2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.2s'
            }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.2)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
              {animal.is_favorited ? '❤️' : '🤍'}
            </button>

            <img
              src={animal.image || 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&q=80'}
              alt={animal.name}
              className="animal-image"
              onError={e => e.target.src = 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&q=80'}
            />

            <div className="animal-card-content">
              <h3 className="animal-name">{animal.name}</h3>
              <div className="animal-details">
                <div className="animal-detail"><strong>Species:</strong> {animal.species}</div>
                <div className="animal-detail"><strong>Breed:</strong> {animal.breed}</div>
                <div className="animal-detail"><strong>Age:</strong> {animal.age} yr{animal.age !== 1 ? 's' : ''}</div>
                <div className="animal-detail"><strong>Center:</strong> {animal.center?.name || 'Unknown'}</div>
              </div>

              {/* Tags */}
              {animal.tags?.length > 0 && (
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', margin: '0.75rem 0' }}>
                  {animal.tags.map((tag, i) => (
                    <span key={i} style={{ padding: '0.2rem 0.6rem', background: 'rgba(102,126,234,0.1)', color: '#667eea', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600 }}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <p className="animal-description">{animal.description}</p>

              <button
                onClick={() => navigate(`/adoption?animalId=${animal.id}`)}
                disabled={animal.status === 'adopted'}
                style={{ opacity: animal.status === 'adopted' ? 0.5 : 1, cursor: animal.status === 'adopted' ? 'not-allowed' : 'pointer' }}
              >
                {animal.status === 'adopted' ? '🏠 Already Adopted' : animal.status === 'pending' ? '⏳ Apply Anyway' : '🐾 Adopt Me!'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AnimalList;
