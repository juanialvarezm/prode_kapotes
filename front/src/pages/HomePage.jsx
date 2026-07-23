import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSEO } from '../utils/useSEO';

const navItems = [
  { icon: '🧩', label: 'FutWordle', path: '/futwordle', desc: '¿Quién es este jugador?' },
  { icon: '⚡', label: 'GolTexto', path: '/goltexto', desc: 'Adiviná por club y nac.' },
  { icon: '👕', label: 'FutLegacy', path: '/futlegacy', desc: 'Adiviná por camisetas' },
  { icon: '🏟️', label: 'Canchas', path: '/canchas', desc: 'Alquiler de complejos reales' },
  { icon: '👤', label: 'Perfil', path: '/profile', desc: 'Tu cuenta' },
];

const faqsData = [
  {
    q: '¿Qué es ProdeKapotes y para qué sirve?',
    a: 'ProdeKapotes es una plataforma web integral diseñada para la organización de fútbol amateur. Permite crear grupos de amigos, publicar convocatorias de partidos, confirmar asistencias en tiempo real, armar equipos equilibrados, llevar tablas de estadísticas y competir en minijuegos futboleros.',
  },
  {
    q: '¿Es totalmente gratuito para los usuarios?',
    a: 'Sí. Todas las funciones para organizar partidos, llevar estadísticas, unirse a grupos y jugar los minijuegos son 100% gratuitas.',
  },
  {
    q: '¿Reemplaza los grupos de WhatsApp?',
    a: '¡Totalmente! En lugar de listas desordenadas en chats, ProdeKapotes ofrece botones claros de asistencia (Confirmar/No Puedo), cola de suplentes automatizada y registro transparente de pagos.',
  },
  {
    q: '¿Necesito instalar alguna app en mi celular?',
    a: 'No requiere descarga desde tiendas de aplicaciones. ProdeKapotes es una aplicación web responsiva de alta velocidad que funciona directo en el navegador de cualquier teléfono inteligente o computadora.',
  },
  {
    q: '¿Cómo funcionan los minijuegos de fútbol?',
    a: 'Todos los días se habilitan desafíos en FutWordle, GolTexto y FutLegacy. Al adivinar futbolistas por pistas, sumás puntos que alimentan el ranking de tu grupo y la tabla global.',
  },
];

