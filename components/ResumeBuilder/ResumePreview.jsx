"use client";

import styles from "./ResumeBuilder.module.css";

function toBullets(text) {
  if (!text) return [];
  return text
    .split(/\n+|(?<=\.)\s+(?=[A-Z])/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function cleanUrl(url) {
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

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
    location,
    phone,
    email,
    github_url,
    linkedin_url,
    summary,
    skills = [],
    languages = [],
    experience = [],
    education = [],
    certifications = [],
    projects = [],
  } = profile;

  const hasAnyContent =
    full_name ||
    location ||
    phone ||
    email ||
    github_url ||
    linkedin_url ||
    summary ||
    skills.length ||
    languages.length ||
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

  const contactParts = [
    location,
    phone && `Phone: ${phone}`,
    email && `Email: ${email}`,
    github_url && `GitHub: ${cleanUrl(github_url)}`,
    linkedin_url && `LinkedIn: ${cleanUrl(linkedin_url)}`,
  ].filter(Boolean);

  return (
    <div className={styles.preview}>
      <header className={styles.previewHeader}>
        <div className={styles.previewName}>{full_name || "Your Name"}</div>
        {contactParts.length > 0 && (
          <div className={styles.previewContactLine}>
            {contactParts.join("  |  ")}
          </div>
        )}
      </header>

      {summary && (
        <section className={styles.previewBlock}>
          <h2 className={styles.previewBlockTitle}>Career Objective</h2>
          <p className={styles.previewParagraph}>{summary}</p>
        </section>
      )}

      {education.length > 0 && (
        <section className={styles.previewBlock}>
          <h2 className={styles.previewBlockTitle}>Education</h2>
          {education.map((row, i) => (
            <div key={i} className={styles.previewEntry}>
              <div className={styles.previewEntryTitle}>
                {row.degree}
                {row.field ? ` – ${row.field}` : ""}
              </div>
              <div className={styles.previewEntrySub}>{row.school}</div>
              <div className={styles.previewEntryDates}>
                {row.startDate}
                {row.startDate || row.endDate ? " – " : ""}
                {row.endDate}
              </div>
            </div>
          ))}
        </section>
      )}

      {skills.length > 0 && (
        <section className={styles.previewBlock}>
          <h2 className={styles.previewBlockTitle}>Technical Skills</h2>
          <ul className={styles.previewSkillsGrid}>
            {skills.map((skill, i) => (
              <li key={i}>{skill}</li>
            ))}
          </ul>
        </section>
      )}

      {experience.length > 0 && (
        <section className={styles.previewBlock}>
          <h2 className={styles.previewBlockTitle}>Experience</h2>
          {experience.map((row, i) => (
            <div key={i} className={styles.previewEntry}>
              <div className={styles.previewEntryTitle}>
                {row.role || "Role"}
                {row.company ? ` · ${row.company}` : ""}
              </div>
              <div className={styles.previewEntryDates}>
                {row.startDate}
                {row.startDate || row.endDate ? " – " : ""}
                {row.endDate}
              </div>
              {row.description && (
                <ul className={styles.previewBullets}>
                  {toBullets(row.description).map((line, j) => (
                    <li key={j}>{line}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </section>
      )}

      {projects.length > 0 && (
        <section className={styles.previewBlock}>
          <h2 className={styles.previewBlockTitle}>Projects</h2>
          {projects.map((row, i) => (
            <div key={i} className={styles.previewEntry}>
              <div className={styles.previewEntryTitle}>
                {row.name}
                {row.link && (
                  <>
                    {" "}
                    –{" "}
                    <a href={row.link} target="_blank" rel="noopener noreferrer">
                      {cleanUrl(row.link)}
                    </a>
                  </>
                )}
              </div>
              {row.technologies && (
                <div className={styles.previewEntrySub}>
                  Technologies: {row.technologies}
                </div>
              )}
              {row.description && (
                <ul className={styles.previewBullets}>
                  {toBullets(row.description).map((line, j) => (
                    <li key={j}>{line}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </section>
      )}

      {certifications.length > 0 && (
        <section className={styles.previewBlock}>
          <h2 className={styles.previewBlockTitle}>Certifications</h2>
          <ul className={styles.previewBullets}>
            {certifications.map((row, i) => (
              <li key={i}>
                {row.name}
                {row.issuer ? ` – ${row.issuer}` : ""}
              </li>
            ))}
          </ul>
        </section>
      )}

      {languages.length > 0 && (
        <section className={styles.previewBlock}>
          <h2 className={styles.previewBlockTitle}>Languages</h2>
          <ul className={styles.previewSkillsGrid}>
            {languages.map((lang, i) => (
              <li key={i}>{lang}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}