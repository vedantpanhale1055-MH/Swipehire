// lib/jobSources.js
// Adapter layer for aggregating job listings from multiple free/public sources.
// Each source implements a fetchJobs(query) function and returns a normalized shape:
// { id, title, company, location, description, url, source, postedAt }

const REMOTIVE_API = 'https://remotive.com/api/remote-jobs';
const ARBEITNOW_API = 'https://www.arbeitnow.com/api/job-board-api';

function normalizeRemotive(job) {
  return {
    id: `remotive-${job.id}`,
    title: job.title,
    company: job.company_name,
    location: job.candidate_required_location || 'Remote',
    description: job.description,
    url: job.url,
    source: 'Remotive',
    postedAt: job.publication_date,
  };
}

function normalizeArbeitnow(job) {
  return {
    id: `arbeitnow-${job.slug}`,
    title: job.title,
    company: job.company_name,
    location: job.location || 'Remote',
    description: job.description,
    url: job.url,
    source: 'Arbeitnow',
    postedAt: job.created_at,
  };
}

export async function fetchRemotiveJobs(query = '') {
  const url = query
    ? `${REMOTIVE_API}?search=${encodeURIComponent(query)}`
    : REMOTIVE_API;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Remotive fetch failed: ${res.status}`);
  const data = await res.json();
  return (data.jobs || []).map(normalizeRemotive);
}

export async function fetchArbeitnowJobs(query = '') {
  const res = await fetch(ARBEITNOW_API);
  if (!res.ok) throw new Error(`Arbeitnow fetch failed: ${res.status}`);
  const data = await res.json();
  const jobs = (data.data || []).map(normalizeArbeitnow);
  if (!query) return jobs;
  const q = query.toLowerCase();
  return jobs.filter(
    (j) => j.title.toLowerCase().includes(q) || j.description.toLowerCase().includes(q)
  );
}

// ---- Combined aggregator ----
// Fetches from all sources in parallel, merges, and dedupes by title+company.
export async function fetchAllJobs(query = '') {
  const results = await Promise.allSettled([
    fetchRemotiveJobs(query),
    fetchArbeitnowJobs(query),
  ]);

  const jobs = results
    .filter((r) => r.status === 'fulfilled')
    .flatMap((r) => r.value);

  const seen = new Set();
  return jobs.filter((job) => {
    const key = `${job.title.toLowerCase()}-${job.company.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}