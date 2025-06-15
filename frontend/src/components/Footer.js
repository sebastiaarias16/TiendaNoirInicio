import '../styles/footer.css';

const Footer = () => (
  <footer className="footer">
    <div className="footer-content">
      <p className="footer-copy">
        © 2025 <span>Noir</span>. Todos los derechos reservados.
      </p>
      <div className="social">
        <a href="https://www.instagram.com/noir.off/" target="_blank" rel="noopener noreferrer">
          <i className="fab fa-instagram"></i> Instagram
        </a>
        <a href="#" target="_blank" rel="noopener noreferrer">
          <i className="fab fa-tiktok"></i> TikTok
        </a>
        <a href="/contacto">
          <i className="fas fa-envelope"></i> Contacto
        </a>
      </div>
    </div>
  </footer>
);

export default Footer;