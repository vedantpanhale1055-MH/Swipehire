import Sidebar from '@/components/Sidebar';
import styles from './page.module.css';

export default function JobsPage() {
  return (
    <div className={styles.container}>
      <Sidebar />
      <main className={styles.main}>
        <h1 className={styles.title}>Jobs</h1>
        <p className={styles.subtitle}>Browse and manage job listings here.</p>
        <div className={styles.placeholder}>
          <p>Jobs list coming soon</p>
        </div>
      </main>
    </div>
  );
}