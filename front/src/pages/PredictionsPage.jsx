import { useEffect, useState } from 'react';
import { getGroupPredictions } from '../api';

const STATUS_LABELS = {
  SCHEDULED: { label: 'Programado', emoji: '📅' },
  TIMED: { label: 'Programado', emoji: '📅' },
  IN_PLAY: { label: 'En juego', emoji: '🔴' },
  FINISHED: { label: 'Finalizado', emoji: '✅' },
  POSTPONED: { label: 'Pospuesto', emoji: '⏸️' },
};

export default function PredictionsPage() {
  const groupId = localStorage.getItem('groupId');
  const [predictions, setPredictions] = useState([]);
  const [members, setMembers] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async (userId = null) => {
    if (!groupId) return;
    setLoading(true);
    setError('');
    try {
      const res = await getGroupPredictions(groupId, userId || null);
      setPredictions(res.data.predictions || []);
      setMembers(res.data.members || []);
      setGroupName(res.data.group || '');
    } catch (err) {
      setError(err?.response?.data?.error || 'Error cargando predicciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [groupId]);

  const handleUserFilter = (userId) => {
    setSelectedUser(userId);
    load(userId || null);
  };

  // Filter members by search query
  const filteredMembers = members.filter((m) =>
    m.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group predictions by match
  const matchMap = {};
  predictions.forEach((p) => {
    if (!matchMap[p.match_id]) {
      matchMap[p.match_id] = {
        match_id: p.match_id,
        home_team: p.home_team,
        away_team: p.away_team,
        match_time: p.match_time,
        match_status: p.match_status,
        home_score: p.home_score,
        away_score: p.away_score,
        predictions: [],
      };
    }
    matchMap[p.match_id].predictions.push(p);
  });

  const matchGroups = Object.values(matchMap);

  if (!groupId) {
    return (
      <div className="card empty-state">
        <span className="empty-icon">📋</span>
        <p>Seleccioná un grupo primero desde la sección Grupos.</p>
      </div>
    );
  }

  return (
    <>
      <h2 className="page-title"><span className="icon">🔮</span> Predicciones</h2>

      {/* Group badge */}
      <div className="predictions-header">
        <div className="selected-group-badge">🏆 Grupo: {groupName || groupId}</div>
      </div>

      {/* Search & Filter Section */}
      <div className="predictions-filter-section">
        <div className="predictions-search-card">
          <div className="predictions-search-header">
            <span className="predictions-search-icon">🔍</span>
            <h3>Buscar usuario</h3>
          </div>
          <input
            type="text"
            className="predictions-search-input"
            placeholder="Escribí un nombre de usuario..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            id="predictions-search-input"
          />

          {/* User chips */}
          <div className="predictions-user-chips">
            <button
              className={`user-chip ${selectedUser === '' ? 'active' : ''}`}
              onClick={() => { handleUserFilter(''); setSearchQuery(''); }}
              id="chip-all-users"
            >
              👥 Todos
            </button>
            {filteredMembers.map((m) => (
              <button
                key={m.id}
                className={`user-chip ${String(selectedUser) === String(m.id) ? 'active' : ''}`}
                onClick={() => handleUserFilter(m.id)}
                id={`chip-user-${m.id}`}
              >
                <span className="user-chip-avatar">{m.username.charAt(0).toUpperCase()}</span>
                {m.username}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      {loading ? (
        <div className="card empty-state">
          <span className="empty-icon">⏳</span>
          <p>Cargando predicciones...</p>
        </div>
      ) : predictions.length === 0 ? (
        <div className="card empty-state">
          <span className="empty-icon">🔮</span>
          <p>
            {selectedUser
              ? 'Este usuario no hizo predicciones todavía.'
              : 'No hay predicciones en este grupo todavía.'}
          </p>
        </div>
      ) : (
        <>
          {/* Stats summary */}
          <div className="predictions-stats-bar">
            <div className="predictions-stat">
              <span className="predictions-stat-value">{predictions.length}</span>
              <span className="predictions-stat-label">Predicciones</span>
            </div>
            <div className="predictions-stat">
              <span className="predictions-stat-value">{predictions.filter(p => p.is_exact).length}</span>
              <span className="predictions-stat-label">Exactas 🎯</span>
            </div>
            <div className="predictions-stat">
              <span className="predictions-stat-value">{predictions.filter(p => p.is_winner).length}</span>
              <span className="predictions-stat-label">Ganador ✅</span>
            </div>
          </div>

          {/* Predictions grouped by match */}
          <div className="predictions-matches-list">
            {matchGroups.map((mg) => {
              const statusInfo = STATUS_LABELS[mg.match_status] || { label: mg.match_status, emoji: '❓' };
              const matchDate = new Date(mg.match_time);
              const isFinished = mg.match_status === 'FINISHED';
              const isLive = mg.match_status === 'IN_PLAY';

              return (
                <div key={mg.match_id} className={`predictions-match-group ${isLive ? 'live' : ''}`}>
                  {/* Match header */}
                  <div className="predictions-match-header">
                    <div className="predictions-match-info">
                      <span className="predictions-match-teams">
                        {mg.home_team} <span className="predictions-vs">vs</span> {mg.away_team}
                      </span>
                      {(isFinished || isLive) && (
                        <span className="predictions-match-result">
                          {mg.home_score ?? '-'} : {mg.away_score ?? '-'}
                        </span>
                      )}
                    </div>
                    <div className="predictions-match-meta">
                      <span className="predictions-match-date">
                        {matchDate.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
                        {' · '}
                        {matchDate.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className={`predictions-match-status ${isLive ? 'live' : ''}`}>
                        {statusInfo.emoji} {statusInfo.label}
                      </span>
                    </div>
                  </div>

                  {/* Predictions for this match */}
                  <div className="predictions-cards-grid">
                    {mg.predictions.map((p) => (
                      <div
                        key={p.id}
                        className={`prediction-card ${p.is_exact ? 'exact' : p.is_winner ? 'winner' : ''}`}
                        id={`prediction-${p.id}`}
                      >
                        <div className="prediction-card-user">
                          <div className="prediction-user-avatar">
                            {p.username.charAt(0).toUpperCase()}
                          </div>
                          <span className="prediction-username">{p.username}</span>
                        </div>
                        <div className="prediction-card-score">
                          <span className="prediction-score-value">{p.predicted_home}</span>
                          <span className="prediction-score-sep">:</span>
                          <span className="prediction-score-value">{p.predicted_away}</span>
                        </div>
                        {isFinished && (
                          <div className="prediction-card-badge">
                            {p.is_exact ? (
                              <span className="badge-exact">🎯 Exacta</span>
                            ) : p.is_winner ? (
                              <span className="badge-winner">✅ Ganador</span>
                            ) : (
                              <span className="badge-miss">❌ Falló</span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}
