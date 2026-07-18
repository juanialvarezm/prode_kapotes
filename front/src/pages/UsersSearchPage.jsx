import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchUsers } from '../api';

export default function UsersSearchPage() {
  const navigate = useNavigate();

  // Search input and debounce states
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');

  // Search results and pagination states
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState('');

  // Handle debounce effect
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedTerm(searchTerm.trim());
    }, 300); // 300ms debounce

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  // Fetch search results from API
  const performSearch = async (term, pageNum = 1, append = false) => {
    if (term.length < 2) {
      setUsers([]);
      setHasMore(false);
      setTotal(0);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await searchUsers(term, pageNum);
      const data = res.data;

      if (append) {
        setUsers((prev) => [...prev, ...data.users]);
      } else {
        setUsers(data.users);
      }

      setHasMore(data.has_more || false);
      setTotal(data.total || 0);
      setPage(pageNum);
    } catch (err) {
      if (err?.response?.status === 401) return; // Auth interceptor handles this
      setError('Error al realizar la búsqueda. Por favor, intenta de nuevo.');
      console.error('Error searching users:', err);
    } finally {
      setLoading(false);
    }
  };

  // Trigger search when debounced term changes
  useEffect(() => {
    // Reset page and perform initial search
    performSearch(debouncedTerm, 1, false);
  }, [debouncedTerm]);

  // Load more handler for pagination
  const handleLoadMore = () => {
    if (!loading && hasMore) {
      performSearch(debouncedTerm, page + 1, true);
    }
  };

  // Clear search input
  const handleClear = () => {
    setSearchTerm('');
  };

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <h2 className="page-title" style={{ marginBottom: 0 }}>
          <span className="icon">🔍</span> Buscador de Usuarios
        </h2>
      </div>
      <p className="page-subtitle">
        Buscá a otros jugadores de la aplicación y mirá sus estadísticas.
      </p>

      {error && <div className="error">{error}</div>}

      <div className="card user-search-section" style={{ position: 'relative', marginBottom: 16 }}>
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            className="search-input"
            placeholder="Escribí el nombre del usuario..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            id="user-search-input"
            style={{ marginBottom: 0, paddingRight: '40px' }}
          />
          {searchTerm && (
            <button
              onClick={handleClear}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: '1.1rem',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Limpiar búsqueda"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Helper message when query is too short */}
      {debouncedTerm.length < 2 && !loading && (
        <div className="card empty-state" style={{ padding: '32px 16px' }}>
          <span className="empty-icon" style={{ fontSize: '2.5rem' }}>👥</span>
          <p style={{ margin: '12px 0 0 0', color: 'var(--text-muted)' }}>
            Escribí al menos 2 letras para comenzar a buscar.
          </p>
        </div>
      )}

      {/* Results list */}
      {debouncedTerm.length >= 2 && (
        <>
          {users.length > 0 && (
            <div className="card" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <span>Coincidencias encontradas: {total}</span>
                {users.length < total && <span>Mostrando {users.length}</span>}
              </div>

              <ul className="user-search-results">
                {users.map((user) => (
                  <li key={user.id}>
                    <div className="user-result-info">
                      <div className="user-result-avatar">
                        {user.profile_picture ? (
                          <img
                            src={user.profile_picture}
                            alt={user.username}
                            style={{
                              width: '100%',
                              height: '100%',
                              borderRadius: '50%',
                              objectFit: 'cover'
                            }}
                          />
                        ) : (
                          user.username.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span className="user-result-name">{user.username}</span>
                        <span className="user-result-email">{user.email}</span>
                      </div>
                    </div>
                    <button
                      className="btn-add-user"
                      onClick={() => navigate(`/profile/${user.id}`)}
                      title={`Ver perfil de ${user.username}`}
                    >
                      👤 Ver Perfil
                    </button>
                  </li>
                ))}
              </ul>

              {hasMore && (
                <button
                  className="btn-load-more"
                  onClick={handleLoadMore}
                  disabled={loading}
                  style={{
                    marginTop: '16px',
                    width: '100%',
                    padding: '10px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    background: 'var(--glass-bg)',
                    color: 'var(--text-primary)',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'var(--transition)'
                  }}
                >
                  {loading ? 'Cargando más...' : 'Cargar más resultados'}
                </button>
              )}
            </div>
          )}

          {users.length === 0 && !loading && (
            <div className="card empty-state" style={{ padding: '32px 16px' }}>
              <span className="empty-icon" style={{ fontSize: '2.5rem' }}>🔍</span>
              <p style={{ margin: '12px 0 0 0', color: 'var(--text-muted)' }}>
                No se encontraron usuarios que coincidan con "{debouncedTerm}".
              </p>
            </div>
          )}
        </>
      )}

      {/* Loading state indicator */}
      {loading && users.length === 0 && (
        <div className="card empty-state" style={{ padding: '32px 16px' }}>
          <div
            className="match-detail-spinner"
            style={{
              width: '36px',
              height: '36px',
              margin: '0 auto',
              border: '3px solid rgba(16,185,129,0.1)',
              borderTopColor: 'var(--accent)'
            }}
          />
          <p style={{ marginTop: '16px', color: 'var(--text-muted)' }}>
            Buscando jugadores...
          </p>
        </div>
      )}
    </>
  );
}
