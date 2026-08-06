import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../constants';
import { apiFetch } from '../api';

const STEPS = [
  {
    key: 'activity', question: 'How active is your lifestyle?',
    emoji: '🏃', options: [
      { value: 'active',   label: 'Very Active',   sub: 'Daily runs, hikes, outdoor adventures', icon: '🏃' },
      { value: 'moderate', label: 'Moderate',       sub: 'Regular walks, occasional outdoor time', icon: '🚶' },
      { value: 'relaxed',  label: 'Relaxed',        sub: 'Mostly indoors, calm home environment', icon: '🛋️' },
    ]
  },
  {
    key: 'home', question: 'What type of home do you live in?',
    emoji: '🏠', options: [
      { value: 'house',     label: 'House',      sub: 'With a garden or yard', icon: '🏡' },
      { value: 'apartment', label: 'Apartment',  sub: 'No outdoor space', icon: '🏢' },
      { value: 'farm',      label: 'Farm/Rural', sub: 'Lots of open space', icon: '🌾' },
    ]
  },
  {
    key: 'has_kids', question: 'Do you have children at home?',
    emoji: '👨‍👩‍👧', options: [
      { value: true,  label: 'Yes', sub: 'Children live in or visit regularly', icon: '👶' },
      { value: false, label: 'No',  sub: 'No children in the household', icon: '🧑' },
    ]
  },
  {
    key: 'has_pets', question: 'Do you have other pets?',
    emoji: '🐾', options: [
      { value: true,  label: 'Yes', sub: 'Other animals already at home', icon: '🐕' },
      { value: false, label: 'No',  sub: 'This would be my first pet', icon: '✨' },
    ]
  },
  {
    key: 'experience', question: "What's your pet ownership experience?",
    emoji: '⭐', options: [
      { value: 'first',       label: 'First Timer',     sub: 'Never owned a pet before', icon: '🌱' },
      { value: 'some',        label: 'Some Experience', sub: 'Had pets growing up or briefly', icon: '🌿' },
      { value: 'experienced', label: 'Experienced',     sub: 'Long-time pet owner', icon: '🌳' },
    ]
  },
  {
    key: 'time_home', question: 'How much time are you home daily?',
    emoji: '⏰', options: [
      { value: 'always',    label: 'Most of the day', sub: 'Work from home or retired', icon: '🏠' },
      { value: 'sometimes', label: 'Half the day',    sub: 'Part-time or flexible schedule', icon: '🕐' },
      { value: 'rarely',    label: 'Often out',       sub: 'Full-time work, long hours', icon: '💼' },
    ]
  },
  {
    key: 'species_pref', question: 'Do you have a species preference?',
    emoji: '🐾', options: [
      { value: 'any',    label: 'No Preference', sub: 'Open to any animal', icon: '🐾' },
      { value: 'Dog',    label: 'Dog',           sub: "Man's best friend", icon: '🐕' },
      { value: 'Cat',    label: 'Cat',           sub: 'Independent & loving', icon: '🐈' },
      { value: 'Rabbit', label: 'Rabbit',        sub: 'Gentle & quiet', icon: '🐇' },
      { value: 'Bird',   label: 'Bird',          sub: 'Cheerful & social', icon: '🦜' },
    ]
  },
];

