import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../constants';

function StatCard({ icon, value, label, sub, iconBg, valueColor }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
          <p className={`text-3xl font-extrabold ${valueColor}`}>{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
        <div className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center text-2xl`}>{icon}</div>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-8 mt-12">
      <div className="max-w-7xl mx-auto px-6 text-center text-sm">
        © 2026 RescueMePets · Built with ❤️ for animals everywhere
      </div>
    </footer>
  );
}

export default function Dashboard({ onOpenQuiz }) {
  const [stats, setStats]           = useState({ total_animals: 0, available: 0, adopted: 0, centers: 0 });
  const [recentAnimals, setRecentAnimals] = useState([]);
  const [applications, setApplications]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const navigate  = useNavigate();
  const username  = localStorage.getItem('username');
  const userId    = localStorage.getItem('user_id');

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE_URL}/stats`).then(r => r.json()),
      fetch(`${API_BASE_URL}/animals?user_id=${userId}`).then(r => r.json()),
      userId ? fetch(`${API_BASE_URL}/my-applications?user_id=${userId}`).then(r => r.json()) : Promise.resolve([]),
    ]).then(([s, animals, apps]) => {
      setStats(s);
      setRecentAnimals(animals.filter(a => a.status === 'available').slice(0, 4));
      setApplications(apps.slice(0, 3));
    }).catch(console.error).finally(() => setLoading(false));
  }, [userId]);

  const hour     = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const adoptionRate = stats.total_animals > 0 ? Math.round((stats.adopted / stats.total_animals) * 100) : 0;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-amber-50">
      <div className="text-center">
        <div className="text-5xl mb-4 animate-bounce">🐾</div>
        <p className="text-amber-600 font-semibold text-lg">Loading your dashboard...</p>
      </div>
    </div>
  );

  const statusMap = {
    pending:  { bg: 'bg-amber-100',   text: 'text-amber-700',   icon: '⏳' },
    approved: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: '✅' },
    rejected: { bg: 'bg-red-100',     text: 'text-red-600',     icon: '❌' },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Welcome Banner */}
        <div className="relative bg-gradient-to-r from-amber-500 to-amber-600 rounded-3xl p-8 mb-8 overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <span className="absolute top-4 right-8 text-8xl">🐾</span>
            <span className="absolute bottom-2 right-32 text-6xl">🐕</span>
            <span className="absolute top-6 right-52 text-5xl">🐈</span>
          </div>
          <div className="relative z-10">
            <p className="text-amber-100 text-sm font-medium mb-1">{greeting},</p>
            <h1 className="text-3xl font-extrabold text-white mb-2">Welcome back, {username}! 👋</h1>
            <p className="text-amber-100 text-base mb-6">
              {stats.available} animals are waiting for their forever home today.
            </p>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => navigate('/animals')}
                className="bg-white text-amber-700 font-bold px-5 py-2.5 rounded-xl hover:shadow-lg transition-all text-sm border-0 cursor-pointer">
                🐾 Browse Animals
              </button>
              <button onClick={() => navigate('/adoption')}
                className="bg-white/20 text-white font-bold px-5 py-2.5 rounded-xl hover:bg-white/30 transition-all text-sm border border-white/30 cursor-pointer">
                📋 Apply to Adopt
              </button>
              <button onClick={onOpenQuiz}
                className="bg-white/20 text-white font-bold px-5 py-2.5 rounded-xl hover:bg-white/30 transition-all text-sm border border-white/30 cursor-pointer">
                ✨ Find My Match
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon="🐾" value={stats.total_animals} label="Total Animals"   sub="In our network"          iconBg="bg-amber-50" valueColor="text-amber-600" />
          <StatCard icon="✅" value={stats.available}     label="Available Now"   sub="Ready to adopt"          iconBg="bg-amber-50" valueColor="text-amber-600" />
          <StatCard icon="🏠" value={stats.adopted}       label="Happy Adoptions" sub={`${adoptionRate}% rate`} iconBg="bg-amber-50" valueColor="text-amber-600" />
          <StatCard icon="🏥" value={stats.centers}       label="Rescue Centers"  sub="Partner locations"       iconBg="bg-amber-50" valueColor="text-amber-600" />
        </div>

        {/* Adoption progress */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-800">Overall Adoption Progress</h3>
            <span className="text-sm font-bold text-amber-600">{adoptionRate}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3">
            <div className="bg-gradient-to-r from-amber-400 to-amber-500 h-3 rounded-full transition-all duration-1000"
              style={{ width: `${adoptionRate}%` }} />
          </div>
          <p className="text-xs text-gray-400 mt-2">{stats.adopted} adopted out of {stats.total_animals} total animals</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">

          {/* Featured Animals */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-extrabold text-gray-800">🐾 Available Now</h2>
              <button onClick={() => navigate('/animals')}
                className="text-sm font-semibold text-amber-600 hover:text-amber-600 bg-transparent border-0 cursor-pointer">
                View all →
              </button>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {recentAnimals.map(animal => (
                <div key={animal.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer group"
                  onClick={() => navigate(`/adoption?animalId=${animal.id}`)}>
                  <div className="relative h-40 overflow-hidden">
                    <img src={animal.image} alt={animal.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={e => e.target.src = 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&q=80'} />
                    <div className="absolute top-2 left-2 bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Available
                    </div>
                    <div className="absolute top-2 right-2 bg-white/90 text-xs font-bold px-2.5 py-1 rounded-full text-gray-600">
                      {animal.species}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-800 text-base">{animal.name}</h3>
                    <p className="text-gray-500 text-xs mt-0.5">{animal.breed} · {animal.age} yr{animal.age !== 1 ? 's' : ''}</p>
                    <p className="text-gray-400 text-xs mt-1">📍 {animal.center?.name}</p>
                    {animal.tags?.length > 0 && (
                      <div className="flex gap-1 flex-wrap mt-2">
                        {animal.tags.slice(0, 2).map((tag, i) => (
                          <span key={i} className="bg-amber-50 text-amber-600 text-xs font-semibold px-2 py-0.5 rounded-full">{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-6">

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-extrabold text-gray-800 mb-4">⚡ Quick Actions</h2>
              <div className="flex flex-col gap-2">
                {[
                  { icon: '🐾', label: 'Browse Animals',  sub: 'Find your match',      to: '/animals',    hover: 'hover:bg-amber-50 hover:border-amber-200' },
                  { icon: '🏠', label: 'Explore Centers', sub: 'Visit rescue centers', to: '/centers',    hover: 'hover:bg-amber-50 hover:border-amber-200' },
                  { icon: '📋', label: 'Apply to Adopt',  sub: 'Start an application', to: '/adoption',   hover: 'hover:bg-amber-50 hover:border-amber-200' },
                  { icon: '❤️', label: 'My Favourites',   sub: 'Saved animals',        to: '/my-profile', hover: 'hover:bg-amber-50 hover:border-amber-200' },
                ].map(({ icon, label, sub, to, hover }) => (
                  <button key={to} onClick={() => navigate(to)}
                    className={`flex items-center gap-3 p-3 rounded-xl border border-gray-100 transition-all text-left cursor-pointer bg-transparent w-full ${hover}`}>
                    <span className="text-xl w-8 text-center">{icon}</span>
                    <div>
                      <p className="text-sm font-semibold text-gray-700">{label}</p>
                      <p className="text-xs text-gray-400">{sub}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* My Applications */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-extrabold text-gray-800">📋 My Applications</h2>
                <button onClick={() => navigate('/my-profile')}
                  className="text-xs font-semibold text-amber-600 bg-transparent border-0 cursor-pointer">
                  View all →
                </button>
              </div>
              {applications.length === 0 ? (
                <div className="text-center py-6">
                  <div className="text-4xl mb-2">📭</div>
                  <p className="text-gray-400 text-sm">No applications yet</p>
                  <button onClick={() => navigate('/animals')}
                    className="mt-3 text-xs font-semibold text-amber-600 bg-transparent border-0 cursor-pointer">
                    Browse animals →
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {applications.map(app => {
                    const s = statusMap[app.status] || statusMap.pending;
                    return (
                      <div key={app.id} className="flex items-center gap-3">
                        <img src={app.animal_image} alt={app.animal_name}
                          className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
                          onError={e => e.target.src = 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=100&q=80'} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-700 truncate">{app.animal_name}</p>
                          <p className="text-xs text-gray-400">{new Date(app.created_at).toLocaleDateString()}</p>
                        </div>
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${s.bg} ${s.text}`}>{s.icon}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Tip */}
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5">
              <div className="flex gap-3">
                <span className="text-2xl">💡</span>
                <div>
                  <h3 className="font-bold text-amber-800 text-sm mb-1">Adoption Tip</h3>
                  <p className="text-amber-700 text-xs leading-relaxed">
                    Visit the center to meet the animal before applying — it makes a huge difference for both of you! 🐾
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
