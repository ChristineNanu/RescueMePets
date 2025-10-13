import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function AnimalList() {
  const [animals, setAnimals] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:8002/animals')
      .then(res => res.json())
      .then(data => setAnimals(data))
      .catch(error => console.error(error));
  }, []);

  const handleAdopt = (animalId) => {
    navigate(`/adoption?animalId=${animalId}`);
  };

  return (
    <div>
      <div className="animal-list">
        {animals.map(animal => (
          <div className="animal-card" key={animal.id}>
            <img src={animal.image} alt={animal.name} className="animal-image" />
            <h3 className="animal-name">{animal.name}</h3>
            <p><strong>Species:</strong> {animal.species}</p>
            <p><strong>Breed:</strong> {animal.breed}</p>
            <p><strong>Age:</strong> {animal.age} years old</p>
            <p><strong>Description:</strong> {animal.description}</p>
            <button onClick={() => handleAdopt(animal.id)}>Adopt Me!</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AnimalList;
