import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMe, updateProfile } from '../api';

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

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/auth', { replace: true });
      return;
    }
    const load = async () => {
      try {
        const res = await getMe();
        setUser(res.data);
        setFormData({
          username: res.data.username,
          email: res.data.email,
        });
      } catch (err) {
        if (err?.response?.status === 401) {
          navigate('/auth', { replace: true });
          return;
        }
        setError('No se pudo cargar el perfil.');
      }
    };
    load();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setError('Tipo de archivo no válido. Solo se permiten: PNG, JPG, JPEG, GIF, WEBP');
        e.target.value = null;
        return;
      }

      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        setError('La imagen es demasiado grande. El tamaño máximo es 5MB.');
        e.target.value = null;
        return;
      }

      // Check minimum size
      if (file.size < 1024) { // 1KB minimum
        setError('El archivo es demasiado pequeño. Selecciona una imagen válida.');
        e.target.value = null;
        return;
      }

      // Validate image dimensions
      const img = new Image();
      const reader = new FileReader();

      reader.onloadend = () => {
        img.src = reader.result;
      };

      img.onload = () => {
        // Check dimensions
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

        // All validations passed
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

      // Always include username and email so FormData is never empty
      data.append('username', formData.username);
      data.append('email', formData.email);
      if (selectedFile) {
        data.append('profile_picture', selectedFile);
      }

      const res = await updateProfile(data);

      // Reload user data
      const updatedUser = await getMe();
      setUser(updatedUser.data);
      setFormData({
        username: updatedUser.data.username,
        email: updatedUser.data.email,
      });

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

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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

      <div className="profile-card">
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
    </>
  );
}
