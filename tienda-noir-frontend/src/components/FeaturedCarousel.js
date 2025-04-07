
// src/components/FeaturedCarousel.js
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import '../styles/featuredCarousel.css';

const FeaturedCarousel = () => {
  const [featured, setFeatured] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    axios.get('http://localhost:3000/api/products/featured')
      .then(res => setFeatured(res.data));
  }, []);

  // Autoplay
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featured.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [featured]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % featured.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + featured.length) % featured.length);
  };

  return (
    <div className="carousel-container">
      <AnimatePresence mode="wait">
        {featured.length > 0 && (
          <motion.div
            key={featured[currentIndex]._id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.6 }}
            className="carousel-slide"
          >
            <img src={featured[currentIndex].image} alt={featured[currentIndex].name} />
            <h3>{featured[currentIndex].name}</h3>
            <p>${featured[currentIndex].price}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <button className="carousel-arrow left" onClick={prevSlide}>⬅</button>
      <button className="carousel-arrow right" onClick={nextSlide}>➡</button>
    </div>
  );
};

export default FeaturedCarousel;