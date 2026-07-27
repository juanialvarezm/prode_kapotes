import { useNavigate } from 'react-router-dom';
import { useSEO } from '../utils/useSEO';
import Breadcrumbs from '../components/Breadcrumbs';

export default function PublicGroupsPage() {
  const navigate = useNavigate();

  useSEO({
    title: 'Grupos de Amigos y Ligas de Fútbol Amateur',
    description: 'Creá y administrá tu grupo de fútbol amateur en ProdeKapotes. Invitá amigos, gestioná solicitudes, asigná roles y organizá partidos sin caos.',
    keywords: 'grupos de fútbol, organizar partido fútbol, grupo de amigos futbol, futbol 5 amigos, administrar grupo futbol',
    canonicalUrl: '/grupos',
  });

  return (
    <div className="seo-page-container">
      <Breadcrumbs items={[{ label: 'Grupos' }]} />

      <header className="seo-page-header">
        <span className="seo-page-icon" aria-hidden="true">👥</span>
        <h1 className="seo-page-title">
          Grupos de Fútbol Amateur en <span className="text-highlight">ProdeKapotes</span>
        </h1>
        <p className="seo-page-lead">
          La solución definitiva para reunir a tu grupo de amigos del colegio, trabajo o barrio.
          Decile chau a las listas desordenadas en WhatsApp y administrá a tu equipo en un solo lugar.
        </p>
        <div className="seo-header-actions">
          <button className="btn-primary-lg" onClick={() => navigate('/auth')}>
            🚀 Crear mi Grupo Gratis
          </button>
          <button className="btn-secondary-lg" onClick={() => navigate('/como-funciona')}>
            💡 Ver cómo funciona
          </button>
        </div>
      </header>

      {/* Feature breakdown */}
      <section className="seo-section">
        <h2 className="seo-section-title">¿Qué podés hacer con los Grupos de ProdeKapotes?</h2>
        <div className="seo-grid-3">
          <div className="seo-card">
            <span className="seo-card-icon" aria-hidden="true">🔗</span>
            <h3>Código de Invitación Único</h3>
            <p>
              Generá un enlace o código de invitación exclusivo para tu grupo. Compartilo en WhatsApp
              y permití que tus amigos soliciten unirse con un solo clic.
            </p>
          </div>

          <div className="seo-card">
            <span className="seo-card-icon" aria-hidden="true">🛡️</span>
            <h3>Gestión de Solicitudes y Roles</h3>
            <p>
              El administrador del grupo aprueba o rechaza solicitudes de ingreso. Podés asignar roles
              de organizador, otorgar permisos y mantener el grupo 100% privado y seguro.
            </p>
          </div>

          <div className="seo-card">
            <span className="seo-card-icon" aria-hidden="true">🖼️</span>
            <h3>Avatar y Personalización</h3>
            <p>
              Subí el escudo oficial del grupo, asigná un nombre representativo y destacá los colores
              de tu equipo amateur en el ranking global.
            </p>
          </div>
        </div>
      </section>



      {/* CTA Bottom */}
      <div className="seo-cta-banner">
        <h2>¿Listo para organizar a tus amigos como profesionales?</h2>
        <p>Registrate gratis en 30 segundos y creá tu primer grupo de fútbol amateur.</p>
        <button className="btn-primary-lg" onClick={() => navigate('/auth')}>
          Crear mi grupo ahora
        </button>
      </div>
    </div>
  );
}
