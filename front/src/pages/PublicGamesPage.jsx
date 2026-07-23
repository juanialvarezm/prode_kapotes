import { useNavigate } from 'react-router-dom';
import { useSEO } from '../utils/useSEO';
import Breadcrumbs from '../components/Breadcrumbs';

export default function PublicGamesPage() {
  const navigate = useNavigate();

  useSEO({
    title: 'Minijuegos de Fútbol: FutWordle, GolTexto y FutLegacy',
    description: 'Poné a prueba tus conocimientos futboleros con minijuegos diarios en ProdeKapotes. Adiviná jugadores por trayectoria, camisetas y pistas.',
    keywords: 'minijuegos futbol, wordle futbol, futwordle, goltexto, adivinar jugador futbol, trivia futbolera',
    canonicalUrl: '/minijuegos',
  });

  return (
    <div className="seo-page-container">
      <Breadcrumbs items={[{ label: 'Minijuegos' }]} />

      <header className="seo-page-header">
        <span className="seo-page-icon" aria-hidden="true">🎮</span>
        <h1 className="seo-page-title">
          Minijuegos de Fútbol en <span className="text-highlight">ProdeKapotes</span>
        </h1>
        <p className="seo-page-lead">
          Entre partido y partido, desafiá a tus amigos con nuestros minijuegos de trivia futbolera.
          Demostrá cuánto sabés de futbolistas internacionales, carreras, camisetas históricas y trayectorias.
        </p>
        <div className="seo-header-actions">
          <button className="btn-primary-lg" onClick={() => navigate('/auth')}>
            🎮 Jugar Minijuegos Gratis
          </button>
          <button className="btn-secondary-lg" onClick={() => navigate('/ranking')}>
            🏆 Ver Ranking Global
          </button>
        </div>
      </header>

      {/* Minigames Grid */}
      <section className="seo-section">
        <h2 className="seo-section-title">Nuestra Colección de Minijuegos</h2>
        <div className="seo-grid-3">
          <article className="seo-card game-card-highlight">
            <span className="seo-card-icon" aria-hidden="true">🧩</span>
            <h3>FutWordle</h3>
            <p className="game-card-subtitle">El Wordle de los futbolistas de élite</p>
            <p>
              Tenés 6 intentos para descubrir al jugador misterioso del día. En cada intento,
              recibís pistas visuales sobre su nacionalidad, liga, club actual, posición y edad.
            </p>
            <ul className="game-features-list">
              <li>🎯 Un jugador nuevo cada día.</li>
              <li>🟢 Pistas de verde para coincidencias exactas.</li>
              <li>🟡 Pistas de amarillo para coincidencias cercanas.</li>
            </ul>
          </article>

          <article className="seo-card game-card-highlight">
            <span className="seo-card-icon" aria-hidden="true">⚡</span>
            <h3>GolTexto</h3>
            <p className="game-card-subtitle">Adiviná por la trayectoria del jugador</p>
            <p>
              Te mostramos los clubes por los que pasó un futbolista a lo largo de su carrera.
              ¿Podrás identificar de quién se trata antes de agotar las pistas?
            </p>
            <ul className="game-features-list">
              <li>🏛️ Historial de clubes y años.</li>
              <li>🌍 Jugadores históricos y actuales.</li>
              <li>⭐ Sistema de puntos por velocidad.</li>
            </ul>
          </article>

          <article className="seo-card game-card-highlight">
            <span className="seo-card-icon" aria-hidden="true">👕</span>
            <h3>FutLegacy</h3>
            <p className="game-card-subtitle">Adiviná por camisetas icónicas</p>
            <p>
              Identificá a leyendas del fútbol observando sus camisetas históricas,
              dorsales legendarios y los momentos dorados de su carrera.
            </p>
            <ul className="game-features-list">
              <li>👕 Ilustraciones de camisetas históricas.</li>
              <li>🏆 Mundialistas y campeones de Champions.</li>
              <li>🔥 Desafío para verdaderos enfermos del fútbol.</li>
            </ul>
          </article>
        </div>
      </section>

      {/* Points & Ranking explanation */}
      <section className="seo-section">
        <h2 className="seo-section-title">¿Cómo funcionan los Puntos y los Premios?</h2>
        <div className="seo-grid-2">
          <div className="seo-card">
            <h3>⭐ Puntos Diarios</h3>
            <p>
              Cada minijuego resuelto exitosamente te otorga puntos para tu perfil personal en ProdeKapotes.
              ¡Mantené tu racha diaria activa para obtener multiplicadores de puntos adicionales!
            </p>
          </div>
          <div className="seo-card">
            <h3>🏆 Ranking del Grupo</h3>
            <p>
              Tus puntos se suman automáticamente a la tabla general de tu grupo de amigos.
              Competí día a día para consagrarte como el que más sabe de fútbol entre tus conocidos.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <div className="seo-cta-banner">
        <h2>Demostrá que sabés más de fútbol que tus amigos</h2>
        <p>Entrá ahora, completá el desafío del día y sumá tus primeros puntos.</p>
        <button className="btn-primary-lg" onClick={() => navigate('/auth')}>
          Jugar FutWordle Ahora
        </button>
      </div>
    </div>
  );
}
