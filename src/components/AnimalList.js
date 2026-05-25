import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../constants';

const STATUS = {
  available: { pill: 'bg-emerald-100 text-emerald-700', dot: '🟢', label: 'Available' },
  pending:   { pill: 'bg-amber-100 text-amber-700',   dot: '🟡', label: 'Pending' },
  adopted:   { pill: 'bg-red-100 text-red-600',       dot: '🔴', label: 'Adopted' },
};

const SPECIES = [
  { key: 'All', icon: '🐾' },
  { key: 'Dog', icon: '🐕' },
  { key: 'Cat', icon: '🐈' },
  { key: 'Rabbit', icon: '🐇' },
  { key: 'Bird', icon: '🦜' },
];

function AnimalModal({ animal, onClose, onAdopt }) {
  if (!animal) return null;
  const s = STATUS[animal.status] || STATUS.available;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}>
      <div className="bg-white rounded-3xl overflow-hidden max-w-lg w-full shadow-2xl"
        onClick={e => e.stopPropagation()}>
        <div className="relative h-64">
          <img src={animal.image} alt={animal.name}
            className="w-full h-full object-cover"
            onError={e => e.target.src = 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&q=80'} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <button onClick={onClose}
            className="absolute top-4 right-4 bg-white/90 rounded-full w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-white font-bold border-0 cursor-pointer text-lg">
            ✕
          </button>
          <div className="absolute bottom-4 left-4 right-4">
            <h2 className="text-2xl font-extrabold text-white">{animal.name}</h2>
            <p className="text-white/80 text-sm">{animal.breed} · {animal.age} yr{animal.age !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${s.pill}`}>{s.dot} {s.label}</span>
            <span className="text-xs font-semibold bg-amber-50 text-amber-600 px-3 py-1 rounded-full">{animal.species}</span>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-gray-400 text-xs font-medium">Breed</p>
              <p className="font-semibold text-gray-700">{animal.breed}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-gray-400 text-xs font-medium">Age</p>
              <p className="font-semibold text-gray-700">{animal.age} yr{animal.age !== 1 ? 's' : ''}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 col-span-2">
              <p className="text-gray-400 text-xs font-medium">Rescue Center</p>
              <p className="font-semibold text-gray-700">📍 {animal.center?.name || 'Unknown'}</p>
            </div>
          </div>
          {animal.tags?.length > 0 && (
            <div className="flex gap-1.5 flex-wrap mb-4">
              {animal.tags.map((tag, i) => (
                <span key={i} className="bg-amber-50 text-amber-600 text-xs font-semibold px-2.5 py-1 rounded-full">{tag}</span>
              ))}
            </div>
          )}
          <p className="text-gray-500 text-sm leading-relaxed mb-5 italic">"{animal.description}"</p>
          <button
            onClick={() => onAdopt(animal.id)}
            disabled={animal.status === 'adopted'}
            className={`w-full py-3 rounded-xl font-bold text-base transition-all
              ${animal.status === 'adopted'
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:shadow-lg hover:shadow-amber-200 hover:-translate-y-0.5 cursor-pointer'}`}>
            {animal.status === 'adopted' ? '🏠 Already Adopted' : animal.status === 'pending' ? '⏳ Apply Anyway' : '🐾 Adopt Me!'}
          </button>
        </div>
      </div>
    </div>
  );
}

function AnimalList() {
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [species, setSpecies] = useState('All');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedAnimal, setSelectedAnimal] = useState(null);
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
      setAnimals(await res.json());
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
    setAnimals(prev => prev.map(a => a.id === animalId ? { ...a, is_favorited: data.favorited } : a));
    if (selectedAnimal?.id === animalId) setSelectedAnimal(prev => ({ ...prev, is_favorited: data.favorited }));
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-stone-50">
      <div className="text-center">
        <div className="text-5xl mb-4 animate-bounce">🐾</div>
        <p className="text-amber-600 font-semibold text-lg">Loading animals...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-amber-50/20">

      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-12 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 text-8xl flex items-center justify-around pointer-events-none">
          <span>🐕</span><span>🐈</span><span>🐇</span><span>🦜</span>
        </div>
        <h1 className="text-4xl font-extrabold text-white mb-2 relative z-10">Find Your Perfect Companion</h1>
        <p className="text-amber-100 text-lg relative z-10">
          {animals.length} amazing animals waiting for their forever homes
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Search */}
        <div className="relative mb-5">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">🔍</span>
          <input
            type="text"
            placeholder="Search by name or breed..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 border-gray-200 focus:border-amber-400 focus:outline-none bg-white text-gray-700 text-base shadow-sm transition-colors"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 mb-8">
          {SPECIES.map(({ key, icon }) => (
            <button key={key} onClick={() => setSpecies(key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all border-0 cursor-pointer
                ${species === key
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md shadow-amber-200'
                  : 'bg-white text-gray-600 hover:text-amber-600 hover:bg-amber-50 shadow-sm'}`}>
              {icon} {key}
            </button>
          ))}
          <div className="ml-auto flex gap-2">
            {['all', 'available', 'pending', 'adopted'].map(st => (
              <button key={st} onClick={() => setStatusFilter(st)}
                className={`px-3 py-2 rounded-full text-xs font-bold capitalize transition-all border-0 cursor-pointer
                  ${statusFilter === st ? 'bg-gray-800 text-white' : 'bg-white text-gray-500 hover:bg-gray-100 shadow-sm'}`}>
                {st === 'all' ? 'All Status' : st}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {animals.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">No animals found</h3>
            <p className="text-gray-400">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {animals.map(animal => {
              const s = STATUS[animal.status] || STATUS.available;
              return (
                <div key={animal.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer group"
                  onClick={() => setSelectedAnimal(animal)}>
                  <div className="relative h-48 overflow-hidden">
                    <img src={animal.image || 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&q=80'}
                      alt={animal.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={e => e.target.src = 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&q=80'} />
                    {/* Status badge */}
                    <div className={`absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full ${s.pill}`}>
                      {s.dot} {s.label}
                    </div>
                    {/* Favorite */}
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
                    <p className="text-gray-500 text-xs mb-1">{animal.breed} · {animal.age} yr{animal.age !== 1 ? 's' : ''}</p>
                    <p className="text-gray-400 text-xs mb-3">📍 {animal.center?.name || 'Unknown'}</p>
                    {animal.tags?.length > 0 && (
                      <div className="flex gap-1 flex-wrap mb-3">
                        {animal.tags.slice(0, 3).map((tag, i) => (
                          <span key={i} className="bg-amber-50 text-amber-600 text-xs font-semibold px-2 py-0.5 rounded-full">{tag}</span>
                        ))}
                      </div>
                    )}
                    <button
                      onClick={e => { e.stopPropagation(); navigate(`/adoption?animalId=${animal.id}`); }}
                      disabled={animal.status === 'adopted'}
                      className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all border-0
                        ${animal.status === 'adopted'
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:shadow-md hover:shadow-amber-200 cursor-pointer'}`}>
                      {animal.status === 'adopted' ? '🏠 Adopted' : animal.status === 'pending' ? '⏳ Apply' : '🐾 Adopt Me!'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimalModal
        animal={selectedAnimal}
        onClose={() => setSelectedAnimal(null)}
        onAdopt={id => { setSelectedAnimal(null); navigate(`/adoption?animalId=${id}`); }}
      />
    </div>
  );
}

export default AnimalList;
