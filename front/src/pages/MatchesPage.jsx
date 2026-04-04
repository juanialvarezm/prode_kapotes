import { useEffect, useState } from 'react';
import { getMatches, submitPrediction } from '../api';

export default function MatchesPage() {
  const [matches, setMatches] = useState([]);
  const [preds, setPreds] = useState({});
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const selectedGroupId = localStorage.getItem('groupId');

  const load = async () => {
    setError('');
    try {
      const res = await getMatches();
      setMatches(res.data);
    } catch (err) {
      setError('No se pudieron cargar los partidos.');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleChange = (matchId, field, value) => {
    setPreds((old) => ({ ...old, [matchId]: { ...old[matchId], [field]: value } }));
  };

  const handleSubmit = async (match) => {
    setError('');
    setMessage('');
    if (!selectedGroupId) {
      setError('Primero seleccioná un grupo en la pantalla de grupos');
      return;
    }

    const p = preds[match.id] || {};
    if (p.predicted_home == null || p.predicted_away == null) {
      setError('Ingresá ambos resultados para enviar.');
      return;
    }

    try {
      await submitPrediction({
        match_id: match.id,
        group_id: Number(selectedGroupId),
        predicted_home: Number(p.predicted_home),
        predicted_away: Number(p.predicted_away),
      });
      setMessage('✅ Predicción enviada con éxito.');
    } catch (err) {
      setError(err?.response?.data?.error || 'No se pudo enviar la predicción.');
    }
  };

  return (
    <>
      <h2 className="page-title"><span className="icon">⚽</span> Partidos</h2>

      <div className="selected-group-badge">
        🏆 Grupo: {selectedGroupId ?? 'Ninguno'}
      </div>

      {error && <div className="error">{error}</div>}
      {message && <div className="success">{message}</div>}

      <div className="card">
        <table className="matches-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Local</th>
              <th>Visitante</th>
              <th>Pronóstico</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {matches.map((m) => (
              <tr key={m.id}>
                <td>{new Date(m.match_time).toLocaleString()}</td>
                <td style={{ fontWeight: 600 }}>{m.home_team}</td>
                <td style={{ fontWeight: 600 }}>{m.away_team}</td>
                <td>
                  <input
                    className="score-input"
                    value={preds[m.id]?.predicted_home ?? ''}
                    onChange={(e) => handleChange(m.id, 'predicted_home', e.target.value)}
                    placeholder="L"
                  />
                  <span className="score-separator">–</span>
                  <input
                    className="score-input"
                    value={preds[m.id]?.predicted_away ?? ''}
                    onChange={(e) => handleChange(m.id, 'predicted_away', e.target.value)}
                    placeholder="V"
                  />
                </td>
                <td>
                  <button className="btn-send" onClick={() => handleSubmit(m)}>Enviar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {matches.length === 0 && (
          <div className="empty-state">
            <span className="empty-icon">📅</span>
            <p>No hay partidos disponibles todavía.</p>
          </div>
        )}
      </div>
    </>
  );
}
