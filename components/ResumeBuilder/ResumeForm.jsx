"use client";

import { useState, useEffect } from "react";
import styles from "./ResumeBuilder.module.css";

/**
 * Props:
 *  - initialProfile: profile object from Supabase (or null if none saved yet)
 *  - onSave(profile): called with the full profile object when Save is clicked
 *  - saving: boolean, true while a save is in progress
 */
export default function ResumeForm({ initialProfile, onSave, saving }) {
  const [fullName, setFullName] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [skillsInput, setSkillsInput] = useState("");
  const [experience, setExperience] = useState([]);
  const [education, setEducation] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    if (!initialProfile) return;
    setFullName(initialProfile.full_name || "");
    setGithubUrl(initialProfile.github_url || "");
    setLinkedinUrl(initialProfile.linkedin_url || "");
    setSkillsInput((initialProfile.skills || []).join(", "));
    setExperience(initialProfile.experience || []);
    setEducation(initialProfile.education || []);
    setCertifications(initialProfile.certifications || []);
    setProjects(initialProfile.projects || []);
  }, [initialProfile]);

  function addRow(setter, emptyRow) {
    setter((prev) => [...prev, emptyRow]);
  }

  function updateRow(setter, index, field, value) {
    setter((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  }

  function removeRow(setter, index) {
    setter((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const skills = skillsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    onSave({
      full_name: fullName,
      github_url: githubUrl,
      linkedin_url: linkedinUrl,
      skills,
      experience,
      education,
      certifications,
      projects,
    });
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Basic Info</h2>
        <label className={styles.label}>
          Full Name
          <input
            className={styles.input}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Your name"
          />
        </label>
        <label className={styles.label}>
          GitHub URL
          <input
            className={styles.input}
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            placeholder="https://github.com/yourusername"
          />
        </label>
        <label className={styles.label}>
          LinkedIn URL
          <input
            className={styles.input}
            value={linkedinUrl}
            onChange={(e) => setLinkedinUrl(e.target.value)}
            placeholder="https://linkedin.com/in/yourusername"
          />
        </label>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Skills</h2>
        <label className={styles.label}>
          Comma-separated
          <input
            className={styles.input}
            value={skillsInput}
            onChange={(e) => setSkillsInput(e.target.value)}
            placeholder="React, Node.js, Python, Figma"
          />
        </label>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Experience</h2>
          <button
            type="button"
            className={styles.addBtn}
            onClick={() =>
              addRow(setExperience, {
                company: "",
                role: "",
                startDate: "",
                endDate: "",
                description: "",
              })
            }
          >
            + Add
          </button>
        </div>
        {experience.map((row, i) => (
          <div key={i} className={styles.row}>
            <input
              className={styles.input}
              placeholder="Company"
              value={row.company}
              onChange={(e) => updateRow(setExperience, i, "company", e.target.value)}
            />
            <input
              className={styles.input}
              placeholder="Role"
              value={row.role}
              onChange={(e) => updateRow(setExperience, i, "role", e.target.value)}
            />
            <input
              className={styles.input}
              placeholder="Start (e.g. Jun 2024)"
              value={row.startDate}
              onChange={(e) => updateRow(setExperience, i, "startDate", e.target.value)}
            />
            <input
              className={styles.input}
              placeholder="End (or Present)"
              value={row.endDate}
              onChange={(e) => updateRow(setExperience, i, "endDate", e.target.value)}
            />
            <textarea
              className={styles.textarea}
              placeholder="Description"
              value={row.description}
              onChange={(e) => updateRow(setExperience, i, "description", e.target.value)}
            />
            <button
              type="button"
              className={styles.removeBtn}
              onClick={() => removeRow(setExperience, i)}
            >
              Remove
            </button>
          </div>
        ))}
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Education</h2>
          <button
            type="button"
            className={styles.addBtn}
            onClick={() =>
              addRow(setEducation, {
                school: "",
                degree: "",
                field: "",
                startDate: "",
                endDate: "",
              })
            }
          >
            + Add
          </button>
        </div>
        {education.map((row, i) => (
          <div key={i} className={styles.row}>
            <input
              className={styles.input}
              placeholder="School"
              value={row.school}
              onChange={(e) => updateRow(setEducation, i, "school", e.target.value)}
            />
            <input
              className={styles.input}
              placeholder="Degree"
              value={row.degree}
              onChange={(e) => updateRow(setEducation, i, "degree", e.target.value)}
            />
            <input
              className={styles.input}
              placeholder="Field of study"
              value={row.field}
              onChange={(e) => updateRow(setEducation, i, "field", e.target.value)}
            />
            <input
              className={styles.input}
              placeholder="Start year"
              value={row.startDate}
              onChange={(e) => updateRow(setEducation, i, "startDate", e.target.value)}
            />
            <input
              className={styles.input}
              placeholder="End year (or Present)"
              value={row.endDate}
              onChange={(e) => updateRow(setEducation, i, "endDate", e.target.value)}
            />
            <button
              type="button"
              className={styles.removeBtn}
              onClick={() => removeRow(setEducation, i)}
            >
              Remove
            </button>
          </div>
        ))}
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Certifications</h2>
          <button
            type="button"
            className={styles.addBtn}
            onClick={() =>
              addRow(setCertifications, { name: "", issuer: "", date: "" })
            }
          >
            + Add
          </button>
        </div>
        {certifications.map((row, i) => (
          <div key={i} className={styles.row}>
            <input
              className={styles.input}
              placeholder="Certification name"
              value={row.name}
              onChange={(e) => updateRow(setCertifications, i, "name", e.target.value)}
            />
            <input
              className={styles.input}
              placeholder="Issuer"
              value={row.issuer}
              onChange={(e) => updateRow(setCertifications, i, "issuer", e.target.value)}
            />
            <input
              className={styles.input}
              placeholder="Date"
              value={row.date}
              onChange={(e) => updateRow(setCertifications, i, "date", e.target.value)}
            />
            <button
              type="button"
              className={styles.removeBtn}
              onClick={() => removeRow(setCertifications, i)}
            >
              Remove
            </button>
          </div>
        ))}
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Projects</h2>
          <button
            type="button"
            className={styles.addBtn}
            onClick={() =>
              addRow(setProjects, { name: "", description: "", link: "" })
            }
          >
            + Add
          </button>
        </div>
        {projects.map((row, i) => (
          <div key={i} className={styles.row}>
            <input
              className={styles.input}
              placeholder="Project name"
              value={row.name}
              onChange={(e) => updateRow(setProjects, i, "name", e.target.value)}
            />
            <textarea
              className={styles.textarea}
              placeholder="Description"
              value={row.description}
              onChange={(e) => updateRow(setProjects, i, "description", e.target.value)}
            />
            <input
              className={styles.input}
              placeholder="Link (GitHub, live demo, etc.)"
              value={row.link}
              onChange={(e) => updateRow(setProjects, i, "link", e.target.value)}
            />
            <button
              type="button"
              className={styles.removeBtn}
              onClick={() => removeRow(setProjects, i)}
            >
              Remove
            </button>
          </div>
        ))}
      </section>

      <button type="submit" className={styles.saveBtn} disabled={saving}>
        {saving ? "Saving…" : "Save Profile"}
      </button>
    </form>
  );
}