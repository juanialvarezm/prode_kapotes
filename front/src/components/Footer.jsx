import { useNavigate } from 'react-router-dom';

export default function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          ⚽ <span>Prode Kapotes</span>
        </div>
        <div className="footer-sub">
          Organizá el partido de los viernes sin volverte loco!
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
