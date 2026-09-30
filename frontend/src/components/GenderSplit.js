import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import '../styles/genderSplit.css';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3000';

const panels = [
  {
    id: 'men',
    title: 'MEN',
    descriptor: 'PERFORMANCE / STRUCTURE / STRENGTH',
    image: `${API_URL}/uploads/IMGHOMBRE.jpg`,
    fallback: '/Img/promocion1.jpg',
    link: '/products?gender=men',
    cta: 'EXPLORAR HOMBRE',
  },
  {
    id: 'women',
    title: 'WOMEN',
    descriptor: 'PERFORMANCE / FORM / EVOLUTION',
    image: `${API_URL}/uploads/IMGMUJER.jpg`,
    fallback: '/Img/promo2.jpg',
    link: '/products?gender=women',
    cta: 'EXPLORAR MUJER',
  },
];

const GenderSplit = () => {
  return (
    <section className="noir-gender-split" aria-label="Colecciones por género">
      <div className="gender-split-container">
        {panels.map((panel) => (
          <motion.div
            key={panel.id}
            className="gender-panel"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Background Image Container */}
            <div className="gender-panel-media">
              <img
                src={panel.image}
                alt={`Colección ${panel.title} NOIR`}
                loading="lazy"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = panel.fallback;
                }}
              />
              <div className="gender-panel-overlay" />
            </div>

            {/* Panel Editorial Copy */}
            <div className="gender-panel-content">
              <span className="editorial-label panel-tag">COLECCIÓN</span>
              <h3 className="gender-panel-title">{panel.title}</h3>
              <p className="gender-panel-descriptor">{panel.descriptor}</p>
              <Link to={panel.link} className="noir-btn noir-btn-secondary panel-cta">
                {panel.cta}
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default GenderSplit;
