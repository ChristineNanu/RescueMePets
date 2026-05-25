import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../constants';

const STATUS_STYLES = {
  pending:  { bg: '#fffbeb', color: '#92400e', icon: '⏳', label: 'Pending Review' },
  approved: { bg: '#f0fff4', color: '#276749', icon: '✅', label: 'Approved!' },
  rejected: { bg: '#fff5f5', color: '#9b2c2c', icon: '❌', label: 'Not Approved' },
};

function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [tab, setTab] = useState('applications');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const userId = localStorage.getItem('user_id');

  useEffect(() => {
    if (!userId) { navigate('/login'); return; }
    Promise.all([
      fetch(`${API_BASE_URL}/my-applications?user_id=${userId}`).then(r => r.json()),
      fetch(`${API_BASE_URL}/favorites?user_id=${userId}`).then(r => r.json()),
    ]).then(([apps, favs]) => {
      setApplications(apps);
      setFavorites(favs);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, [userId, navigate]);

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f5f7fa, #c3cfe2)' }}>
      <div style={{ textAlign: 'center', fontSize: '1.2rem', color: '#667eea', fontWeight: 600 }}>⏳ Loading...</div>
    </div>
  );

  return (
    <div className="app-container">
      <div className="page-header">
        <h1>My Profile 🐾</h1>
        <p>Track your adoption applications and saved animals</p>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { key: 'applications', label: `📋 Applications (${applications.length})` },
            { key: 'favorites', label: `❤️ Saved Animals (${favorites.length})` },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              padding: '0.75rem 1.5rem', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '1rem', transition: 'all 0.2s',
              background: tab === t.key ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'white',
              color: tab === t.key ? 'white' : '#4a5568',
              boxShadow: tab === t.key ? '0 4px 15px rgba(102,126,234,0.4)' : '0 2px 8px rgba(0,0,0,0.08)'
            }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Applications Tab */}
        {tab === 'applications' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {applications.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem', background: 'white', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📋</div>
                <h3 style={{ color: '#2d3748', marginBottom: '0.5rem' }}>No applications yet</h3>
                <p style={{ color: '#718096', marginBottom: '1.5rem' }}>Browse animals and submit your first adoption request</p>
                <button onClick={() => navigate('/animals')} className="form-submit-btn" style={{ width: 'auto', padding: '0.75rem 2rem' }}>
                  Browse Animals
                </button>
              </div>
            ) : applications.map(app => (
              <div key={app.id} style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                <img src={app.animal_image} alt={app.animal_name} style={{ width: '80px', height: '80px', borderRadius: '12px', objectFit: 'cover', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ margin: 0, color: '#2d3748', fontSize: '1.2rem' }}>{app.animal_name}</h3>
                      <div style={{ color: '#718096', fontSize: '0.9rem', marginTop: '0.25rem' }}>{app.animal_species}</div>
                    </div>
                    <div style={{ padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700, background: STATUS_STYLES[app.status]?.bg, color: STATUS_STYLES[app.status]?.color }}>
                      {STATUS_STYLES[app.status]?.icon} {STATUS_STYLES[app.status]?.label}
                    </div>
                  </div>
                  <p style={{ color: '#718096', fontSize: '0.9rem', margin: '0.75rem 0 0.25rem', fontStyle: 'italic' }}>"{app.message}"</p>
                  <div style={{ color: '#a0aec0', fontSize: '0.8rem' }}>Applied {new Date(app.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Favorites Tab */}
        {tab === 'favorites' && (
          <div>
            {favorites.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem', background: 'white', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🤍</div>
                <h3 style={{ color: '#2d3748', marginBottom: '0.5rem' }}>No saved animals yet</h3>
                <p style={{ color: '#718096', marginBottom: '1.5rem' }}>Tap the heart on any animal to save them here</p>
                <button onClick={() => navigate('/animals')} className="form-submit-btn" style={{ width: 'auto', padding: '0.75rem 2rem' }}>
                  Browse Animals
                </button>
              </div>
            ) : (
              <div className="animal-list" style={{ padding: 0 }}>
                {favorites.map(animal => (
                  <div key={animal.id} className="animal-card fade-in">
                    <img src={animal.image} alt={animal.name} className="animal-image" />
                    <div className="animal-card-content">
                      <h3 className="animal-name">{animal.name}</h3>
                      <div className="animal-details">
                        <div className="animal-detail"><strong>Breed:</strong> {animal.breed}</div>
                        <div className="animal-detail"><strong>Age:</strong> {animal.age} yrs</div>
                      </div>
                      <button onClick={() => navigate(`/adoption?animalId=${animal.id}`)}>🐾 Adopt Me!</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyApplications;
