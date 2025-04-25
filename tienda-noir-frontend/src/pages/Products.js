import { useState, useEffect, useContext } from 'react';
import { fetchCartItems } from '../api/api';
import ProductCard from '../components/ProductCard';
import Footer from '../components/Footer';
import { CartContext } from '../CartContext';
import '../styles/products.css';

const Products = () => {
  const [products, setProducts] = useState([]);
  const { addToCart } = useContext(CartContext);

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
        <h1 className="products-title fade-in-titl">FIRST NOIR COLECCTION</h1>
        <div className="product-list">
          {products.map(product => (
            <ProductCard
              key={product._id}
              product={product}
              addToCart={addToCart}
            />
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Products;