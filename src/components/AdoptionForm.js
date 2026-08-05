import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../constants';
import { apiFetch } from '../api';
import MpesaPayment from './MpesaPayment';

const STEPS = ['Choose Animal', 'Your Details', 'Review & Submit'];

function AdoptionForm() {
  const [step, setStep]             = useState(0);
  const [animals, setAnimals]       = useState([]);
  const [animalId, setAnimalId]     = useState('');
  const [applicationType, setApplicationType] = useState('adopt');
  const [message, setMessage]       = useState('');
  const [homeType, setHomeType]     = useState('');
  const [hasChildren, setHasChildren] = useState('');
  const [hasPets, setHasPets]       = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading]   = useState(false);
  const [error, setError]           = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [adoptionId, setAdoptionId] = useState(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const userId = localStorage.getItem('user_id');

  useEffect(() => {
    apiFetch(`${API_BASE_URL}/animals`)
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(data => setAnimals(data.filter(a => a.status !== 'adopted')))
      .catch(() => setError('Failed to load animals'));
    const id = searchParams.get('animalId');
    if (id) { setAnimalId(id); setStep(1); }
  }, [searchParams]);

  const selectedAnimal = animalId ? animals.find(a => a.id === parseInt(animalId)) : null;

  const handleSubmit = async () => {
    if (!userId) { navigate('/login'); return; }
    setIsLoading(true); setError('');
    try {
      const fullMessage = `${message}\n\nHome type: ${homeType} | Children: ${hasChildren} | Other pets: ${hasPets}`;
      const res = await apiFetch(`${API_BASE_URL}/adopt`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ animal_id: parseInt(animalId), message: fullMessage, application_type: applicationType }),
      });
      const data = await res.json();
      if (res.ok) {
        setAdoptionId(data.adoption_id);
        // Foster-to-adopt has no upfront fee — only full adoptions pay via M-Pesa
        if (applicationType === 'foster') setIsSubmitted(true);
        else setShowPayment(true);
      }
      else setError(data.detail || 'Failed to submit');
    } catch { setError('Error submitting. Please try again.'); }
    finally { setIsLoading(false); }
  };

  if (isSubmitted) return (
    <div className="page-bg min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-10 max-w-md w-full shadow-card text-center border border-teal-50">
        <div className="w-20 h-20 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-5 shadow-glow-teal">🎉</div>
        <h2 className="text-2xl font-black text-gray-800 mb-2">Application Submitted!</h2>
        <p className="text-gray-500 mb-1">
          Your {applicationType === 'foster' ? 'foster-to-adopt' : 'adoption'} request for <span className="font-bold text-teal-600">{selectedAnimal?.name}</span> has been received.
        </p>
        <p className="text-gray-400 text-sm mb-5">The rescue center will review and get back to you soon. 🐾</p>
        <div className="bg-teal-50 rounded-xl p-3 mb-6 text-sm text-teal-700">
          💡 Track your application in <strong>My Profile → Applications</strong>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate('/animals')}
            className="flex-1 py-3 rounded-xl font-bold text-sm btn-primary">Browse More</button>
          <button onClick={() => navigate('/my-profile')}
            className="flex-1 py-3 rounded-xl font-bold text-sm border-2 border-teal-200 text-teal-600 bg-transparent cursor-pointer hover:bg-teal-50 transition-all">
            My Applications
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="page-bg min-h-screen">
      {showPayment && adoptionId && (
        <MpesaPayment
          adoptionId={adoptionId}
          animalName={selectedAnimal?.name}
          onSuccess={() => { setShowPayment(false); setIsSubmitted(true); setTimeout(() => navigate('/my-profile'), 2000); }}
          onCancel={() => setShowPayment(false)}
        />
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-500 px-6 py-12 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: 'radial-gradient(circle, white 1.5px, transparent 1.5px)', backgroundSize: '28px 28px' }} />
        <div className="relative z-10">
          <p className="section-label text-teal-200 mb-2">Adoption Application</p>
          <h1 className="text-3xl font-black text-white mb-1">Adopt a Pet 🐾</h1>
          <p className="text-teal-100">Complete your application in just a few steps</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="flex items-center mb-8">
          {STEPS.map((s, i) => (
            <React.Fragment key={i}>
              <div className="flex flex-col items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all
                  ${i < step ? 'bg-teal-500 text-white' :
                    i === step ? 'bg-teal-500 text-white ring-4 ring-teal-100' :
                    'bg-gray-100 text-gray-400'}`}>
                  {i < step ? '✓' : i + 1}
                </div>
                <p className={`text-xs mt-1.5 font-semibold ${i <= step ? 'text-teal-600' : 'text-gray-400'}`}>{s}</p>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-1 rounded-full mb-5 transition-all ${i < step ? 'bg-teal-500' : 'bg-gray-200'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-card border border-teal-50">

          {/* Step 0 */}
          {step === 0 && (
            <div>
              <h3 className="text-xl font-black text-gray-800 mb-5">Which animal would you like to adopt?</h3>
              <div className="flex flex-col gap-3 max-h-96 overflow-y-auto pr-1">
                {animals.map(animal => (
                  <div key={animal.id} onClick={() => setAnimalId(String(animal.id))}
                    className={`flex items-center gap-3 p-3 rounded-2xl border-2 cursor-pointer transition-all
                      ${animalId === String(animal.id) ? 'border-teal-500 bg-teal-50' : 'border-gray-100 hover:border-teal-200 hover:bg-teal-50/50'}`}>
                    <img src={animal.image} alt={animal.name}
                      className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                      onError={e => e.target.src = 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=100&q=80'} />
                    <div className="flex-1">
                      <p className="font-bold text-gray-800">{animal.name}</p>
                      <p className="text-gray-400 text-xs">{animal.species} · {animal.breed} · {animal.age} yrs</p>
                      <p className="text-gray-400 text-xs">📍 {animal.center?.name}</p>
                    </div>
                    {animalId === String(animal.id) && <span className="text-teal-600 text-xl">✓</span>}
                  </div>
                ))}
              </div>
              <button disabled={!animalId} onClick={() => setStep(1)}
                className={`w-full mt-5 py-3 rounded-xl font-bold text-base transition-all border-0
                  ${animalId ? 'btn-primary' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>
                Continue →
              </button>
            </div>
          )}

          {/* Step 1 */}
          {step === 1 && (
            <div>
              {selectedAnimal && (
                <div className="flex items-center gap-3 p-3 bg-teal-50 rounded-2xl border border-teal-100 mb-6">
                  <img src={selectedAnimal.image} alt={selectedAnimal.name}
                    className="w-14 h-14 rounded-xl object-cover"
                    onError={e => e.target.src = 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=100&q=80'} />
                  <div className="flex-1">
                    <p className="font-bold text-gray-800">{selectedAnimal.name}</p>
                    <p className="text-gray-400 text-xs">{selectedAnimal.species} · {selectedAnimal.breed}</p>
                  </div>
                  <button onClick={() => setStep(0)} className="text-teal-600 text-xs font-semibold bg-transparent border-0 cursor-pointer">Change</button>
                </div>
              )}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-600 mb-2">How would you like to bring {selectedAnimal?.name || 'them'} home?</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    ['adopt', '🏠', 'Full Adoption', 'Permanent — pay the adoption fee now'],
                    ['foster', '🐣', 'Foster-to-Adopt', 'Trial period first, no fee — make it official later'],
                  ].map(([val, icon, label, sub]) => (
                    <div key={val} onClick={() => setApplicationType(val)}
                      className={`p-3 rounded-xl border-2 cursor-pointer transition-all
                        ${applicationType === val ? 'border-teal-500 bg-teal-50' : 'border-gray-100 hover:border-teal-200'}`}>
                      <div className="text-xl mb-1">{icon}</div>
                      <p className="font-bold text-sm text-gray-800">{label}</p>
                      <p className="text-gray-400 text-xs mt-0.5">{sub}</p>
                    </div>
                  ))}
                </div>
              </div>

              <h3 className="text-xl font-black text-gray-800 mb-5">Tell us about your home</h3>

              {[
                { label: 'Home Type', value: homeType, set: setHomeType, options: [['House', '🏠'], ['Apartment', '🏢'], ['Farm', '🌾']], cols: 3 },
                { label: 'Do you have children?', value: hasChildren, set: setHasChildren, options: [['Yes', '👨‍👩‍👧'], ['No', '👤']], cols: 2 },
                { label: 'Do you have other pets?', value: hasPets, set: setHasPets, options: [['Yes', '🐾'], ['No', '❌']], cols: 2 },
              ].map(({ label, value, set, options, cols }) => (
                <div key={label} className="mb-5">
                  <label className="block text-sm font-semibold text-gray-600 mb-2">{label}</label>
                  <div className={`grid grid-cols-${cols} gap-2`}>
                    {options.map(([opt, icon]) => (
                      <div key={opt} onClick={() => set(opt)}
                        className={`p-3 text-center rounded-xl border-2 cursor-pointer font-semibold text-sm transition-all
                          ${value === opt ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-gray-100 text-gray-600 hover:border-teal-200'}`}>
                        <div className="text-xl mb-1">{icon}</div>{opt}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div className="mb-5">
                <label className="block text-sm font-semibold text-gray-600 mb-2">Why do you want to adopt {selectedAnimal?.name}?</label>
                <textarea value={message} onChange={e => setMessage(e.target.value)}
                  placeholder={`Tell us why you'd be a perfect match for ${selectedAnimal?.name || 'this animal'}...`}
                  rows={4} className="input-field resize-none" />
              </div>

              {error && <p className="text-coral-600 text-sm mb-4">⚠️ {error}</p>}

              <div className="flex gap-3">
                <button onClick={() => setStep(0)} className="flex-1 py-3 rounded-xl font-bold text-sm border-2 border-gray-200 text-gray-600 bg-transparent cursor-pointer hover:bg-gray-50 transition-all">← Back</button>
                <button disabled={!message || !homeType || !hasChildren || !hasPets} onClick={() => setStep(2)}
                  className={`flex-[2] py-3 rounded-xl font-bold text-sm transition-all border-0
                    ${message && homeType && hasChildren && hasPets ? 'btn-primary' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>
                  Review Application →
                </button>
              </div>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div>
              <h3 className="text-xl font-black text-gray-800 mb-5">Review Your Application</h3>
              {selectedAnimal && (
                <div className="flex items-center gap-3 p-4 bg-teal-50 rounded-2xl border border-teal-100 mb-5">
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
                {[['Application Type', applicationType === 'foster' ? '🐣 Foster-to-Adopt' : '🏠 Full Adoption'], ['Home Type', homeType], ['Has Children', hasChildren], ['Has Other Pets', hasPets]].map(([label, val], i, arr) => (
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

              {error && <p className="text-coral-600 text-sm mb-4">⚠️ {error}</p>}

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="flex-1 py-3 rounded-xl font-bold text-sm border-2 border-gray-200 text-gray-600 bg-transparent cursor-pointer hover:bg-gray-50 transition-all">← Back</button>
                <button disabled={isLoading} onClick={handleSubmit}
                  className={`flex-[2] py-3 rounded-xl font-bold text-sm transition-all border-0
                    ${isLoading ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'btn-coral'}`}>
                  {isLoading ? '⏳ Submitting...' : applicationType === 'foster' ? '🐣 Submit Foster Application' : '🐾 Submit & Pay via M-PESA'}
                </button>
              </div>

              {applicationType === 'adopt' ? (
                <div className="mt-4 flex items-center gap-3 bg-teal-50 border border-teal-200 rounded-xl p-3">
                  <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center text-white text-lg flex-shrink-0">💚</div>
                  <div>
                    <p className="text-teal-800 font-bold text-sm">Pay KES 500 adoption fee via M-PESA</p>
                    <p className="text-teal-600 text-xs">You'll receive an STK Push prompt on your phone after submitting</p>
                  </div>
                </div>
              ) : (
                <div className="mt-4 flex items-center gap-3 bg-cream-50 border border-cream-200 rounded-xl p-3">
                  <div className="w-10 h-10 bg-cream-500 rounded-lg flex items-center justify-center text-white text-lg flex-shrink-0">🐣</div>
                  <div>
                    <p className="text-cream-800 font-bold text-sm">No fee for fostering</p>
                    <p className="text-cream-700 text-xs">Once approved, you can log updates in your Foster Journal and finalize the adoption anytime</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdoptionForm;
