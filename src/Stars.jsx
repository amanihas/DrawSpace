import React, { useEffect } from 'react';
import './Animation.css';

const Stars = () => {
  useEffect(() => {
    const container = document.querySelector('.stars');
    if (!container) return;

    // Clear existing stars
    container.innerHTML = '';

    // Create new stars with better visibility
    for (let i = 0; i < 300; i++) {
      const star = document.createElement('div');
      const size = Math.random() > 0.7 ? 'large' : Math.random() > 0.4 ? 'medium' : 'small';
      star.className = `star ${size}`;
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;
      star.style.animationDelay = `${Math.random() * 2}s`;
      star.style.animationDuration = `${1.5 + Math.random() * 3}s`;
      container.appendChild(star);
    }
  }, []);

  return <div className="stars"></div>;
};

export default Stars;