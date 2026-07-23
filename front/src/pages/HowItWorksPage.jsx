import { useNavigate } from 'react-router-dom';
import { useSEO } from '../utils/useSEO';
import Breadcrumbs from '../components/Breadcrumbs';

export default function HowItWorksPage() {
  const navigate = useNavigate();

  useSEO({
    title: '¿Cómo Funciona ProdeKapotes? Guía Paso a Paso',
    description: 'Aprendé a organizar tus partidos de fútbol amateur de principio a fin con ProdeKapotes. Creá un grupo, convocá a tus amigos y disfrutá.',
    keywords: 'como funciona prodekapotes, guia futbol 5, como organizar partido futbol, pasos futbol amateur',
    canonicalUrl: '/como-funciona',
  });

  return (
    <div className="seo-page-container">
      <Breadcrumbs items={[{ label: '¿Cómo Funciona?' }]} />

      <header className="seo-page-header">
        <span className="seo-page-icon" aria-hidden="true">💡</span>
        <h1 className="seo-page-title">
          ¿Cómo Funciona <span className="text-highlight">ProdeKapotes</span>?
        </h1>
        <p className="seo-page-lead">
          Guía completa para pasar del desorden de WhatsApp a un sistema organizado de partidos,
          canchas, estadísticas y minijuegos en menos de 2 minutos.
        </p>
        <div className="seo-header-actions">
          <button className="btn-primary-lg" onClick={() => navigate('/auth')}>
            🚀 Probar Gratis Ahora
          </button>
          <button className="btn-secondary-lg" onClick={() => navigate('/ayuda')}>
            ❓ Ir al Centro de Ayuda
          </button>
        </div>
      </header>

      {/* Detailed step by step */}
      <section className="seo-section">
        <h2 className="seo-section-title">Guía de Uso en 4 Pasos</h2>

        <div className="how-it-works-step">
          <div className="how-step-badge">Paso 1</div>
          <div className="how-step-content">
            <h3>Creá tu Grupo e Invitá a tus Amigos</h3>
            <p>
              Registrate en la plataforma en 30 segundos y creá tu primer grupo (ej: "Fútbol del Viernes", "Los Pibes de la Facu").
              El sistema genera automáticamente un <strong>enlace de invitación único</strong> o código de grupo.
              Copialo y pegalo en tu chat de WhatsApp para que tus amigos soliciten ingresar.
            </p>
          </div>
        </div>

        <div className="how-it-works-step">
          <div className="how-step-badge">Paso 2</div>
          <div className="how-step-content">
            <h3>Publicá una Convocatoria de Partido</h3>
            <p>
              Como administrador u organizador, creá un nuevo partido especificando el día, la hora, el complejo de canchas
              y la cantidad de jugadores requeridos (ej: 10 para Fútbol 5).
              Los integrantes recibirán la convocatoria y podrán hacer clic en <strong>"Confirmar Asistencia"</strong> o <strong>"No Puedo"</strong>.
            </p>
          </div>
        </div>

        <div className="how-it-works-step">
          <div className="how-step-badge">Paso 3</div>
          <div className="how-step-content">
            <h3>Armá Equipos Balanceados y Cobrá la Cancha</h3>
            <p>
              Utilizá el generador inteligente de equipos para formar los planteles de Claros vs Oscuros
              distribuyendo a los jugadores por sus promedios históricos.
              El organizador puede ir marcando en la lista quién ya abonó su parte del alquiler.
            </p>
          </div>
        </div>

        <div className="how-it-works-step">
          <div className="how-step-badge">Paso 4</div>
          <div className="how-step-content">
            <h3>Registrá el Resultado y Disfrutá las Estadísticas</h3>
            <p>
              Finalizado el picadito, cargá el resultado final (ej: 7 - 5), anotá los goles y asistencias
              y abrí la votación para el MVP del partido. Toda la información alimentará la tabla de goleadores
              y el ranking general del grupo.
            </p>
          </div>
        </div>
      </section>

      {/* Extras & Minigames */}
      <section className="seo-section">
        <h2 className="seo-section-title">Además: Minijuegos de Fútbol Diarios</h2>
        <p className="seo-paragraph">
          No tenés que esperar hasta el día del partido para interactuar con la plataforma.
          Cada día se habilitan desafíos en <strong>FutWordle</strong>, <strong>GolTexto</strong> y <strong>FutLegacy</strong>
          para adivinar futbolistas y sumar puntos en el ranking de tu grupo.
        </p>
      </section>

      {/* CTA */}
      <div className="seo-cta-banner">
        <h2>¿Qué estás esperando para organizar tu grupo?</h2>
        <p>Proba ProdeKapotes hoy mismo y disfrutá del fútbol sin complicaciones.</p>
        <button className="btn-primary-lg" onClick={() => navigate('/auth')}>
          Comenzar Ahora Gratis
        </button>
      </div>
    </div>
  );
}
