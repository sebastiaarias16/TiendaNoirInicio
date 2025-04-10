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
      <div className="products-container">
      <h1 className="fade-in-title">Nuestros Productos</h1>
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