"use client";

import Sidebar from "@/components/Sidebar/Sidebar";
import styles from "./settings.module.css";

export default function SettingsPage() {
  return (
    <div className={styles.layout}>
      <Sidebar />
      <main className={styles.main}>
        <h1 className={styles.heading}>Settings</h1>
        <p className={styles.comingSoon}>Coming soon.</p>
      </main>
    </div>
  );
}