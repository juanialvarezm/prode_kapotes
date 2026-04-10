import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getMyGroups,
  getGroupById,
  leaveGroup,
  getJoinRequests,
  acceptJoinRequest,
  rejectJoinRequest,
  kickMember,
  updateGroupAvatar,
  getMe,
  getAvatarUrl,
} from '../api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function GroupsPage() {
  const [groups, setGroups] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selected, setSelected] = useState(null);
  const [requests, setRequests] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loadingAction, setLoadingAction] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    getMe().then(res => setCurrentUserId(res.data.id)).catch(() => {});
  }, []);

  const load = async () => {
    setError('');
    try {
      const res = await getMyGroups();
      const loadedGroups = res.data.groups || [];
      setGroups(loadedGroups);
      if (loadedGroups.length > 0 && !selected) {
        const savedId = localStorage.getItem('groupId');
        const defaultGroup = loadedGroups.find(g => String(g.id) === savedId) || loadedGroups[0];
        onSelectGroup(defaultGroup.id);
      }
    } catch (err) {
      setError('No se pudo cargar los grupos. Asegúrate de que el backend esté corriendo en http://localhost:5000');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onSelectGroup = async (id) => {
    setError(''); setSuccess('');
    localStorage.setItem('groupId', String(id));
    try {
      const res = await getGroupById(id);
      setSelected(res.data);
      // If owner, load pending requests
      if (res.data.is_owner) {
        loadRequests(id);
      } else {
        setRequests([]);
      }
    } catch {
      setError('No se encontró el grupo');
    }
  };

  const loadRequests = async (groupId) => {
    try {
      const res = await getJoinRequests(groupId);
      setRequests(res.data.requests || []);
    } catch {
      setRequests([]);
    }
  };

  const handleAccept = async (reqId) => {
    if (!selected) return;
    setLoadingAction(true);
    try {
      await acceptJoinRequest(selected.id, reqId);
      setSuccess('✅ Solicitud aceptada');
      onSelectGroup(selected.id);
    } catch (err) {
      setError(err?.response?.data?.error || 'Error aceptando solicitud');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleReject = async (reqId) => {
    if (!selected) return;
    setLoadingAction(true);
    try {
      await rejectJoinRequest(selected.id, reqId);
      setSuccess('Solicitud rechazada');
      onSelectGroup(selected.id);
    } catch (err) {
      setError(err?.response?.data?.error || 'Error rechazando solicitud');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleLeave = async () => {
    if (!selected) return;
    const confirmLeave = window.confirm(`¿Seguro que querés salir del grupo "${selected.name}"?`);
    if (!confirmLeave) return;

    setLoadingAction(true);
    try {
      await leaveGroup(selected.id);
      setSelected(null);
      setSuccess('Saliste del grupo');
      localStorage.removeItem('groupId');
      // Reload groups
      const res = await getMyGroups();
      const loadedGroups = res.data.groups || [];
      setGroups(loadedGroups);
      if (loadedGroups.length > 0) {
        onSelectGroup(loadedGroups[0].id);
      } else {
        navigate('/join-group');
        window.location.reload();
      }
    } catch (err) {
      setError(err?.response?.data?.error || 'No se pudo salir del grupo');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleKick = async (userId, username) => {
    if (!selected) return;
    const confirmKick = window.confirm(`¿Seguro que querés eliminar a "${username}" del grupo?`);
    if (!confirmKick) return;

    setLoadingAction(true);
    try {
      await kickMember(selected.id, userId);
      setSuccess(`${username} fue eliminado del grupo`);
      onSelectGroup(selected.id);
    } catch (err) {
      setError(err?.response?.data?.error || 'Error eliminando miembro');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !selected) return;

    setLoadingAction(true);
    try {
      await updateGroupAvatar(selected.id, file);
      setSuccess('✅ Avatar actualizado');
      onSelectGroup(selected.id);
      // Also refresh the group list to show updated avatar
      const res = await getMyGroups();
      setGroups(res.data.groups || []);
    } catch (err) {
      setError(err?.response?.data?.error || 'Error subiendo avatar');
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h2 className="page-title" style={{ marginBottom: 0 }}><span className="icon">🏆</span> Mis Grupos</h2>
        <button className="btn-primary" style={{ width: 'auto', padding: '8px 20px' }} onClick={() => navigate('/join-group')}>
          ➕ Nuevo grupo
        </button>
      </div>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      {groups.length > 0 ? (
        <div className="card">
          <ul className="group-list">
            {groups.map((g) => (
              <li
                key={g.id}
                className={selected?.id === g.id ? 'active' : ''}
                onClick={() => onSelectGroup(g.id)}
              >
                <div className="group-list-item-content">
                  <div className="group-list-avatar">
                    {g.avatar_url ? (
                      <img src={getAvatarUrl(g.avatar_url)} alt={g.name} />
                    ) : (
                      <span>{g.name.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <span>{g.name}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="card empty-state">
          <span className="empty-icon">📋</span>
          <p>No tenés grupos todavía.</p>
        </div>
      )}

      {selected && (
        <div className="group-info-card" style={{ marginTop: 16 }}>
          {/* Group header with avatar */}
          <div className="group-detail-header">
            <div className="group-detail-avatar">
              {selected.avatar_url ? (
                <img src={getAvatarUrl(selected.avatar_url)} alt={selected.name} />
              ) : (
                <span>{selected.name.charAt(0).toUpperCase()}</span>
              )}
              {selected.is_owner && (
                <label className="avatar-upload-label" title="Cambiar foto de perfil del grupo">
                  📷
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    style={{ display: 'none' }}
                  />
                </label>
              )}
            </div>
            <div>
              <h4>🎯 Grupo activo: {selected.name}</h4>
              {selected.description && <p>{selected.description}</p>}
              <span className="group-id-badge">ID: {selected.id}</span>
              {selected.is_owner && <span className="owner-badge">👑 Admin</span>}
            </div>
          </div>

          {/* Members */}
          {selected.members && selected.members.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <h4 style={{ fontSize: '0.9rem', marginBottom: 8 }}>👥 Miembros ({selected.members.length})</h4>
              <div className="members-list">
                {selected.members.map((m) => (
                  <div key={m.id} className="member-row">
                    <div className="member-info">
                      <div className="member-avatar">{m.username.charAt(0).toUpperCase()}</div>
                      <div>
                        <span className="member-name">
                          {m.username}
                          {m.id === selected.owner_id && <span className="owner-tag">👑</span>}
                        </span>
                        <span className="member-email">{m.email}</span>
                      </div>
                    </div>
                    {selected.is_owner && m.id !== currentUserId && (
                      <button
                        className="btn-kick"
                        onClick={() => handleKick(m.id, m.username)}
                        disabled={loadingAction}
                        title="Eliminar del grupo"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pending Requests (owner only) */}
          {selected.is_owner && requests.length > 0 && (
            <div className="requests-section">
              <h4>📨 Solicitudes pendientes ({requests.length})</h4>
              <div className="requests-list">
                {requests.map((r) => (
                  <div key={r.id} className="request-row">
                    <div className="member-info">
                      <div className="member-avatar request">{r.username.charAt(0).toUpperCase()}</div>
                      <div>
                        <span className="member-name">{r.username}</span>
                        <span className="member-email">{r.email}</span>
                      </div>
                    </div>
                    <div className="request-actions">
                      <button
                        className="btn-accept"
                        onClick={() => handleAccept(r.id)}
                        disabled={loadingAction}
                      >
                        ✓ Aceptar
                      </button>
                      <button
                        className="btn-reject"
                        onClick={() => handleReject(r.id)}
                        disabled={loadingAction}
                      >
                        ✕ Rechazar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selected.is_owner && selected.pending_requests_count === 0 && requests.length === 0 && (
            <div style={{ marginTop: 12, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              📨 No hay solicitudes pendientes
            </div>
          )}

          {/* Leave Group Button */}
          <button
            className="btn-danger-leave"
            onClick={handleLeave}
            disabled={loadingAction}
          >
            🚪 Salir del grupo
          </button>
        </div>
      )}
    </>
  );
}
