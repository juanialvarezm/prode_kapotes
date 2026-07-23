import { useParams, useNavigate } from 'react-router-dom';
import { useSEO } from '../utils/useSEO';
import Breadcrumbs from '../components/Breadcrumbs';

export const ARTICLES_DATA = {
  'crear-grupo': {
    title: 'Cómo Crear y Configurar un Grupo de Fútbol',
    category: 'Grupos',
    icon: '👥',
    description: 'Guía paso a paso para crear tu primer grupo en ProdeKapotes, personalizar su escudo, generar el código de invitación y aprobar miembros.',
    content: `
      <h3>1. Registro de usuario</h3>
      <p>Para crear un grupo, lo primero que necesitás es tener una cuenta activa en ProdeKapotes. Podés registrarte gratis en 30 segundos con un nombre de usuario y contraseña.</p>

      <h3>2. Crear nuevo grupo</h3>
      <p>Una vez iniciada la sesión, andá a la sección <strong>"Mis Grupos"</strong> o hacé clic en el botón <strong>"➕ Crear Grupo"</strong>. Ingresá el nombre de tu equipo o grupo de amigos (por ejemplo: <em>"Fútbol del Viernes"</em>) y agregá una descripción opcional.</p>

      <h3>3. Personalizar el avatar</h3>
      <p>Podés subir una imagen o escudo representativo desde las opciones del grupo para que tu equipo se distinga en las tablas generales y rankings.</p>

      <h3>4. Compartir el enlace de invitación</h3>
      <p>En el panel del grupo, tocá el botón <strong>"Invitar Amigos"</strong> para copiar el código o enlace directo. Pegalo en tu chat de WhatsApp para que tus amigos soliciten ingresar.</p>

      <h3>5. Aprobar o rechazar solicitudes</h3>
      <p>Como administrador, recibirás notificaciones en la pestaña <strong>"Solicitudes"</strong> cuando un amigo pida unirse. Confirmá el ingreso para sumarlo formalmente al grupo.</p>
    `,
  },
  'organizar-partido': {
    title: 'Cómo Organizar y Publicar un Partido',
    category: 'Partidos',
    icon: '⚽',
    description: 'Paso a paso para crear una convocatoria de partido de fútbol 5, 7 o 11, seleccionar la cancha y fijar horario.',
    content: `
      <h3>1. Acceder al panel del grupo</h3>
      <p>Entrá a tu grupo activo y dirígete a la solapa de <strong>"Organizar Partidos"</strong>.</p>

      <h3>2. Definir fecha, hora y lugar</h3>
      <p>Hacé clic en <strong>"Nuevo Partido"</strong>. Seleccioná la fecha del juego, el horario de inicio y el complejo de canchas elegido. Podés usar nuestro buscador de canchas para ver direcciones y teléfonos.</p>

      <h3>3. Configurar cupos de jugadores</h3>
      <p>Definí el cupo máximo de jugadores según la modalidad (10 para Fútbol 5, 14 para Fútbol 7, 22 para Fútbol 11). Los primeros en confirmar ocuparán la lista principal; los siguientes ingresarán a la cola de suplentes.</p>

      <h3>4. Enviar convocatoria</h3>
      <p>Una vez guardado el partido, todos los miembros del grupo recibirán la convocatoria activa y podrán responder en tiempo real.</p>
    `,
  },
  'confirmar-asistencia': {
    title: 'Cómo Confirmar Asistencia y Gestionar Suplentes',
    category: 'Partidos',
    icon: '✅',
    description: 'Aprende a confirmar tu presencia en el partido, avisar si te bajas a tiempo y ver la lista de suplentes en cola.',
    content: `
      <h3>1. Responder a la convocatoria</h3>
      <p>Al ingresar al partido publicado en tu grupo, verás los botones <strong>"Confirmar Asistencia"</strong> y <strong>"No Puedo Asistir"</strong>.</p>

      <h3>2. Lista de confirmados</h3>
      <p>Si hay cupo disponible, tu nombre aparecerá inmediatamente en la lista de jugadores titulares con el horario de tu confirmación.</p>

      <h3>3. Cola de suplentes automática</h3>
      <p>Si los 10 cupos ya están completos, el sistema te anotará automáticamente en la <strong>lista de suplentes</strong> respetando el orden de llegada. Si un titular se da de baja, el primer suplente subirá automáticamente al equipo titular.</p>

      <h3>4. Avisar con anticipación</h3>
      <p>Si te surge un imprevisto, cambiá tu estado a "No Puedo" lo antes posible para liberar el lugar a tus compañeros suplentes.</p>
    `,
  },
  'registrar-resultado': {
    title: 'Cómo Cargar Resultados, Goles y Votar al MVP',
    category: 'Estadísticas',
    icon: '📝',
    description: 'Guía para registrar el marcador final, asignar goles y asistencias a cada jugador y votar la figura de la cancha.',
    content: `
      <h3>1. Finalización del encuentro</h3>
      <p>Una vez concluido el partido, el organizador o administrador del grupo debe abrir la planilla digital del encuentro.</p>

      <h3>2. Carga del resultado final</h3>
      <p>Ingresá los goles anotados por el Equipo Claros y el Equipo Oscuros (ejemplo: Claros 8 - Oscuros 6).</p>

      <h3>3. Planilla de goles y asistencias</h3>
      <p>Asigná individualmente cuántos goles convirtió cada jugador y quiénes brindaron las asistencias. Esto actualizará al instante la tabla de goleadores histórica del grupo.</p>

      <h3>4. Votación anónima del MVP</h3>
      <p>Todos los participantes del partido tendrán habilitada la opción de votar de forma anónima al <strong>Jugador MVP</strong> de la fecha. La figura más votada recibirá una distinción en su perfil.</p>
    `,
  },
  'estadisticas': {
    title: 'Cómo se Calculan las Estadísticas y Promedios',
    category: 'Estadísticas',
    icon: '📊',
    description: 'Explicación detallada sobre cómo ProdeKapotes calcula los promedios de efectividad, victorias, goles por partido y nivel.',
    content: `
      <h3>1. Porcentaje de victorias (%)</h3>
      <p>Se calcula dividiendo la cantidad de partidos ganados por el total de partidos jugados y multiplicándolo por 100. Los empates otorgan un porcentaje neutro.</p>

      <h3>2. Promedio de goles por partido</h3>
      <p>Indica la cuota goleadora dividiendo tus goles totales acumulados sobre la cantidad de partidos en los que participaste.</p>

      <h3>3. Distinciones MVP</h3>
      <p>Se acumulan en tu ficha personal cada vez que el grupo te elige como el jugador destacado del encuentro.</p>

      <h3>4. Nivel del jugador</h3>
      <p>El algoritmo de la plataforma combina tu presentismo, efectividad y medallas para calcular un índice numérico de nivel que sirve para armar equipos equilibrados.</p>
    `,
  },
  'minijuegos': {
    title: 'Cómo Jugar los Minijuegos y Sumar Puntos',
    category: 'Minijuegos',
    icon: '🎮',
    description: 'Reglas y trucos para ganar en FutWordle, GolTexto y FutLegacy, y cómo acumular puntos en el ranking general.',
    content: `
      <h3>1. FutWordle</h3>
      <p>Tenés 6 oportunidades para acertar el nombre del futbolista misterioso. Usá las pistas por colores: verde si coincide el país/liga/posición, amarillo si es similar.</p>

      <h3>2. GolTexto</h3>
      <p>Analizá los clubes en los que jugó el futbolista a lo largo de su carrera y arriesgá la respuesta en el menor número de pistas posibles.</p>

      <h3>3. FutLegacy</h3>
      <p>Reconocé las camisetas icónicas de campeones del mundo y torneos continentales para demostrar tu conocimiento de la historia del fútbol.</p>

      <h3>4. Puntos y Rachas</h3>
      <p>Al acertar el juego del día obtenés puntos de recompensa. Si jugás varios días seguidos activás un multiplicador por racha ininterrumpida.</p>
    `,
  },
  'encontrar-cancha': {
    title: 'Cómo Buscar y Encontrar Canchas de Fútbol',
    category: 'Canchas',
    icon: '🏟️',
    description: 'Guía para filtrar complejos deportivos por zona, tipo de superficie, tamaño de cancha y comodidades.',
    content: `
      <h3>1. Acceder al directorio público</h3>
      <p>Ingresá a la sección <strong>"Canchas"</strong> en el menú principal para explorar más de 150 complejos registrados.</p>

      <h3>2. Aplicar filtros de zona</h3>
      <p>Filtrá los complejos por zona geográfica (CABA, Zona Norte, Zona Sur, Zona Oeste) para encontrar el predio más cercano a tu grupo.</p>

      <h3>3. Filtrar por tipo de cancha</h3>
      <p>Elegí la modalidad de tu partido: Fútbol 5, Fútbol 7, Fútbol 8 o Fútbol 11. Podés filtrar según la superficie (césped sintético, césped natural, techado, parquet).</p>

      <h3>4. Ver datos del complejo</h3>
      <p>Ingresá a la ficha del complejo para consultar dirección exacta, mapa, fotos del predio, estacionamiento, vestuarios, parrillas y números de contacto para reservar.</p>
    `,
  },
};

