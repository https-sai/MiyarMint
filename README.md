# MyrMint

Paper trading for students and educators, limited to **halal-screened equities**. Sign in, join a classroom, and buy or sell against a simulated portfolio.

## Stack

| Layer | Tech |
| --- | --- |
| Web | Vite, React 19, TypeScript |
| Mobile | Expo 57, React Native, TypeScript |
| API | Express, TypeScript |
| Auth & data | Supabase (Auth + Postgres) |
| Market quotes | Halal Terminal |
| Halal screening | Halal Terminal |
| API hosting | Render (`server/api`) |

```
apps/mobile/     Expo app
apps/web/        Vite React desk
server/api/      REST API
```

## Features

- Email/password auth via Supabase; new users get a student profile and a paper portfolio (`$100,000` cash)
- Trade only tickers Halal Terminal marks Shariah-compliant
- Quotes and paper fills use Halal Terminal market data
- Classrooms with join codes (educators create; students join)
- Expo push notifications after trades

## Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) project
- API keys for Halal Terminal
- Expo Go (or a simulator) for the mobile app

## Database

Run `apps/mobile/src/api/sample_data/schema.sql` in the Supabase SQL editor. If `profiles` already exists without `push_token`, also run `server/api/sql/001_push_token.sql`. If it exists without `leaderboard_visible`, run `server/api/sql/002_leaderboard_visible.sql`.

Sample CSVs live in `apps/mobile/src/api/sample_data/`.

## API

```bash
cd server/api
npm install
npm run dev            # http://localhost:4000
```

Create `server/api/.env` with:

| Variable | Purpose |
| --- | --- |
| `PORT` | Listen port (default `4000`) |
| `DB_URL` | Supabase project URL |
| `DB_SERVICE_ROLE_KEY` | Supabase service role key |
| `DB_JWKS_URL` | Optional; defaults to `{DB_URL}/auth/v1/.well-known/jwks.json` |
| `HALAL_TERMINAL_API_KEY` | Quotes and Shariah screening |

Protected routes expect `Authorization: Bearer <supabase access token>`.

| Method | Path | Notes |
| --- | --- | --- |
| `GET` | `/health` | Unauthenticated |
| `GET` | `/market/quote/:ticker` | Halal Terminal quote |
| `GET` | `/market/quotes?tickers=` | Batch quotes, max 50 tickers |
| `GET` | `/screening/:ticker` | Live Halal Terminal screen |
| `GET` | `/stocks` | Book tickers with live Halal Terminal status |
| `GET` | `/portfolios/:studentId` | Own portfolio, all trades, and holdings |
| `POST` | `/trades` | Buy/sell (compliant only; sells check share balance) |
| `GET` | `/classrooms/mine` | Memberships and classrooms you own |
| `POST` | `/classrooms` | Educators/admins only |
| `POST` | `/classrooms/join` | Body: `{ joinCode }` |
| `DELETE` | `/classrooms/:id/members/me` | Leave classroom |
| `GET` | `/classrooms/:id/leaderboard` | Query `period=week\|month\|all` |
| `GET` | `/profiles/me` | Current profile |
| `PATCH` | `/profiles/me` | `{ display_name, leaderboard_visible }` |
| `PATCH` | `/profiles/me/push-token` | Save Expo push token |

Production: [Render](https://render.com) via `render.yaml` (`miyarmint-api`).

## Web

```bash
cd apps/web
npm install
npm run dev            # http://localhost:5173
```

Create `apps/web/.env.local` (see `apps/web/.env.example`):

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_API_URL=http://localhost:4000
```

The desk talks to the same Express API as mobile. Auth is Supabase email/password in the browser; API calls send `Authorization: Bearer <access token>`. The Halal Terminal key stays on the server. On Vercel, set the same `VITE_*` variables in the project environment.

Signed-in screens: dashboard, portfolio, trade, leaderboard, learn, account. Signed-out: login and create account.

## Mobile

```bash
cd apps/mobile
npm install
npx expo start
```

Create `apps/mobile/.env`:

```
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_API_URL=http://localhost:4000
```

On a physical device, point `EXPO_PUBLIC_API_URL` at your machine’s LAN IP or the deployed API, not `localhost`.

Signed-in screens: dashboard, trade, classrooms, join classroom. Signed-out: landing + auth.
