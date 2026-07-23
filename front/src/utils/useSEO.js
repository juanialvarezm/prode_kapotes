import { useEffect } from 'react';

/**
 * Custom hook for dynamic SEO meta tags & Schema.org JSON-LD structured data injection.
 * @param {Object} options
 * @param {string} options.title - Page title
 * @param {string} options.description - Meta description
 * @param {string} [options.keywords] - Meta keywords
 * @param {string} [options.canonicalUrl] - Canonical URL path
 * @param {string} [options.ogType] - Open Graph type (default: 'website')
 * @param {Object|Array} [options.jsonLd] - Schema.org JSON-LD object or array of objects
 */
export function useSEO({
  title,
  description,
  keywords,
  canonicalUrl,
  ogType = 'website',
  jsonLd,
}) {
  useEffect(() => {
    // 1. Title
    const fullTitle = title ? `${title} | ProdeKapotes` : 'ProdeKapotes | Plataforma para Organizar Partidos de Fútbol Amateur';
    document.title = fullTitle;

    // 2. Meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description || 'Organizá partidos de fútbol amateur, buscá canchas, confirmá asistencias, llevá estadísticas y jugá minijuegos de fútbol con tus amigos en ProdeKapotes.');

    // 3. Meta keywords
    if (keywords) {
      let metaKw = document.querySelector('meta[name="keywords"]');
      if (!metaKw) {
        metaKw = document.createElement('meta');
        metaKw.setAttribute('name', 'keywords');
        document.head.appendChild(metaKw);
      }
      metaKw.setAttribute('content', keywords);
    }

    // 4. Open Graph
    const setOgTag = (property, content) => {
      let tag = document.querySelector(`meta[property="${property}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('property', property);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    setOgTag('og:title', fullTitle);
    setOgTag('og:description', description || 'Organizá partidos de fútbol amateur sin caos en ProdeKapotes.');
    setOgTag('og:type', ogType);
    setOgTag('og:site_name', 'ProdeKapotes');

    // 5. Canonical Link
    const baseUrl = 'https://www.prodekapotes.com';
    const fullCanonical = canonicalUrl ? `${baseUrl}${canonicalUrl}` : window.location.href;
    let canonicalTag = document.querySelector('link[rel="canonical"]');
    if (!canonicalTag) {
      canonicalTag = document.createElement('link');
      canonicalTag.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalTag);
    }
    canonicalTag.setAttribute('href', fullCanonical);

    // 6. JSON-LD Schema.org Structured Data
    const scriptId = 'json-ld-seo-script';
    let scriptTag = document.getElementById(scriptId);
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = scriptId;
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }

    const defaultSchema = {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      'name': 'ProdeKapotes',
      'operatingSystem': 'Web',
      'applicationCategory': 'SportsApplication',
      'offers': {
        '@type': 'Offer',
        'price': '0',
        'priceCurrency': 'USD'
      },
      'description': 'Plataforma web integral para organizar partidos de fútbol amateur, gestionar grupos de amigos, buscar canchas y llevar estadísticas de jugadores.'
    };

    const schemaContent = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [defaultSchema];
    scriptTag.textContent = JSON.stringify(schemaContent);

    // Cleanup on unmount (optional, but keep default title fallback)
    return () => {
      // Keep title clean when navigating
    };
  }, [title, description, keywords, canonicalUrl, ogType, jsonLd]);
}
