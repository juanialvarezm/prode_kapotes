import { useState, useRef, useEffect, useMemo } from 'react';
import { claimMinigameReward } from '../api';

// ── Club colours for shirt rendering ──────────────────────────────────────
const CLUB_COLORS = {
  'Real Madrid':        { bg: '#FFFFFF', accent: '#00529F', text: '#00529F' },
  'Barcelona':          { bg: '#A50044', accent: '#004D98', text: '#fff'    },
  'Manchester United':  { bg: '#DA291C', accent: '#FFE500', text: '#fff'    },
  'Manchester City':    { bg: '#6CABDD', accent: '#1C2C5B', text: '#1C2C5B' },
  'Liverpool':          { bg: '#C8102E', accent: '#F6EB61', text: '#fff'    },
  'Arsenal':            { bg: '#EF0107', accent: '#FFFFFF', text: '#fff'    },
  'Chelsea':            { bg: '#034694', accent: '#DBA111', text: '#fff'    },
  'Bayern Munich':      { bg: '#DC052D', accent: '#0066B2', text: '#fff'    },
  'Juventus':           { bg: '#000000', accent: '#FFFFFF', text: '#fff'    },
  'PSG':                { bg: '#004170', accent: '#DA291C', text: '#fff'    },
  'Atlético Madrid':    { bg: '#CB3524', accent: '#FFFFFF', text: '#fff'    },
  'Inter Milan':        { bg: '#010E80', accent: '#000000', text: '#fff'    },
  'AC Milan':           { bg: '#FB090B', accent: '#000000', text: '#fff'    },
  'Napoli':             { bg: '#087AC5', accent: '#FFFFFF', text: '#fff'    },
  'Borussia Dortmund':  { bg: '#FDE100', accent: '#000000', text: '#000'    },
  'Aston Villa':        { bg: '#7B003C', accent: '#95BFE5', text: '#fff'    },
  'Al-Nassr':           { bg: '#FFFF00', accent: '#002F5C', text: '#002F5C' },
  'Al-Ittihad':         { bg: '#000000', accent: '#FFD700', text: '#FFD700' },
  'Al-Ahli':            { bg: '#007A3D', accent: '#FFFFFF', text: '#fff'    },
  'Tottenham':          { bg: '#FFFFFF', accent: '#001E62', text: '#001E62' },
  'Nottingham Forest':  { bg: '#DD0000', accent: '#FFFFFF', text: '#fff'    },
  'Real Sociedad':      { bg: '#0067B1', accent: '#FFFFFF', text: '#fff'    },
  'Athletic Club':      { bg: '#EE2523', accent: '#FFFFFF', text: '#fff'    },
  'Freiburg':           { bg: '#E60005', accent: '#000000', text: '#fff'    },
  'Lyon':               { bg: '#0033A0', accent: '#FFFFFF', text: '#fff'    },
  'Galatasaray':        { bg: '#E8213B', accent: '#F5A623', text: '#fff'    },
  'LAFC':               { bg: '#000000', accent: '#C39E6D', text: '#C39E6D' },
  'River Plate':        { bg: '#FFFFFF', accent: '#EE1221', text: '#EE1221' },
  'Corinthians':        { bg: '#000000', accent: '#FFFFFF', text: '#fff'    },
  'Inter Miami':        { bg: '#F7B5CD', accent: '#231F20', text: '#231F20' },
  'Boca Juniors':       { bg: '#003DA5', accent: '#FBCB02', text: '#FBCB02' },
  'Roma':               { bg: '#8B0000', accent: '#F6BC00', text: '#fff'    },
  'Sevilla':            { bg: '#FFFFFF', accent: '#E03020', text: '#E03020' },
  'Valencia':           { bg: '#FF7003', accent: '#000000', text: '#000'    },
  'Ajax':               { bg: '#D2122E', accent: '#FFFFFF', text: '#fff'    },
  'Porto':              { bg: '#003087', accent: '#FFFFFF', text: '#fff'    },
  'Benfica':            { bg: '#CC0000', accent: '#FFFFFF', text: '#fff'    },
  'Sporting CP':        { bg: '#006600', accent: '#FFFFFF', text: '#fff'    },
  'Lazio':              { bg: '#87CEEB', accent: '#FFFFFF', text: '#1a1a1a' },
  'Monaco':             { bg: '#E8112D', accent: '#FFFFFF', text: '#fff'    },
  'Marseille':          { bg: '#009EE0', accent: '#FFFFFF', text: '#fff'    },
  'Celtic':             { bg: '#169B62', accent: '#FFFFFF', text: '#fff'    },
  'Rangers':            { bg: '#1B458F', accent: '#FFFFFF', text: '#fff'    },
  'PSV':                { bg: '#E00000', accent: '#FFFFFF', text: '#fff'    },
  'RB Leipzig':         { bg: '#DD0741', accent: '#FFFFFF', text: '#fff'    },
  'Eintracht Frankfurt':{ bg: '#E1000F', accent: '#000000', text: '#fff'    },
  'Atlanta United':     { bg: '#80000A', accent: '#9DC2EA', text: '#fff'    },
  'Nacional':           { bg: '#041E42', accent: '#FFFFFF', text: '#fff'    },
  'Rayo Vallecano':     { bg: '#FFFFFF', accent: '#E8112D', text: '#E8112D' },
};

