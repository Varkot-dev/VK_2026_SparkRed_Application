# Marquee

A personal movie watchlist. Search the TMDB catalogue, add films to your list, track them as *want to watch → watching → watched*, rate what you've seen out of 10, and sort or filter the whole thing.

**Live:** https://vk-2026-spark-red-application.vercel.app

Built for the Penn Spark Red developer technical assessment.

## What it does

- Create an account (username + password) and stay signed in across visits.
- Search movies by title with posters, release year, and TMDB score — results are debounced as you type and paginated.
- Add a movie to your watchlist in one click; the button flips to "On your list" instantly.
- Set each movie's status and, once it's watched, give it a 1–10 rating that shows as a badge on the poster.
- Filter by status and sort by date added, title, rating, or release year. Filter and sort live in the URL, so a view can be bookmarked or shared.
- Every change is optimistic: the UI updates immediately and rolls back with a toast if the server rejects it.

## Features chosen

| Area | Included |
|---|---|
| **Frontend** | Components (a small UI kit: `Button`, `Input`, `Select`, `SegmentedControl`, `RatingPicker`, `PosterImage`, `Skeleton`, `EmptyState`, `Toast`), animations (page transitions, layout animations when the list re-sorts, poster hover, staggered card entrance — all respecting `prefers-reduced-motion`), mobile responsiveness (2-column poster grid at 320px up to 5 columns at 1440px; native selects replace fiddly controls on phones) |
| **Backend** | User registration / login / logout with server-side sessions, API calls to TMDB (proxied through the server so the key never reaches the browser), Postgres integration via Drizzle ORM, classes and objects (`TmdbClient`, `TtlCache`, `AuthService`, `WatchlistService`, `UserRepository`, `WatchlistRepository`, an `AppError` hierarchy) |
| **Full-stack** | React (Vite) frontend talking to an Express API, with the request/response contracts defined once in a shared package and validated on both sides with zod |
| **Misc** | Deployed on Vercel (frontend + API on one origin) with a Neon Postgres database; unit tests on the service layer and helpers; loading, empty, and error states on every screen |

## Tech stack

- **Frontend:** React 19, TypeScript, Vite 8, React Router 8 (data mode), TanStack Query 5, Tailwind CSS 4, Motion
- **Backend:** Node 22, Express 5, zod 4, Drizzle ORM, `pg`, `express-session` + `connect-pg-simple`, `bcryptjs`, `helmet`, `express-rate-limit`
- **Database:** PostgreSQL (Neon)
- **Tooling:** npm workspaces, Vitest, esbuild, Vercel

## How it's put together

```
├── client/          Vite + React app
│   └── src/
│       ├── components/   ui kit + layout (nav, auth shell, app shell)
│       ├── features/     auth, search, watchlist — each with its queries/mutations and pages
│       ├── hooks/        useDebouncedValue
│       └── lib/          typed fetch wrapper, QueryClient
├── server/          Express API
│   └── src/
│       ├── app.ts        composition root: config → db → repositories → services → routers
│       ├── db/           Drizzle schema (users, watchlist_items) and connection pool
│       ├── lib/          TmdbClient, TtlCache, AppError hierarchy, password hashing
│       ├── middleware/   zod validation, session, requireAuth, central error handler
│       ├── repositories/ SQL only — UserRepository, WatchlistRepository
│       ├── routes/       thin HTTP handlers
│       └── services/     business rules — AuthService, WatchlistService
├── shared/          zod schemas + TypeScript types used by both sides
├── api/index.js     Vercel serverless entry (exports the Express app)
└── vercel.json      static build + /api rewrite + SPA fallback
```

**Request flow.** The browser calls `/api/...` on the same origin. In development Vite proxies that to Express on port 3000; in production Vercel rewrites it to a single serverless function. Because everything is same-origin, the session cookie is a plain first-party `HttpOnly; SameSite=Lax` cookie with no CORS involved.

