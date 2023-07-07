import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import AnimalList from './components/AnimalList';
import AdoptionForm from './components/AdoptionForm';
import Centers from './components/Centers';
import { Login } from "./components/Login";
import { Register } from "./components/Register";
import './App.css';


function App() {
  return (
    <Router>
      <div>
        <Navbar />
        
        <Routes>
      <Route path="/" element={<AnimalList />} />
      <Route path="/adoption" element={<AdoptionForm />} />
      <Route path="/centers" element={<Centers />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  </div>
</Router>

  );
}

export default App;
