import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../constants';
import { apiFetch } from '../api';

export default function FosterJournal({ adoption, onClose, onFinalized }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [note, setNote] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [finalized, setFinalized] = useState(!!adoption.foster_finalized_at);
  const [error, setError] = useState('');

  const load = () => {
    apiFetch(`${API_BASE_URL}/adoptions/${adoption.id}/journal`)
      .then(r => r.ok ? r.json() : [])
      .then(d => { if (Array.isArray(d)) setEntries(d); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [adoption.id]); // eslint-disable-line

  const submit = async (e) => {
    e.preventDefault();
    if (!note.trim()) return;
    setSaving(true);
    setError('');
    const res = await apiFetch(`${API_BASE_URL}/adoptions/${adoption.id}/journal`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note: note.trim(), photo_url: photoUrl.trim() }),
    }).catch(() => null);
    setSaving(false);
    if (res && res.ok) {
      setNote(''); setPhotoUrl(''); setShowForm(false);
      load();
    } else {
      const body = res ? await res.json().catch(() => ({})) : {};
      setError(body.detail || 'Failed to add entry');
    }
  };

  const finalize = async () => {
    if (!window.confirm(`Finalize this into a full adoption of ${adoption.animal_name}? This confirms you're keeping them permanently.`)) return;
    setFinalizing(true);
    const res = await apiFetch(`${API_BASE_URL}/adoptions/${adoption.id}/finalize-foster`, { method: 'POST' }).catch(() => null);
    setFinalizing(false);
    if (res && res.ok) {
      setFinalized(true);
      onFinalized && onFinalized();
    } else {
      const body = res ? await res.json().catch(() => ({})) : {};
      setError(body.detail || 'Failed to finalize');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg flex flex-col" style={{ height: '85vh' }}>

        {/* Header */}
        <div className="bg-gradient-to-r from-cream-500 to-cream-400 rounded-t-3xl px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div>
            <p className="text-white font-black text-base">🐣 {adoption.animal_name}'s Foster Journal</p>
            <p className="text-cream-50 text-xs mt-0.5">{finalized ? 'Finalized as a full adoption' : 'Trial period in progress'}</p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center
              text-white font-bold border-0 cursor-pointer transition-all text-sm">
            ✕
          </button>
        </div>

        {/* Add entry form */}
        {showForm && (
          <form onSubmit={submit} className="px-5 py-4 border-b border-gray-100 space-y-3 flex-shrink-0 bg-cream-50/40">
            <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="How's it going? e.g. Settled in well, still a bit shy around loud noises..."
              rows={3} required className="input-field text-sm resize-none" />
            <input type="text" value={photoUrl} onChange={e => setPhotoUrl(e.target.value)}
              placeholder="Photo URL (optional)" className="input-field text-sm" />
            {error && <p className="text-xs text-coral-600 font-semibold">{error}</p>}
            <div className="flex gap-2">
              <button type="submit" disabled={saving || !note.trim()}
                className="btn-primary px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                {saving ? 'Saving...' : 'Add Entry'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setError(''); }}
                className="px-4 py-2 text-sm font-bold text-gray-500 bg-white border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50">
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Timeline */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {loading && <p className="text-center text-gray-400 text-sm py-10">Loading journal...</p>}
          {!loading && entries.length === 0 && (
            <div className="text-center py-10 text-gray-400">
              <p className="text-3xl mb-2">🐣</p>
              <p className="text-sm font-semibold">No journal entries yet</p>
              <p className="text-xs mt-1">Log how the trial period is going</p>
            </div>
          )}
          <div className="space-y-3">
            {entries.map(e => (
              <div key={e.id} className="bg-gray-50 rounded-2xl px-4 py-3 border border-gray-100">
                <p className="text-xs text-gray-400 mb-1">{new Date(e.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                <p className="text-sm text-gray-700">{e.note}</p>
                {e.photo_url && (
                  <img src={e.photo_url} alt="" className="mt-2 rounded-xl max-h-40 object-cover"
                    onError={ev => ev.target.style.display = 'none'} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer actions */}
        {!finalized && (
          <div className="px-5 py-4 border-t border-gray-100 flex-shrink-0 space-y-2">
            {!showForm && (
              <button onClick={() => setShowForm(true)} className="w-full btn-primary py-3 text-sm">
                + Add Journal Entry
              </button>
            )}
            <button onClick={finalize} disabled={finalizing}
              className="w-full py-3 text-sm font-bold text-teal-700 bg-teal-50 border border-teal-200 rounded-2xl cursor-pointer hover:bg-teal-100 transition-all disabled:opacity-50">
              {finalizing ? 'Finalizing...' : `✅ Finalize Adoption of ${adoption.animal_name}`}
            </button>
          </div>
        )}
        {finalized && (
          <div className="px-5 py-4 border-t border-gray-100 flex-shrink-0">
            <p className="text-center text-sm font-bold text-teal-600">🎉 {adoption.animal_name} is officially yours!</p>
          </div>
        )}
      </div>
    </div>
  );
}
