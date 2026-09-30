import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatCOP, getImageSrc } from '../utils/productUtils';
import '../styles/productCard.css';

const ProductCard = ({ product, addToCart }) => {
  const [added, setAdded] = useState(false);
  const imageSrc = getImageSrc(product);

  // Link directly to the Phase 4 Product Detail route
  const productDetailUrl = product?._id ? `/products/${product._id}` : '/products';

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!addToCart) return;

    // Attach first available size and color as safe defaults for immediate checkout validity
    const itemToAdd = {
      ...product,
      selectedSize: product.tallas && product.tallas.length > 0 ? product.tallas[0] : (product.talla || 'M'),
      selectedColor: product.colores && product.colores.length > 0 ? product.colores[0] : (product.color || 'Negro'),
    };

    addToCart(itemToAdd);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  return (
    <article className="product-card" data-product-id={product?._id}>
      <Link
        to={productDetailUrl}
        className="product-card-media"
        aria-label={`Ver detalles de ${product.nombre}`}
      >
        {product.featured && (
          <span className="product-card-badge">DROP 01</span>
        )}
        {product.stock && product.stock <= 3 && (
          <span className="product-card-badge low-stock">Últimas Unidades</span>
        )}
        <img
          src={imageSrc}
          alt={product.nombre}
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/Img/foto.png';
          }}
        />
      </Link>

      <div className="product-card-details">
        <div>
          <span className="product-card-category">{product.categoria || 'NOIR APPAREL'}</span>
          <h3 className="product-card-title">
            <Link to={productDetailUrl} className="product-card-title-link">
              {product.nombre}
            </Link>
          </h3>
          {product.descripcion && (
            <p className="product-card-description">{product.descripcion}</p>
          )}
        </div>

        <div className="product-card-meta">
          <div className="product-card-price">
            {formatCOP(product.precio)}
            <span className="product-card-currency">COP</span>
          </div>
          {product.stock > 0 && (
            <span style={{ fontSize: '0.7rem', color: 'var(--noir-text-muted)', letterSpacing: '0.04em' }}>
              En Stock
            </span>
          )}
        </div>

        <div className="product-card-actions">
          <button
            type="button"
            className={`btn btn-card-add ${added ? 'btn-accent' : ''}`}
            onClick={handleAdd}
            aria-label={`Añadir ${product.nombre} al carrito`}
          >
            {added ? 'Añadido ✓' : 'Añadir al Carrito'}
          </button>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;