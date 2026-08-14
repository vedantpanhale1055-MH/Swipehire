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

// ---- Job fit scoring ----
// Returns { score: 0-100, reasons: [...], gaps: [...] }
export async function scoreJobFit(resumeText, jobDescription) {
  const messages = [
    {
      role: 'system',
      content:
        'You are a job-matching assistant. Compare a resume against a job description ' +
        'and return ONLY valid JSON with keys: score (0-100 integer), reasons (array of ' +
        'short strings on why it fits), gaps (array of short strings on missing skills/experience).',
    },
    {
      role: 'user',
      content: `RESUME:\n${resumeText}\n\nJOB DESCRIPTION:\n${jobDescription}`,
    },
  ];

  const raw = await callGroq(messages, { temperature: 0.2, jsonMode: true });
  return JSON.parse(raw);
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
  return JSON.parse(raw);
}

// ---- Batch scoring for swipe feed ----
// Scores multiple jobs at once for the swipe-card feed.
// Runs in parallel (Promise.all) rather than sequentially — a sequential
// loop over 15-20 Groq calls was taking too long for a single page load.
// Each job scores independently, so one failure doesn't block the rest.
export async function scoreJobBatch(resumeText, jobs) {
  const results = await Promise.all(
    jobs.map(async (job) => {
      try {
        const fit = await scoreJobFit(resumeText, job.description);
        return { ...job, fit };
      } catch (err) {
        return { ...job, fit: null, error: err.message };
      }
    })
  );
  return results;
}