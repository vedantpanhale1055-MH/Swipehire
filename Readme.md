# SwipeHire

AI-powered job discovery, matching, application tracking, and resume/portfolio builder — built to run entirely on free-tier infrastructure.

Full product spec: [PRD.md](./PRD.md)

## Features

- 🔎 **Job aggregation** — pulls listings from Adzuna, Jooble, Arbeitnow, RemoteOK, TheMuse, and public ATS endpoints (Greenhouse, Lever). No LinkedIn/Indeed/Glassdoor scraping.
- 🎯 **AI match scoring** — every listing is scored 0–100 against your resume, with a plain-language reasoning breakdown and matched-skill chips.
- 🃏 **Swipe discovery** — quick reject/save triage, sorted by match score, filterable by job type and location.
- 📋 **Kanban tracker** — saved jobs flow through Saved → Applied → Assessment → Interview → Offer → Rejected, with notes and status history.
- 📝 **Resume builder** — structured sections (experience, education, skills, projects), live preview, clean PDF export.
- ✏️ **Per-job tailoring** — AI suggests specific edits to your resume for each job you're applying to.
- 🌐 **Portfolio builder** — a shareable public page generated from the same profile data as your resume.
- 🌍 **Job types & modes** — internship, full-time, part-time, contract, across remote, hybrid, and onsite.

## Screenshots

| Discovery | Job detail | Tracker |
|---|---|---|
| _add screenshot_ | _add screenshot_ | _add screenshot_ |

| Resume builder | Portfolio |
|---|---|
| _add screenshot_ | _add screenshot_ |

## Tech stack

| Layer | Choice |
|---|---|
| Frontend | Next.js + framer-motion |
| Styling | CSS Modules |
| Backend | Next.js API routes |
| Database & Auth | Supabase (Postgres + Auth) |
| AI | Groq (Llama 3.3 70B / 8B) |
| Hosting | Vercel |
| Job data | Adzuna, Jooble, Arbeitnow, RemoteOK, TheMuse |

Everything above runs on a free tier — see [Section 6](./PRD.md#6-tech-stack-zero-cost) of the PRD for details, and [Section 7](./PRD.md#7-scaling--cost-control-strategy) for how it stays free-tier even as usage grows.

## Status

In active development. See the [phased roadmap](./PRD.md#9-phased-roadmap) for what's shipped vs. planned.

- [x] PRD finalized
- [ ] Phase 1 — paste-a-JD matching + basic tracker
- [ ] Phase 2 — aggregation + swipe deck + auth
- [ ] Phase 3 — resume builder + tailoring + portfolio
- [ ] Phase 4 — expanded sources + scaling polish

## Project structure

```
Swipehire/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── signup/
│   ├── discover/          # swipe deck
│   ├── applications/      # kanban tracker
│   ├── resume/            # resume builder
│   ├── portfolio/
│   │   └── [username]/    # public portfolio page
│   ├── api/
│   │   ├── ingest/        # job aggregation
│   │   ├── match-score/   # AI match scoring
│   │   ├── tailor-resume/ # per-job resume tailoring
│   │   ├── applications/  # tracker CRUD
│   │   └── resume-parse/  # resume upload parsing
│   ├── layout.js
│   └── globals.css
├── components/
│   ├── SwipeCard/
│   ├── JobDetail/
│   ├── KanbanBoard/
│   ├── ResumeBuilder/
│   └── ui/
├── lib/
│   ├── supabase.js
│   ├── groq.js
│   ├── jobSources/         # one file per aggregation source
│   │   ├── adzuna.js
│   │   ├── jooble.js
│   │   ├── arbeitnow.js
│   │   └── greenhouse.js
│   └── tokens.css          # shared design tokens for CSS Modules
├── public/
├── .env.local
├── package.json
├── README.md
└── PRD.md
```

## Getting started

```bash
git clone https://github.com/vedantpanhale1055-MH/Swipehire.git
cd Swipehire
npm install
```

Create a `.env.local` with:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
GROQ_API_KEY=
ADZUNA_APP_ID=
ADZUNA_APP_KEY=
JOOBLE_API_KEY=
```

Then run:

```bash
npm run dev
```

## Contributing

This is a personal project currently in early development. Issues and suggestions are welcome; PRs may be reviewed loosely until the core (Phase 1–2) stabilizes.

## License

MIT