function getClubStyle(club) {
  return CLUB_COLORS[club] || { bg: '#1e293b', accent: '#94a3b8', text: '#fff' };
}

// ── Player database with career history ───────────────────────────────────
const PLAYERS = [
  {
    name: 'Lionel Messi',
    career: ['Barcelona', 'PSG', 'Inter Miami'],
    nationality: 'Argentina',
  },
  {
    name: 'Cristiano Ronaldo',
    career: ['Sporting CP', 'Manchester United', 'Real Madrid', 'Juventus', 'Al-Nassr'],
    nationality: 'Portugal',
  },
  {
    name: 'Kylian Mbappé',
    career: ['Monaco', 'PSG', 'Real Madrid'],
    nationality: 'Francia',
  },
  {
    name: 'Neymar Jr.',
    career: ['Santos', 'Barcelona', 'PSG', 'Al-Hilal'],
    nationality: 'Brasil',
  },
  {
    name: 'Luka Modrić',
    career: ['Dinamo Zagreb', 'Tottenham', 'Real Madrid'],
    nationality: 'Croacia',
  },
  {
    name: 'Kevin De Bruyne',
    career: ['Genk', 'Chelsea', 'Wolfsburg', 'Manchester City'],
    nationality: 'Bélgica',
  },
  {
    name: 'Zlatan Ibrahimović',
    career: ['Ajax', 'Juventus', 'Inter Milan', 'Barcelona', 'AC Milan', 'PSG'],
    nationality: 'Suecia',
  },
  {
    name: 'Luis Suárez',
    career: ['Ajax', 'Liverpool', 'Barcelona', 'Atlético Madrid', 'River Plate'],
    nationality: 'Uruguay',
  },
  {
    name: 'Ángel Di María',
    career: ['Benfica', 'Real Madrid', 'Manchester United', 'PSG', 'Juventus'],
    nationality: 'Argentina',
  },
  {
    name: 'Robert Lewandowski',
    career: ['Lech Poznan', 'Borussia Dortmund', 'Bayern Munich', 'Barcelona'],
    nationality: 'Polonia',
  },
  {
    name: 'Mohamed Salah',
    career: ['Basel', 'Chelsea', 'Roma', 'Liverpool'],
    nationality: 'Egipto',
  },
  {
    name: 'Sadio Mané',
    career: ['Southampton', 'Liverpool', 'Bayern Munich', 'Al-Nassr'],
    nationality: 'Senegal',
  },
  {
    name: 'Harry Kane',
    career: ['Tottenham', 'Bayern Munich'],
    nationality: 'Inglaterra',
  },
  {
    name: 'Antoine Griezmann',
    career: ['Real Sociedad', 'Atlético Madrid', 'Barcelona', 'Atlético Madrid'],
    nationality: 'Francia',
  },
  {
    name: 'Romelu Lukaku',
    career: ['Chelsea', 'Everton', 'Manchester United', 'Inter Milan', 'Napoli'],
    nationality: 'Bélgica',
  },
  {
    name: 'Paulo Dybala',
    career: ['Palermo', 'Juventus', 'Roma'],
    nationality: 'Argentina',
  },
  {
    name: 'Eden Hazard',
    career: ['Lille', 'Chelsea', 'Real Madrid'],
    nationality: 'Bélgica',
  },
  {
    name: 'David Beckham',
    career: ['Manchester United', 'Real Madrid', 'AC Milan', 'LA Galaxy'],
    nationality: 'Inglaterra',
  },
  {
    name: 'Thierry Henry',
    career: ['Monaco', 'Juventus', 'Arsenal', 'Barcelona', 'New York Red Bulls'],
    nationality: 'Francia',
  },
  {
    name: 'Ronaldinho',
    career: ['PSG', 'Barcelona', 'AC Milan', 'Flamengo'],
    nationality: 'Brasil',
  },
  {
    name: 'Zinedine Zidane',
    career: ['Cannes', 'Bordeaux', 'Juventus', 'Real Madrid'],
    nationality: 'Francia',
  },
  {
    name: 'Didier Drogba',
    career: ['Marseille', 'Chelsea', 'Galatasaray', 'Montreal Impact'],
    nationality: 'Costa de Marfil',
  },
  {
    name: 'Samuel Eto\'o',
    career: ['Real Madrid', 'Mallorca', 'Barcelona', 'Inter Milan', 'Chelsea'],
    nationality: 'Camerún',
  },
  {
    name: 'Carlos Tevez',
    career: ['Boca Juniors', 'Manchester United', 'Manchester City', 'Juventus'],
    nationality: 'Argentina',
  },
  {
    name: 'Sergio Agüero',
    career: ['Lanus', 'Atlético Madrid', 'Manchester City', 'Barcelona'],
    nationality: 'Argentina',
  },
  {
    name: 'Fernando Torres',
    career: ['Atlético Madrid', 'Liverpool', 'Chelsea', 'AC Milan'],
    nationality: 'España',
  },
  {
    name: 'Wayne Rooney',
    career: ['Everton', 'Manchester United', 'DC United', 'Derby County'],
    nationality: 'Inglaterra',
  },
  {
    name: 'Cesc Fàbregas',
    career: ['Arsenal', 'Barcelona', 'Chelsea', 'Monaco', 'Como'],
    nationality: 'España',
  },
  {
    name: 'Xabi Alonso',
    career: ['Real Sociedad', 'Liverpool', 'Real Madrid', 'Bayern Munich'],
    nationality: 'España',
  },
  {
    name: 'Andrés Iniesta',
    career: ['Barcelona', 'Vissel Kobe', 'Emirates Club'],
    nationality: 'España',
  },
  {
    name: 'Karim Benzema',
    career: ['Lyon', 'Real Madrid', 'Al-Ittihad'],
    nationality: 'Francia',
  },
  {
    name: 'Gareth Bale',
    career: ['Southampton', 'Tottenham', 'Real Madrid', 'LAFC'],
    nationality: 'Gales',
  },
  {
    name: 'Jude Bellingham',
    career: ['Birmingham City', 'Borussia Dortmund', 'Real Madrid'],
    nationality: 'Inglaterra',
  },
  {
    name: 'Vinicius Jr.',
    career: ['Flamengo', 'Real Madrid'],
    nationality: 'Brasil',
  },
  {
    name: 'Erling Haaland',
    career: ['Molde', 'RB Salzburg', 'Borussia Dortmund', 'Manchester City'],
    nationality: 'Noruega',
  },
  {
    name: 'Pedri',
    career: ['Las Palmas', 'Barcelona'],
    nationality: 'España',
  },
  {
    name: 'Bukayo Saka',
    career: ['Arsenal'],
    nationality: 'Inglaterra',
  },
  {
    name: 'Achraf Hakimi',
    career: ['Real Madrid', 'Borussia Dortmund', 'Inter Milan', 'PSG'],
    nationality: 'Marruecos',
  },
  {
    name: 'Darwin Núñez',
    career: ['Almería', 'Benfica', 'Liverpool'],
    nationality: 'Uruguay',
  },
  {
    name: 'Federico Valverde',
    career: ['Peñarol', 'Real Madrid'],
    nationality: 'Uruguay',
  },
  {
    name: 'Enzo Fernández',
    career: ['River Plate', 'Benfica', 'Chelsea'],
    nationality: 'Argentina',
  },
  {
    name: 'Phil Foden',
    career: ['Manchester City'],
    nationality: 'Inglaterra',
  },
  {
    name: 'Virgil van Dijk',
    career: ['Celtic', 'Southampton', 'Liverpool'],
    nationality: 'Países Bajos',
  },
  {
    name: 'Gianluigi Buffon',
    career: ['Parma', 'Juventus', 'PSG', 'Juventus'],
    nationality: 'Italia',
  },
  {
    name: 'Sergio Ramos',
    career: ['Sevilla', 'Real Madrid', 'PSG', 'Sevilla'],
    nationality: 'España',
  },
  {
    name: 'Gerard Piqué',
    career: ['Barcelona', 'Manchester United', 'Barcelona'],
    nationality: 'España',
  },
  {
    name: 'Rio Ferdinand',
    career: ['West Ham', 'Leeds United', 'Manchester United'],
    nationality: 'Inglaterra',
  },
  {
    name: 'Patrick Vieira',
    career: ['AC Milan', 'Arsenal', 'Juventus', 'Inter Milan', 'Manchester City'],
    nationality: 'Francia',
  },
  {
    name: 'Francesco Totti',
    career: ['Roma'],
    nationality: 'Italia',
  },
  {
    name: 'Alessandro Del Piero',
    career: ['Juventus', 'Sydney FC', 'Delhi Dynamos'],
    nationality: 'Italia',
  },
  {
    name: 'Filippo Inzaghi',
    career: ['Juventus', 'AC Milan'],
    nationality: 'Italia',
  },
];

