import { useNavigate } from 'react-router-dom';
import logoImg from '../assets/pngwing.png';

export default function Footer() {
  const navigate = useNavigate();

  const navTo = (path) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="site-footer" role="contentinfo">
      <div className="footer-inner-compact">
        <div className="footer-brand-compact">
          <img src={logoImg} alt="Prode Kapotes" className="footer-logo-img" />
          <span className="footer-brand-text">Prode <span className="logo-highlight">Kapotes</span></span>
          <span className="footer-tagline">— Organizá tu fútbol entre amigos</span>
        </div>

        <nav className="footer-nav-compact" aria-label="Navegación del pie de página">
          <button type="button" onClick={() => navTo('/ayuda')}>Ayuda</button>
          <span className="footer-sep">•</span>
          <button type="button" onClick={() => navTo('/sobre-nosotros')}>Sobre Nosotros</button>
          <span className="footer-sep">•</span>
          <button type="button" onClick={() => navTo('/contacto')}>Contacto</button>
          <span className="footer-sep">•</span>
          <button type="button" onClick={() => navTo('/politica-de-privacidad')}>Privacidad</button>
          <span className="footer-sep">•</span>
          <button type="button" onClick={() => navTo('/terminos-y-condiciones')}>Términos</button>
        </nav>

        <div className="footer-copyright-compact">
          © {new Date().getFullYear()} ProdeKapotes. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
