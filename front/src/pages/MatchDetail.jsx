import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMatches, submitPrediction } from '../api';

// Country flag emoji helper (ISO 3166-1 alpha-2 → flag)
const FLAG_MAP = {
  ARG: '🇦🇷', BRA: '🇧🇷', GER: '🇩🇪', FRA: '🇫🇷', ESP: '🇪🇸', ENG: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  ITA: '🇮🇹', POR: '🇵🇹', MEX: '🇲🇽', USA: '🇺🇸', URU: '🇺🇾', COL: '🇨🇴',
  JPN: '🇯🇵', KOR: '🇰🇷', AUS: '🇦🇺', CAN: '🇨🇦', NED: '🇳🇱', BEL: '🇧🇪',
  CRO: '🇭🇷', MAR: '🇲🇦', SEN: '🇸🇳', ECU: '🇪🇨', CRC: '🇨🇷', CHI: '🇨🇱',
  PER: '🇵🇪', PAR: '🇵🇾', BOL: '🇧🇴', VEN: '🇻🇪', HON: '🇭🇳', PAN: '🇵🇦',
  QAT: '🇶🇦', IRN: '🇮🇷', KSA: '🇸🇦', TUN: '🇹🇳', GHA: '🇬🇭', CMR: '🇨🇲',
  NGA: '🇳🇬', SUI: '🇨🇭', DEN: '🇩🇰', WAL: '🏴󠁧󠁢󠁷󠁬󠁳󠁿', POL: '🇵🇱', SRB: '🇷🇸',
  SCO: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', CZE: '🇨🇿', SWE: '🇸🇪', NOR: '🇳🇴', JAM: '🇯🇲',
  Argentina: '🇦🇷', Brazil: '🇧🇷', Germany: '🇩🇪', France: '🇫🇷', Spain: '🇪🇸',
  England: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', Italy: '🇮🇹', Portugal: '🇵🇹', Mexico: '🇲🇽',
  'United States': '🇺🇸', Uruguay: '🇺🇾', Colombia: '🇨🇴',
  Japan: '🇯🇵', 'South Korea': '🇰🇷', Australia: '🇦🇺', Canada: '🇨🇦',
  Netherlands: '🇳🇱', Belgium: '🇧🇪', Croatia: '🇭🇷', Morocco: '🇲🇦',
  Senegal: '🇸🇳', Ecuador: '🇪🇨', Chile: '🇨🇱', Peru: '🇵🇪',
};

function getFlag(team) {
  return FLAG_MAP[team] || '🏳️';
}

const STATUS_LABELS = {
  SCHEDULED: { label: 'Programado', className: 'status-scheduled' },
  TIMED: { label: 'Programado', className: 'status-scheduled' },
  IN_PLAY: { label: 'En juego', className: 'status-live' },
  FINISHED: { label: 'Finalizado', className: 'status-finished' },
  POSTPONED: { label: 'Pospuesto', className: 'status-postponed' },
};

