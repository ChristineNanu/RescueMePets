// Global state management for animals data

import React, { createContext, useContext, useState, useCallback } from 'react';
import { API_BASE_URL } from '../constants';

const AnimalContext = createContext();

export const useAnimals = () => {
  const context = useContext(AnimalContext);
  if (!context) {
    throw new Error('useAnimals must be used within AnimalProvider');
  }
  return context;
};

export const AnimalProvider = ({ children }) => {
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAnimals = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/animals`);
      const data = await response.json();
      setAnimals(data);
    } catch (error) {
      console.error('Failed to fetch animals:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const addAnimal = useCallback(async (animalData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/animals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(animalData),
      });

      if (response.ok) {
        await fetchAnimals(); // refresh all data
        return { success: true };
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.detail };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [fetchAnimals]);

  const updateAnimal = useCallback(async (animalId, animalData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/animals/${animalId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(animalData),
      });

      if (response.ok) {
        await fetchAnimals(); // refresh all data
        return { success: true };
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.detail };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [fetchAnimals]);

  const deleteAnimal = useCallback(async (animalId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/animals/${animalId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchAnimals(); // refresh all data
        return { success: true };
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.detail };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [fetchAnimals]);

  const value = {
    animals,
    loading,
    fetchAnimals,
    addAnimal,
    updateAnimal,
    deleteAnimal
  };

  return (
    <AnimalContext.Provider value={value}>
      {children}
    </AnimalContext.Provider>
  );
};