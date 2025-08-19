import { motion } from "framer-motion";
import "../styles/promotions.css";

const promos = [
  "Nueva línea Oversize",
  "Envío gratis desde $150.000",
  "10% OFF en colección NOIR",
];

export default function PromoHexagons() {
  return (
    <section className="promo-hexagons">
      {promos.map((promo, i) => (
        <motion.div
          key={i}
          className="hexagon"
          initial={{ x: 0, y: 0 }}
          animate={{
            x: [0, Math.random() * 100 - 50],
            y: [0, Math.random() * 80 - 40],
          }}
          transition={{
            duration: 6 + Math.random() * 3,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        >
          <span>{promo}</span>
        </motion.div>
      ))}
    </section>
  );
}
