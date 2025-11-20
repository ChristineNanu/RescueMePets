import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../constants';

function AnimalList() {
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_BASE_URL}/animals`)
      .then(res => res.json())
      .then(data => {
        setAnimals(data);
        setLoading(false);
      })
      .catch(error => {
        console.error(error);
        setLoading(false);
      });
  }, []);

  const handleAdopt = (animalId) => {
    navigate(`/adoption?animalId=${animalId}`);
  };

  if (loading) {
    return (
      <div className="page-header">
        <h1>Loading Animals...</h1>
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <div className="loading"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="page-header">
        <h1>Find Your Perfect Companion</h1>
        <p>Discover amazing animals waiting for their forever homes</p>
      </div>

      <div className="animal-list">
        {animals.map(animal => (
          <div className="animal-card fade-in" key={animal.id}>
            <img
              src={animal.image || `https://picsum.photos/400/300?random=${animal.id}`}
              alt={animal.name}
              className="animal-image"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
              }}
            />
            <div className="animal-card-content">
              <h3 className="animal-name">{animal.name}</h3>
              <div className="animal-details">
                <div className="animal-detail">
                  <strong>Species:</strong> {animal.species}
                </div>
                <div className="animal-detail">
                  <strong>Breed:</strong> {animal.breed}
                </div>
                <div className="animal-detail">
                  <strong>Age:</strong> {animal.age} years
                </div>
                <div className="animal-detail">
                  <strong>Center:</strong> {animal.center ? animal.center.name : 'Unknown'}
                </div>
              </div>
              <p className="animal-description">{animal.description}</p>
              <button onClick={() => handleAdopt(animal.id)}>
                🐾 Adopt Me!
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AnimalList;
