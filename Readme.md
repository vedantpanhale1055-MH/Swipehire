# SwipeHire

AI-powered job discovery, matching, and application tracker. Aggregates job listings, scores fit against your resume using AI, lets you triage jobs with a swipe interface, tracks applications on a Kanban board, and tailors your resume per job.

Full product scope and roadmap: see [PRD.md](./PRD.md).

## Tech stack (zero-cost)

- **Framework:** Next.js 14 (App Router)
- **Database + Auth:** Supabase (Postgres, free tier)
- **AI:** Groq API (free-tier Llama inference) — job-fit scoring and resume tailoring
- **Job sources:** Remotive and Arbeitnow public APIs
- **Styling:** CSS Modules
- **Hosting (planned):** Vercel

## Project structure

```
app/
  (auth)/
    login/page.js        # Email/password login
    signup/page.js        # Email/password signup
  api/
    jobs/route.js          # GET/POST/PATCH/DELETE saved jobs
    jobs/score/route.js    # AI job-fit scoring (single or batch)
    resume/tailor/route.js # AI resume tailoring
  applications/            # Kanban application tracker (WIP)
  discover/                 # Swipe-card job feed (WIP)
  portfolio/                # Portfolio builder (WIP)
  resume/                   # Resume builder (WIP)
  layout.js                 # Root layout, wraps app in AuthProvider
  page.js                   # Home page
components/
  AuthProvider.js           # React context for logged-in user/session state
  JobDetail/                # (WIP)
  KanbanBoard/               # (WIP)
  ResumeBuilder/             # (WIP)
  SwipeCard/                  # (WIP)
  ui/                          # (WIP)
lib/
  supabase.js                # Supabase client, auth helpers, saved-jobs DB helpers
  groq.js                     # Groq client — job-fit scoring, resume tailoring
  jobSources.js                # Job aggregation adapter (Remotive + Arbeitnow)
  tokens.css                   # Design tokens (WIP)
next.config.js
jsconfig.json                  # Enables the "@/" import alias
package.json
PRD.md
```

## Local setup

### 1. Clone and install

```bash
git clone https://github.com/vedantpanhale1055-MH/Swipehire.git
cd Swipehire
npm install
```

### 2. Environment variables

Create `.env.local` in the project root (never committed — already in `.gitignore`):

```
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-id>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your Supabase publishable key>
GROQ_API_KEY=<your Groq API key>
```

- Supabase URL/key: Supabase dashboard → Settings → API (use the **Publishable key**, not the secret key)
- Groq key: [console.groq.com](https://console.groq.com) → API Keys

### 3. Supabase database setup

Create a `saved_jobs` table (Table Editor → New table) with columns:

| column | type | default |
|---|---|---|
| id | int8 | auto (primary key) |
| created_at | timestamptz | `now()` |
| user_id | uuid | — |
| title | text | — |
| company | text | — |
| location | text | — |
| description | text | — |
| url | text | — |
| status | text | `saved` |

Then run this in the SQL Editor to enable row-level security so users can only access their own jobs:

```sql
alter table saved_jobs enable row level security;

create policy "Users can view their own jobs"
on saved_jobs for select
using (auth.uid() = user_id);

create policy "Users can insert their own jobs"
on saved_jobs for insert
with check (auth.uid() = user_id);

create policy "Users can update their own jobs"
on saved_jobs for update
using (auth.uid() = user_id);

create policy "Users can delete their own jobs"
on saved_jobs for delete
using (auth.uid() = user_id);

grant usage on schema public to authenticated;
grant select, insert, update, delete on saved_jobs to authenticated;
```

### 4. Run the dev server

```bash
npm run dev
```

Visit `http://localhost:3000`.

## Current status

**Working:**
- Next.js app boots and renders
- Email/password signup and login (Supabase Auth), with email confirmation
- Session persistence across the app via `AuthProvider`
- `saved_jobs` table with RLS policies restricting access to each user's own rows
- API routes for saved jobs CRUD, AI job-fit scoring, and AI resume tailoring
- Job aggregation from Remotive and Arbeitnow

**In progress / not yet built:**
- Discover page (swipe-card UI)
- Applications page (Kanban board UI)
- Resume builder UI
- Portfolio builder UI
- Connecting browser session tokens to API routes so authenticated requests actually work end-to-end
- Styling (CSS Modules / design tokens)

## Security notes

- `.env.local` holds real secrets and is never committed
- The Supabase **anon/publishable** key is safe for client-side use only because RLS policies are enabled on all tables
- Table access is granted to the `authenticated` role only — not `anon` — so requests must come from a logged-in session