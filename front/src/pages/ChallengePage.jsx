import { useEffect, useState } from 'react';
import { getGroupScores } from '../api';

const retos = [
  'Cantar una canción del Mundial en público',
  'Hacer 20 flexiones en 1 minuto',
  'Contar un chiste malo',
  'Imitar al árbitro en un partido',
  'Hacer un TikTok celebrando un gol imaginario',
  'Hacer 30 sentadillas',
  'Bailar 1 min sin parar la canción del Mundial',
];

export default function ChallengePage() {
  const [scores, setScores] = useState([]);
  const [challenge, setChallenge] = useState('');
  const [target, setTarget] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const selectedGroupId = localStorage.getItem('groupId');

  const load = async () => {
    if (!selectedGroupId) {
      setError('Seleccioná o unite a un grupo primero');
      return;
    }
    setLoading(true); setError('');
    try {
      const res = await getGroupScores(selectedGroupId);
      setScores(res.data.scores || []);
    } catch (err) {
      setError('No se pudo cargar puntajes del grupo');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const spin = () => {
    if (scores.length === 0) {
      setError('No hay usuarios o no hay registro de grupo');
      return;
    }
    setError('');
    const minScore = Math.min(...scores.map((s) => s.exact_hits + s.winner_hits));
    const losers = scores.filter((s) => s.exact_hits + s.winner_hits === minScore);
    const loser = losers[Math.floor(Math.random() * losers.length)];

    const selectedChallenge = retos[Math.floor(Math.random() * retos.length)];

    setTarget(loser);
    setChallenge(selectedChallenge);
  };

  return (
    <>
      <h2 className="page-title"><span className="icon">🎯</span> Ruleta de Retos</h2>

      <div className="selected-group-badge">
        🏆 Grupo: {selectedGroupId || 'Sin grupo'}
      </div>

      {error && <div className="error">{error}</div>}
      {loading && <div style={{ color: '#94a3b8', marginBottom: 16 }}>Cargando puntajes...</div>}

      <div className="card" style={{ marginBottom: 24 }}>
        <button className="challenge-spin-btn" onClick={spin}>
          🎰 ¡Girar la ruleta!
        </button>

        {target && (
          <div className="challenge-result">
            <h3>😈 Retador seleccionado</h3>
            <p><strong>Usuario:</strong> {target.username}</p>
            <p><strong>Aciertos exactos:</strong> {target.exact_hits}</p>
            <p><strong>Aciertos ganador:</strong> {target.winner_hits}</p>
            <div className="challenge-task">🔥 {challenge}</div>
          </div>
        )}
      </div>

      <div className="card scores-section">
        <h3>📊 Puntajes del grupo</h3>
        <table className="scores-table">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Exactos</th>
              <th>Ganador</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {scores.map((s) => (
              <tr key={s.user_id}>
                <td style={{ fontWeight: 600 }}>{s.username}</td>
                <td>{s.exact_hits}</td>
                <td>{s.winner_hits}</td>
                <td style={{ fontWeight: 700, color: '#10b981' }}>{s.exact_hits + s.winner_hits}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {scores.length === 0 && !loading && (
          <div className="empty-state">
            <span className="empty-icon">📊</span>
            <p>No hay puntajes aún en este grupo.</p>
          </div>
        )}
      </div>
    </>
  );
}
