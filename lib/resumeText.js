// lib/resumeText.js
// Converts a `profiles` table row (as used by ResumeBuilder) into a plain-text
// resume string suitable for feeding into Groq prompts (scoreJobFit / tailorResume).

export function buildResumeText(profile) {
  if (!profile) return "";

  const lines = [];

  if (profile.name) lines.push(profile.name);
  if (profile.career_objective) lines.push(profile.career_objective);

  const contact = [profile.location, profile.phone, profile.email]
    .filter(Boolean)
    .join(" | ");
  if (contact) lines.push(contact);

  if (profile.skills?.length) {
    lines.push("\nSKILLS");
    lines.push(profile.skills.join(", "));
  }

  if (profile.work_history?.length) {
    lines.push("\nWORK HISTORY");
    for (const job of profile.work_history) {
      lines.push(`${job.title} — ${job.company} (${job.duration || ""})`);
      if (job.description) lines.push(job.description);
    }
  }

  if (profile.projects?.length) {
    lines.push("\nPROJECTS");
    for (const proj of profile.projects) {
      const tech = proj.technologies?.length ? ` [${proj.technologies.join(", ")}]` : "";
      lines.push(`${proj.name}${tech}`);
      if (proj.description) lines.push(proj.description);
    }
  }

  if (profile.education?.length) {
    lines.push("\nEDUCATION");
    for (const edu of profile.education) {
      lines.push(`${edu.degree} — ${edu.institution} (${edu.year || ""})`);
    }
  }

  if (profile.certifications?.length) {
    lines.push("\nCERTIFICATIONS");
    lines.push(profile.certifications.join(", "));
  }

  if (profile.languages?.length) {
    lines.push("\nLANGUAGES");
    lines.push(profile.languages.join(", "));
  }

  return lines.join("\n");
}