import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../constants';

const STEPS = ['Choose Animal', 'Your Details', 'Review & Submit'];

function AdoptionForm() {
  const [step, setStep] = useState(0);
  const [animals, setAnimals] = useState([]);
  const [animalId, setAnimalId] = useState('');
  const [message, setMessage] = useState('');
  const [homeType, setHomeType] = useState('');
  const [hasChildren, setHasChildren] = useState('');
  const [hasPets, setHasPets] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const userId = localStorage.getItem('user_id');

  useEffect(() => {
    fetch(`${API_BASE_URL}/animals`)
      .then(r => r.json())
      .then(data => setAnimals(data.filter(a => a.status !== 'adopted')))
      .catch(() => setError('Failed to load animals'));
    const id = searchParams.get('animalId');
    if (id) { setAnimalId(id); setStep(1); }
  }, [searchParams]);

  const selectedAnimal = animals.find(a => a.id === parseInt(animalId));

  const handleSubmit = async () => {
    if (!userId) { navigate('/login'); return; }
    setIsLoading(true); setError('');
    try {
      const fullMessage = `${message}\n\nHome type: ${homeType} | Children: ${hasChildren} | Other pets: ${hasPets}`;
      const res = await fetch(`${API_BASE_URL}/adopt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: parseInt(userId), animal_id: parseInt(animalId), message: fullMessage }),
      });
      const data = await res.json();
      if (res.ok) setIsSubmitted(true);
      else setError(data.detail || 'Failed to submit');
    } catch { setError('Error submitting. Please try again.'); }
    finally { setIsLoading(false); }
  };

  if (isSubmitted) return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-10 max-w-md w-full shadow-xl text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-5">🎉</div>
        <h2 className="text-2xl font-extrabold text-gray-800 mb-2">Application Submitted!</h2>
        <p className="text-gray-500 mb-1">
          Your adoption request for <span className="font-bold text-violet-600">{selectedAnimal?.name}</span> has been received.
        </p>
        <p className="text-gray-400 text-sm mb-5">The rescue center will review and get back to you soon. 🐾</p>
        <div className="bg-violet-50 rounded-xl p-3 mb-6 text-sm text-violet-700">
          💡 Track your application in <strong>My Profile → Applications</strong>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate('/animals')}
            className="flex-1 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-violet-600 to-purple-700 text-white border-0 cursor-pointer hover:shadow-lg transition-all">
            Browse More
          </button>
          <button onClick={() => navigate('/my-profile')}
            className="flex-1 py-3 rounded-xl font-bold text-sm border-2 border-violet-200 text-violet-600 bg-transparent cursor-pointer hover:bg-violet-50 transition-all">
            My Applications
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-purple-50/20">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-700 px-6 py-10 text-center">
        <h1 className="text-3xl font-extrabold text-white mb-1">Adopt a Pet 🐾</h1>
        <p className="text-violet-200">Complete your adoption application in just a few steps</p>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="flex items-center mb-8">
          {STEPS.map((s, i) => (
            <React.Fragment key={i}>
              <div className="flex flex-col items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all
                  ${i < step ? 'bg-gradient-to-br from-violet-600 to-purple-700 text-white' :
                    i === step ? 'bg-gradient-to-br from-violet-600 to-purple-700 text-white ring-4 ring-violet-200' :
                    'bg-gray-100 text-gray-400'}`}>
                  {i < step ? '✓' : i + 1}
                </div>
                <p className={`text-xs mt-1.5 font-semibold ${i <= step ? 'text-violet-600' : 'text-gray-400'}`}>{s}</p>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-1 rounded-full mb-5 transition-all ${i < step ? 'bg-gradient-to-r from-violet-600 to-purple-700' : 'bg-gray-200'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">

          {/* Step 0: Choose Animal */}
          {step === 0 && (
            <div>
              <h3 className="text-xl font-extrabold text-gray-800 mb-5">Which animal would you like to adopt?</h3>
              <div className="flex flex-col gap-3 max-h-96 overflow-y-auto pr-1">
                {animals.map(animal => (
                  <div key={animal.id} onClick={() => setAnimalId(String(animal.id))}
                    className={`flex items-center gap-3 p-3 rounded-2xl border-2 cursor-pointer transition-all
                      ${animalId === String(animal.id) ? 'border-violet-500 bg-violet-50' : 'border-gray-100 hover:border-violet-200 hover:bg-violet-50/50'}`}>
                    <img src={animal.image} alt={animal.name}
                      className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                      onError={e => e.target.src = 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=100&q=80'} />
                    <div className="flex-1">
                      <p className="font-bold text-gray-800">{animal.name}</p>
                      <p className="text-gray-400 text-xs">{animal.species} · {animal.breed} · {animal.age} yrs</p>
                      <p className="text-gray-400 text-xs">📍 {animal.center?.name}</p>
                    </div>
                    {animalId === String(animal.id) && <span className="text-violet-600 text-xl">✓</span>}
                  </div>
                ))}
              </div>
              <button disabled={!animalId} onClick={() => setStep(1)}
                className={`w-full mt-5 py-3 rounded-xl font-bold text-base transition-all border-0
                  ${animalId ? 'bg-gradient-to-r from-violet-600 to-purple-700 text-white cursor-pointer hover:shadow-lg' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>
                Continue →
              </button>
            </div>
          )}

          {/* Step 1: Details */}
          {step === 1 && (
            <div>
              {selectedAnimal && (
                <div className="flex items-center gap-3 p-3 bg-violet-50 rounded-2xl border border-violet-100 mb-6">
                  <img src={selectedAnimal.image} alt={selectedAnimal.name}
                    className="w-14 h-14 rounded-xl object-cover"
                    onError={e => e.target.src = 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=100&q=80'} />
                  <div className="flex-1">
                    <p className="font-bold text-gray-800">{selectedAnimal.name}</p>
                    <p className="text-gray-400 text-xs">{selectedAnimal.species} · {selectedAnimal.breed}</p>
                  </div>
                  <button onClick={() => setStep(0)} className="text-violet-600 text-xs font-semibold bg-transparent border-0 cursor-pointer">Change</button>
                </div>
              )}

              <h3 className="text-xl font-extrabold text-gray-800 mb-5">Tell us about your home</h3>

              <div className="mb-5">
                <label className="block text-sm font-semibold text-gray-600 mb-2">Home Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {[['House', '🏠'], ['Apartment', '🏢'], ['Farm', '🌾']].map(([type, icon]) => (
                    <div key={type} onClick={() => setHomeType(type)}
                      className={`p-3 text-center rounded-xl border-2 cursor-pointer font-semibold text-sm transition-all
                        ${homeType === type ? 'border-violet-500 bg-violet-50 text-violet-700' : 'border-gray-100 text-gray-600 hover:border-violet-200'}`}>
                      <div className="text-xl mb-1">{icon}</div>{type}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-5">
                <label className="block text-sm font-semibold text-gray-600 mb-2">Do you have children?</label>
                <div className="grid grid-cols-2 gap-2">
                  {[['Yes', '👨‍👩‍👧'], ['No', '👤']].map(([opt, icon]) => (
                    <div key={opt} onClick={() => setHasChildren(opt)}
                      className={`p-3 text-center rounded-xl border-2 cursor-pointer font-semibold text-sm transition-all
                        ${hasChildren === opt ? 'border-violet-500 bg-violet-50 text-violet-700' : 'border-gray-100 text-gray-600 hover:border-violet-200'}`}>
                      <div className="text-xl mb-1">{icon}</div>{opt}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-5">
                <label className="block text-sm font-semibold text-gray-600 mb-2">Do you have other pets?</label>
                <div className="grid grid-cols-2 gap-2">
                  {[['Yes', '🐾'], ['No', '❌']].map(([opt, icon]) => (
                    <div key={opt} onClick={() => setHasPets(opt)}
                      className={`p-3 text-center rounded-xl border-2 cursor-pointer font-semibold text-sm transition-all
                        ${hasPets === opt ? 'border-violet-500 bg-violet-50 text-violet-700' : 'border-gray-100 text-gray-600 hover:border-violet-200'}`}>
                      <div className="text-xl mb-1">{icon}</div>{opt}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-5">
                <label className="block text-sm font-semibold text-gray-600 mb-2">
                  Why do you want to adopt {selectedAnimal?.name}?
                </label>
                <textarea
                  value={message} onChange={e => setMessage(e.target.value)}
                  placeholder={`Tell us why you'd be a perfect match for ${selectedAnimal?.name || 'this animal'}...`}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-violet-400 focus:outline-none text-gray-700 text-sm resize-none transition-colors"
                />
              </div>

              {error && <p className="text-red-500 text-sm mb-4">⚠️ {error}</p>}

              <div className="flex gap-3">
                <button onClick={() => setStep(0)}
                  className="flex-1 py-3 rounded-xl font-bold text-sm border-2 border-gray-200 text-gray-600 bg-transparent cursor-pointer hover:bg-gray-50 transition-all">
                  ← Back
                </button>
                <button disabled={!message || !homeType || !hasChildren || !hasPets} onClick={() => setStep(2)}
                  className={`flex-[2] py-3 rounded-xl font-bold text-sm transition-all border-0
                    ${message && homeType && hasChildren && hasPets
                      ? 'bg-gradient-to-r from-violet-600 to-purple-700 text-white cursor-pointer hover:shadow-lg'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>
                  Review Application →
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Review */}
          {step === 2 && (
            <div>
              <h3 className="text-xl font-extrabold text-gray-800 mb-5">Review Your Application</h3>

              {selectedAnimal && (
                <div className="flex items-center gap-3 p-4 bg-violet-50 rounded-2xl border border-violet-100 mb-5">
                  <img src={selectedAnimal.image} alt={selectedAnimal.name}
                    className="w-16 h-16 rounded-xl object-cover"
                    onError={e => e.target.src = 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=100&q=80'} />
                  <div>
                    <p className="font-bold text-gray-800 text-base">{selectedAnimal.name}</p>
                    <p className="text-gray-400 text-sm">{selectedAnimal.species} · {selectedAnimal.breed} · {selectedAnimal.age} yrs</p>
                    <p className="text-gray-400 text-xs">📍 {selectedAnimal.center?.name}</p>
                  </div>
                </div>
              )}

              <div className="bg-gray-50 rounded-2xl p-4 mb-4">
                {[['Home Type', homeType], ['Has Children', hasChildren], ['Has Other Pets', hasPets]].map(([label, val], i, arr) => (
                  <div key={label} className={`flex justify-between py-2.5 ${i < arr.length - 1 ? 'border-b border-gray-200' : ''}`}>
                    <span className="text-gray-500 text-sm">{label}</span>
                    <span className="font-bold text-gray-700 text-sm">{val}</span>
                  </div>
                ))}
              </div>

              <div className="bg-gray-50 rounded-2xl p-4 mb-5">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Your Message</p>
                <p className="text-gray-600 text-sm italic leading-relaxed">"{message}"</p>
              </div>

              {error && <p className="text-red-500 text-sm mb-4">⚠️ {error}</p>}

              <div className="flex gap-3">
                <button onClick={() => setStep(1)}
                  className="flex-1 py-3 rounded-xl font-bold text-sm border-2 border-gray-200 text-gray-600 bg-transparent cursor-pointer hover:bg-gray-50 transition-all">
                  ← Back
                </button>
                <button disabled={isLoading} onClick={handleSubmit}
                  className={`flex-[2] py-3 rounded-xl font-bold text-sm transition-all border-0
                    ${isLoading ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-violet-600 to-purple-700 text-white cursor-pointer hover:shadow-lg'}`}>
                  {isLoading ? '⏳ Submitting...' : '🐾 Submit Application'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdoptionForm;
