// lib/groq.js
// Groq API client — used for AI job-fit scoring and resume tailoring.
// Zero-cost stack: Groq's free-tier API (fast Llama inference).

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'openai/gpt-oss-120b';

async function callGroq(messages, { temperature = 0.3, jsonMode = false } = {}) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('Missing GROQ_API_KEY in environment variables');

  const body = {
    model: GROQ_MODEL,
    messages,
    temperature,
  };
  if (jsonMode) body.response_format = { type: 'json_object' };

  const res = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Groq API error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  return data.choices[0].message.content;
}

// Some responses come back wrapped in ```json ... ``` fences even with
// jsonMode on — strip those before parsing so a formatting quirk doesn't
// throw away an otherwise valid score.
function safeJsonParse(raw) {
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();
  return JSON.parse(cleaned);
}

// ---- Job fit scoring ----
// Returns { score: 0-100, reasons: [...], gaps: [...] }
//
// Scoring is intentionally generous: it weighs transferable and adjacent
// skills rather than exact keyword/requirement matching, so a candidate
// applying within their actual field scores in a realistic 60-90 range.
// Low scores are reserved for genuine field/seniority mismatches.
export async function scoreJobFit(resumeText, jobDescription) {
  const messages = [
    {
      role: 'system',
      content:
        'You are a job-matching assistant helping a candidate evaluate realistic ' +
        'opportunities — not a strict filter checking every listed requirement. ' +
        'Compare the resume against the job description and judge overall fit generously: ' +
        'give strong credit for transferable skills, adjacent domain experience, and growth ' +
        'potential, not just exact keyword matches. A candidate applying to a job reasonably ' +
        'within their field and seniority level should typically score in the 60-90 range. ' +
        'Reserve scores below 40 for cases where the role is clearly outside the candidate\'s ' +
        'field, industry, or experience level entirely. Return ONLY valid JSON with keys: ' +
        'score (0-100 integer), reasons (array of short strings on why it fits), gaps (array ' +
        'of short strings on missing skills/experience, can be empty).',
    },
    {
      role: 'user',
      content: `RESUME:\n${resumeText}\n\nJOB DESCRIPTION:\n${jobDescription}`,
    },
  ];

  const raw = await callGroq(messages, { temperature: 0.3, jsonMode: true });
  return safeJsonParse(raw);
}

// ---- Resume tailoring ----
// Returns tailored resume bullet points targeted at a specific job
export async function tailorResume(resumeText, jobDescription) {
  const messages = [
    {
      role: 'system',
      content:
        'You are a resume-writing assistant. Rewrite the given resume content to better ' +
        'match the job description, keeping all facts truthful — do not invent experience. ' +
        'Return ONLY valid JSON with keys: summary (string), bullets (array of tailored ' +
        'bullet point strings), keywords_added (array of strings).',
    },
    {
      role: 'user',
      content: `CURRENT RESUME:\n${resumeText}\n\nTARGET JOB:\n${jobDescription}`,
    },
  ];

  const raw = await callGroq(messages, { temperature: 0.4, jsonMode: true });
  return safeJsonParse(raw);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---- Batch scoring for swipe feed ----
// Scores multiple jobs against a resume for the swipe-card feed.
//
// Runs in concurrent chunks — fully parallel hit Groq's rate limit and
// silently failed some jobs (blank match rings); fully sequential was too
// slow. Chunking at 6 balances speed against staying under the limit.
const CONCURRENCY = 6;
const MAX_ATTEMPTS = 3; // 1 initial try + 2 retries

async function scoreOneWithRetry(resumeText, job) {
  let lastErr;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const fit = await scoreJobFit(resumeText, job.description);
      return { ...job, fit };
    } catch (err) {
      lastErr = err;
      if (attempt < MAX_ATTEMPTS) await sleep(300 * attempt);
    }
  }
  return { ...job, fit: null, error: lastErr?.message };
}

export async function scoreJobBatch(resumeText, jobs) {
  const results = [];
  for (let i = 0; i < jobs.length; i += CONCURRENCY) {
    const chunk = jobs.slice(i, i + CONCURRENCY);
    const chunkResults = await Promise.all(
      chunk.map((job) => scoreOneWithRetry(resumeText, job))
    );
    results.push(...chunkResults);
  }
  return results;
}