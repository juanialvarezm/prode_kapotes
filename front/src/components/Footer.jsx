import { useNavigate } from 'react-router-dom';

export default function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          ⚽ <span>Prode Kapotes</span> — Mundial 2026
        </div>
        <div className="footer-sub">
          Competí con tus amigos prediciendo los resultados. ¡Que gane el mejor!
        </div>
        <div className="footer-links">
          <button
            className="footer-link"
            onClick={() => navigate('/privacy')}
            id="footer-link-privacy"
          >
            🔐 Políticas de Privacidad
          </button>
        </div>
      </div>
    </footer>
  );
}
