import { motion } from 'framer-motion';
import '../styles/collection.css';

const products = [
  { id: 1, name: "Camiseta Oversized", img: "/Img/camisa1.png" },
  { id: 2, name: "Sudadera Performance", img: "/Img/sudadera1.png" },
  { id: 3, name: "Pantalon Jogger", img: "/Img/pantalon1.png" }
];

const Collection = () => (
  <section id="coleccion" className="collection">
    <h3>✨ Colección Destacada</h3>
    <div className="product-grid">
      {products.map(p => (
        <motion.div
          className="product-card"
          key={p.id}
          whileHover={{ scale: 1.05 }}
        >
          <img src={p.img} alt={p.name} />
          <h4>{p.name}</h4>
          <button>Ver más</button>
        </motion.div>
      ))}
    </div>
  </section>
);

export default Collection;