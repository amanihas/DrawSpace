import React from 'react';
import { Link } from 'react-router-dom';
import './Nav.css';

function Nav() {
  return (
    <nav className="navbar">
      <Link to="/" className="logo">DrawSpace</Link>
      <div className="nav-links">
        <Link to="/signin" className="nav-link">Sign In</Link>
        <Link to="/register" className="nav-link">Register</Link>
      </div>
    </nav>
  );
}

export default Nav;