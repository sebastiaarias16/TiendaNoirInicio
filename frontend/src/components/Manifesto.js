import React from 'react';
import { motion } from 'framer-motion';

const Manifesto = () => {
  return (
    <section
      id="manifesto"
      style={{
        position: 'relative',
        padding: 'clamp(80px, 12vw, 140px) var(--space-lg)',
        backgroundColor: '#0a0a0a',
        borderTop: '1px solid var(--noir-border-subtle)',
        borderBottom: '1px solid var(--noir-border-subtle)',
        overflow: 'hidden',
        textAlign: 'center',
      }}
      aria-label="Manifiesto NOIR"
    >
      {/* Symbolic Watermark */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'clamp(300px, 60vw, 700px)',
          height: 'clamp(300px, 60vw, 700px)',
          opacity: 0.03,
          pointerEvents: 'none',
          userSelect: 'none',
          zIndex: 0,
        }}
      >
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
          <circle cx="100" cy="100" r="95" stroke="#FFFFFF" strokeWidth="1.5" strokeDasharray="4 6" />
          <polygon points="100,25 175,150 25,150" stroke="#FFFFFF" strokeWidth="1.5" />
          <circle cx="100" cy="100" r="40" stroke="#FFFFFF" strokeWidth="1.5" />
        </svg>
      </div>

      <div
        className="container-editorial"
        style={{ position: 'relative', zIndex: 1, maxWidth: '800px', margin: '0 auto' }}
      >
        <motion.span
          className="editorial-label"
          style={{ marginBottom: 'var(--space-md)' }}
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          MANIFESTO &bull; BUILT FOR THOSE WHO EVOLVE
        </motion.span>

        <motion.h2
          style={{
            fontSize: 'clamp(2.2rem, 5.5vw, 4.2rem)',
            fontWeight: 800,
            letterSpacing: 'var(--tracking-tight)',
            lineHeight: 1.05,
            color: 'var(--noir-text-primary)',
            textTransform: 'uppercase',
            margin: 'var(--space-sm) 0 var(--space-lg)',
          }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          EVOLUTION IS
          <br />
          <span style={{ color: 'var(--noir-accent-champagne)' }}>
            DISCIPLINE.
          </span>
        </motion.h2>

        <motion.blockquote
          style={{
            margin: '0 auto var(--space-xl)',
            fontSize: 'clamp(0.95rem, 1.4vw, 1.12rem)',
            lineHeight: 1.8,
            color: 'var(--noir-text-secondary)',
            fontStyle: 'normal',
            maxWidth: '680px',
          }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          &ldquo;El progreso no es un destello de motivación; es la acumulación silenciosa de estándares inquebrantables. En cada repetición y en cada prenda, elegimos la evolución constante.&rdquo;
        </motion.blockquote>

        <motion.div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '0.74rem',
            fontWeight: 600,
            letterSpacing: 'var(--tracking-widest)',
            textTransform: 'uppercase',
            color: 'var(--noir-text-muted)',
            borderTop: '1px solid var(--noir-border-subtle)',
            paddingTop: 'var(--space-md)',
          }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <span>NOIR APPAREL</span>
          <span>&bull;</span>
          <span>BOGOTÁ, COLOMBIA</span>
        </motion.div>
      </div>
    </section>
  );
};

export default Manifesto;
