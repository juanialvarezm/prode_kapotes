import { useState } from 'react';
import { login, register } from '../api';

/* Inline SVG football — no external dependency needed */
function FootballIcon() {
  return (
    <svg className="auth-ball" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="ballGrad" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="70%" stopColor="#f0f0f0" />
          <stop offset="100%" stopColor="#d0d0d0" />
        </radialGradient>
        <filter id="ballShadow">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
          <feOffset dx="2" dy="3" result="offsetblur" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.4" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Pelota base */}
      <circle cx="50" cy="50" r="45" fill="url(#ballGrad)" filter="url(#ballShadow)" />

      {/* Pentágono central negro */}
      <path d="M 50,15 L 62,24 L 57,38 L 43,38 L 38,24 Z" fill="#1a1a1a" stroke="#000000" strokeWidth="0.5" />

      {/* Hexágonos blancos alrededor del pentágono central */}
      <path d="M 50,15 L 38,24 L 35,18 L 40,10 L 50,10 L 55,10 L 60,10 L 65,18 L 62,24 Z" fill="#ffffff" stroke="#1a1a1a" strokeWidth="0.8" />
      <path d="M 38,24 L 43,38 L 32,45 L 22,40 L 25,28 Z" fill="#ffffff" stroke="#1a1a1a" strokeWidth="0.8" />
      <path d="M 62,24 L 75,28 L 78,40 L 68,45 L 57,38 Z" fill="#ffffff" stroke="#1a1a1a" strokeWidth="0.8" />

      {/* Pentágonos negros laterales */}
      <path d="M 22,40 L 32,45 L 28,58 L 18,56 L 16,44 Z" fill="#1a1a1a" stroke="#000000" strokeWidth="0.5" />
      <path d="M 78,40 L 84,44 L 82,56 L 72,58 L 68,45 Z" fill="#1a1a1a" stroke="#000000" strokeWidth="0.5" />

      {/* Hexágonos blancos inferiores */}
      <path d="M 43,38 L 57,38 L 60,52 L 50,60 L 40,52 Z" fill="#ffffff" stroke="#1a1a1a" strokeWidth="0.8" />
      <path d="M 32,45 L 40,52 L 36,66 L 26,64 L 28,58 Z" fill="#ffffff" stroke="#1a1a1a" strokeWidth="0.8" />
      <path d="M 68,45 L 72,58 L 74,64 L 64,66 L 60,52 Z" fill="#ffffff" stroke="#1a1a1a" strokeWidth="0.8" />

      {/* Pentágono negro inferior */}
      <path d="M 40,52 L 50,60 L 60,52 L 64,66 L 50,75 L 36,66 Z" fill="#1a1a1a" stroke="#000000" strokeWidth="0.5" />

      {/* Detalles de sombreado */}
      <ellipse cx="35" cy="28" rx="8" ry="6" fill="#ffffff" opacity="0.3" />
    </svg>
  );
}

export default function AuthPage({ onSuccess }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'register') {
        await register({ username: form.username, email: form.email, password: form.password });
        setMode('login');
      } else {
        const response = await login({ username: form.username, password: form.password });
        localStorage.setItem('token', response.data.access_token);
        onSuccess?.();
      }
    } catch (err) {
      setError(err?.response?.data?.error || 'Ocurrió un error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-ball-container">
          <FootballIcon />
        </div>

        <h2 className="auth-title">
          <span className="brand-gradient">Prode Kapotes</span>
        </h2>
        <p className="auth-subtitle">
          {mode === 'login' ? 'Ingresá a tu cuenta' : 'Creá tu cuenta'}
        </p>

        <form onSubmit={submit}>
          <label>Usuario</label>
          <input
            name="username"
            value={form.username}
            onChange={handleChange}
            placeholder="Tu nombre de usuario"
            required
          />

          {mode === 'register' && (
            <>
              <label>Email</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="tu@email.com"
                required
              />
            </>
          )}

          <label>Contraseña</label>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="••••••••"
            required
          />

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading
              ? '⏳ Cargando...'
              : mode === 'login'
                ? '🚀 Ingresar'
                : '✨ Registrarme'}
          </button>
        </form>

        {error && <div className="error">{error}</div>}

        <div className="auth-toggle">
          {mode === 'login' ? '¿No tenés cuenta?' : '¿Ya tenés cuenta?'}
          <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
            {mode === 'login' ? 'Registrarse' : 'Iniciar sesión'}
          </button>
        </div>
      </div>
    </div>
  );
}
