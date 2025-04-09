import { useEffect, useState } from 'react';
import { fetchCartItems } from '../api/api';
import ProductCard from '../components/ProductCard';
import '../styles/products.css';
import Footer from '../components/Footer';

const Products = ({ addToCart }) => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const data = await fetchCartItems();
      setProducts(data);
    };
    fetchProducts();
  }, []);

  return (
    <>
      <div style={{ padding: '40px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '20px' }}>🛍️ Nuestros Productos</h2>
        <div className="product-list">
          {products.map(product => (
            <ProductCard key={product._id} product={product} addToCart={addToCart} />
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Products;