import { motion } from 'framer-motion';
import '../styles/about.css';

const About = () => (
  <motion.section className="about" initial={{ x: -100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 1 }}>
    <div>
      <h3>Estilo Noir 🖤</h3>
      <p>
        Noir no es solo ropa, es una actitud. Diseñamos prendas para quienes buscan verse y sentirse poderosos.
      </p>
    </div>
    <img src="/Img/about.png" alt="Noir estilo" />
  </motion.section>
);

export default About;