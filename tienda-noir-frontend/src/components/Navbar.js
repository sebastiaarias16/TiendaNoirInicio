import React, { useState, useEffect, useContext, useRef } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../CartContext';
import 'font-awesome/css/font-awesome.min.css';  // Ya no es necesario, lo eliminaremos si usas Material Icons.

import '../styles/navbar.css';

const Navbar = ({ user, onLogout }) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [animate, setAnimate] = useState(false);
  const badgeRef = useRef();

  // Obtén la cantidad de artículos en el carrito desde el contexto
  const { cartItems } = useContext(CartContext);
  const cartItemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // Toggle para el menú responsive
  const toggleResponsiveMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // Animación para el contador de artículos en el carrito
  useEffect(() => {
    if (badgeRef.current) {
      badgeRef.current.classList.remove('cart-badge');
      void badgeRef.current.offsetWidth; // Forzar reflow para reiniciar la animación
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
        <li><Link to="/" onClick={() => setMenuOpen(false)}>INICIO</Link></li>
        <li><Link to="/products" onClick={() => setMenuOpen(false)}>PRODUCTOS</Link></li>

        {/* Menú de usuario */}
        {user ? (
          <li className="user-menu">
            <span onClick={() => setMenuVisible(!menuVisible)} className="user-icon">
              <span className="material-icons">person</span>
            </span>
            {menuVisible && (
              <ul className="dropdown">
                <li><Link to="/orders" onClick={() => setMenuOpen(false)} className="dropdown-item">Mis Compras</Link></li>
                <li><button onClick={() => { onLogout(); setMenuOpen(false); }} className="dropdown-item logout-btn">Cerrar Sesión</button></li>
              </ul>
            )}
          </li>
        ) : (
          <>
            <li><Link to="/login" onClick={() => setMenuOpen(false)}>INICIAR SESIÓN</Link></li>
            <li><Link to="/register" onClick={() => setMenuOpen(false)}>REGISTRARSE</Link></li>
          </>
        )}

        {/* Icono del carrito */}
        <li className="navbar-cart">
    <div className="cart-wrapper">
      <Link to="/checkout" 
        className={`cart-icon ${animate ? 'animate' : ''}`} 
        onClick={() => setMenuOpen(false)}
      >
        <span className="material-icons" style={{ fontSize: 24 }}>
          shopping_cart
        </span>
      </Link>

      {cartItemCount > 0 && (
        <span ref={badgeRef} className={`cart-count ${animate ? 'cart-badge' : ''}`}>
          {cartItemCount}
        </span>
      )}
    </div>
  </li>
      </ul>
    </nav>


  );
};

export default Navbar;
