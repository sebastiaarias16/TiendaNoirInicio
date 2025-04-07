import { Link } from 'react-router-dom';
import { useState } from 'react';
import '../styles/navbar.css';

const Navbar = ({ user, onLogout }) => {
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <nav>
      <h1>🖤 Noir</h1>
      <ul>
        <li><Link to="/">Inicio</Link></li>
        <li><Link to="/products">Productos</Link></li>
        <li><Link to="/checkout">Carrito</Link></li>

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
            <li><Link to="/login">Iniciar Sesión</Link></li>
            <li><Link to="/register">Registrarse</Link></li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;