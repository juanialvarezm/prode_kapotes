import { useEffect, useState } from 'react';
import {
  getMyLeagues,
  getLeagueById,
  createLeague,
  deleteLeague,
  createLeagueTeam,
  deleteLeagueTeam,
  createLeagueMatch,
  updateLeagueMatch,
  deleteLeagueMatch,
  addLeagueMember,
  removeLeagueMember,
} from '../api';

export default function LeaguePage() {
  const [leagues, setLeagues] = useState([]);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loadingAction, setLoadingAction] = useState(false);

  // Create league form
  const [newLeague, setNewLeague] = useState({ name: '', description: '' });

  // Add team form
  const [newTeamName, setNewTeamName] = useState('');

  // Add match form
  const [newMatch, setNewMatch] = useState({ home_team_id: '', away_team_id: '', match_date: '' });

  // Score edit
  const [editingMatch, setEditingMatch] = useState(null); // { id, home_score, away_score }

  // Add member form
  const [memberUsername, setMemberUsername] = useState('');

  // Active tab inside detail view
  const [activeTab, setActiveTab] = useState('matches'); // 'matches' | 'teams' | 'members'

  const currentUserId = parseInt(localStorage.getItem('userId'), 10) || null;

  const feedback = (err, ok) => {
    if (err) setError(err?.response?.data?.error || 'Ocurrió un error');
    if (ok) setSuccess(ok);
  };

  const load = async () => {
    try {
      const res = await getMyLeagues();
      const loaded = res.data.leagues || [];
      setLeagues(loaded);
      if (selected) {
        const still = loaded.find(l => l.id === selected.id);
        if (still) await selectLeague(still.id);
      }
    } catch (e) {
      feedback(e);
    }
  };

  useEffect(() => { load(); }, []);

  const selectLeague = async (id) => {
    setError(''); setSuccess('');
    try {
      const res = await getLeagueById(id);
      setSelected(res.data);
      setActiveTab('matches');
    } catch (e) {
      feedback(e);
    }
  };

  /* ── Create League ─────────────────────────────── */
  const handleCreateLeague = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!newLeague.name.trim()) return setError('El nombre es obligatorio');
    setLoadingAction(true);
    try {
      const res = await createLeague(newLeague);
      setNewLeague({ name: '', description: '' });
      setSuccess('✅ Liga creada exitosamente');
      await load();
      await selectLeague(res.data.league_id);
    } catch (e) { feedback(e); }
    finally { setLoadingAction(false); }
  };

  /* ── Delete League ─────────────────────────────── */
  const handleDeleteLeague = async () => {
    if (!selected) return;
    if (!window.confirm(`¿Eliminar la liga "${selected.name}"? Esta acción no se puede deshacer.`)) return;
    setLoadingAction(true);
    try {
      await deleteLeague(selected.id);
      setSelected(null);
      setSuccess('Liga eliminada');
      await load();
    } catch (e) { feedback(e); }
    finally { setLoadingAction(false); }
  };

  /* ── Create Team ───────────────────────────────── */
  const handleCreateTeam = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!newTeamName.trim()) return setError('El nombre del equipo es obligatorio');
    setLoadingAction(true);
    try {
      await createLeagueTeam(selected.id, { name: newTeamName.trim() });
      setNewTeamName('');
      setSuccess('✅ Equipo creado');
      await selectLeague(selected.id);
    } catch (e) { feedback(e); }
    finally { setLoadingAction(false); }
  };

  const handleDeleteTeam = async (teamId, teamName) => {
    if (!window.confirm(`¿Eliminar el equipo "${teamName}"?`)) return;
    setLoadingAction(true);
    try {
      await deleteLeagueTeam(selected.id, teamId);
      setSuccess('Equipo eliminado');
      await selectLeague(selected.id);
    } catch (e) { feedback(e); }
    finally { setLoadingAction(false); }
  };

  /* ── Create Match ──────────────────────────────── */
  const handleCreateMatch = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!newMatch.home_team_id || !newMatch.away_team_id) return setError('Seleccioná ambos equipos');
    if (newMatch.home_team_id === newMatch.away_team_id) return setError('Los equipos deben ser distintos');
    setLoadingAction(true);
    try {
      await createLeagueMatch(selected.id, {
        home_team_id: parseInt(newMatch.home_team_id),
        away_team_id: parseInt(newMatch.away_team_id),
        match_date: newMatch.match_date || undefined,
      });
      setNewMatch({ home_team_id: '', away_team_id: '', match_date: '' });
      setSuccess('✅ Partido creado');
      await selectLeague(selected.id);
    } catch (e) { feedback(e); }
    finally { setLoadingAction(false); }
  };

  const handleDeleteMatch = async (matchId) => {
    if (!window.confirm('¿Eliminar este partido?')) return;
    setLoadingAction(true);
    try {
      await deleteLeagueMatch(selected.id, matchId);
      setSuccess('Partido eliminado');
      await selectLeague(selected.id);
    } catch (e) { feedback(e); }
    finally { setLoadingAction(false); }
  };

  /* ── Update Score ──────────────────────────────── */
  const handleSaveScore = async () => {
    if (!editingMatch) return;
    setLoadingAction(true);
    try {
      await updateLeagueMatch(selected.id, editingMatch.id, {
        home_score: parseInt(editingMatch.home_score),
        away_score: parseInt(editingMatch.away_score),
      });
      setEditingMatch(null);
      setSuccess('✅ Resultado actualizado');
      await selectLeague(selected.id);
    } catch (e) { feedback(e); }
    finally { setLoadingAction(false); }
  };

  /* ── Add Member ────────────────────────────────── */
  const handleAddMember = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!memberUsername.trim()) return setError('Ingresá un nombre de usuario');
    setLoadingAction(true);
    try {
      await addLeagueMember(selected.id, memberUsername.trim());
      setMemberUsername('');
      setSuccess(`✅ Miembro agregado`);
      await selectLeague(selected.id);
    } catch (e) { feedback(e); }
    finally { setLoadingAction(false); }
  };

  const handleRemoveMember = async (userId, username) => {
    if (!window.confirm(`¿Eliminar a "${username}" de la liga?`)) return;
    setLoadingAction(true);
    try {
      await removeLeagueMember(selected.id, userId);
      setSuccess(`${username} fue eliminado`);
      await selectLeague(selected.id);
    } catch (e) { feedback(e); }
    finally { setLoadingAction(false); }
  };

  /* ── Helpers ───────────────────────────────────── */
  const formatDate = (iso) => {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' }) +
      ' · ' + d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  };

  const computeStandings = (teams, matches) => {
    const table = {};
    teams.forEach(t => {
      table[t.id] = { name: t.name, pts: 0, gf: 0, ga: 0, gd: 0, w: 0, d: 0, l: 0, p: 0 };
    });
    matches.filter(m => m.status === 'FINISHED').forEach(m => {
      const h = table[m.home_team_id];
      const a = table[m.away_team_id];
      if (!h || !a) return;
      h.gf += m.home_score; h.ga += m.away_score;
      a.gf += m.away_score; a.ga += m.home_score;
      h.p++; a.p++;
      if (m.home_score > m.away_score) { h.pts += 3; h.w++; a.l++; }
      else if (m.home_score === m.away_score) { h.pts++; a.pts++; h.d++; a.d++; }
      else { a.pts += 3; a.w++; h.l++; }
    });
    return Object.values(table)
      .map(r => ({ ...r, gd: r.gf - r.ga }))
      .sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf);
  };

  /* ── Render ────────────────────────────────────── */
  return (
    <>
      <div className="league-page-header">
        <h2 className="page-title" style={{ marginBottom: 0 }}>
          <span className="icon">🏟️</span> Ligas
        </h2>
        {leagues.length === 0 && (
          <p className="league-page-intro">Creá tu propia liga, sumá equipos y cargá los resultados.</p>
        )}
      </div>

      {error && <div className="error" style={{ marginBottom: 12 }}>{error}</div>}
      {success && <div className="success" style={{ marginBottom: 12 }}>{success}</div>}

      <div className="league-layout">
        {/* ── LEFT: list + create ── */}
        <aside className="league-sidebar">
          {/* Create form */}
          <div className="card league-create-card">
            <div className="league-create-card-title">
              <span>➕</span> Nueva liga
            </div>
            <form onSubmit={handleCreateLeague}>
              <input
                className="league-input"
                placeholder="Nombre de la liga"
                value={newLeague.name}
                onChange={e => setNewLeague({ ...newLeague, name: e.target.value })}
              />
              <input
                className="league-input"
                placeholder="Descripción (opcional)"
                value={newLeague.description}
                onChange={e => setNewLeague({ ...newLeague, description: e.target.value })}
              />
              <button type="submit" className="btn-primary" disabled={loadingAction}>
                {loadingAction ? 'Creando...' : 'Crear liga'}
              </button>
            </form>
          </div>

          {/* League list */}
          {leagues.length > 0 && (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <ul className="league-list">
                {leagues.map(l => (
                  <li
                    key={l.id}
                    className={`league-list-item${selected?.id === l.id ? ' active' : ''}`}
                    onClick={() => selectLeague(l.id)}
                  >
                    <div className="league-list-item-icon">🏟️</div>
                    <div className="league-list-item-info">
                      <span className="league-list-item-name">{l.name}</span>
                      <span className="league-list-item-meta">
                        {l.teams_count} equipos · {l.members_count} miembros
                      </span>
                    </div>
                    {l.is_owner && <span className="owner-badge">👑</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {leagues.length === 0 && (
            <div className="card empty-state">
              <span className="empty-icon">🏟️</span>
              <p>No tenés ligas todavía.</p>
            </div>
          )}
        </aside>

        {/* ── RIGHT: detail ── */}
        {selected && (
          <section className="league-detail">
            {/* Header */}
            <div className="league-detail-header card">
              <div className="league-detail-header-info">
                <h3 className="league-detail-name">{selected.name}</h3>
                {selected.description && (
                  <p className="league-detail-desc">{selected.description}</p>
                )}
                <div className="league-detail-badges">
                  <span className="league-badge">{selected.teams?.length || 0} equipos</span>
                  <span className="league-badge">{selected.members?.length || 0} miembros</span>
                  {selected.is_owner && <span className="owner-badge">👑 Admin</span>}
                </div>
              </div>
              {selected.is_owner && (
                <button
                  className="btn-danger-leave"
                  onClick={handleDeleteLeague}
                  disabled={loadingAction}
                  style={{ marginTop: 0, alignSelf: 'flex-start' }}
                >
                  🗑️ Eliminar liga
                </button>
              )}
            </div>

            {/* Standings */}
            {selected.teams?.length > 0 && selected.matches?.some(m => m.status === 'FINISHED') && (
              <div className="card" style={{ marginTop: 16 }}>
                <h4 className="league-section-title">📊 Tabla de posiciones</h4>
                <div className="league-standings-table">
                  <div className="league-standings-head">
                    <span className="standings-col-team">Equipo</span>
                    <span className="standings-col-num">PJ</span>
                    <span className="standings-col-num">G</span>
                    <span className="standings-col-num">E</span>
                    <span className="standings-col-num">P</span>
                    <span className="standings-col-num">GD</span>
                    <span className="standings-col-pts">PTS</span>
                  </div>
                  {computeStandings(selected.teams, selected.matches).map((row, i) => (
                    <div key={row.name} className={`league-standings-row${i === 0 ? ' standings-first' : ''}`}>
                      <span className="standings-col-team">
                        <span className="standings-pos">{i + 1}</span>
                        {row.name}
                      </span>
                      <span className="standings-col-num">{row.p}</span>
                      <span className="standings-col-num">{row.w}</span>
                      <span className="standings-col-num">{row.d}</span>
                      <span className="standings-col-num">{row.l}</span>
                      <span className="standings-col-num">{row.gd > 0 ? `+${row.gd}` : row.gd}</span>
                      <span className="standings-col-pts">{row.pts}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="league-tabs">
              {['matches', 'teams', 'members'].map(tab => (
                <button
                  key={tab}
                  className={`league-tab-btn${activeTab === tab ? ' active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab === 'matches' ? '⚽ Partidos' : tab === 'teams' ? '🛡️ Equipos' : '👥 Miembros'}
                </button>
              ))}
            </div>

            {/* TAB: MATCHES */}
            {activeTab === 'matches' && (
              <div className="league-tab-content">
                {selected.is_owner && (
                  <div className="card league-form-card">
                    <h4 className="league-section-title">Agregar partido</h4>
                    {(selected.teams?.length || 0) < 2 ? (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        Necesitás al menos 2 equipos para crear un partido. Añadilos en la pestaña 🛡️ Equipos.
                      </p>
                    ) : (
                      <form className="league-match-form" onSubmit={handleCreateMatch}>
                        <select
                          className="league-select"
                          value={newMatch.home_team_id}
                          onChange={e => setNewMatch({ ...newMatch, home_team_id: e.target.value })}
                        >
                          <option value="">Local</option>
                          {selected.teams.map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                          ))}
                        </select>
                        <span className="league-vs-sep">VS</span>
                        <select
                          className="league-select"
                          value={newMatch.away_team_id}
                          onChange={e => setNewMatch({ ...newMatch, away_team_id: e.target.value })}
                        >
                          <option value="">Visitante</option>
                          {selected.teams.map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                          ))}
                        </select>
                        <input
                          type="datetime-local"
                          className="league-input league-date-input"
                          value={newMatch.match_date}
                          onChange={e => setNewMatch({ ...newMatch, match_date: e.target.value })}
                        />
                        <button type="submit" className="btn-primary" disabled={loadingAction} style={{ width: 'auto', padding: '10px 20px' }}>
                          {loadingAction ? '...' : 'Agregar'}
                        </button>
                      </form>
                    )}
                  </div>
                )}

                {(selected.matches?.length || 0) === 0 ? (
                  <div className="card empty-state" style={{ marginTop: 12 }}>
                    <span className="empty-icon">⚽</span>
                    <p>No hay partidos en esta liga todavía.</p>
                  </div>
                ) : (
                  <div className="league-matches-list">
                    {selected.matches.map(m => (
                      <div key={m.id} className={`league-match-card${m.status === 'FINISHED' ? ' finished' : ''}`}>
                        <div className="league-match-date">{formatDate(m.match_date)}</div>
                        <div className="league-match-teams">
                          <span className="league-match-team">{m.home_team_name}</span>
                          {m.status === 'FINISHED' ? (
                            <span className="league-match-score">
                              {m.home_score} <span className="score-sep">:</span> {m.away_score}
                            </span>
                          ) : (
                            <span className="league-match-vs">VS</span>
                          )}
                          <span className="league-match-team">{m.away_team_name}</span>
                        </div>
                        <div className="league-match-status-row">
                          <span className={`league-match-status-badge${m.status === 'FINISHED' ? ' done' : ''}`}>
                            {m.status === 'FINISHED' ? '✅ Finalizado' : '📅 Programado'}
                          </span>
                          {selected.is_owner && (
                            <div className="league-match-actions">
                              {editingMatch?.id === m.id ? (
                                <>
                                  <input
                                    type="number" min="0"
                                    className="league-score-input"
                                    value={editingMatch.home_score}
                                    onChange={e => setEditingMatch({ ...editingMatch, home_score: e.target.value })}
                                    placeholder="Local"
                                  />
                                  <span style={{ color: 'var(--text-muted)' }}>:</span>
                                  <input
                                    type="number" min="0"
                                    className="league-score-input"
                                    value={editingMatch.away_score}
                                    onChange={e => setEditingMatch({ ...editingMatch, away_score: e.target.value })}
                                    placeholder="Visit."
                                  />
                                  <button className="btn-prize-save" onClick={handleSaveScore} disabled={loadingAction}>✓</button>
                                  <button className="btn-prize-cancel" onClick={() => setEditingMatch(null)}>✕</button>
                                </>
                              ) : (
                                <>
                                  <button
                                    className="league-btn-edit"
                                    onClick={() => setEditingMatch({ id: m.id, home_score: m.home_score ?? '', away_score: m.away_score ?? '' })}
                                    title="Cargar resultado"
                                  >
                                    ⚽ Resultado
                                  </button>
                                  <button
                                    className="btn-kick"
                                    onClick={() => handleDeleteMatch(m.id)}
                                    disabled={loadingAction}
                                    title="Eliminar partido"
                                  >
                                    ✕
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: TEAMS */}
            {activeTab === 'teams' && (
              <div className="league-tab-content">
                {selected.is_owner && (
                  <div className="card league-form-card">
                    <h4 className="league-section-title">Agregar equipo</h4>
                    <form onSubmit={handleCreateTeam} style={{ display: 'flex', gap: 10 }}>
                      <input
                        className="league-input"
                        style={{ flex: 1 }}
                        placeholder="Nombre del equipo"
                        value={newTeamName}
                        onChange={e => setNewTeamName(e.target.value)}
                      />
                      <button type="submit" className="btn-primary" disabled={loadingAction} style={{ width: 'auto', padding: '10px 20px' }}>
                        {loadingAction ? '...' : 'Agregar'}
                      </button>
                    </form>
                  </div>
                )}

                {(selected.teams?.length || 0) === 0 ? (
                  <div className="card empty-state" style={{ marginTop: 12 }}>
                    <span className="empty-icon">🛡️</span>
                    <p>No hay equipos en esta liga todavía.</p>
                  </div>
                ) : (
                  <div className="card" style={{ marginTop: 12 }}>
                    <div className="members-list">
                      {selected.teams.map(t => (
                        <div key={t.id} className="member-row">
                          <div className="member-info">
                            <div className="member-avatar" style={{ background: 'rgba(245,158,11,0.15)', color: 'var(--gold-light)' }}>
                              🛡️
                            </div>
                            <div>
                              <span className="member-name">{t.name}</span>
                            </div>
                          </div>
                          {selected.is_owner && (
                            <button
                              className="btn-kick"
                              onClick={() => handleDeleteTeam(t.id, t.name)}
                              disabled={loadingAction}
                              title="Eliminar equipo"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB: MEMBERS */}
            {activeTab === 'members' && (
              <div className="league-tab-content">
                {selected.is_owner && (
                  <div className="card league-form-card">
                    <h4 className="league-section-title">Agregar miembro</h4>
                    <form onSubmit={handleAddMember} style={{ display: 'flex', gap: 10 }}>
                      <input
                        className="league-input"
                        style={{ flex: 1 }}
                        placeholder="Nombre de usuario"
                        value={memberUsername}
                        onChange={e => setMemberUsername(e.target.value)}
                      />
                      <button type="submit" className="btn-primary" disabled={loadingAction} style={{ width: 'auto', padding: '10px 20px' }}>
                        {loadingAction ? '...' : 'Agregar'}
                      </button>
                    </form>
                  </div>
                )}

                {(selected.members?.length || 0) === 0 ? (
                  <div className="card empty-state" style={{ marginTop: 12 }}>
                    <span className="empty-icon">👥</span>
                    <p>No hay miembros en esta liga.</p>
                  </div>
                ) : (
                  <div className="card" style={{ marginTop: 12 }}>
                    <div className="members-list">
                      {selected.members.map(m => (
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
                          {selected.is_owner && m.id !== selected.owner_id && (
                            <button
                              className="btn-kick"
                              onClick={() => handleRemoveMember(m.id, m.username)}
                              disabled={loadingAction}
                              title="Eliminar miembro"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        )}
      </div>
    </>
  );
}
