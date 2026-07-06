import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../constants';

const STATUS_MAP = {
  pending:  { bg: 'bg-amber-100',   text: 'text-amber-700',   icon: '⏳', label: 'Pending Review' },
  approved: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: '✅', label: 'Approved!' },
  rejected: { bg: 'bg-red-100',     text: 'text-red-600',     icon: '❌', label: 'Not Approved' },
};

const TOPUP_AMOUNTS = [1000, 2000, 5000, 10000]; // cents

function MyApplications() {
  const [applications, setApplications]   = useState([]);
  const [favorites, setFavorites]         = useState([]);
  const [sponsorships, setSponsorships]   = useState([]);
  const [profile, setProfile]             = useState(null);
  const [tab, setTab]                     = useState('applications');
  const [loading, setLoading]             = useState(true);
  const [editing, setEditing]             = useState(false);
  const [editForm, setEditForm]           = useState({});
  const [editMsg, setEditMsg]             = useState('');
  const [topUpAmount, setTopUpAmount]     = useState(1000);
  const [walletMsg, setWalletMsg]         = useState('');
  const navigate = useNavigate();
  const userId   = localStorage.getItem('user_id');

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
      fetch(`${API_BASE_URL}/my-sponsorships?user_id=${userId}`).then(r => r.json()),
      fetch(`${API_BASE_URL}/profile?user_id=${userId}`).then(r => r.json()),
    ]).then(([apps, favs, sponsors, prof]) => {
      setApplications(Array.isArray(apps) ? apps : []);
      setFavorites(Array.isArray(favs) ? favs : []);
      setSponsorships(Array.isArray(sponsors) ? sponsors : []);
      setProfile(prof);
      if (prof?.username && prof?.email) {
        setEditForm({ username: prof.username, email: prof.email, avatar: prof.avatar });
      }
    }).catch(err => {
      setEditMsg('Failed to load profile data');
      console.error(err);
    })
      .finally(() => setLoading(false));
  }, [userId, navigate]);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    if (!userId) return;
    fetch(`${API_BASE_URL}/notifications/mark-read?user_id=${userId}`, { method: 'POST' }).catch(() => {});
  }, [userId]);

  const saveProfile = async () => {
    setEditMsg('');
    const res = await fetch(`${API_BASE_URL}/profile?user_id=${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm),
    });
    const data = await res.json();
    if (res.ok) {
      setProfile(p => ({ ...p, ...data }));
      localStorage.setItem('username', data.username);
      setEditing(false);
      setEditMsg('');
    } else {
      setEditMsg(data.detail || 'Update failed');
    }
  };

  const handleTopUp = async () => {
    setWalletMsg('');
    const res = await fetch(`${API_BASE_URL}/wallet/topup?user_id=${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: topUpAmount }),
    });
    const data = await res.json();
    if (res.ok) {
      setProfile(p => ({ ...p, wallet_balance: data.wallet_balance }));
      setWalletMsg(`✅ $${(topUpAmount / 100).toFixed(0)} added!`);
    } else {
      setWalletMsg('❌ Top up failed');
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-50 to-amber-50/20">
      <div className="text-center">
        <div className="text-5xl mb-4 animate-bounce">⏳</div>
        <p className="text-amber-600 font-semibold text-lg">Loading your profile...</p>
      </div>
    </div>
  );

  const unread   = applications.filter(a => a.read === false);
  const approved = applications.filter(a => a.status === 'approved').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-amber-50/20">

      {/* Profile Header */}
      <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-12 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 text-8xl flex items-center justify-around pointer-events-none">
          <span>🐾</span><span>❤️</span><span>🏠</span>
        </div>
        <div className="relative z-10">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/40 flex items-center justify-center mx-auto mb-3 overflow-hidden">
            {profile?.avatar
              ? <img src={profile.avatar} alt="avatar" className="w-full h-full object-cover" onError={e => e.target.style.display='none'} />
              : <span className="text-4xl font-extrabold text-white">{profile?.username?.[0]?.toUpperCase() || 'U'}</span>
            }
          </div>
          <h1 className="text-3xl font-extrabold text-white mb-0.5">{profile?.username}</h1>
          <p className="text-amber-100 text-sm">{profile?.email}</p>
          <button onClick={() => { setEditing(true); setEditMsg(''); }}
            className="mt-3 bg-white/20 hover:bg-white/30 text-white text-xs font-bold px-4 py-1.5 rounded-full border border-white/30 cursor-pointer transition-all">
            ✏️ Edit Profile
          </button>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <h2 className="text-lg font-extrabold text-gray-800 mb-4">Edit Profile</h2>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1 block">Username</label>
                <input value={editForm.username || ''} onChange={e => setEditForm(f => ({ ...f, username: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-400" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1 block">Email</label>
                <input value={editForm.email || ''} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-400" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1 block">Avatar URL</label>
                <input value={editForm.avatar || ''} onChange={e => setEditForm(f => ({ ...f, avatar: e.target.value }))}
                  placeholder="https://..." className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-400" />
                {editForm.avatar && (
                  <img src={editForm.avatar} alt="preview" className="w-12 h-12 rounded-full object-cover mt-2 border-2 border-amber-200"
                    onError={e => e.target.style.display='none'} />
                )}
              </div>
              {editMsg && <p className="text-xs text-red-500 font-semibold">{editMsg}</p>}
              <div className="flex gap-2 mt-1">
                <button onClick={() => setEditing(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-gray-500 bg-gray-100 border-0 cursor-pointer hover:bg-gray-200 transition-all">
                  Cancel
                </button>
                <button onClick={saveProfile}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-amber-500 to-amber-600 border-0 cursor-pointer hover:shadow-lg transition-all">
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="max-w-3xl mx-auto px-4 -mt-6 mb-6 relative z-10">
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Applications', value: applications.length, icon: '📋' },
            { label: 'Approved',     value: approved,            icon: '✅' },
            { label: 'Saved',        value: favorites.length,    icon: '❤️' },
            { label: 'Sponsoring',   value: sponsorships.length, icon: '💜' },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-2xl p-3 text-center shadow-md border border-gray-100">
              <div className="text-xl mb-1">{s.icon}</div>
              <p className="text-xl font-extrabold text-amber-600">{s.value}</p>
              <p className="text-xs text-gray-400 font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 pb-6">

        {/* Wallet Card */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-5 mb-5 text-white shadow-lg shadow-amber-200">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs font-bold opacity-80 uppercase tracking-wide">💳 My Wallet</p>
              <p className="text-3xl font-extrabold">${((profile?.wallet_balance || 0) / 100).toFixed(2)}</p>
              <p className="text-xs opacity-70">Available balance</p>
            </div>
            <div className="text-5xl opacity-20">🐾</div>
          </div>
          <div className="flex gap-2 flex-wrap mb-2">
            {TOPUP_AMOUNTS.map(amt => (
              <button key={amt} onClick={() => setTopUpAmount(amt)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border-0 cursor-pointer transition-all
                  ${topUpAmount === amt ? 'bg-white text-amber-600 shadow-md' : 'bg-white/20 text-white hover:bg-white/30'}`}>
                +${amt / 100}
              </button>
            ))}
          </div>
          {walletMsg && <p className="text-xs font-semibold mb-2">{walletMsg}</p>}
          <button onClick={handleTopUp}
            className="w-full py-2.5 rounded-xl text-sm font-bold bg-white text-amber-600 border-0 cursor-pointer hover:shadow-lg transition-all">
            Top Up ${(topUpAmount / 100).toFixed(0)}
          </button>
        </div>

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
                      <span className="font-semibold text-gray-700">{app.animal_name}</span>{' '}—{' '}
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
        <div className="flex gap-1.5 mb-5 bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100 overflow-x-auto">
          {[
            { key: 'applications', icon: '📋', label: `Applications (${applications.length})` },
            { key: 'favorites',    icon: '❤️', label: `Saved (${favorites.length})` },
            { key: 'sponsorships', icon: '💜', label: `Sponsoring (${sponsorships.length})` },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all border-0 cursor-pointer whitespace-nowrap
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
                    {isUnread && <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 rounded-full border-2 border-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-gray-800 text-base">{app.animal_name}</h3>
                          {isUnread && <span className="text-xs bg-red-100 text-red-600 font-bold px-2 py-0.5 rounded-full">NEW</span>}
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

        {/* Sponsorships Tab */}
        {tab === 'sponsorships' && (
          <div>
            {sponsorships.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="text-5xl mb-3">💜</div>
                <h3 className="font-bold text-gray-700 mb-1">Not sponsoring anyone yet</h3>
                <p className="text-gray-400 text-sm mb-4">Open any animal profile to sponsor their care</p>
                <button onClick={() => navigate('/animals')}
                  className="bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold px-6 py-2.5 rounded-xl text-sm border-0 cursor-pointer hover:shadow-lg transition-all">
                  Browse Animals
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {sponsorships.map(s => (
                  <div key={s.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex gap-4 items-center">
                    <img src={s.animal_image} alt={s.animal_name}
                      className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                      onError={e => e.target.src = 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=100&q=80'} />
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800">{s.animal_name}</h3>
                      <p className="text-gray-400 text-xs">{s.animal_species}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-extrabold text-amber-600">${(s.amount / 100).toFixed(0)}</p>
                      <p className="text-xs text-gray-400">per month</p>
                    </div>
                  </div>
                ))}
                <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 text-center">
                  <p className="text-sm font-bold text-amber-700">
                    🐾 Total: ${(sponsorships.reduce((sum, s) => sum + s.amount, 0) / 100).toFixed(0)}/month
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Thank you for making a difference!</p>
                </div>
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
