"use client";

import styles from "./ResumeBuilder.module.css";

function toBullets(text) {
  if (!text) return [];
  return text
    .split(/\n+|(?<=\.)\s+(?=[A-Z])/)
    .map((s) => s.trim())
    .filter(Boolean);
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
      <header className={styles.previewHeader}>
        <div className={styles.previewName}>{full_name || "Your Name"}</div>
        {(github_url || linkedin_url) && (
          <div className={styles.previewContactLine}>
            {github_url && (
              <a href={github_url} target="_blank" rel="noopener noreferrer">
                {github_url.replace(/^https?:\/\//, "")}
              </a>
            )}
            {github_url && linkedin_url && <span> · </span>}
            {linkedin_url && (
              <a href={linkedin_url} target="_blank" rel="noopener noreferrer">
                {linkedin_url.replace(/^https?:\/\//, "")}
              </a>
            )}
          </div>
        )}
      </header>

      <div className={styles.previewBody}>
        <div className={styles.previewCol}>
          {experience.length > 0 && (
            <section className={styles.previewBlock}>
              <h2 className={styles.previewBlockTitle}>Work History</h2>
              {experience.map((row, i) => (
                <div key={i} className={styles.previewEntry}>
                  <div className={styles.previewEntryTitle}>
                    {row.company}
                    {row.role ? ` – ${row.role}` : ""}
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
                          {row.link.replace(/^https?:\/\//, "")}
                        </a>
                      </>
                    )}
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
        </div>

        <div className={styles.previewColNarrow}>
          {skills.length > 0 && (
            <section className={styles.previewBlock}>
              <h2 className={styles.previewBlockTitle}>Skills</h2>
              <ul className={styles.previewSideList}>
                {skills.map((skill, i) => (
                  <li key={i}>{skill}</li>
                ))}
              </ul>
            </section>
          )}

          {certifications.length > 0 && (
            <section className={styles.previewBlock}>
              <h2 className={styles.previewBlockTitle}>Certifications</h2>
              <ul className={styles.previewSideList}>
                {certifications.map((row, i) => (
                  <li key={i}>
                    {row.name}
                    {row.issuer ? ` – ${row.issuer}` : ""}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {education.length > 0 && (
            <section className={styles.previewBlock}>
              <h2 className={styles.previewBlockTitle}>Education</h2>
              {education.map((row, i) => (
                <div key={i} className={styles.previewEntry}>
                  <div className={styles.previewEntryTitle}>{row.school}</div>
                  <div className={styles.previewEntryDates}>
                    {row.startDate}
                    {row.startDate || row.endDate ? " – " : ""}
                    {row.endDate}
                  </div>
                  <div className={styles.previewEntrySub}>
                    {row.degree}
                    {row.field ? `, ${row.field}` : ""}
                  </div>
                </div>
              ))}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}