import { motion } from 'framer-motion';
import '../styles/about.css';

const listVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
};

const About = () => (
  <motion.section
    className="about"
    initial={{ x: -100, opacity: 0 }}
    whileInView={{ x: 0, opacity: 1 }}
    transition={{ duration: 1 }}
  >
    <div className="about-text">
      <h3>
        Estilo Noir <span className="heart-icon">🖤</span>
      </h3>
      <p>
        Noir no es solo ropa, es una actitud. Cada prenda representa seguridad,
        fuerza y elegancia. Diseñamos para quienes dominan con su presencia.
      </p>

      <motion.ul
        className="benefits"
        variants={listVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <motion.li variants={itemVariants}>Estilo audaz con propósito</motion.li>
        <motion.li variants={itemVariants}>Materiales de alta calidad</motion.li>
        <motion.li variants={itemVariants}>Hecho para líderes y disruptores</motion.li>
      </motion.ul>

      
    </div>

    <motion.div
      className="about-image"
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.4 }}
    >
      <img src="/Img/imageaboutNoir.jpg" alt="Noir estilo" />
    </motion.div>
  </motion.section>
);

export default About;