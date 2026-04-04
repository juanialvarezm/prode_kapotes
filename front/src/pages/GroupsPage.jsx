import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyGroups, getGroupById } from '../api';

export default function GroupsPage() {
  const [groups, setGroups] = useState([]);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();

  const load = async () => {
    setError('');
    try {
      const res = await getMyGroups();
      const loadedGroups = res.data.groups || [];
      setGroups(loadedGroups);
      if (loadedGroups.length > 0 && !selected) {
        const savedId = localStorage.getItem('groupId');
        const defaultGroup = loadedGroups.find(g => String(g.id) === savedId) || loadedGroups[0];
        onSelectGroup(defaultGroup.id);
      }
    } catch (err) {
      setError('No se pudo cargar los grupos. Asegúrate de que el backend esté corriendo en http://localhost:5000');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onSelectGroup = async (id) => {
    setError('');
    localStorage.setItem('groupId', String(id));
    try {
      const res = await getGroupById(id);
      setSelected(res.data);
    } catch {
      setError('No se encontró el grupo');
    }
  };

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h2 className="page-title" style={{ marginBottom: 0 }}><span className="icon">🏆</span> Mis Grupos</h2>
        <button className="btn-primary" style={{ width: 'auto', padding: '8px 20px' }} onClick={() => navigate('/join-group')}>
          ➕ Nuevo grupo
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {groups.length > 0 ? (
        <div className="card">
          <ul className="group-list">
            {groups.map((g) => (
              <li
                key={g.id}
                className={selected?.id === g.id ? 'active' : ''}
                onClick={() => onSelectGroup(g.id)}
              >
                {g.name}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="card empty-state">
          <span className="empty-icon">📋</span>
          <p>No tenés grupos todavía.</p>
        </div>
      )}

      {selected && (
        <div className="group-info-card" style={{ marginTop: 16 }}>
          <h4>🎯 Grupo activo: {selected.name}</h4>
          {selected.description && <p>{selected.description}</p>}
          <span className="group-id-badge">ID: {selected.id}</span>

          {selected.members && selected.members.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <h4 style={{ fontSize: '0.9rem', marginBottom: 8 }}>👥 Miembros ({selected.members.length})</h4>
              <div className="user-chips">
                {selected.members.map((m) => (
                  <span key={m.id} className="user-chip">{m.username}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
