"use client";
// components/Onboarding/OnboardingForm.jsx
// REPLACES EXISTING FILE — now styled with the shared AuthForm classes.

import { useEffect, useState } from "react";
import styles from "@/components/Auth/AuthForm.module.css";

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
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.field}>
        <label htmlFor="fullName" className={styles.label}>
          Full name
        </label>
        <input
          id="fullName"
          className={styles.input}
          type="text"
          autoComplete="name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="e.g. Vedant Panhale"
          required
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="location" className={styles.label}>
          Location
        </label>
        <input
          id="location"
          className={styles.input}
          type="text"
          autoComplete="address-level2"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="e.g. Pune, India"
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="skills" className={styles.label}>
          Skills
        </label>
        <input
          id="skills"
          className={styles.input}
          type="text"
          value={skillsInput}
          onChange={(e) => setSkillsInput(e.target.value)}
          placeholder="e.g. React, Figma, UI/UX Design"
          required
        />
        <span className={styles.hint}>Comma-separated.</span>
      </div>

      <div className={styles.field}>
        <label htmlFor="summary" className={styles.label}>
          Short summary (optional)
        </label>
        <textarea
          id="summary"
          className={styles.textarea}
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="One or two lines about what you do"
        />
      </div>

      <button className={styles.submitButton} type="submit" disabled={!canSubmit || saving}>
        {saving ? "Saving…" : "Continue"}
      </button>
    </form>
  );
}