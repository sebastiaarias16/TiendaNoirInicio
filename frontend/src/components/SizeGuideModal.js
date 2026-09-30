import React, { useEffect, useRef } from 'react';
import { FiX, FiMessageSquare } from 'react-icons/fi';
import '../styles/sizeGuideModal.css';

const SizeGuideModal = ({ isOpen, onClose, productCategory }) => {
  const modalRef = useRef(null);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="size-guide-backdrop"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="size-guide-modal"
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="size-guide-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="size-guide-header">
          <div>
            <span className="editorial-label">TABLA DE REFERENCIA</span>
            <h2 id="size-guide-title" className="size-guide-title">
              GUÍA DE TALLAS NOIR
            </h2>
          </div>
          <button
            type="button"
            className="size-guide-close-btn"
            onClick={onClose}
            aria-label="Cerrar guía de tallas"
          >
            <FiX size={22} aria-hidden="true" />
          </button>
        </div>

        <div className="size-guide-body">
          {/* Authentic status notice: Measurements pending brand standardization */}
          <div className="size-guide-notice">
            <span className="editorial-label notice-tag">INFORMACIÓN OFICIAL</span>
            <p className="notice-text">
              Las tablas métricas anatómicas del DROP 01 se encuentran en fase de calibración de patrones para el mercado colombiano. No publicamos medidas aproximadas no certificadas para garantizar un calce técnico exacto.
            </p>
          </div>

          {/* Structured measurement template ready for future values */}
          <div className="table-responsive">
            <table className="size-guide-table" aria-label="Referencia de tallas NOIR">
              <thead>
                <tr>
                  <th scope="col">TALLA</th>
                  <th scope="col">PECHO</th>
                  <th scope="col">CINTURA</th>
                  <th scope="col">CADERA</th>
                </tr>
              </thead>
              <tbody>
                {['S', 'M', 'L', 'XL'].map((size) => (
                  <tr key={size}>
                    <td className="size-cell">{size}</td>
                    <td className="metric-cell">Pendiente</td>
                    <td className="metric-cell">Pendiente</td>
                    <td className="metric-cell">Pendiente</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Advice / Direct Consultation CTA */}
          <div className="size-guide-advice">
            <h3 className="advice-title">¿DUDAS SOBRE TU AJUSTE ANATÓMICO?</h3>
            <p className="advice-text">
              Nuestras prendas de compresión presentan un ajuste ceñido al cuerpo. Si prefieres un porte streetwear más holgado, recomendamos optar por una talla superior o escribirnos directamente con tu estatura y peso.
            </p>
            <a
              href={`https://wa.me/573124252861?text=Hola%20NOIR,%20deseo%20asesor%C3%ADa%20personalizada%20de%20talla%20para%20la%20prenda:%20${encodeURIComponent(productCategory || 'Prenda NOIR')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="noir-btn noir-btn-secondary size-guide-whatsapp-btn"
            >
              <FiMessageSquare size={16} aria-hidden="true" />
              <span>CONSULTAR ASESORÍA POR WHATSAPP</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SizeGuideModal;
