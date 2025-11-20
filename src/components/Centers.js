import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../constants';

function Centers() {
  const [centers, setCenter] = useState([]);
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [centerAnimals, setCenterAnimals] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Fetching centers from:', `${API_BASE_URL}/centers`);
    fetch(`${API_BASE_URL}/centers`)
      .then(res => {
        console.log('Centers response status:', res.status);
        console.log('Centers response headers:', res.headers);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(centers => {
        console.log('Centers data:', centers);
        setCenter(centers);
      })
      .catch(error => console.error('Error fetching centers:', error));
  }, []);

  const handleVisitCenter = (center) => {
    setSelectedCenter(center);
    // Fetch animals for this center
    fetch(`${API_BASE_URL}/animals`)
      .then(res => res.json())
      .then(animals => {
        const filteredAnimals = animals.filter(animal => animal.center && animal.center.id === center.id);
        setCenterAnimals(filteredAnimals);
      })
      .catch(error => console.error(error));
  };

  const handleAdoptAnimal = (animalId) => {
    navigate(`/adoption?animalId=${animalId}`);
  };

  const handleBackToCenters = () => {
    setSelectedCenter(null);
    setCenterAnimals([]);
  };

  if (selectedCenter) {
    return (
      <div className="centers-container">
        <button className="back-button" onClick={handleBackToCenters}>← Back to Centers</button>
        <h1 className="centers-title">{selectedCenter.name} - Available Animals</h1>
        <div className="centers-list">
          {centerAnimals.length > 0 ? (
            centerAnimals.map(animal => (
              <div className="animal-card" key={animal.id}>
                <img src={animal.image} alt={animal.name} className="animal-image" />
                <h3 className="animal-name">{animal.name}</h3>
                <p><strong>Species:</strong> {animal.species}</p>
                <p><strong>Breed:</strong> {animal.breed}</p>
                <p><strong>Age:</strong> {animal.age} years old</p>
                <p><strong>Description:</strong> {animal.description}</p>
                <button onClick={() => handleAdoptAnimal(animal.id)}>Adopt Me!</button>
              </div>
            ))
          ) : (
            <p>No animals available at this center currently.</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="centers-container">
      <h1 className="centers-title">Rescue Centers</h1>
      <div className="centers-list">
        {centers.map(center => (
          <div className="center-card" key={center.id}>
            <div className="center-icon">🏠</div>
            <h3 className="center-name">{center.name}</h3>
            <p className="center-location"><strong>Location:</strong> {center.location}</p>
            <p className="center-contact"><strong>Contact:</strong> {center.contact}</p>
            <button className="center-button" onClick={() => handleVisitCenter(center)}>Visit Center</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Centers;
