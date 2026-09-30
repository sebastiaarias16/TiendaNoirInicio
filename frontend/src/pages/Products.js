import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchCartItems } from '../api/api';
import ProductCard from '../components/ProductCard';
import Footer from '../components/Footer';
import { CartContext } from '../CartContext';
import { getProductGender, normalizeCategory } from '../utils/productUtils';
import '../styles/products.css';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3000';

const COLLECTION_METADATA = {
  men: {
    title: 'MEN',
    eyebrow: 'NOIR // PERFORMANCE & COMPRESSION',
    description: 'Performance-driven essentials for training and movement.',
    image: `${API_URL}/uploads/IMGHOMBRE.jpg`,
    fallback: '/Img/promocion1.jpg',
  },
  women: {
    title: 'WOMEN',
    eyebrow: 'NOIR // TECHNICAL SILHOUETTES',
    description: 'Technical silhouettes built for performance and evolution.',
    image: `${API_URL}/uploads/IMGMUJER.jpg`,
    fallback: '/Img/promo2.jpg',
  },
  all: {
    title: 'COLLECTIONS',
    eyebrow: 'NOIR APPAREL // DROP 01',
    description: 'Explore the latest NOIR releases. Engineered for discipline and everyday performance.',
    image: null,
  },
};

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart } = useContext(CartContext);

  // Read active query filters
  const genderParam = searchParams.get('gender')?.toLowerCase() || 'all';
  const categoryParam = searchParams.get('category')?.toLowerCase() || 'all';
  const sortParam = searchParams.get('sort') || 'featured';

  // Fetch authentic product data from API
  useEffect(() => {
    let isMounted = true;
    const loadProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchCartItems();
        if (isMounted) {
          setProducts(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error cargando colección:', err);
          setError('No fue posible cargar el catálogo de productos.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadProducts();
    return () => {
      isMounted = false;
    };
  }, []);

  // Update document title for editorial polish
  useEffect(() => {
    const meta = COLLECTION_METADATA[genderParam] || COLLECTION_METADATA.all;
    document.title = `${meta.title} — NOIR APPAREL`;
  }, [genderParam]);

  // Derive unique categories available from the authentic products
  const availableCategories = useMemo(() => {
    const cats = new Set();
    products.forEach((p) => {
      if (p.categoria) {
        cats.add(normalizeCategory(p.categoria));
      }
    });
    return ['Todas', ...Array.from(cats).sort()];
  }, [products]);

  // Filter products by gender and category
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // 1. Gender filter
      if (genderParam === 'men') {
        const g = getProductGender(product);
        if (g !== 'men') return false;
      } else if (genderParam === 'women') {
        const g = getProductGender(product);
        if (g !== 'women') return false;
      }

      // 2. Category filter
      if (categoryParam !== 'all') {
        const productCat = (product.categoria || '').toLowerCase().trim();
        if (productCat !== categoryParam) return false;
      }

      return true;
    });
  }, [products, genderParam, categoryParam]);

  // Sort products
  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    if (sortParam === 'price-asc') {
      return list.sort((a, b) => (Number(a.precio) || 0) - (Number(b.precio) || 0));
    }
    if (sortParam === 'price-desc') {
      return list.sort((a, b) => (Number(b.precio) || 0) - (Number(a.precio) || 0));
    }
    if (sortParam === 'name-asc') {
      return list.sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''));
    }
    // Default 'featured': prioritize featured: true, then original order
    return list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  }, [filteredProducts, sortParam]);

  // Handler to update URL params cleanly
  const updateFilter = (key, value) => {
    const nextParams = new URLSearchParams(searchParams);
    if (!value || value === 'all' || value === 'Todas') {
      nextParams.delete(key);
    } else {
      nextParams.set(key, value);
    }
    setSearchParams(nextParams, { replace: true });
  };

  const handleResetFilters = () => {
    const nextParams = new URLSearchParams();
    if (genderParam !== 'all') {
      // Keep gender if user only wants to clear category
      nextParams.set('gender', genderParam);
    }
    setSearchParams(nextParams, { replace: true });
  };

  const handleClearAll = () => {
    setSearchParams({}, { replace: true });
  };

  const currentMeta = COLLECTION_METADATA[genderParam] || COLLECTION_METADATA.all;
  const isFiltered = categoryParam !== 'all' || sortParam !== 'featured';

  return (
    <>
      <main className="products-page-wrapper">
        {/* Editorial Collection Hero Banner */}
        <header className="collection-hero">
          {currentMeta.image && (
            <div className="collection-hero-media">
              <img
                src={currentMeta.image}
                alt={`Colección ${currentMeta.title} NOIR`}
                onError={(e) => {
                  e.target.onerror = null;
                  if (currentMeta.fallback) e.target.src = currentMeta.fallback;
                  else e.target.style.display = 'none';
                }}
              />
              <div className="collection-hero-overlay" />
            </div>
          )}

          <div className="collection-hero-content container-editorial">
            <span className="editorial-label collection-eyebrow">
              {currentMeta.eyebrow}
            </span>
            <h1 className="collection-title">{currentMeta.title}</h1>
            <p className="collection-description">{currentMeta.description}</p>
          </div>
        </header>

        {/* Collection Controls Bar */}
        <section
          className="collection-controls-bar"
          aria-label="Filtros y ordenamiento de colección"
        >
          <div className="container-wide controls-container">
            {/* Gender Switcher Tabs */}
            <div className="gender-tabs" role="tablist" aria-label="Filtro por género">
              <button
                type="button"
                role="tab"
                aria-selected={genderParam === 'all'}
                className={`tab-btn ${genderParam === 'all' ? 'active' : ''}`}
                onClick={() => updateFilter('gender', 'all')}
              >
                TODOS
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={genderParam === 'men'}
                className={`tab-btn ${genderParam === 'men' ? 'active' : ''}`}
                onClick={() => updateFilter('gender', 'men')}
              >
                HOMBRE
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={genderParam === 'women'}
                className={`tab-btn ${genderParam === 'women' ? 'active' : ''}`}
                onClick={() => updateFilter('gender', 'women')}
              >
                MUJER
              </button>
            </div>

            {/* Sort & Count Meta */}
            <div className="controls-meta">
              <span className="collection-count">
                [ {filteredProducts.length} {filteredProducts.length === 1 ? 'PIEZA' : 'PIEZAS'} ]
              </span>

              <div className="sort-dropdown-wrapper">
                <label htmlFor="collection-sort" className="sort-label">
                  ORDENAR:
                </label>
                <select
                  id="collection-sort"
                  className="noir-select"
                  value={sortParam}
                  onChange={(e) => updateFilter('sort', e.target.value)}
                  aria-label="Ordenar productos"
                >
                  <option value="featured">DESTACADOS</option>
                  <option value="price-asc">PRECIO: MENOR A MAYOR</option>
                  <option value="price-desc">PRECIO: MAYOR A MENOR</option>
                  <option value="name-asc">NOMBRE (A-Z)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Category Filter Pills (if categories exist) */}
          {availableCategories.length > 2 && (
            <div className="category-pills-row container-wide">
              <span className="category-row-label">CATEGORÍA:</span>
              <div className="category-pills-list">
                {availableCategories.map((cat) => {
                  const isActive =
                    (cat === 'Todas' && categoryParam === 'all') ||
                    cat.toLowerCase() === categoryParam;
                  return (
                    <button
                      key={cat}
                      type="button"
                      className={`pill-btn ${isActive ? 'active' : ''}`}
                      onClick={() => updateFilter('category', cat === 'Todas' ? 'all' : cat.toLowerCase())}
                      aria-pressed={isActive}
                    >
                      {cat.toUpperCase()}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Active Filter Chips */}
          {isFiltered && (
            <div className="active-filters-row container-wide">
              <span className="active-filters-label">FILTROS ACTIVOS:</span>
              {categoryParam !== 'all' && (
                <button
                  type="button"
                  className="filter-chip"
                  onClick={() => updateFilter('category', 'all')}
                  aria-label={`Eliminar filtro de categoría ${categoryParam}`}
                >
                  Categoría: {categoryParam.toUpperCase()} &times;
                </button>
              )}
              {sortParam !== 'featured' && (
                <button
                  type="button"
                  className="filter-chip"
                  onClick={() => updateFilter('sort', 'featured')}
                  aria-label="Restablecer orden"
                >
                  Orden modificado &times;
                </button>
              )}
              <button
                type="button"
                className="btn-clear-filters"
                onClick={handleResetFilters}
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </section>

        {/* Product Grid Section */}
        <section className="collection-grid-section container-wide">
          {loading ? (
            <div className="products-grid-skeleton" aria-busy="true" aria-label="Cargando catálogo">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="skeleton-card" />
              ))}
            </div>
          ) : error ? (
            <div className="collection-empty-state">
              <p className="empty-state-title">ERROR DE CONEXIÓN</p>
              <p className="empty-state-text">{error}</p>
              <button
                type="button"
                className="noir-btn noir-btn-secondary"
                onClick={() => window.location.reload()}
              >
                REINTENTAR
              </button>
            </div>
          ) : sortedProducts.length === 0 ? (
            <div className="collection-empty-state">
              <span className="editorial-label">SIN RESULTADOS</span>
              <h2 className="empty-state-title">NO HAY PRENDAS DISPONIBLES EN ESTA SELECCIÓN</h2>
              <p className="empty-state-text">
                Prueba seleccionando otra categoría o restablece los filtros para ver la colección completa de NOIR.
              </p>
              <button
                type="button"
                className="noir-btn noir-btn-secondary"
                onClick={handleClearAll}
              >
                VER TODA LA COLECCIÓN
              </button>
            </div>
          ) : (
            <div className="product-list" role="feed" aria-label="Catálogo de productos NOIR">
              {sortedProducts.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  addToCart={addToCart}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
};

export default Products;