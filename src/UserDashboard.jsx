import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar"; // See Navbar.jsx below
import "./UserDashboard.css";

export default function UserDashboard() {
  const [user, setUser] = useState({});
  const [stars, setStars] = useState([]);
  const navigate = useNavigate();

  // Generate random stars on mount
  useEffect(() => {
    const starCount = 50; // Adjust number of stars as desired
    const generatedStars = Array.from({ length: starCount }).map(() => ({
      top: Math.random() * 100,
      left: Math.random() * 100,
      size: 1 + Math.random() * 3,
      delay: Math.random() * 5,
    }));
    setStars(generatedStars);
  }, []);

  // Check for token and fetch user data
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Unauthorized access. Please log in.");
      navigate("/signin");
    } else {
      fetch(
        `${
          process.env.NODE_ENV === "development" ? "http://localhost:5000" : ""
        }/user-data`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }
      )
        .then((res) => {
          if (res.status < 200 || res.status >= 300) {
            localStorage.removeItem("token");
            alert("Session expired or unauthorized. Redirecting to Home.");
            navigate("/");
            return;
          }
          return res.json();
        })
        .then((data) => {
          if (data) {
            setUser(data);
          }
        })
        .catch(() => {
          alert("Error fetching user data.");
          localStorage.removeItem("token");
          navigate("/");
        });
    }
  }, [navigate]);

  return (
    <div className="dashboard">
      {/* Star background overlay */}
      <div className="stars">
        {stars.map((star, index) => (
          <div
            key={index}
            className="star"
            style={{
              top: `${star.top}%`,
              left: `${star.left}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              animationDelay: `${star.delay}s`,
            }}
          />
        ))}
      </div>

      <Navbar />

      <div className="dashboard-content">
        <h1>User Dashboard</h1>
        <p>Welcome to your dashboard, {user.userName || "User"}!</p>
        <div className="dashboard-buttons">
          <button onClick={() => navigate("/brainstormer")}>Brainstormer</button>
          <button onClick={() => navigate("/canvas")}>Canvas</button>
          <button onClick={() => navigate("/gallery")}>Gallery</button>
        </div>
        {/* You can add additional cards or stats below */}
      </div>
    </div>
  );
}
