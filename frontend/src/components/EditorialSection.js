import React from 'react';
import { motion } from 'framer-motion';
import fondoCta from '../assets/FondoCTA.jpg';

const pillars = [
  {
    index: '01',
    title: 'HIGH-TENSION TEXTILE',
    text: 'Tejidos de compresión que mantienen memoria elástica y transpirabilidad bajo máxima intensidad.',
  },
  {
    index: '02',
    title: 'ANATOMIC STREETWEAR',
    text: 'Cortes que acompañan la biomecánica corporal sin sacrificar una estética sobria y contemporánea.',
  },
  {
    index: '03',
    title: 'COLOMBIAN CRAFT',
    text: 'Confección nacional con acabados mate, costuras reforzadas y durabilidad probada en entrenamiento.',
  },
];

const EditorialSection = () => {
  return (
    <section
      className="noir-editorial-section"
      style={{
        padding: 'clamp(60px, 8vw, 120px) var(--space-lg)',
        backgroundColor: 'var(--noir-bg-primary)',
        borderTop: '1px solid var(--noir-border-subtle)',
      }}
      aria-label="Editorial NOIR"
    >
      <div className="container-wide">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 'clamp(32px, 5vw, 64px)',
            alignItems: 'center',
          }}
        >
          {/* Editorial Visual Frame */}
          <motion.div
            style={{
              position: 'relative',
              aspectRatio: '4 / 5',
              backgroundColor: 'var(--noir-bg-secondary)',
              border: '1px solid var(--noir-border-subtle)',
              overflow: 'hidden',
            }}
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <img
              src={fondoCta}
              alt="Campaña editorial NOIR"
              loading="lazy"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center',
                filter: 'brightness(0.9) contrast(1.05)',
              }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/Img/imageaboutNoir.jpg';
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '100%',
                padding: 'var(--space-md) var(--space-lg)',
                background: 'linear-gradient(180deg, transparent 0%, rgba(8,8,8,0.85) 100%)',
              }}
            >
              <span
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 600,
                  letterSpacing: 'var(--tracking-widest)',
                  textTransform: 'uppercase',
                  color: 'var(--noir-text-muted)',
                }}
              >
                CAMPAIGN 01 &bull; THE DISCIPLINE STANDARD
              </span>
            </div>
          </motion.div>

          {/* Editorial Text & Pillars */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="editorial-label" style={{ marginBottom: 'var(--space-sm)' }}>
              IDENTITY &bull; TRAINING &bull; STREETWEAR
            </span>

            <h2
              style={{
                fontSize: 'clamp(2rem, 3.6vw, 3rem)',
                fontWeight: 800,
                letterSpacing: 'var(--tracking-tight)',
                lineHeight: 1.1,
                margin: 'var(--space-sm) 0 var(--space-md)',
              }}
            >
              BEYOND PERFORMANCE.
              <br />
              <span style={{ color: 'var(--noir-text-secondary)', fontWeight: 600 }}>
                AN IDENTITY BUILT THROUGH REPETITION.
              </span>
            </h2>

            <p
              style={{
                fontSize: '0.94rem',
                color: 'var(--noir-text-secondary)',
                lineHeight: 1.7,
                marginBottom: 'var(--space-xl)',
              }}
            >
              NOIR nace para quienes entienden que el entrenamiento no es una moda, sino un hábito no negociable. Diseñamos indumentaria que combina la disciplina del alto rendimiento con la presencia estética del streetwear moderno.
            </p>

            {/* Disciplined Pillars List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              {pillars.map((pillar) => (
                <div
                  key={pillar.index}
                  style={{
                    paddingLeft: 'var(--space-md)',
                    borderLeft: '2px solid var(--noir-border-medium)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '4px' }}>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        color: 'var(--noir-accent-champagne)',
                        letterSpacing: 'var(--tracking-wider)',
                      }}
                    >
                      {pillar.index}
                    </span>
                    <h3
                      style={{
                        fontSize: '0.86rem',
                        fontWeight: 700,
                        letterSpacing: 'var(--tracking-wider)',
                        textTransform: 'uppercase',
                        color: 'var(--noir-text-primary)',
                        margin: 0,
                      }}
                    >
                      {pillar.title}
                    </h3>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--noir-text-muted)' }}>
                    {pillar.text}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default EditorialSection;
