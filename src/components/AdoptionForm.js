import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../constants';

function AdoptionForm() {
  const [animals, setAnimals] = useState([]);
  const [animalId, setAnimalId] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const userId = localStorage.getItem('user_id');

  useEffect(() => {
    fetch(`${API_BASE_URL}/animals`)
      .then(res => res.json())
      .then(data => setAnimals(data))
      .catch(() => setError('Failed to load animals'));

    const animalIdParam = searchParams.get('animalId');
    if (animalIdParam) setAnimalId(animalIdParam);
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) {
      setError('You must be logged in to adopt');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/adopt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: parseInt(userId),
          animal_id: parseInt(animalId),
          message
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setIsSubmitted(true);
      } else {
        setError(data.detail || 'Failed to submit adoption request');
      }
    } catch {
      setError('Error submitting adoption request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedAnimal = animals.find(a => a.id === parseInt(animalId));

  if (isSubmitted) {
    return (
      <div className="app-container">
        <div className="adoption-form-container" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>🎉</div>
          <h2 className="adoption-form-title">Request Submitted!</h2>
          <p style={{ color: '#718096', fontSize: '1.1rem', marginBottom: '2rem' }}>
            Your adoption request for <strong>{selectedAnimal?.name}</strong> has been submitted successfully.
            We'll be in touch soon!
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button className="btn-primary" onClick={() => navigate('/animals')}>
              🐾 Browse More Animals
            </button>
            <button className="btn-secondary" onClick={() => { setIsSubmitted(false); setMessage(''); }}>
              Submit Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="page-header">
        <h1>Adopt a Pet 🐾</h1>
        <p>Fill out the form below to start your adoption journey</p>
      </div>

      <div className="adoption-form-container">
        <h2 className="adoption-form-title">Adoption Application</h2>

        {selectedAnimal && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '1rem',
            background: 'linear-gradient(135deg, rgba(102,126,234,0.1), rgba(118,75,162,0.1))',
            borderRadius: '12px',
            marginBottom: '1.5rem',
            border: '1px solid rgba(102,126,234,0.2)'
          }}>
            <img
              src={selectedAnimal.image || `https://picsum.photos/80/80?random=${selectedAnimal.id}`}
              alt={selectedAnimal.name}
              style={{ width: '70px', height: '70px', borderRadius: '12px', objectFit: 'cover' }}
            />
            <div>
              <div style={{ fontWeight: '700', fontSize: '1.2rem', color: '#2d3748' }}>{selectedAnimal.name}</div>
              <div style={{ color: '#718096' }}>{selectedAnimal.species} · {selectedAnimal.breed} · {selectedAnimal.age} yrs</div>
            </div>
          </div>
        )}

        <form className="adoption-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Select Animal</label>
            <select
              className="form-input"
              value={animalId}
              onChange={(e) => setAnimalId(e.target.value)}
              required
            >
              <option value="">Choose an animal...</option>
              {animals.map(animal => (
                <option key={animal.id} value={animal.id}>
                  {animal.name} — {animal.species} ({animal.breed})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Why do you want to adopt?</label>
            <textarea
              className="form-input form-textarea"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us about yourself and why you'd be a great match for this animal..."
              rows="5"
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="form-submit-btn" disabled={isLoading}>
            {isLoading ? '⏳ Submitting...' : '🐾 Submit Adoption Request'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdoptionForm;
