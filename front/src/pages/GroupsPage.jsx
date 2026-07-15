import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  getMyGroups,
  getGroupById,
  leaveGroup,
  getJoinRequests,
  acceptJoinRequest,
  rejectJoinRequest,
  kickMember,
  updateGroupAvatar,
  updateGroupPrizePool,
  getMe,
  getAvatarUrl,
  getGroupInviteLink,
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
  const [editingPrize, setEditingPrize] = useState(false);
  const [prizeValue, setPrizeValue] = useState('');
  const [members, setMembers] = useState([]);
  const [membersPage, setMembersPage] = useState(1);
  const [membersHasMore, setMembersHasMore] = useState(false);
  const [membersTotal, setMembersTotal] = useState(0);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    getMe().then(res => setCurrentUserId(res.data.id)).catch(() => { });
  }, []);

  useEffect(() => {
    if (location.state?.success) {
      setSuccess(location.state.success);
      // Clear location state to prevent repeating message on reload
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

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
      if (err?.response?.status === 401) return;
      setError('No se pudo cargar los grupos');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onSelectGroup = async (id) => {
    setError(''); setSuccess('');
    localStorage.setItem('groupId', String(id));
    // Reset members pagination
    setMembers([]);
    setMembersPage(1);
    setMembersHasMore(false);
    setMembersTotal(0);
    try {
      const res = await getGroupById(id, 1);
      setSelected(res.data);
      setMembers(res.data.members || []);
      setMembersHasMore(res.data.members_has_more || false);
      setMembersTotal(res.data.members_total || 0);
      setMembersPage(1);
      // If owner, load pending requests
      if (res.data.is_owner) {
        loadRequests(id);
      } else {
        setRequests([]);
      }
    } catch (err) {
      if (err?.response?.status === 401) return;
      setError('No se encontró el grupo');
    }
  };

  const loadMoreMembers = async () => {
    if (!selected || loadingMembers || !membersHasMore) return;
    const nextPage = membersPage + 1;
    setLoadingMembers(true);
    try {
      const res = await getGroupById(selected.id, nextPage);
      setMembers(prev => [...prev, ...(res.data.members || [])]);
      setMembersHasMore(res.data.members_has_more || false);
      setMembersTotal(res.data.members_total || 0);
      setMembersPage(nextPage);
    } catch {
      setError('Error cargando más miembros');
    } finally {
      setLoadingMembers(false);
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
              <div className="group-invite-section" style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button
                  className="btn-secondary"
                  style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6, width: 'auto', padding: '6px 12px' }}
                  onClick={async () => {
                    try {
                      const res = await getGroupInviteLink(selected.id);
                      const url = res.data.whatsapp_url;
                      window.open(url, '_blank');
                    } catch (err) {
                      alert('No se pudo generar el enlace de WhatsApp.');
                    }
                  }}
                >
                  <span>💬 Invitar por WhatsApp</span>
                </button>
                <button
                  className="btn-secondary"
                  style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6, width: 'auto', padding: '6px 12px' }}
                  onClick={() => {
                    const base = (window.location.origin + window.location.pathname).replace(/\/+$/, '');
                    const inviteLink = `${base}/#/join-group?groupId=${selected.id}`;
                    navigator.clipboard.writeText(inviteLink);
                    setSuccess('📋 ¡Enlace de invitación copiado al portapapeles!');
                    setTimeout(() => setSuccess(''), 3000);
                  }}
                >
                  <span>🔗 Copiar enlace</span>
                </button>
              </div>
            </div>
          </div>

          {/* Prize pool */}
          <div className="prize-pool-section">
            <div className="prize-pool-display">
              <span className="prize-pool-icon">💰</span>
              <div className="prize-pool-info">
                <span className="prize-pool-label">Pozo acumulado</span>
                {editingPrize ? (
                  <div className="prize-pool-edit-row">
                    <span className="prize-pool-currency">$</span>
                    <input
                      type="number"
                      min="0"
                      className="prize-pool-input"
                      value={prizeValue}
                      onChange={(e) => setPrizeValue(e.target.value)}
                      autoFocus
                    />
                    <button
                      className="btn-prize-save"
                      disabled={loadingAction}
                      onClick={async () => {
                        setLoadingAction(true);
                        try {
                          await updateGroupPrizePool(selected.id, Number(prizeValue) || 0);
                          setEditingPrize(false);
                          setSuccess('✅ Pozo actualizado');
                          onSelectGroup(selected.id);
                        } catch (err) {
                          setError(err?.response?.data?.error || 'Error actualizando pozo');
                        } finally {
                          setLoadingAction(false);
                        }
                      }}
                    >
                      ✓
                    </button>
                    <button className="btn-prize-cancel" onClick={() => setEditingPrize(false)}>✕</button>
                  </div>
                ) : (
                  <span className="prize-pool-amount">
                    ${(selected.prize_pool || 0).toLocaleString('es-AR')}
                  </span>
                )}
              </div>
              {selected.is_owner && !editingPrize && (
                <button
                  className="btn-prize-edit"
                  onClick={() => { setPrizeValue(String(selected.prize_pool || 0)); setEditingPrize(true); }}
                  title="Editar pozo"
                >
                  ✏️
                </button>
              )}
            </div>
          </div>

          {/* Members */}
          {members.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <h4 style={{ fontSize: '0.9rem', marginBottom: 8 }}>👥 Miembros ({members.length}{membersHasMore ? ` de ${membersTotal}` : ` de ${membersTotal}`})</h4>
              <div className="members-list">
                {members.map((m) => (
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
              {membersHasMore && (
                <button
                  className="btn-load-more"
                  onClick={loadMoreMembers}
                  disabled={loadingMembers}
                  style={{ marginTop: 8, width: '100%' }}
                >
                  {loadingMembers ? 'Cargando...' : `Ver más miembros (${membersTotal - members.length} restantes)`}
                </button>
              )}
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
