import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../constants';
import { apiFetch } from '../api';
import SQLInterface from './SQLInterface';
import AnalyticsDashboard from './AnalyticsDashboard';
import ComplianceReports from './ComplianceReports';

const adminId = () => parseInt(localStorage.getItem('user_id'));

export default function AdminDashboard({ onLogout }) {
  const [tab, setTab] = useState('animals');
  const [animals, setAnimals] = useState([]);
  const [centers, setCenters] = useState([]);
  const [applications, setApplications] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editAnimal, setEditAnimal] = useState(null);
  const [form, setForm] = useState({
    name: '', species: 'Dog', breed: '', age: 1, description: '', image: '',
    center_id: '', status: 'available', vaccinated: false, neutered: false,
    microchipped: false, good_with_kids: false, good_with_pets: false,
    energy_level: 'medium', tags: '', personality_badges: '',
  });

  const load = async () => {
    setLoading(true);
    const id = adminId();
    const [a, c, apps, u] = await Promise.all([
      apiFetch(`${API_BASE_URL}/animals`).then(r => r.json()),
      apiFetch(`${API_BASE_URL}/centers`).then(r => r.json()),
      apiFetch(`${API_BASE_URL}/admin/applications?admin_id=${id}`).then(r => r.json()),
      apiFetch(`${API_BASE_URL}/admin/users?admin_id=${id}`).then(r => r.json()),
    ]);
    setAnimals(a); setCenters(c); setApplications(apps); setUsers(u);
    setLoading(false);
  };

  useEffect(() => { load(); }, []); // eslint-disable-line

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const openAdd = () => {
    setEditAnimal(null);
    setForm({ name: '', species: 'Dog', breed: '', age: 1, description: '', image: '', center_id: centers[0]?.id || '', status: 'available', vaccinated: false, neutered: false, microchipped: false, good_with_kids: false, good_with_pets: false, energy_level: 'medium', tags: '', personality_badges: '' });
    setShowForm(true);
  };

  const openEdit = (a) => {
    setEditAnimal(a);
    setForm({ name: a.name, species: a.species, breed: a.breed, age: a.age, description: a.description, image: a.image, center_id: a.center_id, status: a.status, vaccinated: a.vaccinated, neutered: a.neutered, microchipped: a.microchipped, good_with_kids: a.good_with_kids, good_with_pets: a.good_with_pets, energy_level: a.energy_level, tags: a.tags?.join(',') || '', personality_badges: a.personality_badges?.join(',') || '' });
    setShowForm(true);
  };

  const saveAnimal = async () => {
    const id = adminId();
    const payload = { ...form, age: parseInt(form.age), center_id: parseInt(form.center_id) };
    const url = editAnimal ? `${API_BASE_URL}/animals/${editAnimal.id}?admin_id=${id}` : `${API_BASE_URL}/animals?admin_id=${id}`;
    const method = editAnimal ? 'PUT' : 'POST';
    await apiFetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    setShowForm(false); load();
  };

  const deleteAnimal = async (animalId) => {
    if (!window.confirm('Delete this animal?')) return;
    await apiFetch(`${API_BASE_URL}/animals/${animalId}?admin_id=${adminId()}`, { method: 'DELETE' });
    load();
  };

  const updateStatus = async (adoptionId, status) => {
    await apiFetch(`${API_BASE_URL}/applications/${adoptionId}/status?admin_id=${adminId()}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    load();
  };

  const TABS = [
    { key: 'animals',      label: '🐾 Animals'      },
    { key: 'applications', label: '📋 Applications' },
    { key: 'users',        label: '👥 Users'         },
    { key: 'analytics',    label: '📊 Analytics'     },
    { key: 'reports',      label: '📄 Reports'       },
    { key: 'sql',          label: '🗄️ SQL'           },
  ];

  const statusBadge = (s) => ({
    available: 'bg-teal-100 text-teal-700',
    pending:   'bg-yellow-100 text-yellow-700',
    adopted:   'bg-gray-100 text-gray-500',
    approved:  'bg-green-100 text-green-700',
    rejected:  'bg-red-100 text-red-600',
  }[s] || 'bg-gray-100 text-gray-500');

  return (
    <div className="min-h-screen page-bg print:bg-white print:min-h-0">
      {/* Header */}
      <div className="print:hidden bg-gradient-to-r from-teal-700 to-teal-600 text-white px-6 py-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black">Admin Dashboard</h1>
            <p className="text-teal-200 text-sm mt-1">Manage animals, applications, and users</p>
          </div>
          <button onClick={onLogout}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-semibold border-0 cursor-pointer transition-all">
            Sign Out
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 print:p-0 print:max-w-none">
        {/* Tabs */}
        <div className="print:hidden flex gap-1 bg-white rounded-2xl p-1 shadow-sm border border-teal-100 mb-6 w-fit">
          {TABS.map(({ key, label }) => (
            <button key={key} onClick={() => setTab(key)}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all border-0 cursor-pointer
                ${tab === key ? 'bg-teal-600 text-white shadow-sm' : 'text-gray-500 bg-transparent hover:text-teal-700'}`}>
              {label}
            </button>
          ))}
        </div>

        {loading && <div className="text-center py-12 text-teal-600 font-semibold">Loading...</div>}

        {/* Animals Tab */}
        {!loading && tab === 'animals' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-gray-600 font-semibold">{animals.length} animals total</p>
              <button onClick={openAdd} className="btn-primary px-5 py-2.5 rounded-xl text-sm font-bold border-0 cursor-pointer">
                + Add Animal
              </button>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-teal-50 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-teal-50 text-teal-700">
                  <tr>{['Name', 'Species', 'Breed', 'Center', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-black text-xs uppercase tracking-wider">{h}</th>
                  ))}</tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {animals.map(a => (
                    <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-gray-800">{a.name}</td>
                      <td className="px-4 py-3 text-gray-600">{a.species}</td>
                      <td className="px-4 py-3 text-gray-600">{a.breed}</td>
                      <td className="px-4 py-3 text-gray-600">{a.center?.name || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${statusBadge(a.status)}`}>{a.status}</span>
                      </td>
                      <td className="px-4 py-3 flex gap-2">
                        <button onClick={() => openEdit(a)} className="px-3 py-1 bg-teal-50 text-teal-700 rounded-lg text-xs font-bold border-0 cursor-pointer hover:bg-teal-100">Edit</button>
                        <button onClick={() => deleteAnimal(a.id)} className="px-3 py-1 bg-red-50 text-red-600 rounded-lg text-xs font-bold border-0 cursor-pointer hover:bg-red-100">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Applications Tab */}
        {!loading && tab === 'applications' && (
          <div className="bg-white rounded-2xl shadow-sm border border-teal-50 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-teal-50 text-teal-700">
                <tr>{['Adopter', 'Animal', 'Message', 'Status', 'Date', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-black text-xs uppercase tracking-wider">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {applications.map(a => (
                  <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-gray-800">{a.username}</td>
                    <td className="px-4 py-3 text-gray-600">{a.animal_name}</td>
                    <td className="px-4 py-3 text-gray-500 max-w-xs truncate">{a.message}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${statusBadge(a.status)}`}>{a.status}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{new Date(a.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3 flex gap-2">
                      {a.status === 'pending' && (
                        <>
                          <button onClick={() => updateStatus(a.id, 'approved')} className="px-3 py-1 bg-green-50 text-green-700 rounded-lg text-xs font-bold border-0 cursor-pointer hover:bg-green-100">Approve</button>
                          <button onClick={() => updateStatus(a.id, 'rejected')} className="px-3 py-1 bg-red-50 text-red-600 rounded-lg text-xs font-bold border-0 cursor-pointer hover:bg-red-100">Reject</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Users Tab */}
        {!loading && tab === 'users' && (
          <div className="bg-white rounded-2xl shadow-sm border border-teal-50 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-teal-50 text-teal-700">
                <tr>{['ID', 'Username', 'Email', 'Role'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-black text-xs uppercase tracking-wider">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-500">{u.id}</td>
                    <td className="px-4 py-3 font-semibold text-gray-800">{u.username}</td>
                    <td className="px-4 py-3 text-gray-600">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        u.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                        u.role === 'vet'   ? 'bg-teal-100 text-teal-700' :
                        'bg-gray-100 text-gray-600'}`}>{u.role}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Analytics Tab */}
        {!loading && tab === 'analytics' && <AnalyticsDashboard />}

        {/* Reports Tab */}
        {!loading && tab === 'reports' && <ComplianceReports />}

        {/* SQL Tab */}
        {tab === 'sql' && <SQLInterface />}
      </div>

      {/* Animal Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8">
            <h2 className="text-2xl font-black text-gray-900 mb-6">{editAnimal ? 'Edit Animal' : 'Add Animal'}</h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { k: 'name',        label: 'Name',        type: 'text'   },
                { k: 'breed',       label: 'Breed',       type: 'text'   },
                { k: 'age',         label: 'Age (years)', type: 'number' },
                { k: 'image',       label: 'Image URL',   type: 'text'   },
              ].map(({ k, label, type }) => (
                <div key={k}>
                  <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1">{label}</label>
                  <input type={type} value={form[k]} onChange={set(k)} className="input-field" />
                </div>
              ))}

              <div>
                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1">Species</label>
                <select value={form.species} onChange={set('species')} className="input-field">
                  {['Dog', 'Cat', 'Rabbit', 'Bird'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1">Status</label>
                <select value={form.status} onChange={set('status')} className="input-field">
                  {['available', 'pending', 'adopted'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1">Energy Level</label>
                <select value={form.energy_level} onChange={set('energy_level')} className="input-field">
                  {['low', 'medium', 'high'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1">Center</label>
                <select value={form.center_id} onChange={set('center_id')} className="input-field">
                  {centers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1">Description</label>
                <textarea value={form.description} onChange={set('description')} rows={3} className="input-field resize-none" />
              </div>

              <div className="col-span-2 flex flex-wrap gap-4">
                {[
                  { k: 'vaccinated',    label: 'Vaccinated'    },
                  { k: 'neutered',      label: 'Neutered'      },
                  { k: 'microchipped',  label: 'Microchipped'  },
                  { k: 'good_with_kids', label: 'Good w/ Kids' },
                  { k: 'good_with_pets', label: 'Good w/ Pets' },
                ].map(({ k, label }) => (
                  <label key={k} className="flex items-center gap-2 text-sm font-semibold text-gray-700 cursor-pointer">
                    <input type="checkbox" checked={form[k]} onChange={set(k)} className="w-4 h-4 accent-teal-600" />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={saveAnimal} className="btn-primary flex-1 py-3 rounded-xl font-bold border-0 cursor-pointer">
                {editAnimal ? 'Save Changes' : 'Add Animal'}
              </button>
              <button onClick={() => setShowForm(false)} className="flex-1 py-3 rounded-xl font-bold border border-gray-200 text-gray-600 bg-transparent cursor-pointer hover:bg-gray-50">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
