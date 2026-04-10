import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createGroup, joinGroup } from '../api';

export default function JoinGroupPage({ onGroupChange }) {
  const navigate = useNavigate();

  // Create group state
  const [newGroup, setNewGroup] = useState({ name: '', description: '' });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  // Join group state
  const [joinId, setJoinId] = useState('');

  // Feedback
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAvatarSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setAvatarPreview(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!newGroup.name) return setError('Nombre del grupo requerido');
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', newGroup.name);
      formData.append('description', newGroup.description);
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }
      await createGroup(formData);
      setSuccess(`✅ Grupo "${newGroup.name}" creado exitosamente.`);
      setNewGroup({ name: '', description: '' });
      setAvatarFile(null);
      setAvatarPreview(null);
      onGroupChange?.();
      navigate('/groups');
    } catch (err) {
      console.log('Error creating group:', err.response || err);
      setError(err?.response?.data?.error || err.message || 'No se pudo crear el grupo. Asegúrate de que el backend esté corriendo en http://localhost:5000');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!joinId) return setError('Ingresá el ID del grupo');
    setLoading(true);
    try {
      const res = await joinGroup(joinId);
      const msg = res.data.message || '';
      if (msg.includes('Already member')) {
        setSuccess('✅ Ya sos miembro de este grupo.');
      } else if (msg.includes('already pending')) {
        setSuccess('⏳ Ya tenés una solicitud pendiente para este grupo.');
      } else {
        setSuccess('📨 Solicitud enviada. Esperando aprobación del administrador del grupo.');
      }
      setJoinId('');
    } catch (err) {
      setError(err?.response?.data?.error || 'No se pudo enviar la solicitud. Asegúrate de que el backend esté corriendo en http://localhost:5000');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h2 className="page-title"><span className="icon">🏆</span> Unirse o Crear Grupo</h2>
      <p className="page-subtitle">Necesitás estar en un grupo para predecir partidos y usar la app.</p>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <div className="groups-actions">
        {/* Create Group */}
        <div className="action-card">
          <div className="action-card-header">
            <div className="action-card-icon create">➕</div>
            <h3>Crear grupo</h3>
          </div>
          <form onSubmit={handleCreate}>
            {/* Avatar upload */}
            <div className="avatar-upload-area">
              <label className="avatar-upload-trigger">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Preview" className="avatar-preview-img" />
                ) : (
                  <div className="avatar-placeholder">
                    <span>📷</span>
                    <small>Foto de perfil</small>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarSelect}
                  style={{ display: 'none' }}
                />
              </label>
            </div>

            <input
              placeholder="Nombre del grupo"
              value={newGroup.name}
              onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
            />
            <input
              placeholder="Descripción (opcional)"
              value={newGroup.description}
              onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
            />
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Creando...' : 'Crear grupo'}
            </button>
          </form>
        </div>

        {/* Join Group */}
        <div className="action-card">
          <div className="action-card-header">
            <div className="action-card-icon join">🔒</div>
            <h3>Solicitar unirse a un grupo</h3>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 12 }}>
            Los grupos son privados. Tu solicitud será revisada por el administrador.
          </p>
          <form onSubmit={handleJoin}>
            <input
              placeholder="ID del grupo"
              value={joinId}
              onChange={(e) => setJoinId(e.target.value)}
            />
            <button type="submit" className="btn-secondary" disabled={loading}>
              {loading ? 'Enviando...' : '📨 Enviar solicitud'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
