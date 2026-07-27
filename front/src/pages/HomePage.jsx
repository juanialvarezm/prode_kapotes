import { useNavigate } from 'react-router-dom';
import { useSEO } from '../utils/useSEO';

const navItems = [
  { icon: '🧩', label: 'FutWordle', path: '/futwordle', desc: '¿Quién es este jugador?' },
  { icon: '⚡', label: 'GolTexto', path: '/goltexto', desc: 'Adiviná por club y nac.' },
  { icon: '👕', label: 'FutLegacy', path: '/futlegacy', desc: 'Adiviná por camisetas' },
  { icon: '🏟️', label: 'Canchas', path: '/canchas', desc: 'Alquiler de complejos reales' },
  { icon: '👤', label: 'Perfil', path: '/profile', desc: 'Tu cuenta' },
];

export default function HomePage() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useSEO({
    title: 'ProdeKapotes | La Plataforma Definitiva para Organizar Fútbol Amateur',
    description: 'Organizá partidos de fútbol 5 con tus amigos, confirmá asistencias, encontrá canchas, llevá estadísticas de goleadores y jugá minijuegos diarios gratis.',
    keywords: 'futbol amateur, organizar partido futbol, futbol 5 amigos, buscar canchas futbol, wordle futbol, prodekapotes, estadisticas futbol 5',
    canonicalUrl: '/',
  });

  return (
    <div className="home-layout-seo">
      {/* Logged in Quick Sidebar for active users */}
      {token && (
        <aside className="home-sidebar" aria-label="Menú de acceso rápido">
          <div className="sidebar-header">
            <span className="sidebar-logo-icon" aria-hidden="true">⚽</span>
            <span className="sidebar-logo-text">
              Menú <span className="sidebar-logo-highlight">Rápido</span>
            </span>
          </div>

          <nav className="sidebar-nav">
            {navItems.map((item) => (
              <button
                key={item.path}
                className="sidebar-nav-item"
                onClick={() => navigate(item.path)}
              >
                <span className="sidebar-nav-icon" aria-hidden="true">{item.icon}</span>
                <span className="sidebar-nav-info">
                  <span className="sidebar-nav-label">{item.label}</span>
                  <span className="sidebar-nav-desc">{item.desc}</span>
                </span>
                <span className="sidebar-nav-arrow" aria-hidden="true">›</span>
              </button>
            ))}
          </nav>

          <div className="sidebar-footer">
            <span>⚽ Organizá & Jugá</span>
          </div>
        </aside>
      )}

      {/* Main Home Content */}
      <main className="home-content-seo">
        {/* HERO SECTION */}
        <section className="home-hero-seo">
          <div className="home-hero-bg-orb orb-1" aria-hidden="true" />
          <div className="home-hero-bg-orb orb-2" aria-hidden="true" />

          <div className="home-hero-inner-seo">

            <h1 className="home-hero-title-seo">
              Organizá el partido con tus amigos <br />
              <span className="home-hero-highlight">sin descontrol ni faltazos</span>
            </h1>

            <p className="home-hero-subtitle-seo">
              ProdeKapotes reúne todo lo que tu grupo necesita: convocatorias inteligentes,
              asistencias en tiempo real, alquiler de canchas, estadísticas de goleadores y minijuegos diarios.
            </p>

            <div className="home-hero-actions-seo">
              <button
                className="home-btn-primary"
                onClick={() => navigate(token ? '/groups' : '/auth')}
                id="btn-hero-primary"
              >
                {token ? 'Ir a Mis Grupos' : 'Empezar a Organizar Gratis'}
              </button>

              <button
                className="home-btn-secondary"
                onClick={() => navigate('/canchas')}
                id="btn-hero-canchas"
              >
                🏟️ Buscar Canchas
              </button>
            </div>

            {/* Quick Stats Bar */}
            <div className="hero-stats-bar">
              <div className="stat-item">
                <span className="stat-value">+250</span>
                <span className="stat-label">Complejos de Canchas</span>
              </div>
              <div className="stat-divider" aria-hidden="true" />
              <div className="stat-item">
                <span className="stat-value">100%</span>
                <span className="stat-label">Gratuito</span>
              </div>
              <div className="stat-divider" aria-hidden="true" />
              <div className="stat-item">
                <span className="stat-value">3</span>
                <span className="stat-label">Minijuegos Diarios</span>
              </div>
            </div>
          </div>
        </section>



        {/* FEATURE BREAKDOWN */}
        <section className="seo-section">
          <h2 className="seo-section-title">Todas las Funcionalidades de la Plataforma</h2>
          <div className="seo-grid-3">
            <div className="seo-card feature-card-interactive" onClick={() => navigate('/grupos')}>
              <span className="feature-icon">👥</span>
              <h3>Gestión de Grupos</h3>
              <p>Administración de miembros, aprobación de solicitudes y roles de organizador.</p>
              <span className="feature-link">Saber más sobre Grupos →</span>
            </div>

            <div className="seo-card feature-card-interactive" onClick={() => navigate('/partidos')}>
              <span className="feature-icon">⚽</span>
              <h3>Organización de Partidos</h3>
              <p>Listas de confirmados, cola de suplentes automática y control de cuotas de cancha.</p>
              <span className="feature-link">Saber más sobre Partidos →</span>
            </div>

            <div className="seo-card feature-card-interactive" onClick={() => navigate('/canchas')}>
              <span className="feature-icon">🏟️</span>
              <h3>Buscador de Canchas</h3>
              <p>Directorio con más de 150 complejos en CABA y GBA con fotos, mapa y servicios.</p>
              <span className="feature-link">Explorar Canchas →</span>
            </div>


          </div>
        </section>


      </main>
    </div>
  );
}
