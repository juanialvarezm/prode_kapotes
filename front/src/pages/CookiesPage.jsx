import { useNavigate } from 'react-router-dom';
import { useSEO } from '../utils/useSEO';
import Breadcrumbs from '../components/Breadcrumbs';

export default function CookiesPage() {
  const navigate = useNavigate();

  useSEO({
    title: 'Política de Cookies y Almacenamiento Local',
    description: 'Información transparente sobre el uso de cookies y almacenamiento local (LocalStorage) en ProdeKapotes.',
    canonicalUrl: '/politica-de-cookies',
  });

  return (
    <div className="seo-page-container">
      <Breadcrumbs items={[{ label: 'Política de Cookies' }]} />

      <header className="seo-page-header">
        <span className="seo-page-icon" aria-hidden="true">🍪</span>
        <h1 className="seo-page-title">
          Política de <span className="text-highlight">Cookies</span>
        </h1>
        <p className="seo-page-lead">
          En ProdeKapotes respetamos tu privacidad. Conocé cómo utilizamos las tecnologías de almacenamiento web para garantizar tu sesión.
        </p>
      </header>

      <article className="legal-document-body">
        <section className="legal-section">
          <h2>1. ¿Qué son las Cookies y el Almacenamiento Local?</h2>
          <p>
            Las cookies y el almacenamiento local (LocalStorage) son pequeños archivos de datos o registros de memoria que los sitios web
            guardan en el navegador de tu dispositivo para recordar tus preferencias y mantener activa tu sesión iniciada.
          </p>
        </section>

        <section className="legal-section">
          <h2>2. Tecnologías utilizadas en ProdeKapotes</h2>
          <p>
            ProdeKapotes utiliza principalmente <strong>LocalStorage</strong> para garantizar el funcionamiento técnico del juego y la aplicación:
          </p>
          <ul className="legal-list">
            <li><strong>Token de Autenticación (JWT):</strong> Permite que tu cuenta permanezca iniciada de manera segura entre visitas sin que tengas que escribir tu contraseña cada vez.</li>
            <li><strong>ID de Grupo Activo:</strong> Guarda la preferencia del grupo que estás consultando para brindarte una navegación fluida.</li>
            <li><strong>Preferencia de Nombre de Usuario:</strong> Guarda temporalmente tu nombre para personalizar los saludos en la interfaz.</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>3. Ausencia de Cookies de Rastreo de Terceros</h2>
          <p>
            ProdeKapotes <strong>NO</strong> utiliza cookies de rastreo publicitario de terceros ni vende tus hábitos de navegación a anunciantes.
          </p>
        </section>

        <section className="legal-section">
          <h2>4. Cómo administrar o eliminar tus datos almacenados</h2>
          <p>
            Podés borrar las cookies y datos de LocalStorage en cualquier momento desde la configuración de tu navegador (Opciones de Privacidad / Borrar datos de navegación) o haciendo clic en el botón <strong>"Salir"</strong> dentro de la plataforma.
          </p>
        </section>

        <section className="legal-section">
          <h2>5. Más Información</h2>
          <p>
            Si tenés dudas sobre nuestra Política de Cookies, podés revisar nuestra
            <button type="button" className="inline-link" onClick={() => navigate('/politica-de-privacidad')}> Política de Privacidad</button> o ponerte en
            <button type="button" className="inline-link" onClick={() => navigate('/contacto')}> contacto con nosotros</button>.
          </p>
        </section>
      </article>
    </div>
  );
}
