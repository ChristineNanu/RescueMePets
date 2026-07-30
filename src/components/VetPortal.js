import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../constants';

const userId = () => parseInt(localStorage.getItem('user_id'));

export default function VetPortal({ onLogout }) {
  const [tab, setTab] = useState('tickets');
  const [profile, setProfile] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = userId();
    if (!id || isNaN(id)) { setLoading(false); return; }
    Promise.all([
      fetch(`${API_BASE_URL}/vet/profile?user_id=${id}`).then(r => r.json()).catch(() => null),
      fetch(`${API_BASE_URL}/vet/tickets?user_id=${id}`).then(r => r.json()).catch(() => []),
      fetch(`${API_BASE_URL}/vet/center-animals?user_id=${id}`).then(r => r.json()).catch(() => []),
    ]).then(([p, t, a]) => {
      setProfile(p);
      setTickets(Array.isArray(t) ? t : []);
      setAnimals(Array.isArray(a) ? a : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const updateTicket = async (ticketId, status) => {
    await fetch(`${API_BASE_URL}/support/${ticketId}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    const id = userId();
    fetch(`${API_BASE_URL}/vet/tickets?user_id=${id}`).then(r => r.json()).then(t => setTickets(Array.isArray(t) ? t : []));
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

  if (loading) return <div className="min-h-screen page-bg flex items-center justify-center text-teal-600 font-semibold">Loading...</div>;

  return (
    <div className="min-h-screen page-bg">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-700 to-teal-600 text-white px-6 py-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-teal-300 text-sm font-semibold mb-1">🏥 Vet Portal</p>
            <h1 className="text-3xl font-black">{profile?.name || 'Welcome'}</h1>
            <p className="text-teal-200 text-sm mt-1">{profile?.specialization} · {profile?.clinic} · {profile?.center_name}</p>
          </div>
          <button onClick={onLogout}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-semibold border-0 cursor-pointer transition-all">
            Sign Out
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-2xl p-1 shadow-sm border border-teal-100 mb-6 w-fit">
          {[
            { key: 'tickets', label: `📋 My Tickets (${tickets.length})` },
            { key: 'animals', label: `🐾 Center Animals (${animals.length})` },
          ].map(({ key, label }) => (
            <button key={key} onClick={() => setTab(key)}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all border-0 cursor-pointer
                ${tab === key ? 'bg-teal-600 text-white shadow-sm' : 'text-gray-500 bg-transparent hover:text-teal-700'}`}>
              {label}
            </button>
          ))}
        </div>

        {/* Tickets Tab */}
        {tab === 'tickets' && (
          tickets.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <div className="text-5xl mb-4">📋</div>
              <p className="font-semibold">No tickets assigned to you yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tickets.map(t => (
                <div key={t.id} className="bg-white rounded-2xl shadow-sm border border-teal-50 p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${statusBadge(t.status)}`}>{t.status.replace('_', ' ')}</span>
                        <span className="text-xs text-gray-400">{new Date(t.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="font-bold text-gray-800 mb-1">🐾 {t.animal_name} — adopted by {t.adopter}</p>
                      <p className="text-gray-600 text-sm">{t.issue}</p>
                    </div>
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      {t.status === 'open' && (
                        <button onClick={() => updateTicket(t.id, 'in_progress')}
                          className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold border-0 cursor-pointer hover:bg-blue-100">
                          Start
                        </button>
                      )}
                      {t.status === 'in_progress' && (
                        <button onClick={() => updateTicket(t.id, 'resolved')}
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
                    {a.vaccinated    && <span className="px-2 py-0.5 bg-teal-50 text-teal-600 rounded-full text-xs font-semibold">💉 Vaccinated</span>}
                    {a.neutered      && <span className="px-2 py-0.5 bg-teal-50 text-teal-600 rounded-full text-xs font-semibold">✂️ Neutered</span>}
                    {a.microchipped  && <span className="px-2 py-0.5 bg-teal-50 text-teal-600 rounded-full text-xs font-semibold">📡 Chipped</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
