# SwipeHire

AI-powered job discovery, matching, and application tracker. Swipe through real job listings like a dating app, get AI-scored fit for each one, track your applications on a Kanban board, build a resume, and tailor that resume to specific jobs with AI — all built on a completely free stack.

Full product spec: see [PRD.md](./PRD.md)

---

## Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Frontend | Next.js 14 | App Router |
| Styling | CSS Modules | Shared design tokens in `lib/tokens.css`; light-orange/peach accent palette |
| Backend / DB | Supabase (Postgres) | Row-Level Security on every table, grants scoped to `authenticated` role |
| Auth | Supabase Auth | Email/password, session persisted via `AuthProvider` |
| AI | Groq (`openai/gpt-oss-120b`) | Resume tailoring, upcoming: match scoring |
| Job Data | Adzuna API (India endpoint) | Real listings — Bangalore, Mumbai, Ahmedabad, etc. |
| Hosting | Vercel | Deployed |

Chosen to keep the entire stack at **zero cost** while still being real, production-shaped infrastructure (not mock data throughout).

---

## Project Structure

```
app/
  (auth)/
    login/                 - Supabase email/password login
    signup/                - Signup + email confirmation
  discover/                - Swipe interface, pulls live Adzuna listings
  jobs/[id]/                - Job detail: AI match reasoning, interview tips, Tailor Resume
  applications/             - Kanban board: Saved / Applied / Interview / Offer
  jobs-list/                - Full searchable/filterable/sortable list of saved jobs
  calendar/                 - Interview dates on a month grid + upcoming list
  documents/                - Master resume + saved tailored resumes
  dashboard/                - Real stat counts + recent activity feed
  stats/                    - Funnel chart, response/offer rate, top companies
  resume-builder/           - Resume form + live A4-style preview
  settings/                 - Account email, link to resume builder, sign out
  api/jobs/                 - Server route that proxies Adzuna (avoids browser CORS)

components/
  SwipeCard/                - Drag + button swipe, match-score ring (green/yellow/red)
  JobDetail/                 - Match reasoning, tips, tailor button
  KanbanBoard/               - Drag-and-drop across status columns
  ResumeBuilder/             - Form + ResumePreview (single-column, matches real CV layout)
  Sidebar/                   - Shared nav, sticky, user card pinned to bottom
  Dashboard/, Settings/, ui/

lib/
  jobSources.js   - Adzuna integration + HTML entity decoding
  groq.js         - tailorResume() -> { summary, bullets, keywords_added }
  supabase.js     - saveJob, getUserJobs, updateJobStatus, addManualJob, getProfile, etc.
  tokens.css      - Color, spacing, and type design tokens
```

---

## Status: In active development, deployed to Vercel

### ✅ Done

**Auth**
- Email/password signup + confirmation + login, working end-to-end
- Session persistence via `AuthProvider`

**Discover**
- Real India job listings from Adzuna (switched from Arbeitnow for better city-level data)
- Swipe left/right (drag + buttons), right-swipe persists to `saved_jobs` in Supabase
- Card shows match score as a color-coded ring

**Job Detail**
- Pulled from Supabase (not mock data)
- AI match reasoning, interview tips, "about company"
- Tailor Resume button wired to Groq, fully working after fixing several bugs (missing onClick on Kanban cards, wrong data source, missing userId arg, decommissioned Groq model)

**Applications (Kanban)**
- Drag-and-drop between Saved / Applied / Interview / Offer, synced live to Supabase
- Search box filters by title/company
- "+ Add Job" modal for manually adding jobs outside the swipe flow

**Resume Builder**
- Full profile form: career objective, contact info, work history, projects (with per-project tech stacks), skills, education, certifications, languages
- Live preview in single-column layout matching Vedant's actual CV structure (went through a two-column redesign before landing here)
- Saves/reloads from a dedicated `profiles` table

**Dashboard**
- Real counts per status (saved/applied/interview/offer)
- Recent activity: last 6 jobs, clickable

**Jobs List**
- Search, filter, sort across all saved jobs
- Delete

**Calendar**
- Month grid showing interview-stage jobs on their scheduled date
- Upcoming interviews list
- Inline datetime picker for interview jobs missing a date

**Documents**
- Master resume card linking to Resume Builder
- Saved tailored resumes, expandable, copy-as-text
- "Save to Documents" added to the Tailor Resume modal (previously generate-and-forget)

**Stats**
- Top-line stats: total tracked, saved last 7 days, response rate, offer rate
- Application funnel bar chart, top 5 companies by saves — computed live, no chart library

**Infrastructure / fixes along the way**
- Patched critical Next.js CVEs (CVE-2025-55184, CVE-2025-67779), landed on `next@14.2.35`
- Sidebar present and consistent across every page (was missing on Discover)
- Root route (`app/page.js`) now redirects to `/dashboard` or `/login` instead of showing static text
- Fixed an import-casing bug (`components/Dashboard` → `components/dashboard`) that would've broken the Linux/Vercel build
- Every new page is verified with a real `next build` in a container clone of the repo before being handed off

### 🔨 In Progress
- **AI match scoring** — real Groq-based scoring of each job against the user's resume/profile, replacing the current placeholder scores shown on swipe cards

### ⏳ Not Started
- Portfolio builder
- Cover letter generation
- Job alerts / auto-refresh of listings

---

## Setup

1. Clone and install:
   ```bash
   git clone https://github.com/vedantpanhale1055-MH/Swipehire.git
   cd Swipehire
   npm install
   ```
2. Create `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   GROQ_API_KEY=
   ADZUNA_APP_ID=
   ADZUNA_APP_KEY=
   ```
3. Run locally:
   ```bash
   npm run dev
   ```

## Database

Supabase project (Tokyo region). Tables, all with RLS policies scoped to `authenticated`:
- `saved_jobs` — job data, status, interview_date, tailored_resume(_at)
- `profiles` — resume/profile data (name, links, skills, education, certifications, projects)

## Deployment

Live on Vercel, connected to the `main` branch of this repo.

## Repo

[github.com/vedantpanhale1055-MH/Swipehire](https://github.com/vedantpanhale1055-MH/Swipehire)