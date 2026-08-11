// components/Landing/Landing.jsx
// NEW FILE — create this component.

import Link from 'next/link';
import styles from './Landing.module.css';

const STEPS = [
  {
    n: '01',
    title: 'Discover',
    body: 'Real listings pulled in automatically and scored against your profile.',
  },
  {
    n: '02',
    title: 'Swipe',
    body: 'Right to save, left to pass. No forms, no dead-end job boards.',
  },
  {
    n: '03',
    title: 'Track',
    body: 'Every save lands on a Kanban board — Saved, Applied, Interview, Offer.',
  },
];

const FEATURES = [
  { title: 'AI match score', body: 'Every listing is scored against your profile before you swipe.' },
  { title: 'Resume tailoring', body: 'Rewrite your resume for a specific role in one click.' },
  { title: 'Application tracker', body: 'A Kanban board that follows each job from saved to offer.' },
  { title: 'Portfolio-ready CV', body: 'Build and export a resume straight from your profile.' },
];

export default function Landing() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <span className={styles.logo}>SwipeHire</span>
        <nav className={styles.nav}>
          <Link href="/login" className={styles.navLink}>
            Log in
          </Link>
          <Link href="/signup" className={styles.navCta}>
            Sign up
          </Link>
        </nav>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>AI job search, swipe by swipe</p>
          <h1 className={styles.headline}>Find the role built for you.</h1>
          <p className={styles.subhead}>
            SwipeHire scores every listing against your profile, tracks what you save, and
            tailors your resume for each one — so you spend time applying, not searching.
          </p>
          <div className={styles.heroActions}>
            <Link href="/signup" className={styles.primaryCta}>
              Get started — it's free
            </Link>
            <Link href="/login" className={styles.secondaryCta}>
              Log in
            </Link>
          </div>
        </div>

        <div className={styles.heroVisual} aria-hidden="true">
          <div className={styles.heroCard}>
            <div className={styles.heroCardTop}>
              <div>
                <p className={styles.heroCardRole}>Frontend Engineer</p>
                <p className={styles.heroCardCompany}>Razorpay · Bengaluru</p>
              </div>
              <div className={styles.heroRing}>92%</div>
            </div>
            <p className={styles.heroCardTag}>React · Remote-friendly</p>
          </div>
          <span className={`${styles.swipeIcon} ${styles.swipeIconPass}`}>✕</span>
          <span className={`${styles.swipeIcon} ${styles.swipeIconSave}`}>♥</span>
        </div>
      </section>

      <section className={styles.steps}>
        {STEPS.map((step) => (
          <div key={step.n} className={styles.step}>
            <span className={styles.stepNumber}>{step.n}</span>
            <h3 className={styles.stepTitle}>{step.title}</h3>
            <p className={styles.stepBody}>{step.body}</p>
          </div>
        ))}
      </section>

      <section className={styles.features}>
        {FEATURES.map((f) => (
          <div key={f.title} className={styles.featureCard}>
            <h3 className={styles.featureTitle}>{f.title}</h3>
            <p className={styles.featureBody}>{f.body}</p>
          </div>
        ))}
      </section>

      <section className={styles.footerCta}>
        <h2 className={styles.footerHeadline}>Ready to swipe into your next role?</h2>
        <Link href="/signup" className={styles.primaryCta}>
          Get started
        </Link>
      </section>
    </div>
  );
}