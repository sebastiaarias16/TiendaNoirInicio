import { Link } from 'react-router-dom';
import { useState } from 'react';
import '../styles/navbar.css';

const Navbar = ({ user, onLogout }) => {
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <nav>
      <h1>NOIR</h1>
      <ul>
        <li><Link to="/">INICIO</Link></li>
        <li><Link to="/products">PRODUCTOS</Link></li>
        <li><Link to="/checkout">CARRITO</Link></li>

        {user ? (
          // Si el usuario está logueado, mostramos el icono del muñeco
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
          // Si no hay usuario, mostramos los botones de Login y Registro
          <>
            <li><Link to="/login">INICIAR SESION</Link></li>
            <li><Link to="/register">RESGISTRARSE</Link></li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;