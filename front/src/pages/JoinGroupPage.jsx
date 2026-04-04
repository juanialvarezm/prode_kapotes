import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createGroup, joinGroup } from '../api';

export default function JoinGroupPage({ onGroupChange }) {
  const navigate = useNavigate();

  // Create group state
  const [newGroup, setNewGroup] = useState({ name: '', description: '' });

  // Join group state
  const [joinId, setJoinId] = useState('');

  // Feedback
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!newGroup.name) return setError('Nombre del grupo requerido');
    setLoading(true);
    try {
      await createGroup(newGroup);
      setSuccess(`✅ Grupo "${newGroup.name}" creado exitosamente.`);
      setNewGroup({ name: '', description: '' });
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
      await joinGroup(joinId);
      setSuccess('✅ ¡Te uniste al grupo!');
      setJoinId('');
      onGroupChange?.();
      navigate('/groups');
    } catch (err) {
      setError(err?.response?.data?.error || 'No se pudo unir al grupo. Asegúrate de que el backend esté corriendo en http://localhost:5000');
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
            <div className="action-card-icon join">🔗</div>
            <h3>Unirse a un grupo</h3>
          </div>
          <form onSubmit={handleJoin}>
            <input
              placeholder="ID del grupo"
              value={joinId}
              onChange={(e) => setJoinId(e.target.value)}
            />
            <button type="submit" className="btn-secondary" disabled={loading}>
              {loading ? 'Uniéndose...' : 'Unirse'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
