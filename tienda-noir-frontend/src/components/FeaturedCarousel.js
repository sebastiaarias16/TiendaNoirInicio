// src/components/FeaturedCarousel.js
import { useEffect, useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { CartContext } from '../CartContext';
import '../styles/featuredCarousel.css';

const FeaturedCarousel = () => {
  const [featured, setFeatured] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { addToCart } = useContext(CartContext);

  // Obtener productos destacados
  useEffect(() => {
    axios.get('http://localhost:3000/api/products/featured')
      .then(res => {
        if (Array.isArray(res.data)) {
          setFeatured(res.data);
        } else {
          console.error('Respuesta inesperada:', res.data);
        }
      })
      .catch(err => {
        console.error('Error al cargar productos destacados:', err);
      });
  }, []);

  // Autoplay
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % featured.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [featured]);

  const nextSlide = () => setCurrentIndex(prev => (prev + 1) % featured.length);
  const prevSlide = () => setCurrentIndex(prev => (prev - 1 + featured.length) % featured.length);

  const handleAddToCart = () => {
    const product = featured[currentIndex];
    addToCart(product);
  };

  return (
    <div className="carousel-container">
      <AnimatePresence mode="wait">
        {featured.length > 0 && featured[currentIndex] && (
          <motion.div
            key={featured[currentIndex]._id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.8 }}
            className="carousel-slide"
          >
            {featured[currentIndex].image && (
              <img
                src={
                  featured[currentIndex].image.startsWith('http')
                    ? featured[currentIndex].image
                    : `http://localhost:3000/${featured[currentIndex].image}`
                }
                alt={featured[currentIndex].name}
              />
            )}
            <h3>{featured[currentIndex].name}</h3>
            <p>${featured[currentIndex].price}</p>
            <button onClick={() => addToCart(featured[currentIndex])}>Agregar al carrito</button>
          </motion.div>
        )}
      </AnimatePresence>


      <button className="carousel-arrow left" onClick={prevSlide}>⬅</button>
      <button className="carousel-arrow right" onClick={nextSlide}>➡</button>
    </div>
  );
};

export default FeaturedCarousel;