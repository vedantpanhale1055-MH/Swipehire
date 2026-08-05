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
  const fullDescription = decodeHtmlEntities(stripHtml(raw.description || ''));

  return {
    id: `arbeitnow-${raw.slug}`,
    title: raw.title,
    company: raw.company_name,
    location: raw.location || (raw.remote ? 'Remote' : 'Not specified'),
    description: truncate(fullDescription, 180), // short version for SwipeCard
    fullDescription, // untruncated version for Job Detail page
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
 */
function stripHtml(html) {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Decodes common HTML entities (numeric and named) left behind after
 * stripping tags — e.g. "&#x26;" -> "&", "&amp;" -> "&".
 */
function decodeHtmlEntities(str) {
  return str
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
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