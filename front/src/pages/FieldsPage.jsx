import { useEffect, useState } from 'react';
import { getFootballFields } from '../api';

const ZONES = ['Todos', 'CABA', 'GBA Norte', 'GBA Sur', 'GBA Oeste'];
const TYPES = ['Todos', 'F5', 'F7', 'F8', 'F11'];

export default function FieldsPage() {
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter states
  const [search, setSearch] = useState('');
  const [selectedZone, setSelectedZone] = useState('Todos');
  const [selectedType, setSelectedType] = useState('Todos');
  
  // Pagination states
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [total, setTotal] = useState(0);
  
  // Modal state
  const [selectedField, setSelectedField] = useState(null);

  const fetchFields = async (pageNum = 1, append = false) => {
    if (pageNum === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setError('');
    try {
      const filters = { page: pageNum, per_page: 12 };
      if (search) filters.q = search;
      if (selectedZone !== 'Todos') filters.zone = selectedZone;
      if (selectedType !== 'Todos') filters.type = selectedType;
      
      const res = await getFootballFields(filters);
      const data = res.data;
      
      if (append) {
        setFields((prev) => [...prev, ...data.fields]);
      } else {
        setFields(data.fields || []);
      }
      setHasMore(data.has_more || false);
      setTotal(data.total || 0);
      setPage(pageNum);
    } catch (err) {
      setError('No se pudieron cargar los complejos deportivos.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Fetch when filters change (with a minor debounce for search)
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchFields(1, false);
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [search, selectedZone, selectedType]);

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchFields(page + 1, true);
    }
  };

  const handleOpenGoogleMaps = (address) => {
    const encodedAddress = encodeURIComponent(address + ", Buenos Aires, Argentina");
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
  };

  const handleWhatsApp = (phone, name) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(`Hola, te consulto desde Prode Kapotes por disponibilidad para reservar en ${name}.`);
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h2 className="page-title" style={{ marginBottom: 0 }}><span className="icon">🏟️</span> Canchas de Fútbol</h2>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          {total} complexes encontrados
        </span>
      </div>

      {error && <div className="error">{error}</div>}

      {/* Filters Area */}
      <div className="card" style={{ padding: 20, marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Search */}
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: 14, top: 12, color: 'var(--text-muted)' }}>🔍</span>
          <input
            type="text"
            className="predictions-search-input"
            placeholder="Buscar por nombre de complejo o dirección..."
            style={{ width: '100%', paddingLeft: 40, height: '42px' }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Zone Filter Chips */}
        <div>
          <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 8, fontWeight: '600' }}>
            📍 Filtrar por Zona GBA / CABA
          </span>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {ZONES.map((zone) => (
              <button
                key={zone}
                onClick={() => setSelectedZone(zone)}
                className={`user-chip ${selectedZone === zone ? 'active' : ''}`}
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  border: '1px solid var(--border)',
                  background: selectedZone === zone ? 'var(--accent)' : 'rgba(255,255,255,0.03)',
                  color: selectedZone === zone ? '#000' : 'var(--text-secondary)',
                  transition: 'all 0.2s'
                }}
              >
                {zone === 'Todos' ? '👥 Todas' : zone}
              </button>
            ))}
          </div>
        </div>

        {/* Type Filter Chips */}
        <div>
          <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 8, fontWeight: '600' }}>
            ⚽ Tamaño de Cancha
          </span>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {TYPES.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`user-chip ${selectedType === type ? 'active' : ''}`}
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  border: '1px solid var(--border)',
                  background: selectedType === type ? 'var(--accent)' : 'rgba(255,255,255,0.03)',
                  color: selectedType === type ? '#000' : 'var(--text-secondary)',
                  transition: 'all 0.2s'
                }}
              >
                {type === 'Todos' ? '🏃 Todos' : `Fútbol ${type.substring(1)}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-secondary)' }}>
          <span style={{ fontSize: '2rem', display: 'block', marginBottom: 12 }}>⏳</span>
          Cargando listado de canchas reales...
        </div>
      ) : fields.length === 0 ? (
        <div className="card empty-state" style={{ padding: 48 }}>
          <span className="empty-icon">🏟️</span>
          <p>No se encontraron complejos deportivos con los filtros aplicados.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 20
          }}>
            {fields.map((f) => (
              <div
                key={f.id}
                className="card"
                onClick={() => setSelectedField(f)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  padding: 0,
                  border: '1px solid var(--border)',
                  background: 'var(--bg-card-solid)',
                  transition: 'transform 0.2s, border-color 0.2s, box-shadow 0.2s',
                  hover: {
                    transform: 'translateY(-4px)',
                    borderColor: 'var(--accent)',
                    boxShadow: 'var(--shadow-glow)'
                  }
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.borderColor = 'var(--accent)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-glow)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Complex Image */}
                <div style={{ height: 160, width: '100%', overflow: 'hidden', position: 'relative' }}>
                  <img
                    src={f.image_url}
                    alt={f.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
                  />
                  <span style={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    background: 'rgba(0,0,0,0.75)',
                    backdropFilter: 'blur(4px)',
                    border: '1px solid var(--border)',
                    color: 'var(--accent-light)',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '0.7rem',
                    fontWeight: '700'
                  }}>
                    📍 {f.zone}
                  </span>
                </div>

                {/* Complex details */}
                <div style={{ padding: 16, display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', color: 'var(--text-primary)' }}>{f.name}</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span>📍</span> {f.address}
                  </p>

                  {/* Badges types */}
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                    <span style={{ fontSize: '0.7rem', background: 'rgba(245, 158, 11, 0.15)', color: 'var(--gold-light)', border: '1px solid rgba(245,158,11,0.25)', padding: '3px 8px', borderRadius: '4px', fontWeight: '600' }}>
                      🥅 {f.field_types}
                    </span>
                    <span style={{ fontSize: '0.7rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-light)', border: '1px solid rgba(16,185,129,0.2)', padding: '3px 8px', borderRadius: '4px', fontWeight: '600' }}>
                      🌱 {f.surface}
                    </span>
                  </div>

                  {/* Features inline list */}
                  {f.features && (
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 'auto', paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      {f.features.split(',').slice(0, 3).map((feat, idx) => (
                        <span key={idx} style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                          • {feat.trim()}
                        </span>
                      ))}
                      {f.features.split(',').length > 3 && (
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                          (+{f.features.split(',').length - 3})
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

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
                  Cargando más complejos...
                </>
              ) : (
                'Cargar más canchas 🏟️'
              )}
            </button>
          )}
        </div>
      )}

      {/* Details Modal overlay */}
      {selectedField && (
        <div
          onClick={() => setSelectedField(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 16
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="card"
            style={{
              maxWidth: 550,
              width: '100%',
              overflow: 'hidden',
              padding: 0,
              position: 'relative',
              background: 'var(--bg-card-solid)',
              border: '1px solid var(--border)',
              animation: 'modal-zoom 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            {/* Modal Header Image */}
            <div style={{ height: 220, width: '100%', overflow: 'hidden', position: 'relative' }}>
              <img
                src={selectedField.image_url}
                alt={selectedField.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '100%',
                background: 'linear-gradient(to top, rgba(10,15,26,0.95), transparent)',
                padding: '24px 20px 16px 20px'
              }}>
                <span style={{
                  fontSize: '0.75rem',
                  background: 'var(--accent)',
                  color: '#000',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontWeight: '700',
                  display: 'inline-block',
                  marginBottom: 6
                }}>
                  📍 {selectedField.zone}
                </span>
                <h3 style={{ margin: 0, fontSize: '1.6rem', color: '#fff', fontWeight: '800' }}>{selectedField.name}</h3>
              </div>
              {/* Close button */}
              <button
                onClick={() => setSelectedField(null)}
                style={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: 'rgba(0,0,0,0.6)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: '#fff',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  outline: 'none',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.8)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.6)'}
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '20px 24px' }}>
              {selectedField.description && (
                <p style={{ margin: '0 0 16px 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  {selectedField.description}
                </p>
              )}

              {/* Details table */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
                <div style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                  <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-secondary)', marginBottom: 2 }}>⚽ Canchas</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>{selectedField.field_types}</span>
                </div>
                <div style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                  <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-secondary)', marginBottom: 2 }}>🌱 Superficie</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>{selectedField.surface}</span>
                </div>
              </div>

              {/* Comodidades list */}
              {selectedField.features && (
                <div style={{ marginBottom: 20 }}>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 8, fontWeight: '600' }}>
                    🏢 Comodidades & Servicios
                  </span>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {selectedField.features.split(',').map((feat, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: '0.75rem',
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid var(--border)',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          color: 'var(--text-primary)'
                        }}
                      >
                        ✔ {feat.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Simulated Map Container */}
              <div
                onClick={() => handleOpenGoogleMaps(selectedField.address)}
                style={{
                  height: 90,
                  background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, rgba(10,15,26,0.9) 100%)',
                  border: '1px dashed var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  marginBottom: 24,
                  padding: 10,
                  transition: 'border-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <span style={{ fontSize: '1.2rem', marginBottom: 2 }}>🗺️</span>
                <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--accent-light)' }}>
                  Ver en Google Maps
                </span>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: 2 }}>
                  {selectedField.address}
                </span>
              </div>

              {/* Call to actions */}
              <div style={{ display: 'flex', gap: 12 }}>
                {selectedField.phone && (
                  <button
                    onClick={() => handleWhatsApp(selectedField.phone, selectedField.name)}
                    className="btn-primary"
                    style={{
                      flex: 1,
                      margin: 0,
                      background: '#25D366',
                      color: '#000',
                      border: 'none',
                      fontWeight: '700',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6
                    }}
                  >
                    <span>💬 WhatsApp</span>
                  </button>
                )}
                <button
                  onClick={() => window.open(`tel:${selectedField.phone}`)}
                  className="btn-secondary"
                  style={{
                    flex: 1,
                    margin: 0,
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6
                  }}
                >
                  <span>📞 Llamar: {selectedField.phone}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* CSS injection for modal zoom */}
      <style>{`
        @keyframes modal-zoom {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </>
  );
}
