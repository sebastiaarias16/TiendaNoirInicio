import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fetchCartItems } from '../api/api';
import { CartContext } from '../CartContext';
import ProductCard from './ProductCard';

const FeaturedCollection = () => {
  const [products, setProducts] = useState([]);
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    let isMounted = true;
    const loadProducts = async () => {
      try {
        const all = await fetchCartItems();
        if (isMounted) {
          // Curate the second merchandising row with sets/remaining essentials
          const setsAndStaples = all.filter(
            (p) =>
              p.categoria?.toLowerCase().includes('conjunto') ||
              p.categoria?.toLowerCase().includes('leggin') ||
              p.precio >= 60000
          );
          // If filtered list is small, take the latter half of the catalog to avoid exact clone of Drop 01
          const itemsToDisplay = setsAndStaples.length >= 2 ? setsAndStaples.slice(0, 3) : all.slice(2, 5);
          setProducts(itemsToDisplay);
        }
      } catch (err) {
        console.error('Error cargando productos destacados:', err);
      }
    };
    loadProducts();
    return () => { isMounted = false; };
  }, []);

  if (products.length === 0) return null;

  return (
    <section className="noir-section" style={{ padding: 'clamp(60px, 8vw, 100px) var(--space-lg)' }}>
      <div className="container-wide">
        {/* Section Header */}
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
            <span className="editorial-label">SETS &bull; COMPLETO</span>
            <h2
              style={{
                fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)',
                fontWeight: 800,
                letterSpacing: 'var(--tracking-tight)',
                marginTop: '4px',
              }}
            >
              BUILT TO EVOLVE
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
            EXPLORAR TODOS LOS PRODUCTOS &rarr;
          </Link>
        </div>

        {/* 3-Card Merchandising Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
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
      </div>
    </section>
  );
};

export default FeaturedCollection;
