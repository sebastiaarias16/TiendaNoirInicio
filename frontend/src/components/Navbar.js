import React, { useState, useEffect, useContext, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CartContext } from '../CartContext';
import { FiShoppingBag, FiUser, FiMenu, FiX } from 'react-icons/fi';
import AnnouncementBar from './AnnouncementBar';
import '../styles/navbar.css';

const Navbar = ({ user, onLogout }) => {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [badgeAnimate, setBadgeAnimate] = useState(false);
  const badgeRef = useRef(null);
  const dropdownRef = useRef(null);
  const location = useLocation();

  const { cartItems } = useContext(CartContext);
  const cartItemCount = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);

  // Detect scroll for subtle background elevation
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  }, [location]);

  // Close user dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Animate cart badge on count update
  useEffect(() => {
    if (cartItemCount > 0) {
      setBadgeAnimate(true);
      const timer = setTimeout(() => setBadgeAnimate(false), 300);
      return () => clearTimeout(timer);
    }
  }, [cartItemCount]);

  const handlePhilosopyClick = (e) => {
    if (location.pathname === '/') {
      e.preventDefault();
      const el = document.getElementById('manifesto');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className={`noir-header ${scrolled ? 'scrolled' : ''}`}>
      <AnnouncementBar />

      <nav className="noir-nav" aria-label="Navegación principal">
        <div className="nav-container">
          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            className="mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>

          {/* Brand Wordmark */}
          <div className="nav-brand">
            <Link to="/" className="brand-link" aria-label="NOIR Inicio">
              NOIR
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <ul className="nav-links-desktop">
            <li>
              <Link to="/products" className="nav-item-link">
                DROP 01
              </Link>
            </li>
            <li>
              <Link to="/products" className="nav-item-link">
                COLECCIÓN
              </Link>
            </li>
            <li>
              <a href="#manifesto" onClick={handlePhilosopyClick} className="nav-item-link">
                FILOSOFÍA
              </a>
            </li>
          </ul>

          {/* Right Utilities (User & Cart) */}
          <div className="nav-actions">
            {/* User Account */}
            {user ? (
              <div className="user-dropdown-container" ref={dropdownRef}>
                <button
                  type="button"
                  className="nav-action-btn user-btn"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  aria-label="Menú de usuario"
                  aria-expanded={userDropdownOpen}
                >
                  <FiUser size={20} />
                  <span className="user-firstname">{user.name?.split(' ')[0]}</span>
                </button>

                {userDropdownOpen && (
                  <div className="noir-dropdown-menu">
                    <div className="dropdown-header">
                      <p className="dropdown-user-name">{user.name}</p>
                      <p className="dropdown-user-email">{user.email}</p>
                    </div>
                    <div className="dropdown-divider" />
                    <Link
                      to="/orders"
                      className="dropdown-link"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      Mis Compras
                    </Link>
                    <button
                      type="button"
                      className="dropdown-link logout"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onLogout();
                      }}
                    >
                      Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="auth-links-desktop">
                <Link to="/login" className="nav-auth-link">
                  INGRESAR
                </Link>
              </div>
            )}

            {/* Shopping Cart */}
            <Link
              to="/checkout"
              className={`nav-action-btn cart-btn ${badgeAnimate ? 'pulse' : ''}`}
              aria-label={`Carrito de compras con ${cartItemCount} productos`}
            >
              <FiShoppingBag size={20} />
              {cartItemCount > 0 && (
                <span ref={badgeRef} className="cart-badge-indicator">
                  {cartItemCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <div className={`mobile-nav-drawer ${mobileMenuOpen ? 'open' : ''}`}>
          <div className="mobile-drawer-inner">
            <ul className="mobile-links-list">
              <li>
                <Link to="/" onClick={() => setMobileMenuOpen(false)}>
                  INICIO
                </Link>
              </li>
              <li>
                <Link to="/products" onClick={() => setMobileMenuOpen(false)}>
                  DROP 01
                </Link>
              </li>
              <li>
                <Link to="/products" onClick={() => setMobileMenuOpen(false)}>
                  COLECCIÓN COMPLETA
                </Link>
              </li>
              <li>
                <a href="#manifesto" onClick={handlePhilosopyClick}>
                  FILOSOFÍA
                </a>
              </li>
            </ul>

            <div className="mobile-drawer-footer">
              {user ? (
                <>
                  <p className="mobile-user-status">Conectado como <strong>{user.name}</strong></p>
                  <Link to="/orders" className="noir-btn noir-btn-secondary" style={{ width: '100%', marginBottom: '10px' }} onClick={() => setMobileMenuOpen(false)}>
                    Mis Compras
                  </Link>
                  <button type="button" className="btn-text" style={{ width: '100%', textAlign: 'center' }} onClick={() => { setMobileMenuOpen(false); onLogout(); }}>
                    Cerrar Sesión
                  </button>
                </>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <Link to="/login" className="noir-btn noir-btn-secondary" style={{ width: '100%' }} onClick={() => setMobileMenuOpen(false)}>
                    INICIAR SESIÓN
                  </Link>
                  <Link to="/register" className="noir-btn noir-btn-accent" style={{ width: '100%' }} onClick={() => setMobileMenuOpen(false)}>
                    CREAR CUENTA
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
