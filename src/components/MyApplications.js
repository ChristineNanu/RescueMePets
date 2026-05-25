import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../constants';

const STATUS_MAP = {
  pending:  { bg: 'bg-amber-100',   text: 'text-amber-700',   icon: '⏳', label: 'Pending Review' },
  approved: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: '✅', label: 'Approved!' },
  rejected: { bg: 'bg-red-100',     text: 'text-red-600',     icon: '❌', label: 'Not Approved' },
};

function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [favorites, setFavorites]       = useState([]);
  const [tab, setTab]                   = useState('applications');
  const [loading, setLoading]           = useState(true);
  const navigate  = useNavigate();
  const userId    = localStorage.getItem('user_id');
  const username  = localStorage.getItem('username');

  const handleLogout = () => {
    localStorage.removeItem('user_id');
    localStorage.removeItem('username');
    navigate('/');
    window.location.reload();
  };

  const loadData = useCallback(() => {
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

  useEffect(() => { loadData(); }, [loadData]);

  // Mark all as read when this page is visited
  useEffect(() => {
    if (!userId) return;
    fetch(`${API_BASE_URL}/notifications/mark-read?user_id=${userId}`, { method: 'POST' })
      .catch(() => {});
  }, [userId]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-amber-50">
      <div className="text-center">
        <div className="text-5xl mb-4 animate-bounce">⏳</div>
        <p className="text-amber-600 font-semibold text-lg">Loading your profile...</p>
      </div>
    </div>
  );

  const pending  = applications.filter(a => a.status === 'pending').length;
  const unread   = applications.filter(a => a.read === false);
  const approved = applications.filter(a => a.status === 'approved').length;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Profile Header */}
      <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-12 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 text-8xl flex items-center justify-around pointer-events-none">
          <span>🐾</span><span>❤️</span><span>🏠</span>
        </div>
        <div className="relative z-10">
          <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/40 flex items-center justify-center text-3xl font-extrabold text-white mx-auto mb-3">
            {username?.[0]?.toUpperCase() || 'U'}
          </div>
          <h1 className="text-3xl font-extrabold text-white mb-1">{username}</h1>
          <p className="text-amber-100 text-base">Pet Adoption Profile</p>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-3xl mx-auto px-4 -mt-6 mb-6 relative z-10">
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Applications', value: applications.length, icon: '📋' },
            { label: 'Approved',     value: approved,            icon: '✅' },
            { label: 'Saved',        value: favorites.length,    icon: '❤️' },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 text-center shadow-md border border-gray-100">
              <div className="text-2xl mb-1">{s.icon}</div>
              <p className="text-2xl font-extrabold text-amber-600">{s.value}</p>
              <p className="text-xs text-gray-400 font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 pb-6">

        {/* Unread notification banner */}
        {unread.length > 0 && (
          <div className="mb-5 bg-white border-2 border-amber-300 rounded-2xl p-4 flex items-start gap-3 shadow-sm">
            <span className="text-2xl flex-shrink-0">🔔</span>
            <div>
              <p className="font-bold text-gray-800 text-sm mb-1">
                You have {unread.length} new update{unread.length > 1 ? 's' : ''} on your applications!
              </p>
              <div className="flex flex-col gap-1">
                {unread.map(app => {
                  const s = STATUS_MAP[app.status] || STATUS_MAP.pending;
                  return (
                    <p key={app.id} className="text-xs text-gray-500">
                      <span className="font-semibold text-gray-700">{app.animal_name}</span>
                      {' '}— application {' '}
                      <span className={`font-bold ${app.status === 'approved' ? 'text-emerald-600' : 'text-red-500'}`}>
                        {s.icon} {s.label}
                      </span>
                    </p>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-5 bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100">
          {[
            { key: 'applications', icon: '📋', label: `Applications (${applications.length})` },
            { key: 'favorites',    icon: '❤️', label: `Saved (${favorites.length})` },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all border-0 cursor-pointer
                ${tab === t.key
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md'
                  : 'text-gray-500 hover:text-amber-600 bg-transparent'}`}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Applications Tab */}
        {tab === 'applications' && (
          <div className="flex flex-col gap-3">
            {applications.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="text-5xl mb-3">📋</div>
                <h3 className="font-bold text-gray-700 mb-1">No applications yet</h3>
                <p className="text-gray-400 text-sm mb-4">Browse animals and submit your first adoption request</p>
                <button onClick={() => navigate('/animals')}
                  className="bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold px-6 py-2.5 rounded-xl text-sm border-0 cursor-pointer hover:shadow-lg transition-all">
                  Browse Animals
                </button>
              </div>
            ) : applications.map(app => {
              const s = STATUS_MAP[app.status] || STATUS_MAP.pending;
              const isUnread = app.read === false;
              return (
                <div key={app.id}
                  className={`bg-white rounded-2xl p-5 shadow-sm flex gap-4 items-center transition-all
                    ${isUnread ? 'border-2 border-amber-300 shadow-amber-100' : 'border border-gray-100 hover:shadow-md'}`}>
                  <div className="relative flex-shrink-0">
                    <img src={app.animal_image} alt={app.animal_name}
                      className="w-16 h-16 rounded-xl object-cover"
                      onError={e => e.target.src = 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=100&q=80'} />
                    {isUnread && (
                      <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 rounded-full border-2 border-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-gray-800 text-base">{app.animal_name}</h3>
                          {isUnread && (
                            <span className="text-xs bg-red-100 text-red-600 font-bold px-2 py-0.5 rounded-full">NEW</span>
                          )}
                        </div>
                        <p className="text-gray-400 text-xs">{app.animal_species}</p>
                      </div>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full flex-shrink-0 ${s.bg} ${s.text}`}>
                        {s.icon} {s.label}
                      </span>
                    </div>
                    <p className="text-gray-500 text-xs mt-2 italic line-clamp-1">"{app.message?.split('\n')[0]}"</p>
                    <p className="text-gray-300 text-xs mt-1">
                      Applied {new Date(app.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Favorites Tab */}
        {tab === 'favorites' && (
          <div>
            {favorites.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="text-5xl mb-3">🤍</div>
                <h3 className="font-bold text-gray-700 mb-1">No saved animals yet</h3>
                <p className="text-gray-400 text-sm mb-4">Tap the heart on any animal to save them here</p>
                <button onClick={() => navigate('/animals')}
                  className="bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold px-6 py-2.5 rounded-xl text-sm border-0 cursor-pointer hover:shadow-lg transition-all">
                  Browse Animals
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {favorites.map(animal => (
                  <div key={animal.id}
                    className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all group">
                    <div className="relative h-40 overflow-hidden">
                      <img src={animal.image} alt={animal.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={e => e.target.src = 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&q=80'} />
                      <div className="absolute top-2 right-2 bg-white/90 rounded-full w-7 h-7 flex items-center justify-center text-sm">❤️</div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-800 mb-0.5">{animal.name}</h3>
                      <p className="text-gray-400 text-xs mb-3">{animal.breed} · {animal.age} yrs</p>
                      <button onClick={() => navigate(`/adoption?animalId=${animal.id}`)}
                        className="w-full py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-amber-500 to-amber-600 text-white border-0 cursor-pointer hover:shadow-md transition-all">
                        🐾 Adopt Me!
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Logout */}
      <div className="max-w-3xl mx-auto px-4 pb-10">
        <button onClick={handleLogout}
          className="w-full py-3 rounded-2xl text-sm font-semibold text-red-500 bg-white border border-red-100 hover:bg-red-50 transition-all cursor-pointer flex items-center justify-center gap-2">
          🚪 Sign Out
        </button>
      </div>
    </div>
  );
}

export default MyApplications;
