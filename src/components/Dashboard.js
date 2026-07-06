import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../constants';

function useCountUp(target, delay = 0) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!target) return;
    const t = setTimeout(() => {
      let cur = 0;
      const step = Math.ceil(target / 50);
      const id = setInterval(() => {
        cur += step;
        if (cur >= target) { setN(target); clearInterval(id); }
        else setN(cur);
      }, 20);
      return () => clearInterval(id);
    }, delay);
    return () => clearTimeout(t);
  }, [target, delay]);
  return n;
}

function StatCard({ icon, value, label, sub, color, delay }) {
  const n = useCountUp(value, delay);
  const colors = {
    amber:   { bg: 'bg-white', icon: 'bg-amber-100',   val: 'text-amber-600',   ring: 'ring-gray-100' },
    emerald: { bg: 'bg-white', icon: 'bg-emerald-100', val: 'text-emerald-600', ring: 'ring-gray-100' },
    rose:    { bg: 'bg-white', icon: 'bg-rose-100',    val: 'text-rose-500',    ring: 'ring-gray-100' },
    orange:  { bg: 'bg-white', icon: 'bg-amber-100',   val: 'text-amber-600',   ring: 'ring-gray-100' },
  };
  const c = colors[color];
  return (
    <div className={`${c.bg} rounded-2xl p-5 ring-1 ${c.ring} animate-fade-up hover:-translate-y-1 hover:shadow-lg transition-all duration-300 group`}
      style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 ${c.icon} rounded-xl flex items-center justify-center text-xl
          group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
        <span className={`text-[10px] font-black uppercase tracking-widest ${c.val} opacity-60`}>live</span>
      </div>
      <p className={`text-3xl font-black tabular-nums ${c.val} mb-0.5`}>{n}</p>
      <p className="text-sm font-bold text-gray-700">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

const TIPS = [
  { icon: '🏡', text: 'Visit the center to meet the animal before applying — it makes a huge difference!' },
  { icon: '🛡️', text: 'Prepare your home before adoption day — remove hazards and set up a cozy corner.' },
  { icon: '💬', text: "Ask about the animal's personality and history to find the best match for you." },
  { icon: '🐕', text: "Senior pets are often calmer, already trained, and just as loving!" },
];

export default function Dashboard({ onOpenQuiz }) {
  const [stats, setStats]           = useState({ total_animals: 0, available: 0, adopted: 0, centers: 0 });
  const [animals, setAnimals]       = useState([]);
  const [apps, setApps]             = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [barWidth, setBarWidth]     = useState(0);
  const [tipIdx, setTipIdx]         = useState(0);
  const [tipVisible, setTipVisible] = useState(true);

  const navigate  = useNavigate();
  const username  = localStorage.getItem('username') || 'Friend';
  const userId    = localStorage.getItem('user_id');
  const hour      = new Date().getHours();
  const greeting  = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const greetIcon = hour < 12 ? '☀️' : hour < 17 ? '🌤️' : '🌙';

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE_URL}/stats`).then(r => r.ok ? r.json() : Promise.reject()),
      fetch(`${API_BASE_URL}/animals?user_id=${userId}`).then(r => r.ok ? r.json() : Promise.reject()),
      userId ? fetch(`${API_BASE_URL}/my-applications?user_id=${userId}`).then(r => r.ok ? r.json() : []) : Promise.resolve([]),
    ]).then(([s, a, ap]) => {
      setStats(s);
      setAnimals(a.filter(x => x.status === 'available').slice(0, 4));
      setApps(Array.isArray(ap) ? ap : []);
    }).catch(() => setError('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, [userId]);

  const rate     = stats.total_animals > 0 ? Math.round((stats.adopted / stats.total_animals) * 100) : 0;
  const approved = apps.filter(a => a.status === 'approved').length;
  const feed     = [...apps].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 4);

  useEffect(() => { if (!loading) setTimeout(() => setBarWidth(rate), 300); }, [loading, rate]);

  useEffect(() => {
    const id = setInterval(() => {
      setTipVisible(false);
      setTimeout(() => { setTipIdx(i => (i + 1) % TIPS.length); setTipVisible(true); }, 350);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  const STATUS = {
    pending:  { pill: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',     dot: 'bg-amber-400',   label: 'Pending'  },
    approved: { pill: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200', dot: 'bg-emerald-400', label: 'Approved' },
    rejected: { pill: 'bg-red-50 text-red-500 ring-1 ring-red-200',            dot: 'bg-red-400',     label: 'Rejected' },
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-50 to-amber-50/20">
      <div className="text-center animate-fade-in">
        <div className="text-6xl mb-4 animate-float">🐾</div>
        <p className="text-gray-700 font-bold text-lg">Loading your dashboard...</p>
        <p className="text-gray-400 text-sm mt-1">Fetching the latest pets for you</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-50 to-amber-50/20">
      <div className="card p-12 text-center max-w-sm animate-scale-in">
        <div className="text-5xl mb-4">⚠️</div>
        <p className="text-gray-800 font-bold text-lg mb-5">{error}</p>
        <button onClick={() => window.location.reload()} className="btn-primary px-8 py-3">Try Again</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-amber-50/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* ── Hero Banner ─────────────────────────────────── */}
        <div className="relative bg-gradient-to-r from-amber-500 to-amber-600 rounded-3xl overflow-hidden animate-fade-up">
          {/* dot texture */}
          <div className="absolute inset-0 opacity-[0.07]"
            style={{ backgroundImage: 'radial-gradient(circle, white 1.5px, transparent 1.5px)', backgroundSize: '28px 28px' }} />
          {/* floating pets */}
          <span className="absolute right-8 top-4 text-7xl opacity-20 animate-float select-none" style={{ animationDelay: '0s' }}>🐕</span>
          <span className="absolute right-32 bottom-4 text-5xl opacity-15 animate-float select-none" style={{ animationDelay: '1s' }}>🐈</span>
          <span className="absolute right-56 top-6 text-4xl opacity-10 animate-float select-none" style={{ animationDelay: '2s' }}>🐇</span>

          <div className="relative z-10 p-8 sm:p-10 flex flex-col sm:flex-row sm:items-center gap-8">
            <div className="flex-1">
              <p className="text-white/70 text-sm font-semibold uppercase tracking-widest mb-3">{greetIcon} {greeting}, {username}!</p>
              <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight mb-2">
                Your perfect companion<br />
                <span className="text-white/80">is waiting for you.</span>
              </h1>
              <p className="text-white/70 text-sm font-medium">
                {stats.available} adorable pets available for adoption today.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col gap-2.5 sm:w-52 flex-shrink-0">
              <button onClick={() => navigate('/animals')}
                className="w-full py-3.5 rounded-2xl font-bold text-sm bg-white text-amber-700
                  hover:shadow-xl hover:shadow-white/30 hover:-translate-y-0.5 transition-all duration-200 border-0 cursor-pointer">
                🐾 Browse Animals
              </button>
              <button onClick={() => navigate('/adoption')}
                className="w-full py-3 rounded-2xl font-semibold text-sm text-white/90
                  bg-white/15 backdrop-blur-sm border border-white/25 cursor-pointer
                  hover:bg-white/25 transition-all duration-200">
                📋 Apply to Adopt
              </button>
              <button onClick={onOpenQuiz}
                className="w-full py-3 rounded-2xl font-semibold text-sm text-white/90
                  bg-white/15 backdrop-blur-sm border border-white/25 cursor-pointer
                  hover:bg-white/25 transition-all duration-200">
                ✨ Find My Match
              </button>
            </div>
          </div>
        </div>

        {/* ── Stat Cards ──────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon="🐾" value={stats.total_animals}              label="Total Animals"  sub="In our network"       color="amber"   delay={0}   />
          <StatCard icon="✅" value={stats.available}                  label="Available Now"  sub="Ready to adopt"      color="emerald" delay={80}  />
          <StatCard icon="🏠" value={userId ? approved : stats.adopted} label="Adoptions"     sub={`${rate}% success`}  color="rose"    delay={160} />
          <StatCard icon="🏥" value={stats.centers}                    label="Rescue Centers" sub="Partner locations"   color="orange"  delay={240} />
        </div>

        {/* ── Adoption Rate ────────────────────────────────── */}
        <div className="card p-6 animate-fade-up-2">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="font-bold text-gray-800 text-sm">Network Adoption Rate</p>
              <p className="text-xs text-gray-400 mt-0.5">{stats.adopted} adopted · {stats.available} available · {stats.total_animals} total</p>
            </div>
            <span className="text-2xl font-black text-amber-500">{rate}%</span>
          </div>
          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full relative overflow-hidden"
              style={{ width: `${barWidth}%`, transition: 'width 1.6s cubic-bezier(0.4,0,0.2,1)',
                background: 'linear-gradient(90deg, #fbbf24, #f97316, #ef4444)' }}>
              <div className="absolute inset-0 animate-pulse"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)' }} />
            </div>
          </div>
          <div className="flex justify-between mt-1.5">
            {[0, 25, 50, 75, 100].map(m => (
              <span key={m} className="text-[10px] text-gray-300 font-medium">{m}%</span>
            ))}
          </div>
        </div>

        {/* ── Main Grid ───────────────────────────────────── */}
        <div className="grid lg:grid-cols-3 gap-6">

          {/* Available Animals */}
          <div className="lg:col-span-2 space-y-4 animate-fade-up-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <h2 className="font-black text-gray-900 text-lg">Available Now</h2>
                <span className="badge bg-amber-100 text-amber-700">{stats.available} pets</span>
              </div>
              <button onClick={() => navigate('/animals')}
                className="text-sm font-semibold text-amber-600 hover:text-amber-700 bg-transparent border-0 cursor-pointer group flex items-center gap-1">
                View all <span className="group-hover:translate-x-0.5 transition-transform inline-block">→</span>
              </button>
            </div>

            {animals.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border-2 border-dashed border-amber-100">
                <div className="text-5xl mb-3 animate-float">🐾</div>
                <p className="text-gray-600 font-bold mb-1">No animals available right now</p>
                <p className="text-gray-400 text-xs mb-4">Check back soon — new rescues arrive regularly!</p>
                <button onClick={() => navigate('/animals')} className="btn-primary px-5 py-2 text-sm">
                  Browse all animals →
                </button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {animals.map((a, i) => (
                  <div key={a.id}
                    className="group bg-white rounded-2xl overflow-hidden ring-1 ring-gray-100 shadow-sm
                      hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer"
                    style={{ animationDelay: `${i * 60}ms` }}
                    onClick={() => navigate(`/adoption?animalId=${a.id}`)}>
                    <div className="relative h-48 overflow-hidden">
                      <img src={a.image} alt={a.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={e => e.target.src = 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&q=80'} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                      <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-white/95 text-emerald-600 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Available
                      </div>
                      <div className="absolute top-3 right-3 bg-black/30 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                        {a.species}
                      </div>
                      <div className="absolute bottom-3 left-3 right-3">
                        <p className="text-white font-black text-base leading-tight">{a.name}</p>
                        <p className="text-white/70 text-xs">{a.breed} · {a.age}yr</p>
                      </div>
                    </div>
                    <div className="px-4 py-3 flex items-center justify-between">
                      <p className="text-gray-400 text-xs truncate">📍 {a.center?.name || 'Rescue Center'}</p>
                      <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full
                        group-hover:bg-amber-100 transition-colors whitespace-nowrap ml-2 flex-shrink-0">
                        Adopt →
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-5 animate-fade-up-4">

            {/* Quick Actions */}
            <div className="card p-5">
              <h2 className="font-black text-gray-900 text-base mb-4">Quick Actions</h2>
              <div className="space-y-1.5">
                {[
                  { icon: '🐾', label: 'Browse Animals',  sub: 'Find your match',      to: '/animals',    bar: 'bg-amber-400',   hover: 'hover:bg-amber-50'   },
                  { icon: '🏠', label: 'Explore Centers', sub: 'Visit rescue centers', to: '/centers',    bar: 'bg-emerald-400', hover: 'hover:bg-emerald-50' },
                  { icon: '📋', label: 'Apply to Adopt',  sub: 'Start an application', to: '/adoption',   bar: 'bg-amber-400',   hover: 'hover:bg-amber-50'   },
                  { icon: '❤️', label: 'My Favourites',   sub: 'Saved animals',        to: '/my-profile', bar: 'bg-rose-400',    hover: 'hover:bg-rose-50'    },
                ].map(({ icon, label, sub, to, bar, hover }) => (
                  <button key={to} onClick={() => navigate(to)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl ${hover}
                      transition-all duration-150 cursor-pointer text-left border-0 bg-transparent group`}>
                    <div className={`w-1 h-8 rounded-full ${bar} flex-shrink-0`} />
                    <span className="text-xl w-7 text-center flex-shrink-0">{icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-800">{label}</p>
                      <p className="text-xs text-gray-400">{sub}</p>
                    </div>
                    <span className="text-gray-300 group-hover:text-gray-600 group-hover:translate-x-0.5 transition-all">›</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-black text-gray-900 text-base">Recent Activity</h2>
                <button onClick={() => navigate('/my-profile')}
                  className="text-xs font-semibold text-amber-600 hover:text-amber-700 bg-transparent border-0 cursor-pointer">
                  View all →
                </button>
              </div>

              {feed.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">📭</div>
                  <p className="text-gray-500 font-semibold text-sm">No applications yet</p>
                  <p className="text-gray-400 text-xs mt-1">Start by browsing animals</p>
                  <button onClick={() => navigate('/animals')}
                    className="mt-3 text-xs font-bold text-amber-600 bg-amber-50 border-0 px-4 py-1.5 rounded-full cursor-pointer hover:bg-amber-100 transition-colors">
                    Browse now →
                  </button>
                </div>
              ) : (
                <div className="space-y-1">
                  {feed.map(app => {
                    const s = STATUS[app.status] || STATUS.pending;
                    return (
                      <div key={app.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                        <div className="relative flex-shrink-0">
                          <img src={app.animal_image} alt={app.animal_name}
                            className="w-10 h-10 rounded-xl object-cover"
                            onError={e => e.target.src = 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=100&q=80'} />
                          <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ring-2 ring-white ${s.dot}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">{app.animal_name}</p>
                          <p className="text-[11px] text-gray-400">
                            {new Date(app.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${s.pill}`}>{s.label}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Rotating Tip */}
            <div className="bg-white rounded-2xl p-5 ring-1 ring-gray-100 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500
                  flex items-center justify-center text-lg flex-shrink-0 shadow-sm shadow-amber-200">
                  {TIPS[tipIdx].icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <p className="section-label">Adoption Tip</p>
                    <div className="flex gap-1">
                      {TIPS.map((_, i) => (
                        <div key={i} className="h-1 rounded-full transition-all duration-300"
                          style={{ width: i === tipIdx ? '14px' : '4px', background: i === tipIdx ? '#f97316' : '#fed7aa' }} />
                      ))}
                    </div>
                  </div>
                  <p className="text-amber-800/80 text-xs leading-relaxed font-medium"
                    style={{ opacity: tipVisible ? 1 : 0, transition: 'opacity 0.35s ease' }}>
                    {TIPS[tipIdx].text}
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-12 border-t border-gray-100 bg-white py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🐾</span>
            <span className="font-black text-gray-800">RescueMePets</span>
            <span className="text-gray-300">·</span>
            <span className="text-gray-400 text-xs">Giving pets a second chance</span>
          </div>
          <p className="text-xs text-gray-400">© 2026 · Built with ❤️ for animals everywhere</p>
          <div className="flex gap-5">
            {['About', 'Privacy', 'Contact'].map(l => (
              <button key={l} className="text-xs text-gray-400 hover:text-gray-700 transition-colors bg-transparent border-0 cursor-pointer font-medium">{l}</button>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
