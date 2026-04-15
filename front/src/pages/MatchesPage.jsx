import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMatches, fetchApiMatches, getGroupById } from '../api';

const STATUS_LABELS = {
  SCHEDULED: { label: 'Programado', emoji: '📅' },
  TIMED: { label: 'Programado', emoji: '📅' },
  IN_PLAY: { label: 'En juego', emoji: '🔴' },
  FINISHED: { label: 'Finalizado', emoji: '✅' },
  POSTPONED: { label: 'Pospuesto', emoji: '⏸️' },
};

export default function MatchesPage() {
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [prizePool, setPrizePool] = useState(0);
  const [groupName, setGroupName] = useState('');
  const navigate = useNavigate();
  const selectedGroupId = localStorage.getItem('groupId');

  const load = async (pageNum = 1, append = false) => {
    setError('');
    if (append) setLoadingMore(true);
    try {
      const res = await getMatches(pageNum);
      const data = res.data;
      if (append) {
        setMatches((prev) => [...prev, ...data.matches]);
      } else {
        setMatches(data.matches);
      }
      setPage(data.page);
      setHasMore(data.has_more);
    } catch (err) {
      setError('No se pudieron cargar los partidos.');
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    load(1);
    // Load group info for prize pool
    if (selectedGroupId) {
      getGroupById(selectedGroupId)
        .then((res) => {
          setPrizePool(res.data.prize_pool || 0);
          setGroupName(res.data.name || '');
        })
        .catch(() => { });
    }
  }, []);

  const handleLoadMore = () => {
    load(page + 1, true);
  };

  const handleSync = async () => {
    setSyncing(true);
    setSyncMsg('');
    setError('');
    try {
      const res = await fetchApiMatches();
      const d = res.data;
      setSyncMsg(`✅ Sincronizado: ${d.inserted} nuevos, ${d.updated} actualizados (${d.total} total)`);
      setPage(1);
      await load(1);
    } catch (err) {
      console.log('STATUS:', err?.response?.status);
      console.log('DATA:', JSON.stringify(err?.response?.data));
      console.log('MESSAGE:', err?.message);

      setError(err?.response?.data?.error || err?.response?.data?.message || `Error ${err?.response?.status}: No se pudo sincronizar.`);
    } finally {
      setSyncing(false);
    }
  };

  const goToMatch = (matchId) => {
    navigate(`/matches/${matchId}`);
  };

  // Group matches by status for nicer display
  const scheduled = matches.filter((m) => ['SCHEDULED', 'TIMED'].includes(m.status));
  const live = matches.filter((m) => m.status === 'IN_PLAY');
  const finished = matches.filter((m) => m.status === 'FINISHED');
  const other = matches.filter((m) => !['SCHEDULED', 'TIMED', 'IN_PLAY', 'FINISHED'].includes(m.status));

  const renderMatchCard = (m) => {
    const statusInfo = STATUS_LABELS[m.status] || { label: m.status, emoji: '❓' };
    const isLive = m.status === 'IN_PLAY';
    const isFinished = m.status === 'FINISHED';
    const matchDate = new Date(m.match_time);

    return (
      <div
        key={m.id}
        className={`match-card ${isLive ? 'match-card-live' : ''} ${isFinished ? 'match-card-finished' : ''}`}
        onClick={() => goToMatch(m.id)}
        id={`match-${m.id}`}
      >
        <div className="match-card-header">
          <span className="match-card-date">
            {matchDate.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
            {' · '}
            {matchDate.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
          </span>
          <span className={`match-card-status ${isLive ? 'live' : ''}`}>
            {statusInfo.emoji} {statusInfo.label}
          </span>
        </div>

        <div className="match-card-teams">
          <div className="match-card-team">
            <span className="match-card-team-name">{m.home_team}</span>
          </div>

          <div className="match-card-score">
            {isFinished || isLive ? (
              <span className="match-card-result">
                {m.home_score ?? '-'} <span className="score-sep">:</span> {m.away_score ?? '-'}
              </span>
            ) : (
              <span className="match-card-vs">VS</span>
            )}
          </div>

          <div className="match-card-team away">
            <span className="match-card-team-name">{m.away_team}</span>
          </div>
        </div>

        <div className="match-card-footer">
          <span className="match-card-cta">Ver detalles →</span>
        </div>
      </div>
    );
  };

  return (
    <>
      <h2 className="page-title"><span className="icon">⚽</span> Partidos</h2>

      {/* Prize pool banner */}
      {prizePool > 0 && (
        <div className="prize-banner">
          <div className="prize-banner-icon">💰</div>
          <div className="prize-banner-content">
            <span className="prize-label">Pozo acumulado</span>
            <span className="prize-amount">${prizePool.toLocaleString('es-AR')}</span>
          </div>
          <div className="prize-banner-sparkle">🏆</div>
        </div>
      )}

      {/* Actions bar */}
      <div className="matches-actions-bar">
        <div className="selected-group-badge">
          🏆 Grupo: {groupName ? selectedGroupId : 'Ninguno'}
        </div>
        <button
          className="btn-sync"
          onClick={handleSync}
          disabled={syncing}
          id="btn-sync-matches"
        >
          {syncing ? '⏳ Sincronizando…' : '🔄 Sincronizar partidos'}
        </button>
      </div>

      {error && <div className="error">{error}</div>}
      {syncMsg && <div className="success">{syncMsg}</div>}

      {/* Live matches */}
      {live.length > 0 && (
        <div className="match-section">
          <h3 className="match-section-title live-pulse">🔴 En juego</h3>
          <div className="match-cards-grid">
            {live.map(renderMatchCard)}
          </div>
        </div>
      )}

      {/* Scheduled matches */}
      {scheduled.length > 0 && (
        <div className="match-section">
          <h3 className="match-section-title">📅 Próximos</h3>
          <div className="match-cards-grid">
            {scheduled.map(renderMatchCard)}
          </div>
        </div>
      )}

      {/* Finished matches */}
      {finished.length > 0 && (
        <div className="match-section">
          <h3 className="match-section-title">✅ Finalizados</h3>
          <div className="match-cards-grid">
            {finished.map(renderMatchCard)}
          </div>
        </div>
      )}

      {/* Other */}
      {other.length > 0 && (
        <div className="match-section">
          <h3 className="match-section-title">📋 Otros</h3>
          <div className="match-cards-grid">
            {other.map(renderMatchCard)}
          </div>
        </div>
      )}
      {/* Load more */}
      {hasMore && (
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <button
            className="btn-primary"
            style={{ width: 'auto', padding: '10px 32px' }}
            onClick={handleLoadMore}
            disabled={loadingMore}
            id="btn-load-more-matches"
          >
            {loadingMore ? '⏳ Cargando…' : '📥 Cargar más partidos'}
          </button>
        </div>
      )}

      {matches.length === 0 && (
        <div className="card empty-state">
          <span className="empty-icon">📅</span>
          <p>No hay partidos disponibles todavía.</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 8 }}>
            Usá el botón "Sincronizar" para traer los partidos del Mundial.
          </p>
        </div>
      )}
    </>
  );
}
