import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import AnimalList from './components/AnimalList';
import AdoptionForm from './components/AdoptionForm';
import Centers from './components/Centers';
import { Login } from "./components/Login";
import { Register } from "./components/Register";
import './App.css';


function App() {
  const [currentForm, setCurrentForm] = useState('login');

  const toggleForm = (formName) => {
    setCurrentForm(formName);
  };

  return (
    <Router>
      <div>
        <Navbar />

        <Routes>
      <Route path="/" element={currentForm === 'login' ? <Login onFormSwitch={toggleForm} /> : <Register onFormSwitch={toggleForm} />} />
      <Route path="/adoption" element={<AdoptionForm />} />
      <Route path="/centers" element={<Centers />} />
      <Route path="/login" element={<Login onFormSwitch={toggleForm} />} />
      <Route path="/register" element={<Register onFormSwitch={toggleForm} />} />
      <Route path="/animals" element={<AnimalList />} />
    </Routes>
  </div>
</Router>

  );
}

export default App;
