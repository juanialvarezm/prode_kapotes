import { useState, useRef, useEffect, useMemo } from 'react';

// ── Player database ────────────────────────────────────────────────────────
// Each player: { name, club, nationality, position }
const PLAYERS = [
  // Argentina
  { name: 'Lionel Messi',        club: 'Inter Miami',      nationality: 'Argentina',   position: 'Delantero'  },
  { name: 'Julián Álvarez',      club: 'Atlético Madrid',  nationality: 'Argentina',   position: 'Delantero'  },
  { name: 'Rodrigo De Paul',     club: 'Atlético Madrid',  nationality: 'Argentina',   position: 'Mediocampista' },
  { name: 'Enzo Fernández',      club: 'Chelsea',          nationality: 'Argentina',   position: 'Mediocampista' },
  { name: 'Lisandro Martínez',   club: 'Manchester United',nationality: 'Argentina',   position: 'Defensor'   },
  { name: 'Emiliano Martínez',   club: 'Aston Villa',      nationality: 'Argentina',   position: 'Arquero'    },
  // Brazil
  { name: 'Vinicius Jr.',        club: 'Real Madrid',      nationality: 'Brasil',      position: 'Delantero'  },
  { name: 'Rodrygo',             club: 'Real Madrid',      nationality: 'Brasil',      position: 'Delantero'  },
  { name: 'Raphinha',            club: 'Barcelona',        nationality: 'Brasil',      position: 'Delantero'  },
  { name: 'Casemiro',            club: 'Manchester United',nationality: 'Brasil',      position: 'Mediocampista' },
  { name: 'Alisson Becker',      club: 'Liverpool',        nationality: 'Brasil',      position: 'Arquero'    },
  { name: 'Marquinhos',          club: 'PSG',              nationality: 'Brasil',      position: 'Defensor'   },
  // France
  { name: 'Kylian Mbappé',       club: 'Real Madrid',      nationality: 'Francia',     position: 'Delantero'  },
  { name: 'Antoine Griezmann',   club: 'Atlético Madrid',  nationality: 'Francia',     position: 'Delantero'  },
  { name: 'N\'Golo Kanté',       club: 'Al-Ittihad',       nationality: 'Francia',     position: 'Mediocampista' },
  { name: 'Aurélien Tchouaméni', club: 'Real Madrid',      nationality: 'Francia',     position: 'Mediocampista' },
  { name: 'Mike Maignan',        club: 'AC Milan',         nationality: 'Francia',     position: 'Arquero'    },
  // England
  { name: 'Harry Kane',          club: 'Bayern Munich',    nationality: 'Inglaterra',  position: 'Delantero'  },
  { name: 'Jude Bellingham',     club: 'Real Madrid',      nationality: 'Inglaterra',  position: 'Mediocampista' },
  { name: 'Phil Foden',          club: 'Manchester City',  nationality: 'Inglaterra',  position: 'Delantero'  },
  { name: 'Bukayo Saka',         club: 'Arsenal',          nationality: 'Inglaterra',  position: 'Delantero'  },
  { name: 'Declan Rice',         club: 'Arsenal',          nationality: 'Inglaterra',  position: 'Mediocampista' },
  { name: 'Trent Alexander-Arnold', club: 'Real Madrid',   nationality: 'Inglaterra',  position: 'Defensor'   },
  // Spain
  { name: 'Pedri',               club: 'Barcelona',        nationality: 'España',      position: 'Mediocampista' },
  { name: 'Gavi',                club: 'Barcelona',        nationality: 'España',      position: 'Mediocampista' },
  { name: 'Lamine Yamal',        club: 'Barcelona',        nationality: 'España',      position: 'Delantero'  },
  { name: 'Álvaro Morata',       club: 'AC Milan',         nationality: 'España',      position: 'Delantero'  },
  { name: 'Unai Simón',          club: 'Athletic Club',    nationality: 'España',      position: 'Arquero'    },
  // Germany
  { name: 'Florian Wirtz',       club: 'Bayern Munich',    nationality: 'Alemania',    position: 'Mediocampista' },
  { name: 'Jamal Musiala',       club: 'Bayern Munich',    nationality: 'Alemania',    position: 'Mediocampista' },
  { name: 'Leroy Sané',          club: 'Bayern Munich',    nationality: 'Alemania',    position: 'Delantero'  },
  { name: 'Antonio Rüdiger',     club: 'Real Madrid',      nationality: 'Alemania',    position: 'Defensor'   },
  // Portugal
  { name: 'Cristiano Ronaldo',   club: 'Al-Nassr',         nationality: 'Portugal',    position: 'Delantero'  },
  { name: 'Bruno Fernandes',     club: 'Manchester United',nationality: 'Portugal',    position: 'Mediocampista' },
  { name: 'Bernardo Silva',      club: 'Manchester City',  nationality: 'Portugal',    position: 'Mediocampista' },
  { name: 'Rafael Leão',         club: 'AC Milan',         nationality: 'Portugal',    position: 'Delantero'  },
  // Netherlands
  { name: 'Virgil van Dijk',     club: 'Liverpool',        nationality: 'Países Bajos',position: 'Defensor'   },
  { name: 'Frenkie de Jong',     club: 'Barcelona',        nationality: 'Países Bajos',position: 'Mediocampista' },
  { name: 'Memphis Depay',       club: 'Corinthians',      nationality: 'Países Bajos',position: 'Delantero'  },
  { name: 'Cody Gakpo',          club: 'Liverpool',        nationality: 'Países Bajos',position: 'Delantero'  },
  // Belgium
  { name: 'Kevin De Bruyne',     club: 'Manchester City',  nationality: 'Bélgica',     position: 'Mediocampista' },
  { name: 'Romelu Lukaku',       club: 'Napoli',           nationality: 'Bélgica',     position: 'Delantero'  },
  // Uruguay
  { name: 'Darwin Núñez',        club: 'Liverpool',        nationality: 'Uruguay',     position: 'Delantero'  },
  { name: 'Federico Valverde',   club: 'Real Madrid',      nationality: 'Uruguay',     position: 'Mediocampista' },
  { name: 'Luis Suárez',         club: 'River Plate',      nationality: 'Uruguay',     position: 'Delantero'  },
  // Colombia
  { name: 'Luis Díaz',           club: 'Liverpool',        nationality: 'Colombia',    position: 'Delantero'  },
  { name: 'James Rodríguez',     club: 'Rayo Vallecano',   nationality: 'Colombia',    position: 'Mediocampista' },
  // Mexico
  { name: 'Guillermo Ochoa',     club: 'LAFC',             nationality: 'México',      position: 'Arquero'    },
  { name: 'Santiago Giménez',    club: 'AC Milan',         nationality: 'México',      position: 'Delantero'  },
  // USA
  { name: 'Christian Pulisic',   club: 'AC Milan',         nationality: 'USA',         position: 'Delantero'  },
  { name: 'Gio Reyna',           club: 'Nottingham Forest',nationality: 'USA',         position: 'Mediocampista' },
  // Croatia
  { name: 'Luka Modrić',         club: 'Real Madrid',      nationality: 'Croacia',     position: 'Mediocampista' },
  { name: 'Mateo Kovačić',       club: 'Manchester City',  nationality: 'Croacia',     position: 'Mediocampista' },
  // Morocco
  { name: 'Achraf Hakimi',       club: 'PSG',              nationality: 'Marruecos',   position: 'Defensor'   },
  { name: 'Hakim Ziyech',        club: 'Galatasaray',      nationality: 'Marruecos',   position: 'Delantero'  },
  // Japan
  { name: 'Takefusa Kubo',       club: 'Real Sociedad',    nationality: 'Japón',       position: 'Delantero'  },
  { name: 'Ritsu Doan',          club: 'Freiburg',         nationality: 'Japón',       position: 'Delantero'  },
  // Senegal
  { name: 'Sadio Mané',          club: 'Al-Nassr',         nationality: 'Senegal',     position: 'Delantero'  },
  { name: 'Edouard Mendy',       club: 'Al-Ahli',          nationality: 'Senegal',     position: 'Arquero'    },
  // Egypt
  { name: 'Mohamed Salah',       club: 'Liverpool',        nationality: 'Egipto',      position: 'Delantero'  },
  // Serbia
  { name: 'Dušan Vlahović',      club: 'Juventus',         nationality: 'Serbia',      position: 'Delantero'  },
  // Poland
  { name: 'Robert Lewandowski',  club: 'Barcelona',        nationality: 'Polonia',     position: 'Delantero'  },
  // Italy
  { name: 'Gianluigi Donnarumma',club: 'PSG',              nationality: 'Italia',      position: 'Arquero'    },
  { name: 'Nicolo Barella',      club: 'Inter Milan',      nationality: 'Italia',      position: 'Mediocampista' },
  // Austria
  { name: 'David Alaba',         club: 'Real Madrid',      nationality: 'Austria',     position: 'Defensor'   },
  // Ecuador
  { name: 'Moisés Caicedo',      club: 'Chelsea',          nationality: 'Ecuador',     position: 'Mediocampista' },
  // Inter (club duplicates for matching)
  { name: 'Lautaro Martínez',    club: 'Inter Milan',      nationality: 'Argentina',   position: 'Delantero'  },
  { name: 'Nicolás Tagliafico',  club: 'Lyon',             nationality: 'Argentina',   position: 'Defensor'   },
  { name: 'Thiago Almada',       club: 'Atlanta United',   nationality: 'Argentina',   position: 'Mediocampista' },
];

