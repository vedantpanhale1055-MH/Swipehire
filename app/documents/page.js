import Sidebar from '@/components/Sidebar';
import styles from './page.module.css';

export default function DocumentsPage() {
  return (
    <div className={styles.container}>
      <Sidebar />
      <main className={styles.main}>
        <h1 className={styles.title}>Documents</h1>
        <p className={styles.subtitle}>Manage your resumes and cover letters.</p>
        <div className={styles.placeholder}>
          <p>Documents manager coming soon</p>
        </div>
      </main>
    </div>
  );
}