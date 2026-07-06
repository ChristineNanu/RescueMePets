import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../constants';

const PREVIEW = [
  { name: 'Buddy',    breed: 'Golden Retriever', img: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=600&q=80',    tag: 'Dog' },
  { name: 'Whiskers', breed: 'Siamese Cat',       img: 'https://images.unsplash.com/photo-1555685812-4b943f1cb0eb?w=600&q=80',    tag: 'Cat' },
  { name: 'Luna',     breed: 'Siberian Husky',    img: 'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=600&q=80', tag: 'Dog' },
];

const STEPS = [
  { n: '01', icon: '🔍', title: 'Browse Animals',  desc: 'Search and filter through available pets by species, breed, and personality.' },
  { n: '02', icon: '❤️', title: 'Save Favourites', desc: 'Heart the animals you love and build your shortlist of potential companions.' },
  { n: '03', icon: '📋', title: 'Apply to Adopt',  desc: 'Submit your adoption application with a personal message to the rescue center.' },
  { n: '04', icon: '🏠', title: 'Welcome Home',    desc: 'Get approved and bring your new best friend home to their forever family.' },
];

const TESTIMONIALS = [
  { name: 'Sarah M.',  avatar: '👩',   text: 'Found my perfect dog Biscuit through RescueMePets. The process was so smooth and the team was incredibly helpful!' },
  { name: 'James K.',  avatar: '👨',   text: "Adopted two cats last year. They've completely changed our home for the better. Couldn't be happier!" },
  { name: 'Priya L.',  avatar: '👩🦱', text: 'The adoption form was simple and the center responded within a day. My rabbit Coco is the best thing ever.' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total_animals: 21, available: 19, adopted: 1, centers: 4 });

  useEffect(() => {
    fetch(`${API_BASE_URL}/stats`).then(r => r.json()).then(setStats).catch(() => {});
  }, []);

  return (
    <div className="font-sans bg-white text-gray-800 overflow-x-hidden">

      {/* ── Navbar ─────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-sm shadow-black/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 bg-transparent border-0 cursor-pointer group">
            <span className="text-2xl group-hover:animate-wiggle inline-block">🐾</span>
            <span className="text-lg font-black text-gradient">RescueMePets</span>
          </button>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/login')} className="btn-ghost px-5 py-2 text-sm">Login</button>
            <button onClick={() => navigate('/register')} className="btn-primary px-5 py-2 text-sm">Get Started</button>
          </div>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden">
        <img src="https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=1800&q=85"
          alt="hero" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 via-amber-900/60 to-orange-900/50" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 py-20 w-full">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-xl border border-white/20
              text-white text-sm font-semibold px-5 py-2.5 rounded-full mb-8 animate-fade-up">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              {stats.available} pets available for adoption
            </div>

            <h1 className="text-6xl sm:text-7xl font-black text-white leading-[1.05] mb-6 animate-fade-up-1">
              Give a Pet a<br />
              <span className="shimmer-text">Forever Home</span>
              <span className="ml-3">🏠</span>
            </h1>

            <p className="text-xl text-white/80 mb-10 leading-relaxed max-w-xl font-medium animate-fade-up-2">
              Browse hundreds of loving animals waiting for their perfect family. Adopt, don't shop — every pet deserves a second chance.
            </p>

            <div className="flex flex-wrap gap-4 animate-fade-up-3">
              <button onClick={() => navigate('/register')}
                className="px-8 py-4 rounded-2xl font-bold text-base bg-gradient-to-r from-amber-500 to-orange-500
                  text-white hover:from-amber-600 hover:to-orange-600 hover:shadow-2xl hover:shadow-amber-500/30
                  hover:-translate-y-1 transition-all duration-200 border-0 cursor-pointer active:scale-95">
                🐾 Start Adopting
              </button>
              <button onClick={() => navigate('/login')}
                className="px-8 py-4 rounded-2xl font-bold text-base bg-white/10 backdrop-blur-sm
                  text-white border border-white/25 hover:bg-white/20 hover:border-white/40
                  transition-all duration-200 cursor-pointer">
                Sign In →
              </button>
            </div>
          </div>
        </div>

        {/* scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-white/50 animate-bounce">
          <span className="text-xs font-semibold tracking-widest uppercase">Scroll</span>
          <span className="text-lg">↓</span>
        </div>
      </section>

      {/* ── Stats Bar ──────────────────────────────────────── */}
      <section className="bg-gradient-to-r from-amber-500 to-orange-500 py-10">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[
            { value: `${stats.total_animals}+`, label: 'Animals Listed',  icon: '🐾' },
            { value: `${stats.available}`,      label: 'Available Now',   icon: '✅' },
            { value: `${stats.adopted}+`,       label: 'Happy Adoptions', icon: '🏠' },
            { value: `${stats.centers}`,        label: 'Rescue Centers',  icon: '🏥' },
          ].map((s, i) => (
            <div key={i} className="animate-fade-up" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="text-3xl mb-1">{s.icon}</div>
              <div className="text-3xl font-black text-white">{s.value}</div>
              <div className="text-amber-100 text-sm mt-0.5 font-medium">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How It Works ───────────────────────────────────── */}
      <section className="py-24 bg-stone-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="section-label mb-2">Simple Process</p>
            <h2 className="text-4xl font-black text-gray-900 mb-3">How It Works</h2>
            <p className="text-gray-500 text-lg">Adopting a pet has never been easier</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((s, i) => (
              <div key={i}
                className="bg-white rounded-3xl p-8 text-center ring-1 ring-gray-100 shadow-sm
                  hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group animate-fade-up"
                style={{ animationDelay: `${i * 80}ms` }}>
                <p className="section-label mb-4">Step {s.n}</p>
                <div className="w-18 h-18 w-[72px] h-[72px] bg-gradient-to-br from-amber-50 to-orange-100
                  rounded-2xl flex items-center justify-center text-4xl mx-auto mb-5
                  group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-amber-200/50 transition-all duration-300">
                  {s.icon}
                </div>
                <h3 className="font-black text-gray-900 text-base mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Animal Preview ─────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="section-label mb-2">Meet Our Animals</p>
            <h2 className="text-4xl font-black text-gray-900 mb-3">Waiting for You</h2>
            <p className="text-gray-500 text-lg">Every one of them deserves a loving home</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-12">
            {PREVIEW.map((a, i) => (
              <div key={i}
                className="group rounded-3xl overflow-hidden ring-1 ring-gray-100 shadow-md
                  hover:shadow-2xl hover:-translate-y-3 transition-all duration-400 cursor-pointer animate-fade-up"
                style={{ animationDelay: `${i * 100}ms` }}
                onClick={() => navigate('/register')}>
                <div className="relative h-64 overflow-hidden">
                  <img src={a.img} alt={a.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <span className="absolute top-4 left-4 bg-white/95 text-amber-700 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                    {a.tag}
                  </span>
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="font-black text-white text-xl">{a.name}</p>
                    <p className="text-white/75 text-sm">{a.breed}</p>
                  </div>
                </div>
                <div className="p-5 bg-white flex items-center justify-between">
                  <span className="flex items-center gap-2 text-emerald-600 text-xs font-bold">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /> Available
                  </span>
                  <span className="text-amber-600 text-sm font-black group-hover:translate-x-0.5 transition-transform inline-block">
                    Adopt Me →
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center">
            <button onClick={() => navigate('/register')}
              className="btn-primary px-10 py-4 text-base shadow-lg shadow-amber-200/50">
              View All Animals →
            </button>
          </div>
        </div>
      </section>

      {/* ── Testimonials ───────────────────────────────────── */}
      <section className="py-24 bg-stone-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="section-label mb-2">Happy Adopters</p>
            <h2 className="text-4xl font-black text-gray-900 mb-3">Stories of Love</h2>
            <p className="text-gray-500 text-lg">Real people, real connections</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-7">
            {TESTIMONIALS.map((t, i) => (
              <div key={i}
                className="bg-white rounded-3xl p-7 ring-1 ring-gray-100 shadow-sm
                  hover:shadow-xl hover:-translate-y-2 transition-all duration-300 animate-fade-up"
                style={{ animationDelay: `${i * 80}ms` }}>
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, j) => <span key={j} className="text-amber-400 text-sm">★</span>)}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-5 italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-2xl">{t.avatar}</div>
                  <p className="font-black text-gray-900 text-sm">{t.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────── */}
      <section className="py-28 relative overflow-hidden bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500">
        <div className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: 'radial-gradient(circle, white 1.5px, transparent 1.5px)', backgroundSize: '32px 32px' }} />
        <div className="absolute inset-0 flex items-center justify-around text-[120px] opacity-[0.06] pointer-events-none select-none">
          {['🐕', '🐈', '🐇', '🦜'].map((e, i) => (
            <span key={i} className="animate-float" style={{ animationDelay: `${i * 0.5}s` }}>{e}</span>
          ))}
        </div>
        <div className="relative z-10 max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-5xl sm:text-6xl font-black text-white mb-5 animate-fade-up">
            Ready to Find Your<br />Best Friend?
          </h2>
          <p className="text-white/75 text-lg mb-10 font-medium animate-fade-up-1">
            Join thousands of happy adopters who found their perfect companion
          </p>
          <button onClick={() => navigate('/register')}
            className="px-12 py-4 rounded-2xl font-bold text-base bg-white text-amber-700
              hover:shadow-2xl hover:shadow-white/30 hover:-translate-y-1 transition-all duration-200
              border-0 cursor-pointer active:scale-95 animate-fade-up-2">
            🐾 Adopt Today — It's Free
          </button>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="bg-gray-900 py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-lg font-black text-gradient">🐾 RescueMePets</span>
          <p className="text-gray-500 text-sm">© 2026 RescueMePets · Built with ❤️ for animals everywhere</p>
          <div className="flex gap-5 text-sm">
            <button onClick={() => navigate('/login')} className="text-gray-500 hover:text-white transition-colors bg-transparent border-0 cursor-pointer font-medium">Login</button>
            <button onClick={() => navigate('/register')} className="text-gray-500 hover:text-white transition-colors bg-transparent border-0 cursor-pointer font-medium">Register</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
