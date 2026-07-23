import { useState } from 'react';
import { useSEO } from '../utils/useSEO';
import Breadcrumbs from '../components/Breadcrumbs';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useSEO({
    title: 'Contacto y Soporte técnico',
    description: 'Comunicate con el equipo de ProdeKapotes. Enviá consultas, sugerencias, soporte para grupos o propuestas comerciales de complejos.',
    canonicalUrl: '/contacto',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    setSubmitted(true);
  };

  return (
    <div className="seo-page-container">
      <Breadcrumbs items={[{ label: 'Contacto' }]} />

      <header className="seo-page-header">
        <span className="seo-page-icon" aria-hidden="true">📬</span>
        <h1 className="seo-page-title">
          Contacto y <span className="text-highlight">Soporte</span>
        </h1>
        <p className="seo-page-lead">
          ¿Tenés preguntas, querés registrar tu complejo de canchas o necesitás ayuda con tu grupo? Escribinos.
        </p>
      </header>

      <div className="contact-grid">
        {/* Contact info card */}
        <div className="seo-card contact-info-card">
          <h2>Información de Contacto</h2>
          <p>Estamos para asistirte en todo lo relacionado con la plataforma.</p>

          <div className="contact-info-list">
            <div className="contact-info-item">
              <span className="contact-icon">📧</span>
              <div>
                <strong>Correo Electrónico de Soporte:</strong>
                <p>soporte@prodekapotes.com</p>
              </div>
            </div>

            <div className="contact-info-item">
              <span className="contact-icon">🏟️</span>
              <div>
                <strong>Para Complejos Deportivos:</strong>
                <p>canchas@prodekapotes.com</p>
              </div>
            </div>

            <div className="contact-info-item">
              <span className="contact-icon">📍</span>
              <div>
                <strong>Ubicación:</strong>
                <p>Buenos Aires, Argentina</p>
              </div>
            </div>

            <div className="contact-info-item">
              <span className="contact-icon">⚡</span>
              <div>
                <strong>Tiempo de Respuesta:</strong>
                <p>Generalmente respondemos en menos de 24 horas hábiles.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="seo-card contact-form-card">
          <h2>Enviarnos un Mensaje</h2>

          {submitted ? (
            <div className="success">
              <h3>✅ ¡Mensaje enviado con éxito!</h3>
              <p>Gracias por comunicarte con ProdeKapotes. Te responderemos a la brevedad a tu correo ({email}).</p>
              <button
                type="button"
                className="btn-primary-sm"
                style={{ marginTop: 16 }}
                onClick={() => { setSubmitted(false); setMessage(''); }}
              >
                Enviar otro mensaje
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-group">
                <label htmlFor="contact-name">Tu Nombre</label>
                <input
                  id="contact-name"
                  type="text"
                  required
                  placeholder="Ej: Juan Pérez"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="contact-email">Correo Electrónico</label>
                <input
                  id="contact-email"
                  type="email"
                  required
                  placeholder="ejemplo@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="contact-message">Mensaje o Consulta</label>
                <textarea
                  id="contact-message"
                  rows="5"
                  required
                  placeholder="Escribí acá tu consulta, sugerencia o comentario..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              <button type="submit" className="btn-primary-lg">
                ✉️ Enviar Consulta
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
