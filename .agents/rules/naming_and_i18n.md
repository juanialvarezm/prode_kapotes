---
trigger: always_on
description: Project-wide naming conventions, casing matrix, and internationalization language rules.
---

# Naming Conventions & i18n Rules

## 1. Naming Matrix

| Element | Convention | Example |
|---|---|---|
| React components | `PascalCase` | `LeaguePage`, `MatchDetail` |
| CSS classes | `kebab-case` | `league-card`, `action-card` |
| API functions | `camelCase` (verb + noun) | `createLeague`, `getLeagueById` |
| Flask routes | `snake_case` | `create_league`, `get_league_members` |
| DB models | `PascalCase` | `League`, `LeagueMember` |
| DB tables | `snake_case` plural | `leagues`, `league_members` |
| React State vars | `camelCase` | `loadingAction`, `selectedLeague` |

## 2. Language & Internationalization (i18n) Rules
- **User Interface (UI):** All user-facing UI text, labels, page titles, and button captions MUST be in **Argentine Spanish** (e.g., "Crear liga", "Miembros", "Guardar", "Salir").
- **Backend Error Messages:** Flask route return payloads specify internal error strings in **English** (e.g., `{'error': 'Only the owner can do this'}`).
- **Frontend Error Display:** React components render backend errors directly (`err?.response?.data?.error`) with a fallback message in **Spanish** (e.g., `'Error desconocido al procesar la solicitud'`).
