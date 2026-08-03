"use client";

import Sidebar from "@/components/Sidebar/Sidebar";
import styles from "./stats.module.css";

export default function StatsPage() {
  return (
    <div className={styles.layout}>
      <Sidebar />
      <main className={styles.main}>
        <h1 className={styles.heading}>Stats</h1>
        <p className={styles.comingSoon}>Coming soon.</p>
      </main>
    </div>
  );
}