// normalise name for comparison / search
const normalize = (str) =>
  str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

// ── Pick today's secret deterministically ─────────────────────────────────
function pickTodaysPlayer() {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  return PLAYERS[seed % PLAYERS.length];
}

// ── Score calculation ──────────────────────────────────────────────────────
// Returns 0-100 score based on club + nationality matches
function computeScore(guess, secret) {
  let score = 0;
  if (guess.nationality === secret.nationality) score += 50;
  if (guess.club === secret.club)              score += 40;
  if (guess.position === secret.position)      score += 10;
  return score;
}

// colour for score bar
function scoreColour(score) {
  if (score >= 90) return '#10b981'; // green
  if (score >= 50) return '#f59e0b'; // gold
  if (score >= 20) return '#f97316'; // orange
  return '#ef4444';                  // red
}

const MAX_GUESSES = 8;

export default function GolTexto() {
  const secret = useMemo(() => pickTodaysPlayer(), []);

  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [guesses, setGuesses] = useState([]); // [{player, score}]
  const [gameState, setGameState] = useState('playing'); // 'playing'|'won'|'lost'
  const [shake, setShake] = useState(false);
  const inputRef = useRef(null);

  // Filter suggestions
  useEffect(() => {
    if (!query.trim()) { setSuggestions([]); return; }
    const q = normalize(query);
    const alreadyGuessed = new Set(guesses.map(g => g.player.name));
    const matches = PLAYERS.filter(
      p => !alreadyGuessed.has(p.name) && normalize(p.name).includes(q)
    ).slice(0, 7);
    setSuggestions(matches);
  }, [query, guesses]);

  const handleSelect = (player) => {
    if (gameState !== 'playing') return;
    const score = computeScore(player, secret);
    const isCorrect = player.name === secret.name;
    const newGuesses = [...guesses, { player, score }];
    setGuesses(newGuesses);
    setQuery('');
    setSuggestions([]);

    if (isCorrect) {
      setGameState('won');
    } else if (newGuesses.length >= MAX_GUESSES) {
      setGameState('lost');
    }

    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter' && suggestions.length > 0) {
      handleSelect(suggestions[0]);
    }
    if (e.key === 'Escape') {
      setSuggestions([]);
    }
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  return (
    <div className="gt-page">
      {/* ── Header ── */}
      <div className="gt-header">
        <div className="gt-title-row">
          <span className="gt-header-icon">⚽</span>
          <div>
            <h1 className="gt-title">
              Gol<span className="gt-title-highlight">Texto</span>
            </h1>
            <p className="gt-subtitle">
              Adiviná el jugador misterioso — tenés {MAX_GUESSES} intentos
            </p>
          </div>
        </div>

        {/* Stats chips */}
        <div className="gt-stats">
          <div className="gt-stat-chip">
            <span className="gt-stat-num">{guesses.length}</span>
            <span className="gt-stat-label">Intentos</span>
          </div>
          <div className="gt-stat-chip">
            <span className="gt-stat-num">{MAX_GUESSES - guesses.length}</span>
            <span className="gt-stat-label">Restantes</span>
          </div>
          <div className="gt-stat-chip">
            <span className="gt-stat-num">{guesses.length > 0 ? Math.max(...guesses.map(g => g.score)) : 0}%</span>
            <span className="gt-stat-label">Mejor</span>
          </div>
        </div>
      </div>

      {/* ── Legend ── */}
      <div className="gt-legend">
        <span className="gt-legend-item gt-match-full">🟢 Coincide exacto (+40/50%)</span>
        <span className="gt-legend-item gt-match-none">🔴 No coincide</span>
        <span className="gt-legend-item gt-match-pos">⚪ Posición correcta (+10%)</span>
      </div>

      {/* ── Result banner ── */}
      {gameState !== 'playing' && (
        <div className={`gt-result-banner ${gameState}`}>
          {gameState === 'won'
            ? `🎉 ¡Correcto! Era ${secret.name} — ${guesses.length} intento${guesses.length > 1 ? 's' : ''}`
            : `Era: ${secret.name} (${secret.club} · ${secret.nationality}) — ¡Mejor suerte mañana!`}
        </div>
      )}

      {/* ── Search input ── */}
      {gameState === 'playing' && (
        <div className={`gt-search-wrap ${shake ? 'gt-shake' : ''}`}>
          <div className="gt-input-row">
            <span className="gt-search-icon">🔍</span>
            <input
              ref={inputRef}
              id="gt-player-input"
              className="gt-input"
              type="text"
              placeholder="Escribí el nombre del jugador..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleInputKeyDown}
              autoComplete="off"
              autoFocus
            />
            {query && (
              <button className="gt-clear-btn" onClick={() => { setQuery(''); setSuggestions([]); inputRef.current?.focus(); }}>✕</button>
            )}
          </div>

          {/* Suggestions dropdown */}
          {suggestions.length > 0 && (
            <ul className="gt-suggestions" role="listbox">
              {suggestions.map(p => (
                <li
                  key={p.name}
                  className="gt-suggestion-item"
                  role="option"
                  onClick={() => handleSelect(p)}
                >
                  <span className="gt-sug-name">{p.name}</span>
                  <span className="gt-sug-meta">{p.club} · {p.nationality}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* ── Guesses list ── */}
      {guesses.length > 0 && (
        <div className="gt-guesses">
          <div className="gt-guesses-header">
            <span className="gt-col-name">Jugador</span>
            <span className="gt-col-attr">Club</span>
            <span className="gt-col-attr">Nac.</span>
            <span className="gt-col-attr">Pos.</span>
            <span className="gt-col-score">%</span>
          </div>
          {guesses.map((g, idx) => {
            const clubMatch  = g.player.club        === secret.club;
            const natMatch   = g.player.nationality === secret.nationality;
            const posMatch   = g.player.position    === secret.position;
            const isCorrect  = g.player.name        === secret.name;
            return (
              <div
                key={idx}
                className={`gt-guess-row ${isCorrect ? 'gt-guess-correct' : ''}`}
                style={{ animationDelay: `${idx * 0.04}s` }}
              >
                <span className="gt-guess-name">{g.player.name}</span>

                <span className={`gt-guess-attr ${clubMatch ? 'gt-attr-match' : 'gt-attr-miss'}`}>
                  {clubMatch ? '✓' : '✗'} {g.player.club}
                </span>

                <span className={`gt-guess-attr ${natMatch ? 'gt-attr-match' : 'gt-attr-miss'}`}>
                  {natMatch ? '✓' : '✗'} {g.player.nationality}
                </span>

                <span className={`gt-guess-attr ${posMatch ? 'gt-attr-match' : 'gt-attr-miss'}`}>
                  {posMatch ? '✓' : '✗'} {g.player.position}
                </span>

                <span className="gt-guess-score-wrap">
                  <span
                    className="gt-score-badge"
                    style={{ background: scoreColour(g.score), boxShadow: `0 2px 8px ${scoreColour(g.score)}55` }}
                  >
                    {g.score}%
                  </span>
                  {/* mini score bar */}
                  <div className="gt-score-bar-bg">
                    <div
                      className="gt-score-bar-fill"
                      style={{
                        width: `${g.score}%`,
                        background: scoreColour(g.score),
                        boxShadow: `0 0 8px ${scoreColour(g.score)}88`,
                      }}
                    />
                  </div>
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Hint section (clue tiles) ── */}
      <div className="gt-clues">
        <p className="gt-clues-title">Pistas sobre el jugador misterioso</p>
        <div className="gt-clues-grid">
          <div className="gt-clue-tile">
            <span className="gt-clue-label">Club</span>
            <span className="gt-clue-value gt-clue-hidden">
              {guesses.some(g => g.player.club === secret.club)
                ? secret.club
                : guesses.length >= 3 ? '¿Conocés su club?' : '???'}
            </span>
          </div>
          <div className="gt-clue-tile">
            <span className="gt-clue-label">Nacionalidad</span>
            <span className="gt-clue-value gt-clue-hidden">
              {guesses.some(g => g.player.nationality === secret.nationality)
                ? secret.nationality
                : guesses.length >= 2 ? '¿De qué país es?' : '???'}
            </span>
          </div>
          <div className="gt-clue-tile">
            <span className="gt-clue-label">Posición</span>
            <span className="gt-clue-value">
              {secret.position}
            </span>
          </div>
        </div>
      </div>

      {/* ── Restart ── */}
      {gameState !== 'playing' && (
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <p className="gt-next-hint">Volvé mañana para el próximo jugador misterioso 🌙</p>
          <button
            className="home-btn-primary"
            onClick={() => window.location.reload()}
            id="btn-gt-restart"
          >
            🔄 Jugar de nuevo (otro jugador)
          </button>
        </div>
      )}
    </div>
  );
}
