import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiX, FiCheck, FiShoppingBag } from 'react-icons/fi';
import { formatCOP, getImageSrc } from '../utils/productUtils';
import '../styles/cartConfirmation.css';

const CartConfirmationDrawer = ({ isOpen, onClose, product, quantity, selectedSize, selectedColor }) => {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen || !product) return null;

  const imageSrc = getImageSrc(product);

  return (
    <div
      className="cart-feedback-container"
      role="status"
      aria-live="polite"
      aria-label="Confirmación de producto añadido al carrito"
    >
      <div className="cart-feedback-panel">
        <div className="cart-feedback-header">
          <div className="cart-feedback-badge">
            <FiCheck size={16} aria-hidden="true" />
            <span>AGREGADO A TU SELECCIÓN</span>
          </div>
          <button
            type="button"
            className="cart-feedback-close"
            onClick={onClose}
            aria-label="Cerrar notificación"
          >
            <FiX size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="cart-feedback-item">
          <div className="cart-feedback-media">
            <img src={imageSrc} alt={product.nombre} />
          </div>
          <div className="cart-feedback-info">
            <h4 className="cart-feedback-title">{product.nombre}</h4>
            <p className="cart-feedback-meta">
              {selectedSize && <span>Talla: <strong>{selectedSize}</strong></span>}
              {selectedColor && <span> &bull; Color: <strong>{selectedColor}</strong></span>}
              <span> &bull; Cant: <strong>{quantity}</strong></span>
            </p>
            <p className="cart-feedback-price">
              {formatCOP(product.precio * quantity)}
            </p>
          </div>
        </div>

        <div className="cart-feedback-actions">
          <button
            type="button"
            className="noir-btn noir-btn-secondary feedback-btn-continue"
            onClick={onClose}
          >
            SEGUIR COMPRANDO
          </button>
          <Link
            to="/checkout"
            className="noir-btn noir-btn-primary feedback-btn-checkout"
            onClick={onClose}
          >
            <FiShoppingBag size={15} style={{ marginRight: '6px' }} />
            VER CARRITO &bull; FINALIZAR
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CartConfirmationDrawer;
