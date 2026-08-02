"use client";

import styles from "./JobDetail.module.css";

/**
 * Presentational job detail view.
 * Props:
 *  - job: full job object from mockJobs (or real job data later)
 *  - onBack(): called when the back arrow is pressed
 */
export default function JobDetail({ job, onBack }) {
  if (!job) return null;

  const score = typeof job.matchScore === "number" ? job.matchScore : null;
  const ringDeg = score !== null ? (score / 100) * 360 : 0;

  function getMatchColor(value) {
    if (value >= 80) return "var(--color-success)";
    if (value >= 60) return "var(--color-warning)";
    return "var(--color-danger)";
  }
  const ringColor = score !== null ? getMatchColor(score) : "var(--color-primary)";

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <button className={styles.backBtn} onClick={onBack} aria-label="Back">
          ←
        </button>
      </div>

      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.title}>{job.title}</h1>
          <p className={styles.company}>{job.company}</p>
          <div className={styles.meta}>
            <span>{job.location}</span>
            <span className={styles.dot}>•</span>
            <span>{job.salary}</span>
          </div>
        </div>

        {score !== null && (
          <div
            className={styles.matchRing}
            style={{
              background: `conic-gradient(${ringColor} ${ringDeg}deg, var(--color-border) ${ringDeg}deg)`,
            }}
          >
            <div className={styles.matchRingInner}>
              <span className={styles.matchScore} style={{ color: ringColor }}>
                {score}%
              </span>
            </div>
          </div>
        )}
      </div>

      <p className={styles.description}>{job.description}</p>

      {job.matchReasoning && (
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>✨ AI Match Reasoning</h2>
          <p className={styles.cardBody}>{job.matchReasoning}</p>
          {job.matchedSkills?.length > 0 && (
            <div className={styles.chipRow}>
              {job.matchedSkills.map((skill) => (
                <span key={skill} className={styles.chip}>
                  ✓ {skill}
                </span>
              ))}
            </div>
          )}
        </section>
      )}

      {job.interviewTips?.length > 0 && (
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>💡 Interview Prep Tips</h2>
          <div className={styles.tipList}>
            {job.interviewTips.map((tip) => (
              <div key={tip.title} className={styles.tipItem}>
                <p className={styles.tipTitle}>{tip.title}</p>
                <p className={styles.tipDetail}>{tip.detail}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {job.about && (
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>🏢 About {job.company}</h2>
          <p className={styles.cardBody}>{job.about}</p>
        </section>
      )}

      <button className={styles.tailorBtn}>📄 Tailor my resume</button>
    </div>
  );
}