import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUserProfile } from '../api';

export default function UserProfilePage() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [matches, setMatches] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');

  const loadData = async (pageNum = 1, append = false) => {
    if (pageNum === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setError('');

    try {
      const res = await getUserProfile(userId, pageNum, 10);
      const data = res.data;

      setUser(data.user);
      setStats(data.stats);
      setHasMore(data.has_more);

      if (append) {
        setMatches((prev) => [...prev, ...data.matches]);
      } else {
        setMatches(data.matches);
      }

      setPage(pageNum);
    } catch (err) {
      if (err?.response?.status === 401) return;
      setError(err?.response?.data?.error || 'Error al cargar el perfil del usuario');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (userId) {
      loadData(1, false);
    }
  }, [userId]);

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      loadData(page + 1, true);
    }
  };

  if (error) {
    return (
      <>
        <div style={{ marginBottom: 20 }}>
          <button className="btn btn-secondary" onClick={() => navigate(-1)}>
            ⬅️ Volver
          </button>
        </div>
        <div className="error">{error}</div>
      </>
    );
  }

  if (loading || !user || !stats) {
    return (
      <div className="card empty-state" style={{ minHeight: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div className="match-detail-spinner" style={{ width: '40px', height: '40px', border: '3px solid rgba(16,185,129,0.1)', borderTopColor: 'var(--accent)' }} />
        <p style={{ marginTop: '16px' }}>Cargando perfil...</p>
      </div>
    );
  }

  return (
    <>
      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          ⬅️ Volver
        </button>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Perfil Público</span>
      </div>

      {/* User Header */}
      <div className="user-profile-header">
        <div className="user-profile-avatar">
          {user.profile_picture ? (
            <img src={user.profile_picture} alt={user.username} />
          ) : (
            user.username.charAt(0).toUpperCase()
          )}
        </div>
        <div className="user-profile-info">
          <h2 className="user-profile-name">{user.username}</h2>
          <span className="user-profile-joined">
            📅 Miembro desde:{' '}
            {new Date(user.created_at).toLocaleDateString('es-AR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
          <span className="user-profile-id">ID de Usuario: #{user.id}</span>
        </div>
      </div>

      {/* Stats Section */}
      <div className="profile-stats-container">
        {/* Radial effectiveness is now played vs paid matches */}
        <div className="effectiveness-card">
          <span className="effectiveness-title">Cumplimiento de Pago</span>
          <div className="radial-progress">
            <svg width="140" height="140">
              <circle
                className="circle-bg"
                cx="70"
                cy="70"
                r="50"
                strokeWidth="8"
              />
              <circle
                className="circle-val"
                cx="70"
                cy="70"
                r="50"
                strokeWidth="8"
                strokeDasharray="314.16"
                strokeDashoffset={
                  314.16 - (stats.played_count > 0 ? (stats.paid_count / stats.played_count) : 1) * 314.16
                }
              />
            </svg>
            <div className="radial-progress-text">
              <span className="radial-progress-percent">
                {stats.played_count > 0 ? Math.round((stats.paid_count / stats.played_count) * 100) : 100}%
              </span>
              <span className="radial-progress-label">Al día</span>
            </div>
          </div>
          <p style={{ marginTop: '16px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Ha pagado {stats.paid_count} de {stats.played_count} partidos jugados.
          </p>
        </div>

        {/* Stats Metrics Cards */}
        <div className="metrics-grid">
          <div className="metric-card exact-hits-card" style={{ background: 'rgba(16, 185, 129, 0.05)', borderColor: 'rgba(16, 185, 129, 0.15)' }}>
            <div className="metric-value" style={{ color: 'var(--accent-light)' }}>{stats.played_count}</div>
            <div className="metric-label">Partidos Jugados ⚽</div>
            <div className="metric-desc">Partidos con fecha pasada</div>
          </div>

          <div className="metric-card winner-hits-card" style={{ background: 'rgba(59, 130, 246, 0.05)', borderColor: 'rgba(59, 130, 246, 0.15)' }}>
            <div className="metric-value" style={{ color: '#3b82f6' }}>{stats.upcoming_count}</div>
            <div className="metric-label">Próximos Partidos 📅</div>
            <div className="metric-desc">Partidos programados</div>
          </div>

          <div className="metric-card" style={{ background: stats.pending_payment_count > 0 ? 'rgba(239, 68, 68, 0.05)' : 'var(--bg-card)', borderColor: stats.pending_payment_count > 0 ? 'rgba(239, 68, 68, 0.15)' : 'var(--border)' }}>
            <div className="metric-value" style={{ color: stats.pending_payment_count > 0 ? '#ef4444' : 'var(--text-primary)' }}>
              {stats.pending_payment_count}
            </div>
            <div className="metric-label">Pagos Pendientes ❌</div>
            <div className="metric-desc">Falta abonar al admin</div>
          </div>

          <div className="metric-card" style={{ background: 'rgba(245, 158, 11, 0.05)', borderColor: 'rgba(245, 158, 11, 0.2)' }}>
            <div className="metric-value" >
              ⭐ {user.points || 0}
            </div>
            <div className="metric-label">Puntos Acumulados</div>
            <div className="metric-desc">Beneficios y minijuegos</div>
          </div>

          <div className="metric-card">
            <div className="metric-value" style={{ color: 'var(--gold-light)' }}>
              ${stats.total_spent.toLocaleString('es-AR')}
            </div>
            <div className="metric-label">Gasto Total Estimado 💵</div>
            <div className="metric-desc">Share de canchas jugadas</div>
          </div>
        </div>
      </div>

      {/* Favorite Fields Box */}
      {stats.favorite_fields && stats.favorite_fields.length > 0 && (
        <div className="card" style={{ padding: '16px 20px', marginBottom: '24px' }}>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>🏟️ Canchas Más Visitadas</h4>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {stats.favorite_fields.map((field, idx) => (
              <span
                key={idx}
                style={{
                  fontSize: '0.75rem',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border)',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  color: 'var(--text-primary)',
                  fontWeight: '600'
                }}
              >
                🏅 {field}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Matches History Section */}
      <div className="profile-predictions-section">
        <h3 className="profile-predictions-header">
          <span>⚽</span> Historial de Partidos ({matches.length})
        </h3>

        {matches.length === 0 ? (
          <div className="card empty-state" style={{ border: 'none', background: 'transparent' }}>
            <span className="empty-icon">⚽</span>
            <p>Este usuario no tiene partidos registrados en sus grupos.</p>
          </div>
        ) : (
          <div className="profile-predictions-list">
            {matches.map((m) => {
              const matchDate = new Date(m.match_date);

              return (
                <div key={m.id} className="profile-prediction-item" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 16, marginBottom: 12 }}>
                  <div className="profile-pred-match" style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: 10, marginBottom: 10 }}>
                    <div className="profile-pred-teams" style={{ fontSize: '1rem', fontWeight: '700' }}>
                      {m.title}
                    </div>
                    <div className="profile-pred-date" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {matchDate.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })}
                      {' · '}
                      {matchDate.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  <div className="profile-pred-content" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        🏟️ <strong>Cancha:</strong> {m.field_name}
                      </span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        👥 <strong>Grupo:</strong> {m.group_name}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)' }}>Tu parte</span>
                        <span style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--gold-light)' }}>
                          ${m.cost_per_person.toLocaleString('es-AR')}
                        </span>
                      </div>

                      <div>
                        {m.is_past ? (
                          m.paid ? (
                            <span className="profile-pred-badge exact" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-light)', border: '1px solid rgba(16,185,129,0.25)' }}>
                              ✅ Pagado
                            </span>
                          ) : (
                            <span className="profile-pred-badge miss" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.25)' }}>
                              ❌ Impago
                            </span>
                          )
                        ) : (
                          <span className="profile-pred-badge pending" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.25)' }}>
                            ⏳ Próximo
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Load more button */}
        {hasMore && (
          <button
            className="btn btn-primary"
            onClick={handleLoadMore}
            disabled={loadingMore}
            style={{ marginTop: '20px', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
          >
            {loadingMore ? (
              <>
                <div className="match-detail-spinner" style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.2)', borderTopColor: '#fff', margin: 0 }} />
                Cargando más...
              </>
            ) : (
              'Cargar más partidos'
            )}
          </button>
        )}
      </div>
    </>
  );
}
