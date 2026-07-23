import { useNavigate } from 'react-router-dom';
import { useSEO } from '../utils/useSEO';
import Breadcrumbs from '../components/Breadcrumbs';

export default function PublicRankingPage() {
  const navigate = useNavigate();

  useSEO({
    title: 'Ranking y Tabla de Posiciones de Fútbol Amateur',
    description: 'Consultá cómo funciona el sistema de ranking y puntuación en ProdeKapotes. Sumá puntos por presentismo, victorias en partidos y minijuegos.',
    keywords: 'ranking futbol amateur, tabla de posiciones futbol 5, puntos prodekapotes, ranking minijuegos futbol',
    canonicalUrl: '/ranking',
  });

  return (
    <div className="seo-page-container">
      <Breadcrumbs items={[{ label: 'Ranking' }]} />

      <header className="seo-page-header">
        <span className="seo-page-icon" aria-hidden="true">🏆</span>
        <h1 className="seo-page-title">
          Sistema de Ranking y Puntuación en <span className="text-highlight">ProdeKapotes</span>
        </h1>
        <p className="seo-page-lead">
          Demostrá tu constancia en la cancha y tus conocimientos futboleros en la plataforma.
          Cada partido jugado, gol convertido y desafío diario completado te otorga puntos para escalar posiciones.
        </p>
        <div className="seo-header-actions">
          <button className="btn-primary-lg" onClick={() => navigate('/auth')}>
            🏆 Sumar Puntos en mi Grupo
          </button>
          <button className="btn-secondary-lg" onClick={() => navigate('/minijuegos')}>
            🎮 Jugar Minijuegos Diarios
          </button>
        </div>
      </header>

      {/* How points are earned */}
      <section className="seo-section">
        <h2 className="seo-section-title">¿Cómo se obtienen puntos en ProdeKapotes?</h2>
        <div className="seo-grid-3">
          <div className="seo-card">
            <span className="seo-card-icon" aria-hidden="true">👟</span>
            <h3>Por Asistir a Partidos</h3>
            <p>
              Confirmar tu presencia y asistir al encuentro te suma puntos por compromiso.
              ¡El presentismo se premia!
            </p>
          </div>

          <div className="seo-card">
            <span className="seo-card-icon" aria-hidden="true">✌️</span>
            <h3>Por Ganar Partidos</h3>
            <p>
              Formar parte del equipo ganador en la fecha te otorga un plus de puntos de rendimiento.
            </p>
          </div>

          <div className="seo-card">
            <span className="seo-card-icon" aria-hidden="true">⭐</span>
            <h3>Por Votos MVP</h3>
            <p>
              Ser elegido la figura del partido por tus propios compañeros suma puntos de distinción especial.
            </p>
          </div>

          <div className="seo-card">
            <span className="seo-card-icon" aria-hidden="true">🧩</span>
            <h3>Desafío FutWordle</h3>
            <p>
              Adivinar el futbolista del día en la menor cantidad de intentos otorga puntos diarios acumulables.
            </p>
          </div>

          <div className="seo-card">
            <span className="seo-card-icon" aria-hidden="true">⚡</span>
            <h3>GolTexto y FutLegacy</h3>
            <p>
              Demostrar tus conocimientos de trayectorias y camisetas históricas recompensa tu memoria futbolera.
            </p>
          </div>

          <div className="seo-card">
            <span className="seo-card-icon" aria-hidden="true">🔥</span>
            <h3>Rachas Diarias</h3>
            <p>
              Mantener una racha ininterrumpida de días jugando otorga multiplicadores de puntuación.
            </p>
          </div>
        </div>
      </section>

      {/* Ranking modalities */}
      <section className="seo-section">
        <h2 className="seo-section-title">Modalidades de Ranking</h2>
        <div className="seo-grid-2">
          <div className="seo-card">
            <h3>👥 Ranking Interno del Grupo</h3>
            <p>
              Cada grupo de amigos tiene su tabla de posiciones privada donde compiten únicamente sus miembros.
              Se reinicia mensualmente o al finalizar cada temporada elegida por el administrador.
            </p>
          </div>
          <div className="seo-card">
            <h3>🌎 Leaderboard Global</h3>
            <p>
              Los jugadores con mayor puntaje en minijuegos y predicciones ingresan al top global de la plataforma,
              pudiendo comparar su nivel con miles de usuarios de todo el país.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <div className="seo-cta-banner">
        <h2>¿Querés escalar al puesto #1 de tu grupo?</h2>
        <p>Registrate gratis, jugá el desafío del día y anotate para el próximo partido.</p>
        <button className="btn-primary-lg" onClick={() => navigate('/auth')}>
          Ver mi Puntuación
        </button>
      </div>
    </div>
  );
}
