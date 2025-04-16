import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear user token from localStorage
    localStorage.removeItem('token');
    // Clear console
    console.clear();
    // Navigate to home page
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/user-dashboard" className="logo">DrawSpace</Link>
      </div>
      <div className="navbar-links">
        <Link to="/canvas" className="nav-link">Canvas</Link>
        <Link to="/brainstormer" className="nav-link">Brainstormer</Link>
        <Link to="/gallery" className="nav-link">Gallery</Link>
        <button 
          onClick={handleLogout}
          className="nav-link logout-button"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}