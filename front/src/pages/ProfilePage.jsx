import { useState, useEffect } from 'react';
import { getMe } from '../api';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getMe();
        setUser(res.data);
      } catch (err) {
        console.log('Error loading profile:', err.response || err);
        setError('No se pudo cargar el perfil. Asegúrate de que el backend esté corriendo en http://localhost:5000');
      }
    };
    load();
  }, []);

  if (error) {
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

      <div className="profile-card">
        <div className="profile-avatar">
          {user.username.charAt(0).toUpperCase()}
        </div>

        <div className="profile-details">
          <h3 className="profile-name">{user.username}</h3>
          <p className="profile-email">{user.email}</p>
        </div>

        <div className="profile-stats">
          <div className="stat-item">
            <span className="stat-value">{user.groups_count}</span>
            <span className="stat-label">Grupos</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{user.total_predictions}</span>
            <span className="stat-label">Predicciones</span>
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
      </div>
    </>
  );
}
