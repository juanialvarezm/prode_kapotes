import { useNavigate } from 'react-router-dom';
import { useSEO } from '../utils/useSEO';
import Breadcrumbs from '../components/Breadcrumbs';

export default function PublicStatsPage() {
  const navigate = useNavigate();

  useSEO({
    title: 'Estadísticas de Jugadores de Fútbol Amateur',
    description: 'Registrá y consultá las estadísticas completas de tus partidos de fútbol 5: goles, asistencias, efectividad de victorias, premios MVP y nivel.',
    keywords: 'estadisticas futbol amateur, goles futbol 5, asistencias futbol 5, efectividad jugador futbol, tabla de goleadores futbol 5',
    canonicalUrl: '/estadisticas',
  });

  return (
    <div className="seo-page-container">
      <Breadcrumbs items={[{ label: 'Estadísticas' }]} />

      <header className="seo-page-header">
        <span className="seo-page-icon" aria-hidden="true">📊</span>
        <h1 className="seo-page-title">
          Estadísticas de Jugadores en <span className="text-highlight">ProdeKapotes</span>
        </h1>
        <p className="seo-page-lead">
          Llevá tu carrera de fútbol amateur al siguiente nivel. Registrá goles, asistencias, partidos jugados,
          efectividad de triunfos y medallas de MVP como si jugaras en primera división.
        </p>
        <div className="seo-header-actions">
          <button className="btn-primary-lg" onClick={() => navigate('/auth')}>
            📊 Ver mis Estadísticas
          </button>
          <button className="btn-secondary-lg" onClick={() => navigate('/grupos')}>
            👥 Ver Grupos de Amigos
          </button>
        </div>
      </header>

      {/* Metrics breakdown */}
      <section className="seo-section">
        <h2 className="seo-section-title">Métricas Registradas por el Sistema</h2>
        <div className="seo-grid-3">
          <div className="seo-card">
            <span className="seo-card-icon" aria-hidden="true">⚽</span>
            <h3>Tabla de Goleadores</h3>
            <p>
              Registrá cuántos goles marca cada jugador en cada fecha.
              Mantené al día la tabla de goleadores histórica del grupo y por torneo.
            </p>
          </div>

          <div className="seo-card">
            <span className="seo-card-icon" aria-hidden="true">👟</span>
            <h3>Máximos Asistidores</h3>
            <p>
              Porque el pase gol vale tanto como la definición. Reconocé a los armadores de juego
              que dejan a sus compañeros solos frente al arco.
            </p>
          </div>

          <div className="seo-card">
            <span className="seo-card-icon" aria-hidden="true">📈</span>
            <h3>Porcentaje de Victorias (%)</h3>
            <p>
              Calculá la efectividad real de cada jugador (Victorias vs Empates vs Derrotas).
              Descubrí quién es el jugador "amuleto" que siempre gana cuando viene.
            </p>
          </div>

          <div className="seo-card">
            <span className="seo-card-icon" aria-hidden="true">⭐</span>
            <h3>Premios MVP</h3>
            <p>
              Contabilizá las veces que fuiste votado como el Jugador Más Valioso por tus compañeros
              al finalizar el encuentro.
            </p>
          </div>

          <div className="seo-card">
            <span className="seo-card-icon" aria-hidden="true">🏟️</span>
            <h3>Presentismo y Asistencia</h3>
            <p>
              Medí la constancia de cada integrante del equipo. Averiguá quién asistió a todos los partidos del año
              y quién suele bajarse a último momento.
            </p>
          </div>

          <div className="seo-card">
            <span className="seo-card-icon" aria-hidden="true">🎖️</span>
            <h3>Ficha de Jugador y Nivel</h3>
            <p>
              Cada jugador cuenta con un perfil público dentro de la plataforma con su historial acumulado,
              foto de avatar y promedio de rendimiento.
            </p>
          </div>
        </div>
      </section>

      {/* Importance of amateur stats */}
      <section className="seo-section">
        <h2 className="seo-section-title">¿Por qué registrar estadísticas en el fútbol amateur?</h2>
        <div className="seo-grid-2">
          <div className="seo-card">
            <h3>⚖️ Partidos más parejos</h3>
            <p>
              Conocer el rendimiento y efectividad de cada jugador permite que el algoritmo de ProdeKapotes
              conforme planteles equilibrados, evitando partidos desiguales.
            </p>
          </div>
          <div className="seo-card">
            <h3>🔥 Motivación y folklore sano</h3>
            <p>
              Disputá el liderazgo de la tabla de goleadores semana a semana. El folklore del fútbol de los viernes
              se disfruta el doble cuando hay datos reales que respaldan las cargadas.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <div className="seo-cta-banner">
        <h2>¿Querés saber quién es el mejor jugador de tu grupo?</h2>
        <p>Registren su próximo partido en ProdeKapotes y comiencen a medir estadísticas reales.</p>
        <button className="btn-primary-lg" onClick={() => navigate('/auth')}>
          Registrar mis Estadísticas
        </button>
      </div>
    </div>
  );
}
