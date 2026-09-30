import React from 'react';

const AnnouncementBar = () => {
  return (
    <div
      style={{
        backgroundColor: '#0c0c0c',
        borderBottom: '1px solid var(--noir-border-subtle)',
        height: 'var(--announcement-height)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 var(--space-md)',
        textAlign: 'center',
        position: 'relative',
        zIndex: 101,
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: '0.72rem',
          fontWeight: 600,
          letterSpacing: 'var(--tracking-widest)',
          textTransform: 'uppercase',
          color: 'var(--noir-text-secondary)',
        }}
      >
        DROP 01 — JOIN THE EVOLUTION &bull;{' '}
        <span style={{ color: 'var(--noir-accent-champagne)' }}>
          ENVÍOS EXCLUSIVOS EN BOGOTÁ
        </span>
      </p>
    </div>
  );
};

export default AnnouncementBar;