export default function HomePage() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username') || 'Jugador';
  const [openFaq, setOpenFaq] = useState(null);

  useSEO({
    title: 'ProdeKapotes | La Plataforma Definitiva para Organizar Fútbol Amateur',
    description: 'Organizá partidos de fútbol 5 con tus amigos, confirmá asistencias, encontrá canchas, llevá estadísticas de goleadores y jugá minijuegos diarios gratis.',
    keywords: 'futbol amateur, organizar partido futbol, futbol 5 amigos, buscar canchas futbol, wordle futbol, prodekapotes, estadisticas futbol 5',
    canonicalUrl: '/',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': faqsData.map(item => ({
        '@type': 'Question',
        'name': item.q,
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': item.a,
        },
      })),
    },
  });

  return (
    <div className="home-layout-seo">
      {/* Logged in Quick Sidebar for active users */}
      {token && (
        <aside className="home-sidebar" aria-label="Menú de acceso rápido">
          <div className="sidebar-header">
            <span className="sidebar-logo-icon" aria-hidden="true">⚽</span>
            <span className="sidebar-logo-text">
              Menú <span className="sidebar-logo-highlight">Rápido</span>
            </span>
          </div>

          <nav className="sidebar-nav">
            {navItems.map((item) => (
              <button
                key={item.path}
                className="sidebar-nav-item"
                onClick={() => navigate(item.path)}
              >
                <span className="sidebar-nav-icon" aria-hidden="true">{item.icon}</span>
                <span className="sidebar-nav-info">
                  <span className="sidebar-nav-label">{item.label}</span>
                  <span className="sidebar-nav-desc">{item.desc}</span>
                </span>
                <span className="sidebar-nav-arrow" aria-hidden="true">›</span>
              </button>
            ))}
          </nav>

          <div className="sidebar-footer">
            <span>⚽ Organizá & Jugá</span>
          </div>
        </aside>
      )}

      {/* Main Home Content */}
      <main className="home-content-seo">
        {/* HERO SECTION */}
        <section className="home-hero-seo">
          <div className="home-hero-bg-orb orb-1" aria-hidden="true" />
          <div className="home-hero-bg-orb orb-2" aria-hidden="true" />

          <div className="home-hero-inner-seo">
            <span className="hero-badge">⚽ Plataforma de Fútbol Amateur #1</span>

            <h1 className="home-hero-title-seo">
              Organizá el partido con tus amigos <br />
              <span className="home-hero-highlight">sin descontrol ni faltazos</span>
            </h1>

            <p className="home-hero-subtitle-seo">
              ProdeKapotes reúne todo lo que tu grupo necesita: convocatorias inteligentes,
              asistencias en tiempo real, alquiler de canchas, estadísticas de goleadores y minijuegos diarios.
            </p>

            <div className="home-hero-actions-seo">
              <button
                className="home-btn-primary"
                onClick={() => navigate(token ? '/groups' : '/auth')}
                id="btn-hero-primary"
              >
                🚀 {token ? 'Ir a Mis Grupos' : 'Empezar a Organizar Gratis'}
              </button>

              <button
                className="home-btn-secondary"
                onClick={() => navigate('/canchas')}
                id="btn-hero-canchas"
              >
                🏟️ Buscar Canchas
              </button>
            </div>

            {/* Quick Stats Bar */}
            <div className="hero-stats-bar">
              <div className="stat-item">
                <span className="stat-value">+150</span>
                <span className="stat-label">Complejos de Canchas</span>
              </div>
              <div className="stat-divider" aria-hidden="true" />
              <div className="stat-item">
                <span className="stat-value">100%</span>
                <span className="stat-label">Gratuito</span>
              </div>
              <div className="stat-divider" aria-hidden="true" />
              <div className="stat-item">
                <span className="stat-value">3</span>
                <span className="stat-label">Minijuegos Diarios</span>
              </div>
            </div>
          </div>
        </section>

        {/* WHAT IS PRODEKAPOTES SECTION */}
        <section className="seo-section home-about-section">
          <h2 className="seo-section-title">¿Qué es ProdeKapotes?</h2>
          <p className="seo-paragraph-lead">
            ProdeKapotes es la plataforma web creada por y para jugadores de fútbol amateur en Argentina.
            Reemplazamos las planillas manuales y los chats interminables por un sistema automatizado donde podés coordinar la fecha,
            armar los equipos, medir el nivel de cada participante y guardar la historia de tus partidos.
          </p>
        </section>

        {/* HOW IT WORKS SECTION */}
        <section className="seo-section">
          <h2 className="seo-section-title">¿Cómo funciona? En 4 simples pasos</h2>
          <div className="seo-grid-4">
            <div className="seo-card step-card">
              <div className="step-number">1</div>
              <h3>Creá tu Grupo</h3>
              <p>Generá un código de invitación y sumá a tus amigos del colegio, trabajo o facultad.</p>
            </div>
            <div className="seo-card step-card">
              <div className="step-number">2</div>
              <h3>Publicá el Partido</h3>
              <p>Fijá el día, horario y cancha. Tus amigos confirman asistencia con un clic.</p>
            </div>
            <div className="seo-card step-card">
              <div className="step-number">3</div>
              <h3>Armá Equipos</h3>
              <p>Generá planteles balanceados según las estadísticas acumuladas de cada jugador.</p>
            </div>
            <div className="seo-card step-card">
              <div className="step-number">4</div>
              <h3>Cargá Estadísticas</h3>
              <p>Registrá el resultado final, goles, asistencias y elegí al MVP del partido.</p>
            </div>
          </div>
        </section>

        {/* FEATURE BREAKDOWN */}
        <section className="seo-section">
          <h2 className="seo-section-title">Todas las Funcionalidades de la Plataforma</h2>
          <div className="seo-grid-3">
            <div className="seo-card feature-card-interactive" onClick={() => navigate('/grupos')}>
              <span className="feature-icon">👥</span>
              <h3>Gestión de Grupos</h3>
              <p>Administración de miembros, aprobación de solicitudes y roles de organizador.</p>
              <span className="feature-link">Saber más sobre Grupos →</span>
            </div>

            <div className="seo-card feature-card-interactive" onClick={() => navigate('/partidos')}>
              <span className="feature-icon">⚽</span>
              <h3>Organización de Partidos</h3>
              <p>Listas de confirmados, cola de suplentes automática y control de cuotas de cancha.</p>
              <span className="feature-link">Saber más sobre Partidos →</span>
            </div>

            <div className="seo-card feature-card-interactive" onClick={() => navigate('/canchas')}>
              <span className="feature-icon">🏟️</span>
              <h3>Buscador de Canchas</h3>
              <p>Directorio con más de 150 complejos en CABA y GBA con fotos, mapa y servicios.</p>
              <span className="feature-link">Explorar Canchas →</span>
            </div>

            <div className="seo-card feature-card-interactive" onClick={() => navigate('/estadisticas')}>
              <span className="feature-icon">📊</span>
              <h3>Estadísticas de Jugadores</h3>
              <p>Tabla de goleadores, máximos asistidores, efectividad % y distinciones de MVP.</p>
              <span className="feature-link">Ver Estadísticas →</span>
            </div>

            <div className="seo-card feature-card-interactive" onClick={() => navigate('/ranking')}>
              <span className="feature-icon">🏆</span>
              <h3>Rankings y Tablas</h3>
              <p>Tabla de posiciones del grupo y leaderboard global por presentismo y minijuegos.</p>
              <span className="feature-link">Ver Rankings →</span>
            </div>

            <div className="seo-card feature-card-interactive" onClick={() => navigate('/minijuegos')}>
              <span className="feature-icon">🎮</span>
              <h3>Minijuegos Futboleros</h3>
              <p>Desafíos diarios de FutWordle, GolTexto y FutLegacy para jugar entre fecha y fecha.</p>
              <span className="feature-link">Ver Minijuegos →</span>
            </div>
          </div>
        </section>

        {/* PRODEKAPOTES VS WHATSAPP COMPARISON */}
        <section className="seo-section">
          <h2 className="seo-section-title">Ventajas frente a organizar por WhatsApp</h2>
          <div className="comparison-table-wrapper">
            <table className="comparison-table">
              <thead>
                <tr>
                  <th scope="col">Problema habitual</th>
                  <th scope="col">Organizar por WhatsApp</th>
                  <th scope="col">Solución en ProdeKapotes</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Confirmación de 10 jugadores</td>
                  <td>Lista de texto que se pierde entre 200 stickers y audios</td>
                  <td>Botón de RSVP con estado claro y cola de suplentes en orden</td>
                </tr>
                <tr>
                  <td>Faltazos a último momento</td>
                  <td>Alguien avisa 10 min antes y hay que llamar desesperado</td>
                  <td>El primer suplente de la lista ocupa el lugar automáticamente</td>
                </tr>
                <tr>
                  <td>Desequilibrio en los equipos</td>
                  <td>Equipos armados a ojo que terminan 12 - 2</td>
                  <td>Generador equilibrado según el rendimiento real de cada uno</td>
                </tr>
                <tr>
                  <td>Historial del grupo</td>
                  <td>Nadie se acuerda quién ganó la semana pasada</td>
                  <td>Historial permanente de partidos, goles, asistencias y premios MVP</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* MINIGAMES SHOWCASE */}
        <section className="seo-section">
          <h2 className="seo-section-title">Minijuegos para los Amantes del Fútbol</h2>
          <div className="seo-grid-3">
            <div className="seo-card game-showcase-card">
              <span className="game-badge">🧩 Juego Diario</span>
              <h3>FutWordle</h3>
              <p>Adiviná al jugador misterioso en 6 intentos usando pistas por liga, país y edad.</p>
            </div>
            <div className="seo-card game-showcase-card">
              <span className="game-badge">⚡ Trivia</span>
              <h3>GolTexto</h3>
              <p>Descubrí al futbolista siguiendo el recorrido de los clubes de su carrera.</p>
            </div>
            <div className="seo-card game-showcase-card">
              <span className="game-badge">👕 Camisetas</span>
              <h3>FutLegacy</h3>
              <p>Demostrá tu memoria futbolera reconociendo camisetas legendarias.</p>
            </div>
          </div>
        </section>

        {/* FREQUENTLY ASKED QUESTIONS (FAQ) */}
        <section className="seo-section">
          <h2 className="seo-section-title">Preguntas Frecuentes (FAQ)</h2>
          <div className="faq-grid">
            {faqsData.map((faq, idx) => (
              <details
                key={idx}
                className="faq-item"
                open={openFaq === idx}
                onClick={(e) => {
                  e.preventDefault();
                  setOpenFaq(openFaq === idx ? null : idx);
                }}
              >
                <summary className="faq-question">
                  <span>{faq.q}</span>
                  <span className="faq-icon">{openFaq === idx ? '−' : '+'}</span>
                </summary>
                <div className="faq-answer">
                  <p>{faq.a}</p>
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* FINAL CTA BANNER */}
        <section className="seo-cta-banner">
          <h2>¿Listo para vivir el fútbol amateur como se debe?</h2>
          <p>Unite gratis a miles de jugadores que ya organizan sus partidos con ProdeKapotes.</p>
          <button
            className="home-btn-primary"
            onClick={() => navigate(token ? '/groups' : '/auth')}
          >
            🚀 {token ? 'Ir a Mis Grupos' : 'Crear mi Cuenta Gratis'}
          </button>
        </section>
      </main>
    </div>
  );
}
