// components/Auth/AuthLayout.jsx
// NEW FILE — create this component.

import Link from 'next/link';
import styles from './AuthLayout.module.css';

const MOCK_CARDS = [
  { title: 'Frontend Engineer', company: 'Razorpay', location: 'Bengaluru', match: 92, status: 'saved' },
  { title: 'Product Designer', company: 'Cred', location: 'Remote', match: 78, status: null },
  { title: 'Backend Developer', company: 'Zerodha', location: 'Bengaluru', match: 65, status: 'passed' },
];

function matchTone(match) {
  if (match >= 80) return 'good';
  if (match >= 60) return 'ok';
  return 'low';
}

export default function AuthLayout({ eyebrow, title, subtitle, children }) {
  return (
    <div className={styles.shell}>
      <div className={styles.formPanel}>
        <div className={styles.formPanelInner}>
          <Link href="/" className={styles.logo}>
            SwipeHire
          </Link>

          <div className={styles.heading}>
            <h1 className={styles.title}>{title}</h1>
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </div>

          {children}
        </div>
      </div>

      <div className={styles.showcasePanel} aria-hidden="true">
        <div className={styles.showcaseContent}>
          <p className={styles.showcaseEyebrow}>{eyebrow}</p>
          <h2 className={styles.showcaseHeadline}>
            Swipe right on <br /> your next role.
          </h2>

          <div className={styles.cardStack}>
            {MOCK_CARDS.map((job, i) => (
              <div
                key={job.company}
                className={`${styles.mockCard} ${
                  job.status === 'saved' ? styles.mockCardSaved : ''
                } ${job.status === 'passed' ? styles.mockCardPassed : ''}`}
                style={{ '--i': i }}
              >
                <div className={styles.mockCardTop}>
                  <div>
                    <p className={styles.mockCardRole}>{job.title}</p>
                    <p className={styles.mockCardCompany}>
                      {job.company} · {job.location}
                    </p>
                  </div>
                  <div className={`${styles.mockRing} ${styles['mockRing--' + matchTone(job.match)]}`}>
                    {job.match}%
                  </div>
                </div>
                {job.status === 'saved' && <span className={styles.mockStamp}>Saved</span>}
                {job.status === 'passed' && <span className={styles.mockStampPass}>Passed</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}