export default function Quiz({ onClose }) {
  const [step, setStep]       = useState(0);
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const current  = STEPS[step];
  const progress = (step / STEPS.length) * 100;

  const handleSelect = async (value) => {
    const newAnswers = { ...answers, [current.key]: value };
    setAnswers(newAnswers);
    if (step < STEPS.length - 1) {
      setStep(s => s + 1);
    } else {
      setLoading(true);
      try {
        const res = await apiFetch(`${API_BASE_URL}/quiz/match`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newAnswers),
        });
        const data = await res.json();
        setResults(data);
        // Cache match IDs (not full objects, which can go stale) so the
        // dashboard can personalize "Available Now" with these results.
        if (Array.isArray(data) && data.length > 0) {
          localStorage.setItem('quiz_match_ids', JSON.stringify(data.map(a => a.id)));
        }
      } catch { setResults([]); }
      finally { setLoading(false); }
    }
  };

  const reset = () => { setStep(0); setAnswers({}); setResults(null); };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}>
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto border border-teal-50 modal-enter"
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-500 px-6 py-5 relative">
          <div className="absolute inset-0 opacity-[0.06]"
            style={{ backgroundImage: 'radial-gradient(circle, white 1.5px, transparent 1.5px)', backgroundSize: '24px 24px' }} />
          <button onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 border-0 cursor-pointer font-bold transition-all">
            ✕
          </button>
          <p className="text-teal-200 text-xs font-black uppercase tracking-widest mb-1">Find Your Match</p>
          <h2 className="text-xl font-black text-white">Pet Personality Quiz 🐾</h2>
          {!results && (
            <div className="mt-3">
              <div className="flex justify-between text-teal-100 text-xs mb-1.5">
                <span>Question {step + 1} of {STEPS.length}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-1.5">
                <div className="bg-white h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}
        </div>

        <div className="p-6">
          {/* Loading */}
          {loading && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-teal-600 rounded-3xl flex items-center justify-center text-3xl mx-auto mb-4 animate-float shadow-glow-teal">🐾</div>
              <p className="text-teal-600 font-semibold">Finding your perfect matches...</p>
            </div>
          )}

          {/* Results */}
          {results && !loading && (
            <div>
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-teal-600 rounded-3xl flex items-center justify-center text-3xl mx-auto mb-3 shadow-glow-teal">🎉</div>
                <h3 className="text-xl font-black text-gray-800 mb-1">Your Top Matches!</h3>
                <p className="text-gray-400 text-sm">Based on your lifestyle, these animals are perfect for you</p>
              </div>
              {results.length === 0 ? (
                <p className="text-center text-gray-400 py-8">No matches found. Try different answers!</p>
              ) : (
                <div className="flex flex-col gap-3 mb-5">
                  {results.map((animal, i) => (
                    <div key={animal.id}
                      className="flex items-center gap-3 p-3 bg-teal-50 rounded-2xl border border-teal-100 hover:border-teal-300 transition-all cursor-pointer group"
                      onClick={() => { onClose(); navigate(`/adoption?animalId=${animal.id}`); }}>
                      <div className="relative flex-shrink-0">
                        <img src={animal.image} alt={animal.name}
                          className="w-14 h-14 rounded-xl object-cover"
                          onError={e => e.target.src = 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=100&q=80'} />
                        {i === 0 && (
                          <span className="absolute -top-1.5 -right-1.5 bg-teal-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">★</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-800">{animal.name}</p>
                        <p className="text-gray-400 text-xs">{animal.species} · {animal.breed} · {animal.age} yrs</p>
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {animal.good_with_kids && <span className="text-xs bg-white text-teal-600 px-1.5 py-0.5 rounded-full border border-teal-200">👶 Kids</span>}
                          {animal.good_with_pets && <span className="text-xs bg-white text-teal-600 px-1.5 py-0.5 rounded-full border border-teal-200">🐾 Pets</span>}
                          {animal.vaccinated    && <span className="text-xs bg-white text-teal-600 px-1.5 py-0.5 rounded-full border border-teal-200">💉 Vacc</span>}
                        </div>
                      </div>
                      <span className="text-teal-400 text-lg flex-shrink-0 group-hover:translate-x-0.5 transition-transform">→</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-3">
                <button onClick={reset}
                  className="flex-1 py-3 rounded-xl font-bold text-sm border-2 border-teal-200 text-teal-600 bg-transparent cursor-pointer hover:bg-teal-50 transition-all">
                  Retake Quiz
                </button>
                <button onClick={() => { onClose(); navigate('/animals'); }}
                  className="flex-1 py-3 rounded-xl font-bold text-sm btn-primary border-0">
                  Browse All Animals
                </button>
              </div>
            </div>
          )}

          {/* Questions */}
          {!results && !loading && (
            <div>
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-3">{current.emoji}</div>
                <h3 className="text-lg font-black text-gray-800">{current.question}</h3>
              </div>
              <div className="flex flex-col gap-3">
                {current.options.map(opt => (
                  <button key={String(opt.value)} onClick={() => handleSelect(opt.value)}
                    className="flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-100 hover:border-teal-400 hover:bg-teal-50 transition-all text-left cursor-pointer bg-white w-full group">
                    <span className="text-2xl w-10 text-center flex-shrink-0">{opt.icon}</span>
                    <div>
                      <p className="font-bold text-gray-800 text-sm group-hover:text-teal-700">{opt.label}</p>
                      <p className="text-gray-400 text-xs mt-0.5">{opt.sub}</p>
                    </div>
                    <span className="ml-auto text-gray-300 group-hover:text-teal-400 text-lg group-hover:translate-x-0.5 transition-all">→</span>
                  </button>
                ))}
              </div>
              {step > 0 && (
                <button onClick={() => setStep(s => s - 1)}
                  className="mt-4 text-sm text-gray-400 hover:text-gray-600 bg-transparent border-0 cursor-pointer w-full text-center transition-colors">
                  ← Back
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
