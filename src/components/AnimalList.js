import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../constants';

const STATUS = {
  available: { pill: 'bg-teal-100 text-teal-700',   dot: '🟢', label: 'Available' },
  pending:   { pill: 'bg-cream-100 text-cream-700',  dot: '🟡', label: 'Pending'   },
  adopted:   { pill: 'bg-coral-100 text-coral-600',  dot: '🔴', label: 'Adopted'   },
};

const SPECIES = [
  { key: 'All', icon: '🐾' },
  { key: 'Dog', icon: '🐕' },
  { key: 'Cat', icon: '🐈' },
  { key: 'Rabbit', icon: '🐇' },
  { key: 'Bird', icon: '🦜' },
];

const PERSONALITY_BADGES = {
  'Couch Potato':     { icon: '🛋️', bg: 'bg-slate-50 text-slate-600 border-slate-200' },
  'Adventure Buddy':  { icon: '🏃', bg: 'bg-teal-50 text-teal-700 border-teal-200' },
  'Kid Friendly':     { icon: '👶', bg: 'bg-cream-50 text-cream-700 border-cream-200' },
  'Cuddle Bug':       { icon: '🤗', bg: 'bg-coral-50 text-coral-700 border-coral-200' },
  'Playful':          { icon: '🎾', bg: 'bg-teal-50 text-teal-700 border-teal-200' },
  'Independent':      { icon: '😎', bg: 'bg-slate-50 text-slate-600 border-slate-200' },
  'Social Butterfly': { icon: '🦋', bg: 'bg-teal-50 text-teal-600 border-teal-200' },
  'Gentle Giant':     { icon: '🐻', bg: 'bg-cream-50 text-cream-700 border-cream-200' },
};

