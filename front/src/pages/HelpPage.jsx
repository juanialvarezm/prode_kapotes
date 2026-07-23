import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSEO } from '../utils/useSEO';
import Breadcrumbs from '../components/Breadcrumbs';
import { ARTICLES_DATA } from './HelpArticlePage';

export default function HelpPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  useSEO({
    title: 'Centro de Ayuda y Preguntas Frecuentes',
    description: 'Encontrá respuestas y guías paso a paso sobre cómo organizar partidos, administrar grupos, consultar estadísticas y jugar minijuegos en ProdeKapotes.',
    keywords: 'ayuda prodekapotes, soporte futbol 5, como usar prodekapotes, preguntas frecuentes futbol',
    canonicalUrl: '/ayuda',
  });

  const articlesList = Object.entries(ARTICLES_DATA).map(([slug, data]) => ({
    slug,
    ...data,
  }));

  const filteredArticles = articlesList.filter(article =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="seo-page-container">
      <Breadcrumbs items={[{ label: 'Ayuda' }]} />

      <header className="seo-page-header">
        <span className="seo-page-icon" aria-hidden="true">❓</span>
        <h1 className="seo-page-title">
          Centro de Ayuda de <span className="text-highlight">ProdeKapotes</span>
        </h1>
        <p className="seo-page-lead">
          ¿Tenés dudas sobre cómo usar la plataforma? Explorá nuestras guías detalladas y preguntas frecuentes.
        </p>

        {/* Search Input */}
        <div className="help-search-wrapper">
          <label htmlFor="help-search-input" className="sr-only">Buscar en el centro de ayuda</label>
          <input
            id="help-search-input"
            type="text"
            className="help-search-input"
            placeholder="🔍 Buscar una guía o pregunta (ej: crear grupo, cancha, rsvp...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </header>

      {/* Popular Help Articles Grid */}
      <section className="seo-section">
        <h2 className="seo-section-title">Guías y Tutoriales Recomendados</h2>

        <div className="seo-grid-3">
          {filteredArticles.map((art) => (
            <article
              key={art.slug}
              className="seo-card help-card-clickable"
              onClick={() => navigate(`/ayuda/${art.slug}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && navigate(`/ayuda/${art.slug}`)}
            >
              <div className="help-card-header">
                <span className="help-card-icon">{art.icon}</span>
                <span className="help-card-category">{art.category}</span>
              </div>
              <h3 className="help-card-title">{art.title}</h3>
              <p className="help-card-desc">{art.description}</p>
              <span className="help-card-readmore">Leer guía completa →</span>
            </article>
          ))}
        </div>

        {filteredArticles.length === 0 && (
          <div className="card empty-state">
            <span className="empty-icon">🔍</span>
            <p>No encontramos guías con el término "{searchQuery}".</p>
            <button className="btn-secondary-sm" onClick={() => setSearchQuery('')}>
              Ver todas las guías
            </button>
          </div>
        )}
      </section>

      {/* Quick FAQs */}
      <section className="seo-section">
        <h2 className="seo-section-title">Preguntas Frecuentes Rápidas</h2>

        <div className="faq-grid">
          <details className="faq-item">
            <summary className="faq-question">¿Es gratis usar ProdeKapotes?</summary>
            <div className="faq-answer">
              <p>Sí, la plataforma es 100% gratuita para organizadores y jugadores de fútbol amateur.</p>
            </div>
          </details>

          <details className="faq-item">
            <summary className="faq-question">¿Tengo que descargar una app de la App Store?</summary>
            <div className="faq-answer">
              <p>No. ProdeKapotes es una plataforma web progresiva que funciona directamente en el navegador de tu celular o computadora sin ocupar espacio de almacenamiento.</p>
            </div>
          </details>

          <details className="faq-item">
            <summary className="faq-question">¿Puedo ingresar solo para jugar a los minijuegos?</summary>
            <div className="faq-answer">
              <p>¡Por supuesto! Podés registrarte, jugar diariamente a FutWordle, GolTexto y FutLegacy, y competir en el ranking global sin necesidad de tener un grupo de fútbol activo.</p>
            </div>
          </details>

          <details className="faq-item">
            <summary className="faq-question">¿Cómo puedo registrar mi complejo de canchas?</summary>
            <div className="faq-answer">
              <p>Si administrás un complejo de fútbol, comunicate con nosotros a través de la página de contacto para incorporar tu predio a nuestro directorio de canchas.</p>
            </div>
          </details>
        </div>
      </section>

      {/* Need More Help */}
      <div className="seo-cta-banner">
        <h2>¿No encontraste lo que buscabas?</h2>
        <p>Nuestro equipo de soporte está disponible para resolver tus dudas.</p>
        <button className="btn-primary-lg" onClick={() => navigate('/contacto')}>
          Contactar con Soporte
        </button>
      </div>
    </div>
  );
}
