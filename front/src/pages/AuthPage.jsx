import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { login, register, verifyEmail } from '../api';

/* Inline SVG football — no external dependency needed */
// function FootballIcon() {
//   return (
//     <svg className="auth-ball" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
//       <defs>
//         <radialGradient id="ballGrad" cx="40%" cy="35%" r="60%">
//           <stop offset="0%" stopColor="#ffffff" />
//           <stop offset="60%" stopColor="#f5f5f5" />
//           <stop offset="100%" stopColor="#d4d4d4" />
//         </radialGradient>
//       </defs>

//       {/* Pelota blanca base */}
//       <circle cx="60" cy="60" r="50" fill="url(#ballGrad)" stroke="#999" strokeWidth="1" />

//       {/* Pentágono negro central */}
//       <polygon 
//         points="60,25 75,35 70,52 50,52 45,35" 
//         fill="#000000" 
//         stroke="#333" 
//         strokeWidth="1.5"
//       />

//       {/* Hexágonos blancos conectados */}
//       <polygon 
//         points="45,35 50,52 38,62 28,55 32,40" 
//         fill="#ffffff" 
//         stroke="#000000" 
//         strokeWidth="1.5"
//       />
//       <polygon 
//         points="75,35 82,40 88,55 78,62 70,52" 
//         fill="#ffffff" 
//         stroke="#000000" 
//         strokeWidth="1.5"
//       />
//       <polygon 
//         points="50,52 70,52 72,68 60,78 48,68" 
//         fill="#ffffff" 
//         stroke="#000000" 
//         strokeWidth="1.5"
//       />

//       {/* Pentágonos negros laterales */}
//       <polygon 
//         points="28,55 38,62 34,76 22,75 20,62" 
//         fill="#000000" 
//         stroke="#333" 
//         strokeWidth="1.5"
//       />
//       <polygon 
//         points="88,55 98,62 96,75 84,76 78,62" 
//         fill="#000000" 
//         stroke="#333" 
//         strokeWidth="1.5"
//       />

//       {/* Highlight para dar volumen */}
//       <ellipse 
//         cx="45" 
//         cy="35" 
//         rx="15" 
//         ry="12" 
//         fill="#ffffff" 
//         opacity="0.25"
//       />
//     </svg>
//   );
// }

export default function AuthPage({ onSuccess }) {
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(!!searchParams.get('token'));
  const [registered, setRegistered] = useState(false);
  const [verified, setVerified] = useState(false);

  // Auto-verify when arriving from email link (/auth?token=xxx)
  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) return;
    setLoading(true);
    verifyEmail(token)
      .then((res) => {
        const accessToken = res.data.access_token;
        if (accessToken) {
          localStorage.setItem('token', accessToken);
          onSuccess?.();
        } else {
          // Verified but no token returned — ask user to log in
          setError('');
          setVerified(true);
          setMode('login');
          setLoading(false);
        }
      })
      .catch((err) => {
        setError(err?.response?.data?.error || 'El link de verificación es inválido o ya fue utilizado.');
        setLoading(false);
      });
  }, []);

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
        setRegistered(true);
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

        <h2 className="auth-title">
          <span className="brand-gradient">Prode Kapotes</span>
        </h2>

        {verified && (
          <p style={{ color: '#22c55e', textAlign: 'center', marginBottom: '8px', fontWeight: 600 }}>
            ✅ ¡Email verificado! Ya podés iniciar sesión.
          </p>
        )}

        {registered ? (
          <>
            <p style={{ fontSize: '2.5rem', margin: '12px 0', textAlign: 'center' }}>📧</p>
            <p className="auth-subtitle" style={{ textAlign: 'center' }}>
              ¡Registro exitoso! Te enviamos un email de verificación a <strong>{form.email}</strong>.
              Revisá tu casilla (y la carpeta de spam) para activar tu cuenta.
            </p>
            <button
              className="auth-btn"
              style={{ marginTop: '16px' }}
              onClick={() => { setRegistered(false); setMode('login'); setForm({ username: '', email: '', password: '' }); }}
            >
              Ir al login
            </button>
          </>
        ) : (
          <>
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
              <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}>
                {mode === 'login' ? 'Registrarse' : 'Iniciar sesión'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
