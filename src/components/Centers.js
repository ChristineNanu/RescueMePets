import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../constants';

const CENTER_IMAGES = [
  'https://images.unsplash.com/photo-1601758124510-52d02ddb7cbd?w=800&q=80',
  'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&q=80',
  'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=80',
  'https://images.unsplash.com/photo-1544568100-847a948585b9?w=800&q=80',
];

const STATUS = {
  available: { pill: 'bg-emerald-100 text-emerald-700', dot: '🟢', label: 'Available' },
  pending:   { pill: 'bg-amber-100 text-amber-700',   dot: '🟡', label: 'Pending' },
  adopted:   { pill: 'bg-red-100 text-red-600',       dot: '🔴', label: 'Adopted' },
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 to-purple-50">
      <div className="text-center">
        <div className="text-5xl mb-4 animate-bounce">🏠</div>
        <p className="text-violet-600 font-semibold text-lg">Loading centers...</p>
      </div>
    </div>
  );

  // ── Center Detail View ──
  if (selectedCenter) {
    const available = centerAnimals.filter(a => a.status === 'available').length;
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-purple-50/20">
        {/* Hero */}
        <div className="relative h-72 overflow-hidden">
          <img src={CENTER_IMAGES[(selectedCenter.id - 1) % CENTER_IMAGES.length]}
            alt={selectedCenter.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <button onClick={() => { setSelectedCenter(null); setCenterAnimals([]); }}
            className="absolute top-5 left-5 bg-white/20 backdrop-blur-md border border-white/30 text-white px-4 py-2 rounded-xl font-semibold text-sm hover:bg-white/30 transition-all cursor-pointer">
            ← Back to Centers
          </button>
          <div className="absolute bottom-6 left-6 right-6">
            <h1 className="text-3xl font-extrabold text-white mb-2">{selectedCenter.name}</h1>
            <div className="flex flex-wrap gap-4 text-white/80 text-sm">
              <span>📍 {selectedCenter.location}</span>
              <span>📧 {selectedCenter.contact}</span>
              <span className="bg-white/20 px-3 py-0.5 rounded-full font-semibold">🐾 {available} available</span>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="bg-white border-b border-gray-100 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-4 grid grid-cols-4 gap-4 text-center">
            {[
              { label: 'Total', value: centerAnimals.length, color: 'text-violet-600' },
              { label: 'Available', value: centerAnimals.filter(a => a.status === 'available').length, color: 'text-emerald-600' },
              { label: 'Pending', value: centerAnimals.filter(a => a.status === 'pending').length, color: 'text-amber-600' },
              { label: 'Adopted', value: centerAnimals.filter(a => a.status === 'adopted').length, color: 'text-red-500' },
            ].map((s, i) => (
              <div key={i}>
                <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-400 font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Animals */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h2 className="text-xl font-extrabold text-gray-800 mb-6">Animals at {selectedCenter.name}</h2>
          {animalsLoading ? (
            <div className="text-center py-16 text-violet-600 font-semibold">Loading animals...</div>
          ) : centerAnimals.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
              <div className="text-5xl mb-3">🐾</div>
              <h3 className="font-bold text-gray-700 mb-1">No animals at this center yet</h3>
              <p className="text-gray-400 text-sm">Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {centerAnimals.map(animal => {
                const s = STATUS[animal.status] || STATUS.available;
                return (
                  <div key={animal.id}
                    className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group">
                    <div className="relative h-44 overflow-hidden">
                      <img src={animal.image} alt={animal.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={e => e.target.src = 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&q=80'} />
                      <div className={`absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full ${s.pill}`}>
                        {s.dot} {s.label}
                      </div>
                      <button onClick={e => toggleFavorite(e, animal.id)}
                        className="absolute top-3 right-3 bg-white/90 rounded-full w-8 h-8 flex items-center justify-center text-base shadow-sm hover:scale-110 transition-transform border-0 cursor-pointer">
                        {animal.is_favorited ? '❤️' : '🤍'}
                      </button>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-800 text-base mb-0.5">{animal.name}</h3>
                      <p className="text-gray-500 text-xs mb-3">{animal.breed} · {animal.age} yr{animal.age !== 1 ? 's' : ''}</p>
                      {animal.tags?.length > 0 && (
                        <div className="flex gap-1 flex-wrap mb-3">
                          {animal.tags.slice(0, 2).map((tag, i) => (
                            <span key={i} className="bg-violet-50 text-violet-600 text-xs font-semibold px-2 py-0.5 rounded-full">{tag}</span>
                          ))}
                        </div>
                      )}
                      <button onClick={() => navigate(`/adoption?animalId=${animal.id}`)}
                        disabled={animal.status === 'adopted'}
                        className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all border-0
                          ${animal.status === 'adopted'
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-violet-600 to-purple-700 text-white hover:shadow-md cursor-pointer'}`}>
                        {animal.status === 'adopted' ? '🏠 Adopted' : '🐾 Adopt Me!'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Centers List View ──
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-purple-50/20">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-700 px-6 py-12 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 text-8xl flex items-center justify-around pointer-events-none">
          <span>🏠</span><span>🐾</span><span>🏡</span><span>🐕</span>
        </div>
        <h1 className="text-4xl font-extrabold text-white mb-2 relative z-10">🏠 Rescue Centers</h1>
        <p className="text-violet-200 text-lg relative z-10">
          Visit our {centers.length} partner rescue centers and meet the animals
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {centers.map((center, idx) => (
            <div key={center.id}
              className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer group"
              onClick={() => handleVisitCenter(center)}>
              <div className="relative h-52 overflow-hidden">
                <img src={CENTER_IMAGES[idx % CENTER_IMAGES.length]} alt={center.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute top-4 right-4 bg-white/95 rounded-full px-3 py-1.5 text-xs font-bold text-violet-700 shadow-sm">
                  🐾 {center.animal_count} available
                </div>
                <div className="absolute bottom-4 left-4">
                  <h3 className="text-xl font-extrabold text-white">{center.name}</h3>
                </div>
              </div>
              <div className="p-5">
                <div className="flex flex-col gap-1.5 mb-4">
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <span>📍</span><span>{center.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <span>📧</span><span>{center.contact}</span>
                  </div>
                </div>
                <button
                  className="w-full py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-violet-600 to-purple-700 text-white hover:shadow-lg hover:shadow-violet-200 transition-all border-0 cursor-pointer"
                  onClick={e => { e.stopPropagation(); handleVisitCenter(center); }}>
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
