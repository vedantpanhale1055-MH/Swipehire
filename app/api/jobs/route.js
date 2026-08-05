// app/api/jobs/route.js
import { NextResponse } from "next/server";
import { fetchAdzunaJobs } from "@/lib/jobSources/adzuna";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page")) || 1;
  const what = searchParams.get("what") || "";
  const where = searchParams.get("where") || "";

  try {
    const { jobs, nextPage } = await fetchAdzunaJobs({ page, what, where });
    return NextResponse.json({ jobs, nextPage });
  } catch (err) {
    console.error("Failed to fetch jobs from Adzuna:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch jobs" },
      { status: 502 }
    );
  }
}