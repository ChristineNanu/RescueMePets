import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../constants';

const CENTER_IMAGES = [
  'https://images.unsplash.com/photo-1601758124510-52d02ddb7cbd?w=800&q=80',
  'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&q=80',
  'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=80',
  'https://images.unsplash.com/photo-1544568100-847a948585b9?w=800&q=80',
];

const CENTER_ACCENTS = [
  { from: 'from-amber-500', to: 'to-amber-600', light: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100' },
  { from: 'from-amber-500', to: 'to-amber-600', light: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100' },
  { from: 'from-amber-500', to: 'to-amber-600', light: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100' },
  { from: 'from-amber-500', to: 'to-amber-600', light: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100' },
];

const STATUS = {
  available: { pill: 'bg-emerald-100 text-emerald-700', dot: '🟢', label: 'Available' },
  pending:   { pill: 'bg-amber-100 text-amber-700',     dot: '🟡', label: 'Pending'   },
  adopted:   { pill: 'bg-red-100 text-red-600',         dot: '🔴', label: 'Adopted'   },
};

function Centers() {
  const [centers, setCenters]           = useState([]);
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [centerAnimals, setCenterAnimals]   = useState([]);
  const [loading, setLoading]           = useState(true);
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
      body: JSON.stringify({ user_id: parseInt(userId), animal_id: animalId }),
    });
    const data = await res.json();
    setCenterAnimals(prev => prev.map(a => a.id === animalId ? { ...a, is_favorited: data.favorited } : a));
  };

  /* ── Loading ── */
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-stone-50">
      <div className="text-center">
        <div className="text-5xl mb-4 animate-bounce">🏠</div>
        <p className="text-amber-600 font-semibold text-lg">Loading centers...</p>
      </div>
    </div>
  );

  /* ── Center Detail View ── */
  if (selectedCenter) {
    const idx     = (selectedCenter.id - 1) % CENTER_IMAGES.length;
    const accent  = CENTER_ACCENTS[idx];
    const stats   = [
      { label: 'Total Animals', value: centerAnimals.length,                                        color: 'text-amber-600', bg: 'bg-amber-50',  icon: '🐾' },
      { label: 'Available',     value: centerAnimals.filter(a => a.status === 'available').length,  color: 'text-amber-600', bg: 'bg-amber-50', icon: '✅' },
      { label: 'Pending',       value: centerAnimals.filter(a => a.status === 'pending').length,    color: 'text-amber-600', bg: 'bg-amber-50',   icon: '⏳' },
      { label: 'Adopted',       value: centerAnimals.filter(a => a.status === 'adopted').length,    color: 'text-amber-600', bg: 'bg-amber-50',     icon: '🏠' },
    ];

    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 to-amber-50/20">

        {/* Hero */}
        <div className="relative h-80 overflow-hidden">
          <img src={CENTER_IMAGES[idx]} alt={selectedCenter.name}
            className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10" />

          {/* Back button */}
          <button onClick={() => { setSelectedCenter(null); setCenterAnimals([]); }}
            className="absolute top-5 left-5 flex items-center gap-2 bg-white/15 backdrop-blur-md border border-white/25 text-white px-4 py-2 rounded-full font-semibold text-sm hover:bg-white/25 transition-all cursor-pointer">
            ← Back
          </button>

          {/* Center info overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-end justify-between flex-wrap gap-4">
                <div>
                  {/* Accent badge */}
                  <span className={`inline-block bg-gradient-to-r ${accent.from} ${accent.to} text-white text-xs font-bold px-3 py-1 rounded-full mb-3`}>
                    🏥 Rescue Center
                  </span>
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3 drop-shadow-lg">
                    {selectedCenter.name}
                  </h1>
                  <div className="flex flex-wrap gap-3">
                    <span className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm text-white text-sm px-3 py-1.5 rounded-full border border-white/20">
                      📍 {selectedCenter.location}
                    </span>
                    <span className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm text-white text-sm px-3 py-1.5 rounded-full border border-white/20">
                      📧 {selectedCenter.contact}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/adoption')}
                  className={`bg-gradient-to-r ${accent.from} ${accent.to} text-white font-bold px-6 py-3 rounded-2xl text-sm hover:shadow-xl transition-all border-0 cursor-pointer flex-shrink-0`}>
                  📋 Apply to Adopt
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="bg-white border-b border-gray-100 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-4 divide-x divide-gray-100">
              {stats.map((s, i) => (
                <div key={i} className="py-5 px-4 text-center">
                  <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center text-xl mx-auto mb-2`}>
                    {s.icon}
                  </div>
                  <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-gray-400 font-medium mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Animals section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-extrabold text-gray-800">Animals at this center</h2>
              <p className="text-gray-400 text-sm mt-0.5">{centerAnimals.filter(a => a.status === 'available').length} available for adoption</p>
            </div>
          </div>

          {animalsLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="text-4xl mb-3 animate-bounce">🐾</div>
                <p className="text-amber-600 font-semibold">Loading animals...</p>
              </div>
            </div>
          ) : centerAnimals.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
              <div className="text-6xl mb-4">🐾</div>
              <h3 className="font-bold text-gray-700 text-lg mb-1">No animals here yet</h3>
              <p className="text-gray-400 text-sm">Check back soon — new animals are added regularly!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {centerAnimals.map(animal => {
                const s = STATUS[animal.status] || STATUS.available;
                return (
                  <div key={animal.id}
                    className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group">
                    <div className="relative h-48 overflow-hidden">
                      <img src={animal.image} alt={animal.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={e => e.target.src = 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&q=80'} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className={`absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full ${s.pill}`}>
                        {s.dot} {s.label}
                      </div>
                      <button onClick={e => toggleFavorite(e, animal.id)}
                        className="absolute top-3 right-3 bg-white/90 rounded-full w-8 h-8 flex items-center justify-center text-base shadow-sm hover:scale-110 transition-transform border-0 cursor-pointer">
                        {animal.is_favorited ? '❤️' : '🤍'}
                      </button>
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="font-bold text-gray-800 text-base">{animal.name}</h3>
                        <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">{animal.species}</span>
                      </div>
                      <p className="text-gray-400 text-xs mb-3">{animal.breed} · {animal.age} yr{animal.age !== 1 ? 's' : ''}</p>
                      {animal.tags?.length > 0 && (
                        <div className="flex gap-1 flex-wrap mb-3">
                          {animal.tags.slice(0, 2).map((tag, i) => (
                            <span key={i} className="bg-amber-50 text-amber-600 text-xs font-semibold px-2 py-0.5 rounded-full">{tag}</span>
                          ))}
                        </div>
                      )}
                      <button onClick={() => navigate(`/adoption?animalId=${animal.id}`)}
                        disabled={animal.status === 'adopted'}
                        className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all border-0
                          ${animal.status === 'adopted'
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : `bg-gradient-to-r ${accent.from} ${accent.to} text-white hover:shadow-md cursor-pointer`}`}>
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

  /* ── Centers List View ── */
  const totalAvailable = centers.reduce((sum, c) => sum + c.animal_count, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-amber-50/20">

      {/* Header */}
      <div className="relative bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-16 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-10 -right-10 w-64 h-64 bg-white/5 rounded-full" />
          <div className="absolute top-10 right-32 w-32 h-32 bg-white/5 rounded-full" />
          <div className="absolute -bottom-8 left-20 w-48 h-48 bg-white/5 rounded-full" />
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <p className="text-amber-200 text-sm font-semibold mb-2 uppercase tracking-widest">Our Network</p>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-3">Rescue Centers</h1>
              <p className="text-amber-100 text-lg max-w-lg">
                {centers.length} partner centers across the region, with {totalAvailable} animals ready to find their forever home.
              </p>
            </div>
            {/* Summary pills */}
            <div className="flex gap-3 flex-wrap sm:flex-col">
              <div className="bg-white/15 backdrop-blur-sm border border-white/20 rounded-2xl px-5 py-3 text-center">
                <p className="text-3xl font-extrabold text-white">{centers.length}</p>
                <p className="text-amber-100 text-xs font-medium">Centers</p>
              </div>
              <div className="bg-white/15 backdrop-blur-sm border border-white/20 rounded-2xl px-5 py-3 text-center">
                <p className="text-3xl font-extrabold text-white">{totalAvailable}</p>
                <p className="text-amber-100 text-xs font-medium">Available</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Centers grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {centers.map((center, idx) => {
            const accent = CENTER_ACCENTS[idx % CENTER_ACCENTS.length];
            return (
              <div key={center.id}
                className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer group"
                onClick={() => handleVisitCenter(center)}>

                {/* Image */}
                <div className="relative h-56 overflow-hidden">
                  <img src={CENTER_IMAGES[idx % CENTER_IMAGES.length]} alt={center.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  {/* Top badges */}
                  <div className="absolute top-4 left-4">
                    <span className={`bg-gradient-to-r ${accent.from} ${accent.to} text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg`}>
                      🏥 Rescue Center
                    </span>
                  </div>
                  <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1.5 shadow-md">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-xs font-bold text-gray-700">{center.animal_count} available</span>
                  </div>

                  {/* Center name on image */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-2xl font-extrabold text-white drop-shadow-lg">{center.name}</h3>
                  </div>
                </div>

                {/* Card body */}
                <div className="p-5">
                  {/* Info row */}
                  <div className="flex flex-col gap-2 mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 ${accent.light} ${accent.text} rounded-lg flex items-center justify-center text-sm flex-shrink-0`}>
                        📍
                      </div>
                      <span className="text-gray-600 text-sm">{center.location}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 ${accent.light} ${accent.text} rounded-lg flex items-center justify-center text-sm flex-shrink-0`}>
                        📧
                      </div>
                      <span className="text-gray-600 text-sm">{center.contact}</span>
                    </div>
                  </div>

                  {/* Mini stat bar */}
                  <div className={`${accent.light} ${accent.border} border rounded-2xl px-4 py-3 mb-4 flex items-center justify-between`}>
                    <span className={`text-sm font-semibold ${accent.text}`}>
                      🐾 {center.animal_count} animals available for adoption
                    </span>
                    <span className={`text-xs font-bold ${accent.text} opacity-60`}>→</span>
                  </div>

                  {/* CTA */}
                  <button
                    className={`w-full py-3 rounded-2xl font-bold text-sm bg-gradient-to-r ${accent.from} ${accent.to} text-white hover:shadow-lg transition-all border-0 cursor-pointer group-hover:shadow-xl`}
                    onClick={e => { e.stopPropagation(); handleVisitCenter(center); }}>
                    Visit Center →
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-10 bg-gradient-to-r from-amber-500 to-amber-600 rounded-3xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-2 right-8 text-7xl">🐾</div>
            <div className="absolute bottom-2 right-32 text-5xl">🐕</div>
          </div>
          <div className="relative z-10">
            <h3 className="text-2xl font-extrabold text-white mb-1">Can't decide which center?</h3>
            <p className="text-amber-100 text-sm">Browse all available animals across every center in one place.</p>
          </div>
          <button onClick={() => navigate('/animals')}
            className="relative z-10 bg-white text-amber-700 font-bold px-7 py-3 rounded-2xl text-sm hover:shadow-xl transition-all border-0 cursor-pointer flex-shrink-0">
            🐾 Browse All Animals
          </button>
        </div>
      </div>
    </div>
  );
}

export default Centers;
