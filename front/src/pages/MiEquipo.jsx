import React, { useState } from 'react';

// ─── Mock data ───────────────────────────────────────────────────────────────
const MOCK_WEEK = 3;
const MOCK_DEADLINE = '2026-06-22T18:00:00';

const MOCK_PLAYERS = [
  // GK
  { id: 1,  name: 'Ederson',        country: '🇧🇷 Brasil',   position: 'GK',  points: 186, ranking: 1,  avatar: '🧤', price: 12 },
  // DEF
  { id: 2,  name: 'Alexander-Arnold', country: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 Inglaterra', position: 'DEF', points: 164, ranking: 2,  avatar: '🛡️', price: 11 },
  { id: 3,  name: 'Rúben Dias',     country: '🇵🇹 Portugal', position: 'DEF', points: 144, ranking: 5,  avatar: '🛡️', price: 10 },
  { id: 4,  name: 'Marquinhos',     country: '🇧🇷 Brasil',   position: 'DEF', points: 141, ranking: 7,  avatar: '🛡️', price: 9  },
  { id: 5,  name: 'Davies',         country: '🇨🇦 Canadá',   position: 'DEF', points: 136, ranking: 9,  avatar: '🛡️', price: 8  },
  // MID
  { id: 6,  name: 'Pedri',          country: '🇪🇸 España',   position: 'MID', points: 175, ranking: 3,  avatar: '⚡', price: 13 },
  { id: 7,  name: 'Bellingham',     country: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 Inglaterra', position: 'MID', points: 162, ranking: 4,  avatar: '⚡', price: 12 },
  { id: 8,  name: 'De Bruyne',      country: '🇧🇪 Bélgica',  position: 'MID', points: 148, ranking: 6,  avatar: '⚡', price: 11 },
  // FWD
  { id: 9,  name: 'Mbappé',         country: '🇫🇷 Francia',  position: 'FWD', points: 210, ranking: 1,  avatar: '⚽', price: 15 },
  { id: 10, name: 'Vinicius Jr.',   country: '🇧🇷 Brasil',   position: 'FWD', points: 198, ranking: 2,  avatar: '⚽', price: 14 },
  { id: 11, name: 'Lautaro',        country: '🇦🇷 Argentina',position: 'FWD', points: 155, ranking: 4,  avatar: '⚽', price: 11 },
];

// Formation: 4-3-3
const FORMATION_LAYOUT = {
  GK:  [{ slot: 0, label: 'PO' }],
  DEF: [{ slot: 0, label: 'DEF' }, { slot: 1, label: 'DEF' }, { slot: 2, label: 'DEF' }, { slot: 3, label: 'DEF' }],
  MID: [{ slot: 0, label: 'MED' }, { slot: 1, label: 'MED' }, { slot: 2, label: 'MED' }],
  FWD: [{ slot: 0, label: 'DEL' }, { slot: 1, label: 'DEL' }, { slot: 2, label: 'DEL' }],
};

const POSITION_ORDER = ['GK', 'DEF', 'MID', 'FWD'];

// Group players by position
function groupByPosition(players) {
  return {
    GK:  players.filter(p => p.position === 'GK'),
    DEF: players.filter(p => p.position === 'DEF'),
    MID: players.filter(p => p.position === 'MID'),
    FWD: players.filter(p => p.position === 'FWD'),
  };
}

function getTimeLeft(deadlineStr) {
  const diff = new Date(deadlineStr) - new Date();
  if (diff <= 0) return 'Cerrado';
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (d > 0) return `${d}d ${h}h restantes`;
  if (h > 0) return `${h}h ${m}m restantes`;
  return `${m}m restantes`;
}

function getRankBadgeColor(rank) {
  if (rank === 1) return '#f59e0b';
  if (rank === 2) return '#94a3b8';
  if (rank === 3) return '#cd7c3f';
  return '#475569';
}

// ─── PlayerCard (on the pitch) ────────────────────────────────────────────────
function PitchPlayer({ player, onRemove, isEmpty, slotLabel, onClick }) {
  if (isEmpty) {
    return (
      <div className="pitch-player pitch-player--empty" onClick={onClick}>
        <div className="pitch-player-avatar pitch-player-avatar--empty">
          <span>+</span>
        </div>
        <div className="pitch-player-info">
          <span className="pitch-player-slot-label">{slotLabel}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="pitch-player pitch-player--filled">
      <div className="pitch-player-rank" style={{ background: getRankBadgeColor(player.ranking) }}>
        #{player.ranking}
      </div>
      <div className="pitch-player-avatar">
        <span>{player.avatar}</span>
      </div>
      <div className="pitch-player-info">
        <span className="pitch-player-name">{player.name}</span>
        <span className="pitch-player-country">{player.country}</span>
        <span className="pitch-player-pts">{player.points} pts</span>
      </div>
      <button className="pitch-player-remove" onClick={() => onRemove(player.id)} title="Quitar jugador">
        ✕
      </button>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
const MiEquipo = () => {
  const [selectedPlayers, setSelectedPlayers] = useState(MOCK_PLAYERS);
  const [formation, setFormation] = useState('4-3-3');
  const [activeTab, setActiveTab] = useState('campo'); // 'campo' | 'lista'
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null); // { position, slotIndex }

  const grouped = groupByPosition(selectedPlayers);
  const totalPoints = selectedPlayers.reduce((acc, p) => acc + p.points, 0);
  const totalPrice = selectedPlayers.reduce((acc, p) => acc + p.price, 0);
  const timeLeft = getTimeLeft(MOCK_DEADLINE);
  const budget = 125;
  const budgetUsed = totalPrice;

  function handleRemovePlayer(playerId) {
    setSelectedPlayers(prev => prev.filter(p => p.id !== playerId));
  }

  function handleSlotClick(position, slotIndex) {
    setSelectedSlot({ position, slotIndex });
    setShowPlayerModal(true);
  }

  // Render a row of players on the pitch
  function renderPitchRow(position) {
    const slots = FORMATION_LAYOUT[position];
    const posPlayers = grouped[position];

    return (
      <div className={`pitch-row pitch-row--${position.toLowerCase()}`} key={position}>
        {slots.map((slot, i) => {
          const player = posPlayers[i];
          return (
            <PitchPlayer
              key={i}
              player={player || null}
              isEmpty={!player}
              slotLabel={slot.label}
              onRemove={handleRemovePlayer}
              onClick={() => player ? null : handleSlotClick(position, i)}
            />
          );
        })}
      </div>
    );
  }

  return (
    <div className="mi-equipo-page">
      {/* ── Header ── */}
      <div className="mi-equipo-header">
        <div className="mi-equipo-title-row">
          <div>
            <h1 className="mi-equipo-title">
              <span className="mi-equipo-title-icon">⚽</span>
              Mi Equipo
              <span className="mi-equipo-week-badge">Semana {MOCK_WEEK}</span>
            </h1>
            <p className="mi-equipo-subtitle">Seleccioná 11 jugadores de los países en competencia</p>
          </div>
          <div className="mi-equipo-deadline">
            <span className="deadline-icon">⏱️</span>
            <div>
              <div className="deadline-label">Cierra en</div>
              <div className="deadline-value">{timeLeft}</div>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="mi-equipo-stats-bar">
          <div className="me-stat">
            <span className="me-stat-icon">🏆</span>
            <div>
              <div className="me-stat-label">Total puntos</div>
              <div className="me-stat-value me-stat-value--gold">{totalPoints.toLocaleString()}</div>
            </div>
          </div>
          <div className="me-stat-divider" />
          <div className="me-stat">
            <span className="me-stat-icon">👥</span>
            <div>
              <div className="me-stat-label">Jugadores</div>
              <div className="me-stat-value">{selectedPlayers.length}/11</div>
            </div>
          </div>
          <div className="me-stat-divider" />
          <div className="me-stat">
            <span className="me-stat-icon">💰</span>
            <div>
              <div className="me-stat-label">Presupuesto</div>
              <div className="me-stat-value" style={{ color: budgetUsed > budget ? 'var(--danger)' : 'var(--accent)' }}>
                ${budgetUsed}M / ${budget}M
              </div>
            </div>
          </div>
          <div className="me-stat-divider" />
          <div className="me-stat">
            <span className="me-stat-icon">🗺️</span>
            <div>
              <div className="me-stat-label">Formación</div>
              <select
                className="me-formation-select"
                value={formation}
                onChange={e => setFormation(e.target.value)}
              >
                <option value="4-3-3">4-3-3</option>
                <option value="4-4-2">4-4-2</option>
                <option value="3-5-2">3-5-2</option>
                <option value="5-3-2">5-3-2</option>
              </select>
            </div>
          </div>

          <button className="me-save-btn">
            Guardar equipo ✓
          </button>
        </div>

        {/* Budget progress bar */}
        <div className="me-budget-bar-wrap">
          <div className="me-budget-bar-track">
            <div
              className="me-budget-bar-fill"
              style={{
                width: `${Math.min((budgetUsed / budget) * 100, 100)}%`,
                background: budgetUsed > budget
                  ? 'linear-gradient(90deg, var(--danger), #dc2626)'
                  : 'linear-gradient(90deg, var(--accent), var(--gold))',
              }}
            />
          </div>
        </div>
      </div>

      {/* ── Tab switcher ── */}
      <div className="me-tabs">
        <button
          className={`me-tab ${activeTab === 'campo' ? 'me-tab--active' : ''}`}
          onClick={() => setActiveTab('campo')}
        >
          🏟️ Campo
        </button>
        <button
          className={`me-tab ${activeTab === 'lista' ? 'me-tab--active' : ''}`}
          onClick={() => setActiveTab('lista')}
        >
          📋 Lista
        </button>
      </div>

      {/* ── Campo view ── */}
      {activeTab === 'campo' && (
        <div className="pitch-container">
          {/* Field markings */}
          <div className="pitch-field">
            {/* Top half arc */}
            <div className="pitch-center-circle" />
            <div className="pitch-halfway-line" />
            <div className="pitch-penalty-top" />
            <div className="pitch-penalty-bottom" />
            <div className="pitch-goal-top" />
            <div className="pitch-goal-bottom" />

            {/* Players — bottom-to-top: GK → DEF → MID → FWD */}
            <div className="pitch-players-grid">
              {POSITION_ORDER.map(pos => renderPitchRow(pos))}
            </div>
          </div>
        </div>
      )}

      {/* ── Lista view ── */}
      {activeTab === 'lista' && (
        <div className="me-list-view">
          {POSITION_ORDER.map(pos => (
            <div key={pos} className="me-list-section">
              <div className="me-list-section-header">
                <span className="me-list-pos-badge me-list-pos-badge--{pos.toLowerCase()}">
                  {pos === 'GK' ? '🧤 Arqueros' : pos === 'DEF' ? '🛡️ Defensores' : pos === 'MID' ? '⚡ Mediocampistas' : '⚽ Atacantes'}
                </span>
                <span className="me-list-count">{grouped[pos].length}</span>
              </div>
              <div className="me-list-players">
                {grouped[pos].length === 0 && (
                  <div className="me-list-empty">Sin jugadores en esta posición</div>
                )}
                {grouped[pos].map(player => (
                  <div key={player.id} className="me-list-player-card">
                    <div className="me-list-player-rank" style={{ background: getRankBadgeColor(player.ranking) }}>
                      #{player.ranking}
                    </div>
                    <div className="me-list-player-avatar">{player.avatar}</div>
                    <div className="me-list-player-details">
                      <div className="me-list-player-name">{player.name}</div>
                      <div className="me-list-player-country">{player.country}</div>
                    </div>
                    <div className="me-list-player-right">
                      <div className="me-list-player-pts">{player.points} <span>pts</span></div>
                      <div className="me-list-player-price">${player.price}M</div>
                    </div>
                    <button className="me-list-remove-btn" onClick={() => handleRemovePlayer(player.id)}>✕</button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Country legend ── */}
      <div className="me-countries-legend">
        <h3 className="me-countries-title">Países en competencia</h3>
        <div className="me-countries-grid">
          {['🇦🇷 Argentina', '🇧🇷 Brasil', '🇫🇷 Francia', '🇪🇸 España', '🏴󠁧󠁢󠁥󠁮󠁧󠁿 Inglaterra', '🇵🇹 Portugal', '🇩🇪 Alemania', '🇺🇾 Uruguay'].map(c => (
            <div key={c} className="me-country-chip">{c}</div>
          ))}
        </div>
      </div>

      {/* ── Player selection modal (placeholder) ── */}
      {showPlayerModal && (
        <div className="me-modal-overlay" onClick={() => setShowPlayerModal(false)}>
          <div className="me-modal" onClick={e => e.stopPropagation()}>
            <div className="me-modal-header">
              <h2>Seleccionar jugador</h2>
              <button className="me-modal-close" onClick={() => setShowPlayerModal(false)}>✕</button>
            </div>
            <p className="me-modal-hint">Próximamente podrás buscar y seleccionar jugadores aquí.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MiEquipo;
