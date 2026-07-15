import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUserProfile } from '../api';

export default function UserProfilePage() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [predictions, setPredictions] = useState([]);
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
        setPredictions((prev) => [...prev, ...data.predictions]);
      } else {
        setPredictions(data.predictions);
      }
      
      setPage(pageNum);
    } catch (err) {
      if (err?.response?.status === 401) return; // Handled by global interceptor
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

  // Radial progress calculations (circumference for r=50 is 314.16)
  const radius = 50;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (stats.effectiveness / 100) * circumference;

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
        {/* Effectiveness Radial Progress */}
        <div className="effectiveness-card">
          <span className="effectiveness-title">Efectividad</span>
          <div className="radial-progress">
            <svg width="140" height="140">
              <circle
                className="circle-bg"
                cx="70"
                cy="70"
                r={radius}
                strokeWidth={strokeWidth}
              />
              <circle
                className="circle-val"
                cx="70"
                cy="70"
                r={radius}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={offset}
              />
            </svg>
            <div className="radial-progress-text">
              <span className="radial-progress-percent">{stats.effectiveness}%</span>
              <span className="radial-progress-label">Aciertos</span>
            </div>
          </div>
          <p style={{ marginTop: '16px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Calculado sobre {stats.played_count} partidos jugados y predichos.
          </p>
        </div>

        {/* Stats Metrics Cards */}
        <div className="metrics-grid">
          <div className="metric-card exact-hits-card">
            <div className="metric-value">{stats.exact_hits}</div>
            <div className="metric-label">Exactas 🎯</div>
            <div className="metric-desc">Marcador exacto acertado</div>
          </div>

          <div className="metric-card winner-hits-card">
            <div className="metric-value">{stats.winner_hits}</div>
            <div className="metric-label">Ganador o Empate ✅</div>
            <div className="metric-desc">Resultado acertado</div>
          </div>

          <div className="metric-card">
            <div className="metric-value">{stats.incorrect}</div>
            <div className="metric-label">Falladas ❌</div>
            <div className="metric-desc">Predicciones incorrectas</div>
          </div>

          <div className="metric-card">
            <div className="metric-value">{stats.total_predictions}</div>
            <div className="metric-label">Predicciones Totales 🔮</div>
            <div className="metric-desc">Incluye partidos pendientes</div>
          </div>
        </div>
      </div>

      {/* Predictions list */}
      <div className="profile-predictions-section">
        <h3 className="profile-predictions-header">
          <span>🔮</span> Historial de Predicciones ({predictions.length} de {stats.total_predictions})
        </h3>

        {predictions.length === 0 ? (
          <div className="card empty-state" style={{ border: 'none', background: 'transparent' }}>
            <span className="empty-icon">📂</span>
            <p>Este usuario no tiene predicciones registradas.</p>
          </div>
        ) : (
          <div className="profile-predictions-list">
            {predictions.map((p) => {
              const isFinished = p.match_status === 'FINISHED';
              const matchDate = new Date(p.match_time);

              return (
                <div key={p.id} className="profile-prediction-item">
                  <div className="profile-pred-match">
                    <div className="profile-pred-teams">
                      {p.home_team} vs {p.away_team}
                    </div>
                    <div className="profile-pred-date">
                      {matchDate.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
                      {' · '}
                      {matchDate.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  <div className="profile-pred-content">
                    <div className="profile-pred-scores">
                      <div className="profile-pred-score-row">
                        <span className="profile-pred-score-label">Predicción:</span>
                        <span className="profile-pred-score-val predicted">
                          {p.predicted_home} - {p.predicted_away}
                        </span>
                      </div>
                      <div className="profile-pred-score-row">
                        <span className="profile-pred-score-label">Real:</span>
                        <span className="profile-pred-score-val">
                          {isFinished ? `${p.home_score} - ${p.away_score}` : 'Pendiente'}
                        </span>
                      </div>
                    </div>

                    <div className="profile-pred-badge-container">
                      {!isFinished ? (
                        <span className="profile-pred-badge pending">⏳ Pendiente</span>
                      ) : p.is_exact ? (
                        <span className="profile-pred-badge exact">🎯 Exacta</span>
                      ) : p.is_winner ? (
                        <span className="profile-pred-badge winner">✅ Ganador</span>
                      ) : (
                        <span className="profile-pred-badge miss">❌ Falló</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Load more button (lazy loading of predictions) */}
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
              'Cargar más predicciones'
            )}
          </button>
        )}
      </div>
    </>
  );
}
