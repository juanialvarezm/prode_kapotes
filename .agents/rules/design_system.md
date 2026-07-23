---
trigger: always_on
description: Design system tokens, CSS variables, color palettes, typography, and reusable UI styles.
---

# Design System & Styling Rules

All styling MUST be placed in `front/src/styles.css` using the project's CSS variables and utility classes.

## 1. Design System Tokens (`:root`)

```css
/* Backgrounds */
--bg-primary:     #0a0f1a;           /* Deep navy page background */
--bg-secondary:   #111827;
--bg-card:        rgba(17,24,39,0.7); /* Glassmorphism card background */
--bg-card-solid:  #151d2e;
--bg-input:       rgba(15,23,42,0.8);

/* Borders & Glass */
--border:         rgba(255,255,255,0.08);
--border-hover:   rgba(255,255,255,0.15);
--glass-bg:       rgba(255,255,255,0.04);
--glass-border:   rgba(255,255,255,0.08);

/* Text Colors */
--text-primary:   #f1f5f9;
--text-secondary: #94a3b8;
--text-muted:     #64748b;

/* Brand Palette */
--accent:         #10b981;           /* Primary brand green */
--accent-light:   #34d399;
--accent-dark:    #059669;
--gold:           #f59e0b;           /* Secondary brand gold */
--gold-light:     #fbbf24;

/* Status Colors */
--danger:         #ef4444;
--danger-light:   #fca5a5;
--success:        #22c55e;

/* Shadows & Radii */
--shadow-sm:   0 2px 8px rgba(0,0,0,0.3);
--shadow-md:   0 8px 24px rgba(0,0,0,0.4);
--shadow-lg:   0 16px 48px rgba(0,0,0,0.5);
--shadow-glow: 0 0 20px rgba(16,185,129,0.15);

--radius-sm: 8px;
--radius-md: 12px;
--radius-lg: 16px;
--radius-xl: 24px;

--transition: 0.25s cubic-bezier(0.4, 0, 0.2, 1);
```

## 2. Typography Guidelines
- **Font Family:** `Inter` (Google Fonts, weights 400–800).
- **Page Titles:** `1.5rem` / weight 800 / `letter-spacing: -0.02em`.
- **Body Text:** `0.9–0.95rem` / weight 400–500.
- **Labels:** `0.75–0.8rem` / weight 600 / `UPPERCASE` / `letter-spacing: 0.05em`.
- **Muted Text:** `var(--text-muted)` / `0.8rem`.

## 3. Brand Gradient Pattern
The primary brand gradient is `135deg, var(--accent) → var(--gold)` used for logos, title text highlights, and primary call-to-actions.

```css
background: linear-gradient(135deg, var(--accent), var(--gold));
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
background-clip: text;
```

## 4. Standard Component CSS Patterns

### Glassmorphism Card (`.card`)
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

### Primary Button (`.btn-primary`)
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

### Input Field (`input`)
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

### Feedback Alerts (`.error`, `.success`)
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
