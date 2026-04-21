import { useState, useEffect, useCallback } from 'react';

// ── Lista de jugadores (apellidos, mayúsculas) ──────────────────────────
const PLAYERS = [
  'MESSI', 'NEYMAR', 'MBAPPE', 'MODRIC', 'SUAREZ',
  'TORRES', 'HAZARD', 'MULLER', 'PIQUE', 'JAMES',
  'PIRLO', 'XHAKA', 'SILVA', 'ALVES', 'POGBA',
  'KANTE', 'GRIEZMANN', 'DYBALA', 'LUKAKU', 'BENZEMA',
];

const MAX_GUESSES = 6;

// ── Lógica de hints ───────────────────────────────────────────────────────
function computeHints(guess, secret) {
  const result = Array(guess.length).fill('wrong');
  const secretArr = secret.split('');
  const guessArr = guess.split('');

  // 1° pasada: letras en posición correcta (verde)
  for (let i = 0; i < guess.length; i++) {
    if (guessArr[i] === secretArr[i]) {
      result[i] = 'correct';
      secretArr[i] = null;
      guessArr[i] = null;
    }
  }

  // 2° pasada: letras que existen pero en posición incorrecta (amarillo)
  for (let i = 0; i < guess.length; i++) {
    if (guessArr[i] === null) continue;
    const idx = secretArr.indexOf(guessArr[i]);
    if (idx !== -1) {
      result[i] = 'partial';
      secretArr[idx] = null;
    }
  }

  return result;
}

// ── Teclado en pantalla ───────────────────────────────────────────────────
const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ñ'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '⌫'],
];

