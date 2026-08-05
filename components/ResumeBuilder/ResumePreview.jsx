"use client";

import styles from "./ResumePreview.module.css";

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
      <div className={styles.empty}>
        Fill out the form and click Save to see your resume preview here.
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
      <div className={styles.empty}>
        Fill out the form and click Save to see your resume preview here.
      </div>
    );
  }

  return (
    <div className={styles.resume}>
      <header className={styles.header}>
        <h1 className={styles.name}>{full_name || "Your Name"}</h1>
        <div className={styles.links}>
          {github_url && (
            <a
              href={github_url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              GitHub
            </a>
          )}
          {linkedin_url && (
            <a
              href={linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              LinkedIn
            </a>
          )}
        </div>
      </header>

      {skills.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Skills</h2>
          <div className={styles.skills}>
            {skills.map((skill, i) => (
              <span key={i} className={styles.skillChip}>
                {skill}
              </span>
            ))}
          </div>
        </section>
      )}

      {experience.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Experience</h2>
          {experience.map((row, i) => (
            <div key={i} className={styles.entry}>
              <div className={styles.entryHeader}>
                <span className={styles.entryTitle}>
                  {row.role || "Role"}
                  {row.company ? ` · ${row.company}` : ""}
                </span>
                <span className={styles.entryDates}>
                  {row.startDate}
                  {row.startDate || row.endDate ? " – " : ""}
                  {row.endDate}
                </span>
              </div>
              {row.description && (
                <p className={styles.entryDescription}>{row.description}</p>
              )}
            </div>
          ))}
        </section>
      )}

      {education.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Education</h2>
          {education.map((row, i) => (
            <div key={i} className={styles.entry}>
              <div className={styles.entryHeader}>
                <span className={styles.entryTitle}>
                  {row.degree || "Degree"}
                  {row.field ? `, ${row.field}` : ""}
                  {row.school ? ` · ${row.school}` : ""}
                </span>
                <span className={styles.entryDates}>
                  {row.startDate}
                  {row.startDate || row.endDate ? " – " : ""}
                  {row.endDate}
                </span>
              </div>
            </div>
          ))}
        </section>
      )}

      {certifications.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Certifications</h2>
          {certifications.map((row, i) => (
            <div key={i} className={styles.entry}>
              <div className={styles.entryHeader}>
                <span className={styles.entryTitle}>
                  {row.name}
                  {row.issuer ? ` · ${row.issuer}` : ""}
                </span>
                <span className={styles.entryDates}>{row.date}</span>
              </div>
            </div>
          ))}
        </section>
      )}

      {projects.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Projects</h2>
          {projects.map((row, i) => (
            <div key={i} className={styles.entry}>
              <div className={styles.entryHeader}>
                <span className={styles.entryTitle}>{row.name}</span>
                {row.link && (
                  <a
                    href={row.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.link}
                  >
                    View
                  </a>
                )}
              </div>
              {row.description && (
                <p className={styles.entryDescription}>{row.description}</p>
              )}
            </div>
          ))}
        </section>
      )}
    </div>
  );
}