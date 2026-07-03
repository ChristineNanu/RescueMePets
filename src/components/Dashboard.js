import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../constants';

function StatCard({ icon, value, label, sub, iconBg, valueColor }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">{label}</p>
          <p className={`text-4xl font-black ${valueColor}`}>{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-2 font-medium">{sub}</p>}
        </div>
        <div className={`w-14 h-14 ${iconBg} rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform`}>{icon}</div>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-600 text-white py-12 mt-16 border-t border-amber-500/30 shadow-2xl shadow-amber-600/20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-lg font-black mb-1">🐾 RescueMePets</p>
            <p className="text-amber-100 text-sm font-medium">Giving pets a second chance, one adoption at a time</p>
          </div>
          <div className="text-center text-sm text-amber-50">
            © 2026 RescueMePets · Built with <span className="text-red-300 animate-pulse">❤️</span> for animals everywhere
          </div>
          <div className="flex gap-5 text-sm">
            <button onClick={() => {}} className="text-amber-100 hover:text-white transition-colors bg-transparent border-0 cursor-pointer font-medium">About</button>
            <button onClick={() => {}} className="text-amber-100 hover:text-white transition-colors bg-transparent border-0 cursor-pointer font-medium">Privacy</button>
            <button onClick={() => {}} className="text-amber-100 hover:text-white transition-colors bg-transparent border-0 cursor-pointer font-medium">Contact</button>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function Dashboard({ onOpenQuiz }) {
  const [stats, setStats]           = useState({ total_animals: 0, available: 0, adopted: 0, centers: 0 });
  const [recentAnimals, setRecentAnimals] = useState([]);
  const [applications, setApplications]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const navigate  = useNavigate();
  const username  = localStorage.getItem('username');
  const userId    = localStorage.getItem('user_id');

  useEffect(() => {
    setError('');
    Promise.all([
      fetch(`${API_BASE_URL}/stats`).then(r => { if (!r.ok) throw new Error('Failed to load stats'); return r.json(); }),
      fetch(`${API_BASE_URL}/animals?user_id=${userId}`).then(r => { if (!r.ok) throw new Error('Failed to load animals'); return r.json(); }),
      userId ? fetch(`${API_BASE_URL}/my-applications?user_id=${userId}`).then(r => { if (!r.ok) throw new Error('Failed to load applications'); return r.json(); }) : Promise.resolve([]),
      ]).then(([s, animals, apps]) => {
      setStats(s);
      setRecentAnimals(animals.filter(a => a.status === 'available').slice(0, 4));
      // keep the full applications list so counts and slices are accurate
      setApplications(Array.isArray(apps) ? apps : []);
    }).catch(err => setError(err.message || 'Failed to load dashboard')).finally(() => setLoading(false));
  }, [userId]);

  const hour     = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const adoptionRate = stats.total_animals > 0 ? Math.round((stats.adopted / stats.total_animals) * 100) : 0;

  // If user is logged in, prefer showing their approved adoptions count in the "Happy Adoptions" stat
  const userApprovedCount = applications.filter(a => a.status === 'approved').length;
  const happyAdoptionsValue = userId ? userApprovedCount : stats.adopted;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-amber-50">
      <div className="text-center">
        <div className="text-5xl mb-4 animate-bounce">🐾</div>
        <p className="text-amber-600 font-semibold text-lg">Loading your dashboard...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-red-50">
      <div className="text-center">
        <div className="text-5xl mb-4">⚠️</div>
        <p className="text-red-600 font-semibold text-lg mb-4">{error}</p>
        <button onClick={() => window.location.reload()}
          className="px-6 py-2 rounded-xl bg-red-600 text-white font-bold cursor-pointer hover:bg-red-700 border-0">
          Try Again
        </button>
      </div>
    </div>
  );

  const statusMap = {
    pending:  { bg: 'bg-amber-100',   text: 'text-amber-700',   icon: '⏳' },
    approved: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: '✅' },
    rejected: { bg: 'bg-red-100',     text: 'text-red-600',     icon: '❌' },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-amber-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Welcome Banner */}
        <div className="relative bg-gradient-to-br from-amber-500 via-amber-400 to-orange-500 rounded-3xl p-8 mb-8 overflow-hidden shadow-2xl shadow-amber-200/50">
          <div className="absolute inset-0 opacity-15 pointer-events-none">
            <span className="absolute top-4 right-8 text-8xl animate-bounce">🐾</span>
            <span className="absolute bottom-2 right-32 text-6xl animate-pulse">🐕</span>
            <span className="absolute top-6 right-52 text-5xl">🐈</span>
          </div>
          <div className="relative z-10">
            <p className="text-amber-100 text-sm font-semibold mb-1 tracking-wide uppercase">{greeting},</p>
            <h1 className="text-4xl sm:text-5xl font-black text-white mb-3">Welcome back, {username}! 👋</h1>
            <p className="text-amber-50 text-base mb-6 font-medium">
              🎉 {stats.available} adorable friends are waiting for their forever home today!
            </p>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => navigate('/animals')}
                className="bg-white text-amber-700 font-bold px-6 py-3 rounded-xl hover:shadow-xl hover:-translate-y-1 transition-all text-sm border-0 cursor-pointer hover:scale-105 duration-300">
                🐾 Browse Animals
              </button>
              <button onClick={() => navigate('/adoption')}
                className="bg-white/25 backdrop-blur-md text-white font-bold px-6 py-3 rounded-xl hover:bg-white/40 transition-all text-sm border border-white/40 cursor-pointer hover:scale-105 duration-300">
                📋 Apply to Adopt
              </button>
              <button onClick={onOpenQuiz}
                className="bg-white/25 backdrop-blur-md text-white font-bold px-6 py-3 rounded-xl hover:bg-white/40 transition-all text-sm border border-white/40 cursor-pointer hover:scale-105 duration-300">
                ✨ Find My Match
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          <StatCard icon="🐾" value={stats.total_animals} label="Total Animals"   sub="In our network"          iconBg="bg-gradient-to-br from-amber-100 to-orange-100" valueColor="text-orange-600" />
          <StatCard icon="✅" value={stats.available}     label="Available Now"   sub="Ready to adopt"          iconBg="bg-gradient-to-br from-emerald-100 to-green-100" valueColor="text-emerald-600" />
          <StatCard icon="🏠" value={happyAdoptionsValue}       label="Happy Adoptions" sub={`${adoptionRate}% rate`} iconBg="bg-gradient-to-br from-rose-100 to-pink-100" valueColor="text-rose-600" />
          <StatCard icon="🏥" value={stats.centers}       label="Rescue Centers"  sub="Partner locations"       iconBg="bg-gradient-to-br from-purple-100 to-indigo-100" valueColor="text-purple-600" />
        </div>

        {/* Adoption progress */}
        <div className="bg-white rounded-2xl p-7 shadow-md border border-gray-100 mb-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-gray-800 text-lg mb-1">📊 Adoption Success Rate</h3>
              <p className="text-xs text-gray-400">Based on total animals in our network</p>
            </div>
            <span className="text-3xl font-black text-amber-600">{adoptionRate}%</span>
          </div>
          <div className="w-full bg-gradient-to-r from-gray-100 to-gray-50 rounded-full h-4 overflow-hidden shadow-inner">
            <div className="bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 h-4 rounded-full transition-all duration-1000 shadow-lg shadow-amber-300/50"
              style={{ width: `${adoptionRate}%` }} />
          </div>
          <p className="text-xs text-gray-400 mt-3">🎉 {stats.adopted} adopted out of {stats.total_animals} total animals</p>
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
                  {applications.slice(0,3).map(app => {
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
