"use client";

import { useEffect, useState } from "react";
import styles from "./Onboarding.module.css";

/**
 * Props:
 *  - initialProfile: profile object from Supabase (or null if none saved yet)
 *  - onSave(fields): called with { full_name, location, skills, summary }
 *  - saving: boolean, true while a save is in progress
 */
export default function OnboardingForm({ initialProfile, onSave, saving }) {
  const [fullName, setFullName] = useState("");
  const [location, setLocation] = useState("");
  const [skillsInput, setSkillsInput] = useState("");
  const [summary, setSummary] = useState("");

  useEffect(() => {
    if (!initialProfile) return;
    setFullName(initialProfile.full_name || "");
    setLocation(initialProfile.location || "");
    setSkillsInput((initialProfile.skills || []).join(", "));
    setSummary(initialProfile.summary || "");
  }, [initialProfile]);

  const canSubmit = fullName.trim().length > 0 && skillsInput.trim().length > 0;

  function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;

    const skills = skillsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    onSave({
      full_name: fullName,
      location,
      skills,
      summary,
    });
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <label className={styles.label}>
        Full name
        <input
          className={styles.input}
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="e.g. Vedant Panhale"
          required
        />
      </label>

      <label className={styles.label}>
        Location
        <input
          className={styles.input}
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="e.g. Pune, India"
        />
      </label>

      <label className={styles.label}>
        Skills (comma-separated)
        <input
          className={styles.input}
          type="text"
          value={skillsInput}
          onChange={(e) => setSkillsInput(e.target.value)}
          placeholder="e.g. React, Figma, UI/UX Design"
          required
        />
      </label>

      <label className={styles.label}>
        Short summary (optional)
        <textarea
          className={styles.textarea}
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="One or two lines about what you do"
        />
      </label>

      <button className={styles.submitBtn} type="submit" disabled={!canSubmit || saving}>
        {saving ? "Saving…" : "Continue"}
      </button>
    </form>
  );
}