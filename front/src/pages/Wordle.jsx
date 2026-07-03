import { useState, useEffect, useCallback } from 'react';
import { saveWordleResult, getWordleHistory } from '../api';

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
  const [history, setHistory] = useState([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [showCalendar, setShowCalendar] = useState(false);

  // Valid player list and error toast states
  const [validPlayers, setValidPlayers] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Load valid player names from public folder
  useEffect(() => {
    fetch('/players.json')
      .then((res) => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setValidPlayers(data);
        } else {
          throw new Error('Data is not a JSON array');
        }
      })
      .catch((err) => {
        console.error('Error loading valid players list, falling back to candidates list:', err);
        setValidPlayers(PLAYERS);
      });
  }, []);

  const showWordleError = useCallback((msg) => {
    setErrorMessage(msg);
    setShake(true);
    setTimeout(() => setShake(false), 500);
    if (window.wordleErrorTimer) {
      clearTimeout(window.wordleErrorTimer);
    }
    window.wordleErrorTimer = setTimeout(() => {
      setErrorMessage('');
    }, 2500);
  }, []);

  // Cargar historial al iniciar
  useEffect(() => {
    const loadHistory = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const response = await getWordleHistory();
        setHistory(response.data.history || []);
        setCurrentStreak(response.data.current_streak || 0);
      } catch (error) {
        console.error('Error loading wordle history:', error);
      }
    };
    loadHistory();
  }, []);

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

  const submitGuess = useCallback(async () => {
    if (current.length !== wordLen || gameState !== 'playing') return;

    // Normalizar la guess para contrastar con la lista de jugadores
    const normalizedGuess = current
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase()
      .replace(/Ñ/g, 'N')
      .replace(/[^A-Z]/g, '');

    // Validar si el jugador existe
    if (validPlayers === null) {
      showWordleError('Cargando lista de jugadores...');
      return;
    }

    if (!validPlayers.includes(normalizedGuess)) {
      showWordleError('El jugador no existe');
      return;
    }

    const hints = computeHints(current, secret);
    const newGuesses = [...guesses, { word: current, hints }];
    setGuesses(newGuesses);
    setCurrent('');

    let won = false;
    let finished = false;

    if (current === secret) {
      setGameState('won');
      won = true;
      finished = true;
    } else if (newGuesses.length >= MAX_GUESSES) {
      setGameState('lost');
      won = false;
      finished = true;
    }

    // Guardar resultado si el juego terminó
    if (finished) {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          await saveWordleResult(won, newGuesses.length, secret);
          // Recargar historial
          const response = await getWordleHistory();
          setHistory(response.data.history || []);
          setCurrentStreak(response.data.current_streak || 0);
        } catch (error) {
          console.error('Error saving wordle result:', error);
        }
      }
    }
  }, [current, wordLen, gameState, guesses, secret, validPlayers, showWordleError]);

  const handleKey = useCallback((key) => {
    if (gameState !== 'playing') return;
    const k = key.toUpperCase();
    if (k === 'BACKSPACE' || k === '⌫') {
      setCurrent((c) => c.slice(0, -1));
    } else if (k === 'ENTER') {
      if (current.length < wordLen) {
        showWordleError('Faltan letras');
        return;
      }
      submitGuess();
    } else if (/^[A-ZÑ]$/.test(k) && current.length < wordLen) {
      setCurrent((c) => c + k);
    }
  }, [gameState, current, wordLen, submitGuess, showWordleError]);

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

  // Generar últimos 30 días para el calendario
  const generateCalendarDays = () => {
    const days = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const record = history.find(h => h.date === dateStr);
      days.push({
        date: dateStr,
        won: record?.won || false,
        played: !!record,
      });
    }
    return days;
  };

  const calendarDays = generateCalendarDays();

  return (
    <div className="wordle-page">
      {errorMessage && (
        <div className="wordle-error-toast">
          {errorMessage}
        </div>
      )}
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
          <div className="wordle-stat-chip" style={{ cursor: 'pointer' }} onClick={() => setShowCalendar(!showCalendar)}>
            <span className="wordle-stat-num">{currentStreak}</span>
            <span className="wordle-stat-label">Dias</span>
          </div>
        </div>

        {/* Calendario de racha */}
        {showCalendar && (
          <div className="wordle-calendar">
            <h3 className="wordle-calendar-title">Historial (últimos 30 días)</h3>
            <div className="wordle-calendar-grid">
              {calendarDays.map((day, idx) => {
                const dayNum = new Date(day.date).getDate();
                return (
                  <div
                    key={idx}
                    className={`wordle-calendar-day ${day.played ? (day.won ? 'won' : 'lost') : 'empty'}`}
                    title={day.played ? `${day.date}: ${day.won ? 'Ganaste ✅' : 'Perdiste ❌'}` : day.date}
                  >
                    <span>{dayNum}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
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