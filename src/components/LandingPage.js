import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../constants';

const PREVIEW_ANIMALS = [
  { name: 'Buddy',    breed: 'Golden Retriever', img: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&q=80',    tag: 'Dog' },
  { name: 'Whiskers', breed: 'Siamese Cat',       img: 'https://images.unsplash.com/photo-1555685812-4b943f1cb0eb?w=400&q=80',    tag: 'Cat' },
  { name: 'Luna',     breed: 'Siberian Husky',    img: 'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=400&q=80', tag: 'Dog' },
];

const HOW_IT_WORKS = [
  { step: '01', icon: '🔍', title: 'Browse Animals',  desc: 'Search and filter through available pets by species, breed, and personality.' },
  { step: '02', icon: '❤️', title: 'Save Favourites', desc: 'Heart the animals you love and build your shortlist of potential companions.' },
  { step: '03', icon: '📋', title: 'Apply to Adopt',  desc: 'Submit your adoption application with a personal message to the rescue center.' },
  { step: '04', icon: '🏠', title: 'Welcome Home',    desc: 'Get approved and bring your new best friend home to their forever family.' },
];

const TESTIMONIALS = [
  { name: 'Sarah M.',  text: 'Found my perfect dog Biscuit through RescueMePets. The process was so smooth and the team was incredibly helpful!', avatar: '👩' },
  { name: 'James K.',  text: 'Adopted two cats last year. They\'ve completely changed our home for the better. Couldn\'t be happier!', avatar: '👨' },
  { name: 'Priya L.',  text: 'The adoption form was simple and the center responded within a day. My rabbit Coco is the best thing ever.', avatar: '👩‍🦱' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total_animals: 21, available: 19, adopted: 1, centers: 4 });

  useEffect(() => {
    fetch(`${API_BASE_URL}/stats`).then(r => r.json()).then(setStats).catch(() => {});
  }, []);

  return (
    <div className="font-sans bg-white text-gray-800">

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-amber-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
          <span className="text-xl font-extrabold bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent">
            🐾 RescueMePets
          </span>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/login')}
              className="px-5 py-2 rounded-full text-sm font-semibold text-amber-700 border-2 border-amber-200 hover:border-amber-400 hover:bg-amber-50 transition-all bg-transparent cursor-pointer">
              Login
            </button>
            <button onClick={() => navigate('/register')}
              className="px-5 py-2 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-amber-500 to-amber-600 hover:shadow-lg hover:shadow-amber-200 hover:-translate-y-0.5 transition-all border-0 cursor-pointer">
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden">
        <img src="https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=1600&q=80"
          alt="hero" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-amber-900/80 via-amber-800/60 to-stone-900/50" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 py-20">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/25 text-white text-sm font-semibold px-4 py-2 rounded-full mb-6">
              🐾 Find your perfect companion
            </span>
            <h1 className="text-5xl sm:text-6xl font-black text-white leading-tight mb-6 drop-shadow-lg">
              Give a Pet a<br />
              <span className="bg-gradient-to-r from-orange-300 to-pink-300 bg-clip-text text-transparent">
                Forever Home
              </span> 🏠
            </h1>
            <p className="text-lg text-white/85 mb-8 leading-relaxed max-w-xl">
              Browse hundreds of loving animals waiting for their perfect family. Adopt, don't shop — every pet deserves a second chance.
            </p>
            <div className="flex flex-wrap gap-4">
              <button onClick={() => navigate('/register')}
                className="px-8 py-4 rounded-2xl font-bold text-base bg-white text-amber-700 hover:shadow-2xl hover:-translate-y-1 transition-all border-0 cursor-pointer">
                🐾 Start Adopting
              </button>
              <button onClick={() => navigate('/login')}
                className="px-8 py-4 rounded-2xl font-bold text-base bg-white/15 backdrop-blur-sm text-white border-2 border-white/30 hover:bg-white/25 transition-all cursor-pointer">
                Sign In
              </button>
            </div>
          </div>
        </div>
        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/60 text-xs flex flex-col items-center gap-1 animate-bounce">
          <span>Scroll down</span>
          <span>↓</span>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section className="bg-gradient-to-r from-amber-500 to-amber-600 py-10">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[
            { value: `${stats.total_animals}+`, label: 'Animals Listed',   icon: '🐾' },
            { value: `${stats.available}`,      label: 'Available Now',    icon: '✅' },
            { value: `${stats.adopted}+`,       label: 'Happy Adoptions',  icon: '🏠' },
            { value: `${stats.centers}`,        label: 'Rescue Centers',   icon: '🏥' },
          ].map((s, i) => (
            <div key={i}>
              <div className="text-3xl mb-1">{s.icon}</div>
              <div className="text-3xl font-black text-white">{s.value}</div>
              <div className="text-amber-100 text-sm mt-1 font-medium">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-20 bg-amber-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-amber-600 font-bold text-sm uppercase tracking-widest">Simple Process</span>
            <h2 className="text-4xl font-black text-gray-800 mt-2 mb-3">How It Works</h2>
            <p className="text-gray-500 text-lg">Adopting a pet has never been easier</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map((item, i) => (
              <div key={i}
                className="bg-white rounded-3xl p-6 text-center shadow-sm border border-amber-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group">
                <div className="text-xs font-black text-amber-400 tracking-widest mb-3 uppercase">Step {item.step}</div>
                <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-pink-100 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <h3 className="font-bold text-gray-800 text-base mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Animal Preview ── */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-amber-600 font-bold text-sm uppercase tracking-widest">Meet Our Animals</span>
            <h2 className="text-4xl font-black text-gray-800 mt-2 mb-3">Waiting for You</h2>
            <p className="text-gray-500 text-lg">Every one of them deserves a loving home</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
            {PREVIEW_ANIMALS.map((a, i) => (
              <div key={i}
                className="rounded-3xl overflow-hidden shadow-sm border border-gray-100 cursor-pointer hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group"
                onClick={() => navigate('/register')}>
                <div className="relative h-56 overflow-hidden">
                  <img src={a.img} alt={a.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <span className="absolute top-3 left-3 bg-white/90 text-amber-700 text-xs font-bold px-3 py-1 rounded-full">
                    {a.tag}
                  </span>
                  <div className="absolute bottom-3 left-4 right-4">
                    <p className="font-bold text-white text-lg">{a.name}</p>
                    <p className="text-white/75 text-sm">{a.breed}</p>
                  </div>
                </div>
                <div className="p-4 bg-white flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /> Available
                  </span>
                  <span className="text-amber-600 text-sm font-bold">Adopt Me →</span>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center">
            <button onClick={() => navigate('/register')}
              className="px-10 py-4 rounded-2xl font-bold text-base bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:shadow-xl hover:shadow-amber-200 hover:-translate-y-1 transition-all border-0 cursor-pointer">
              View All Animals →
            </button>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-20 bg-gradient-to-br from-amber-50 to-stone-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-amber-600 font-bold text-sm uppercase tracking-widest">Happy Adopters</span>
            <h2 className="text-4xl font-black text-gray-800 mt-2 mb-3">Stories of Love</h2>
            <p className="text-gray-500 text-lg">Real people, real connections</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="bg-white rounded-3xl p-6 shadow-sm border border-amber-100 hover:shadow-md transition-shadow">
                <div className="text-3xl mb-4">{t.avatar}</div>
                <p className="text-gray-600 text-sm leading-relaxed mb-4 italic">"{t.text}"</p>
                <p className="font-bold text-gray-800 text-sm">{t.name}</p>
                <div className="flex gap-0.5 mt-1">
                  {[...Array(5)].map((_, j) => <span key={j} className="text-amber-400 text-xs">★</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 bg-gradient-to-r from-amber-500 to-amber-600 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none text-8xl flex items-center justify-around">
          <span>🐕</span><span>🐈</span><span>🐇</span><span>🦜</span>
        </div>
        <div className="relative z-10 max-w-2xl mx-auto px-6">
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">Ready to Find Your Best Friend?</h2>
          <p className="text-amber-100 text-lg mb-8">Join thousands of happy adopters who found their perfect companion</p>
          <button onClick={() => navigate('/register')}
            className="px-10 py-4 rounded-2xl font-bold text-base bg-white text-amber-700 hover:shadow-2xl hover:-translate-y-1 transition-all border-0 cursor-pointer">
            🐾 Adopt Today — It's Free
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-gray-900 text-gray-400 py-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-lg font-extrabold bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent">
              🐾 RescueMePets
            </span>
            <p className="text-sm">© 2026 RescueMePets · Built with ❤️ for animals everywhere</p>
            <div className="flex gap-4 text-sm">
              <button onClick={() => navigate('/login')} className="hover:text-white transition-colors bg-transparent border-0 cursor-pointer text-gray-400">Login</button>
              <button onClick={() => navigate('/register')} className="hover:text-white transition-colors bg-transparent border-0 cursor-pointer text-gray-400">Register</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
