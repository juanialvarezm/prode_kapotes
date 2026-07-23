import { useNavigate } from 'react-router-dom';
import { useSEO } from '../utils/useSEO';
import Breadcrumbs from '../components/Breadcrumbs';

export default function AboutUsPage() {
  const navigate = useNavigate();

  useSEO({
    title: 'Sobre Nosotros - La Historia de ProdeKapotes',
    description: 'Conocé la historia, visión y equipo detrás de ProdeKapotes, la plataforma creada para potenciar el fútbol amateur.',
    canonicalUrl: '/sobre-nosotros',
  });

  return (
    <div className="seo-page-container">
      <Breadcrumbs items={[{ label: 'Sobre Nosotros' }]} />

      <header className="seo-page-header">
        <span className="seo-page-icon" aria-hidden="true">🏢</span>
        <h1 className="seo-page-title">
          Sobre <span className="text-highlight">ProdeKapotes</span>
        </h1>
        <p className="seo-page-lead">
          Nacimos para transformar la experiencia del fútbol entre amigos en Argentina y Latinoamérica.
        </p>
      </header>

      <section className="seo-section">
        <div className="seo-grid-2">
          <div className="seo-card">
            <h2>⚽ Nuestra Misión</h2>
            <p>
              En ProdeKapotes creemos que el fútbol amateur de los viernes o los fines de semana es sagrado.
              Nuestra misión es brindarle a cada grupo de amigos las herramientas digitales de un club profesional:
              listas de asistencia sin caos, partidos equilibrados, estadísticas detalladas de cada jugador y entretenimiento diario.
            </p>
          </div>

          <div className="seo-card">
            <h2>🚀 Nuestra Visión</h2>
            <p>
              Queremos ser la plataforma de referencia para conectar a jugadores amateur con complejos deportivos,
              propiciando partidos organizados, menor ausentismo y mayor disfrute de la cultura futbolera.
            </p>
          </div>
        </div>
      </section>

      <section className="seo-section">
        <h2 className="seo-section-title">Valores que nos Definen</h2>
        <div className="seo-grid-3">
          <div className="seo-card">
            <span className="seo-card-icon" aria-hidden="true">🤝</span>
            <h3>Comunidad y Amistad</h3>
            <p>Fomentamos el encuentro deportivo, la sana competencia y el folklore futbolero entre amigos.</p>
          </div>

          <div className="seo-card">
            <span className="seo-card-icon" aria-hidden="true">⚡</span>
            <h3>Simplicidad y Eficiencia</h3>
            <p>Interfaces rápidas, sin desvíos y pensadas para resolverse en 2 clics desde el celular.</p>
          </div>

          <div className="seo-card">
            <span className="seo-card-icon" aria-hidden="true">🔒</span>
            <h3>Transparencia y Privacidad</h3>
            <p>Manejo seguro de datos, privacidad en grupos y claridad en cada métrica y registro.</p>
          </div>
        </div>
      </section>

      <div className="seo-cta-banner">
        <h2>Sumate a la comunidad de ProdeKapotes</h2>
        <p>Creá tu grupo y comenzá a disfrutar del fútbol amateur como se debe.</p>
        <button className="btn-primary-lg" onClick={() => navigate('/auth')}>
          Empezar Gratis
        </button>
      </div>
    </div>
  );
}
