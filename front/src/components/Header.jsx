import { useNavigate, useLocation } from 'react-router-dom';

export default function Header({ hasGroups, pendingRequestsCount = 0, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    if (onLogout) {
      // Usar la función de logout del hook useAuth (recomendado)
      onLogout();
    } else {
      // Fallback: logout manual
      localStorage.clear();
      navigate('/auth');
      window.location.reload();
    }
  };

  return (
    <header className="site-header">
      <div className="header-inner">
        <a className="header-logo" href="/home" onClick={(e) => { e.preventDefault(); navigate(hasGroups ? '/home' : '/join-group'); }}>
          <span className="logo-icon">⚽</span>
          <span>Prode <span className="logo-highlight">Kapotes</span></span>
        </a>

        <nav className="header-nav">
          {hasGroups && (
            <>
              <button
                className={`nav-link ${isActive('/groups') || isActive('/') ? 'active' : ''}`}
                onClick={() => navigate('/groups')}
              >
                🏠 Grupos
              </button>
              <button
                className={`nav-link ${isActive('/matches') ? 'active' : ''}`}
                onClick={() => navigate('/matches')}
              >
                ⚽ Partidos
              </button>

              <button
                className={`nav-link ${isActive('/predictions') ? 'active' : ''}`}
                onClick={() => navigate('/predictions')}
              >
                🔮 Predicciones
              </button>
              {/* <button
                className={`nav-link ${isActive('/predictions') ? 'active' : ''}`}
                onClick={() => navigate('/predictions')}
              >
                🔮 Wordle
              </button> */}

            </>
          )}

          {!hasGroups && (
            <button
              className={`nav-link ${isActive('/join-group') ? 'active' : ''}`}
              onClick={() => navigate('/join-group')}
            >
              ➕ Grupos
            </button>
          )}

          <button
            className={`nav-link nav-link-requests ${isActive('/requests') ? 'active' : ''}`}
            onClick={() => navigate('/requests')}
          >
            📨 Solicitudes
            {pendingRequestsCount > 0 && (
              <span className="nav-badge">{pendingRequestsCount}</span>
            )}
          </button>

          <button
            className={`nav-link ${isActive('/profile') ? 'active' : ''}`}
            onClick={() => navigate('/profile')}
          >
            👤 Perfil
          </button>

          <button className="nav-link logout" onClick={handleLogout}>
            Salir
          </button>
        </nav>
      </div>
    </header>
  );
}
