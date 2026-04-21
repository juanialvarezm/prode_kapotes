import { useNavigate } from 'react-router-dom';

const LAST_UPDATED = '21 de abril de 2025';

const sections = [
  {
    icon: '📋',
    title: '1. Información que recopilamos',
    content: [
      {
        subtitle: '1.1 Datos de registro',
        text: 'Cuando creás una cuenta en Prode Kapotes, recopilamos tu nombre de usuario y contraseña (almacenada de forma segura con hash). No requerimos dirección de email ni información personal sensible.',
      },
      {
        subtitle: '1.2 Datos de uso',
        text: 'Registramos las predicciones que realizás, los grupos a los que pertenecés, tu historial de puntajes y las fechas de actividad. Esta información es necesaria para el funcionamiento del juego.',
      },
      {
        subtitle: '1.3 Imágenes de perfil',
        text: 'Si subís una foto de perfil, esta se almacena en Cloudinary, un servicio de gestión de imágenes en la nube. Solo se guarda la URL pública de la imagen.',
      },
    ],
  },
  {
    icon: '🎯',
    title: '2. Cómo usamos tu información',
    content: [
      {
        subtitle: 'Funcionamiento del juego',
        text: 'Usamos tus datos exclusivamente para operar la plataforma: gestionar tu cuenta, calcular puntajes, mostrarte los resultados de los partidos y administrar los grupos de predicción.',
      },
      {
        subtitle: 'Comunicación interna',
        text: 'Tu nombre de usuario puede ser visible para otros miembros de los grupos a los que pertenecés. No compartimos tus datos con terceros con fines comerciales.',
      },
      {
        subtitle: 'Seguridad',
        text: 'Usamos tokens JWT (JSON Web Tokens) para autenticar tu sesión de forma segura. Estos tokens no contienen información sensible y expiran automáticamente.',
      },
    ],
  },
  {
    icon: '🔒',
    title: '3. Seguridad de los datos',
    content: [
      {
        subtitle: 'Contraseñas',
        text: 'Tus contraseñas nunca se almacenan en texto plano. Utilizamos algoritmos de hash seguros (bcrypt) para protegerlas.',
      },
      {
        subtitle: 'Comunicación',
        text: 'La comunicación entre el frontend y el backend se realiza a través de HTTP en entorno local de desarrollo. En producción, recomendamos el uso de HTTPS con certificados SSL/TLS.',
      },
      {
        subtitle: 'Acceso a datos',
        text: 'Solo los administradores del sistema tienen acceso a la base de datos. Los datos de predicciones y puntajes son visibles únicamente dentro de los grupos correspondientes.',
      },
    ],
  },
  {
    icon: '👥',
    title: '4. Grupos y privacidad',
    content: [
      {
        subtitle: 'Grupos privados',
        text: 'Prode Kapotes funciona con un sistema de grupos privados. Para unirte a un grupo necesitás una invitación o ser aprobado por el administrador. Tus predicciones solo son visibles para los miembros de tu grupo.',
      },
      {
        subtitle: 'Solicitudes de adhesión',
        text: 'Cuando solicitás unirte a un grupo, tu nombre de usuario es visible para el administrador de ese grupo a los fines de aprobar o rechazar la solicitud.',
      },
    ],
  },
  {
    icon: '🗑️',
    title: '5. Eliminación de datos',
    content: [
      {
        subtitle: 'Tu derecho de eliminación',
        text: 'Podés solicitar la eliminación de tu cuenta y todos los datos asociados contactando al administrador de la plataforma. Una vez eliminada, la información no puede recuperarse.',
      },
      {
        subtitle: 'Datos de grupos',
        text: 'Al abandonar un grupo, tus predicciones pasadas pueden conservarse en el historial del grupo con fines estadísticos, pero tu cuenta quedará desvinculada.',
      },
    ],
  },
  {
    icon: '🍪',
    title: '6. Cookies y almacenamiento local',
    content: [
      {
        subtitle: 'LocalStorage',
        text: 'Utilizamos el localStorage del navegador para guardar tu token de autenticación y el ID del grupo activo. Esta información permanece en tu dispositivo y no es enviada a terceros.',
      },
      {
        subtitle: 'Sin cookies de rastreo',
        text: 'No utilizamos cookies de seguimiento, publicidad ni analítica de terceros. No tenemos Google Analytics ni ningún otro servicio de tracking instalado.',
      },
    ],
  },
  {
    icon: '🔄',
    title: '7. Cambios en esta política',
    content: [
      {
        subtitle: 'Actualizaciones',
        text: `Esta política de privacidad puede actualizarse ocasionalmente. La fecha de última modificación siempre estará indicada en la parte superior. Última actualización: ${LAST_UPDATED}.`,
      },
    ],
  },
  {
    icon: '📬',
    title: '8. Contacto',
    content: [
      {
        subtitle: '¿Preguntas?',
        text: 'Si tenés preguntas sobre esta política de privacidad o sobre el manejo de tus datos, podés contactar al administrador de la plataforma directamente a través de los canales del grupo.',
      },
    ],
  },
];

export default function PrivacyPage() {
  const navigate = useNavigate();

  return (
    <div className="privacy-page">
      {/* Hero */}
      <div className="privacy-hero">
        <div className="privacy-hero-orb orb-1" />
        <div className="privacy-hero-orb orb-2" />
        <div className="privacy-hero-inner">
          <span className="privacy-hero-icon">🔐</span>
          <h1 className="privacy-hero-title">
            Políticas de <span className="privacy-hero-highlight">Privacidad</span>
          </h1>
          <p className="privacy-hero-subtitle">
            En <strong>Prode Kapotes</strong> tu privacidad es importante. Acá te explicamos
            qué datos recopilamos, cómo los usamos y cómo los protegemos.
          </p>
          <div className="privacy-updated-badge">
            📅 Última actualización: {LAST_UPDATED}
          </div>
        </div>
      </div>

      {/* Resumen rápido */}
      <div className="privacy-summary-grid">
        {[
          { icon: '🚫', text: 'Sin publicidad ni tracking' },
          { icon: '🔒', text: 'Contraseñas con hash seguro' },
          { icon: '👥', text: 'Solo visible en tu grupo' },
          { icon: '🗑️', text: 'Podés eliminar tu cuenta' },
        ].map((item) => (
          <div key={item.text} className="privacy-summary-chip">
            <span>{item.icon}</span>
            <span>{item.text}</span>
          </div>
        ))}
      </div>

      {/* Secciones */}
      <div className="privacy-sections">
        {sections.map((section) => (
          <div key={section.title} className="privacy-section-card">
            <div className="privacy-section-header">
              <span className="privacy-section-icon">{section.icon}</span>
              <h2 className="privacy-section-title">{section.title}</h2>
            </div>
            <div className="privacy-section-body">
              {section.content.map((block) => (
                <div key={block.subtitle} className="privacy-block">
                  <h3 className="privacy-block-subtitle">{block.subtitle}</h3>
                  <p className="privacy-block-text">{block.text}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer CTA */}
      <div className="privacy-footer-cta">
        <p>¿Todo claro? Volvé a disfrutar del mejor prode del Mundial.</p>
        <button
          className="home-btn-primary"
          onClick={() => navigate(-1)}
          id="btn-privacy-back"
        >
          ← Volver
        </button>
      </div>
    </div>
  );
}
