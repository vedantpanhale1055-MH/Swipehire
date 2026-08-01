// app/api/jobs/score/route.js
// Scores one job (or a batch) against a resume using Groq AI.
// NEW FILE — create this path fresh, it doesn't exist in your scaffold yet.

import { NextResponse } from 'next/server';
import { scoreJobFit, scoreJobBatch } from '@/lib/groq';

// POST /api/jobs/score
// Single job:  { resumeText, jobDescription }
// Batch mode:  { resumeText, jobs: [{ description, ... }] }
export async function POST(request) {
  const body = await request.json();
  const { resumeText, jobDescription, jobs } = body;

  if (!resumeText) {
    return NextResponse.json({ error: 'Missing resumeText' }, { status: 400 });
  }

  try {
    if (jobs && Array.isArray(jobs)) {
      const scored = await scoreJobBatch(resumeText, jobs);
      return NextResponse.json({ jobs: scored });
    }

    if (!jobDescription) {
      return NextResponse.json(
        { error: 'Missing jobDescription (or provide jobs[] for batch mode)' },
        { status: 400 }
      );
    }

    const fit = await scoreJobFit(resumeText, jobDescription);
    return NextResponse.json({ fit });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}