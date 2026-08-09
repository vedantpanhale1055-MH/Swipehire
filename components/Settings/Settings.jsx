"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./Settings.module.css";
import Sidebar from "@/components/Sidebar/Sidebar";
import { getCurrentUser, signOut } from "@/lib/supabase";

export default function Settings() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const user = await getCurrentUser();
        if (!cancelled) {
          if (!user) {
            router.replace("/login");
          } else {
            setEmail(user.email || "");
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function handleSignOut() {
    setSigningOut(true);
    setError(null);
    try {
      await signOut();
      router.push("/login");
    } catch (err) {
      setError(err.message || "Failed to sign out");
      setSigningOut(false);
    }
  }

  return (
    <div className={styles.layout}>
      <Sidebar />

      <main className={styles.main}>
        <h1 className={styles.heading}>Settings</h1>

        {loading ? (
          <p className={styles.stateText}>Loading…</p>
        ) : (
          <>
            <section className={styles.card}>
              <h2 className={styles.cardTitle}>Account</h2>
              <div className={styles.row}>
                <span className={styles.rowLabel}>Email</span>
                <span className={styles.rowValue}>{email}</span>
              </div>
            </section>

            <section className={styles.card}>
              <h2 className={styles.cardTitle}>Profile</h2>
              <p className={styles.cardBody}>
                Manage your resume details, skills, and experience used for job
                matching and AI resume tailoring.
              </p>
              <button
                className={styles.secondaryBtn}
                onClick={() => router.push("/resume-builder")}
              >
                Edit Resume Profile
              </button>
            </section>

            <section className={styles.card}>
              <h2 className={styles.cardTitle}>Session</h2>
              {error && <p className={styles.error}>{error}</p>}
              <button
                className={styles.dangerBtn}
                onClick={handleSignOut}
                disabled={signingOut}
              >
                {signingOut ? "Signing out…" : "Sign out"}
              </button>
            </section>
          </>
        )}
      </main>
    </div>
  );
}