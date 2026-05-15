# Prode Kapotes — Patterns & Conventions

> Living document for UX/UI patterns, code structure, and conventions.
> Keep this updated whenever a new pattern is introduced.

---

## Table of Contents

1. [Project Structure](#1-project-structure)
2. [Tech Stack](#2-tech-stack)
3. [Design System](#3-design-system)
4. [Frontend Conventions](#4-frontend-conventions)
5. [Backend Conventions](#5-backend-conventions)
6. [CSS Patterns](#6-css-patterns)
7. [Component Anatomy](#7-component-anatomy)
8. [Naming Conventions](#8-naming-conventions)
9. [State Management Patterns](#9-state-management-patterns)
10. [API Layer Pattern](#10-api-layer-pattern)

---

## 1. Project Structure

```
prode_kapotes/
├── front/                      # React + Vite frontend
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── src/
│       ├── main.jsx            # React entry point (ReactDOM.createRoot)
│       ├── App.jsx             # Router + layout shell + global state
│       ├── api.js              # ALL axios calls live here (single source of truth)
│       ├── styles.css          # Single global stylesheet (design system + all page styles)
│       ├── components/
│       │   ├── Header.jsx      # Sticky nav bar (hasGroups, pendingRequestsCount props)
│       │   └── Footer.jsx      # Simple brand footer
│       └── pages/
│           ├── AuthPage.jsx
│           ├── HomePage.jsx
│           ├── GroupsPage.jsx
│           ├── JoinGroupPage.jsx
│           ├── MatchesPage.jsx
│           ├── MatchDetail.jsx
│           ├── PredictionsPage.jsx
│           ├── ProfilePage.jsx
│           ├── RequestsPage.jsx
│           ├── LeaguePage.jsx
│           ├── Wordle.jsx
│           ├── GolTexto.jsx
│           ├── FutLegacy.jsx
│           └── VerifyEmailPage.jsx
└── back/                       # Flask backend
    ├── init.py                 # Flask app factory + extensions init
    ├── db.py                   # SQLAlchemy db instance
    ├── models.py               # All SQLAlchemy models
    ├── routes.py               # All Flask routes (single Blueprint `bp`)
    ├── services/               # Background/business logic services
    ├── jobs/                   # APScheduler jobs
    ├── migrations/             # Flask-Migrate migration files
    └── uploads/                # Local file uploads (avatars)
```

### Key Rules
- **One CSS file** — all styles go in `src/styles.css`. No CSS modules, no inline styles except for trivial one-offs (`style={{ marginBottom: 24 }}`).
- **One API file** — every HTTP call goes through `src/api.js`. Never call axios directly in a component.
- **One Blueprint** — all Flask routes are in `routes.py` registered on a single `bp = Blueprint('api', __name__)`.
- **One models file** — all SQLAlchemy models live in `models.py`.

---

## 2. Tech Stack

### Frontend
| Tool | Version | Purpose |
|---|---|---|
| React | 18 | UI framework |
| Vite | 5 | Build tool + dev server (`npm run dev`) |
| React Router DOM | 6 | Client-side routing (HashRouter) |
| Axios | 1.5 | HTTP client |
| Google Fonts — Inter | — | Typography |

### Backend
| Tool | Purpose |
|---|---|
| Flask | Web framework |
| Flask-SQLAlchemy | ORM |
| Flask-Migrate | DB migrations (`flask db migrate && flask db upgrade`) |
| Flask-JWT-Extended | JWT authentication |
| Flask-CORS | Cross-origin requests |
| Cloudinary | Profile picture hosting |
| Resend | Transactional email (verification) |
| APScheduler | Background jobs |
| Pillow | Image validation |
| PyMySQL | MySQL driver |

### Infrastructure
- **DB:** MySQL (Railway)
- **Backend deploy:** Railway
- **Frontend deploy:** Vercel
- **File storage:** Cloudinary (profile pics), local `/uploads/` (group avatars)

---

## 3. Design System

### Color Palette (CSS Variables in `:root`)

```css
/* Backgrounds */
--bg-primary:     #0a0f1a;           /* Page background — deep navy */
--bg-secondary:   #111827;
--bg-card:        rgba(17,24,39,0.7); /* Glassmorphism card bg */
--bg-card-solid:  #151d2e;
--bg-input:       rgba(15,23,42,0.8);

/* Borders */
--border:         rgba(255,255,255,0.08);
--border-hover:   rgba(255,255,255,0.15);
--glass-bg:       rgba(255,255,255,0.04);
--glass-border:   rgba(255,255,255,0.08);

/* Text */
--text-primary:   #f1f5f9;
--text-secondary: #94a3b8;
--text-muted:     #64748b;

/* Accent — primary brand green */
--accent:         #10b981;
--accent-light:   #34d399;
--accent-dark:    #059669;

/* Gold — secondary brand color */
--gold:           #f59e0b;
--gold-light:     #fbbf24;

/* Semantic */
--danger:         #ef4444;
--danger-light:   #fca5a5;
--success:        #22c55e;
```

### Shadows

```css
--shadow-sm:   0 2px 8px rgba(0,0,0,0.3);
--shadow-md:   0 8px 24px rgba(0,0,0,0.4);
--shadow-lg:   0 16px 48px rgba(0,0,0,0.5);
--shadow-glow: 0 0 20px rgba(16,185,129,0.15);  /* green ambient glow */
```

### Border Radii

```css
--radius-sm: 8px;
--radius-md: 12px;
--radius-lg: 16px;
--radius-xl: 24px;
```

### Transition

```css
--transition: 0.25s cubic-bezier(0.4, 0, 0.2, 1);
```

### Typography
- **Font:** `Inter` (Google Fonts, weights 400–800)
- Page titles: `1.5rem / 800 / letter-spacing: -0.02em`
- Body: `0.9–0.95rem / 400-500`
- Labels: `0.75–0.8rem / 600 / UPPERCASE / letter-spacing: 0.05em`
- Muted text: `var(--text-muted)`, `0.8rem`

### Gradient Pattern
The brand gradient is always `135deg, var(--accent) → var(--gold)`.
Used for: logo highlights, text gradients, primary buttons.

```css
background: linear-gradient(135deg, var(--accent), var(--gold));
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
background-clip: text;
```

---

## 4. Frontend Conventions

### Routing (`App.jsx`)

```jsx
// Public routes — no auth needed
<Route path="/" element={<HomePage />} />

// Protected routes — wrapped in <ProtectedRoute>
<Route path="/leagues" element={
  <ProtectedRoute><LeaguePage /></ProtectedRoute>
} />
```

- `ProtectedRoute` checks `localStorage.getItem('token')`. If missing → redirect to `/auth`.
- Auth + verify pages render **without** `<Header>` / `<Footer>` (handled by pathname check before main return).

### Page Shell Pattern

Every page file exports a **default function** named after the file:

```jsx
export default function LeaguePage() {
  // 1. State declarations
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 2. Data fetching in useEffect
  useEffect(() => { load(); }, []);

  const load = async () => { /* ... */ };

  // 3. Event handlers
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    setLoading(true);
    try {
      await someApiCall();
      setSuccess('✅ Operación exitosa');
    } catch (err) {
      setError(err?.response?.data?.error || 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  // 4. JSX
  return (
    <>
      <h2 className="page-title"><span className="icon">🏟️</span> Ligas</h2>
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
      {/* ... */}
    </>
  );
}
```

### Error/Success Feedback

Always a pair of state variables. Inline `&&` render:

```jsx
{error && <div className="error">{error}</div>}
{success && <div className="success">{success}</div>}
```

Reset both at the start of every handler: `setError(''); setSuccess('');`

### localStorage Keys

| Key | Value |
|---|---|
| `token` | JWT access token |
| `username` | Logged-in username |
| `groupId` | Currently selected group ID |

### Navigation

Always use `useNavigate()` hook. Never `<a href>` for internal links.

```jsx
const navigate = useNavigate();
navigate('/leagues');
```

### Empty State Pattern

```jsx
{items.length === 0 && (
  <div className="card empty-state">
    <span className="empty-icon">🏟️</span>
    <p>No hay ligas todavía.</p>
  </div>
)}
```

---

## 5. Backend Conventions

### Flask Blueprint

All routes live on a single blueprint:

```python
bp = Blueprint('api', __name__)
# Registered in init.py: app.register_blueprint(routes_bp)
```

### Route Pattern

```python
@bp.route('/leagues', methods=['POST'])
@jwt_required()
def create_league():
    data = request.json or {}
    current_user_id = get_jwt_identity()

    # 1. Validate input
    name = data.get('name')
    if not name:
        return jsonify({'error': 'name is required'}), 400

    # 2. Business logic (guard clauses first)
    if League.query.filter_by(name=name).first():
        return jsonify({'error': 'League already exists'}), 409

    # 3. Create & commit
    league = League(name=name, owner_id=current_user_id)
    db.session.add(league)
    db.session.commit()

    # 4. Return
    return jsonify({'message': 'League created', 'league_id': league.id}), 201
```

### Auth Pattern

```python
@jwt_required()          # Decorator — returns 401 if no/invalid token
def my_route():
    current_user_id = get_jwt_identity()  # Returns string (cast to int when needed)
    user = User.query.get(user_id)
```

### Ownership Guard

```python
if str(league.owner_id) != str(current_user_id):
    return jsonify({'error': 'Only the owner can do this'}), 403
```

### Error Response Shape

```python
# Always use 'error' key for errors
return jsonify({'error': 'Human-readable message'}), 4xx

# Success with data
return jsonify({'message': 'Action completed', 'id': obj.id}), 200/201
```

### Models Pattern

```python
class League(db.Model):
    __tablename__ = 'leagues'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    owner_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships with cascade delete
    members = db.relationship('LeagueMember', back_populates='league',
                              lazy=True, cascade='all, delete-orphan')
```

### Migration Workflow

```bash
cd back
flask db migrate -m "add league tables"
flask db upgrade
```

---

## 6. CSS Patterns

### Card (glass effect)

```css
.card {
  background: var(--bg-card);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  padding: 24px;
  box-shadow: var(--shadow-md);
  transition: var(--transition);
}
.card:hover { border-color: var(--border-hover); }
```

### Primary Button

```css
.btn-primary {
  background: linear-gradient(135deg, var(--accent), var(--accent-dark));
  color: #fff;
  border: none;
  border-radius: var(--radius-sm);
  padding: 10px 16px;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
}
.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(16,185,129,0.25);
}
```

### Input Field

```css
input {
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  padding: 12px 16px;
  font-family: inherit;
  outline: none;
  transition: var(--transition);
}
input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(16,185,129,0.15);
}
```

### Accent Badge / Tag

```css
.badge-accent {
  display: inline-flex;
  align-items: center;
  background: rgba(16,185,129,0.1);
  border: 1px solid rgba(16,185,129,0.2);
  border-radius: 20px;
  padding: 4px 12px;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--accent);
}
```

### Error / Success Messages

```css
.error {
  background: rgba(239,68,68,0.1);
  border: 1px solid rgba(239,68,68,0.2);
  border-radius: var(--radius-md);
  color: var(--danger-light);
  padding: 12px 16px;
  font-size: 0.875rem;
}
.success {
  background: rgba(34,197,94,0.1);
  border: 1px solid rgba(34,197,94,0.2);
  border-radius: var(--radius-md);
  color: var(--success);
  padding: 12px 16px;
  font-size: 0.875rem;
}
```

### Section Grouping Pattern

Use `<>` fragments as page root; group sections semantically:

```jsx
return (
  <>
    <h2 className="page-title">…</h2>

    {/* Feedback */}
    {error && <div className="error">{error}</div>}
    {success && <div className="success">{success}</div>}

    {/* Main grid */}
    <div className="two-col-grid">
      <div className="action-card">…</div>
      <div className="action-card">…</div>
    </div>

    {/* List */}
    <div className="card" style={{ marginTop: 24 }}>…</div>
  </>
);
```

---

## 7. Component Anatomy

### Header (`Header.jsx`)
- Props: `hasGroups` (bool), `pendingRequestsCount` (int)
- Shows full nav when `hasGroups` is true; otherwise only "➕ Grupos" link.
- Active link: `isActive(path)` via `useLocation`.
- Logout clears `localStorage` and reloads.

### Footer (`Footer.jsx`)
- Static. Brand text + copyright. No props.

### Page layout
- `<Header>` + `<main className="app-main">` + `<Footer>` assembled in `App.jsx`.
- `app-main` has `max-width: 1100px`, `margin: 0 auto`, `padding: 32px 20px`.
- Pages render inside `app-main` — they should use `<>` fragments, not add their own outer `<div>`.

---

## 8. Naming Conventions

| Item | Convention | Example |
|---|---|---|
| React components | PascalCase | `LeaguePage`, `GroupsPage` |
| CSS classes | kebab-case | `league-card`, `action-card` |
| API functions | camelCase verb+noun | `createLeague`, `getLeagueById` |
| Flask routes | snake_case | `create_league`, `get_league` |
| DB models | PascalCase | `League`, `LeagueTeam` |
| DB tables | snake_case plural | `leagues`, `league_teams` |
| State vars | camelCase | `loadingAction`, `selectedLeague` |
| UI language | **Spanish** (Argentine) | "Crear liga", "Miembros", "Salir" |
| Error messages (backend) | English (internal) | `'Only the owner can do this'` |
| User-facing error display | Spanish | `err?.response?.data?.error` |

---

## 9. State Management Patterns

### No global state manager — use `localStorage` + prop drilling

- `token` in `localStorage` is the auth source of truth
- `groupId` in `localStorage` is the selected group
- `App.jsx` fetches groups on mount, passes `hasGroups` down to `Header`
- Individual pages fetch their own data via `useEffect`

### Refresh after mutation

After any create/update/delete, always re-fetch the affected list:

```jsx
await createLeague(payload);
setSuccess('✅ Liga creada');
await load(); // re-fetch list
```

### Loading states

Use a single `loadingAction` boolean for form submission disabling:

```jsx
const [loadingAction, setLoadingAction] = useState(false);
// In handler:
setLoadingAction(true);
try { ... } finally { setLoadingAction(false); }
// In JSX:
<button disabled={loadingAction}>
  {loadingAction ? 'Guardando...' : 'Guardar'}
</button>
```

---

## 10. API Layer Pattern

All API calls in `src/api.js`:

```js
// Auth header helper
function authHeaders() {
  const token = localStorage.getItem('token');
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

// Pattern: named async function, returns axios promise
export async function createLeague(payload) {
  return axios.post(`${API_URL}/leagues`, payload, { headers: authHeaders() });
}

export async function getMyLeagues() {
  return axios.get(`${API_URL}/leagues`, { headers: authHeaders() });
}

export async function getLeagueById(leagueId) {
  return axios.get(`${API_URL}/leagues/${leagueId}`, { headers: authHeaders() });
}
```

### Usage in components

```jsx
import { createLeague, getMyLeagues } from '../api';

// Always handle loading + error + success
try {
  const res = await createLeague({ name, description });
  setSuccess('✅ Liga creada');
} catch (err) {
  setError(err?.response?.data?.error || 'Error al crear la liga');
}
```

### FormData (file uploads)

```js
export async function createGroup(formData) {
  const token = localStorage.getItem('token');
  return axios.post(`${API_URL}/groups`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });
}
```

---

*Last updated: 2026-05-15*
