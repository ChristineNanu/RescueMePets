import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../constants';
import { apiFetch } from '../api';

// Status colors (funnel): pending=warning, approved=good, rejected=critical
const STATUS_COLORS = { pending: '#e8a510', approved: '#0d9488', rejected: '#f03a28' };
// Fixed categorical order for center comparison — validated for CVD separation
const CENTER_COLORS = ['#0d9488', '#f03a28', '#e8a510', '#4f46e5'];

function StatTile({ icon, label, value, sub }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-teal-50">
      <div className="text-2xl mb-2">{icon}</div>
      <p className="text-2xl font-black text-gray-800">{value}</p>
      <p className="text-sm font-bold text-gray-600">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function HBar({ label, value, max, color, valueLabel }) {
  const pct = max > 0 ? Math.max((value / max) * 100, value > 0 ? 3 : 0) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-bold text-gray-600 w-28 flex-shrink-0 truncate">{label}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-3" title={`${label}: ${valueLabel ?? value}`}>
        <div className="h-3 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="text-xs font-black text-gray-700 w-10 text-right flex-shrink-0">{valueLabel ?? value}</span>
    </div>
  );
}

export default function AnalyticsDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    apiFetch(`${API_BASE_URL}/admin/analytics`)
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-12 text-teal-600 font-semibold">Loading analytics...</div>;
  if (error || !data) return <div className="text-center py-12 text-gray-400">Failed to load analytics</div>;

  const { funnel, avg_decision_hours, most_favorited, revenue, adoptions_by_center, monthly_trend } = data;
  const maxFunnel = Math.max(funnel.pending, funnel.approved, funnel.rejected, 1);
  const maxCenter = Math.max(...adoptions_by_center.map(c => c.adoptions), 1);
  const maxMonth = Math.max(...monthly_trend.map(m => m.applications), 1);
  const maxFav = Math.max(...most_favorited.map(f => f.favorite_count), 1);

  return (
    <div className="space-y-6">
      {/* Stat tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatTile icon="📋" label="Total Applications" value={funnel.total_applications} />
        <StatTile icon="✅" label="Approval Rate"
          value={funnel.approval_rate != null ? `${funnel.approval_rate}%` : '—'}
          sub={`${funnel.approved} approved · ${funnel.rejected} rejected`} />
        <StatTile icon="⏱️" label="Avg Decision Time" value={avg_decision_hours != null ? `${avg_decision_hours}h` : '—'} />
        <StatTile icon="💰" label="Adoption Fee Revenue" value={`KES ${revenue.adoption_fees_kes.toLocaleString()}`}
          sub={`${revenue.adoption_fee_payment_count} payment${revenue.adoption_fee_payment_count === 1 ? '' : 's'}`} />
        <StatTile icon="🐣" label="Currently Fostering" value={funnel.currently_fostering} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Funnel */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-teal-50">
          <p className="text-sm font-black text-gray-800 mb-4">Application Funnel</p>
          <div className="space-y-3">
            <HBar label="🟡 Pending" value={funnel.pending} max={maxFunnel} color={STATUS_COLORS.pending} />
            <HBar label="🟢 Approved" value={funnel.approved} max={maxFunnel} color={STATUS_COLORS.approved} />
            <HBar label="🔴 Rejected" value={funnel.rejected} max={maxFunnel} color={STATUS_COLORS.rejected} />
          </div>
        </div>

        {/* Adoptions by center */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-teal-50">
          <p className="text-sm font-black text-gray-800 mb-4">Adoptions by Center</p>
          {adoptions_by_center.length === 0 ? (
            <p className="text-sm text-gray-400">No centers yet</p>
          ) : (
            <div className="space-y-3">
              {adoptions_by_center.map((c, i) => (
                <HBar key={c.center_id} label={c.name} value={c.adoptions} max={maxCenter}
                  color={CENTER_COLORS[i % CENTER_COLORS.length]} />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most favorited */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-teal-50">
          <p className="text-sm font-black text-gray-800 mb-4">Most Favorited Animals</p>
          {most_favorited.length === 0 ? (
            <p className="text-sm text-gray-400">No favorites yet</p>
          ) : (
            <div className="space-y-3">
              {most_favorited.map(f => (
                <div key={f.id} className="flex items-center gap-3">
                  <img src={f.image} alt={f.name} className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                    onError={e => e.target.style.visibility = 'hidden'} />
                  <span className="text-xs font-bold text-gray-600 w-20 flex-shrink-0 truncate">{f.name}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-3" title={`${f.name}: ${f.favorite_count} favorites`}>
                    <div className="h-3 rounded-full bg-teal-600 transition-all" style={{ width: `${Math.max((f.favorite_count / maxFav) * 100, 3)}%` }} />
                  </div>
                  <span className="text-xs font-black text-gray-700 w-8 text-right flex-shrink-0">❤️{f.favorite_count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Monthly trend */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-teal-50">
          <p className="text-sm font-black text-gray-800 mb-4">Applications — Last 6 Months</p>
          <div className="flex items-end justify-between gap-2" style={{ height: '110px' }}>
            {monthly_trend.map(m => (
              <div key={m.month} className="flex-1 flex flex-col items-center justify-end gap-1 h-full" title={`${m.month}: ${m.applications} applications`}>
                <span className="text-xs font-black text-gray-600">{m.applications}</span>
                <div className="w-full max-w-[28px] bg-teal-600 rounded-t-md transition-all"
                  style={{ height: `${Math.max((m.applications / maxMonth) * 70, m.applications > 0 ? 6 : 2)}px` }} />
                <span className="text-[10px] text-gray-400">{m.month.slice(5)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
