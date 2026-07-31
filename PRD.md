# SwipeHire

**AI-Powered Job Discovery, Matching, Application Tracking & Resume Builder**

Version 2.0 — July 2026
Author: Vedant Panhale

---

## Table of contents

- [1. Overview](#1-overview)
  - [1.1 Summary](#11-summary)
  - [1.2 Problem statement](#12-problem-statement)
  - [1.3 Goals](#13-goals)
  - [1.4 Non-goals (v1)](#14-non-goals-v1)
- [2. Target users](#2-target-users)
  - [2.1 Primary persona](#21-primary-persona)
  - [2.2 Usage model](#22-usage-model)
- [3. Feature set](#3-feature-set)
  - [3.1 Job aggregation engine](#31-job-aggregation-engine)
  - [3.2 AI resume & preference intake](#32-ai-resume--preference-intake)
  - [3.3 AI match scoring](#33-ai-match-scoring)
  - [3.4 Swipe discovery interface](#34-swipe-discovery-interface)
  - [3.5 Application tracker (Kanban board)](#35-application-tracker-kanban-board)
  - [3.6 Resume builder & tailoring](#36-resume-builder--tailoring)
  - [3.7 Portfolio builder](#37-portfolio-builder)
- [4. User flow](#4-user-flow)
- [5. Data model](#5-data-model)
- [6. Tech stack (zero-cost)](#6-tech-stack-zero-cost)
- [7. Scaling & cost-control strategy](#7-scaling--cost-control-strategy)
- [8. Legal & compliance notes](#8-legal--compliance-notes)
- [9. Phased roadmap](#9-phased-roadmap)
- [10. Success metrics](#10-success-metrics)
- [11. Open decisions log](#11-open-decisions-log)

---

## 1. Overview

### 1.1 Summary

SwipeHire is an AI-assisted job discovery, matching, application tracking, and resume/portfolio building tool. It aggregates job and internship listings from legitimate public sources, scores each listing against a user's resume using AI, and presents matches through a swipe-based discovery interface. Jobs a user swipes right on are saved into a Kanban-style tracker that follows the application through each stage, from Saved to Offer.

SwipeHire is built for multi-user use — for the author's own job search and for anyone else who finds it via GitHub or LinkedIn — while running entirely on free-tier infrastructure.

### 1.2 Problem statement

- Job search across multiple platforms (LinkedIn, Indeed, company career pages) is fragmented and manual.
- Candidates struggle to judge, at a glance, whether a listing is actually a good fit for their background.
- Once someone starts applying broadly, tracking status across dozens of applications in a spreadsheet is tedious and easy to abandon.
- Tailoring a resume per job is high-effort, so most candidates send the same resume everywhere, hurting response rates.
- Building a resume and a portfolio site are treated as separate tasks in separate tools, even though they draw from the same underlying profile data.

### 1.3 Goals

- Aggregate job/internship/part-time listings from legal, public sources into one feed.
- Let users triage listings quickly via a simple swipe interface, ranked by AI-computed fit.
- Automatically track saved jobs through an application pipeline (Kanban board).
- Offer AI-assisted resume tailoring suggestions per job.
- Let users build both a structured resume and a public portfolio page from one profile.
- Support job type filtering across internship, full-time, part-time, and contract roles, and location filtering across remote, hybrid, and onsite.
- Support multiple users, not just the author, while staying on free-tier infrastructure end to end.
- Do all of the above without violating the Terms of Service of any source platform.

### 1.4 Non-goals (v1)

- Auto-submitting applications on the user's behalf (e.g. automated LinkedIn Easy Apply). This risks account bans and ToS violations and is explicitly out of scope.
- Scraping LinkedIn, Indeed, or Glassdoor directly. All three explicitly prohibit this in their Terms of Service.
- Recruiter-facing features (posting jobs, managing candidates as an employer). This remains a candidate-facing tool.
- Extended swipe actions (undo, super-like, boost). v1 ships a simple two-action card — reject or save — to keep triage fast; richer actions are a possible v2 addition once the core loop is validated.

---

## 2. Target users

### 2.1 Primary persona

**Who:** Students and early-career professionals applying to internships, part-time roles, and entry-level jobs across multiple platforms simultaneously.

**Context:** Actively job hunting, applying to 10–50+ roles, currently tracking this manually via spreadsheet, notes app, or not tracking it at all.

**Pain today:** Spends hours per week manually browsing job boards, loses track of what's been applied to, resume is generic across all applications.

### 2.2 Usage model

SwipeHire is built for the author's own job search first, then shared publicly via GitHub and LinkedIn. Because distribution is public rather than a fixed invite list, user growth is open-ended and not fully predictable in advance — see [Section 7](#7-scaling--cost-control-strategy) for how the architecture accounts for this.

---

## 3. Feature set

### 3.1 Job aggregation engine

Collects listings from multiple legitimate sources on a scheduled basis and normalizes them into a single schema, shared across all users rather than re-fetched per user.

| Source type | Examples | Access method |
|---|---|---|
| Job search APIs | Adzuna, Jooble, RemoteOK, Arbeitnow, TheMuse, USAJobs | Official public/free REST APIs |
| ATS public endpoints | Greenhouse, Lever, Workday boards | Public unauthenticated JSON endpoints published by companies |
| Web search | General queries (e.g. site-scoped searches) | Search API |

*Explicitly excluded: direct scraping of LinkedIn, Indeed, or Glassdoor, all of which prohibit this in their Terms of Service.*

### 3.2 AI resume & preference intake

- User uploads a resume (PDF/DOCX), parsed into structured data (skills, experience, education).
- User sets preferences: role type (internship / full-time / part-time / contract), location, remote / hybrid / onsite, target compensation range.
- AI generates search queries from resume + preferences to drive the aggregation engine.

### 3.3 AI match scoring

- Each ingested job is scored 0–100 against a user's resume.
- Score is accompanied by a short reasoning string and a list of matched skills (e.g. UX Design, Figma, User Research), shown as chips in the detail view.
- Swipe deck defaults to sorting by match score, with filters for job type, location, and salary range.
- Resume-independent parts of scoring (e.g. parsing the job description itself) are computed once per job and cached, not recomputed per user, to keep AI usage within free-tier limits.

### 3.4 Swipe discovery interface

- Card stack; one job listing per card.
- Card front: company logo, title, company, location, remote/onsite tag, job type badge, compensation range, match score badge.
- Two actions only: reject (discard, not shown again) or save (adds to tracker with status Saved, opens detail view).
- Detail view (opened after save or tap): full job description, AI match reasoning with matched-skill chips, AI-generated interview prep tips, company overview, and a "Tailor my resume for this job" action.

### 3.5 Application tracker (Kanban board)

Every saved job becomes a card on the board. Columns represent pipeline stages:

Saved → Applied → Assessment/OA → Interview → Offer → Rejected

Card front face:
- Company logo
- Role title
- Company name
- Time since saved/applied/status change

Clicking a card opens the same detail view used in discovery, plus status history and free-text notes. Cards are dragged between columns to update status.

### 3.6 Resume builder & tailoring

- Structured resume builder: sections for experience, education, skills, and projects, with a live preview panel and clean PDF export.
- Per-job tailoring: from a job's detail view, AI suggests specific edits (reordering bullets, emphasizing relevant skills, adjusting summary) to better match that listing.
- Multiple resume versions can be saved and linked to specific applications in the tracker.

### 3.7 Portfolio builder

- A public-facing portfolio page generated from the same structured profile data used by the resume builder (name, role, summary, featured projects, skills, contact links).
- Project cards with icon/thumbnail, title, category tags, short description.
- Shareable as a public link, separate from the private resume PDF.

---

## 4. User flow

### 4.1 Onboarding

Upload resume → AI parses into structured profile → set job preferences → initial ingestion run populates the swipe deck.

### 4.2 Discovery loop

Open app → swipe through ranked cards → save opens detail view → optionally tailor resume → job lands in tracker as "Saved."

### 4.3 Tracking loop

User manually applies via the listing's original apply link → drags card to "Applied" → updates status as the process progresses → adds notes (e.g. recruiter contact, interview dates).

### 4.4 Resume/portfolio loop

Build structured profile once → export tailored resume PDFs per application → publish portfolio page from the same data.

---

## 5. Data model

### 5.1 Job

| Field | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| title | string | |
| company | string | |
| location | string | City + remote/hybrid/onsite flag |
| job_type | enum | internship / full_time / part_time / contract |
| compensation_min / max | number | Normalized at ingestion |
| compensation_period | enum | monthly / annual |
| description | text | Full JD |
| apply_link | string | Original source URL |
| source | enum | adzuna / jooble / greenhouse / websearch / … |
| match_reasoning_template | text | AI-generated, resume-independent, cached |

### 5.2 User match (per user, per job)

| Field | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| user_id | UUID | Foreign key → User |
| job_id | UUID | Foreign key → Job |
| match_score | integer | 0–100, AI-generated per user |
| matched_skills | array | Chips shown in detail view |
| prep_resources | text | AI-generated |

### 5.3 Application (tracker entry)

| Field | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| user_id | UUID | Foreign key → User |
| job_id | UUID | Foreign key → Job |
| status | enum | Saved / Applied / Assessment / Interview / Offer / Rejected |
| status_updated_at | timestamp | |
| notes | text | Free-text, user-entered |
| resume_version_id | UUID | Foreign key → Resume, optional |

### 5.4 User & profile

| Field | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| email | string | Auth identity |
| structured_profile | JSON | Shared source for resume + portfolio |
| preferences | JSON | Role type, location, comp range |

---

## 6. Tech stack (zero-cost)

| Layer | Choice | Why |
|---|---|---|
| Frontend | Next.js + framer-motion | Swipe card physics; deploys free on Vercel |
| Styling | CSS Modules + a shared design-token file | Scoped, no runtime cost, avoids utility-class sprawl |
| Backend | Next.js API routes | Small enough that separate infra isn't needed for v1 |
| Database & Auth | Supabase (Postgres + Auth), free tier | Relational data needs real relations; free auth included |
| AI | Groq (Llama 3.3 70B / 8B), free tier | No card required, generous enough for match scoring, tailoring, and query generation at this scale |
| Hosting | Vercel, free tier | Connects directly to GitHub for deploys |
| Job data | Adzuna, Jooble, Arbeitnow, RemoteOK, TheMuse — free tiers | Aggregation sources |
| Ingestion | Scheduled function (cron) | Periodic pulls from job APIs and ATS endpoints |

---

## 7. Scaling & cost-control strategy

Because distribution is public (GitHub, LinkedIn), user growth isn't fully predictable, and the free-tier AI budget is shared across all users, not per-user. To stay zero-cost at scale:

- **Cache and batch AI calls.** Score the resume-independent parts of a job once, not once per user; run scoring as an async job, not synchronously per swipe.
- **Soft launch / waitlist.** A simple "request access" gate lets the author control ramp-up instead of an uncontrolled spike from a single post.
- **Bring-your-own-key fallback.** If usage exceeds Groq's free tier, users can optionally provide their own free Groq or Gemini API key — keeps the project zero-cost for the author even if it grows.
- **Rate-limit gracefully.** Queue and retry AI requests rather than failing outright when the shared rate limit is hit.

---

## 8. Legal & compliance notes

- LinkedIn, Indeed, and Glassdoor all prohibit unauthorized scraping in their Terms of Service; none currently offer a public API for searching job listings at scale.
- All data sources used in this product must be either official public APIs or publicly published, unauthenticated endpoints intended for programmatic access (e.g. ATS job boards).
- No automated actions (applying, messaging, connecting) are performed on a user's behalf on any third-party platform.
- If broader job coverage is needed later, the correct path is applying for official partner API access rather than scraping — noting this is a slow, enterprise-oriented process, not a v1 option.

---

## 9. Phased roadmap

### Phase 1 — MVP

- Manual job entry + paste-a-JD matching (no aggregation yet).
- Resume upload + AI match scoring against pasted JDs.
- Basic Kanban tracker (no swipe deck yet).
- Single-user, no auth yet.

### Phase 2 — Aggregation + swipe + auth

- Integrate Adzuna / Jooble / Arbeitnow APIs for automatic listing ingestion.
- Build swipe deck UI (simple reject/save), wire save → tracker.
- Add Supabase Auth; move from single-user to multi-user data model.

### Phase 3 — Resume builder, tailoring & portfolio

- Structured resume builder with live preview and PDF export.
- Per-job AI tailoring suggestions.
- Public portfolio page generated from the same profile data.

### Phase 4 — Expanded sources, scaling & polish

- Add Greenhouse/Lever public endpoint ingestion for company-specific tracking.
- Add prep-resource generation, notes, reminders for stale applications.
- Add soft-launch waitlist and bring-your-own-key fallback ahead of public GitHub/LinkedIn release.

---

## 10. Success metrics

- Time from resume upload to first relevant swipe deck populated.
- Percentage of saved jobs that reach "Applied" status (signals swipe-right quality).
- User-reported relevance of AI match scores (qualitative, v1).
- Number of applications actively tracked without abandonment after two weeks.
- Number of external users onboarded after public release, without exceeding free-tier AI limits.

---

## 11. Open decisions log

Decisions made during planning, kept here for traceability:

- **Product name:** SwipeHire (chosen over "JobTrack" — names the actual differentiator rather than a generic category).
- **Discovery card actions:** simple two-action (reject/save), not the extended five-action set — prioritizes fast triage per the stated v1 goal.
- **Scope:** multi-user from the start, not a single-user personal tool, distributed publicly via GitHub and LinkedIn.
- **Styling:** CSS Modules, not Tailwind.
- **AI provider:** Groq free tier, chosen for zero cost and prior success in a related project.