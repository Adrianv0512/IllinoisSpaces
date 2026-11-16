# Illinois Spaces

Find campus study spots that fit how you work. Illinois Spaces is a CS409 project for discovering, filtering, rating, and reviewing UIUC study locations.

## Project layout

| Folder | Purpose |
| --- | --- |
| `apps/web` | React, TypeScript, Tailwind frontend |
| `apps/api` | Express REST API |
| `supabase/migrations` | PostgreSQL schema and access policies |
| `docs` | Prototype and evaluation planning |

## Start locally

1. Install Node.js 20.19 or newer.
2. Run `npm install` from the repository root.
3. Copy `apps/web/.env.example` to `apps/web/.env.local` and `apps/api/.env.example` to `apps/api/.env`. Add values from your Supabase project when it is ready. The starter screen and API health check work without them.
4. Run `npm run dev`. Open `http://localhost:5173`. The Express API runs on `http://localhost:3001`; Vite forwards `/api` requests there.

Run `npm run check` for TypeScript checks and `npm run build` for production builds.

## Supabase setup

Create a Supabase project and run `supabase/migrations/001_initial_schema.sql` in its SQL editor. The migration creates study locations and reviews, enables row level security, and limits review changes to their authors. Use the Supabase **anon/publishable key** in the example environment files. Never put a service role key in the frontend or commit credentials.

The database migration is a starting schema. It does not create sample locations or live occupancy data. The API currently exposes a health check; location, review, and authentication flows are the next implementation step.

## Team areas

- Zisu: `apps/web/src/features/auth` and Supabase Auth integration.
- Adrian: `apps/api`, `supabase/migrations`, and API/database integration.
- Steve: `apps/web/src/features/locations` for directory, search, and filters.
- Darwin: `apps/web/src/features/reviews` for ratings and review management.
- Honne: `apps/web/src/styles`, responsive interface, prototype, and heuristic evaluation.

Before the final submission, record prototype feedback and the resulting UI revision in `docs/prototype-and-evaluation.md`.
