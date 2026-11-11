# REPLOG

**Exercise discovery and workout builder.** Search a library of exercises, view step-by-step instructions and demonstration photos, build workouts, generate training programs from templates, and save personal exercise collections.

Built as a college project and portfolio piece with React, Vite, Tailwind CSS and Supabase.

> **Live demo:** _add your Vercel URL here after deploying_

## Screenshots

| Exercise search | Exercise detail |
|---|---|
| ![Exercise search](docs/screenshots/exercises.png) | ![Exercise detail](docs/screenshots/exercise-detail.png) |
| **Workout builder** | **Program editor** |
| ![Workout builder](docs/screenshots/workout-builder.png) | ![Program editor](docs/screenshots/program-editor.png) |
| **Collections** | **API documentation** |
| ![Collections](docs/screenshots/collections.png) | ![API documentation](docs/screenshots/api.png) |

## Features

- **Exercise library:** 64 exercises across 9 categories with instant search, combinable filters (category, muscle, equipment, difficulty), sorting, result count and "load more". Search and filters live in the URL, so Back and bookmarks keep your results.
- **Exercise details:** primary and secondary muscles, equipment, difficulty, type, step-by-step instructions, common mistakes, related exercises, and start/end position photos for 57 exercises.
- **Accounts:** sign up, log in, log out, password recovery and a profile page (Supabase Auth). Browsing is public; saving needs an account.
- **Workout builder:** name a workout, add exercises, set sets / reps / target weight / rest / notes, reorder, see an estimated duration, then save, edit, duplicate or delete.
- **Program generator:** four templates (3-day beginner, 4-day upper/lower, 5-day and 6-day push/pull/legs) built from real library exercises. Customise days, weekdays, exercises, sets, reps and rest, then save, edit, duplicate or delete.
- **Collections:** group exercises (for example "Home Workout"), save from any exercise page, rename, remove, delete.
- **Read-only API:** `/api/exercises`, `/api/exercises/:id` and `/api/meta`, with documentation and a live tester inside the app.
- **Polish:** dark and light themes, responsive layout, loading, empty and error states, toast messages, confirmation before destructive actions.

## Tech stack

React 19 · Vite · JavaScript · Tailwind CSS 3 · React Router · Supabase (Auth + PostgreSQL) · Lucide icons · Vercel

## Getting started

Requirements: [Node.js](https://nodejs.org) 18 or newer and a free [Supabase](https://supabase.com) account.

```bash
git clone https://github.com/YOUR-USERNAME/replog.git
cd replog
npm install
cp .env.example .env     # on Windows: copy .env.example .env
npm run dev              # http://localhost:5173
```

Without Supabase keys the exercise library and API still work; accounts and saving need the setup below.

### Environment variables

| Variable | Where to find it |
|---|---|
| `VITE_SUPABASE_URL` | Supabase > Project Settings > Data API > Project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase > Project Settings > API Keys > **publishable** key |

Only the public publishable (anon) key belongs in this app. Never use the secret / `service_role` key here.

### Database setup

1. Create a Supabase project.
2. SQL Editor: run `supabase/migrations/0001_initial_schema.sql` once (tables, indexes, triggers, Row Level Security).
3. SQL Editor: run `supabase/seed.sql` (loads the 64 exercises; safe to run again).
4. Authentication > URL Configuration: set **Site URL** to your app URL (`http://localhost:5173` locally, your Vercel URL in production) and add `<site-url>/reset-password` and `<site-url>/**` to **Redirect URLs**.

If you edit exercises in `src/data/`, regenerate the seed with `npm run seed:generate`.

### Security model

Row Level Security is enabled on every table.

| Table | Who can access |
|---|---|
| `exercises` | Anyone can read; nobody can write from the app |
| `profiles`, `workouts`, `programs`, `collections` | Only the owner |
| `workout_exercises`, `program_days`, `program_exercises`, `collection_exercises` | Only if the parent record belongs to you |

## API

Read-only JSON, no key needed, served by `src/api/handlers.js` (in `npm run dev` / `preview` via a Vite plugin, in production via `api/[...path].js` on Vercel).

| Endpoint | Description |
|---|---|
| `GET /api/exercises` | Search and filter. Params: `q`, `category`, `muscle`, `equipment`, `difficulty`, `sort`, `limit` (1-100), `offset` |
| `GET /api/exercises/:id` | One exercise with instructions, common mistakes, photos and related exercises |
| `GET /api/meta` | Valid filter values and the exercise count |

```bash
curl "https://YOUR-SITE/api/exercises?q=chest%20dumbbell&limit=2"
curl "https://YOUR-SITE/api/exercises/0001"
```

Errors return `{ "error": { "code", "message" } }` with status 400, 404 or 405. Full documentation and a live tester are on the app's **API** page. It serves only the bundled exercise data, never user data.

## Deployment (Vercel)

1. Push the project to GitHub (never commit `.env`; it is already in `.gitignore`).
2. On [vercel.com](https://vercel.com), choose **Add New > Project** and import the repository. Vercel detects Vite (build `npm run build`, output `dist`).
3. Add the two environment variables from the table above.
4. Deploy, then add the live URL to Supabase (Site URL and Redirect URLs, see Database setup step 4).

`vercel.json` makes page refreshes work for client-side routes, and keeps `/api/*` on the serverless function.

## Project structure

```
api/                 Vercel serverless function for the read-only API
docs/screenshots/    README screenshots
public/exercises/    Exercise photos
scripts/             generate-seed.mjs, fetch-exercise-images.mjs
src/
  api/               API request handlers
  components/        Reusable UI (cards, modals, pickers, forms)
  context/           Auth, theme and toast providers
  data/              Exercise dataset, instructions, images, program templates
  layouts/           App shell (top bar + sidebar)
  pages/             Route pages
  services/          Data access (exercises, workouts, programs, collections)
  utils/             Validation helpers
supabase/            SQL migration and seed
```

## Limitations and future improvements

- 64 exercises, bundled locally. The data layer (`src/services/exerciseService.js`) is isolated so a larger external exercise API can be added later.
- 7 exercises have no photo because no accurate match was found; they show a placeholder.
- Not built yet: favourite exercises, recently viewed exercises, search history, drag-and-drop reordering, progress tracking and workout logging.
- Programs are general templates, not medical advice or personalised coaching.
- No automated test suite yet.

## Credits

Exercise photos: [Free Exercise DB](https://github.com/yuhonas/free-exercise-db) (Unlicense, public domain). Instructions and common mistakes were written for this project.