export default function HelpArticlePage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const article = ARTICLES_DATA[slug];

  useSEO({
    title: article ? `${article.title} - Centro de Ayuda` : 'Artículo de Ayuda',
    description: article ? article.description : 'Guía de ayuda de ProdeKapotes',
    keywords: 'ayuda prodekapotes, tutorial futbol 5, centro de ayuda futbol',
    canonicalUrl: `/ayuda/${slug}`,
  });

  if (!article) {
    return (
      <div className="seo-page-container">
        <Breadcrumbs items={[{ label: 'Ayuda', path: '/ayuda' }, { label: 'No Encontrado' }]} />
        <div className="card empty-state">
          <span className="empty-icon">❓</span>
          <h2>Artículo de ayuda no encontrado</h2>
          <p>El tema que estás buscando no existe o cambió de dirección.</p>
          <button className="btn-primary-lg" onClick={() => navigate('/ayuda')}>
            Volver al Centro de Ayuda
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="seo-page-container">
      <Breadcrumbs items={[{ label: 'Ayuda', path: '/ayuda' }, { label: article.category }]} />

      <article className="help-article-wrapper">
        <header className="help-article-header">
          <span className="help-article-category-badge">{article.icon} {article.category}</span>
          <h1 className="help-article-title">{article.title}</h1>
          <p className="help-article-lead">{article.description}</p>
        </header>

        <div
          className="help-article-body"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        <footer className="help-article-footer">
          <div className="help-feedback-box">
            <p>¿Te sirvió esta guía?</p>
            <button className="btn-secondary-sm" onClick={() => navigate('/contacto')}>
              📬 Contactar a Soporte
            </button>
            <button className="btn-primary-sm" onClick={() => navigate('/ayuda')}>
              📚 Ver Más Guías
            </button>
          </div>
        </footer>
      </article>
    </div>
  );
}
