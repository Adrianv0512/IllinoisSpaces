# Illinois Spaces

Find campus study spots that fit how you work. Illinois Spaces is a CS409 project for discovering, filtering, rating, and reviewing UIUC study locations.

## Project layout

| Folder                | Purpose                               |
| --------------------- | ------------------------------------- |
| `apps/web`            | React, TypeScript, Tailwind frontend  |
| `apps/api`            | Express REST API                      |
| `supabase/migrations` | PostgreSQL schema and access policies |
| `docs`                | Prototype and evaluation planning     |

## Start locally

1. Install Node.js 20.19 or newer.
2. Run `npm install` from the repository root.
3. Run `npm run dev`. Open `http://localhost:5173`. The Express API runs on `http://localhost:3001`; Vite forwards `/api` requests there.
4. When your Supabase project is ready, copy `apps/web/.env.example` to `apps/web/.env.local` and `apps/api/.env.example` to `apps/api/.env`, then add its URL and anon key.

Run `npm run check` for TypeScript checks, `npm run build` for production builds, and `npm run format` to format source files.

## In-class prototype

The frontend currently provides three clickable flows: search and filter locations; open details and read reviews; and demo sign in to post, edit, or delete a review. The map and list both open locations. On a narrow screen, switch between List and Map above the results.

The ten locations, their attributes, map positions, ratings, and sample reviews are illustrative. Demo sign in accepts a display name without a password. Reviews are saved only in that browser's local storage. These flows are for heuristic evaluation, not real authentication or a production data source. Use the [evaluation guide](docs/prototype-and-evaluation.md) for task prompts and feedback notes.

The interface intentionally uses basic CSS for the first evaluation: readable spacing and forms, a numbered results list, a rough map placeholder, and an inline detail/review section. It has no icons, imagery, or finished visual design. The final look is left for revision after feedback.

## Supabase setup

Create a Supabase project and run `supabase/migrations/001_initial_schema.sql` in its SQL editor. The migration creates study locations and reviews, enables row level security, and limits review changes to their authors. Use the Supabase **anon/publishable key** in the example environment files. Never put a service role key in the frontend or commit credentials.

The database migration is a starting schema. It does not create sample locations or live occupancy data. The API currently exposes a health check. Connecting the prototype flows to Supabase Auth, the REST API, and the database is the next implementation step.

## Team areas

- Zisu: `apps/web/src/features/auth` and Supabase Auth integration.
- Adrian: `apps/api`, `supabase/migrations`, and API/database integration.
- Steve: `apps/web/src/features/locations` for directory, search, and filters.
- Darwin: `apps/web/src/features/reviews` for ratings and review management.
- Honne: `apps/web/src/styles`, responsive interface, prototype, and heuristic evaluation.

Before the final submission, record prototype feedback and the resulting UI revision in `docs/prototype-and-evaluation.md`.
