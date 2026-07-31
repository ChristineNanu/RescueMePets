import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../constants';
import { apiFetch } from '../api';

const TYPE_META = {
  vaccination: { icon: '💉', label: 'Vaccination', badge: 'bg-teal-100 text-teal-700' },
  treatment:   { icon: '🩹', label: 'Treatment',   badge: 'bg-coral-100 text-coral-700' },
  checkup:     { icon: '🩺', label: 'Checkup',     badge: 'bg-teal-100 text-teal-700' },
  medication:  { icon: '💊', label: 'Medication',  badge: 'bg-coral-100 text-coral-700' },
  weight:      { icon: '⚖️', label: 'Weight Log',  badge: 'bg-teal-100 text-teal-700' },
};

const todayISO = () => new Date().toISOString().slice(0, 10);

export default function MedicalRecordsPanel({ animal, onClose }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [form, setForm] = useState({
    record_type: 'checkup', title: '', description: '', weight_kg: '', date: todayISO(),
  });

  const load = () => {
    apiFetch(`${API_BASE_URL}/animals/${animal.id}/medical-records`)
      .then(r => r.ok ? r.json() : [])
      .then(d => { if (Array.isArray(d)) setRecords(d); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [animal.id]); // eslint-disable-line

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    const body = {
      animal_id: animal.id,
      record_type: form.record_type,
      title: form.title.trim(),
      description: form.description.trim(),
      weight_kg: form.weight_kg ? parseFloat(form.weight_kg) : null,
      date: form.date,
    };
    const res = await apiFetch(`${API_BASE_URL}/animals/${animal.id}/medical-records`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).catch(() => null);
    setSaving(false);
    if (res && res.ok) {
      setForm({ record_type: 'checkup', title: '', description: '', weight_kg: '', date: todayISO() });
      setShowForm(false);
      load();
    }
  };

  const remove = async (recordId) => {
    if (!window.confirm('Delete this record?')) return;
    await apiFetch(`${API_BASE_URL}/medical-records/${recordId}`, { method: 'DELETE' }).catch(() => {});
    setRecords(rs => rs.filter(r => r.id !== recordId));
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg flex flex-col" style={{ height: '85vh' }}>

        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-500 rounded-t-3xl px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div>
            <p className="text-white font-black text-base">🩺 {animal.name}'s Medical Record</p>
            <p className="text-teal-200 text-xs mt-0.5">{animal.species} · {animal.breed}</p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center
              text-white font-bold border-0 cursor-pointer transition-all text-sm">
            ✕
          </button>
        </div>

        {/* Add record form */}
        {showForm && (
          <form onSubmit={submit} className="px-5 py-4 border-b border-gray-100 space-y-3 flex-shrink-0 bg-teal-50/40">
            <div className="grid grid-cols-2 gap-3">
              <select value={form.record_type} onChange={set('record_type')} className="input-field text-sm">
                {Object.entries(TYPE_META).map(([k, m]) => (
                  <option key={k} value={k}>{m.icon} {m.label}</option>
                ))}
              </select>
              <input type="date" value={form.date} onChange={set('date')} required className="input-field text-sm" />
            </div>
            <input type="text" value={form.title} onChange={set('title')} placeholder="Title, e.g. Rabies booster"
              required className="input-field text-sm" />
            <textarea value={form.description} onChange={set('description')} placeholder="Notes (optional)"
              rows={2} className="input-field text-sm resize-none" />
            {form.record_type === 'weight' && (
              <input type="number" step="0.1" value={form.weight_kg} onChange={set('weight_kg')}
                placeholder="Weight (kg)" className="input-field text-sm w-32" />
            )}
            <div className="flex gap-2">
              <button type="submit" disabled={saving || !form.title.trim()}
                className="btn-primary px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                {saving ? 'Saving...' : 'Save Record'}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="px-4 py-2 text-sm font-bold text-gray-500 bg-white border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50">
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Timeline */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {loading && <p className="text-center text-gray-400 text-sm py-10">Loading records...</p>}
          {!loading && records.length === 0 && (
            <div className="text-center py-10 text-gray-400">
              <p className="text-3xl mb-2">🩺</p>
              <p className="text-sm font-semibold">No medical records yet</p>
              <p className="text-xs mt-1">Add the first one below</p>
            </div>
          )}
          <div className="space-y-3">
            {records.map(r => {
              const meta = TYPE_META[r.record_type] || { icon: '📋', label: r.record_type, badge: 'bg-gray-100 text-gray-600' };
              return (
                <div key={r.id} className="bg-gray-50 rounded-2xl px-4 py-3 border border-gray-100">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${meta.badge}`}>
                          {meta.icon} {meta.label}
                        </span>
                        <span className="text-xs text-gray-400">{new Date(r.date).toLocaleDateString()}</span>
                      </div>
                      <p className="font-bold text-gray-800 text-sm">{r.title}</p>
                      {r.description && <p className="text-gray-500 text-xs mt-0.5">{r.description}</p>}
                      {r.weight_kg != null && <p className="text-gray-500 text-xs mt-0.5">Weight: {r.weight_kg} kg</p>}
                      {r.vet_name && <p className="text-gray-400 text-xs mt-1">Logged by {r.vet_name}</p>}
                    </div>
                    <button onClick={() => remove(r.id)}
                      className="text-gray-300 hover:text-coral-500 border-0 bg-transparent cursor-pointer text-sm flex-shrink-0">
                      ✕
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer action */}
        {!showForm && (
          <div className="px-5 py-4 border-t border-gray-100 flex-shrink-0">
            <button onClick={() => setShowForm(true)}
              className="w-full btn-primary py-3 text-sm">
              + Add Medical Record
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
