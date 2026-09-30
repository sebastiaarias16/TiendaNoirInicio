import React, { useState } from 'react';
import { motion } from 'framer-motion';

const EarlyAccess = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !/\S+@\S+\.\S+/.test(email)) return;
    setSubmitted(true);
  };

  return (
    <section
      style={{
        padding: 'clamp(60px, 8vw, 100px) var(--space-lg)',
        backgroundColor: 'var(--noir-bg-primary)',
        borderTop: '1px solid var(--noir-border-subtle)',
      }}
      aria-label="Acceso prioritario a la comunidad NOIR"
    >
      <div
        className="container-editorial"
        style={{
          backgroundColor: 'var(--noir-bg-secondary)',
          border: '1px solid var(--noir-border-subtle)',
          padding: 'clamp(40px, 6vw, 80px) clamp(24px, 5vw, 64px)',
          textAlign: 'center',
          maxWidth: '820px',
          margin: '0 auto',
        }}
      >
        <motion.span
          className="editorial-label"
          style={{ marginBottom: 'var(--space-sm)' }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          COMMUNITY &bull; EARLY ACCESS
        </motion.span>

        <motion.h2
          style={{
            fontSize: 'clamp(1.8rem, 3.8vw, 3rem)',
            fontWeight: 800,
            letterSpacing: 'var(--tracking-tight)',
            lineHeight: 1.1,
            margin: 'var(--space-sm) 0 var(--space-md)',
          }}
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          BE FIRST TO EVOLVE.
        </motion.h2>

        <motion.p
          style={{
            maxWidth: '520px',
            margin: '0 auto var(--space-xl)',
            fontSize: '0.94rem',
            color: 'var(--noir-text-secondary)',
            lineHeight: 1.6,
          }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Únete a la lista prioritaria para recibir acceso anticipado al próximo drop, ediciones limitadas y eventos exclusivos de NOIR en Colombia.
        </motion.p>

        {submitted ? (
          <div
            style={{
              padding: 'var(--space-md) var(--space-lg)',
              backgroundColor: 'rgba(197, 168, 128, 0.08)',
              border: '1px solid var(--noir-accent-champagne)',
              maxWidth: '480px',
              margin: '0 auto',
            }}
          >
            <p
              style={{
                margin: 0,
                color: 'var(--noir-text-primary)',
                fontWeight: 600,
                fontSize: '0.9rem',
                letterSpacing: 'var(--tracking-wide)',
                textTransform: 'uppercase',
              }}
            >
              Has ingresado al acceso prioritario de NOIR.
            </p>
            <span
              style={{
                fontSize: '0.72rem',
                color: 'var(--noir-text-muted)',
                display: 'block',
                marginTop: '6px',
              }}
            >
              (Suscripción registrada en interfaz &bull; Se conectará al backend de correos en fase posterior)
            </span>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            style={{
              display: 'flex',
              maxWidth: '480px',
              margin: '0 auto',
              gap: 'var(--space-xs)',
              flexWrap: 'wrap',
            }}
          >
            <input
              type="email"
              placeholder="Ingresa tu correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-label="Correo electrónico para lista de espera"
              style={{
                flex: '1 1 260px',
                padding: '14px 18px',
                fontSize: '0.88rem',
              }}
            />
            <button
              type="submit"
              className="noir-btn noir-btn-primary"
              style={{ flex: '0 0 auto', padding: '14px 24px' }}
            >
              JOIN THE WAITLIST
            </button>
          </form>
        )}
      </div>
    </section>
  );
};

export default EarlyAccess;
