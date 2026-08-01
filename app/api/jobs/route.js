// app/api/jobs/route.js
// Handles saved jobs: fetch a user's jobs, save a new one, update status, delete.
// NEW FILE — create this path fresh, it doesn't exist in your scaffold yet.

import { NextResponse } from 'next/server';
import { getUserJobs, saveJob, updateJobStatus, deleteJob } from '@/lib/supabase';

// GET /api/jobs?userId=xxx
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }

  try {
    const jobs = await getUserJobs(userId);
    return NextResponse.json({ jobs });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/jobs  { userId, job: {...} }
export async function POST(request) {
  const body = await request.json();
  const { userId, job } = body;

  if (!userId || !job) {
    return NextResponse.json({ error: 'Missing userId or job' }, { status: 400 });
  }

  try {
    const saved = await saveJob(userId, job);
    return NextResponse.json({ job: saved }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH /api/jobs  { jobId, status }
export async function PATCH(request) {
  const body = await request.json();
  const { jobId, status } = body;

  if (!jobId || !status) {
    return NextResponse.json({ error: 'Missing jobId or status' }, { status: 400 });
  }

  try {
    const updated = await updateJobStatus(jobId, status);
    return NextResponse.json({ job: updated });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/jobs?jobId=xxx
export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get('jobId');

  if (!jobId) {
    return NextResponse.json({ error: 'Missing jobId' }, { status: 400 });
  }

  try {
    await deleteJob(jobId);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}