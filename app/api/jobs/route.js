// app/api/jobs/route.js
import { NextResponse } from "next/server";
import { fetchArbeitnowJobs } from "@/lib/jobSources/arbeitnow";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page")) || 1;

  try {
    const { jobs, nextPage } = await fetchArbeitnowJobs({ page });
    return NextResponse.json({ jobs, nextPage });
  } catch (err) {
    console.error("Failed to fetch jobs from Arbeitnow:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch jobs" },
      { status: 502 }
    );
  }
}