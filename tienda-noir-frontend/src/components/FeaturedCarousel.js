import { useEffect, useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { CartContext } from '../CartContext';
import '../styles/featuredCarousel.css';

const FeaturedCarousel = () => {
  const [featured, setFeatured] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { addToCart } = useContext(CartContext);

  // Cargar productos destacados
  useEffect(() => {
    axios.get('https://noir-backend-z409.onrender.com/api/products/featured')
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

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % featured.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [featured]);

  const nextSlide = () => setCurrentIndex(prev => (prev + 1) % featured.length);
  const prevSlide = () => setCurrentIndex(prev => (prev - 1 + featured.length) % featured.length);

  return (
    <div className="carousel-container">
      <AnimatePresence mode="wait">
        {featured.length > 0 && featured[currentIndex] && (
          <motion.div
            key={featured[currentIndex]._id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.6 }}
            className="carousel-slide featured-product"
          >
            {featured[currentIndex].imagen?.[0] && (
              <img
                src={`https://noir-backend-z409.onrender.com/uploads/${featured[currentIndex].imagen[0]}`}
                alt={featured[currentIndex].nombre}
              />
            )}
            <h3>{featured[currentIndex].nombre}</h3>
            <p>{featured[currentIndex].descripcion}</p>
            <p><strong>${featured[currentIndex].precio.toLocaleString()}</strong></p>
            <button onClick={() => addToCart(featured[currentIndex])}>
              Agregar al carrito
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <button className="carousel-arrow left" onClick={prevSlide}>⬅</button>
      <button className="carousel-arrow right" onClick={nextSlide}>➡</button>
    </div>
  );
};

export default FeaturedCarousel;
