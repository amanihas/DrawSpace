import React from 'react';
import Nav from './Nav';
import Stars from './Stars';
import './Home.css';

function Home() {
  return (
    <div className="home-container">
      <Stars />
      <Nav />
      <div className="landing-page">
        <div className="content">
          <h1>DrawSpace</h1>
          <p>
            DrawSpace is a modern web-based graphics editor perfect for creating, collaborating, and connecting in real-time.
          </p>
          <p>
            Experience intuitive design and versatile tools to fuel your creativity—whether you’re brainstorming or playing “Sketch and Guess.”
          </p>
        </div>
        <div className="image-container">
          <img
            src={`${process.env.PUBLIC_URL}/landingpage.jpg`}
            alt="Landing Page"
            className="landingpage-image"
          />
        </div>
      </div>
    </div>
  );
}

export default Home;
