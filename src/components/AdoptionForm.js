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
    setIsLoading(true);
    setError('');
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
    <div className="app-container">
      <div style={{ maxWidth: '600px', margin: '4rem auto', padding: '3rem', background: 'white', borderRadius: '24px', boxShadow: '0 20px 60px rgba(0,0,0,0.1)', textAlign: 'center' }}>
        <div style={{ width: '80px', height: '80px', background: 'linear-gradient(135deg, #667eea, #764ba2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', margin: '0 auto 1.5rem' }}>🎉</div>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#2d3748', marginBottom: '1rem' }}>Application Submitted!</h2>
        <p style={{ color: '#718096', fontSize: '1.1rem', lineHeight: 1.7, marginBottom: '0.5rem' }}>
          Your adoption request for <strong style={{ color: '#667eea' }}>{selectedAnimal?.name}</strong> has been received.
        </p>
        <p style={{ color: '#718096', marginBottom: '2rem' }}>The rescue center will review your application and get back to you soon. 🐾</p>
        <div style={{ background: '#f8f9ff', borderRadius: '12px', padding: '1rem', marginBottom: '2rem', fontSize: '0.9rem', color: '#667eea' }}>
          💡 Track your application status in <strong>My Profile → Applications</strong>
        </div>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button className="form-submit-btn" style={{ width: 'auto', padding: '0.75rem 2rem' }} onClick={() => navigate('/animals')}>Browse More Animals</button>
          <button onClick={() => navigate('/my-profile')} style={{ padding: '0.75rem 2rem', border: '2px solid #667eea', borderRadius: '12px', background: 'transparent', color: '#667eea', fontWeight: 600, cursor: 'pointer' }}>View My Applications</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="app-container">
      <div className="page-header">
        <h1>Adopt a Pet 🐾</h1>
        <p>Complete your adoption application in just a few steps</p>
      </div>

      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '2rem' }}>
        {/* Progress Steps */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2.5rem' }}>
          {STEPS.map((s, i) => (
            <React.Fragment key={i}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1rem', transition: 'all 0.3s',
                  background: i < step ? 'linear-gradient(135deg, #667eea, #764ba2)' : i === step ? 'linear-gradient(135deg, #667eea, #764ba2)' : '#e2e8f0',
                  color: i <= step ? 'white' : '#a0aec0' }}>
                  {i < step ? '✓' : i + 1}
                </div>
                <div style={{ fontSize: '0.8rem', marginTop: '0.4rem', fontWeight: 600, color: i <= step ? '#667eea' : '#a0aec0' }}>{s}</div>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ flex: 1, height: '3px', background: i < step ? 'linear-gradient(135deg, #667eea, #764ba2)' : '#e2e8f0', transition: 'all 0.3s', marginBottom: '1.5rem' }} />
              )}
            </React.Fragment>
          ))}
        </div>

        <div style={{ background: 'white', borderRadius: '20px', padding: '2.5rem', boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}>

          {/* Step 0: Choose Animal */}
          {step === 0 && (
            <div>
              <h3 style={{ color: '#2d3748', fontWeight: 700, marginBottom: '1.5rem', fontSize: '1.3rem' }}>Which animal would you like to adopt?</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '400px', overflowY: 'auto' }}>
                {animals.map(animal => (
                  <div key={animal.id} onClick={() => setAnimalId(String(animal.id))}
                    style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', borderRadius: '12px', border: `2px solid ${animalId === String(animal.id) ? '#667eea' : '#e2e8f0'}`, cursor: 'pointer', transition: 'all 0.2s', background: animalId === String(animal.id) ? 'rgba(102,126,234,0.05)' : 'white' }}>
                    <img src={animal.image} alt={animal.name} style={{ width: '60px', height: '60px', borderRadius: '10px', objectFit: 'cover', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, color: '#2d3748' }}>{animal.name}</div>
                      <div style={{ color: '#718096', fontSize: '0.9rem' }}>{animal.species} · {animal.breed} · {animal.age} yrs</div>
                      <div style={{ color: '#718096', fontSize: '0.85rem' }}>{animal.center?.name}</div>
                    </div>
                    {animalId === String(animal.id) && <div style={{ color: '#667eea', fontSize: '1.5rem' }}>✓</div>}
                  </div>
                ))}
              </div>
              <button className="form-submit-btn" style={{ marginTop: '1.5rem' }} disabled={!animalId} onClick={() => setStep(1)}>
                Continue →
              </button>
            </div>
          )}

          {/* Step 1: Your Details */}
          {step === 1 && (
            <div>
              {selectedAnimal && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'linear-gradient(135deg, rgba(102,126,234,0.08), rgba(118,75,162,0.08))', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid rgba(102,126,234,0.2)' }}>
                  <img src={selectedAnimal.image} alt={selectedAnimal.name} style={{ width: '60px', height: '60px', borderRadius: '10px', objectFit: 'cover' }} />
                  <div>
                    <div style={{ fontWeight: 700, color: '#2d3748' }}>{selectedAnimal.name}</div>
                    <div style={{ color: '#718096', fontSize: '0.9rem' }}>{selectedAnimal.species} · {selectedAnimal.breed}</div>
                  </div>
                  <button onClick={() => setStep(0)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#667eea', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}>Change</button>
                </div>
              )}

              <h3 style={{ color: '#2d3748', fontWeight: 700, marginBottom: '1.5rem', fontSize: '1.3rem' }}>Tell us about your home</h3>

              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">Home Type</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                  {['House', 'Apartment', 'Farm'].map(type => (
                    <div key={type} onClick={() => setHomeType(type)}
                      style={{ padding: '0.75rem', textAlign: 'center', borderRadius: '10px', border: `2px solid ${homeType === type ? '#667eea' : '#e2e8f0'}`, cursor: 'pointer', fontWeight: 600, color: homeType === type ? '#667eea' : '#4a5568', background: homeType === type ? 'rgba(102,126,234,0.05)' : 'white', transition: 'all 0.2s' }}>
                      {type === 'House' ? '🏠' : type === 'Apartment' ? '🏢' : '🌾'} {type}
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">Do you have children?</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  {['Yes', 'No'].map(opt => (
                    <div key={opt} onClick={() => setHasChildren(opt)}
                      style={{ padding: '0.75rem', textAlign: 'center', borderRadius: '10px', border: `2px solid ${hasChildren === opt ? '#667eea' : '#e2e8f0'}`, cursor: 'pointer', fontWeight: 600, color: hasChildren === opt ? '#667eea' : '#4a5568', background: hasChildren === opt ? 'rgba(102,126,234,0.05)' : 'white', transition: 'all 0.2s' }}>
                      {opt === 'Yes' ? '👨‍👩‍👧' : '👤'} {opt}
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">Do you have other pets?</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  {['Yes', 'No'].map(opt => (
                    <div key={opt} onClick={() => setHasPets(opt)}
                      style={{ padding: '0.75rem', textAlign: 'center', borderRadius: '10px', border: `2px solid ${hasPets === opt ? '#667eea' : '#e2e8f0'}`, cursor: 'pointer', fontWeight: 600, color: hasPets === opt ? '#667eea' : '#4a5568', background: hasPets === opt ? 'rgba(102,126,234,0.05)' : 'white', transition: 'all 0.2s' }}>
                      {opt === 'Yes' ? '🐾' : '❌'} {opt}
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Why do you want to adopt {selectedAnimal?.name}?</label>
                <textarea className="form-input form-textarea" value={message} onChange={e => setMessage(e.target.value)}
                  placeholder={`Tell us why you'd be a perfect match for ${selectedAnimal?.name || 'this animal'}...`} rows="4" required />
              </div>

              {error && <div className="error-message">{error}</div>}

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button onClick={() => setStep(0)} style={{ flex: 1, padding: '1rem', border: '2px solid #e2e8f0', borderRadius: '12px', background: 'white', color: '#4a5568', fontWeight: 600, cursor: 'pointer', fontSize: '1rem' }}>← Back</button>
                <button className="form-submit-btn" style={{ flex: 2, margin: 0 }} disabled={!message || !homeType || !hasChildren || !hasPets} onClick={() => setStep(2)}>Review Application →</button>
              </div>
            </div>
          )}

          {/* Step 2: Review */}
          {step === 2 && (
            <div>
              <h3 style={{ color: '#2d3748', fontWeight: 700, marginBottom: '1.5rem', fontSize: '1.3rem' }}>Review Your Application</h3>

              {selectedAnimal && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem', background: 'linear-gradient(135deg, rgba(102,126,234,0.08), rgba(118,75,162,0.08))', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid rgba(102,126,234,0.2)' }}>
                  <img src={selectedAnimal.image} alt={selectedAnimal.name} style={{ width: '70px', height: '70px', borderRadius: '12px', objectFit: 'cover' }} />
                  <div>
                    <div style={{ fontWeight: 700, color: '#2d3748', fontSize: '1.1rem' }}>{selectedAnimal.name}</div>
                    <div style={{ color: '#718096' }}>{selectedAnimal.species} · {selectedAnimal.breed} · {selectedAnimal.age} yrs</div>
                    <div style={{ color: '#718096', fontSize: '0.85rem' }}>📍 {selectedAnimal.center?.name}</div>
                  </div>
                </div>
              )}

              <div style={{ background: '#f8f9ff', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem' }}>
                {[
                  { label: 'Home Type', value: homeType },
                  { label: 'Has Children', value: hasChildren },
                  { label: 'Has Other Pets', value: hasPets },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: i < 2 ? '1px solid #e2e8f0' : 'none' }}>
                    <span style={{ color: '#718096', fontWeight: 500 }}>{item.label}</span>
                    <span style={{ color: '#2d3748', fontWeight: 700 }}>{item.value}</span>
                  </div>
                ))}
              </div>

              <div style={{ background: '#f8f9ff', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem' }}>
                <div style={{ color: '#718096', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 600 }}>YOUR MESSAGE</div>
                <p style={{ color: '#2d3748', margin: 0, lineHeight: 1.6, fontStyle: 'italic' }}>"{message}"</p>
              </div>

              {error && <div className="error-message" style={{ marginBottom: '1rem' }}>{error}</div>}

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button onClick={() => setStep(1)} style={{ flex: 1, padding: '1rem', border: '2px solid #e2e8f0', borderRadius: '12px', background: 'white', color: '#4a5568', fontWeight: 600, cursor: 'pointer', fontSize: '1rem' }}>← Back</button>
                <button className="form-submit-btn" style={{ flex: 2, margin: 0 }} disabled={isLoading} onClick={handleSubmit}>
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