export default function Wordle() {
  const [secret] = useState(() => {
    const candidates = PLAYERS;
    return candidates[Math.floor(Math.random() * candidates.length)];
  });

  const wordLen = secret.length;

  const [guesses, setGuesses] = useState([]); // [{word, hints}]
  const [current, setCurrent] = useState(''); // letra a letra
  const [gameState, setGameState] = useState('playing'); // 'playing'|'won'|'lost'
  const [shake, setShake] = useState(false);

  // Mapa de estado de cada letra del teclado
  const letterStatus = {};
  for (const { word, hints } of guesses) {
    for (let i = 0; i < word.length; i++) {
      const prev = letterStatus[word[i]];
      if (prev === 'correct') continue;
      if (hints[i] === 'correct') { letterStatus[word[i]] = 'correct'; continue; }
      if (prev === 'partial') continue;
      letterStatus[word[i]] = hints[i];
    }
  }

  const submitGuess = useCallback(() => {
    if (current.length !== wordLen || gameState !== 'playing') return;

    const hints = computeHints(current, secret);
    const newGuesses = [...guesses, { word: current, hints }];
    setGuesses(newGuesses);
    setCurrent('');

    if (current === secret) {
      setGameState('won');
    } else if (newGuesses.length >= MAX_GUESSES) {
      setGameState('lost');
    }
  }, [current, wordLen, gameState, guesses, secret]);

  const handleKey = useCallback((key) => {
    if (gameState !== 'playing') return;
    const k = key.toUpperCase();
    if (k === 'BACKSPACE' || k === '⌫') {
      setCurrent((c) => c.slice(0, -1));
    } else if (k === 'ENTER') {
      if (current.length < wordLen) {
        setShake(true);
        setTimeout(() => setShake(false), 500);
        return;
      }
      submitGuess();
    } else if (/^[A-ZÑ]$/.test(k) && current.length < wordLen) {
      setCurrent((c) => c + k);
    }
  }, [gameState, current, wordLen, submitGuess]);

  // Teclado físico
  useEffect(() => {
    const handler = (e) => handleKey(e.key);
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleKey]);

  // ── Render rows ──────────────────────────────────────────────────────
  const rows = [];

  // Guesses ya enviadas
  for (const { word, hints } of guesses) {
    rows.push({ word, hints, type: 'done' });
  }

  // Fila activa
  if (gameState === 'playing') {
    rows.push({ word: current.padEnd(wordLen, ' '), hints: null, type: 'active' });
  }

  // Filas vacías restantes
  const emptyCount = MAX_GUESSES - rows.length;
  for (let i = 0; i < emptyCount; i++) {
    rows.push({ word: ' '.repeat(wordLen), hints: null, type: 'empty' });
  }

  const CELL_STATUS_STYLE = {
    correct: { background: 'rgba(16,185,129,0.30)', borderColor: 'rgba(16,185,129,0.7)', color: '#34d399' },
    partial: { background: 'rgba(245,158,11,0.25)', borderColor: 'rgba(245,158,11,0.7)', color: '#fbbf24' },
    wrong: { background: 'rgba(100,116,139,0.2)', borderColor: 'rgba(100,116,139,0.5)', color: '#94a3b8' },
  };

  const KB_STATUS_STYLE = {
    correct: { background: 'rgba(16,185,129,0.35)', borderColor: 'rgba(16,185,129,0.8)', color: '#34d399' },
    partial: { background: 'rgba(245,158,11,0.3)', borderColor: 'rgba(245,158,11,0.8)', color: '#fbbf24' },
    wrong: { background: 'rgba(30,41,59,0.9)', borderColor: 'rgba(30,41,59,0.9)', color: '#475569' },
  };

  return (
    <div className="wordle-page">
      {/* Header */}
      <div className="wordle-header">
        <div className="wordle-title-row">
          <span className="wordle-icon">⚽</span>
          <div>
            <h1 className="wordle-title">
              Fut<span className="wordle-title-highlight">Wordle</span>
            </h1>
            <p className="wordle-subtitle">Adiviná el apellido del jugador en {MAX_GUESSES} intentos</p>
          </div>
        </div>

        <div className="wordle-stats">
          <div className="wordle-stat-chip">
            <span className="wordle-stat-num">{guesses.length}</span>
            <span className="wordle-stat-label">Intentos</span>
          </div>
          <div className="wordle-stat-chip">
            <span className="wordle-stat-num">{wordLen}</span>
            <span className="wordle-stat-label">Letras</span>
          </div>
          <div className="wordle-stat-chip">
            <span className="wordle-stat-num">{MAX_GUESSES - guesses.length}</span>
            <span className="wordle-stat-label">Restantes</span>
          </div>
        </div>
      </div>

      {/* Leyenda */}
      <div className="wordle-legend">
        <span className="wordle-legend-item correct">✅ Posición correcta</span>
        <span className="wordle-legend-item partial">🟡 Letra existe, posición incorrecta</span>
        <span className="wordle-legend-item wrong">⬜ Letra no existe</span>
      </div>

      {/* Mensaje de resultado */}
      {gameState !== 'playing' && (
        <div className={`wordle-result-banner ${gameState}`}>
          {gameState === 'won'
            ? `🎉 ¡Correcto! Era ${secret} — en ${guesses.length} intento${guesses.length > 1 ? 's' : ''}`
            : `Era: ${secret} — ¡Mejor suerte la próxima!`}
        </div>
      )}

      {/* Grid de letras */}
      <div className="wordle-grid-wrap">
        <div className="wordle-grid" style={{ '--word-len': wordLen }}>
          {rows.map((row, ri) => (
            <div
              key={ri}
              className={[
                'wordle-grid-row',
                row.type === 'active' && shake ? 'wordle-shake' : '',
              ].join(' ')}
            >
              {row.word.split('').map((letter, ci) => {
                const hint = row.hints ? row.hints[ci] : null;
                const isActive = row.type === 'active';
                const isFilled = isActive && letter.trim() !== '';

                const cellStyle = hint
                  ? CELL_STATUS_STYLE[hint]
                  : isFilled
                    ? { background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.3)', color: 'var(--text-primary)' }
                    : { background: 'transparent', borderColor: 'var(--glass-border)', color: 'transparent' };

                return (
                  <div
                    key={ci}
                    className={['wordle-letter-cell', hint ? 'wordle-cell-revealed' : ''].join(' ')}
                    style={cellStyle}
                  >
                    {letter.trim()}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Teclado en pantalla */}
      <div className="wordle-keyboard">
        {KEYBOARD_ROWS.map((row, ri) => (
          <div key={ri} className="wordle-keyboard-row">
            {row.map((key) => {
              const status = letterStatus[key];
              const style = status ? KB_STATUS_STYLE[status] : {};
              const isWide = key === 'ENTER' || key === '⌫';
              return (
                <button
                  key={key}
                  className={['wordle-key', isWide ? 'wordle-key-wide' : ''].join(' ')}
                  style={style}
                  onClick={() => handleKey(key)}
                  id={`key-${key}`}
                >
                  {key}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Reiniciar */}
      {gameState !== 'playing' && (
        <div style={{ textAlign: 'center' }}>
          <button
            className="home-btn-primary"
            onClick={() => window.location.reload()}
            id="btn-wordle-restart"
          >
            🔄 Jugar de nuevo
          </button>
        </div>
      )}
    </div>
  );
}