// lib/jobSources/adzuna.js
//
// Adzuna Jobs API — India endpoint.
// Docs: https://developer.adzuna.com/overview
//
// Requires a free App ID + App Key from https://developer.adzuna.com/
// Set these in .env.local (never commit real keys):
//   ADZUNA_APP_ID=your_app_id
//   ADZUNA_APP_KEY=your_app_key
//
// NOTE: Field names match the shape used by lib/jobSources/arbeitnow.js
// (id, title, company, location, description, fullDescription, tags,
// url, remote, matchScore, postedAt, logo, source) so discover/page.js
// and app/api/jobs/route.js can treat both sources interchangeably.

const ADZUNA_APP_ID = process.env.ADZUNA_APP_ID;
const ADZUNA_APP_KEY = process.env.ADZUNA_APP_KEY;
const ADZUNA_COUNTRY = 'in'; // India
const ADZUNA_BASE_URL = `https://api.adzuna.com/v1/api/jobs/${ADZUNA_COUNTRY}/search`;

/**
 * Fetches jobs from Adzuna (India).
 * @param {Object} options
 * @param {number} [options.page=1] - Page number (1-indexed)
 * @param {string} [options.what] - Keyword search, e.g. "software engineer"
 * @param {string} [options.where] - Location filter, e.g. "Pune" or "Bangalore"
 * @param {number} [options.resultsPerPage=20]
 * @returns {Promise<{ jobs: Array, nextPage: number|null }>}
 */
export async function fetchAdzunaJobs({
  page = 1,
  what = '',
  where = '',
  resultsPerPage = 20,
} = {}) {
  if (!ADZUNA_APP_ID || !ADZUNA_APP_KEY) {
    throw new Error(
      'Adzuna API credentials missing — set ADZUNA_APP_ID and ADZUNA_APP_KEY in .env.local'
    );
  }

  const url = new URL(`${ADZUNA_BASE_URL}/${page}`);
  url.searchParams.set('app_id', ADZUNA_APP_ID);
  url.searchParams.set('app_key', ADZUNA_APP_KEY);
  url.searchParams.set('results_per_page', String(resultsPerPage));
  url.searchParams.set('content-type', 'application/json');
  if (what) url.searchParams.set('what', what);
  if (where) url.searchParams.set('where', where);

  const res = await fetch(url.toString(), {
    headers: { Accept: 'application/json' },
  });

  if (!res.ok) {
    throw new Error(`Adzuna API error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();

  const jobs = (data.results || []).map(normalizeAdzunaJob);
  const totalResults = data.count || 0;
  const seenSoFar = page * resultsPerPage;
  const nextPage = seenSoFar < totalResults ? page + 1 : null;

  return { jobs, nextPage };
}

/**
 * Converts a raw Adzuna job object into the app's normalized job shape.
 */
function normalizeAdzunaJob(raw) {
  const fullDescription = (raw.description || '').trim();

  return {
    id: `adzuna-${raw.id}`,
    title: raw.title,
    company: raw.company?.display_name || 'Unknown company',
    location: raw.location?.display_name || 'India',
    description: truncate(fullDescription, 180),
    fullDescription,
    tags: raw.category?.label ? [raw.category.label] : [],
    url: raw.redirect_url,
    remote: /remote/i.test(raw.title) || /remote/i.test(fullDescription),
    matchScore: null, // placeholder — AI scoring not wired up yet
    postedAt: raw.created || null,
    logo: null, // Adzuna doesn't provide company logos
    source: 'adzuna',
    salary: formatSalary(raw.salary_min, raw.salary_max),
  };
}

function formatSalary(min, max) {
  if (!min && !max) return null;
  if (min && max && min !== max) {
    return `₹${Math.round(min).toLocaleString('en-IN')} - ₹${Math.round(max).toLocaleString('en-IN')}`;
  }
  const value = min || max;
  return `₹${Math.round(value).toLocaleString('en-IN')}`;
}

/**
 * Truncates text to a max length at a word boundary, adding an ellipsis.
 */
function truncate(str, maxLength) {
  if (str.length <= maxLength) return str;
  const cut = str.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(' ');
  return `${cut.slice(0, lastSpace > 0 ? lastSpace : maxLength)}…`;
}