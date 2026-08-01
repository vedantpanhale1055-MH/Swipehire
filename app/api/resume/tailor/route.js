// app/api/resume/tailor/route.js
// Tailors resume content to a specific job description using Groq AI.
// NEW FILE — create this path fresh, it doesn't exist in your scaffold yet.

import { NextResponse } from 'next/server';
import { tailorResume } from '@/lib/groq';

// POST /api/resume/tailor  { resumeText, jobDescription }
export async function POST(request) {
  const body = await request.json();
  const { resumeText, jobDescription } = body;

  if (!resumeText || !jobDescription) {
    return NextResponse.json(
      { error: 'Missing resumeText or jobDescription' },
      { status: 400 }
    );
  }

  try {
    const tailored = await tailorResume(resumeText, jobDescription);
    return NextResponse.json({ tailored });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}