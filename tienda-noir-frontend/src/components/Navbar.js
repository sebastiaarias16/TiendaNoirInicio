import React, { useState, useEffect, useContext, useRef } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../CartContext';
import { FaShoppingCart } from 'react-icons/fa';

import '../styles/navbar.css';

const Navbar = ({ user, onLogout }) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [animate, setAnimate] = useState(false);
  const badgeRef = useRef();

  const { cartItems } = useContext(CartContext);
  const cartItemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const toggleResponsiveMenu = () => {
    setMenuOpen(!menuOpen);
  };

  useEffect(() => {
    if (badgeRef.current) {
      badgeRef.current.classList.remove('cart-badge');
      void badgeRef.current.offsetWidth; // ⚠️ Forzar reflow para reiniciar la animación
      badgeRef.current.classList.add('cart-badge');
    }

    setAnimate(true);
    const timeout = setTimeout(() => setAnimate(false), 400); // Duración de la animación

    return () => clearTimeout(timeout);
  }, [cartItemCount]);

  return (
    <nav>
      <h1>NOIR</h1>

      {/* Botón hamburguesa */}
      <div className="hamburger" onClick={toggleResponsiveMenu}>
        <span></span>
        <span></span>
        <span></span>
      </div>

      {/* Menú principal */}
      <ul className={menuOpen ? 'nav-links open' : 'nav-links'}>
        <li><Link to="/">INICIO</Link></li>
        <li><Link to="/products">PRODUCTOS</Link></li>

        {user ? (
          <li className="user-menu">
            <span onClick={() => setMenuVisible(!menuVisible)}>👤</span>
            {menuVisible && (
              <ul className="dropdown">
                <li><Link to="/orders">📦 Mis Compras</Link></li>
                <li><button onClick={onLogout}>🚪 Cerrar Sesión</button></li>
              </ul>
            )}
          </li>
        ) : (
          <>
            <li><Link to="/login">INICIAR SESIÓN</Link></li>
            <li><Link to="/register">REGISTRARSE</Link></li>
          </>
        )}

        <div className="navbar-cart">
          <Link to="/checkout" className={`cart-icon ${animate ? 'animate' : ''}`}>
            <FaShoppingCart size={24} />
            {cartItemCount > 0 && (
              <span ref={badgeRef} className={`cart-count ${animate ? 'cart-badge' : ''}`}>
                {cartItemCount}
              </span>
            )}
          </Link>
        </div>
      </ul>
    </nav>
  );
};

export default Navbar;

        //{user && <li><Link to="/checkout">CARRITO</Link></li>}