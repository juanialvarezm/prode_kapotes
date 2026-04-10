import { useEffect, useState } from 'react';
import {
  getMyPendingRequests,
  acceptJoinRequest,
  rejectJoinRequest,
  getAvatarUrl,
} from '../api';

export default function RequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const load = async () => {
    setError('');
    try {
      const res = await getMyPendingRequests();
      setRequests(res.data.requests || []);
    } catch (err) {
      setError('No se pudieron cargar las solicitudes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAccept = async (groupId, requestId, username) => {
    setActionLoading(true);
    setError(''); setSuccess('');
    try {
      await acceptJoinRequest(groupId, requestId);
      setSuccess(`✅ ${username} fue aceptado en el grupo`);
      load(); // Refresh list
    } catch (err) {
      setError(err?.response?.data?.error || 'Error aceptando solicitud');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (groupId, requestId, username) => {
    setActionLoading(true);
    setError(''); setSuccess('');
    try {
      await rejectJoinRequest(groupId, requestId);
      setSuccess(`${username} fue rechazado`);
      load(); // Refresh list
    } catch (err) {
      setError(err?.response?.data?.error || 'Error rechazando solicitud');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <>
      <h2 className="page-title"><span className="icon">📨</span> Solicitudes de Unión</h2>
      <p className="page-subtitle">Acá aparecen las solicitudes de personas que quieren unirse a tus grupos.</p>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      {loading ? (
        <div className="card empty-state">
          <span className="empty-icon">⏳</span>
          <p>Cargando solicitudes...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="card empty-state">
          <span className="empty-icon">📭</span>
          <p>No tenés solicitudes pendientes.</p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 8 }}>
            Cuando alguien quiera unirse a uno de tus grupos, va a aparecer acá.
          </p>
        </div>
      ) : (
        <div className="requests-page-list">
          {requests.map((r) => (
            <div key={r.id} className="request-card">
              <div className="request-card-header">
                <div className="request-card-group-badge">
                  🏆 {r.group_name}
                </div>
                <span className="request-time">
                  {r.created_at ? new Date(r.created_at).toLocaleDateString('es-AR', {
                    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                  }) : ''}
                </span>
              </div>
              <div className="request-card-body">
                <div className="member-info">
                  <div className="member-avatar request">
                    {r.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className="member-name">{r.username}</span>
                    <span className="member-email">{r.email}</span>
                  </div>
                </div>
                <div className="request-actions">
                  <button
                    className="btn-accept"
                    onClick={() => handleAccept(r.group_id, r.id, r.username)}
                    disabled={actionLoading}
                  >
                    ✓ Aceptar
                  </button>
                  <button
                    className="btn-reject"
                    onClick={() => handleReject(r.group_id, r.id, r.username)}
                    disabled={actionLoading}
                  >
                    ✕ Rechazar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
