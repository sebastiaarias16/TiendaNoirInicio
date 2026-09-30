import React from 'react';
import { Link } from 'react-router-dom';
import { FiInstagram, FiMessageSquare } from 'react-icons/fi';
import '../styles/footer.css';

const Footer = () => {
  return (
    <footer className="noir-footer" aria-label="Pie de página NOIR">
      <div className="container-wide">
        <div className="footer-top-grid">
          {/* Brand Column */}
          <div className="footer-brand-col">
            <h2 className="footer-brand-title">NOIR</h2>
            <p className="footer-brand-tagline">THE NEW STANDARD.</p>
            <p className="footer-brand-bio">
              Marca colombiana independiente de streetwear y prendas de entrenamiento técnico. Diseñado para quienes eligen la evolución constante.
            </p>
            <div className="footer-social-links">
              <a
                href="https://www.instagram.com/noir.off/"
                target="_blank"
                rel="noopener noreferrer"
                className="social-btn"
                aria-label="Instagram oficial de NOIR"
              >
                <FiInstagram size={18} />
                <span>@noir.off</span>
              </a>
              <a
                href="https://wa.me/573124252861"
                target="_blank"
                rel="noopener noreferrer"
                className="social-btn"
                aria-label="Atención al cliente WhatsApp NOIR"
              >
                <FiMessageSquare size={18} />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Nav Column: Shop */}
          <div className="footer-nav-col">
            <h3 className="footer-col-heading">SHOP</h3>
            <ul className="footer-nav-list">
              <li>
                <Link to="/products">Drop 01</Link>
              </li>
              <li>
                <Link to="/products">Hombre</Link>
              </li>
              <li>
                <Link to="/products">Mujer</Link>
              </li>
              <li>
                <Link to="/products">Todos los Productos</Link>
              </li>
            </ul>
          </div>

          {/* Nav Column: Account & Support */}
          <div className="footer-nav-col">
            <h3 className="footer-col-heading">CUENTA & SOPORTE</h3>
            <ul className="footer-nav-list">
              <li>
                <Link to="/login">Iniciar Sesión</Link>
              </li>
              <li>
                <Link to="/register">Crear Cuenta</Link>
              </li>
              <li>
                <Link to="/orders">Mis Pedidos</Link>
              </li>
              <li>
                <Link to="/checkout">Carrito de Compras</Link>
              </li>
            </ul>
          </div>

          {/* Nav Column: Brand Info */}
          <div className="footer-nav-col">
            <h3 className="footer-col-heading">COLOMBIA</h3>
            <ul className="footer-nav-list">
              <li>
                <a href="#manifesto">Nuestra Filosofía</a>
              </li>
              <li>
                <span className="footer-static-info">Envíos activos en Bogotá</span>
              </li>
              <li>
                <a
                  href="https://wa.me/573124252861?text=Hola%20NOIR,%20tengo%20una%20consulta%20sobre%20pedidos"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Consultas y Asistencia
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Legal & Copyright */}
        <div className="footer-bottom-bar">
          <p className="footer-copyright">
            &copy; {new Date().getFullYear()} NOIR APPAREL. BOGOTÁ, COLOMBIA. TODOS LOS DERECHOS RESERVADOS.
          </p>
          <div className="footer-legal-links">
            <span className="legal-item">EVOLUTION IS DISCIPLINE</span>
            <span className="legal-divider">&bull;</span>
            <span className="legal-item">THE NEW STANDARD</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;