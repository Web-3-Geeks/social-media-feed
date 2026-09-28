# Social Media Feed App

A full-stack social media feed app, built incrementally as a daily internship project (Week 5).

- **Live app:** https://social-media-feed-ruby.vercel.app
- **Live API:** https://social-feed-api.vercel.app/api/health
- **Repo:** https://github.com/Web-3-Geeks/social-media-feed

| Layer | Tech |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS v4, React Router v7, Axios |
| Backend | Node.js, Express 5, Mongoose |
| Database | MongoDB Atlas |
| Auth | JWT in an httpOnly cookie, bcrypt password hashing |
| Hosting | Vercel (frontend and backend as separate projects) |

---

## Project structure

```
social-media-feed/
├── backend/
│   ├── api/index.js              # Vercel serverless entry (exports the Express app)
│   ├── vercel.json               # Routes every request to api/index.js
│   ├── postman-collection.json   # Importable API collection with tests
│   └── src/
│       ├── server.js             # Local entry: connect DB, then app.listen
│       ├── app.js                # Express app: middleware, routes, error handling
│       ├── config/db.js          # Cached MongoDB connection
│       ├── models/User.js
│       ├── controllers/          # authController, userController
│       ├── routes/               # healthRoutes, authRoutes, userRoutes
│       ├── middleware/           # auth (protect), validate, notFound, errorHandler
│       ├── validators/           # express-validator rules
│       └── utils/                # AppError, generateToken, tokenCookie
├── frontend/
│   ├── vercel.json               # SPA fallback + /api proxy to the backend
│   └── src/
│       ├── api/axios.js          # Axios instance (baseURL, withCredentials)
│       ├── context/              # AuthContext + AuthProvider
│       ├── hooks/useAuth.js
│       ├── components/           # Route guards, layouts, Navbar, FormInput, Avatar, Logo
│       ├── pages/                # Login, Register, Dashboard, Profile
│       └── utils/validation.js   # Client-side form validation
└── week5/                        # Per-day snapshots for evaluation (see week5/README.md)
```

---

## Running locally

**Requirements:** Node.js 20+ and a MongoDB Atlas cluster (the free M0 tier is fine).

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env    # then fill in the values
npm run dev             # http://localhost:5000
```

`backend/.env`:

| Variable | Example | Purpose |
|---|---|---|
| `PORT` | `5000` | Local server port. Hosting platforms set their own. |
| `NODE_ENV` | `development` | `production` hides stack traces and switches cookies to `Secure; SameSite=None` |
| `MONGO_URI` | `mongodb+srv://user:pass@cluster0.xxxx.mongodb.net/social-feed?...` | Atlas connection string, including the database name |
| `JWT_SECRET` | 128 random hex chars | Signs tokens. Generate with `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` |
| `JWT_EXPIRES_IN` | `7d` | Token lifetime. Keep it in sync with the cookie `maxAge` in `utils/tokenCookie.js`. |
| `CLIENT_URL` | `http://localhost:5173` | Allowed CORS origin |

Check it's running: http://localhost:5000/api/health

### 2. Frontend

```bash
cd frontend
npm install
echo VITE_API_URL=http://localhost:5000/api > .env
npm run dev             # http://localhost:5173
```

Only `VITE_`-prefixed variables reach the browser bundle, so never put secrets in `frontend/.env`.

---

## API

Base URL: `/api`. Every response is JSON. Errors always use this shape:

```json
{ "success": false, "message": "Validation failed", "errors": { "email": "Please provide a valid email" } }
```

