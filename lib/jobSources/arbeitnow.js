// lib/jobSources/arbeitnow.js
//
// Arbeitnow public Job Board API — no API key required.
// Docs: https://arbeitnow.com/api/job-board-api
//
// NOTE: Field names below are a best-guess standard shape
// (id, title, company, location, description, tags, url, remote,
// matchScore, postedAt, logo). If this doesn't match what your
// SwipeCard/discover page currently reads from lib/mockJobs.js,
// send me that file's shape and I'll adjust the mapping in
// normalizeArbeitnowJob() below — nothing else needs to change.

const ARBEITNOW_API_URL = 'https://arbeitnow.com/api/job-board-api';

/**
 * Fetches jobs from Arbeitnow.
 * @param {Object} options
 * @param {number} [options.page=1] - Page number (Arbeitnow paginates results)
 * @returns {Promise<{ jobs: Array, nextPage: number|null }>}
 */
export async function fetchArbeitnowJobs({ page = 1 } = {}) {
  const url = page > 1 ? `${ARBEITNOW_API_URL}?page=${page}` : ARBEITNOW_API_URL;

  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
    next: { revalidate: 3600 }, // cache 1hr if used in a Next.js server context
  });

  if (!res.ok) {
    throw new Error(`Arbeitnow API error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();

  const jobs = (data.data || []).map(normalizeArbeitnowJob);
  const nextPage = data.links?.next ? page + 1 : null;

  return { jobs, nextPage };
}

/**
 * Converts a raw Arbeitnow job object into the app's normalized job shape.
 */
function normalizeArbeitnowJob(raw) {
  return {
    id: `arbeitnow-${raw.slug}`,
    title: raw.title,
    company: raw.company_name,
    location: raw.location || (raw.remote ? 'Remote' : 'Not specified'),
    description: stripHtml(raw.description || ''),
    tags: raw.tags || [],
    url: raw.url,
    remote: Boolean(raw.remote),
    matchScore: null, // placeholder — AI scoring not wired up yet
    postedAt: raw.created_at
      ? new Date(raw.created_at * 1000).toISOString()
      : null,
    logo: raw.company_logo || null,
    source: 'arbeitnow',
  };
}

/**
 * Arbeitnow descriptions come back as HTML — strip tags for card display.
 * (Full HTML can still be rendered on the Job Detail page if desired —
 * swap this out for a sanitize-and-render approach there if needed.)
 */
function stripHtml(html) {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}