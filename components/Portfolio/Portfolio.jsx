// components/Portfolio/Portfolio.jsx
// NEW FILE — create this component.

import Link from 'next/link';
import styles from './Portfolio.module.css';

export default function Portfolio({ profile }) {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.logo}>
          SwipeHire
        </Link>
        <Link href="/signup" className={styles.headerCta}>
          Build your own
        </Link>
      </header>

      <main className={styles.main}>
        <section className={styles.hero}>
          <h1 className={styles.name}>{profile.full_name}</h1>
          {profile.location && <p className={styles.location}>{profile.location}</p>}
          {profile.summary && <p className={styles.summary}>{profile.summary}</p>}

          {(profile.github_url || profile.linkedin_url) && (
            <div className={styles.links}>
              {profile.github_url && (
                <a href={profile.github_url} target="_blank" rel="noreferrer" className={styles.link}>
                  GitHub
                </a>
              )}
              {profile.linkedin_url && (
                <a href={profile.linkedin_url} target="_blank" rel="noreferrer" className={styles.link}>
                  LinkedIn
                </a>
              )}
            </div>
          )}
        </section>

        {profile.skills?.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Skills</h2>
            <div className={styles.pillRow}>
              {profile.skills.map((skill) => (
                <span key={skill} className={styles.pill}>
                  {skill}
                </span>
              ))}
            </div>
          </section>
        )}

        {profile.experience?.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Experience</h2>
            {profile.experience.map((exp, i) => (
              <div key={i} className={styles.entry}>
                <div className={styles.entryHead}>
                  <span className={styles.entryTitle}>{exp.title}</span>
                  {exp.duration && <span className={styles.entryMeta}>{exp.duration}</span>}
                </div>
                {exp.company && <p className={styles.entryMeta}>{exp.company}</p>}
                {exp.description && <p className={styles.entryBody}>{exp.description}</p>}
              </div>
            ))}
          </section>
        )}

        {profile.projects?.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Projects</h2>
            {profile.projects.map((proj, i) => (
              <div key={i} className={styles.entry}>
                <div className={styles.entryHead}>
                  <span className={styles.entryTitle}>{proj.name}</span>
                </div>
                {proj.technologies && <p className={styles.entryMeta}>{proj.technologies}</p>}
                {proj.description && <p className={styles.entryBody}>{proj.description}</p>}
              </div>
            ))}
          </section>
        )}

        {profile.education?.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Education</h2>
            {profile.education.map((ed, i) => (
              <div key={i} className={styles.entry}>
                <div className={styles.entryHead}>
                  <span className={styles.entryTitle}>{ed.degree}</span>
                  {ed.year && <span className={styles.entryMeta}>{ed.year}</span>}
                </div>
                {ed.institution && <p className={styles.entryMeta}>{ed.institution}</p>}
              </div>
            ))}
          </section>
        )}

        {profile.certifications?.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Certifications</h2>
            <ul className={styles.list}>
              {profile.certifications.map((c, i) => (
                <li key={i}>{typeof c === 'string' ? c : c.name}</li>
              ))}
            </ul>
          </section>
        )}

        {profile.languages?.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Languages</h2>
            <div className={styles.pillRow}>
              {profile.languages.map((lang) => (
                <span key={lang} className={styles.pill}>
                  {lang}
                </span>
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className={styles.footer}>
        <p>
          Built with{' '}
          <Link href="/" className={styles.footerLink}>
            SwipeHire
          </Link>
        </p>
      </footer>
    </div>
  );
}