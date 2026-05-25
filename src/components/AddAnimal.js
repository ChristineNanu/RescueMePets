import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../constants';

function AddAnimal() {
  const [centers, setCenters] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    species: '',
    breed: '',
    age: '',
    description: '',
    image: '',
    center_id: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchCenters();
  }, []);

  const fetchCenters = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/centers`);
      const data = await response.json();
      setCenters(data);
    } catch (error) {
      console.error('Error fetching centers:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/animals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          age: parseInt(formData.age),
          center_id: parseInt(formData.center_id)
        }),
      });

      if (response.ok) {
        alert('Animal added successfully!');
        navigate('/animals');
      } else {
        alert('Error adding animal');
      }
    } catch (error) {
      console.error('Error adding animal:', error);
      alert('Error adding animal');
    }
  };

  return (
    <div className="app-container">
      <div className="page-header">
        <h1>Add New Animal</h1>
        <p>Add a new animal to the rescue system</p>
      </div>

      <div className="form-container">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name:</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Species:</label>
            <input
              type="text"
              name="species"
              value={formData.species}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Breed:</label>
            <input
              type="text"
              name="breed"
              value={formData.breed}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Age:</label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Description:</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Image URL:</label>
            <input
              type="url"
              name="image"
              value={formData.image}
              onChange={handleInputChange}
              placeholder="https://example.com/image.jpg"
            />
          </div>
          
          <div className="form-group">
            <label>Center:</label>
            <select
              name="center_id"
              value={formData.center_id}
              onChange={handleInputChange}
              required
            >
              <option value="">Select a center</option>
              {centers.map(center => (
                <option key={center.id} value={center.id}>
                  {center.name} - {center.location}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-actions">
            <button type="submit" className="btn-primary">
              Add Animal
            </button>
            <button 
              type="button" 
              onClick={() => navigate('/animals')}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddAnimal;