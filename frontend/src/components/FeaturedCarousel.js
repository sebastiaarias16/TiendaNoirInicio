import { useEffect, useState} from 'react';
/*import axios from 'axios';*/
/*import { CartContext } from '../CartContext';*/
import '../styles/featuredCarousel.css';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const FeaturedCategories = () => {
  const categories = [
    {
      title: "Mujer",
      image: `${API_URL}/uploads/IMGMUJER.jpg`,
    },
    {
      title: "Hombre",
      image: `${API_URL}/uploads/IMGHOMBRE.jpg`,
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Detectar si es mobile
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Cambiar imagen cada 4s en mobile
  useEffect(() => {
    if (isMobile) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % categories.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isMobile, categories.length]);

  return (
    <section className="featured-categories">
      {isMobile ? (
        <div className="category-card">
          <img
            src={categories[currentIndex].image}
            alt={categories[currentIndex].title}
            className="category-image"
          />
          <div className="category-overlay">
            <h2>{categories[currentIndex].title}</h2>
            <button className="category-btn">Ver {categories[currentIndex].title}</button>
          </div>
        </div>
      ) : (
        categories.map((cat, index) => (
          <div className="category-card" key={index}>
            <img src={cat.image} alt={cat.title} className="category-image" />
            <div className="category-overlay">
              <h2>{cat.title}</h2>
              <button className="category-btn">Ver {cat.title}</button>
            </div>
          </div>
        ))
      )}
    </section>
  );
};

export default FeaturedCategories;
