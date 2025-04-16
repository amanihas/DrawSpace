import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import "./Gallery.css";

export default function Gallery() {
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();

  // Function to load projects from localStorage
  const loadProjects = () => {
    const saved = localStorage.getItem("galleryImages");
    if (saved) {
      const parsed = JSON.parse(saved);
      console.log("Loaded projects:", parsed);
      setProjects(parsed);
    } else {
      console.log("No projects found in localStorage.");
      setProjects([]);
    }
  };

  // Load projects on component mount (and whenever you navigate to this page)
  useEffect(() => {
    loadProjects();
  }, []);

  // Delete a project and update localStorage
  const handleDelete = (id) => {
    const newProjects = projects.filter((proj) => proj.id !== id);
    localStorage.setItem("galleryImages", JSON.stringify(newProjects));
    setProjects(newProjects);
  };

  // Navigate to the Canvas page for editing a specific project
  const handleEdit = (project) => {
    navigate("/canvas", { state: { project } });
  };

  // Navigate to the Canvas page for creating a new project
  const handleCreateNew = () => {
    navigate("/canvas");
  };

  return (
    <div className="gallery-page">
      <Navbar />
      <div className="gallery-content">
        <h1>Gallery</h1>
        <button onClick={handleCreateNew}>Create New Project</button>
        {projects.length === 0 ? (
          <p>No images saved yet. Draw something on the canvas and save it!</p>
        ) : (
          <div className="gallery-grid">
            {projects.map((proj) => (
              <div key={proj.id} className="gallery-item">
                {proj.dataURL ? (
                  <img
                    src={proj.dataURL}
                    alt={proj.title || "Drawing"}
                    // Ensure the image takes a visible space
                    style={{ width: "100%", height: "auto", display: "block" }}
                  />
                ) : (
                  <p>No image data for {proj.title}</p>
                )}
                <div className="gallery-item-details">
                  <p>{proj.title}</p>
                  <button onClick={() => handleEdit(proj)}>Edit</button>
                  <button onClick={() => handleDelete(proj.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
