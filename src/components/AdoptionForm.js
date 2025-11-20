import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../constants';

function AdoptionForm() {
  const [animals, setAnimals] = useState([]);
  const [userId, setUserId] = useState('');
  const [animalId, setAnimalId] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch animals for the dropdown
    fetch(`${API_BASE_URL}/animals`)
      .then(res => res.json())
      .then(data => {
        setAnimals(data);
        // Get animalId from URL params and set selected animal
        const animalIdParam = searchParams.get('animalId');
        if (animalIdParam) {
          setAnimalId(animalIdParam);
          const animal = data.find(a => a.id.toString() === animalIdParam);
          setSelectedAnimal(animal);
        }
      })
      .catch(error => console.error(error));

    // Get user_id from localStorage
    const storedUserId = localStorage.getItem('user_id');
    if (storedUserId) {
      setUserId(storedUserId);
    } else {
      // Redirect to login if not logged in
      navigate('/login');
    }
  }, [searchParams, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!userId) {
      alert('Please log in first');
      navigate('/login');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/adopt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
        alert(data.detail || 'Error submitting adoption request');
      }
    } catch (error) {
      alert('Error submitting adoption request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAnimalChange = (e) => {
    const id = e.target.value;
    setAnimalId(id);
    const animal = animals.find(a => a.id.toString() === id);
    setSelectedAnimal(animal);
  };

  if (isSubmitted) {
    return (
      <div className="app-container">
        <div className="adoption-form-container">
          <div className="text-center">
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
            <h1 className="adoption-form-title">Adoption Request Submitted!</h1>
            <p className="success-message">Thank you for your interest in adopting {selectedAnimal?.name}! We'll review your application and get back to you soon.</p>
            <button
              onClick={() => navigate('/animals')}
              className="form-submit-btn"
              style={{ marginTop: '2rem' }}
            >
              Browse More Animals
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="adoption-form-container">
        <h1 className="adoption-form-title">Start Your Adoption Journey</h1>

        {selectedAnimal && (
          <div className="selected-animal-preview" style={{
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            borderRadius: '15px',
            padding: '1.5rem',
            marginBottom: '2rem',
            color: 'white',
            textAlign: 'center'
          }}>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem' }}>
              🐾 Adopting: {selectedAnimal.name}
            </h3>
            <p style={{ margin: 0, opacity: 0.9 }}>
              {selectedAnimal.species} • {selectedAnimal.breed} • {selectedAnimal.age} years old
            </p>
          </div>
        )}

        <form className="adoption-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="animal">Select Animal:</label>
            <select
              id="animal"
              className="form-select"
              value={animalId}
              onChange={handleAnimalChange}
              required
            >
              <option value="">Choose an animal to adopt</option>
              {animals.map(animal => (
                <option key={animal.id} value={animal.id}>
                  {animal.name} - {animal.species} ({animal.breed})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="message">Your Adoption Story:</label>
            <textarea
              id="message"
              className="form-textarea"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us why you want to adopt this animal, your lifestyle, experience with pets, and anything else you'd like us to know..."
              required
              rows="6"
            />
          </div>

          <button
            type="submit"
            className="form-submit-btn"
            disabled={isSubmitting || !userId}
          >
            {isSubmitting ? (
              <>
                <span className="loading" style={{ marginRight: '0.5rem' }}></span>
                Submitting...
              </>
            ) : (
              '🚀 Submit Adoption Request'
            )}
          </button>

          {!userId && (
            <p className="error-message">
              You must be logged in to submit an adoption request.
              <button
                type="button"
                className="link-btn"
                onClick={() => navigate('/login')}
                style={{ display: 'block', marginTop: '0.5rem' }}
              >
                Go to Login
              </button>
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

export default AdoptionForm;
