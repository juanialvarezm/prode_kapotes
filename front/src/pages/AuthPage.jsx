import { useState } from 'react';
import { login, register } from '../api';

/* Inline SVG football — no external dependency needed */
function FootballIcon() {
  return (
    <svg className="auth-ball" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="ballGrad" cx="40%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#f1f5f9" />
          <stop offset="100%" stopColor="#94a3b8" />
        </radialGradient>
        <filter id="ballShadow">
          <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#10b981" floodOpacity="0.3" />
        </filter>
      </defs>
      <circle cx="50" cy="50" r="46" fill="url(#ballGrad)" stroke="#64748b" strokeWidth="1.5" filter="url(#ballShadow)" />
      {/* Classic pentagon pattern */}
      <polygon points="50,22 61,33 57,46 43,46 39,33" fill="#1e293b" stroke="#334155" strokeWidth="0.8" />
      <polygon points="27,50 33,38 43,46 39,60 28,60" fill="#1e293b" stroke="#334155" strokeWidth="0.8" />
      <polygon points="73,50 67,38 57,46 61,60 72,60" fill="#1e293b" stroke="#334155" strokeWidth="0.8" />
      <polygon points="39,70 43,60 57,60 61,70 50,78" fill="#1e293b" stroke="#334155" strokeWidth="0.8" />
      <polygon points="50,22 39,33 27,28" fill="none" stroke="#cbd5e1" strokeWidth="0.5" />
      <polygon points="50,22 61,33 73,28" fill="none" stroke="#cbd5e1" strokeWidth="0.5" />
      <polygon points="27,50 22,38 33,38" fill="none" stroke="#cbd5e1" strokeWidth="0.5" />
      <polygon points="73,50 78,38 67,38" fill="none" stroke="#cbd5e1" strokeWidth="0.5" />
      <polygon points="28,60 22,72 39,70" fill="none" stroke="#cbd5e1" strokeWidth="0.5" />
      <polygon points="72,60 78,72 61,70" fill="none" stroke="#cbd5e1" strokeWidth="0.5" />
      <polygon points="50,78 40,90 60,90" fill="none" stroke="#cbd5e1" strokeWidth="0.5" />
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
