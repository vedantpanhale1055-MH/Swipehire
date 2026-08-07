import { NextResponse } from "next/server";
import { tailorResume } from "@/lib/groq";

// POST /api/tailor-resume
// body: { resumeText: string, jobDescription: string }
// returns: { tailored: { summary, bullets, keywords_added } }
export async function POST(request) {
  try {
    const { resumeText, jobDescription } = await request.json();

    if (!resumeText || !resumeText.trim()) {
      return NextResponse.json(
        { error: "Missing resume data — build your profile first" },
        { status: 400 }
      );
    }

    if (!jobDescription || !jobDescription.trim()) {
      return NextResponse.json(
        { error: "Missing job description" },
        { status: 400 }
      );
    }

    const tailored = await tailorResume(resumeText, jobDescription);

    return NextResponse.json({ tailored });
  } catch (err) {
    console.error("Tailor resume error:", err);
    return NextResponse.json(
      { error: "Failed to tailor resume" },
      { status: 500 }
    );
  }
}