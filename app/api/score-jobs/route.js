// app/api/score-jobs/route.js
// NEW FILE — scores a batch of jobs against a resume using Groq.
import { NextResponse } from "next/server";
import { scoreJobBatch } from "@/lib/groq.js";

export async function POST(request) {
  try {
    const { resumeText, jobs } = await request.json();

    if (!resumeText || !Array.isArray(jobs)) {
      return NextResponse.json(
        { error: "resumeText and jobs[] are required" },
        { status: 400 }
      );
    }

    const scored = await scoreJobBatch(resumeText, jobs);

    // Flatten { ...job, fit } into { ...job, matchScore, matchReasons, matchGaps }
    // so SwipeCard (which reads job.matchScore directly) needs no changes.
    const jobsWithScores = scored.map(({ fit, error, ...job }) => ({
      ...job,
      matchScore: fit?.score ?? null,
      matchReasons: fit?.reasons ?? [],
      matchGaps: fit?.gaps ?? [],
    }));

    return NextResponse.json({ jobs: jobsWithScores });
  } catch (err) {
    console.error("Failed to score jobs:", err);
    return NextResponse.json(
      { error: err.message || "Failed to score jobs" },
      { status: 500 }
    );
  }
}