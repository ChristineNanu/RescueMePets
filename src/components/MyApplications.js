import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../constants';
import { apiFetch } from '../api';
import TicketThread from './TicketThread';

const STATUS_MAP = {
  pending:  { bg: 'bg-cream-100',  text: 'text-cream-700',  icon: '⏳', label: 'Pending Review' },
  approved: { bg: 'bg-teal-100',   text: 'text-teal-700',   icon: '✅', label: 'Approved!'      },
  rejected: { bg: 'bg-coral-100',  text: 'text-coral-600',  icon: '❌', label: 'Not Approved'   },
};

const TOPUP_AMOUNTS = [1000, 2000, 5000, 10000];

const TICKET_STATUS = {
  open:        { bg: 'bg-cream-100',  text: 'text-cream-700',  label: 'Open' },
  in_progress: { bg: 'bg-teal-100',   text: 'text-teal-700',   label: 'In Progress' },
  resolved:    { bg: 'bg-gray-100',   text: 'text-gray-500',   label: 'Resolved' },
};

function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [favorites, setFavorites]       = useState([]);
  const [sponsorships, setSponsorships] = useState([]);
  const [profile, setProfile]           = useState(null);
  const [tickets, setTickets]           = useState([]);
  const [tab, setTab]                   = useState('applications');
  const [loading, setLoading]           = useState(true);
  const [editing, setEditing]           = useState(false);
  const [editForm, setEditForm]         = useState({});
  const [editMsg, setEditMsg]           = useState('');
  const [topUpAmount, setTopUpAmount]   = useState(1000);
  const [walletMsg, setWalletMsg]       = useState('');
  const [supportModal, setSupportModal] = useState(null); // adoption object
  const [threadTicket, setThreadTicket]  = useState(null);
  const [msgPreview, setMsgPreview]      = useState({}); // { [ticketId]: { text, sender } }
  const [issueText, setIssueText]       = useState('');
  const [ticketMsg, setTicketMsg]       = useState('');
  const [ticketLoading, setTicketLoading] = useState(false);
  const [editAppModal, setEditAppModal] = useState(null);
  const [editAppMsg, setEditAppMsg]     = useState('');
  const [editAppText, setEditAppText]   = useState('');
  const navigate = useNavigate();
  const userId   = localStorage.getItem('user_id');

  const handleLogout = () => {
    localStorage.removeItem('user_id');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    localStorage.removeItem('vet_id');
    navigate('/');
    window.location.reload();
  };

  const loadData = useCallback(() => {
    if (!userId) { navigate('/login'); return; }
    Promise.all([
      apiFetch(`${API_BASE_URL}/my-applications?user_id=${userId}`).then(r => r.json()),
      apiFetch(`${API_BASE_URL}/favorites?user_id=${userId}`).then(r => r.json()),
      apiFetch(`${API_BASE_URL}/my-sponsorships?user_id=${userId}`).then(r => r.json()),
      apiFetch(`${API_BASE_URL}/profile?user_id=${userId}`).then(r => r.json()),
      apiFetch(`${API_BASE_URL}/support?user_id=${userId}`).then(r => r.json()),
    ]).then(([apps, favs, sponsors, prof, tix]) => {
      setApplications(Array.isArray(apps) ? apps : []);
      setFavorites(Array.isArray(favs) ? favs : []);
      setSponsorships(Array.isArray(sponsors) ? sponsors : []);
      setProfile(prof);
      setTickets(Array.isArray(tix) ? tix : []);
      // fetch last message preview for tickets with assigned vets
      if (Array.isArray(tix)) {
        tix.filter(t => t.vet && t.status !== 'resolved').forEach(t => {
          apiFetch(`${API_BASE_URL}/tickets/${t.id}/messages`)
            .then(r => r.json())
            .then(msgs => {
              if (Array.isArray(msgs) && msgs.length > 0) {
                const last = msgs[msgs.length - 1];
                if (last.sender_role === 'vet') {
                  setMsgPreview(prev => ({ ...prev, [t.id]: { text: last.message, sender: last.sender_name } }));
                }
              }
            }).catch(() => {});
        });
      }
      if (prof?.username && prof?.email) setEditForm({ username: prof.username, email: prof.email, avatar: prof.avatar });
    }).catch(() => setEditMsg('Failed to load profile data'))
      .finally(() => setLoading(false));
  }, [userId, navigate]);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    if (!userId) return;
    apiFetch(`${API_BASE_URL}/notifications/mark-read?user_id=${userId}`, { method: 'POST' }).catch(() => {});
  }, [userId]);

  const saveProfile = async () => {
    setEditMsg('');
    const res = await apiFetch(`${API_BASE_URL}/profile?user_id=${userId}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm),
    });
    const data = await res.json();
    if (res.ok) { setProfile(p => ({ ...p, ...data })); localStorage.setItem('username', data.username); setEditing(false); }
    else setEditMsg(data.detail || 'Update failed');
  };

  const handleTopUp = async () => {
    setWalletMsg('');
    const res = await apiFetch(`${API_BASE_URL}/wallet/topup?user_id=${userId}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: topUpAmount }),
    });
    const data = await res.json();
    if (res.ok) { setProfile(p => ({ ...p, wallet_balance: data.wallet_balance })); setWalletMsg(`✅ $${(topUpAmount / 100).toFixed(0)} added!`); }
    else setWalletMsg('❌ Top up failed');
  };

  const submitTicket = async () => {
    if (!issueText.trim()) return;
    setTicketLoading(true); setTicketMsg('');
    const res = await apiFetch(`${API_BASE_URL}/support`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: parseInt(userId), adoption_id: supportModal.id, issue: issueText }),
    });
    const data = await res.json();
    if (res.ok) {
      apiFetch(`${API_BASE_URL}/support?user_id=${userId}`).then(r => r.json()).then(tix => setTickets(Array.isArray(tix) ? tix : []));
      setSupportModal(null);
      setIssueText('');
      setTicketMsg('');
    } else {
      setTicketMsg(`⚠️ ${data.detail || 'Failed to submit'}`);
    }
    setTicketLoading(false);
  };

  const deleteApplication = async (appId) => {
    if (!window.confirm('Are you sure you want to withdraw this application?')) return;
    const res = await apiFetch(`${API_BASE_URL}/applications/${appId}?user_id=${userId}`, { method: 'DELETE' });
    if (res.ok) setApplications(prev => prev.filter(a => a.id !== appId));
  };

  const saveEditApp = async () => {
    if (!editAppText.trim()) return;
    setEditAppMsg('');
    const res = await apiFetch(`${API_BASE_URL}/applications/${editAppModal.id}?user_id=${userId}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: editAppText }),
    });
    const data = await res.json();
    if (res.ok) {
      setApplications(prev => prev.map(a => a.id === editAppModal.id ? { ...a, message: editAppText } : a));
      setEditAppModal(null);
      setEditAppMsg('');
    } else setEditAppMsg(data.detail || 'Update failed');
  };

  if (loading) return (
    <div className="page-bg min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-teal-400 to-teal-600 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-5 shadow-glow-teal animate-float">👤</div>
        <p className="text-teal-700 font-semibold text-lg">Loading your profile...</p>
      </div>
    </div>
  );

  const unread   = applications.filter(a => a.read === false);
  const approved = applications.filter(a => a.status === 'approved').length;

  return (
    <div className="page-bg min-h-screen">

      {/* Profile Header */}
      <div className="relative bg-gradient-to-r from-teal-600 to-teal-500 px-6 py-14 text-center overflow-hidden">
        <div className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: 'radial-gradient(circle, white 1.5px, transparent 1.5px)', backgroundSize: '28px 28px' }} />
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/40 flex items-center justify-center mx-auto mb-3 overflow-hidden shadow-glow-teal">
            {profile?.avatar
              ? <img src={profile.avatar} alt="avatar" className="w-full h-full object-cover" onError={e => e.target.style.display='none'} />
              : <span className="text-4xl font-black text-white">{profile?.username?.[0]?.toUpperCase() || 'U'}</span>
            }
          </div>
          <h1 className="text-3xl font-black text-white mb-0.5">{profile?.username}</h1>
          <p className="text-teal-100 text-sm">{profile?.email}</p>
          <button onClick={() => { setEditing(true); setEditMsg(''); }}
            className="mt-3 glass hover:bg-white/25 text-white text-xs font-bold px-4 py-1.5 rounded-full cursor-pointer transition-all border-0">
            ✏️ Edit Profile
          </button>
        </div>
      </div>

      {/* Support Modal */}
      {threadTicket && (
        <TicketThread
          ticket={threadTicket}
          senderId={parseInt(userId)}
          senderRole="adopter"
          onClose={() => setThreadTicket(null)}
        />
      )}

      {supportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-teal-50 modal-enter">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-teal-100 flex items-center justify-center text-xl">🐾</div>
              <div>
                <h2 className="text-base font-black text-gray-800">Need Help with {supportModal.animal_name}?</h2>
                <p className="text-xs text-gray-400">We'll connect you with a vet from the rescue center</p>
              </div>
            </div>
            <textarea
              className="input-field w-full resize-none text-sm"
              rows={4}
              placeholder="Describe the issue (e.g. not eating, limping, skin rash...)" 
              value={issueText}
              onChange={e => setIssueText(e.target.value)}
            />
            {ticketMsg && (
              <p className={`text-xs font-semibold mt-2 ${ticketMsg.startsWith('✅') ? 'text-teal-600' : 'text-coral-600'}`}>{ticketMsg}</p>
            )}
            <div className="flex gap-2 mt-3">
              <button onClick={() => { setSupportModal(null); setIssueText(''); setTicketMsg(''); }}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-gray-500 bg-gray-100 border-0 cursor-pointer hover:bg-gray-200 transition-all">Cancel</button>
              <button onClick={submitTicket} disabled={ticketLoading || !issueText.trim()}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white btn-primary border-0 cursor-pointer disabled:opacity-50">
                {ticketLoading ? 'Sending...' : 'Send Request'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Application Modal */}
      {editAppModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-teal-50">
            <h2 className="text-base font-black text-gray-800 mb-1">Edit Application</h2>
            <p className="text-xs text-gray-400 mb-3">Update your message for <strong>{editAppModal.animal_name}</strong></p>
            <textarea className="input-field w-full resize-none text-sm" rows={4}
              value={editAppText} onChange={e => setEditAppText(e.target.value)} />
            {editAppMsg && <p className="text-xs text-coral-600 font-semibold mt-2">{editAppMsg}</p>}
            <div className="flex gap-2 mt-3">
              <button onClick={() => setEditAppModal(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-gray-500 bg-gray-100 border-0 cursor-pointer">Cancel</button>
              <button onClick={saveEditApp}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white btn-primary border-0 cursor-pointer">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-teal-50 modal-enter">
            <h2 className="text-lg font-black text-gray-800 mb-4">Edit Profile</h2>
            <div className="flex flex-col gap-3">
              {[['Username', 'username', 'text'], ['Email', 'email', 'email'], ['Avatar URL', 'avatar', 'text']].map(([label, key, type]) => (
                <div key={key}>
                  <label className="text-xs font-bold text-gray-500 mb-1 block">{label}</label>
                  <input type={type} value={editForm[key] || ''} onChange={e => setEditForm(f => ({ ...f, [key]: e.target.value }))}
                    placeholder={key === 'avatar' ? 'https://...' : ''} className="input-field" />
                  {key === 'avatar' && editForm.avatar && (
                    <img src={editForm.avatar} alt="preview" className="w-12 h-12 rounded-full object-cover mt-2 border-2 border-teal-200"
                      onError={e => e.target.style.display='none'} />
                  )}
                </div>
              ))}
              {editMsg && <p className="text-xs text-coral-600 font-semibold">{editMsg}</p>}
              <div className="flex gap-2 mt-1">
                <button onClick={() => setEditing(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-gray-500 bg-gray-100 border-0 cursor-pointer hover:bg-gray-200 transition-all">Cancel</button>
                <button onClick={saveProfile}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white btn-primary">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="max-w-3xl mx-auto px-4 -mt-6 mb-6 relative z-10">
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Applications', value: applications.length, icon: '📋', bg: 'bg-teal-50',  text: 'text-teal-700'  },
            { label: 'Approved',     value: approved,            icon: '✅', bg: 'bg-teal-50',  text: 'text-teal-700'  },
            { label: 'Saved',        value: favorites.length,    icon: '❤️', bg: 'bg-coral-50', text: 'text-coral-700' },
            { label: 'Sponsoring',   value: sponsorships.length, icon: '💛', bg: 'bg-cream-50', text: 'text-cream-700' },
          ].map((s, i) => (
            <div key={i} className={`${s.bg} rounded-2xl p-3 text-center shadow-card border border-white`}>
              <div className="text-xl mb-1">{s.icon}</div>
              <p className={`text-xl font-black ${s.text}`}>{s.value}</p>
              <p className="text-xs text-gray-400 font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 pb-6">

        {/* Wallet Card */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-500 rounded-3xl p-5 mb-5 text-white shadow-glow-teal">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs font-bold opacity-75 uppercase tracking-wide">💳 My Wallet</p>
              <p className="text-3xl font-black">${((profile?.wallet_balance || 0) / 100).toFixed(2)}</p>
              <p className="text-xs opacity-60">Available balance</p>
            </div>
            <div className="text-5xl opacity-10">🐾</div>
          </div>
          <div className="flex gap-2 flex-wrap mb-2">
            {TOPUP_AMOUNTS.map(amt => (
              <button key={amt} onClick={() => setTopUpAmount(amt)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border-0 cursor-pointer transition-all
                  ${topUpAmount === amt ? 'bg-white text-teal-700 shadow-md' : 'bg-white/20 text-white hover:bg-white/30'}`}>
                +${amt / 100}
              </button>
            ))}
          </div>
          {walletMsg && <p className="text-xs font-semibold mb-2">{walletMsg}</p>}
          <button onClick={handleTopUp}
            className="w-full py-2.5 rounded-xl text-sm font-bold bg-white text-teal-700 border-0 cursor-pointer hover:shadow-lg transition-all">
            Top Up ${(topUpAmount / 100).toFixed(0)}
          </button>
        </div>

        {/* Unread banner */}
        {(unread.length > 0 || Object.values(msgPreview).length > 0) && (
          <div className="mb-5 bg-white border-2 border-teal-300 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">🔔</span>
              <p className="font-black text-gray-800 text-sm">New Notifications</p>
            </div>
            <div className="flex flex-col gap-2">
              {unread.length > 0 && (
                <div className="bg-teal-50 rounded-xl px-4 py-3 border border-teal-100">
                  <p className="text-sm font-semibold text-gray-700 mb-1">
                    {unread.length} application update{unread.length > 1 ? 's' : ''}:
                  </p>
                  {unread.map(app => {
                    const s = STATUS_MAP[app.status] || STATUS_MAP.pending;
                    return (
                      <p key={app.id} className="text-xs text-gray-500">
                        <span className="font-semibold text-gray-700">{app.animal_name}</span>{' '}—{' '}
                        <span className={`font-bold ${app.status === 'approved' ? 'text-teal-600' : 'text-coral-500'}`}>{s.icon} {s.label}</span>
                      </p>
                    );
                  })}
                </div>
              )}
              {Object.entries(msgPreview).map(([ticketId, preview]) => {
                const ticket = tickets.find(t => t.id === parseInt(ticketId));
                if (!ticket) return null;
                return (
                  <button key={ticketId}
                    onClick={() => {
                      setThreadTicket(ticket);
                      setMsgPreview(prev => { const n = { ...prev }; delete n[ticketId]; return n; });
                    }}
                    className="bg-teal-50 rounded-xl px-4 py-3 border border-teal-200 text-left w-full cursor-pointer hover:border-teal-400 hover:shadow-sm transition-all">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-black text-teal-600">💬 Message from your vet — {ticket.animal_name}</p>
                      <span className="w-2 h-2 bg-coral-500 rounded-full" />
                    </div>
                    <p className="text-xs text-gray-600 truncate">"{preview.sender}: {preview.text}"</p>
                    <p className="text-xs text-teal-500 font-semibold mt-1">Tap to open chat →</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1.5 mb-5 bg-white rounded-2xl p-1.5 shadow-sm border border-teal-50 overflow-x-auto">
          {[
            { key: 'applications', icon: '📋', label: `Applications (${applications.length})` },
            { key: 'favorites',    icon: '❤️', label: `Saved (${favorites.length})` },
            { key: 'sponsorships', icon: '💛', label: `Sponsoring (${sponsorships.length})` },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all border-0 cursor-pointer whitespace-nowrap
                ${tab === t.key ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-md' : 'text-gray-500 hover:text-teal-600 bg-transparent'}`}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Applications Tab */}
        {tab === 'applications' && (
          <div className="flex flex-col gap-3">
            {applications.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl shadow-card border border-teal-50">
                <div className="text-5xl mb-3">📋</div>
                <h3 className="font-bold text-gray-700 mb-1">No applications yet</h3>
                <p className="text-gray-400 text-sm mb-4">Browse animals and submit your first adoption request</p>
                <button onClick={() => navigate('/animals')} className="btn-primary px-6 py-2.5 text-sm">Browse Animals</button>
              </div>
            ) : applications.map(app => {
              const s = STATUS_MAP[app.status] || STATUS_MAP.pending;
              const isUnread = app.read === false;
              return (
                <div key={app.id}
                  className={`bg-white rounded-2xl p-5 shadow-sm flex gap-4 items-center transition-all
                    ${isUnread ? 'border-2 border-teal-300 shadow-teal-100' : 'border border-teal-50 hover:shadow-card'}`}>
                  <div className="relative flex-shrink-0">
                    <img src={app.animal_image} alt={app.animal_name}
                      className="w-16 h-16 rounded-xl object-cover"
                      onError={e => e.target.src = 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=100&q=80'} />
                    {isUnread && <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-coral-500 rounded-full border-2 border-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-gray-800 text-base">{app.animal_name}</h3>
                          {isUnread && <span className="text-xs bg-coral-100 text-coral-600 font-bold px-2 py-0.5 rounded-full">NEW</span>}
                        </div>
                        <p className="text-gray-400 text-xs">{app.animal_species}</p>
                      </div>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full flex-shrink-0 ${s.bg} ${s.text}`}>{s.icon} {s.label}</span>
                    </div>
                    <p className="text-gray-500 text-xs mt-2 italic line-clamp-1">"{app.message?.split('\n')[0]}"</p>
                    <p className="text-gray-300 text-xs mt-1">
                      Applied {new Date(app.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                    {/* Edit / Delete — only for pending */}
                    {app.status === 'pending' && (
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => { setEditAppModal(app); setEditAppText(app.message || ''); setEditAppMsg(''); }}
                          className="text-xs font-bold text-teal-600 bg-teal-50 border border-teal-200 px-3 py-1.5 rounded-xl cursor-pointer hover:bg-teal-100 transition-all">
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => deleteApplication(app.id)}
                          className="text-xs font-bold text-coral-600 bg-coral-50 border border-coral-200 px-3 py-1.5 rounded-xl cursor-pointer hover:bg-coral-100 transition-all">
                          🗑️ Withdraw
                        </button>
                      </div>
                    )}
                    {/* Ticket info or Need Help button */}
                    {(() => {
                      const ticket = tickets.find(t => t.adoption_id === app.id);
                      if (ticket) {
                        const ts = TICKET_STATUS[ticket.status] || TICKET_STATUS.open;
                        return (
                          <div className="mt-3 bg-teal-50 border border-teal-100 rounded-xl p-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-bold text-teal-700">🐾 Support Request</span>
                              <div className="flex items-center gap-2">
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${ts.bg} ${ts.text}`}>{ts.label}</span>
                                {ticket.status === 'open' && (
                                  <>
                                    <button
                                      onClick={() => { setSupportModal(app); setIssueText(ticket.issue); setTicketMsg(''); }}
                                      className="text-xs font-bold text-teal-600 bg-white border border-teal-200 px-2 py-0.5 rounded-lg cursor-pointer hover:bg-teal-50 transition-all">✏️</button>
                                    <button
                                      onClick={async () => {
                                        if (!window.confirm('Withdraw this support request?')) return;
                                        const res = await apiFetch(`${API_BASE_URL}/support/${ticket.id}?user_id=${userId}`, { method: 'DELETE' });
                                        if (res.ok) setTickets(prev => prev.filter(t => t.id !== ticket.id));
                                      }}
                                      className="text-xs font-bold text-coral-600 bg-white border border-coral-200 px-2 py-0.5 rounded-lg cursor-pointer hover:bg-coral-50 transition-all">🗑️</button>
                                  </>
                                )}
                              </div>
                            </div>
                            <p className="text-xs text-gray-500 italic line-clamp-1">"{ticket.issue}"</p>
                            {ticket.vet ? (
                              <div className="mt-2 bg-white rounded-lg p-2 border border-teal-100">
                                <p className="text-xs font-bold text-gray-700">🩺 Assigned Vet: {ticket.vet.name}</p>
                                <p className="text-xs text-gray-400">{ticket.vet.clinic} · {ticket.vet.specialization}</p>
                                <p className="text-xs text-teal-600 font-semibold mt-0.5">📞 {ticket.vet.phone}</p>
                                <button
                                  onClick={() => setThreadTicket(ticket)}
                                  className="mt-2 w-full text-xs font-bold text-teal-600 bg-teal-50 border border-teal-200 px-3 py-1.5 rounded-lg cursor-pointer hover:bg-teal-100 transition-all">
                                  💬 Message Vet
                                </button>
                              </div>
                            ) : (
                              <p className="text-xs text-gray-400 mt-1">⏳ A vet will be assigned shortly</p>
                            )}
                            {ticket.resolution_note && (
                              <div className="mt-2 bg-green-50 border border-green-100 rounded-lg p-2">
                                <p className="text-xs font-black text-green-600 uppercase tracking-widest mb-0.5">Resolved</p>
                                <p className="text-xs text-gray-700">{ticket.resolution_note}</p>
                                <button
                                  onClick={() => setThreadTicket(ticket)}
                                  className="mt-2 w-full text-xs font-bold text-teal-600 bg-teal-50 border border-teal-200 px-3 py-1.5 rounded-lg cursor-pointer hover:bg-teal-100 transition-all">
                                  💬 View Thread
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      }
                      return (
                        <button
                          onClick={() => { setSupportModal(app); setTicketMsg(''); setIssueText(''); }}
                          className="mt-3 text-xs font-bold text-teal-600 bg-teal-50 border border-teal-200 px-3 py-1.5 rounded-xl cursor-pointer hover:bg-teal-100 transition-all">
                          🐾 Need Help?
                        </button>
                      );
                    })()}
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
              <div className="text-center py-16 bg-white rounded-3xl shadow-card border border-teal-50">
                <div className="text-5xl mb-3">🤍</div>
                <h3 className="font-bold text-gray-700 mb-1">No saved animals yet</h3>
                <p className="text-gray-400 text-sm mb-4">Tap the heart on any animal to save them here</p>
                <button onClick={() => navigate('/animals')} className="btn-primary px-6 py-2.5 text-sm">Browse Animals</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {favorites.map(animal => (
                  <div key={animal.id}
                    className="bg-white rounded-3xl overflow-hidden shadow-card border border-teal-50 hover:shadow-card-hover hover:-translate-y-1 transition-all group">
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
                        className="w-full py-2.5 rounded-xl text-sm font-bold btn-coral">🐾 Adopt Me!</button>
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
              <div className="text-center py-16 bg-white rounded-3xl shadow-card border border-teal-50">
                <div className="text-5xl mb-3">💛</div>
                <h3 className="font-bold text-gray-700 mb-1">Not sponsoring anyone yet</h3>
                <p className="text-gray-400 text-sm mb-4">Open any animal profile to sponsor their care</p>
                <button onClick={() => navigate('/animals')} className="btn-primary px-6 py-2.5 text-sm">Browse Animals</button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {sponsorships.map(s => (
                  <div key={s.id} className="bg-white rounded-2xl p-4 shadow-sm border border-teal-50 flex gap-4 items-center">
                    <img src={s.animal_image} alt={s.animal_name}
                      className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                      onError={e => e.target.src = 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=100&q=80'} />
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800">{s.animal_name}</h3>
                      <p className="text-gray-400 text-xs">{s.animal_species}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-teal-600">${(s.amount / 100).toFixed(0)}</p>
                      <p className="text-xs text-gray-400">per month</p>
                    </div>
                  </div>
                ))}
                <div className="bg-teal-50 rounded-2xl p-4 border border-teal-100 text-center">
                  <p className="text-sm font-bold text-teal-700">
                    💛 Total: ${(sponsorships.reduce((sum, s) => sum + s.amount, 0) / 100).toFixed(0)}/month
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Thank you for making a difference!</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sign Out */}
      <div className="max-w-3xl mx-auto px-4 pb-10">
        <button onClick={handleLogout}
          className="w-full py-3 rounded-2xl text-sm font-semibold text-coral-500 bg-white border border-coral-100 hover:bg-coral-50 transition-all cursor-pointer flex items-center justify-center gap-2">
          🚪 Sign Out
        </button>
      </div>
    </div>
  );
}

export default MyApplications;