`errors` is only present on validation failures.

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/health` | – | Server and database status (`200` or `503`) |
| POST | `/api/auth/register` | – | Create an account (`201`) |
| POST | `/api/auth/login` | – | Log in and set the auth cookie |
| POST | `/api/auth/logout` | – | Clear the auth cookie |
| GET | `/api/auth/me` | 🔒 | Current session user |
| GET | `/api/users/me` | 🔒 | Current user's profile |

**Status codes:** `400` validation or bad JSON · `401` not authenticated, invalid or expired token, wrong credentials · `404` unknown route · `409` email already registered.

**Postman:** import [`backend/postman-collection.json`](backend/postman-collection.json). Set the `baseUrl` variable to the local or live API and click **Run collection**. Every request has tests, and Register generates a fresh email each run so the collection can be re-run.

---

## Day 1 — Setup, database and authentication

**Goal:** a new user can Register → Login → reach the protected dashboard and profile → Logout.

### What was built

**Backend**
- Express 5 app split into `app.js` (configuration) and `server.js` (startup). The server only starts listening after MongoDB connects, and exits with a clear error if it can't.
- CORS locked to `CLIENT_URL` with credentials enabled, since the auth cookie must travel cross-origin in development.
- Centralized error handling. A custom `AppError` carries a status code, `notFound` turns unknown routes into a JSON `404`, and one `errorHandler` formats every error the same way. It also translates Mongo duplicate keys (`409`), Mongoose validation errors, invalid ObjectIds, and malformed JSON bodies. Stack traces are only included in development.
- `User` model: `name`, `email` (unique, lowercased), `password`, `avatar`, `bio`, and timestamps.
- Register, login, logout, `/auth/me`, and `/users/me`, with `express-validator` rules and a `protect` middleware.
- `GET /api/health` reports database connectivity, not just that the process is alive.

**Frontend**
- Register and Login pages with client-side validation, per-field server errors, loading states, and a show/hide password toggle.
- `AuthProvider` restores the session on page load by calling `/auth/me`.
- `ProtectedRoute` and `GuestRoute` guards.
- Dashboard and Profile pages. The Profile page fetches `/users/me` with loading-skeleton, error, and retry states.
- Responsive from 320px up. Accessibility: labels tied to inputs, `aria-invalid` and `aria-describedby` on errors, `role="alert"` and `role="status"` on messages, labelled icon-only buttons, and visible keyboard focus rings.

### Key decisions and why

**JWT in an httpOnly cookie, not localStorage.** The task asks for auth state to be stored securely. JavaScript can't read an httpOnly cookie, so an XSS bug can't steal the token, and the browser attaches it to requests automatically. The token is never sent in the response body. Cookie flags depend on `NODE_ENV`: `SameSite=Lax` locally, `Secure; SameSite=None` in production.

**Password safety, two layers.** The schema uses `select: false`, so queries don't load the password unless they explicitly ask for it (only login does). A `toJSON` transform also strips `password`, `_id`, and `__v` from every response. Passwords are hashed with bcrypt (cost 12) in a `pre("save")` hook, which skips rehashing when the password hasn't changed.

**Same error for a wrong password and an unknown email.** Login returns `Invalid email or password` in both cases, so it can't be used to discover which emails are registered. Register does reveal duplicates (`409`). That's a common UX trade-off, and fully hiding it needs email verification (see limitations).

**Validation on both sides.** Frontend rules mirror the backend for instant feedback. The backend rules are the real enforcement. Password rules are 8–72 characters with at least one letter and one number. The 72 maximum matches bcrypt's input limit, which silently ignores anything longer.

**Controllers only whitelist fields.** Register passes only `name`, `email`, and `password` to `User.create`, so extra fields like `role` are ignored.

**The auth guard reloads the user.** `protect` verifies the JWT, then loads the user from the database. A valid token for a deleted account is still rejected, and expired tokens get a specific "Session expired" message.

**Logout is not protected.** It must still clear the cookie when the token has already expired. It uses `POST` so that links or prefetching can't trigger it.

**Auth state lives in Context.** The Navbar, the Dashboard, and both route guards need the current user. `AuthContext`, `AuthProvider`, and `useAuth` are in separate files so that Vite Fast Refresh and the lint rules stay clean. The provider's functions use `useCallback` and its value uses `useMemo`, so consumers don't re-render unless auth state actually changes.

**The `loading` state prevents false redirects.** On refresh, `user` starts as `null` until `/auth/me` answers. Guards wait for `loading` to finish before deciding, so logged-in users aren't bounced to the login page.

**Redirects happen in one place.** After login or logout, the pages only update auth state. `GuestRoute` and `ProtectedRoute` react to the change and redirect.

**`/auth/me` and `/users/me` are separate.** `/auth/me` answers "who is logged in?" for the session check. `/users/me` is the profile resource, which will grow with profile editing and public profiles on later days.

---

## Deployment (Vercel)

The frontend and backend are two separate Vercel projects from the same repo.

### Backend: `social-feed-api`

**Vercel settings:** Framework Preset **Other** · Root Directory `backend`

**Environment variables:** `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN=7d`, `NODE_ENV=production`, `CLIENT_URL=<frontend URL>`. Don't set `PORT`.

Vercel runs Express as a **serverless function**, not a long-running server, so three pieces of code exist for it:

1. **`backend/api/index.js`** re-exports the Express app from `src/app.js`. Vercel turns files in `api/` into functions. `server.js` (`app.listen`) is only used locally.
2. **`backend/vercel.json`** rewrites every path to that one function, so Express still sees the original URL and handles routing itself.
3. **Cached DB connection** in `src/config/db.js`, plus a middleware in `app.js` that awaits it before every request. Serverless instances are reused between requests, so the connection promise is stored at module level and reused instead of opening a new Atlas connection per request. A failed attempt clears the cache so the next request retries.

MongoDB Atlas **Network Access** must allow `0.0.0.0/0`, because Vercel doesn't use fixed IPs.

After changing any environment variable, **Redeploy** for it to take effect.

### Frontend

**Vercel settings:** Framework Preset **Vite** · Root Directory `frontend`

**Environment variable:** `VITE_API_URL=/api`

**`frontend/vercel.json`** does two jobs:

1. **SPA fallback** (`/(.*)` → `/index.html`). Routes like `/profile` only exist in React Router. Without this, refreshing any page except `/` returns a Vercel 404.
2. **API proxy** (`/api/:path*` → `https://social-feed-api.vercel.app/api/:path*`). The browser calls `/api/...` on the frontend's own domain, and Vercel forwards the request to the backend. This makes the auth cookie **first-party**. If the browser called the backend domain directly, the cookie would be third-party, and Safari (and any browser that blocks third-party cookies) would drop it, so login would appear to succeed and then every request would return `401`. It also means production requests don't need CORS.

Locally, `VITE_API_URL` points straight at `http://localhost:5000/api`. `localhost:5173` and `localhost:5000` count as the same site, so the cookie works there without a proxy.

---

## Known limitations

- **Logout doesn't revoke the JWT.** It clears the cookie, but a copied token stays valid until it expires (7 days). A token blocklist or short-lived access tokens with refresh tokens would fix this.
- **No rate limiting** on login or register yet (e.g. `express-rate-limit`).
- **No email verification.** Registration therefore reveals whether an email is already in use.
- **Profile editing** is planned for a later day. `avatar` and `bio` exist in the schema but can't be changed from the UI yet.
