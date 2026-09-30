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

  const { cartItems, openCartDrawer } = useContext(CartContext);
  const cartItemCount = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);

  // Parse current query params for active link indication
  const searchParams = new URLSearchParams(location.search);
  const currentGender = searchParams.get('gender');
  const isProducts = location.pathname === '/products' || location.pathname === '/collections';
  const isMenActive = isProducts && currentGender === 'men';
  const isWomenActive = isProducts && currentGender === 'women';
  const isCollectionsActive = isProducts && !currentGender;

  // Detect scroll for subtle background elevation
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on route or query change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  }, [location.pathname, location.search]);

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

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Animate cart badge on count update
  useEffect(() => {
    if (cartItemCount > 0) {
      setBadgeAnimate(true);
      const timer = setTimeout(() => setBadgeAnimate(false), 300);
      return () => clearTimeout(timer);
    }
  }, [cartItemCount]);

  const handlePhilosophyClick = (e) => {
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
            aria-label={mobileMenuOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <FiX size={22} aria-hidden="true" /> : <FiMenu size={22} aria-hidden="true" />}
          </button>

          {/* Brand Wordmark */}
          <div className="nav-brand">
            <Link to="/" className="brand-link" aria-label="NOIR — Inicio">
              NOIR
            </Link>
          </div>

          {/* Desktop Navigation Links: MEN, WOMEN, COLLECTIONS, NOIR */}
          <ul className="nav-links-desktop">
            <li>
              <Link
                to="/products?gender=men"
                className={`nav-item-link ${isMenActive ? 'active' : ''}`}
              >
                MEN
              </Link>
            </li>
            <li>
              <Link
                to="/products?gender=women"
                className={`nav-item-link ${isWomenActive ? 'active' : ''}`}
              >
                WOMEN
              </Link>
            </li>
            <li>
              <Link
                to="/products"
                className={`nav-item-link ${isCollectionsActive ? 'active' : ''}`}
              >
                COLLECTIONS
              </Link>
            </li>
            <li>
              <a
                href="/#manifesto"
                onClick={handlePhilosophyClick}
                className="nav-item-link"
              >
                NOIR
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
                  <FiUser size={20} aria-hidden="true" />
                  <span className="user-firstname">{user.name?.split(' ')[0]}</span>
                </button>

                {userDropdownOpen && (
                  <div className="noir-dropdown-menu" role="menu">
                    <div className="dropdown-header">
                      <p className="dropdown-user-name">{user.name}</p>
                      <p className="dropdown-user-email">{user.email}</p>
                    </div>
                    <div className="dropdown-divider" />
                    <Link
                      to="/orders"
                      role="menuitem"
                      className="dropdown-link"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      Mis Compras
                    </Link>
                    <button
                      type="button"
                      role="menuitem"
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

            {/* Shopping Cart Button */}
            <button
              type="button"
              className={`nav-action-btn cart-btn ${badgeAnimate ? 'pulse' : ''}`}
              onClick={openCartDrawer}
              aria-label={`Abrir carrito de compras, ${cartItemCount} artículos`}
            >
              <FiShoppingBag size={20} aria-hidden="true" />
              {cartItemCount > 0 && (
                <span ref={badgeRef} className="cart-badge-indicator">
                  {cartItemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <div
          className={`mobile-nav-drawer ${mobileMenuOpen ? 'open' : ''}`}
          aria-hidden={!mobileMenuOpen}
        >
          <div className="mobile-drawer-inner">
            <div className="mobile-drawer-nav">
              <span className="editorial-label mobile-drawer-section-label">COLECCIONES</span>
              <ul className="mobile-links-list">
                <li>
                  <Link
                    to="/products?gender=men"
                    className={isMenActive ? 'active' : ''}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    MEN
                  </Link>
                </li>
                <li>
                  <Link
                    to="/products?gender=women"
                    className={isWomenActive ? 'active' : ''}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    WOMEN
                  </Link>
                </li>
                <li>
                  <Link
                    to="/products"
                    className={isCollectionsActive ? 'active' : ''}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    COLLECTIONS
                  </Link>
                </li>
                <li>
                  <a href="/#manifesto" onClick={handlePhilosophyClick}>
                    NOIR // MANIFIESTO
                  </a>
                </li>
              </ul>

              <div className="mobile-drawer-divider" />

              <span className="editorial-label mobile-drawer-section-label">ACCESOS DIRECTOS</span>
              <ul className="mobile-secondary-links">
                <li>
                  <Link to="/" onClick={() => setMobileMenuOpen(false)}>
                    Inicio
                  </Link>
                </li>
                <li>
                  <button
                    type="button"
                    className="mobile-drawer-cart-btn"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      openCartDrawer();
                    }}
                  >
                    Carrito de Compras ({cartItemCount})
                  </button>
                </li>
              </ul>
            </div>

            <div className="mobile-drawer-footer">
              {user ? (
                <>
                  <p className="mobile-user-status">
                    Conectado como <strong>{user.name}</strong>
                  </p>
                  <Link
                    to="/orders"
                    className="noir-btn noir-btn-secondary"
                    style={{ width: '100%', marginBottom: '10px' }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Mis Compras
                  </Link>
                  <button
                    type="button"
                    className="btn-text"
                    style={{ width: '100%', textAlign: 'center' }}
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onLogout();
                    }}
                  >
                    Cerrar Sesión
                  </button>
                </>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <Link
                    to="/login"
                    className="noir-btn noir-btn-secondary"
                    style={{ width: '100%' }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    INICIAR SESIÓN
                  </Link>
                  <Link
                    to="/register"
                    className="noir-btn noir-btn-accent"
                    style={{ width: '100%' }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
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
