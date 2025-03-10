// add a nav-bar component to make everything easier

import './Home.css';

function Home() {
  return (
    <div className="Home">
      <nav className="navbar">
        <a href="/signin" className="nav-link">Sign In</a>
        <a href="/register" className="nav-link">Register</a>
      </nav>
      <div className="landing-page">
        <div className="content">
          <h1>DrawSpace</h1>
          <p>DrawSpace is a web-based graphics editor for creating, collaborating, and connecting in real-time.</p>
          <p>Whether brainstorming freely or playing games like "Sketch and Guess," enjoy versatile tools, shared canvases, and a platform for creativity and fun.</p>
        </div>
        <div className="image-container">
          <img src={`${process.env.PUBLIC_URL}/landingpage.jpg`} alt="Landing Page" className="landingpage-image" />
        </div>
      </div>
    </div>
  );
}

export default Home;