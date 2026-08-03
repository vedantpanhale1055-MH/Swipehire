"use client";

import Sidebar from "@/components/Sidebar/Sidebar";
import styles from "./dashboard.module.css";

export default function DashboardPage() {
  return (
    <div className={styles.layout}>
      <Sidebar />
      <main className={styles.main}>
        <h1 className={styles.heading}>Dashboard</h1>
        <p className={styles.comingSoon}>Coming soon.</p>
      </main>
    </div>
  );
}