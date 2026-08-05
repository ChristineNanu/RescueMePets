import React, { useState } from 'react';
import { API_BASE_URL } from '../constants';
import { apiFetch } from '../api';

// Format using LOCAL date parts, not toISOString() (which converts to UTC
// and can shift the calendar date by a day depending on the browser's
// timezone offset — e.g. "This Year" showing Dec 31 instead of Jan 1).
const dateStr = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const todayStr = () => dateStr(new Date());

const PRESETS = {
  'This Month': () => { const d = new Date(); return [dateStr(new Date(d.getFullYear(), d.getMonth(), 1)), todayStr()]; },
  'This Quarter': () => { const d = new Date(); const q = Math.floor(d.getMonth() / 3); return [dateStr(new Date(d.getFullYear(), q * 3, 1)), todayStr()]; },
  'This Year': () => { const d = new Date(); return [dateStr(new Date(d.getFullYear(), 0, 1)), todayStr()]; },
  'All Time': () => ['2020-01-01', todayStr()],
};

const ACTION_LABELS = {
  approved_application: 'Applications approved',
  rejected_application: 'Applications rejected',
  delete_animal: 'Animals removed',
  sql_query: 'Raw SQL queries run',
  b2c_payout: 'Payouts issued',
};

function StatTile({ label, value, sub }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-teal-50 print:border-gray-300 print:rounded-none print:shadow-none">
      <p className="text-2xl font-black text-gray-800">{value}</p>
      <p className="text-sm font-bold text-gray-600">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

export default function ComplianceReports() {
  const [startDate, setStartDate] = useState(PRESETS['This Year']()[0]);
  const [endDate, setEndDate] = useState(todayStr());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState('');

  const generate = async () => {
    setLoading(true);
    setError('');
    const res = await apiFetch(`${API_BASE_URL}/admin/reports/summary?start_date=${startDate}&end_date=${endDate}`).catch(() => null);
    if (res && res.ok) {
      setData(await res.json());
    } else {
      const body = res ? await res.json().catch(() => ({})) : {};
      setError(body.detail || 'Failed to generate report');
      setData(null);
    }
    setLoading(false);
  };

  const applyPreset = (label) => {
    const [s, e] = PRESETS[label]();
    setStartDate(s);
    setEndDate(e);
  };

  const downloadCsv = async (dataset) => {
    setDownloading(dataset);
    const res = await apiFetch(`${API_BASE_URL}/admin/reports/export.csv?start_date=${startDate}&end_date=${endDate}&dataset=${dataset}`).catch(() => null);
    if (res && res.ok) {
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rescuemepets_${dataset}_${startDate}_to_${endDate}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    }
    setDownloading('');
  };

  return (
    <div className="space-y-6">
      {/* Controls — hidden when printing */}
      <div className="print:hidden bg-white rounded-2xl p-5 border border-teal-50 space-y-4">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1">From</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="input-field text-sm" />
          </div>
          <div>
            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1">To</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="input-field text-sm" />
          </div>
          <button onClick={generate} disabled={loading} className="btn-primary px-5 py-2.5 rounded-xl text-sm font-bold border-0 cursor-pointer disabled:opacity-50">
            {loading ? 'Generating...' : 'Generate Report'}
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {Object.keys(PRESETS).map(label => (
            <button key={label} onClick={() => applyPreset(label)}
              className="text-xs bg-teal-50 text-teal-700 border border-teal-200 px-3 py-1.5 rounded-full hover:bg-teal-100 transition-colors cursor-pointer font-medium">
              {label}
            </button>
          ))}
        </div>
        {error && <p className="text-sm text-coral-600 font-semibold">{error}</p>}
      </div>

      {data && (
        <>
          {/* Export actions — hidden when printing */}
          <div className="print:hidden flex flex-wrap gap-2">
            <button onClick={() => window.print()}
              className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-bold border-0 cursor-pointer">
              🖨️ Print / Save as PDF
            </button>
            {['applications', 'payments'].map(ds => (
              <button key={ds} onClick={() => downloadCsv(ds)} disabled={downloading === ds}
                className="px-4 py-2.5 bg-white border border-teal-200 text-teal-700 rounded-xl text-sm font-bold cursor-pointer hover:bg-teal-50 disabled:opacity-50">
                {downloading === ds ? 'Downloading...' : `⬇️ ${ds[0].toUpperCase() + ds.slice(1)} CSV`}
              </button>
            ))}
          </div>

          {/* Report content — this is what prints */}
          <div className="bg-white rounded-2xl p-6 border border-teal-50 print:border-0 print:rounded-none print:p-0">
            <div className="mb-6">
              <p className="hidden print:block text-2xl font-black text-gray-900 mb-1">🐾 RescueMePets — Compliance & Grant Report</p>
              <p className="text-sm text-gray-500">
                Period: <strong>{data.period.start}</strong> to <strong>{data.period.end}</strong>
                <span className="print:inline hidden"> · Generated {new Date(data.generated_at).toLocaleString()}</span>
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatTile label="Total Applications" value={data.funnel.total_applications} />
              <StatTile label="Approval Rate" value={data.funnel.approval_rate != null ? `${data.funnel.approval_rate}%` : '—'}
                sub={`${data.funnel.approved} approved · ${data.funnel.rejected} rejected · ${data.funnel.pending} pending`} />
              <StatTile label="Adoption Fee Revenue" value={`KES ${data.revenue.adoption_fees_kes.toLocaleString()}`}
                sub={`${data.revenue.payment_count} payment${data.revenue.payment_count === 1 ? '' : 's'}`} />
              <StatTile label="Foster Applications" value={data.funnel.foster_applications} />
            </div>

            <p className="text-sm font-black text-gray-800 mb-2">Adoptions by Center</p>
            <table className="w-full text-sm mb-6 border border-gray-100 print:border-gray-400">
              <thead className="bg-teal-50 print:bg-gray-100">
                <tr>
                  <th className="px-3 py-2 text-left font-bold text-gray-600 border-b border-gray-100 print:border-gray-400">Center</th>
                  <th className="px-3 py-2 text-right font-bold text-gray-600 border-b border-gray-100 print:border-gray-400">Adoptions</th>
                </tr>
              </thead>
              <tbody>
                {data.by_center.map(c => (
                  <tr key={c.center_id} className="border-b border-gray-50 print:border-gray-300">
                    <td className="px-3 py-2 text-gray-700">{c.name}</td>
                    <td className="px-3 py-2 text-right font-bold text-gray-800">{c.adoptions}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <p className="text-sm font-black text-gray-800 mb-2">Administrative Actions on Record</p>
            {Object.keys(data.audit_summary).length === 0 ? (
              <p className="text-sm text-gray-400">No administrative actions logged in this period.</p>
            ) : (
              <table className="w-full text-sm border border-gray-100 print:border-gray-400">
                <tbody>
                  {Object.entries(data.audit_summary).map(([action, count]) => (
                    <tr key={action} className="border-b border-gray-50 print:border-gray-300">
                      <td className="px-3 py-2 text-gray-700">{ACTION_LABELS[action] || action}</td>
                      <td className="px-3 py-2 text-right font-bold text-gray-800">{count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {!data && !loading && (
        <p className="text-center text-gray-400 py-8">Pick a date range and click "Generate Report" to get started.</p>
      )}
    </div>
  );
}
