 import React, { useState, useEffect } from 'react';

function AdoptionForm() {
  const [animals, setAnimals] = useState([]);
  const [userId, setUserId] = useState('');
  const [animalId, setAnimalId] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    // Fetch animals for the dropdown
    fetch('http://127.0.0.1:8001/animals')
      .then(res => res.json())
      .then(data => setAnimals(data))
      .catch(error => console.error(error));

    // Get user_id from localStorage
    const storedUserId = localStorage.getItem('user_id');
    if (storedUserId) {
      setUserId(storedUserId);
    }
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch('http://127.0.0.1:8001/adopt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: parseInt(userId), animal_id: parseInt(animalId), message }),
      });
      const data = await response.json();
      if (response.ok) {
        setIsSubmitted(true);
      } else {
        alert(data.detail);
      }
    } catch (error) {
      alert('Error submitting adoption request');
    }
  };

  return (
    <div>
      {isSubmitted ? (
        <p>Adoption request submitted!</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <label htmlFor="userId">User ID:</label>
          <input type="text" id="userId" value={userId} onChange={(e) => setUserId(e.target.value)} required />

          <label htmlFor="animal">Animal:</label>
          <select id="animal" value={animalId} onChange={(e) => setAnimalId(e.target.value)} required>
            <option value="">Select an animal</option>
            {animals.map(animal => (
              <option key={animal.id} value={animal.id}>{animal.name} - {animal.species}</option>
            ))}
          </select>

          <label htmlFor="message">Message:</label>
          <textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} required />

          <button type="submit">Submit Adoption Request</button>
        </form>
      )}
    </div>
  );
}

export default AdoptionForm;
