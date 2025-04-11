import { Link } from 'react-router-dom';
import { useState } from 'react';
import '../styles/navbar.css';

const Navbar = ({ user, onLogout }) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleResponsiveMenu = () => {
    setMenuOpen(!menuOpen);
  };
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
        {user && <li><Link to="/checkout">CARRITO</Link></li>}

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
      </ul>
    </nav>
  );
};

export default Navbar;