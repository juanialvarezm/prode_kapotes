import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const navItems = [
  { icon: '🏠', label: 'Mis Grupos',     path: '/groups',      desc: 'Ver tus grupos' },
  { icon: '⚽', label: 'Partidos',        path: '/matches',     desc: 'Partidos del Mundial' },
  { icon: '🔮', label: 'Predicciones',   path: '/predictions', desc: 'Tus pronósticos' },
  { icon: '🧑‍🤝‍🧑', label: 'Mi Equipo', path: '/miequipo',   desc: 'Tu dream team' },
  { icon: '🎮', label: 'FutWordle',      path: '/futwordle',   desc: '¿Quién es este jugador?' },
  { icon: '👤', label: 'Perfil',         path: '/profile',     desc: 'Tu cuenta' },
];

export default function HomePage() {
  const navigate = useNavigate();
  const username = localStorage.getItem('username') || 'Kapote';

  // Auth guard — redirige a /auth si no hay token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/auth', { replace: true });
    }
  }, [navigate]);

  return (
    <div className="home-layout">
      {/* Sidebar */}
      <aside className="home-sidebar">
        <div className="sidebar-header">
          <span className="sidebar-logo-icon">⚽</span>
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
              <span className="sidebar-nav-icon">{item.icon}</span>
              <span className="sidebar-nav-info">
                <span className="sidebar-nav-label">{item.label}</span>
                <span className="sidebar-nav-desc">{item.desc}</span>
              </span>
              <span className="sidebar-nav-arrow">›</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <span>🏆 Mundial 2026</span>
        </div>
      </aside>

      {/* Main content */}
      <main className="home-content">
        {/* Hero */}
        <section className="home-hero">
          <div className="home-hero-bg-orb orb-1" />
          <div className="home-hero-bg-orb orb-2" />

          <div className="home-hero-inner">
            <div className="home-ball-wrap">
              <span className="home-ball">⚽</span>
            </div>

            <h1 className="home-hero-title">
              ¡Bienvenido,{' '}
              <span className="home-hero-name">{username}</span>!
            </h1>

            <p className="home-hero-subtitle">
              El{' '}
              <span className="home-hero-brand">Prode Kapotes</span>{' '}
              del Mundial 2026 ya está en marcha.
              <br />
              Predecí los resultados, sumá puntos y demostrá quién sabe más de fútbol.
            </p>

            <div className="home-hero-actions">
              <button
                className="home-btn-primary"
                onClick={() => navigate('/matches')}
                id="btn-home-matches"
              >
                ⚽ Ver Partidos
              </button>
              <button
                className="home-btn-secondary"
                onClick={() => navigate('/predictions')}
                id="btn-home-predictions"
              >
                🔮 Mis Predicciones
              </button>
            </div>
          </div>
        </section>

        {/* Quick stats / info cards */}
        <section className="home-cards-grid">
          <div className="home-info-card" onClick={() => navigate('/matches')} role="button" tabIndex={0}>
            <div className="home-info-card-icon">📅</div>
            <div className="home-info-card-body">
              <h3>Próximos Partidos</h3>
              <p>Mirá el fixture y pronósticá antes de que arranquen.</p>
            </div>
            <span className="home-info-card-arrow">→</span>
          </div>

          <div className="home-info-card" onClick={() => navigate('/predictions')} role="button" tabIndex={0}>
            <div className="home-info-card-icon">🔮</div>
            <div className="home-info-card-body">
              <h3>Tus Predicciones</h3>
              <p>Revisá tus pronósticos y cuántos puntos llevas.</p>
            </div>
            <span className="home-info-card-arrow">→</span>
          </div>

          <div className="home-info-card" onClick={() => navigate('/miequipo')} role="button" tabIndex={0}>
            <div className="home-info-card-icon">🧑‍🤝‍🧑</div>
            <div className="home-info-card-body">
              <h3>Mi Equipo</h3>
              <p>Armá tu dream team y competí con los demás.</p>
            </div>
            <span className="home-info-card-arrow">→</span>
          </div>

          <div className="home-info-card" onClick={() => navigate('/groups')} role="button" tabIndex={0}>
            <div className="home-info-card-icon">🏆</div>
            <div className="home-info-card-body">
              <h3>Mis Grupos</h3>
              <p>Gestioná tus grupos y competí con amigos.</p>
            </div>
            <span className="home-info-card-arrow">→</span>
          </div>
        </section>
      </main>
    </div>
  );
}
