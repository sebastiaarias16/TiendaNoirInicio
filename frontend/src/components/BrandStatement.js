import React from 'react';
import { motion } from 'framer-motion';

const BrandStatement = () => {
  return (
    <section
      id="brand-statement"
      style={{
        backgroundColor: 'var(--noir-bg-primary)',
        borderTop: '1px solid var(--noir-border-subtle)',
        borderBottom: '1px solid var(--noir-border-subtle)',
        padding: 'clamp(60px, 8vw, 120px) var(--space-lg)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
      aria-label="Declaración de marca NOIR"
    >
      <div
        style={{
          maxWidth: '920px',
          margin: '0 auto',
        }}
      >
        <motion.span
          className="editorial-label"
          style={{ marginBottom: 'var(--space-md)' }}
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          THE NEW STANDARD &bull; NOIR PHILOSOPHY
        </motion.span>

        <motion.h2
          style={{
            fontSize: 'clamp(1.6rem, 3.8vw, 3.2rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: 'var(--tracking-tight)',
            color: 'var(--noir-text-primary)',
            textTransform: 'uppercase',
            margin: 'var(--space-sm) 0 var(--space-md)',
          }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          DISCIPLINE IS THE STANDARD.
          <br />
          <span style={{ color: 'var(--noir-accent-champagne)' }}>
            EVOLUTION IS THE RESULT.
          </span>
        </motion.h2>

        <motion.p
          style={{
            maxWidth: '540px',
            margin: '0 auto',
            fontSize: 'clamp(0.85rem, 1.2vw, 0.98rem)',
            color: 'var(--noir-text-secondary)',
            letterSpacing: 'var(--tracking-wide)',
            textTransform: 'uppercase',
          }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Diseñado para el entrenamiento de alta exigencia y la identidad streetwear.
        </motion.p>
      </div>
    </section>
  );
};

export default BrandStatement;
