import { useEffect, useState } from 'react';
import { fetchCartItems } from '../api/api';
import ProductCard from '../components/ProductCard';

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
    <div>
      <h2>🛍️ Nuestros Productos</h2>
      <div className="product-list">
        {products.map(product => (
          <ProductCard key={product._id} product={product} addToCart={addToCart} />
        ))}
      </div>
    </div>
  );
};

export default Products;