**Layers.** Routes only parse and respond. `validate()` runs the shared zod schema for the body/query/params and hands typed data on. Services own the rules (one entry per movie per user; only watched movies can be rated; leaving "watched" clears the rating; every operation is scoped to the signed-in user). Repositories are the only place that knows SQL. Errors are thrown as `AppError` subclasses anywhere in the stack and turned into a consistent `{ error: { code, message, details } }` envelope by one middleware — Express 5 forwards rejected async handlers there automatically.

**TMDB.** `TmdbClient` owns the bearer token, maps TMDB's payload to the app's `MovieSummary` shape, caches identical searches for 60 seconds, and retries once on a 429 using `Retry-After`. Movie details are snapshotted into the watchlist row at add time, so rendering your list never calls TMDB.

**Auth.** Passwords are hashed with bcrypt (cost 12). Login always runs a hash comparison even for unknown usernames so the two cases take the same time and return the same message. Sessions are regenerated on login (no fixation) and stored in Postgres, so they survive server restarts and cold starts. `/api/auth/*` is rate-limited.

**Optimistic UI.** Add, status, rating, and remove mutations snapshot every cached list query, patch them in place, and restore the snapshot if the request fails. The client mirrors the "rating only when watched" rule so the optimistic state never disagrees with what the server will say.

## Time spent

About 4 hours.

## Running it locally

### Prerequisites

- Node.js 20.19+ (22 recommended) and npm 10+
- A PostgreSQL database. The easiest free option is [Neon](https://neon.com): create a project and copy the **pooled** connection string.
- A TMDB API key: sign up at [themoviedb.org](https://www.themoviedb.org/), then go to *Settings → API* and copy the **API Read Access Token** (the long one).

### Steps

1. Install dependencies from the repo root (this installs all three workspaces):

   ```bash
   npm install
   ```

2. Create your environment file:

   ```bash
   cp .env.example .env
   ```

   Then fill in:

   | Variable | Value |
   |---|---|
   | `DATABASE_URL` | Your Postgres connection string, e.g. `postgresql://user:pass@host/neondb?sslmode=verify-full` |
   | `TMDB_READ_TOKEN` | The TMDB API Read Access Token |
   | `SESSION_SECRET` | Any random string of 32+ characters — `openssl rand -hex 32` generates one |

3. Create the tables:

   ```bash
   npm run db:push
   ```

4. Start the API and the frontend together:

   ```bash
   npm run dev
   ```

   Open http://localhost:5173. The API runs on http://localhost:3000 and Vite proxies `/api` to it.

### Other commands

```bash
npm test          # unit tests (server services/clients + client helpers)
npm run typecheck # strict TypeScript across all workspaces
npm run build     # typecheck, bundle the server, build the client
```

## Deployment

The live site runs on Vercel with a Neon database. `vercel.json` builds the client to static files, bundles the Express app (`server/scripts/build.mjs`) into a single serverless function at `/api`, and rewrites all other paths to the SPA. The three environment variables above are set in the Vercel project settings.

## API

All responses are `{ "data": ... }` or `{ "error": { "code", "message", "details?" } }`.

| Method | Path | Notes |
|---|---|---|
| `POST` | `/api/auth/register` | `{ username, password }` → 201, starts a session |
| `POST` | `/api/auth/login` | → 200; 401 on bad credentials |
| `POST` | `/api/auth/logout` | → 204 |
| `GET` | `/api/auth/me` | current user, or `data: null` when signed out |
| `GET` | `/api/movies/search?q=&page=` | TMDB search (auth required) |
| `GET` | `/api/watchlist?status=&sort=&order=` | `sort` ∈ addedAt · title · rating · releaseYear |
| `POST` | `/api/watchlist` | `{ tmdbId, title, posterPath, releaseYear }` → 201; 409 if already listed |
| `PATCH` | `/api/watchlist/:id` | `{ status?, rating? }`; 400 if rating a non-watched movie |
| `DELETE` | `/api/watchlist/:id` | → 204; 404 if not yours |

## Credits

This product uses the [TMDB](https://www.themoviedb.org/) API but is not endorsed or certified by TMDB. Posters and movie data © their respective owners.
