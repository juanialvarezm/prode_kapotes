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
  getMe,
  getAvatarUrl,
  getGroupInviteLink,
  getOrganizedMatches,
  createOrganizedMatch,
  deleteOrganizedMatch,
  toggleMatchAttendance,
  toggleParticipantPayment,
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
  const [members, setMembers] = useState([]);
  const [membersPage, setMembersPage] = useState(1);
  const [membersHasMore, setMembersHasMore] = useState(false);
  const [membersTotal, setMembersTotal] = useState(0);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Organized matches states
  const [activeTab, setActiveTab] = useState('members');
  const [organizedMatches, setOrganizedMatches] = useState([]);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [matchForm, setMatchForm] = useState({ title: '', match_date: '', field_name: '', price: '' });
  const [submittingMatch, setSubmittingMatch] = useState(false);

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

  const loadMatches = async (groupId) => {
    setLoadingMatches(true);
    try {
      const res = await getOrganizedMatches(groupId);
      setOrganizedMatches(res.data.matches || []);
    } catch {
      setError('No se pudieron cargar los partidos organizados.');
    } finally {
      setLoadingMatches(false);
    }
  };

  const handleCreateMatch = async (e) => {
    e.preventDefault();
    if (!selected) return;
    if (!matchForm.match_date || !matchForm.field_name) {
      setError('La fecha y la cancha son obligatorias.');
      return;
    }
    setSubmittingMatch(true);
    setError('');
    setSuccess('');
    try {
      await createOrganizedMatch(selected.id, matchForm);
      setSuccess('✅ Partido organizado con éxito!');
      setMatchForm({ title: '', match_date: '', field_name: '', price: '' });
      setShowCreateForm(false);
      loadMatches(selected.id);
    } catch (err) {
      setError(err?.response?.data?.error || 'Error al organizar el partido.');
    } finally {
      setSubmittingMatch(false);
    }
  };

  const handleDeleteMatch = async (matchId) => {
    if (!selected) return;
    const confirmDelete = window.confirm('¿Seguro que querés cancelar/eliminar este partido?');
    if (!confirmDelete) return;
    setLoadingMatches(true);
    try {
      await deleteOrganizedMatch(selected.id, matchId);
      setSuccess('Partido eliminado.');
      loadMatches(selected.id);
    } catch (err) {
      setError(err?.response?.data?.error || 'Error al eliminar el partido.');
    } finally {
      setLoadingMatches(false);
    }
  };

  const handleToggleAttendance = async (matchId, isConfirmed) => {
    if (!selected) return;
    try {
      await toggleMatchAttendance(selected.id, matchId, !isConfirmed);
      loadMatches(selected.id);
    } catch (err) {
      setError(err?.response?.data?.error || 'Error al actualizar asistencia.');
    }
  };

  const handleTogglePayment = async (matchId, participantUserId, isPaid) => {
    if (!selected) return;
    try {
      await toggleParticipantPayment(selected.id, matchId, participantUserId, !isPaid);
      loadMatches(selected.id);
    } catch (err) {
      setError(err?.response?.data?.error || 'Error al actualizar pago.');
    }
  };

  const onSelectGroup = async (id) => {
    setError(''); setSuccess('');
    localStorage.setItem('groupId', String(id));
    // Reset members pagination
    setMembers([]);
    setMembersPage(1);
    setMembersHasMore(false);
    setMembersTotal(0);
    setActiveTab('members');
    setOrganizedMatches([]);
    setShowCreateForm(false);
    try {
      const res = await getGroupById(id, 1);
      setSelected(res.data);
      setMembers(res.data.members || []);
      setMembersHasMore(res.data.members_has_more || false);
      setMembersTotal(res.data.members_total || 0);
      setMembersPage(1);
      // Load organized matches
      loadMatches(id);
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


          {/* Tabs Navigation */}
          <div className="group-tabs" style={{ display: 'flex', gap: 12, borderBottom: '1px solid var(--border)', margin: '20px 0' }}>
            <button
              className={`group-tab-btn ${activeTab === 'members' ? 'active' : ''}`}
              onClick={() => setActiveTab('members')}
              style={{
                background: 'none',
                border: 'none',
                borderBottom: activeTab === 'members' ? '2px solid var(--accent)' : '2px solid transparent',
                color: activeTab === 'members' ? 'var(--text-primary)' : 'var(--text-secondary)',
                padding: '10px 16px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.95rem',
                transition: 'all 0.2s',
                outline: 'none'
              }}
            >
              👥 Miembros
            </button>
            <button
              className={`group-tab-btn ${activeTab === 'matches' ? 'active' : ''}`}
              onClick={() => setActiveTab('matches')}
              style={{
                background: 'none',
                border: 'none',
                borderBottom: activeTab === 'matches' ? '2px solid var(--accent)' : '2px solid transparent',
                color: activeTab === 'matches' ? 'var(--text-primary)' : 'var(--text-secondary)',
                padding: '10px 16px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.95rem',
                transition: 'all 0.2s',
                outline: 'none'
              }}
            >
              ⚽ Organizar Partido
            </button>
          </div>

          {activeTab === 'members' && (
            <>
              {/* Members */}
              {members.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <h4 style={{ fontSize: '0.9rem', marginBottom: 8 }}>👥 Miembros ({members.length}{membersHasMore ? ` de ${membersTotal}` : ` de ${membersTotal}`})</h4>
                  <div className="members-list">
                    {members.map((m) => (
                      <div key={m.id} className="member-row">
                        <div className="member-info" onClick={() => navigate(`/profile/${m.id}`)} style={{ cursor: 'pointer' }} title={`Ver perfil de ${m.username}`}>
                          <div className="member-avatar">
                            {m.profile_picture ? (
                              <img src={m.profile_picture} alt={m.username} />
                            ) : (
                              m.username.charAt(0).toUpperCase()
                            )}
                          </div>
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
                        <div className="member-info" onClick={() => navigate(`/profile/${r.user_id}`)} style={{ cursor: 'pointer' }} title={`Ver perfil de ${r.username}`}>
                          <div className="member-avatar request">
                            {r.profile_picture ? (
                              <img src={r.profile_picture} alt={r.username} />
                            ) : (
                              r.username.charAt(0).toUpperCase()
                            )}
                          </div>
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
            </>
          )}

          {activeTab === 'matches' && (
            <div style={{ marginTop: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h4 style={{ fontSize: '1rem', margin: 0 }}>⚽ Partidos Organizados</h4>
                {selected.is_owner && (
                  <button
                    className="btn-primary"
                    style={{ width: 'auto', padding: '6px 12px', fontSize: '0.85rem' }}
                    onClick={() => setShowCreateForm(!showCreateForm)}
                  >
                    {showCreateForm ? 'Cancelar' : '➕ Organizar Partido'}
                  </button>
                )}
              </div>

              {/* Create Match Form */}
              {selected.is_owner && showCreateForm && (
                <form onSubmit={handleCreateMatch} className="card" style={{ padding: 16, marginBottom: 20, background: 'var(--bg-card-solid)', border: '1px solid var(--border)' }}>
                  <h5 style={{ marginBottom: 12, fontSize: '0.95rem' }}>Organizar Nuevo Partido</h5>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 4 }}>Día y Hora</label>
                      <input
                        type="datetime-local"
                        required
                        className="predictions-search-input"
                        style={{ width: '100%', height: '40px', padding: '0 10px', fontSize: '0.85rem' }}
                        value={matchForm.match_date}
                        onChange={(e) => setMatchForm({ ...matchForm, match_date: e.target.value })}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 4 }}>Cancha / Lugar</label>
                      <input
                        type="text"
                        required
                        placeholder="Ej: Cancha 5 - El Predio"
                        className="predictions-search-input"
                        style={{ width: '100%', height: '40px', padding: '0 10px', fontSize: '0.85rem' }}
                        value={matchForm.field_name}
                        onChange={(e) => setMatchForm({ ...matchForm, field_name: e.target.value })}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 4 }}>Precio Total Cancha ($)</label>
                      <input
                        type="number"
                        placeholder="Ej: 24000"
                        className="predictions-search-input"
                        style={{ width: '100%', height: '40px', padding: '0 10px', fontSize: '0.85rem' }}
                        value={matchForm.price}
                        onChange={(e) => setMatchForm({ ...matchForm, price: e.target.value })}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 4 }}>Título / Descripción corta</label>
                      <input
                        type="text"
                        placeholder="Ej: Fútbol 5 de los lunes"
                        className="predictions-search-input"
                        style={{ width: '100%', height: '40px', padding: '0 10px', fontSize: '0.85rem' }}
                        value={matchForm.title}
                        onChange={(e) => setMatchForm({ ...matchForm, title: e.target.value })}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn-primary"
                    style={{ width: '100%' }}
                    disabled={submittingMatch}
                  >
                    {submittingMatch ? 'Publicando...' : '🚀 Publicar Partido'}
                  </button>
                </form>
              )}

              {/* Organized Matches List */}
              {loadingMatches ? (
                <div style={{ textAlign: 'center', padding: 24, color: 'var(--text-secondary)' }}>
                  ⏳ Cargando partidos organizados...
                </div>
              ) : organizedMatches.length === 0 ? (
                <div className="card empty-state" style={{ padding: 32 }}>
                  <span className="empty-icon">⚽</span>
                  <p>No hay partidos organizados para este grupo aún.</p>
                  {selected.is_owner && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>¡Organizá el primero usando el botón de arriba!</p>}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {organizedMatches.map((m) => {
                    const matchDateObj = new Date(m.match_date);
                    const dateFormatted = matchDateObj.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });
                    const timeFormatted = matchDateObj.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
                    
                    const confirmedCount = m.participants.filter(p => p.confirmed).length;
                    const costPerPerson = confirmedCount > 0 ? Math.round(m.price / confirmedCount) : m.price;
                    
                    return (
                      <div key={m.id} className="card" style={{ padding: 18, border: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
                          <div>
                            <h5 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--text-primary)' }}>{m.title || 'Partido de fútbol'}</h5>
                            <span style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: '600', textTransform: 'capitalize' }}>
                              📅 {dateFormatted} · ⏰ {timeFormatted} hs
                            </span>
                          </div>
                          
                          {selected.is_owner && (
                            <button
                              onClick={() => handleDeleteMatch(m.id)}
                              className="btn-danger-leave"
                              style={{ width: 'auto', padding: '4px 8px', fontSize: '0.75rem', margin: 0 }}
                              title="Eliminar partido"
                            >
                              ✕ Cancelar Partido
                            </button>
                          )}
                        </div>

                        {/* Details Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12, padding: 12, background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-sm)', marginBottom: 14 }}>
                          <div>
                            <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>🏟️ Cancha</span>
                            <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>{m.field_name}</span>
                          </div>
                          <div>
                            <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>💰 Precio Total</span>
                            <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>${m.price.toLocaleString('es-AR')}</span>
                          </div>
                          <div>
                            <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>👥 Confirmados</span>
                            <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>{confirmedCount} jugadores</span>
                          </div>
                          <div>
                            <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>💵 Costo / Persona</span>
                            <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--gold-light)' }}>
                              {confirmedCount > 0 ? `$${costPerPerson.toLocaleString('es-AR')}` : 'Por confirmar'}
                            </span>
                          </div>
                        </div>

                        {/* Attend Button */}
                        <div style={{ marginBottom: 14 }}>
                          <button
                            className={m.is_confirmed ? 'btn-danger-leave' : 'btn-primary'}
                            onClick={() => handleToggleAttendance(m.id, m.is_confirmed)}
                            style={{
                              width: '100%',
                              padding: '8px 16px',
                              fontWeight: '600',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 8,
                              margin: 0,
                              background: m.is_confirmed ? 'rgba(239, 68, 68, 0.15)' : '',
                              border: m.is_confirmed ? '1px solid var(--danger)' : '',
                              color: m.is_confirmed ? 'var(--danger-light)' : ''
                            }}
                          >
                            {m.is_confirmed ? '❌ Cancelar mi Asistencia' : '🙋‍♂️ Confirmar mi Asistencia'}
                          </button>
                        </div>

                        {/* Participants list */}
                        <div>
                          <h6 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 8, borderBottom: '1px solid var(--border)', paddingBottom: 4 }}>
                            Asistencia ({confirmedCount})
                          </h6>
                          
                          {m.participants.length === 0 ? (
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '4px 0' }}>
                              Nadie ha confirmado asistencia todavía.
                            </div>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                              {m.participants.map((p) => {
                                const isCurrentUser = p.user_id === currentUserId;
                                return (
                                  <div key={p.user_id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 8px', borderRadius: 'var(--radius-sm)', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.02)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                      <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--accent-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold', color: '#fff', overflow: 'hidden' }}>
                                        {p.profile_picture ? (
                                          <img src={p.profile_picture} alt={p.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                          p.username.charAt(0).toUpperCase()
                                        )}
                                      </div>
                                      <span style={{ fontSize: '0.85rem', fontWeight: isCurrentUser ? '600' : '400' }}>
                                        {p.username} {isCurrentUser && '(Vos)'}
                                      </span>
                                    </div>

                                    {/* Payment Toggle (Only editable by owner) */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                      {selected.is_owner ? (
                                        <button
                                          onClick={() => handleTogglePayment(m.id, p.user_id, p.paid)}
                                          style={{
                                            background: p.paid ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255,255,255,0.05)',
                                            border: p.paid ? '1px solid var(--success)' : '1px solid var(--border)',
                                            borderRadius: '20px',
                                            padding: '4px 10px',
                                            fontSize: '0.75rem',
                                            color: p.paid ? 'var(--accent-light)' : 'var(--text-secondary)',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 4,
                                            transition: 'all 0.2s',
                                            width: 'auto'
                                          }}
                                          title={p.paid ? 'Marcar como pendiente' : 'Marcar como pagado'}
                                        >
                                          {p.paid ? '💵 Pagó ✅' : '💵 Pendiente'}
                                        </button>
                                      ) : (
                                        <span
                                          style={{
                                            background: p.paid ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255,255,255,0.02)',
                                            border: p.paid ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(255,255,255,0.05)',
                                            borderRadius: '20px',
                                            padding: '3px 8px',
                                            fontSize: '0.7rem',
                                            color: p.paid ? 'var(--success)' : 'var(--text-muted)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 4
                                          }}
                                        >
                                          {p.paid ? '💵 Pagó ✅' : '💵 Pendiente'}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
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
