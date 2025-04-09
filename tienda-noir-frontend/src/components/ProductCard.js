const ProductCard = ({ product, addToCart }) => (
    <div className="product-card">
      <img src={`http://localhost:3000/uploads/${product.imagen[0]}`} alt={product.nombre} />
      <h3>{product.nombre}</h3>
      <p>{product.descripcion}</p>
      <p><strong>${product.precio}</strong></p>
      <button onClick={() => addToCart(product)}>Agregar al carrito</button>
    </div>
  );
  
  export default ProductCard;