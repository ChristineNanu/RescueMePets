import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../constants';
import { logger } from '../utils/logger';

function AnimalManagement() {
  const [animals, setAnimals] = useState([]);
  const [centers, setCenters] = useState([]);
  const [editingAnimal, setEditingAnimal] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    species: '',
    breed: '',
    age: '',
    description: '',
    image: '',
    center_id: ''
  });

  useEffect(() => {
    fetchAnimals();
    fetchCenters();
  }, []);

  const fetchAnimals = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/animals`);
      const data = await response.json();
      setAnimals(data);
    } catch (error) {
      logger.error('Error fetching animals:', error);
    }
  };

  const fetchCenters = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/centers`);
      const data = await response.json();
      setCenters(data);
    } catch (error) {
      logger.error('Error fetching centers:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddAnimal = async (e) => {
    e.preventDefault();
    
    logger.debug('Form data before submit:', formData);
    
    if (!formData.name || !formData.species || !formData.breed || !formData.age || !formData.description || !formData.center_id) {
      alert('Please fill in all required fields');
      return;
    }
    
    try {
      const payload = {
        name: formData.name,
        species: formData.species,
        breed: formData.breed,
        age: parseInt(formData.age),
        description: formData.description,
        image: formData.image || '',
        center_id: parseInt(formData.center_id)
      };
      
      logger.debug('Sending payload:', payload);
      
      const response = await fetch(`${API_BASE_URL}/animals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      logger.debug('Response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        logger.info('Animal added successfully:', result);
        alert('Animal added successfully!');
        setShowAddForm(false);
        setFormData({
          name: '',
          species: '',
          breed: '',
          age: '',
          description: '',
          image: '',
          center_id: ''
        });
        fetchAnimals();
      } else {
        const errorData = await response.json();
        logger.error('Error response:', errorData);
        alert(`Error adding animal: ${errorData.detail || 'Unknown error'}`);
      }
    } catch (error) {
      logger.error('Network error:', error);
      alert(`Network error: ${error.message}`);
    }
  };

  const handleEditAnimal = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/animals/${editingAnimal.id}`, {
        method: 'PUT',
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
        alert('Animal updated successfully!');
        setEditingAnimal(null);
        setFormData({
          name: '',
          species: '',
          breed: '',
          age: '',
          description: '',
          image: '',
          center_id: ''
        });
        fetchAnimals();
      } else {
        const errorData = await response.json();
        alert(`Error updating animal: ${errorData.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating animal:', error);
      alert('Error updating animal');
    }
  };

  const handleDeleteAnimal = async (animalId) => {
    if (window.confirm('Are you sure you want to delete this animal?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/animals/${animalId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          alert('Animal deleted successfully!');
          fetchAnimals();
        } else {
          const errorData = await response.json();
          alert(`Error deleting animal: ${errorData.detail || 'Unknown error'}`);
        }
      } catch (error) {
        console.error('Error deleting animal:', error);
        alert('Error deleting animal');
      }
    }
  };

  const startEdit = (animal) => {
    setEditingAnimal(animal);
    setFormData({
      name: animal.name,
      species: animal.species,
      breed: animal.breed,
      age: animal.age.toString(),
      description: animal.description,
      image: animal.image,
      center_id: animal.center_id.toString()
    });
  };

  const cancelEdit = () => {
    setEditingAnimal(null);
    setFormData({
      name: '',
      species: '',
      breed: '',
      age: '',
      description: '',
      image: '',
      center_id: ''
    });
  };

  return (
    <div className="app-container">
      <div className="page-header">
        <h1>Animal Management</h1>
        <button 
          onClick={() => {
            logger.debug('Add New Animal button clicked!');
            logger.debug('Current showAddForm state:', showAddForm);
            setShowAddForm(!showAddForm);
          }}
          style={{ 
            background: 'linear-gradient(45deg, #667eea, #764ba2)',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '12px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '600',
            transition: 'all 0.3s ease',
            zIndex: 1000,
            position: 'relative'
          }}
        >
          {showAddForm ? 'Cancel' : 'Add New Animal'}
        </button>
      </div>

      {(showAddForm || editingAnimal) && (
        <div className="form-container">
          <h3>{editingAnimal ? 'Edit Animal' : 'Add New Animal'}</h3>
          <form onSubmit={editingAnimal ? handleEditAnimal : handleAddAnimal}>
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
                    {center.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary">
                {editingAnimal ? 'Update Animal' : 'Add Animal'}
              </button>
              <button type="button" onClick={editingAnimal ? cancelEdit : () => setShowAddForm(false)} className="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="animal-list">
        {animals.map(animal => (
          <div className="animal-card" key={animal.id}>
            <img
              src={animal.image || `https://picsum.photos/400/300?random=${animal.id}`}
              alt={animal.name}
              className="animal-image"
            />
            <div className="animal-card-content">
              <h3>{animal.name}</h3>
              <p><strong>Species:</strong> {animal.species}</p>
              <p><strong>Breed:</strong> {animal.breed}</p>
              <p><strong>Age:</strong> {animal.age} years</p>
              <p><strong>Center:</strong> {animal.center?.name}</p>
              <p>{animal.description}</p>
              <div className="animal-actions">
                <button onClick={() => startEdit(animal)} className="btn-edit">
                  Edit
                </button>
                <button onClick={() => handleDeleteAnimal(animal.id)} className="btn-delete">
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AnimalManagement;