function AnimalModal({ animal, onClose, onAdopt, userId }) {
  const [waitlist, setWaitlist] = useState({ count: 0, on_waitlist: false });
  const [sponsor, setSponsor]   = useState({ total: 0, count: 0, user_amount: 0, goal: 5000 });
  const [sponsorAmount, setSponsorAmount] = useState(500);
  const [sponsorMsg, setSponsorMsg]       = useState('');

  useEffect(() => {
    if (!animal) return;
    setSponsorMsg('');
    fetch(`${API_BASE_URL}/waitlist/${animal.id}${userId ? `?user_id=${userId}` : ''}`)
      .then(r => r.json()).then(setWaitlist).catch(() => {});
    fetch(`${API_BASE_URL}/sponsor/${animal.id}${userId ? `?user_id=${userId}` : ''}`)
      .then(r => r.json()).then(setSponsor).catch(() => {});
  }, [animal, userId]);

  const joinWaitlist = async () => {
    if (!userId) return;
    const res = await fetch(`${API_BASE_URL}/waitlist`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: parseInt(userId), animal_id: animal.id })
    });
    const data = await res.json();
    setWaitlist({ on_waitlist: true, count: typeof data.count === 'number' ? data.count : waitlist.count + 1 });
  };

  const handleSponsor = async () => {
    if (!userId) return;
    setSponsorMsg('');
    const res = await fetch(`${API_BASE_URL}/sponsor`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: parseInt(userId), animal_id: animal.id, amount: sponsorAmount })
    });
    const data = await res.json();
    if (res.ok) { setSponsor(s => ({ ...s, total: data.total_sponsored, user_amount: sponsorAmount })); setSponsorMsg('✅ Thank you for sponsoring!'); }
    else setSponsorMsg(`❌ ${data.detail}`);
  };

  if (!animal) return null;
  const s = STATUS[animal.status] || STATUS.available;

  const healthBadges = [
    { show: animal.vaccinated,     icon: '💉', label: 'Vaccinated',   bg: 'bg-teal-50 text-teal-700 border-teal-200' },
    { show: animal.neutered,       icon: '✂️', label: 'Neutered',     bg: 'bg-cream-50 text-cream-700 border-cream-200' },
    { show: animal.microchipped,   icon: '📡', label: 'Microchipped', bg: 'bg-slate-50 text-slate-700 border-slate-200' },
    { show: animal.good_with_kids, icon: '👶', label: 'Good w/ Kids', bg: 'bg-coral-50 text-coral-700 border-coral-200' },
    { show: animal.good_with_pets, icon: '🐾', label: 'Good w/ Pets', bg: 'bg-teal-50 text-teal-700 border-teal-200' },
  ].filter(b => b.show);

  const energyMap = {
    low:    { label: 'Low Energy',    icon: '😴', cls: 'bg-slate-50 text-slate-600 border-slate-200' },
    medium: { label: 'Medium Energy', icon: '🚶', cls: 'bg-cream-50 text-cream-700 border-cream-200' },
    high:   { label: 'High Energy',   icon: '🏃', cls: 'bg-coral-50 text-coral-600 border-coral-200' },
  };
  const energy = energyMap[animal.energy_level] || energyMap.medium;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}>
      <div className="bg-white rounded-3xl overflow-hidden max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto border border-teal-50 modal-enter"
        onClick={e => e.stopPropagation()}>
        <div className="relative h-64 flex-shrink-0 overflow-hidden">
          <img src={animal.image} alt={animal.name}
            className="w-full h-full object-cover"
            onError={e => e.target.src = 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&q=80'} />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/50 via-transparent to-transparent" />
          <button onClick={onClose}
            className="absolute top-4 right-4 bg-white/90 backdrop-blur-md rounded-full w-10 h-10 flex items-center justify-center text-gray-700 hover:bg-white font-bold border-0 cursor-pointer text-lg shadow-lg hover:scale-110 transition-all">
            ✕
          </button>
          <div className="absolute bottom-4 left-4 right-4">
            <h2 className="text-2xl font-extrabold text-white">{animal.name}</h2>
            <p className="text-white/75 text-sm">{animal.breed} · {animal.age} yr{animal.age !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${s.pill}`}>{s.dot} {s.label}</span>
            <span className="text-xs font-semibold bg-teal-50 text-teal-600 px-3 py-1 rounded-full border border-teal-200">{animal.species}</span>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${energy.cls}`}>{energy.icon} {energy.label}</span>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
            <div className="bg-gray-50 rounded-2xl p-3">
              <p className="text-gray-400 text-xs font-medium">Breed</p>
              <p className="font-semibold text-gray-700">{animal.breed}</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-3">
              <p className="text-gray-400 text-xs font-medium">Age</p>
              <p className="font-semibold text-gray-700">{animal.age} yr{animal.age !== 1 ? 's' : ''}</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-3 col-span-2">
              <p className="text-gray-400 text-xs font-medium">Rescue Center</p>
              <p className="font-semibold text-gray-700">📍 {animal.center?.name || 'Unknown'}</p>
            </div>
          </div>

          {healthBadges.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Health & Care</p>
              <div className="flex gap-2 flex-wrap">
                {healthBadges.map((b, i) => (
                  <span key={i} className={`flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full border ${b.bg}`}>
                    {b.icon} {b.label}
                  </span>
                ))}
              </div>
            </div>
          )}

          {animal.personality_badges?.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Personality</p>
              <div className="flex gap-2 flex-wrap">
                {animal.personality_badges.map((badge, i) => {
                  const b = PERSONALITY_BADGES[badge] || { icon: '✨', bg: 'bg-gray-50 text-gray-600 border-gray-200' };
                  return (
                    <span key={i} className={`flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full border ${b.bg}`}>
                      {b.icon} {badge}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          <p className="text-gray-500 text-sm leading-relaxed mb-4 italic">"{animal.description}"</p>

          {/* Sponsor */}
          <div className="mb-4 bg-gradient-to-r from-teal-50 to-teal-100/50 rounded-2xl p-4 border border-teal-100">
            <p className="text-xs font-bold text-teal-700 uppercase tracking-wide mb-1">💛 Sponsor This Animal</p>
            <p className="text-xs text-gray-500 mb-3">Can't adopt? Sponsor their food & medical costs monthly.</p>
            <div className="mb-2">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>${(sponsor.total / 100).toFixed(0)} raised</span>
                <span>Goal: ${(sponsor.goal / 100).toFixed(0)}/mo</span>
              </div>
              <div className="w-full bg-teal-100 rounded-full h-2">
                <div className="bg-gradient-to-r from-teal-500 to-teal-400 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min((sponsor.total / sponsor.goal) * 100, 100)}%` }} />
              </div>
              <p className="text-xs text-gray-400 mt-1">{sponsor.count} sponsor{sponsor.count !== 1 ? 's' : ''}</p>
            </div>
            {sponsor.user_amount > 0 && <p className="text-xs text-teal-600 font-semibold mb-2">✅ You sponsor ${(sponsor.user_amount / 100).toFixed(0)}/mo</p>}
            <div className="flex gap-2 flex-wrap mb-2">
              {[500, 1000, 2500, 5000].map(amt => (
                <button key={amt} onClick={() => setSponsorAmount(amt)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border-0 cursor-pointer transition-all
                    ${sponsorAmount === amt ? 'bg-teal-600 text-white shadow-md' : 'bg-white text-teal-600 border border-teal-200 hover:bg-teal-50'}`}>
                  ${amt / 100}/mo
                </button>
              ))}
            </div>
            {sponsorMsg && <p className="text-xs font-semibold mb-2">{sponsorMsg}</p>}
            <button onClick={handleSponsor} disabled={!userId}
              className="w-full py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-teal-500 to-teal-600 text-white border-0 cursor-pointer hover:shadow-lg transition-all disabled:opacity-50">
              💛 Sponsor ${(sponsorAmount / 100).toFixed(0)}/mo
            </button>
          </div>

          {animal.status === 'pending' && (
            <button onClick={joinWaitlist} disabled={waitlist.on_waitlist || !userId}
              className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all mb-2 border-0
                ${waitlist.on_waitlist ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-teal-500 to-teal-600 text-white hover:shadow-lg cursor-pointer'}`}>
              {waitlist.on_waitlist ? `✅ On Waitlist (${waitlist.count})` : `🔔 Join Waitlist${waitlist.count > 0 ? ` (${waitlist.count} waiting)` : ''}`}
            </button>
          )}
          <button
            disabled={animal.status === 'adopted'}
            onClick={() => onAdopt(animal.id)}
            className={`w-full py-3 rounded-xl font-bold text-base transition-all border-0
              ${animal.status === 'adopted'
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-coral-500 to-coral-600 text-white hover:shadow-lg hover:shadow-coral-200 hover:-translate-y-0.5 cursor-pointer'}`}>
            {animal.status === 'adopted' ? '🏠 Already Adopted' : animal.status === 'pending' ? '⏳ Apply Anyway' : '🐾 Adopt Me!'}
          </button>
        </div>
      </div>
    </div>
  );
}

function AnimalList({ onOpenQuiz }) {
  const [animals, setAnimals]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [species, setSpecies]           = useState('All');
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
      if (!res.ok) throw new Error();
      setAnimals(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [species, search, statusFilter, userId]);

  useEffect(() => { fetchAnimals(); }, [fetchAnimals]);

  const toggleFavorite = async (e, animalId) => {
    e.stopPropagation();
    if (!userId) { navigate('/login'); return; }
    const res = await fetch(`${API_BASE_URL}/favorites`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: parseInt(userId), animal_id: animalId })
    });
    if (!res.ok) return;
    const data = await res.json();
    setAnimals(prev => prev.map(a => a.id === animalId ? { ...a, is_favorited: data.favorited } : a));
    if (selectedAnimal?.id === animalId) setSelectedAnimal(prev => ({ ...prev, is_favorited: data.favorited }));
  };

  if (loading) return (
    <div className="page-bg min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-teal-400 to-teal-600 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-5 shadow-glow-teal animate-float">🐾</div>
        <p className="text-teal-700 font-semibold text-lg">Loading animals...</p>
      </div>
    </div>
  );

  return (
    <div className="page-bg min-h-screen">

      {/* Header */}
      <div className="relative bg-gradient-to-r from-teal-600 to-teal-500 px-6 py-16 text-center overflow-hidden">
        <div className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: 'radial-gradient(circle, white 1.5px, transparent 1.5px)', backgroundSize: '28px 28px' }} />
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-20 w-48 h-48 bg-coral-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <p className="section-label text-teal-200 mb-3">Find Your Match</p>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-3">Browse Animals</h1>
          <p className="text-teal-100 text-lg mb-6">{animals.length} amazing animals waiting for their forever homes</p>
          <button onClick={onOpenQuiz}
            className="bg-white text-teal-700 font-bold px-6 py-2.5 rounded-full text-sm hover:shadow-lg hover:scale-105 transition-all border-0 cursor-pointer">
            ✨ Not sure? Take the quiz!
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Search */}
        <div className="relative mb-6">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-teal-400 text-xl">🔍</span>
          <input type="text" placeholder="Search by name or breed..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-teal-100 focus:border-teal-400 focus:outline-none focus:ring-4 focus:ring-teal-100 bg-white text-gray-700 text-base shadow-sm transition-all placeholder:text-gray-400 font-medium" />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-10">
          {SPECIES.map(({ key, icon }) => (
            <button key={key} onClick={() => setSpecies(key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all border-0 cursor-pointer hover:scale-105
                ${species === key
                  ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg shadow-teal-200/50'
                  : 'bg-white text-gray-600 hover:text-teal-600 hover:bg-teal-50 shadow-sm border border-gray-100'}`}>
              <span className="text-lg">{icon}</span> {key}
            </button>
          ))}
          <div className="ml-auto flex gap-2">
            {['all', 'available', 'pending', 'adopted'].map(st => (
              <button key={st} onClick={() => setStatusFilter(st)}
                className={`px-4 py-2 rounded-full text-xs font-bold capitalize transition-all border-0 cursor-pointer hover:scale-105
                  ${statusFilter === st ? 'bg-teal-700 text-white shadow-md' : 'bg-white text-gray-500 hover:bg-gray-100 shadow-sm border border-gray-100'}`}>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {animals.map(animal => {
              const s = STATUS[animal.status] || STATUS.available;
              return (
                <div key={animal.id}
                  className="bg-white rounded-3xl overflow-hidden shadow-card border border-teal-50 hover:shadow-card-hover hover:-translate-y-2 transition-all duration-300 cursor-pointer group"
                  onClick={() => setSelectedAnimal(animal)}>
                  <div className="relative h-52 overflow-hidden bg-teal-50">
                    <img src={animal.image || 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&q=80'}
                      alt={animal.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={e => e.target.src = 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&q=80'} />
                    <div className={`absolute top-3 left-3 text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-md ${s.pill}`}>
                      {s.dot} {s.label}
                    </div>
                    <button onClick={e => toggleFavorite(e, animal.id)}
                      className="absolute top-3 right-3 bg-white/90 backdrop-blur-md rounded-full w-9 h-9 flex items-center justify-center text-lg shadow-lg hover:scale-125 transition-transform border-0 cursor-pointer hover:bg-white">
                      {animal.is_favorited ? '❤️' : '🤍'}
                    </button>
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-black text-gray-800 text-lg">{animal.name}</h3>
                      <span className="text-xs text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full font-semibold border border-teal-100">{animal.species}</span>
                    </div>
                    <p className="text-gray-500 text-sm mb-1 font-medium">{animal.breed} · {animal.age} yr{animal.age !== 1 ? 's' : ''}</p>
                    <p className="text-gray-400 text-xs mb-3">📍 {animal.center?.name || 'Unknown'}</p>
                    <div className="flex gap-1.5 flex-wrap mb-4">
                      {animal.vaccinated && <span className="text-xs bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full border border-teal-100 font-medium">💉 Vacc</span>}
                      {animal.neutered   && <span className="text-xs bg-cream-50 text-cream-700 px-2 py-0.5 rounded-full border border-cream-100 font-medium">✂️ Neutered</span>}
                      {animal.microchipped && <span className="text-xs bg-slate-50 text-slate-600 px-2 py-0.5 rounded-full border border-slate-100 font-medium">📡 Chipped</span>}
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); navigate(`/adoption?animalId=${animal.id}`); }}
                      disabled={animal.status === 'adopted'}
                      className={`w-full py-3 rounded-2xl text-sm font-bold transition-all border-0 hover:scale-105
                        ${animal.status === 'adopted'
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-teal-500 to-teal-600 text-white hover:shadow-lg hover:shadow-teal-200/50 cursor-pointer'}`}>
                      {animal.status === 'adopted' ? '🏠 Adopted' : animal.status === 'pending' ? '⏳ Apply' : '🐾 Adopt Me!'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <AnimalModal
        animal={selectedAnimal}
        onClose={() => setSelectedAnimal(null)}
        onAdopt={id => { setSelectedAnimal(null); navigate(`/adoption?animalId=${id}`); }}
        userId={userId}
      />
    </div>
  );
}

export default AnimalList;
