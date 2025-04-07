import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import '../styles/hero.css';

const images = [
  '../../public/Img/Fondo1.jpg',
  '../../public/Img/fondo2.jpg',
  '../../public/Img/fondo3.jpg',
];

const Hero = () => {
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      className="hero"
      style={{ backgroundImage: `url(${images[currentImage]})` }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <div className="overlay" />
      <div className="hero-content">
        <h2>🔥 Eleva tu estilo con Noir</h2>
        <p>Actitud. Fuerza. Presencia.</p>
        <a href="#coleccion"><button className="hero-btn">Explorar ahora</button></a>
      </div>
    </motion.div>
  );
};

export default Hero;