---
trigger: always_on
description: Core project structure, single-source files, and tech stack guidelines.
---

# Project Structure & Architecture Rules

## Single Source of Truth Files
- **Single CSS File:** All application styles MUST live in `front/src/styles.css`. Do not create CSS modules, styled components, or inline styles (except for trivial single numeric inline overrides like `style={{ marginBottom: 24 }}`).
- **Single API File:** All client HTTP requests MUST go through `front/src/api.js`. Never invoke `axios` directly inside React components or pages.
- **Single Backend Blueprint:** All Flask API routes live in `back/routes.py` registered under a single `bp = Blueprint('api', __name__)`.
- **Single Models File:** All SQLAlchemy database models live in `back/models.py`.

## Tech Stack Overview
- **Frontend:** React 18, Vite 5 (`npm run dev`), React Router DOM 6 (`HashRouter`), Axios, Google Font Inter.
- **Backend:** Flask, Flask-SQLAlchemy, Flask-Migrate (`flask db migrate && flask db upgrade`), Flask-JWT-Extended, Flask-CORS, PyMySQL, APScheduler.
- **Infrastructure:** MySQL (Railway), Cloudinary (user profile pics), Resend (emails).
