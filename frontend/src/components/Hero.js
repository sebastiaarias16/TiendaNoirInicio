import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import fondo1 from '../assets/Fondo1.png';
import fondo2 from '../assets/fondo2.png';
import fondo3 from '../assets/fondo3.png';
import '../styles/hero.css';

const slides = [
  {
    image: fondo1,
    label: 'NOIR APPAREL &bull; DROP 01',
    subtitle: 'Rendimiento anatómico y presencia en cada movimiento.',
  },
  {
    image: fondo2,
    label: 'DISCIPLINA &bull; EVOLUCIÓN',
    subtitle: 'Prendas de compresión estructuradas para resistir la máxima intensidad.',
  },
  {
    image: fondo3,
    label: 'THE NEW STANDARD &bull; BOGOTÁ',
    subtitle: 'Diseñado en Colombia para quienes evolucionan sin atajos.',
  },
];

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6500);
    return () => clearInterval(timer);
  }, []);

  const scrollToStatement = (e) => {
    e.preventDefault();
    const target = document.getElementById('brand-statement');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="noir-hero" aria-label="Campaña principal NOIR">
      {/* Background Slides with AnimatePresence for smooth crossfade without repaint */}
      <div className="hero-background-wrapper">
        <AnimatePresence mode="sync">
          <motion.div
            key={currentSlide}
            className="hero-slide-bg"
            style={{ backgroundImage: `url(${slides[currentSlide].image})` }}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          />
        </AnimatePresence>
        <div className="hero-vignette-overlay" />
      </div>

      {/* Hero Content */}
      <div className="hero-content-container">
        <motion.div
          className="hero-inner-content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <span
            className="editorial-label hero-category-label"
            dangerouslySetInnerHTML={{ __html: slides[currentSlide].label }}
          />

          <h1 className="hero-headline">
            NOIR
            <span className="hero-headline-sub">THE NEW STANDARD.</span>
          </h1>

          <p className="hero-statement">
            BUILT FOR THOSE WHO EVOLVE.
          </p>

          <div className="hero-actions">
            <Link to="/products" className="noir-btn noir-btn-primary hero-btn-main">
              SHOP THE DROP
            </Link>
            <a
              href="#brand-statement"
              onClick={scrollToStatement}
              className="noir-btn noir-btn-secondary hero-btn-secondary"
            >
              DISCOVER NOIR
            </a>
          </div>
        </motion.div>

        {/* Minimal Slide Indicators */}
        <div className="hero-slide-indicators" aria-hidden="true">
          {slides.map((_, index) => (
            <button
              key={index}
              type="button"
              className={`slide-indicator-dash ${index === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(index)}
              aria-label={`Ver diapositiva ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;