// All player names for autocomplete (union of PLAYERS)
const ALL_NAMES = PLAYERS.map(p => p.name);

const normalize = (str) =>
  str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

// Pick a deterministic player for today
function pickToday() {
  const d = new Date();
  const seed = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
  return PLAYERS[seed % PLAYERS.length];
}

// How many clubs to reveal per attempt index (reveal one more each wrong guess)
// We cap revealed clubs at 4 even if the player has more
const MAX_GUESSES = 6;
const MAX_CLUBS_SHOWN = 4;

// ── Shirt SVG component ───────────────────────────────────────────────────
function ShirtIcon({ club, revealed, index }) {
  const style = getClubStyle(club);
  return (
    <div
      className={`fl-shirt-wrap ${revealed ? 'fl-shirt-revealed' : 'fl-shirt-hidden'}`}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {revealed ? (
        <>
          <svg className="fl-shirt-svg" viewBox="0 0 80 72" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* shirt body */}
            <path
              d="M20 8 L10 28 L22 30 L22 68 L58 68 L58 30 L70 28 L60 8 C56 14 44 16 40 16 C36 16 24 14 20 8Z"
              fill={style.bg}
              stroke={style.accent}
              strokeWidth="2.5"
            />
            {/* collar */}
            <path
              d="M31 8 Q40 18 49 8"
              fill="none"
              stroke={style.accent}
              strokeWidth="2.5"
            />
            {/* left sleeve */}
            <path
              d="M20 8 L5 22 L10 28 L22 18Z"
              fill={style.bg}
              stroke={style.accent}
              strokeWidth="2.5"
            />
            {/* right sleeve */}
            <path
              d="M60 8 L75 22 L70 28 L58 18Z"
              fill={style.bg}
              stroke={style.accent}
              strokeWidth="2.5"
            />
          </svg>
          <span className="fl-shirt-label" style={{ color: style.text === '#fff' ? 'var(--text-primary)' : style.text }}>
            {club}
          </span>
        </>
      ) : (
        <>
          <div className="fl-shirt-mystery">
            <span className="fl-mystery-num">{index + 1}</span>
            <span className="fl-mystery-icon">?</span>
          </div>
          <span className="fl-shirt-label" style={{ color: 'var(--text-muted)' }}>Pista {index + 1}</span>
        </>
      )}
    </div>
  );
}

