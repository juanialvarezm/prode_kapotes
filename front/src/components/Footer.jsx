import { useNavigate } from 'react-router-dom';

export default function Footer() {
  const navigate = useNavigate();

  const navTo = (path) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="site-footer" role="contentinfo">
      <div className="footer-container">
        <div className="footer-grid">
          {/* Col 1: Brand & Mission */}
          <div className="footer-col footer-col-brand">
            <div className="footer-logo">
              <span className="footer-logo-icon" aria-hidden="true">⚽</span>
              <span>Prode <span className="logo-highlight">Kapotes</span></span>
            </div>
            <p className="footer-description">
              Plataforma integral para organizar partidos de fútbol amateur entre amigos,
              confirmar asistencias, alquilar canchas, registrar estadísticas y competir en minijuegos futboleros.
            </p>
            <div className="footer-badge-tag">
              🇦🇷 Hecho para el fútbol amateur argentino
            </div>
          </div>

          {/* Col 2: Funcionalidades */}
          <div className="footer-col">
            <h3 className="footer-col-title">Funcionalidades</h3>
            <ul className="footer-links-list">
              <li><button type="button" onClick={() => navTo('/grupos')}>👥 Grupos de Amigos</button></li>
              <li><button type="button" onClick={() => navTo('/partidos')}>⚽ Organizar Partidos</button></li>
              <li><button type="button" onClick={() => navTo('/canchas')}>🏟️ Alquiler de Canchas</button></li>
              <li><button type="button" onClick={() => navTo('/minijuegos')}>🎮 Minijuegos de Fútbol</button></li>
              <li><button type="button" onClick={() => navTo('/estadisticas')}>📊 Estadísticas de Jugadores</button></li>
              <li><button type="button" onClick={() => navTo('/ranking')}>🏆 Ranking y Puntuación</button></li>
              <li><button type="button" onClick={() => navTo('/como-funciona')}>💡 ¿Cómo Funciona?</button></li>
            </ul>
          </div>

          {/* Col 3: Centro de Ayuda */}
          <div className="footer-col">
            <h3 className="footer-col-title">Centro de Ayuda</h3>
            <ul className="footer-links-list">
              <li><button type="button" onClick={() => navTo('/ayuda')}>❓ Preguntas Frecuentes</button></li>
              <li><button type="button" onClick={() => navTo('/ayuda/crear-grupo')}>📖 Cómo Crear un Grupo</button></li>
              <li><button type="button" onClick={() => navTo('/ayuda/organizar-partido')}>📖 Cómo Organizar un Partido</button></li>
              <li><button type="button" onClick={() => navTo('/ayuda/confirmar-asistencia')}>📖 Confirmar Asistencia</button></li>
              <li><button type="button" onClick={() => navTo('/ayuda/encontrar-cancha')}>📖 Encontrar una Cancha</button></li>
            </ul>
          </div>

          {/* Col 4: Legales e Institucional */}
          <div className="footer-col">
            <h3 className="footer-col-title">Institucional</h3>
            <ul className="footer-links-list">
              <li><button type="button" onClick={() => navTo('/sobre-nosotros')}>🏢 Sobre Nosotros</button></li>
              <li><button type="button" onClick={() => navTo('/contacto')}>📬 Contacto y Soporte</button></li>
              <li><button type="button" onClick={() => navTo('/politica-de-privacidad')}>🔐 Política de Privacidad</button></li>
              <li><button type="button" onClick={() => navTo('/terminos-y-condiciones')}>📜 Términos y Condiciones</button></li>
              <li><button type="button" onClick={() => navTo('/politica-de-cookies')}>🍪 Política de Cookies</button></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} ProdeKapotes. Todos los derechos reservados. El sistema definitivo para tu partido de los viernes.</p>
        </div>
      </div>
    </footer>
  );
}
