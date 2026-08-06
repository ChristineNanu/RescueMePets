import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../constants';
import { apiFetch } from '../api';

const STEPS = [
  { n: '01', icon: '🔍', title: 'Browse & Filter',  desc: 'Search pets by species, breed, age, and personality to find your perfect match.' },
  { n: '02', icon: '💛', title: 'Save Favourites',  desc: 'Heart the animals you love and build your shortlist of potential companions.' },
  { n: '03', icon: '📝', title: 'Apply to Adopt',   desc: 'Submit a simple application with a personal message to the rescue center.' },
  { n: '04', icon: '🏡', title: 'Welcome Home',     desc: 'Get approved, pay the adoption fee, and bring your new best friend home.' },
];

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&q=80';

export default function LandingPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total_animals: 21, available: 19, adopted: 1, centers: 4 });
  const [previewAnimals, setPreviewAnimals] = useState([]);
  const [stories, setStories] = useState([]);
  const [storiesLoading, setStoriesLoading] = useState(true);

  useEffect(() => {
    apiFetch(`${API_BASE_URL}/stats`).then(r => r.json()).then(setStats).catch(() => {});
    apiFetch(`${API_BASE_URL}/landing/animals`).then(r => r.json()).then(d => setPreviewAnimals(d.slice(0, 3))).catch(() => {});
    apiFetch(`${API_BASE_URL}/landing/stories`).then(r => r.json()).then(d => setStories(d.slice(0, 3))).catch(() => {}).finally(() => setStoriesLoading(false));
  }, []);

  return (
    <div className="font-sans bg-white text-gray-800 overflow-x-hidden">

      {/* ── Navbar ─────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-teal-100/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
          <button onClick={() => navigate('/')} className="flex items-center gap-2.5 bg-transparent border-0 cursor-pointer group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-md shadow-teal-200">
              <span className="text-lg">🐾</span>
            </div>
            <span className="text-lg font-black text-gradient">RescueMePets</span>
          </button>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/register/vet')} className="text-teal-600 text-sm font-semibold bg-transparent border-0 cursor-pointer hover:underline px-3 py-2">Are you a vet?</button>
            <button onClick={() => navigate('/login')} className="btn-ghost px-5 py-2 text-sm">Login</button>
            <button onClick={() => navigate('/register')} className="btn-primary px-5 py-2 text-sm">Get Started</button>
          </div>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="relative min-h-[94vh] flex items-center overflow-hidden">
        <img src="https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=1800&q=85"
          alt="hero" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-teal-900/90 via-teal-800/75 to-teal-700/40" />
        {/* decorative blobs */}
        <div className="absolute top-20 right-20 w-72 h-72 bg-teal-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-20 right-40 w-48 h-48 bg-coral-400/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 py-20 w-full">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2.5 glass text-white text-sm font-semibold px-5 py-2.5 rounded-full mb-8 animate-fade-up">
              <span className="w-2 h-2 bg-teal-300 rounded-full animate-pulse" />
              {stats.available} pets available right now
            </div>

            <h1 className="text-6xl sm:text-7xl font-black text-white leading-[1.05] mb-6 animate-fade-up-1">
              Every Pet<br />Deserves a<br />
              <span className="shimmer-text">Forever Home</span>
            </h1>

            <p className="text-xl text-white/75 mb-10 leading-relaxed max-w-lg font-medium animate-fade-up-2">
              Browse hundreds of loving animals waiting for their perfect family. Adopt, don't shop.
            </p>

            <div className="flex flex-wrap gap-4 animate-fade-up-3">
              <button onClick={() => navigate('/register')}
                className="px-8 py-4 rounded-2xl font-bold text-base bg-gradient-to-r from-coral-500 to-coral-600
                  text-white hover:from-coral-600 hover:to-coral-700 hover:shadow-2xl hover:shadow-coral-500/30
                  hover:-translate-y-1 transition-all duration-200 border-0 cursor-pointer">
                🐾 I Want to Adopt
              </button>
              <button onClick={() => navigate('/register/vet')}
                className="px-8 py-4 rounded-2xl font-bold text-base glass text-white
                  hover:bg-white/20 transition-all duration-200 cursor-pointer border-0">
                🏥 I'm a Vet
              </button>
            </div>

            {/* trust badges */}
            <div className="flex flex-wrap gap-6 mt-12 animate-fade-up-4">
              {[['🏥', `${stats.centers} Rescue Centers`], ['🐾', `${stats.total_animals}+ Animals`], ['🏠', `${stats.adopted}+ Adopted`]].map(([icon, label], i) => (
                <div key={i} className="flex items-center gap-2 text-white/70 text-sm font-medium">
                  <span>{icon}</span><span>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/40 animate-bounce">
          <span className="text-xs font-semibold tracking-widest uppercase">Scroll</span>
          <span>↓</span>
        </div>
      </section>

      {/* ── Stats Bar ──────────────────────────────────────── */}
      <section className="bg-gradient-to-r from-teal-600 to-teal-500 py-12">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          {[
            { value: `${stats.total_animals}+`, label: 'Animals Listed',  icon: '🐾' },
            { value: `${stats.available}`,      label: 'Available Now',   icon: '✅' },
            { value: `${stats.adopted}+`,       label: 'Happy Adoptions', icon: '🏠' },
            { value: `${stats.centers}`,        label: 'Rescue Centers',  icon: '🏥' },
          ].map((s, i) => (
            <div key={i} className="animate-fade-up" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="text-3xl mb-2">{s.icon}</div>
              <div className="text-4xl font-black text-white">{s.value}</div>
              <div className="text-teal-100 text-sm mt-1 font-medium">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How It Works ───────────────────────────────────── */}
      <section className="py-28 bg-gradient-to-br from-teal-50/60 via-white to-cream-50/40">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="section-label mb-3">Simple Process</p>
            <h2 className="text-5xl font-black text-gray-900 mb-4">How It Works</h2>
            <p className="text-gray-500 text-lg max-w-md mx-auto">Four simple steps to find your perfect companion</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((s, i) => (
              <div key={i}
                className="relative bg-white rounded-3xl p-8 text-center shadow-card
                  hover:shadow-card-hover hover:-translate-y-2 transition-all duration-300 group animate-fade-up border border-teal-50"
                style={{ animationDelay: `${i * 80}ms` }}>
                {/* connector line */}
                {i < STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-12 -right-3 w-6 h-0.5 bg-teal-200 z-10" />
                )}
                <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl
                  flex items-center justify-center text-2xl mx-auto mb-5 shadow-md shadow-teal-200
                  group-hover:scale-110 group-hover:shadow-glow-teal transition-all duration-300">
                  {s.icon}
                </div>
                <span className="text-xs font-black text-teal-400 uppercase tracking-widest">Step {s.n}</span>
                <h3 className="font-black text-gray-900 text-base mt-2 mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Animal Preview ─────────────────────────────────── */}
      <section className="py-28 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-14 gap-4">
            <div>
              <p className="section-label mb-3">Meet Our Animals</p>
              <h2 className="text-5xl font-black text-gray-900">Waiting for You</h2>
            </div>
            <button onClick={() => navigate('/register')}
              className="btn-ghost px-6 py-3 text-sm flex-shrink-0">
              View All Animals →
            </button>
          </div>
          {previewAnimals.length === 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {[0, 1, 2].map(i => (
                <div key={i} className="rounded-3xl h-72 skeleton" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {previewAnimals.map((a, i) => (
                <div key={a.id}
                  className="group rounded-3xl overflow-hidden shadow-card hover:shadow-card-hover
                    hover:-translate-y-3 transition-all duration-400 cursor-pointer animate-fade-up border border-gray-50"
                  style={{ animationDelay: `${i * 100}ms` }}
                  onClick={() => navigate('/register')}>
                  <div className="relative h-72 overflow-hidden">
                    <img src={a.image} alt={a.name}
                      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-600"
                      style={{ transition: 'transform 0.6s ease' }}
                      onError={e => e.target.src = FALLBACK_IMG} />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/70 via-gray-900/10 to-transparent" />
                    <span className="absolute top-4 left-4 bg-white text-teal-700 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                      {a.species}
                    </span>
                    <span className="absolute top-4 right-4 flex items-center gap-1.5 bg-white/95 text-emerald-600 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Available
                    </span>
                    <div className="absolute bottom-4 left-4 right-4">
                      <p className="font-black text-white text-2xl">{a.name}</p>
                      <p className="text-white/70 text-sm">{a.breed} · {a.age} {a.age === 1 ? 'yr' : 'yrs'}</p>
                    </div>
                  </div>
                  <div className="p-5 bg-white flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center text-base">🐾</div>
                      <span className="text-gray-600 text-sm font-medium">Ready to adopt</span>
                    </div>
                    <span className="text-teal-600 text-sm font-black group-hover:translate-x-1 transition-transform inline-block">
                      Adopt Me →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Testimonials ───────────────────────────────────── */}
      <section className="py-28 bg-gradient-to-br from-teal-50/60 via-white to-cream-50/40">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="section-label mb-3">Happy Adopters</p>
            <h2 className="text-5xl font-black text-gray-900 mb-4">Stories of Love</h2>
            <p className="text-gray-500 text-lg">Real people, real connections</p>
          </div>
          {storiesLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-7">
              {[0, 1, 2].map(i => <div key={i} className="rounded-3xl h-56 skeleton" />)}
            </div>
          ) : stories.length === 0 ? null : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-7">
              {stories.map((s, i) => (
                <div key={s.id}
                  className="bg-white rounded-3xl p-8 shadow-card hover:shadow-card-hover
                    hover:-translate-y-2 transition-all duration-300 animate-fade-up border border-teal-50"
                  style={{ animationDelay: `${i * 80}ms` }}>
                  <div className="flex gap-0.5 mb-5">
                    {[...Array(5)].map((_, j) => <span key={j} className="text-cream-500 text-base">★</span>)}
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed mb-6 italic">"{s.story}"</p>
                  <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
                    <img src={s.animal_image} alt={s.animal_name} onError={e => e.target.src = FALLBACK_IMG}
                      className="w-11 h-11 rounded-2xl object-cover flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="font-black text-gray-900 text-sm truncate">{s.adopter_name}</p>
                      <p className="text-teal-600 text-xs font-semibold truncate">Adopted {s.animal_name}{s.center_name ? ` · ${s.center_name}` : ''}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────── */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-600 via-teal-500 to-teal-700 gradient-animate" />
        <div className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: 'radial-gradient(circle, white 1.5px, transparent 1.5px)', backgroundSize: '32px 32px' }} />
        <div className="absolute top-10 left-10 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-coral-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 flex items-center justify-around text-[100px] opacity-[0.05] pointer-events-none select-none">
          {['🐕', '🐈', '🐇', '🦜'].map((e, i) => (
            <span key={i} className="animate-float" style={{ animationDelay: `${i * 0.7}s` }}>{e}</span>
          ))}
        </div>
        <div className="relative z-10 max-w-2xl mx-auto px-6 text-center">
          <p className="text-teal-200 text-sm font-black uppercase tracking-widest mb-4 animate-fade-up">Join the family</p>
          <h2 className="text-5xl sm:text-6xl font-black text-white mb-6 animate-fade-up-1 leading-tight">
            Ready to Find Your<br />Best Friend?
          </h2>
          <p className="text-white/70 text-lg mb-10 font-medium animate-fade-up-2">
            Join thousands of happy adopters who found their perfect companion
          </p>
          <button onClick={() => navigate('/register')}
            className="px-12 py-4 rounded-2xl font-bold text-base bg-white text-teal-700
              hover:shadow-2xl hover:shadow-white/20 hover:-translate-y-1 transition-all duration-200
              border-0 cursor-pointer active:scale-95 animate-fade-up-3">
            🐾 Adopt Today — It's Free
          </button>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="bg-gray-950 py-12">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
              <span className="text-sm">🐾</span>
            </div>
            <span className="text-lg font-black text-gradient">RescueMePets</span>
          </div>
          <p className="text-gray-600 text-sm">© 2026 RescueMePets · Built with ❤️ for animals everywhere</p>
          <div className="flex gap-5 text-sm">
            <button onClick={() => navigate('/login')} className="text-gray-500 hover:text-white transition-colors bg-transparent border-0 cursor-pointer font-medium">Login</button>
            <button onClick={() => navigate('/register')} className="text-gray-500 hover:text-white transition-colors bg-transparent border-0 cursor-pointer font-medium">Register</button>
            <button onClick={() => navigate('/pricing')} className="text-gray-500 hover:text-white transition-colors bg-transparent border-0 cursor-pointer font-medium">Pricing</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
