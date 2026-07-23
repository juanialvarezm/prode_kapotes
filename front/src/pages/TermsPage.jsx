import { useNavigate } from 'react-router-dom';
import { useSEO } from '../utils/useSEO';
import Breadcrumbs from '../components/Breadcrumbs';

export default function TermsPage() {
  const navigate = useNavigate();

  useSEO({
    title: 'Términos y Condiciones de Uso',
    description: 'Términos y condiciones de uso de la plataforma ProdeKapotes. Normas de convivencia, uso de cuenta y responsabilidades.',
    canonicalUrl: '/terminos-y-condiciones',
  });

  return (
    <div className="seo-page-container">
      <Breadcrumbs items={[{ label: 'Términos y Condiciones' }]} />

      <header className="seo-page-header">
        <span className="seo-page-icon" aria-hidden="true">📜</span>
        <h1 className="seo-page-title">
          Términos y <span className="text-highlight">Condiciones</span>
        </h1>
        <p className="seo-page-lead">
          Última actualización: 20 de mayo de 2025. Al acceder y utilizar ProdeKapotes, aceptás los siguientes términos de servicio.
        </p>
      </header>

      <article className="legal-document-body">
        <section className="legal-section">
          <h2>1. Aceptación de los Términos</h2>
          <p>
            Al registrar una cuenta o hacer uso de los servicios brindados por ProdeKapotes (en adelante, "la Plataforma"),
            el usuario acepta cumplir y estar sujeto a los presentes Términos y Condiciones. Si no estás de acuerdo con alguna parte de estas condiciones,
            debés abstenerte de utilizar la Plataforma.
          </p>
        </section>

        <section className="legal-section">
          <h2>2. Descripción del Servicio</h2>
          <p>
            ProdeKapotes proporciona una plataforma web de gestión para entusiastas y jugadores de fútbol amateur.
            Los servicios incluyen la posibilidad de crear y unirse a grupos de usuarios, publicar convocatorias para partidos,
            confirmar asistencia, llevar tablas de estadísticas, consultar directorios de canchas y participar en minijuegos temáticos.
          </p>
        </section>

        <section className="legal-section">
          <h2>3. Registro de Cuenta y Seguridad</h2>
          <p>
            El usuario es responsable de mantener la confidencialidad de sus credenciales de acceso (nombre de usuario y contraseña)
            y de todas las actividades que ocurran bajo su cuenta. ProdeKapotes no se responsabiliza por pérdidas derivadas del uso no autorizado de cuentas.
          </p>
        </section>

        <section className="legal-section">
          <h2>4. Normas de Convivencia y Contenido Generado por el Usuario</h2>
          <p>
            Queda estrictamente prohibido utilizar la Plataforma para difundir contenido ofensivo, discriminatorio, difamatorio o ilegal.
            Los administradores de ProdeKapotes se reservan el derecho de suspender o eliminar cuentas que incurran en faltas de respeto
            o uso indebido de los módulos de grupos y mensajes.
          </p>
        </section>

        <section className="legal-section">
          <h2>5. Reservas de Canchas y Alquileres</h2>
          <p>
            ProdeKapotes actúa como un directorio informativo y facilitador para la búsqueda de complejos deportivos.
            La Plataforma no gestiona cobros directos por alquileres de canchas ni se responsabiliza por cancelaciones,
            disponibilidad real o disputas entre los usuarios y los complejos deportivos.
          </p>
        </section>

        <section className="legal-section">
          <h2>6. Modificaciones a los Servicios</h2>
          <p>
            ProdeKapotes se reserva el derecho de modificar, actualizar o discontinuar temporal o permanentemente cualquiera de sus funciones,
            notificando oportunamente a la comunidad de usuarios.
          </p>
        </section>

        <section className="legal-section">
          <h2>7. Contacto Legal</h2>
          <p>
            Ante cualquier consulta vinculada con estos Términos y Condiciones, podés escribirnos a través de nuestra página de
            <button type="button" className="inline-link" onClick={() => navigate('/contacto')}> Contacto</button>.
          </p>
        </section>
      </article>
    </div>
  );
}