export default function FutLegacy() {
  const secret = useMemo(() => pickToday(), []);
  // Which clubs to use (up to 4, pick evenly spaced from career)
  const clubs = useMemo(() => {
    const c = [...new Set(secret.career)]; // deduplicate
    if (c.length <= MAX_CLUBS_SHOWN) return c;
    // pick 4 spread across the career
    const step = (c.length - 1) / (MAX_CLUBS_SHOWN - 1);
    return [0, 1, 2, 3].map(i => c[Math.round(i * step)]);
  }, [secret]);

  const [guesses, setGuesses]     = useState([]); // string[]
  const [query, setQuery]         = useState('');
  const [suggestions, setSugg]    = useState([]);
  const [gameState, setGameState] = useState('playing');
  const [shake, setShake]         = useState(false);
  const [rewardMsg, setRewardMsg] = useState('');
  const inputRef = useRef(null);

  // How many clubs are revealed = number of wrong guesses + 1 (start with 1)
  const wrongGuesses = guesses.filter(g => normalize(g) !== normalize(secret.name)).length;
  const revealedCount = Math.min(wrongGuesses + 1, MAX_CLUBS_SHOWN);

  useEffect(() => {
    if (!query.trim()) { setSugg([]); return; }
    const q = normalize(query);
    const used = new Set(guesses.map(normalize));
    setSugg(
      ALL_NAMES.filter(n => !used.has(normalize(n)) && normalize(n).includes(q)).slice(0, 7)
    );
  }, [query, guesses]);

  const handleSelect = (name) => {
    if (gameState !== 'playing') return;
    const newGuesses = [...guesses, name];
    setGuesses(newGuesses);
    setQuery('');
    setSugg([]);

    const correct = normalize(name) === normalize(secret.name);
    const wrongs  = newGuesses.filter(g => normalize(g) !== normalize(secret.name)).length;

    if (correct) {
      setGameState('won');
      claimMinigameReward('futlegacy')
        .then(res => {
          if (res.data?.points_granted > 0) {
            setRewardMsg(`+${res.data.points_granted} pts otorgados ⭐`);
          }
        })
        .catch(() => {});
    } else if (wrongs >= MAX_GUESSES) {
      setGameState('lost');
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && suggestions.length > 0) handleSelect(suggestions[0]);
    if (e.key === 'Escape') setSugg([]);
  };

  const attemptsLeft = MAX_GUESSES - wrongGuesses;

  return (
    <div className="fl-page">
      {/* ── Header ── */}
      <div className="fl-header">
        <div className="fl-title-row">
          <span className="fl-header-icon">👕</span>
          <div>
            <h1 className="fl-title">
              Fut<span className="fl-title-hl">Legacy</span>
            </h1>
            <p className="fl-subtitle">Adiviná el jugador por sus camisetas — {MAX_GUESSES} intentos</p>
          </div>
        </div>
        <div className="fl-stats">
          <div className="fl-stat-chip">
            <span className="fl-stat-num">{wrongGuesses}</span>
            <span className="fl-stat-label">Errores</span>
          </div>
          <div className="fl-stat-chip">
            <span className="fl-stat-num">{attemptsLeft}</span>
            <span className="fl-stat-label">Restantes</span>
          </div>
          <div className="fl-stat-chip">
            <span className="fl-stat-num">{revealedCount}/{Math.min(clubs.length, MAX_CLUBS_SHOWN)}</span>
            <span className="fl-stat-label">Pistas</span>
          </div>
        </div>
      </div>

      {/* ── How to play ── */}
      <div className="fl-how-to">
        <span>👕 Se revela una nueva camiseta por cada intento fallido</span>
        <span>·</span>
        <span>⭐ Menos intentos = más mérito</span>
      </div>

      {/* ── Shirts grid ── */}
      <div className="fl-shirts-grid">
        {clubs.slice(0, MAX_CLUBS_SHOWN).map((club, i) => (
          <ShirtIcon
            key={i}
            club={club}
            revealed={i < revealedCount || gameState !== 'playing'}
            index={i}
          />
        ))}
      </div>

      {/* ── Result banner ── */}
      {gameState !== 'playing' && (
        <div className={`fl-result-banner ${gameState}`}>
          {gameState === 'won'
            ? `🎉 ¡Correcto! Era ${secret.name} (${secret.nationality}) — ${wrongGuesses + 1} intento${wrongGuesses + 1 > 1 ? 's' : ''}${rewardMsg ? ` — ${rewardMsg}` : ''}`
            : `Era: ${secret.name} (${secret.nationality}) — ¡Mejor suerte mañana!`}
        </div>
      )}

      {/* ── Search input ── */}
      {gameState === 'playing' && (
        <div className={`fl-search-wrap ${shake ? 'fl-shake' : ''}`}>
          <div className="fl-input-row">
            <span className="fl-search-icon">🔍</span>
            <input
              ref={inputRef}
              id="fl-player-input"
              className="fl-input"
              type="text"
              placeholder="Escribí el nombre del jugador..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKey}
              autoComplete="off"
              autoFocus
            />
            {query && (
              <button className="fl-clear-btn" onClick={() => { setQuery(''); setSugg([]); inputRef.current?.focus(); }}>✕</button>
            )}
          </div>
          {suggestions.length > 0 && (
            <ul className="fl-suggestions">
              {suggestions.map(name => (
                <li key={name} className="fl-sug-item" onClick={() => handleSelect(name)}>
                  {name}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* ── Guesses log ── */}
      {guesses.length > 0 && (
        <div className="fl-guesses">
          <p className="fl-guesses-title">Intentos anteriores</p>
          <div className="fl-guess-list">
            {guesses.map((g, i) => {
              const correct = normalize(g) === normalize(secret.name);
              return (
                <div key={i} className={`fl-guess-row ${correct ? 'fl-guess-ok' : 'fl-guess-fail'}`}>
                  <span className="fl-guess-icon">{correct ? '✅' : '❌'}</span>
                  <span className="fl-guess-name">{g}</span>
                  {correct && <span className="fl-guess-badge">¡Correcto!</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Restart ── */}
      {gameState !== 'playing' && (
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <p className="fl-next-hint">Volvé mañana para el próximo jugador 🌙</p>
          <button className="home-btn-primary" onClick={() => window.location.reload()} id="btn-fl-restart">
            🔄 Jugar de nuevo (otro jugador)
          </button>
        </div>
      )}
    </div>
  );
}
