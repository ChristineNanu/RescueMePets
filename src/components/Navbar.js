import React from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="Navbar">
      <Link to="/" className="Navbar-logo">RescueMe</Link>
      <ul className="Navbar-nav">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/adoption">Adoption</Link></li>
        <li><Link to="/centers">Centers</Link></li>
      </ul>
    </nav>
  );
}

export default Navbar;
