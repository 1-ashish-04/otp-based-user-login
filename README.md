# OTP-Based User Login & Recognition Checkout

A small web app with two flows: registering with a 6-digit login code, and a
checkout form that recognizes returning users by email in the background and
lets them log in with that code (or skip and continue as a guest).

## Architecture

Three distinct layers, per the assignment brief:

```
frontend/   React + Vite (UI)
backend/    Django + Django REST Framework (API)
database/   schema.sql (checked-in Postgres schema, mirrors the Django models)
```

- **Frontend** talks to the backend only through `frontend/src/api.js`.
- **Backend** exposes a small JSON API under `/api/` (`accounts` app) and uses
  `DATABASE_URL` (Postgres) when set, falling back to local SQLite for
  development.
- **Database**: `database/schema.sql` is the checked-in source of truth for
  the schema. In practice it's generated/applied automatically by Django
  migrations (`python manage.py migrate`) — the `.sql` file is there so the
  schema is reviewable without running the app.

## Flows

### 1. Registration
`RegistrationForm.jsx` → `POST /api/register/` → creates a `RegisteredUser`
with a random 6-digit `login_code`, returned once and shown to the user (they
need to save it themselves — it isn't emailed or stored anywhere visible again).

### 2. Checkout / recognition / login
`CheckoutForm.jsx`:
1. As the user types their email, it's validated client-side for a
   well-formed address.
2. Once well-formed, a debounced background call hits
   `GET /api/check-email/?email=...` while the user keeps filling out phone
   and address.
3. If the email matches a registered user, a modal (`LoginModal.jsx`) pops up
   asking for the 6-digit code, **with a "Skip and continue as guest" option**.
4. Submitting the code calls `POST /api/verify-code/`. Match → user is logged
   in (name shown in a banner, email field locked) and the modal closes.
   Mismatch → inline error in the modal, user can retry or skip.
5. **Skipping** (or never being recognized) means checkout continues without
   authentication — this is the "guest" path. It is not inferred silently:
   the frontend tracks it explicitly (`loggedInUser` state) and sends
   `was_logged_in: true/false` on submit. The backend independently records
   whether the submitted email matches a real account (`matched_user`), so a
   guest checkout using a registered email is still linked to that account in
   the data, even though the person wasn't authenticated. This distinguishes
   three real cases: logged-in, guest-with-known-email, and guest-with-new-email.
6. `POST /api/checkout/` just records the submission — no payment processing.

## Local development

### Backend
```bash
cd backend
python -m venv .venv && source .venv/bin/activate   # or .venv\Scripts\activate on Windows
pip install -r requirements.txt
cp .env.example .env        # fill in a real DJANGO_SECRET_KEY at minimum
python manage.py migrate
python manage.py runserver
```
Without `DATABASE_URL` set, this uses local SQLite (`backend/db.sqlite3`) —
nothing to configure. Set `DATABASE_URL` to point at Postgres to test against
a real database.

### Frontend
```bash
cd frontend
npm install
cp .env.example .env        # VITE_API_BASE_URL, defaults to http://localhost:8000/api
npm run dev
```

## Deployment

**Database**: create a free Supabase (or any Postgres) project, copy its
connection string.

**Backend** (Render, Railway, Fly, etc.):
- Root directory: `backend/`
- Build: `pip install -r requirements.txt`
- Start: `python manage.py migrate && gunicorn core.wsgi:application --bind 0.0.0.0:$PORT`
  (a `Procfile` with this is already checked in for platforms that read one)
- Env vars: `DJANGO_SECRET_KEY`, `DJANGO_DEBUG=False`, `DJANGO_ALLOWED_HOSTS`,
  `DATABASE_URL`, `CORS_ALLOWED_ORIGINS` (your deployed frontend URL)

**Frontend** (Vercel):
- Root directory: `frontend/`
- Build: `npm run build`, output dir `dist/`
- Env var: `VITE_API_BASE_URL` = your deployed backend's `/api` URL

## Database schema

See [`database/schema.sql`](database/schema.sql). Two tables:
- `accounts_registereduser` — email, name, login_code
- `accounts_checkoutsubmission` — checkout details, `was_logged_in` flag, and
  an optional FK back to the matched registered user
