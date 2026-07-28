import { useNavigate } from 'react-router-dom';
import { useSEO } from '../utils/useSEO';
import Breadcrumbs from '../components/Breadcrumbs';

export default function PublicMatchesPage() {
  const navigate = useNavigate();

  useSEO({
    title: 'Organización de Partidos de Fútbol Amateur',
    description: 'Publicá partidos de fútbol, gestioná listas de confirmados y suplentes, armá equipos balanceados y registrá el resultado en ProdeKapotes.',
    keywords: 'organizar partido futbol, lista de futbol 5, armar equipos futbol, rsvp partido futbol, confirmar asistencia futbol',
    canonicalUrl: '/partidos',
  });

  return (
    <div className="seo-page-container">
      <Breadcrumbs items={[{ label: 'Partidos' }]} />

      <header className="seo-page-header">
        <span className="seo-page-icon" aria-hidden="true">⚽</span>
        <h1 className="seo-page-title">
          Organizador de Partidos de Fútbol <span className="text-highlight">Amateur</span>
        </h1>
        <div className="seo-header-actions">
          <button className="btn-primary-lg" onClick={() => navigate('/auth')}>
            ⚽ Organizar un Partido
          </button>
          <button className="btn-secondary-lg" onClick={() => navigate('/canchas')}>
            🏟️ Buscar Cancha Disponible
          </button>
        </div>
      </header>



      {/* Workflow step by step */}
      <section className="seo-section">
        <h2 className="seo-section-title">Pasos para organizar un partido en ProdeKapotes</h2>
        <ol className="seo-steps-list">
          <li className="seo-step-item">
            <span className="step-number">1</span>
            <div>
              <h3>Publicar la Convocatoria</h3>
              <p>Seleccioná el día, la hora, el complejo de canchas y el tipo de partido (Fútbol 5, 7 o 11).</p>
            </div>
          </li>
          <li className="seo-step-item">
            <span className="step-number">2</span>
            <div>
              <h3>Notificar al Grupo</h3>
              <p>El sistema notifica a los miembros del grupo para que confirmen su presencia o se anoten como suplentes.</p>
            </div>
          </li>
          <li className="seo-step-item">
            <span className="step-number">3</span>
            <div>
              <h3>Balancear Equipos y Jugar</h3>
              <p>Definí las camisetas (Claros vs Oscuros) y disfrutá del partido con los 10 jugadores confirmados.</p>
            </div>
          </li>
          <li className="seo-step-item">
            <span className="step-number">4</span>
            <div>
              <h3>Cargar Planilla y Estadísticas</h3>
              <p>Ingresá el resultado, los goles, las asistencias y votá la figura del encuentro para actualizar el ranking.</p>
            </div>
          </li>
        </ol>
      </section>

      {/* CTA */}
      <div className="seo-cta-banner">
        <h2>¿Tenés un partido esta semana?</h2>
        <p>Creá la convocatoria en ProdeKapotes y asegurate de tener los 10 jugadores a tiempo.</p>
        <button className="btn-primary-lg" onClick={() => navigate('/auth')}>
          Organizar Partido Ahora
        </button>
      </div>
    </div>
  );
}
