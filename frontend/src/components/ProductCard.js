import '../styles/productCard.css';

const API_URL = import.meta.env.VITE_BACKEND_URL;

const ProductCard = ({ product, addToCart }) => (
    <div className="product-card">
      <img src={`${API_URL}/uploads/${product.imagen[0]}`} alt={product.nombre} />
      <h3>{product.nombre}</h3>
      <p>{product.descripcion}</p>
      <p><strong>${product.precio}</strong></p>
      <button onClick={() => addToCart(product)}>Agregar al carrito</button>
    </div>
  );
  
  export default ProductCard;