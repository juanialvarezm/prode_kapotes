import { useNavigate } from 'react-router-dom';

/**
 * Breadcrumbs navigation component with accessibility & SEO Schema.org support.
 * @param {Object} props
 * @param {Array<{label: string, path?: string}>} props.items
 */
export default function Breadcrumbs({ items = [] }) {
  const navigate = useNavigate();

  if (!items || items.length === 0) return null;

  const fullItems = [
    { label: 'Inicio', path: '/' },
    ...items,
  ];

  return (
    <nav className="breadcrumbs-nav" aria-label="Navegación secundaria">
      <ol className="breadcrumbs-list">
        {fullItems.map((item, idx) => {
          const isLast = idx === fullItems.length - 1;
          return (
            <li key={idx} className={`breadcrumb-item ${isLast ? 'active' : ''}`}>
              {isLast || !item.path ? (
                <span className="breadcrumb-current" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <button
                  type="button"
                  className="breadcrumb-link"
                  onClick={() => navigate(item.path)}
                >
                  {item.label}
                </button>
              )}
              {!isLast && <span className="breadcrumb-separator">/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
