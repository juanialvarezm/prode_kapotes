import { useNavigate } from 'react-router-dom';

const navItems = [
  { icon: '🧩', label: 'FutWordle', path: '/futwordle', desc: '¿Quién es este jugador?' },
  { icon: '⚡', label: 'GolTexto', path: '/goltexto', desc: 'Adiviná por club y nac.' },
  { icon: '👕', label: 'FutLegacy', path: '/futlegacy', desc: 'Adiviná por camisetas' },
  { icon: '🏟️', label: 'Canchas', path: '/canchas', desc: 'Alquiler de complejos reales' },
  { icon: '👤', label: 'Perfil', path: '/profile', desc: 'Tu cuenta' },
];

export default function HomePage() {
  const navigate = useNavigate();
  const username = localStorage.getItem('username') || 'Kapote';

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
          <span>⚽ Organiza & Juega</span>
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
              <span className="home-hero-brand"></span>{' '}
              La forma más fácil de organizar partidos de fútbol y encontrar canchas con tus amigos.
              <br />
            </p>

            <div className="home-hero-actions">
              <button
                className="home-btn-primary"
                onClick={() => navigate('/canchas')}
                id="btn-home-canchas"
              >
                🏟️ Buscar Canchas
              </button>
              <button
                className="home-btn-secondary"
                onClick={() => navigate('/groups')}
                id="btn-home-groups"
              >
                👥 Mis Grupos
              </button>
            </div>
          </div>
        </section>

        {/* Quick stats / info cards */}
        <section className="home-cards-grid">
          <div className="home-info-card" onClick={() => navigate('/canchas')} role="button" tabIndex={0}>
            <div className="home-info-card-icon">🏟️</div>
            <div className="home-info-card-body">
              <h3>Buscar Canchas</h3>
              <p>Explorá más de 150 complejos en CABA y alrededores.</p>
            </div>
            <span className="home-info-card-arrow">→</span>
          </div>

          <div className="home-info-card" onClick={() => navigate('/groups')} role="button" tabIndex={0}>
            <div className="home-info-card-icon">👥</div>
            <div className="home-info-card-body">
              <h3>Organizar Partidos</h3>
              <p>Confirmá asistencia, gestioná pagos y jugá en grupo.</p>
            </div>
            <span className="home-info-card-arrow">→</span>
          </div>
        </section>
      </main>
    </div>
  );
}
