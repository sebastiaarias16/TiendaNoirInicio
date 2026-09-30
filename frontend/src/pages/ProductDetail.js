import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchProductById } from '../api/api';
import { CartContext } from '../CartContext';
import Footer from '../components/Footer';
import SizeGuideModal from '../components/SizeGuideModal';
import CartConfirmationDrawer from '../components/CartConfirmationDrawer';
import { getProductGender, formatCOP, getImageSrc } from '../utils/productUtils';
import { FiChevronDown, FiChevronUp, FiMinus, FiPlus, FiShoppingBag, FiTruck, FiShield, FiInfo } from 'react-icons/fi';
import '../styles/productDetail.css';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3000';

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useContext(CartContext);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Gallery state
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Variant & Quantity state
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [sizeError, setSizeError] = useState(false);

  // Modals & Drawers
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  // Accordion state (first section open by default)
  const [openAccordions, setOpenAccordions] = useState({
    description: true,
    details: false,
    fabric: false,
    shipping: false,
  });

  const toggleAccordion = (key) => {
    setOpenAccordions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Fetch product by ID
  useEffect(() => {
    let isMounted = true;
    const loadProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchProductById(id);
        if (isMounted) {
          if (!data) {
            setError('404');
          } else {
            setProduct(data);
            // Default size & color from authentic product data
            if (data.tallas && data.tallas.length > 0) {
              setSelectedSize(data.tallas[0]);
            }
            if (data.colores && data.colores.length > 0) {
              setSelectedColor(data.colores[0]);
            }
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error cargando detalle de producto:', err);
          setError('500');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadProduct();
    return () => {
      isMounted = false;
    };
  }, [id]);

  // Update page title
  useEffect(() => {
    if (product) {
      document.title = `${product.nombre} — NOIR APPAREL`;
    } else if (error === '404') {
      document.title = 'Producto no encontrado — NOIR';
    }
  }, [product, error]);

  // Build authentic image list from product data
  const images = useMemo(() => {
    if (!product) return [];
    const list = Array.isArray(product.imagen)
      ? product.imagen
      : product.imagen
      ? [product.imagen]
      : Array.isArray(product.imagenes)
      ? product.imagenes
      : product.imagenes
      ? [product.imagenes]
      : [];

    return list.map((img) => {
      if (img.startsWith('http://') || img.startsWith('https://')) return img;
      if (img.startsWith('/')) return img;
      return `${API_URL}/uploads/${img}`;
    });
  }, [product]);

  // Gender label
  const genderLabel = useMemo(() => {
    if (!product) return null;
    const g = getProductGender(product);
    if (g === 'men') return 'HOMBRE / MEN';
    if (g === 'women') return 'MUJER / WOMEN';
    return null;
  }, [product]);

  const stock = product ? (typeof product.stock === 'number' ? product.stock : 0) : 0;
  const isOutOfStock = stock <= 0;

  // Quantity handlers with strict stock clamping
  const handleIncrement = () => {
    if (quantity < stock) {
      setQuantity((prev) => prev + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  // Add to Cart handler
  const handleAddToCart = () => {
    if (!product || isOutOfStock) return;

    if (product.tallas && product.tallas.length > 0 && !selectedSize) {
      setSizeError(true);
      return;
    }
    setSizeError(false);

    const itemToAdd = {
      ...product,
      selectedSize: selectedSize || (product.talla || 'M'),
      selectedColor: selectedColor || (product.color || 'Negro'),
    };

    addToCart(itemToAdd, quantity);
    setIsFeedbackOpen(true);
  };

  // ----------------------------------------------------
  // LOADING STATE
  // ----------------------------------------------------
  if (loading) {
    return (
      <main className="product-detail-page">
        <div className="container-wide detail-layout">
          <div className="detail-media-skeleton" aria-busy="true" aria-label="Cargando galería" />
          <div className="detail-info-skeleton" aria-busy="true" aria-label="Cargando información" />
        </div>
        <Footer />
      </main>
    );
  }

  // ----------------------------------------------------
  // 404 / ERROR STATE
  // ----------------------------------------------------
  if (error || !product) {
    return (
      <main className="product-detail-page">
        <div className="container-editorial product-not-found">
          <span className="editorial-label">CATÁLOGO NOIR</span>
          <h1 className="not-found-title">PRODUCTO NO ENCONTRADO</h1>
          <p className="not-found-text">
            La prenda solicitada no está disponible en el catálogo activo de NOIR o el enlace no es válido.
          </p>
          <div className="not-found-actions">
            <Link to="/products" className="noir-btn noir-btn-primary">
              EXPLORAR COLECCIÓN COMPLETA
            </Link>
            <Link to="/" className="noir-btn noir-btn-secondary">
              VOLVER AL INICIO
            </Link>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  const activeMainImage = images[selectedImageIndex] || getImageSrc(product);

  return (
    <>
      <main className="product-detail-page">
        {/* Breadcrumb Navigation */}
        <nav className="container-wide detail-breadcrumb" aria-label="Ruta de navegación">
          <Link to="/">INICIO</Link>
          <span className="breadcrumb-separator">/</span>
          <Link to="/products">COLECCIONES</Link>
          {genderLabel && (
            <>
              <span className="breadcrumb-separator">/</span>
              <Link to={`/products?gender=${getProductGender(product)}`}>
                {genderLabel.split(' / ')[0]}
              </Link>
            </>
          )}
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current" aria-current="page">
            {product.nombre}
          </span>
        </nav>

        <div className="container-wide detail-layout">
          {/* ==============================================
              LEFT COLUMN: LARGE PRODUCT MEDIA / GALLERY
              ============================================== */}
          <section className="detail-gallery-section" aria-label="Galería de imágenes del producto">
            <div className="gallery-main-container">
              <div className="gallery-main-wrapper">
                <img
                  src={activeMainImage}
                  alt={`${product.nombre} — NOIR APPAREL`}
                  className="gallery-main-image"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/Img/foto.png';
                  }}
                />
                {product.featured && (
                  <span className="product-badge detail-badge">DROP 01</span>
                )}
                {isOutOfStock ? (
                  <span className="product-badge detail-badge out-of-stock">AGOTADO</span>
                ) : stock <= 3 ? (
                  <span className="product-badge detail-badge low-stock">
                    ÚLTIMAS {stock} UNIDADES
                  </span>
                ) : null}
              </div>
            </div>

            {/* Thumbnail Selector (Only when multiple authentic images exist) */}
            {images.length > 1 && (
              <div className="gallery-thumbnails-strip" role="tablist" aria-label="Vistas del producto">
                {images.map((imgUrl, index) => {
                  const isSelected = index === selectedImageIndex;
                  return (
                    <button
                      key={index}
                      type="button"
                      role="tab"
                      aria-selected={isSelected}
                      aria-label={`Ver imagen ${index + 1} de ${product.nombre}`}
                      className={`thumbnail-btn ${isSelected ? 'active' : ''}`}
                      onClick={() => setSelectedImageIndex(index)}
                    >
                      <img src={imgUrl} alt="" aria-hidden="true" />
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          {/* ==============================================
              RIGHT COLUMN: PRODUCT INFORMATION & ACTIONS
              ============================================== */}
          <section className="detail-info-section" aria-label="Información y compra del producto">
            {/* Header: Category & Gender */}
            <div className="detail-meta-header">
              <span className="detail-category">{product.categoria || 'NOIR APPAREL'}</span>
              {genderLabel && <span className="detail-gender">{genderLabel}</span>}
            </div>

            {/* Product Title */}
            <h1 className="detail-title">{product.nombre}</h1>

            {/* Price */}
            <div className="detail-price-box">
              <span className="detail-price">{formatCOP(product.precio)}</span>
              <span className="detail-currency">COP</span>
            </div>

            {/* Short Description */}
            {product.descripcion && (
              <p className="detail-short-desc">{product.descripcion}</p>
            )}

            <div className="detail-divider" />

            {/* ==============================================
                VARIANT SELECTION: SIZE & COLOR
                ============================================== */}
            {/* Size Selector */}
            {product.tallas && product.tallas.length > 0 && (
              <div className="detail-variant-group">
                <div className="variant-label-row">
                  <span className="variant-label">
                    TALLA: <strong>{selectedSize || 'SELECCIONA'}</strong>
                  </span>
                  <button
                    type="button"
                    className="btn-size-guide"
                    onClick={() => setIsSizeGuideOpen(true)}
                    aria-haspopup="dialog"
                  >
                    GUÍA DE TALLAS
                  </button>
                </div>

                <div className="size-pills-grid" role="radiogroup" aria-label="Selecciona tu talla">
                  {product.tallas.map((size) => {
                    const isSelected = selectedSize === size;
                    return (
                      <button
                        key={size}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        className={`size-pill ${isSelected ? 'active' : ''}`}
                        onClick={() => {
                          setSelectedSize(size);
                          setSizeError(false);
                        }}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
                {sizeError && (
                  <p className="variant-error-msg" role="alert">
                    Por favor selecciona una talla disponible antes de continuar.
                  </p>
                )}
              </div>
            )}

            {/* Color Selector */}
            {product.colores && product.colores.length > 0 && (
              <div className="detail-variant-group">
                <div className="variant-label-row">
                  <span className="variant-label">
                    COLOR: <strong>{selectedColor || product.colores[0]}</strong>
                  </span>
                </div>
                <div className="color-pills-row" role="radiogroup" aria-label="Selecciona tu color">
                  {product.colores.map((color) => {
                    const isSelected = selectedColor === color;
                    return (
                      <button
                        key={color}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        className={`color-pill ${isSelected ? 'active' : ''}`}
                        onClick={() => setSelectedColor(color)}
                      >
                        {color.toUpperCase()}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ==============================================
                QUANTITY & ADD TO CART
                ============================================== */}
            <div className="detail-purchase-row">
              {/* Quantity Selector */}
              <div className="quantity-control-wrapper" aria-label="Cantidad de prendas">
                <button
                  type="button"
                  className="qty-btn"
                  onClick={handleDecrement}
                  disabled={quantity <= 1 || isOutOfStock}
                  aria-label="Disminuir cantidad"
                >
                  <FiMinus size={14} aria-hidden="true" />
                </button>
                <span className="qty-value" aria-live="polite">
                  {quantity}
                </span>
                <button
                  type="button"
                  className="qty-btn"
                  onClick={handleIncrement}
                  disabled={quantity >= stock || isOutOfStock}
                  aria-label="Aumentar cantidad"
                >
                  <FiPlus size={14} aria-hidden="true" />
                </button>
              </div>

              {/* Add to Cart CTA */}
              <button
                type="button"
                className={`noir-btn noir-btn-primary detail-add-btn ${
                  isOutOfStock ? 'disabled' : ''
                }`}
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                aria-label={
                  isOutOfStock
                    ? 'Prenda agotada'
                    : `Añadir ${quantity} ${product.nombre} al carrito`
                }
              >
                <FiShoppingBag size={17} style={{ marginRight: '8px' }} aria-hidden="true" />
                {isOutOfStock ? 'PRENDA AGOTADA' : 'AÑADIR AL CARRITO'}
              </button>
            </div>

            {/* Stock & Delivery Micro-Badges */}
            <div className="detail-status-strip">
              <div className="status-item">
                <FiTruck size={16} className="status-icon" aria-hidden="true" />
                <span>Envíos directos en Bogotá D.C. &bull; Coordinación WhatsApp</span>
              </div>
              <div className="status-item">
                <FiShield size={16} className="status-icon" aria-hidden="true" />
                <span>Calidad técnica &bull; Stock verificado en almacén</span>
              </div>
            </div>

            <div className="detail-divider" />

            {/* ==============================================
                ACCORDION SECTIONS
                ============================================== */}
            <div className="detail-accordions">
              {/* Accordion 1: Description */}
              <div className="accordion-item">
                <button
                  type="button"
                  className="accordion-trigger"
                  onClick={() => toggleAccordion('description')}
                  aria-expanded={openAccordions.description}
                >
                  <span>DESCRIPCIÓN DE LA PRENDA</span>
                  {openAccordions.description ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
                </button>
                {openAccordions.description && (
                  <div className="accordion-content">
                    <p>{product.descripcion || 'Sin descripción detallada.'}</p>
                  </div>
                )}
              </div>

              {/* Accordion 2: Details */}
              <div className="accordion-item">
                <button
                  type="button"
                  className="accordion-trigger"
                  onClick={() => toggleAccordion('details')}
                  aria-expanded={openAccordions.details}
                >
                  <span>DETALLES TÉCNICOS</span>
                  {openAccordions.details ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
                </button>
                {openAccordions.details && (
                  <div className="accordion-content">
                    <ul className="details-list">
                      <li>Categoría: <strong>{product.categoria || 'Apparel'}</strong></li>
                      {genderLabel && <li>Línea: <strong>{genderLabel}</strong></li>}
                      <li>Disponibilidad: <strong>{stock > 0 ? `${stock} unidades en stock` : 'Agotado'}</strong></li>
                      <li>Corte: <strong>Anatómico de compresión y movimiento</strong></li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Accordion 3: Fabric & Care */}
              <div className="accordion-item">
                <button
                  type="button"
                  className="accordion-trigger"
                  onClick={() => toggleAccordion('fabric')}
                  aria-expanded={openAccordions.fabric}
                >
                  <span>COMPOSICIÓN Y CUIDADOS</span>
                  {openAccordions.fabric ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
                </button>
                {openAccordions.fabric && (
                  <div className="accordion-content">
                    <div className="fabric-notice">
                      <FiInfo size={16} className="fabric-notice-icon" aria-hidden="true" />
                      <p>
                        La especificación técnica de composición textil y gramaje (GSM) del DROP 01 se estandariza bajo la ficha de homologación NOIR.
                      </p>
                    </div>
                    <ul className="details-list" style={{ marginTop: '8px' }}>
                      <li>Lavar a máquina en ciclo suave con agua fría (30°C).</li>
                      <li>No utilizar blanqueador ni suavizantes abrasivos.</li>
                      <li>No retorcer; secar tendido a la sombra.</li>
                      <li>No planchar sobre estampados o transferencias.</li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Accordion 4: Shipping & Returns */}
              <div className="accordion-item">
                <button
                  type="button"
                  className="accordion-trigger"
                  onClick={() => toggleAccordion('shipping')}
                  aria-expanded={openAccordions.shipping}
                >
                  <span>ENVÍOS Y CAMBIOS</span>
                  {openAccordions.shipping ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
                </button>
                {openAccordions.shipping && (
                  <div className="accordion-content">
                    <p>
                      <strong>COBERTURA BOGOTÁ:</strong> Despachos coordinados para entrega en Bogotá D.C. Tras completar tu pedido en la tienda, nuestro equipo se contacta vía WhatsApp (+57 312 4252861) para coordinar la entrega y el método de pago acordado.
                    </p>
                    <p style={{ marginTop: '8px' }}>
                      <strong>POLÍTICA DE CAMBIOS:</strong> Puedes solicitar cambio por talla dentro de los primeros 5 días hábiles tras recibir tu pedido, siempre que la prenda conserve sus etiquetas originales, empaque y no presente signos de uso o lavado.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Size Guide Modal */}
      <SizeGuideModal
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
        productCategory={product.nombre}
      />

      {/* Instant Cart Feedback Drawer */}
      <CartConfirmationDrawer
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        product={product}
        quantity={quantity}
        selectedSize={selectedSize}
        selectedColor={selectedColor}
      />

      <Footer />
    </>
  );
};

export default ProductDetail;
