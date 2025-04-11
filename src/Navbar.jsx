import { Link } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/user-dashboard" className="logo">DrawSpace</Link>
      </div>
      <div className="navbar-links">
        <Link to="/canvas" className="nav-link">Canvas</Link>
        <Link to="/brainstormer" className="nav-link">Brainstormer</Link>
        <Link to="/gallery" className="nav-link">Gallery</Link>
      </div>
    </nav>
  );
}
