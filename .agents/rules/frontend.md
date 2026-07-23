---
trigger: always_on
description: Frontend React page patterns, routing, state management, and UI conventions.
---

# Frontend Conventions & State Management Rules

## 1. Routing & Layout (`App.jsx`)
- **Protected Routes:** Wrap authenticated routes in `<ProtectedRoute>`. `ProtectedRoute` checks `localStorage.getItem('token')` and redirects to `/auth` if missing.
- **Header/Footer:** Auth & verification pages render without `<Header>` / `<Footer>`.
- **Page Container:** `<Header>` + `<main className="app-main">` + `<Footer>` are assembled in `App.jsx`. `app-main` handles centered maximum width (`1100px`) and padding. Individual pages MUST use React top-level fragments `<>` and NOT add redundant outer wrapper divs.

## 2. Navigation
- Always use the `useNavigate()` hook for client-side navigation (`navigate('/leagues')`).
- Never use raw `<a href="...">` for internal routes.

## 3. Page Shell & State Patterns
Every page component must export a default function matching its filename and structure state as follows:

```jsx
export default function LeaguePage() {
  // 1. State declarations
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loadingAction, setLoadingAction] = useState(false);
  const navigate = useNavigate();

  // 2. Data fetching
  useEffect(() => { load(); }, []);
  const load = async () => { /* ... */ };

  // 3. Handlers
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(''); // Reset feedback first
    setLoadingAction(true);
    try {
      await createLeague(payload);
      setSuccess('✅ Liga creada');
      await load(); // Refresh data after mutation
    } catch (err) {
      setError(err?.response?.data?.error || 'Error al realizar la operación');
    } finally {
      setLoadingAction(false);
    }
  };

  // 4. JSX
  return (
    <>
      <h2 className="page-title"><span className="icon">🏟️</span> Ligas</h2>
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
      {items.length === 0 && (
        <div className="card empty-state">
          <span className="empty-icon">🏟️</span>
          <p>No hay ligas todavía.</p>
        </div>
      )}
    </>
  );
}
```

## 4. State & Mutation Rules
- **No global state manager:** Use `localStorage` (`token`, `username`, `groupId`) and prop drilling where appropriate.
- **Refresh after mutation:** Always re-fetch list data (`await load()`) immediately after any create, update, or delete action.
- **Loading UI state:** Use a `loadingAction` boolean state to disable buttons during async execution (`disabled={loadingAction}`).