export default function MatchDetail() {
  const { matchId } = useParams();
  const navigate = useNavigate();

  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [predictedHome, setPredictedHome] = useState('');
  const [predictedAway, setPredictedAway] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const selectedGroupId = localStorage.getItem('groupId');

  useEffect(() => {
    (async () => {
      try {
        const res = await getMatches(1, 100);
        const found = (res.data.matches || []).find((m) => String(m.id) === String(matchId));
        if (found) {
          setMatch(found);
        } else {
          setError('Partido no encontrado.');
        }
      } catch {
        setError('Error al cargar el partido.');
      } finally {
        setLoading(false);
      }
    })();
  }, [matchId]);

  const canPredict = match &&
    ['SCHEDULED', 'TIMED', 'POSTPONED'].includes(match.status);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!selectedGroupId) {
      setError('Primero seleccioná un grupo en la pantalla de grupos.');
      return;
    }

    if (predictedHome === '' || predictedAway === '') {
      setError('Ingresá el resultado para ambos equipos.');
      return;
    }

    setSubmitting(true);
    try {
      await submitPrediction({
        match_id: match.id,
        group_id: Number(selectedGroupId),
        predicted_home: Number(predictedHome),
        predicted_away: Number(predictedAway),
      });
      setMessage('✅ ¡Predicción enviada con éxito!');
    } catch (err) {
      setError(err?.response?.data?.error || 'No se pudo enviar la predicción.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="match-detail-loading">
        <div className="match-detail-spinner" />
        <p>Cargando partido…</p>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="match-detail-error-page">
        <span className="empty-icon">😕</span>
        <p>{error || 'Partido no encontrado.'}</p>
        <button className="btn-back" onClick={() => navigate('/matches')}>
          ← Volver a partidos
        </button>
      </div>
    );
  }

  const statusInfo = STATUS_LABELS[match.status] || { label: match.status, className: '' };
  const matchDate = new Date(match.match_time);

  return (
    <div className="match-detail-page">
      {/* Back button */}
      <button className="btn-back" onClick={() => navigate('/matches')}>
        ← Volver a partidos
      </button>

      {/* Match card hero */}
      <div className="match-detail-card">
        {/* Status badge */}
        <div className={`match-status-badge ${statusInfo.className}`}>
          {statusInfo.label}
        </div>

        {/* Teams display */}
        <div className="match-teams-hero">
          <div className="team-block">
            <span className="team-flag">{getFlag(match.home_team)}</span>
            <span className="team-name-hero">{match.home_team}</span>
            <span className="team-role">Local</span>
          </div>

          <div className="match-score-hero">
            {match.status === 'FINISHED' || match.status === 'IN_PLAY' ? (
              <>
                <span className="score-digit">{match.home_score ?? '-'}</span>
                <span className="score-colon">:</span>
                <span className="score-digit">{match.away_score ?? '-'}</span>
              </>
            ) : (
              <span className="match-vs">VS</span>
            )}
          </div>

          <div className="team-block">
            <span className="team-flag">{getFlag(match.away_team)}</span>
            <span className="team-name-hero">{match.away_team}</span>
            <span className="team-role">Visitante</span>
          </div>
        </div>

        {/* Match info row */}
        <div className="match-info-row">
          <div className="match-info-item">
            <span className="info-icon">📅</span>
            <span className="info-text">
              {matchDate.toLocaleDateString('es-AR', {
                weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                timeZone: 'America/Argentina/Buenos_Aires',
              })}
            </span>
          </div>
          <div className="match-info-item">
            <span className="info-icon">🕐</span>
            <span className="info-text">
              {matchDate.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Argentina/Buenos_Aires' })}
            </span>
          </div>
        </div>
      </div>

      {/* Prediction form */}
      <div className="prediction-section">
        <h3 className="prediction-title">
          <span>🎯</span> Tu predicción
        </h3>

        {!selectedGroupId && (
          <div className="error">
            Seleccioná un grupo primero desde la pantalla de grupos para poder hacer predicciones.
          </div>
        )}

        {selectedGroupId && (
          <div className="selected-group-badge" style={{ marginBottom: 16 }}>
            🏆 Grupo seleccionado: {selectedGroupId}
          </div>
        )}

        {error && <div className="error">{error}</div>}
        {message && <div className="success">{message}</div>}

        {canPredict ? (
          <form onSubmit={handleSubmit} className="prediction-form">
            <div className="prediction-inputs">
              <div className="prediction-team">
                <span className="prediction-flag">{getFlag(match.home_team)}</span>
                <span className="prediction-team-name">{match.home_team}</span>
                <input
                  id="score-home"
                  type="number"
                  min="0"
                  max="20"
                  className="prediction-score-input"
                  value={predictedHome}
                  onChange={(e) => setPredictedHome(e.target.value)}
                  placeholder="0"
                />
              </div>

              <div className="prediction-divider">
                <span>—</span>
              </div>

              <div className="prediction-team">
                <span className="prediction-flag">{getFlag(match.away_team)}</span>
                <span className="prediction-team-name">{match.away_team}</span>
                <input
                  id="score-away"
                  type="number"
                  min="0"
                  max="20"
                  className="prediction-score-input"
                  value={predictedAway}
                  onChange={(e) => setPredictedAway(e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-predict"
              disabled={submitting || !selectedGroupId}
            >
              {submitting ? '⏳ Enviando…' : '🚀 Enviar predicción'}
            </button>
          </form>
        ) : (
          <div className="prediction-closed">
            <span className="prediction-closed-icon">🔒</span>
            <p>Las predicciones están cerradas para este partido.</p>
            {match.status === 'FINISHED' && match.home_score != null && (
              <div className="final-result">
                <span>Resultado final:</span>
                <strong>{match.home_score} – {match.away_score}</strong>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
