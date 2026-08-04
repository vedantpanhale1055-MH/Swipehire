import Sidebar from '@/components/Sidebar/Sidebar';
import styles from './calendar.module.css';

export default function CalendarPage() {
  return (
    <div className={styles.container}>
      <Sidebar />
      <main className={styles.main}>
        <h1 className={styles.title}>Calendar</h1>
        <p className={styles.subtitle}>Track interviews and deadlines.</p>
        <div className={styles.placeholder}>
          <p>Calendar view coming soon</p>
        </div>
      </main>
    </div>
  );
}