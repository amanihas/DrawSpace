import { useEffect, useState } from "react";
import Navbar from "./NavBar";
import "./Gallery.css";

export default function Gallery() {
  const [images, setImages] = useState([]);

  // Example: Retrieve saved images from localStorage
  useEffect(() => {
    const savedImages = JSON.parse(localStorage.getItem("galleryImages")) || [];
    setImages(savedImages);
  }, []);

  return (
    <div className="gallery-page">
      <Navbar />
      <div className="gallery-content">
        <h1>Gallery</h1>
        {images.length === 0 ? (
          <p>No images saved yet. Draw something on the canvas and save it!</p>
        ) : (
          <div className="gallery-grid">
            {images.map((src, index) => (
              <div key={index} className="gallery-item">
                <img src={src} alt={`Drawing ${index + 1}`} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
