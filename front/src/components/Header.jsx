import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Header({ hasGroups, pendingRequestsCount = 0, userPoints = 0 }) {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.clear();
    navigate('/auth');
    window.location.reload();
  };

  const navTo = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <header className="site-header" role="banner">
      <div className="header-inner">
        <a
          className="header-logo"
          href="/"
          onClick={(e) => { e.preventDefault(); navTo('/'); }}
          aria-label="Ir a la página principal de ProdeKapotes"
        >
          <span className="logo-icon" aria-hidden="true">⚽</span>
          <span>Prode <span className="logo-highlight">Kapotes</span></span>
        </a>

        {/* Mobile menu toggle button */}
        <button
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Cerrar menú de navegación" : "Abrir menú de navegación"}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>

        <nav className={`header-nav ${mobileMenuOpen ? 'open' : ''}`} role="navigation" aria-label="Navegación principal">
          {token ? (
            /* Logged-in Header Nav */
            <>
              {userPoints > 0 && (
                <div
                  className="header-points-chip"
                  title="Puntos acumulados en ProdeKapotes"
                  onClick={() => navTo('/profile')}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && navTo('/profile')}
                >
                  <span aria-hidden="true">⭐</span>
                  <span>{userPoints} pts</span>
                </div>
              )}

              <button
                className={`nav-link ${isActive('/groups') || isActive('/') ? 'active' : ''}`}
                onClick={() => navTo('/groups')}
              >
                🏠 Mis Grupos
              </button>

              <button
                className={`nav-link nav-link-requests ${isActive('/requests') ? 'active' : ''}`}
                onClick={() => navTo('/requests')}
              >
                📨 Solicitudes
                {pendingRequestsCount > 0 && (
                  <span className="nav-badge" aria-label={`${pendingRequestsCount} solicitudes pendientes`}>{pendingRequestsCount}</span>
                )}
              </button>

              <button
                className={`nav-link ${isActive('/canchas') ? 'active' : ''}`}
                onClick={() => navTo('/canchas')}
              >
                🏟️ Canchas
              </button>

              <button
                className={`nav-link ${isActive('/users') ? 'active' : ''}`}
                onClick={() => navTo('/users')}
              >
                🔍 Buscar
              </button>

              <button
                className={`nav-link ${isActive('/profile') ? 'active' : ''}`}
                onClick={() => navTo('/profile')}
              >
                👤 Perfil
              </button>

              <button className="nav-link logout" onClick={handleLogout} aria-label="Cerrar sesión de usuario">
                Salir
              </button>
            </>
          ) : (
            /* Public Guest Header Nav */
            <>
              <button
                className={`nav-link ${isActive('/') ? 'active' : ''}`}
                onClick={() => navTo('/')}
              >
                🏠 Inicio
              </button>

              <button
                className={`nav-link ${isActive('/grupos') ? 'active' : ''}`}
                onClick={() => navTo('/grupos')}
              >
                👥 Grupos
              </button>

              <button
                className={`nav-link ${isActive('/partidos') ? 'active' : ''}`}
                onClick={() => navTo('/partidos')}
              >
                ⚽ Partidos
              </button>

              <button
                className={`nav-link ${isActive('/canchas') ? 'active' : ''}`}
                onClick={() => navTo('/canchas')}
              >
                🏟️ Canchas
              </button>

              <button
                className="nav-link btn-header-cta"
                onClick={() => navTo('/auth')}
                aria-label="Ingresar o crear cuenta"
              >
                🔑 Ingresar
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
