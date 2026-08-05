import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../constants';
import { apiFetch, wsURL } from '../api';
import TicketThread from './TicketThread';
import MedicalRecordsPanel from './MedicalRecordsPanel';
import EnableNotificationsBanner from './EnableNotificationsBanner';
import NotificationSettings from './NotificationSettings';
import WelcomeGuide, { shouldShowWelcomeGuide } from './WelcomeGuide';

const userId = () => parseInt(localStorage.getItem('user_id'));

export default function VetPortal({ onLogout }) {
  const [tab, setTab]         = useState('tickets');
  const [profile, setProfile] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [animals, setAnimals] = useState([]);
  const [unread, setUnread]   = useState(0);
  const [msgUnread, setMsgUnread] = useState({}); // { [ticketId]: count }
  const [msgPreview, setMsgPreview] = useState({}); // { [ticketId]: lastMessage }
  const [loading, setLoading] = useState(true);
  const [showGuide, setShowGuide] = useState(() => shouldShowWelcomeGuide('vet'));

  // Resolve modal state
  const [resolveTicket, setResolveTicket] = useState(null);
  const [resolveNote, setResolveNote]     = useState('');
  const [resolving, setResolving]         = useState(false);
  const [threadTicket, setThreadTicket]   = useState(null);
  const [recordsAnimal, setRecordsAnimal] = useState(null);

  const loadTickets = () => {
    const id = userId();
    if (!id || isNaN(id)) return;
    apiFetch(`${API_BASE_URL}/vet/tickets?user_id=${id}`)
      .then(r => r.json())
      .then(t => {
        if (!Array.isArray(t)) return;
        setTickets(t);
        t.filter(tk => tk.status !== 'resolved').forEach(tk => {
          apiFetch(`${API_BASE_URL}/tickets/${tk.id}/unread-count?reader_role=vet`)
            .then(r => r.json())
            .then(d => {
              const count = d.count || 0;
              setMsgUnread(prev => ({ ...prev, [tk.id]: count }));
              if (count > 0) {
                apiFetch(`${API_BASE_URL}/tickets/${tk.id}/messages`)
                  .then(r => r.json())
                  .then(msgs => {
                    if (Array.isArray(msgs) && msgs.length > 0) {
                      const last = msgs[msgs.length - 1];
                      setMsgPreview(prev => ({ ...prev, [tk.id]: { text: last.message, sender: last.sender_name } }));
                    }
                  }).catch(() => {});
              }
            })
            .catch(() => {});
        });
        // also update tab-level unread badge
        apiFetch(`${API_BASE_URL}/vet/unread-count?user_id=${id}`)
          .then(r => r.json()).then(u => setUnread(u?.count || 0)).catch(() => {});
      })
      .catch(() => {});
  };

  useEffect(() => {
    const id = userId();
    if (!id || isNaN(id)) { setLoading(false); return; }

    Promise.all([
      apiFetch(`${API_BASE_URL}/vet/profile?user_id=${id}`).then(r => r.json()).catch(() => null),
      apiFetch(`${API_BASE_URL}/vet/center-animals?user_id=${id}`).then(r => r.json()).catch(() => []),
    ]).then(([p, a]) => {
      setProfile(p);
      setAnimals(Array.isArray(a) ? a : []);
      setLoading(false);
    }).catch(() => setLoading(false));

    // load tickets + msg counts immediately
    loadTickets();

    // Safety-net poll in case the WebSocket connection drops
    const interval = setInterval(loadTickets, 60000);
    return () => clearInterval(interval);
  }, []); // eslint-disable-line

  // Real-time notifications: refresh tickets/messages the moment a new one arrives
  useEffect(() => {
    const id = userId();
    if (!id || isNaN(id)) return;

    let ws;
    let ping;
    let reconnectTimer;
    let closedByEffect = false;

    const connect = () => {
      ws = new WebSocket(wsURL(`/ws/notifications/${id}`));
      ws.onmessage = (e) => {
        const data = JSON.parse(e.data);
        if (data.type === 'notification') loadTickets();
      };
      ws.onclose = () => {
        if (!closedByEffect) reconnectTimer = setTimeout(connect, 3000);
      };
      ping = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) ws.send('ping');
      }, 30000);
    };
    connect();

    return () => {
      closedByEffect = true;
      clearInterval(ping);
      clearTimeout(reconnectTimer);
      ws?.close();
    };
  }, []); // eslint-disable-line

  const updateTicket = async (ticketId, status) => {
    await apiFetch(`${API_BASE_URL}/support/${ticketId}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    loadTickets();
  };

  const handleResolve = async () => {
    if (!resolveNote.trim()) return;
    setResolving(true);
    await apiFetch(`${API_BASE_URL}/support/${resolveTicket.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'resolved', resolution_note: resolveNote }),
    });
    // clear unread flag for this ticket
    const id = userId();
    await apiFetch(`${API_BASE_URL}/vet/mark-read?user_id=${id}`, { method: 'POST' }).catch(() => {});
    setUnread(0);
    setResolveTicket(null);
    setResolveNote('');
    setResolving(false);
    loadTickets();
  };

  const statusBadge = (s) => ({
    open:        'bg-yellow-100 text-yellow-700',
    in_progress: 'bg-blue-100 text-blue-700',
    resolved:    'bg-green-100 text-green-700',
  }[s] || 'bg-gray-100 text-gray-500');

  const animalStatusBadge = (s) => ({
    available: 'bg-teal-100 text-teal-700',
    pending:   'bg-yellow-100 text-yellow-700',
    adopted:   'bg-gray-100 text-gray-500',
  }[s] || 'bg-gray-100 text-gray-500');

  const activeTickets   = tickets.filter(t => t.status !== 'resolved');
  const resolvedTickets = tickets.filter(t => t.status === 'resolved');

  if (loading) return (
    <div className="min-h-screen page-bg flex items-center justify-center text-teal-600 font-semibold">
      Loading...
    </div>
  );

  return (
    <div className="min-h-screen page-bg">
      {showGuide && <WelcomeGuide role="vet" onClose={() => setShowGuide(false)} />}
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-700 to-teal-600 text-white px-6 py-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-teal-300 text-sm font-semibold mb-1">🏥 Vet Portal</p>
            <h1 className="text-3xl font-black">{profile?.name || 'Welcome'}</h1>
            <p className="text-teal-200 text-sm mt-1">
              {profile?.specialization} · {profile?.clinic} · {profile?.center_name}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowGuide(true)} aria-label="Show portal tour"
              className="w-9 h-9 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-xl text-sm font-black border-0 cursor-pointer transition-all">
              ❓
            </button>
            <button onClick={onLogout}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-semibold border-0 cursor-pointer transition-all">
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">

        <EnableNotificationsBanner />
        <NotificationSettings />

        {/* Unread notification banner */}
        {Object.keys(msgPreview).length > 0 && (
          <div className="mb-5 bg-teal-50 border border-teal-200 rounded-2xl px-5 py-4 animate-scale-in">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2.5 h-2.5 bg-teal-500 rounded-full animate-pulse flex-shrink-0" />
              <p className="text-teal-700 font-black text-sm">🔔 New Messages</p>
            </div>
            <div className="flex flex-col gap-2">
              {Object.entries(msgPreview).map(([ticketId, preview]) => {
                const ticket = tickets.find(t => t.id === parseInt(ticketId));
                if (!ticket) return null;
                return (
                  <button key={ticketId}
                    onClick={() => {
                      setThreadTicket(ticket);
                      setMsgUnread(prev => ({ ...prev, [ticketId]: 0 }));
                      setMsgPreview(prev => { const n = { ...prev }; delete n[ticketId]; return n; });
                    }}
                    className="bg-white rounded-xl px-4 py-3 border border-teal-100 text-left w-full cursor-pointer hover:border-teal-300 hover:shadow-sm transition-all">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-black text-teal-600">💬 {ticket.animal_name} — {ticket.adopter}</p>
                      <span className="min-w-[18px] h-[18px] bg-coral-500 rounded-full flex items-center justify-center text-white text-[10px] font-black px-1">
                        {msgUnread[ticketId]}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 truncate">"{preview.sender}: {preview.text}"</p>
                    <p className="text-xs text-teal-500 font-semibold mt-1">Tap to open chat →</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-2xl p-1 shadow-sm border border-teal-100 mb-6 w-fit">
          {[
            { key: 'tickets', label: `📋 Active Tickets (${activeTickets.length})`, badge: unread },
            { key: 'resolved', label: `✅ Resolved (${resolvedTickets.length})` },
            { key: 'animals', label: `🐾 Center Animals (${animals.length})` },
          ].map(({ key, label, badge }) => (
            <button key={key} onClick={() => setTab(key)}
              className={`relative px-5 py-2.5 rounded-xl text-sm font-bold transition-all border-0 cursor-pointer
                ${tab === key ? 'bg-teal-600 text-white shadow-sm' : 'text-gray-500 bg-transparent hover:text-teal-700'}`}>
              {label}
              {badge > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-coral-500 rounded-full
                  flex items-center justify-center text-white text-[10px] font-black border-2 border-white px-1">
                  {badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Active Tickets */}
        {tab === 'tickets' && (
          activeTickets.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <div className="text-5xl mb-4">📋</div>
              <p className="font-semibold">No active tickets assigned to you</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeTickets.map(t => (
                <div key={t.id} className={`bg-white rounded-2xl shadow-sm border p-6 transition-all
                  ${!t.vet_read ? 'border-teal-300 shadow-teal-100' : 'border-teal-50'}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {!t.vet_read && (
                          <span className="w-2 h-2 bg-teal-500 rounded-full flex-shrink-0" />
                        )}
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${statusBadge(t.status)}`}>
                          {t.status.replace('_', ' ')}
                        </span>
                        <span className="text-xs text-gray-400">{new Date(t.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="font-bold text-gray-800 mb-1">🐾 {t.animal_name} — adopted by {t.adopter}</p>
                      <p className="text-gray-600 text-sm">{t.issue}</p>
                    </div>
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <button onClick={() => {
                        setThreadTicket(t);
                        setMsgUnread(prev => ({ ...prev, [t.id]: 0 }));
                        setMsgPreview(prev => { const n = { ...prev }; delete n[t.id]; return n; });
                      }}
                        className="relative px-3 py-1.5 bg-teal-50 text-teal-700 rounded-lg text-xs font-bold border-0 cursor-pointer hover:bg-teal-100">
                        💬 Message
                        {(msgUnread[t.id] || 0) > 0 && (
                          <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-coral-500 rounded-full
                            flex items-center justify-center text-white text-[10px] font-black border-2 border-white px-1">
                            {msgUnread[t.id]}
                          </span>
                        )}
                      </button>
                      {t.status === 'open' && (
                        <button onClick={() => updateTicket(t.id, 'in_progress')}
                          className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold border-0 cursor-pointer hover:bg-blue-100">
                          Start
                        </button>
                      )}
                      {t.status === 'in_progress' && (
                        <button onClick={() => { setResolveTicket(t); setResolveNote(''); }}
                          className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-bold border-0 cursor-pointer hover:bg-green-100">
                          Resolve
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* Resolved Tickets */}
        {tab === 'resolved' && (
          resolvedTickets.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <div className="text-5xl mb-4">✅</div>
              <p className="font-semibold">No resolved tickets yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {resolvedTickets.map(t => (
                <div key={t.id} className="bg-white rounded-2xl shadow-sm border border-teal-50 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">resolved</span>
                      <span className="text-xs text-gray-400">{new Date(t.created_at).toLocaleDateString()}</span>
                    </div>
                    <button onClick={() => setThreadTicket(t)}
                      className="px-3 py-1.5 bg-teal-50 text-teal-700 rounded-lg text-xs font-bold border-0 cursor-pointer hover:bg-teal-100">
                      💬 View Thread
                    </button>
                  </div>
                  <p className="font-bold text-gray-800 mb-1">🐾 {t.animal_name} — adopted by {t.adopter}</p>
                  <p className="text-gray-500 text-sm mb-3">{t.issue}</p>
                  {t.resolution_note && (
                    <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-3">
                      <p className="text-xs font-black text-green-600 uppercase tracking-widest mb-1">Resolution Note</p>
                      <p className="text-gray-700 text-sm">{t.resolution_note}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        )}

        {/* Animals Tab */}
        {tab === 'animals' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {animals.map(a => (
              <div key={a.id} className="bg-white rounded-2xl shadow-sm border border-teal-50 overflow-hidden">
                <img src={a.image} alt={a.name} className="w-full h-40 object-cover" />
                <div className="p-4">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-black text-gray-800">{a.name}</p>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${animalStatusBadge(a.status)}`}>{a.status}</span>
                  </div>
                  <p className="text-gray-500 text-sm">{a.species} · {a.breed} · {a.age}yr</p>
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {a.vaccinated   && <span className="px-2 py-0.5 bg-teal-50 text-teal-600 rounded-full text-xs font-semibold">💉 Vaccinated</span>}
                    {a.neutered     && <span className="px-2 py-0.5 bg-teal-50 text-teal-600 rounded-full text-xs font-semibold">✂️ Neutered</span>}
                    {a.microchipped && <span className="px-2 py-0.5 bg-teal-50 text-teal-600 rounded-full text-xs font-semibold">📡 Chipped</span>}
                  </div>
                  <button onClick={() => setRecordsAnimal(a)}
                    className="w-full mt-3 px-3 py-2 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-xl text-xs font-bold border-0 cursor-pointer transition-all">
                    🩺 Medical Records
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ticket Thread */}
      {threadTicket && (
        <TicketThread
          ticket={threadTicket}
          senderId={userId()}
          senderRole="vet"
          onClose={() => { setThreadTicket(null); loadTickets(); }}
        />
      )}

      {/* Medical Records */}
      {recordsAnimal && (
        <MedicalRecordsPanel
          animal={recordsAnimal}
          onClose={() => setRecordsAnimal(null)}
        />
      )}

      {/* Resolve Modal */}
      {resolveTicket && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 animate-scale-in">
            <h2 className="text-xl font-black text-gray-900 mb-1">Resolve Ticket</h2>
            <p className="text-gray-500 text-sm mb-5">
              🐾 {resolveTicket.animal_name} — {resolveTicket.adopter}
            </p>

            <div className="bg-gray-50 rounded-xl p-4 mb-5">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Issue</p>
              <p className="text-gray-700 text-sm">{resolveTicket.issue}</p>
            </div>

            <div className="mb-5">
              <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">
                Resolution Note <span className="text-coral-500">*</span>
              </label>
              <textarea
                value={resolveNote}
                onChange={e => setResolveNote(e.target.value)}
                placeholder="Describe what was done to resolve this issue..."
                rows={4}
                className="input-field resize-none"
              />
              {!resolveNote.trim() && (
                <p className="text-xs text-coral-500 mt-1">A resolution note is required</p>
              )}
            </div>

            <div className="flex gap-3">
              <button onClick={handleResolve} disabled={resolving || !resolveNote.trim()}
                className={`flex-1 py-3 rounded-xl font-bold border-0 cursor-pointer transition-all
                  ${resolving || !resolveNote.trim()
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-green-500 hover:bg-green-600 text-white'}`}>
                {resolving ? '⏳ Resolving...' : '✅ Mark as Resolved'}
              </button>
              <button onClick={() => setResolveTicket(null)}
                className="flex-1 py-3 rounded-xl font-bold border border-gray-200 text-gray-600 bg-transparent cursor-pointer hover:bg-gray-50">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
