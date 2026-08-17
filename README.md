# MyrMint

Paper trading for students and educators, limited to **halal-screened equities**. Sign in, join a classroom, and buy or sell against a simulated portfolio.

## Stack

| Layer | Tech |
| --- | --- |
| Mobile | Expo 57, React Native, TypeScript |
| API | Express, TypeScript |
| Auth & data | Supabase (Auth + Postgres) |
| Market quotes | [Massive](https://massive.com) |
| Halal screening | Halal Terminal |
| API hosting | Render (`server/api`) |

```
apps/mobile/     Expo app
server/api/      REST API
```

## Features

- Email/password auth via Supabase; new users get a student profile and a paper portfolio (`$100,000` cash)
- Trade only tickers marked `compliant` on the halal stock list
- Live last-trade quotes when placing orders
- Classrooms with join codes (educators create; students join)
- Expo push notifications after trades

## Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) project
- API keys for Massive and Halal Terminal
- Expo Go (or a simulator) for the mobile app

## Database

Run `apps/mobile/src/api/sample_data/schema.sql` in the Supabase SQL editor. If `profiles` already exists without `push_token`, also run `server/api/sql/001_push_token.sql`.

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
| `MASSIVE_API_KEY` | Last-trade quotes |
| `HALAL_TERMINAL_API_KEY` | Live screening fallback |

Protected routes expect `Authorization: Bearer <supabase access token>`.

| Method | Path | Notes |
| --- | --- | --- |
| `GET` | `/health` | Unauthenticated |
| `GET` | `/market/quote/:ticker` | Last trade |
| `GET` | `/screening/:ticker` | Cached list, then live |
| `GET` | `/stocks` | Full halal list |
| `GET` | `/portfolios/:studentId` | Own portfolio + recent trades |
| `POST` | `/trades` | Buy/sell (compliant only) |
| `GET` | `/classrooms/mine` | Memberships |
| `POST` | `/classrooms` | Educators/admins only |
| `POST` | `/classrooms/join` | Body: `{ joinCode }` |
| `PATCH` | `/profiles/me/push-token` | Save Expo push token |

Production: [Render](https://render.com) via `render.yaml` (`miyarmint-api`).

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
