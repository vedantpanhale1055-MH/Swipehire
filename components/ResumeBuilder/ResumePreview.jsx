"use client";

import styles from "./ResumeBuilder.module.css";

/**
 * Props:
 *  - profile: object shaped like what ResumeForm's onSave produces
 *      { full_name, github_url, linkedin_url, skills[], experience[],
 *        education[], certifications[], projects[] }
 *    Can be null/undefined before the user has saved anything.
 */
export default function ResumePreview({ profile }) {
  if (!profile) {
    return (
      <div className={styles.preview}>
        <p className={styles.previewEmpty}>
          Fill out the form and click Save to see your resume preview here.
        </p>
      </div>
    );
  }

  const {
    full_name,
    github_url,
    linkedin_url,
    skills = [],
    experience = [],
    education = [],
    certifications = [],
    projects = [],
  } = profile;

  const hasAnyContent =
    full_name ||
    github_url ||
    linkedin_url ||
    skills.length ||
    experience.length ||
    education.length ||
    certifications.length ||
    projects.length;

  if (!hasAnyContent) {
    return (
      <div className={styles.preview}>
        <p className={styles.previewEmpty}>
          Fill out the form and click Save to see your resume preview here.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.preview}>
      <div>
        <div className={styles.previewName}>{full_name || "Your Name"}</div>
        <div className={styles.previewLinks}>
          {github_url && (
            <a href={github_url} target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
          )}
          {linkedin_url && (
            <a href={linkedin_url} target="_blank" rel="noopener noreferrer">
              LinkedIn
            </a>
          )}
        </div>
      </div>

      {skills.length > 0 && (
        <div className={styles.previewSection}>
          <div className={styles.previewSectionTitle}>Skills</div>
          <div className={styles.chipRow}>
            {skills.map((skill, i) => (
              <span key={i} className={styles.chip}>
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {experience.length > 0 && (
        <div className={styles.previewSection}>
          <div className={styles.previewSectionTitle}>Experience</div>
          {experience.map((row, i) => (
            <div key={i} className={styles.previewItem}>
              <div className={styles.previewItemTitle}>
                {row.role || "Role"}
                {row.company ? ` · ${row.company}` : ""}
              </div>
              <div className={styles.previewItemMeta}>
                {row.startDate}
                {row.startDate || row.endDate ? " – " : ""}
                {row.endDate}
              </div>
              {row.description && (
                <div className={styles.previewItemBody}>{row.description}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {education.length > 0 && (
        <div className={styles.previewSection}>
          <div className={styles.previewSectionTitle}>Education</div>
          {education.map((row, i) => (
            <div key={i} className={styles.previewItem}>
              <div className={styles.previewItemTitle}>
                {row.degree || "Degree"}
                {row.field ? `, ${row.field}` : ""}
                {row.school ? ` · ${row.school}` : ""}
              </div>
              <div className={styles.previewItemMeta}>
                {row.startDate}
                {row.startDate || row.endDate ? " – " : ""}
                {row.endDate}
              </div>
            </div>
          ))}
        </div>
      )}

      {certifications.length > 0 && (
        <div className={styles.previewSection}>
          <div className={styles.previewSectionTitle}>Certifications</div>
          {certifications.map((row, i) => (
            <div key={i} className={styles.previewItem}>
              <div className={styles.previewItemTitle}>
                {row.name}
                {row.issuer ? ` · ${row.issuer}` : ""}
              </div>
              <div className={styles.previewItemMeta}>{row.date}</div>
            </div>
          ))}
        </div>
      )}

      {projects.length > 0 && (
        <div className={styles.previewSection}>
          <div className={styles.previewSectionTitle}>Projects</div>
          {projects.map((row, i) => (
            <div key={i} className={styles.previewItem}>
              <div className={styles.previewItemTitle}>{row.name}</div>
              {row.link && (
                <a href={row.link} target="_blank" rel="noopener noreferrer">
                  View
                </a>
              )}
              {row.description && (
                <div className={styles.previewItemBody}>{row.description}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}