import React from 'react';

const Stickybutton = ({ children, className, onClick }) => {
  return (
    <button 
      className={`sticky-button ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default Stickybutton;