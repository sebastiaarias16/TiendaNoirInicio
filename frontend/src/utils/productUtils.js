/**
 * NOIR Ecommerce — Product & Collection Utilities
 * Centralized, data-driven utilities for gender detection, currency, images, and category normalization.
 */

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3000';

/**
 * Detects product gender ('men', 'women', or 'unisex') from authentic product data.
 * Does not require MongoDB schema modification.
 */
export const getProductGender = (product) => {
  if (!product) return 'unisex';

  if (product.gender) {
    const g = String(product.gender).toLowerCase();
    if (g === 'men' || g === 'hombre') return 'men';
    if (g === 'women' || g === 'mujer') return 'women';
  }

  const name = (product.nombre || '').toLowerCase();
  const desc = (product.descripcion || '').toLowerCase();
  const cat = (product.categoria || '').toLowerCase();
  const combined = `${name} ${desc} ${cat}`;

  const hasMen = combined.includes('hombre') || combined.includes('men') || combined.includes('caballero');
  const hasWomen =
    combined.includes('mujer') ||
    combined.includes('women') ||
    combined.includes('dama') ||
    combined.includes('top ') ||
    name.startsWith('top') ||
    combined.includes('leggin') ||
    cat === 'short';

  if (hasMen && !hasWomen) return 'men';
  if (hasWomen && !hasMen) return 'women';

  // Conflict resolution: check name specifically
  if (name.includes('hombre')) return 'men';
  if (name.includes('mujer')) return 'women';

  return 'unisex';
};

/**
 * Formats Colombian Pesos (COP) currency without decimals.
 */
export const formatCOP = (price) => {
  if (typeof price !== 'number') {
    price = Number(price) || 0;
  }
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(price);
};

/**
 * Resolves product image source safely with authentic server upload and local fallbacks.
 */
export const getImageSrc = (product) => {
  if (!product) return '/Img/foto.png';
  const imgRef = Array.isArray(product.imagen)
    ? product.imagen[0]
    : product.imagen || (Array.isArray(product.imagenes) ? product.imagenes[0] : product.imagenes);

  if (!imgRef) return '/Img/foto.png';
  if (imgRef.startsWith('http://') || imgRef.startsWith('https://')) return imgRef;
  if (imgRef.startsWith('/uploads/')) return `${API_URL}${imgRef}`;
  if (imgRef.startsWith('uploads/')) return `${API_URL}/${imgRef}`;
  if (imgRef.startsWith('productos/')) return `${API_URL}/uploads/${imgRef}`;
  if (imgRef.startsWith('/')) return imgRef;
  return `${API_URL}/uploads/${imgRef}`;
};

/**
 * Normalizes category label with capitalized first letter.
 */
export const normalizeCategory = (category) => {
  if (!category) return '';
  const trimmed = category.trim();
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
};

/**
 * Generates a stable composite key for cart items combining product ID, size, and color.
 * Guarantees that the same product in different sizes or colors forms independent cart lines.
 */
export const getCartItemKey = (product, selectedSize, selectedColor) => {
  if (!product) return '';
  const id = typeof product === 'string' ? product : (product._id || product.id || product.productId || '');
  const size = (selectedSize || product?.selectedSize || product?.talla || 'STD').toString().trim().toUpperCase();
  const color = (selectedColor || product?.selectedColor || product?.color || 'STD').toString().trim().toUpperCase();
  return `${id}_${size}_${color}`;
};

