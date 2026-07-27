import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMe, updateProfile, getUserProfile } from '../api';

export default function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ username: '', email: '' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Detailed statistics and matches states
  const [stats, setStats] = useState(null);
  const [matches, setMatches] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const load = async () => {
    try {
      const res = await getMe();
      setUser(res.data);
      setFormData({
        username: res.data.username,
        email: res.data.email,
      });

      // Fetch detailed match stats and matches history
      const statsRes = await getUserProfile(res.data.id, 1, 10);
      setStats(statsRes.data.stats);
      setMatches(statsRes.data.matches);
      setHasMore(statsRes.data.has_more);
    } catch (err) {
      if (err?.response?.status === 401) {
        navigate('/auth', { replace: true });
        return;
      }
      setError('No se pudo cargar el perfil.');
    }
  };

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/auth', { replace: true });
      return;
    }
    load();
  }, []);

  const handleLoadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const res = await getUserProfile(user.id, nextPage, 10);
      setMatches((prev) => [...prev, ...res.data.matches]);
      setHasMore(res.data.has_more);
      setPage(nextPage);
    } catch (err) {
      setError('No se pudieron cargar más partidos.');
    } finally {
      setLoadingMore(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setError('Tipo de archivo no válido. Solo se permiten: PNG, JPG, JPEG, GIF, WEBP');
        e.target.value = null;
        return;
      }

      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        setError('La imagen es demasiado grande. El tamaño máximo es 5MB.');
        e.target.value = null;
        return;
      }

      if (file.size < 1024) {
        setError('El archivo es demasiado pequeño. Selecciona una imagen válida.');
        e.target.value = null;
        return;
      }

      const img = new Image();
      const reader = new FileReader();

      reader.onloadend = () => {
        img.src = reader.result;
      };

      img.onload = () => {
        if (img.width > 4000 || img.height > 4000) {
          setError('La imagen es demasiado grande. Las dimensiones máximas son 4000x4000 píxeles.');
          e.target.value = null;
          return;
        }
        if (img.width < 50 || img.height < 50) {
          setError('La imagen es demasiado pequeña. Las dimensiones mínimas son 50x50 píxeles.');
          e.target.value = null;
          return;
        }

        setError('');
        setSelectedFile(file);
        setPreviewUrl(reader.result);
      };

      img.onerror = () => {
        setError('No se pudo cargar la imagen. Asegúrate de que sea un archivo válido.');
        e.target.value = null;
      };

      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      if (formData.username !== user.username) {
        const usernameRegex = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ_ .-]+$/;
        if (!usernameRegex.test(formData.username)) {
          setError("El nombre de usuario solo puede contener letras, números, espacios, puntos, guiones y guiones bajos (sin '@').");
          setLoading(false);
          return;
        }
      }

      const data = new FormData();
      data.append('username', formData.username);
      data.append('email', formData.email);
      if (selectedFile) {
        data.append('profile_picture', selectedFile);
      }

      await updateProfile(data);
      await load(); // Reload everything including updated stats

      setIsEditing(false);
      setSelectedFile(null);
      setPreviewUrl(null);
      setSuccessMessage('¡Perfil actualizado exitosamente!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.error || 'Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      username: user.username,
      email: user.email,
    });
    setSelectedFile(null);
    setPreviewUrl(null);
    setError('');
  };

  if (error && !user) {
    return (
      <>
        <h2 className="page-title"><span className="icon">👤</span> Mi Perfil</h2>
        <div className="error">{error}</div>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <h2 className="page-title"><span className="icon">👤</span> Mi Perfil</h2>
        <div className="card empty-state">
          <span className="empty-icon">⏳</span>
          <p>Cargando perfil...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <h2 className="page-title"><span className="icon">👤</span> Mi Perfil</h2>

      {successMessage && (
        <div className="success-message">{successMessage}</div>
      )}
      {error && (
        <div className="error">{error}</div>
      )}

      <div className="profile-card" style={{ marginBottom: 24 }}>
        {!isEditing ? (
          <>
            <div className="profile-avatar">
              {user.profile_picture ? (
                <img src={user.profile_picture} alt={user.username} />
              ) : (
                user.username.charAt(0).toUpperCase()
              )}
            </div>

            <div className="profile-details">
              <h3 className="profile-name">{user.username}</h3>
              <p className="profile-email">{user.email}</p>
            </div>

            <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
              ✏️ Editar Perfil
            </button>

            <div className="profile-stats">
              <div className="stat-item">
                <span className="stat-value">⭐ {user.points || 0}</span>
                <span className="stat-label">Puntos</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{user.groups_count}</span>
                <span className="stat-label">Grupos</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{user.played_matches_count || 0}</span>
                <span className="stat-label">Partidos</span>
              </div>
            </div>

            <div className="profile-meta">
              <div className="meta-row">
                <span className="meta-label">📧 Email</span>
                <span className="meta-value">{user.email}</span>
              </div>
              <div className="meta-row">
                <span className="meta-label">📅 Miembro desde</span>
                <span className="meta-value">{new Date(user.created_at).toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className="meta-row">
                <span className="meta-label">🆔 ID de usuario</span>
                <span className="meta-value">{user.id}</span>
              </div>
            </div>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="profile-edit-form">
            <div className="profile-avatar-edit">
              <div className="profile-avatar">
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" />
                ) : user.profile_picture ? (
                  <img src={user.profile_picture} alt={user.username} />
                ) : (
                  user.username.charAt(0).toUpperCase()
                )}
              </div>
              <label className="file-upload-label">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
                📷 Cambiar foto
              </label>
            </div>

            <div className="form-group">
              <label htmlFor="username">Nombre de usuario</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Guardando...' : '💾 Guardar Cambios'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={handleCancel} disabled={loading}>
                ❌ Cancelar
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Matches Statistics Dashboard */}
      {stats && (
        <>
          <div className="profile-stats-container">
            {/* Radial compliance */}
            <div className="effectiveness-card">
              <span className="effectiveness-title">Cumplimiento de Pago</span>
              <div className="radial-progress">
                <svg width="140" height="140">
                  <circle
                    className="circle-bg"
                    cx="70"
                    cy="70"
                    r="50"
                    strokeWidth="8"
                  />
                  <circle
                    className="circle-val"
                    cx="70"
                    cy="70"
                    r="50"
                    strokeWidth="8"
                    strokeDasharray="314.16"
                    strokeDashoffset={
                      314.16 - (stats.played_count > 0 ? (stats.paid_count / stats.played_count) : 1) * 314.16
                    }
                  />
                </svg>
                <div className="radial-progress-text">
                  <span className="radial-progress-percent">
                    {stats.played_count > 0 ? Math.round((stats.paid_count / stats.played_count) * 100) : 100}%
                  </span>
                  <span className="radial-progress-label">Al día</span>
                </div>
              </div>
              <p style={{ marginTop: '16px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Has pagado {stats.paid_count} de {stats.played_count} partidos jugados.
              </p>
            </div>

            {/* Metrics */}
            <div className="metrics-grid">
              <div className="metric-card exact-hits-card" style={{ background: 'rgba(16, 185, 129, 0.05)', borderColor: 'rgba(16, 185, 129, 0.15)' }}>
                <div className="metric-value" style={{ color: 'var(--accent-light)' }}>{stats.played_count}</div>
                <div className="metric-label">Partidos Jugados ⚽</div>
                <div className="metric-desc">Partidos con fecha pasada</div>
              </div>

              <div className="metric-card winner-hits-card" style={{ background: 'rgba(59, 130, 246, 0.05)', borderColor: 'rgba(59, 130, 246, 0.15)' }}>
                <div className="metric-value" style={{ color: '#3b82f6' }}>{stats.upcoming_count}</div>
                <div className="metric-label">Próximos Partidos 📅</div>
                <div className="metric-desc">Partidos programados</div>
              </div>




            </div>
          </div>

          {/* Favorite Fields */}
          {stats.favorite_fields && stats.favorite_fields.length > 0 && (
            <div className="card" style={{ padding: '16px 20px', marginBottom: '24px' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>🏟️ Tus Canchas Más Visitadas</h4>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {stats.favorite_fields.map((field, idx) => (
                  <span
                    key={idx}
                    style={{
                      fontSize: '0.75rem',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid var(--border)',
                      padding: '6px 12px',
                      borderRadius: '20px',
                      color: 'var(--text-primary)',
                      fontWeight: '600'
                    }}
                  >
                    🏅 {field}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Matches List */}
          <div className="profile-predictions-section">
            <h3 className="profile-predictions-header">
              <span>⚽</span> Tu Historial de Partidos ({matches.length})
            </h3>

            {matches.length === 0 ? (
              <div className="card empty-state" style={{ border: 'none', background: 'transparent' }}>
                <span className="empty-icon">⚽</span>
                <p>No tienes partidos registrados en tus grupos.</p>
              </div>
            ) : (
              <div className="profile-predictions-list">
                {matches.map((m) => {
                  const matchDate = new Date(m.match_date);

                  return (
                    <div key={m.id} className="profile-prediction-item" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 16, marginBottom: 12 }}>
                      <div className="profile-pred-match" style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: 10, marginBottom: 10 }}>
                        <div className="profile-pred-teams" style={{ fontSize: '1rem', fontWeight: '700' }}>
                          {m.title}
                        </div>
                        <div className="profile-pred-date" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {matchDate.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })}
                          {' · '}
                          {matchDate.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>

                      <div className="profile-pred-content" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            🏟️ <strong>Cancha:</strong> {m.field_name}
                          </span>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            👥 <strong>Grupo:</strong> {m.group_name}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)' }}>Tu parte</span>
                            <span style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--gold-light)' }}>
                              ${m.cost_per_person.toLocaleString('es-AR')}
                            </span>
                          </div>

                          <div>
                            {m.is_past ? (
                              m.paid ? (
                                <span className="profile-pred-badge exact" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-light)', border: '1px solid rgba(16,185,129,0.25)' }}>
                                  ✅ Pagado
                                </span>
                              ) : (
                                <span className="profile-pred-badge miss" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.25)' }}>
                                  ❌ Impago
                                </span>
                              )
                            ) : (
                              <span className="profile-pred-badge pending" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.25)' }}>
                                ⏳ Próximo
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Load more button */}
            {hasMore && (
              <button
                className="btn btn-primary"
                onClick={handleLoadMore}
                disabled={loadingMore}
                style={{ marginTop: '20px', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
              >
                {loadingMore ? (
                  <>
                    <div className="match-detail-spinner" style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.2)', borderTopColor: '#fff', margin: 0 }} />
                    Cargando más...
                  </>
                ) : (
                  'Cargar más partidos'
                )}
              </button>
            )}
          </div>
        </>
      )}
    </>
  );
}
