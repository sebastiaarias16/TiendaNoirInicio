import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fetchCartItems } from '../api/api';
import { CartContext } from '../CartContext';
import ProductCard from './ProductCard';

const DropShowcase = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    let isMounted = true;
    const loadProducts = async () => {
      try {
        const data = await fetchCartItems();
        if (isMounted) {
          // Prioritize featured items or first 4 garments for the drop showcase
          const showcaseItems = data && data.length > 0 ? data.slice(0, 4) : [];
          setProducts(showcaseItems);
        }
      } catch (err) {
        console.error('Error cargando Drop 01:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadProducts();
    return () => { isMounted = false; };
  }, []);

  return (
    <section id="drop-01" className="noir-section" style={{ padding: 'clamp(60px, 8vw, 100px) var(--space-lg)' }}>
      <div className="container-wide">
        {/* Editorial Section Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            marginBottom: 'var(--space-2xl)',
            flexWrap: 'wrap',
            gap: 'var(--space-md)',
            borderBottom: '1px solid var(--noir-border-subtle)',
            paddingBottom: 'var(--space-md)',
          }}
        >
          <div>
            <span className="editorial-label">DROP 01 &bull; LANZAMIENTO OFICIAL</span>
            <h2
              style={{
                fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)',
                fontWeight: 800,
                letterSpacing: 'var(--tracking-tight)',
                marginTop: '4px',
              }}
            >
              THE FIRST STANDARD
            </h2>
          </div>

          <Link
            to="/products"
            className="btn-text"
            style={{
              fontSize: '0.82rem',
              fontWeight: 600,
              letterSpacing: 'var(--tracking-wider)',
              textTransform: 'uppercase',
            }}
          >
            VER COLECCIÓN COMPLETA &rarr;
          </Link>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: 'var(--space-lg)',
            }}
          >
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                style={{
                  aspectRatio: '4 / 5',
                  backgroundColor: 'var(--noir-bg-secondary)',
                  border: '1px solid var(--noir-border-subtle)',
                }}
              />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-2xl) 0' }}>
            <p style={{ color: 'var(--noir-text-muted)' }}>Cargando catálogo NOIR...</p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 'var(--space-lg)',
            }}
          >
            {products.map((product) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <ProductCard product={product} addToCart={addToCart} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default DropShowcase;
