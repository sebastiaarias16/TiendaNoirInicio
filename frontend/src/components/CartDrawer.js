import React, { useEffect, useRef, useContext } from 'react';
import { Link } from 'react-router-dom';
import { FiX, FiMinus, FiPlus, FiTrash2, FiShoppingBag, FiArrowRight } from 'react-icons/fi';
import { CartContext } from '../CartContext';
import { formatCOP, getImageSrc } from '../utils/productUtils';
import '../styles/cartDrawer.css';

const CartDrawer = () => {
  const {
    cartItems,
    isCartDrawerOpen,
    closeCartDrawer,
    incrementQuantity,
    decrementQuantity,
    removeFromCart,
    subtotal,
    itemCount,
  } = useContext(CartContext);

  const drawerRef = useRef(null);
  const closeBtnRef = useRef(null);

  // Close on Escape key and lock body scroll
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isCartDrawerOpen) {
        closeCartDrawer();
      }
    };

    if (isCartDrawerOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
      // Auto-focus close button for accessibility
      setTimeout(() => {
        if (closeBtnRef.current) closeBtnRef.current.focus();
      }, 50);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isCartDrawerOpen, closeCartDrawer]);

  if (!isCartDrawerOpen) return null;

  return (
    <div
      className="cart-drawer-backdrop"
      onClick={closeCartDrawer}
      role="presentation"
    >
      <aside
        className="cart-drawer-panel"
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-drawer-heading"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="cart-drawer-header">
          <div className="drawer-title-group">
            <h2 id="cart-drawer-heading" className="drawer-title">
              CARRITO
            </h2>
            <span className="drawer-count-badge">
              [{itemCount} {itemCount === 1 ? 'PIEZA' : 'PIEZAS'}]
            </span>
          </div>
          <button
            type="button"
            ref={closeBtnRef}
            className="drawer-close-btn"
            onClick={closeCartDrawer}
            aria-label="Cerrar carrito de compras"
          >
            <FiX size={22} aria-hidden="true" />
          </button>
        </div>

        {/* Content / Items List */}
        <div className="cart-drawer-body">
          {cartItems.length === 0 ? (
            <div className="drawer-empty-state">
              <FiShoppingBag size={48} className="empty-icon" aria-hidden="true" />
              <h3 className="empty-title">TU CARRITO ESTÁ VACÍO</h3>
              <p className="empty-desc">
                No has añadido ninguna prenda aún. Explora la colección DROP 01 de NOIR.
              </p>
              <Link
                to="/products"
                className="noir-btn noir-btn-secondary empty-shop-btn"
                onClick={closeCartDrawer}
              >
                EXPLORAR COLECCIÓN
              </Link>
            </div>
          ) : (
            <ul className="drawer-items-list">
              {cartItems.map((item) => {
                const itemKey = item.cartKey || item._id;
                const imageSrc = getImageSrc(item);
                const lineTotal = (Number(item.precio) || 0) * (item.quantity || 1);
                const maxStock = typeof item.stock === 'number' ? item.stock : 999;
                const isMax = item.quantity >= maxStock;

                return (
                  <li key={itemKey} className="drawer-item">
                    {/* Thumbnail */}
                    <div className="drawer-item-media">
                      <img src={imageSrc} alt={item.nombre} />
                    </div>

                    {/* Details */}
                    <div className="drawer-item-details">
                      <div className="item-title-row">
                        <h4 className="item-name">{item.nombre}</h4>
                        <button
                          type="button"
                          className="item-remove-btn"
                          onClick={() => removeFromCart(itemKey)}
                          aria-label={`Eliminar ${item.nombre} del carrito`}
                        >
                          <FiTrash2 size={16} aria-hidden="true" />
                        </button>
                      </div>

                      {/* Variant Specs */}
                      <p className="item-variant-specs">
                        <span>Talla: <strong>{item.selectedSize || 'M'}</strong></span>
                        <span className="spec-dot">&bull;</span>
                        <span>Color: <strong>{item.selectedColor || 'Negro'}</strong></span>
                      </p>

                      {/* Quantity & Subtotal Row */}
                      <div className="item-actions-row">
                        <div className="drawer-qty-control" aria-label="Cantidad">
                          <button
                            type="button"
                            className="drawer-qty-btn"
                            onClick={() => decrementQuantity(itemKey)}
                            disabled={item.quantity <= 1}
                            aria-label={`Disminuir cantidad de ${item.nombre}`}
                          >
                            <FiMinus size={13} aria-hidden="true" />
                          </button>
                          <span className="drawer-qty-val" aria-live="polite">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            className="drawer-qty-btn"
                            onClick={() => incrementQuantity(itemKey)}
                            disabled={isMax}
                            aria-label={`Aumentar cantidad de ${item.nombre}`}
                          >
                            <FiPlus size={13} aria-hidden="true" />
                          </button>
                        </div>

                        <div className="drawer-item-price">
                          {formatCOP(lineTotal)}
                        </div>
                      </div>

                      {isMax && maxStock < 999 && (
                        <span className="drawer-stock-warning">
                          Stock máximo alcanzado ({maxStock} disp.)
                        </span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer with Subtotal and Checkout CTA */}
        {cartItems.length > 0 && (
          <div className="cart-drawer-footer">
            <div className="drawer-subtotal-row">
              <span className="drawer-subtotal-label">SUBTOTAL</span>
              <span className="drawer-subtotal-val">{formatCOP(subtotal)}</span>
            </div>
            <p className="drawer-shipping-note">
              Envíos directos en Bogotá D.C. &bull; Confirmación inmediata vía WhatsApp
            </p>

            <div className="drawer-footer-actions">
              <Link
                to="/checkout"
                className="noir-btn noir-btn-primary drawer-checkout-btn"
                onClick={closeCartDrawer}
              >
                <span>PROCEDER AL CHECKOUT</span>
                <FiArrowRight size={16} aria-hidden="true" />
              </Link>
              <button
                type="button"
                className="btn-text drawer-continue-btn"
                onClick={closeCartDrawer}
              >
                Seguir Comprando
              </button>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
};

export default CartDrawer;
