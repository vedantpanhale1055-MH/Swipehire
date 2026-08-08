"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./Dashboard.module.css";
import Sidebar from "@/components/Sidebar/Sidebar";
import { getCurrentUser, getUserJobs } from "@/lib/supabase";

const STATUS_META = [
  { key: "saved", label: "Saved", color: "#3D8FA6" },
  { key: "applied", label: "Applied", color: "#F4A259" },
  { key: "interview", label: "Interview", color: "#7C77B9" },
  { key: "offer", label: "Offer", color: "#5B8A72" },
];

function formatTimestamp(isoString) {
  if (!isoString) return "";
  const date = new Date(isoString);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export default function Dashboard() {
  const router = useRouter();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const user = await getCurrentUser();
        if (!user) {
          if (!cancelled) setError("Please log in to see your dashboard.");
          return;
        }
        if (!cancelled) {
          setUserName(user.email?.split("@")[0] || "");
        }
        const rows = await getUserJobs(user.id);
        if (!cancelled) setJobs(rows);
      } catch (err) {
        if (!cancelled) setError(err.message || "Failed to load dashboard");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const counts = STATUS_META.reduce((acc, s) => {
    acc[s.key] = jobs.filter((j) => j.status === s.key).length;
    return acc;
  }, {});

  const recent = [...jobs]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 6);

  return (
    <div className={styles.layout}>
      <Sidebar />

      <main className={styles.main}>
        <div className={styles.topBar}>
          <div>
            <h1 className={styles.heading}>Dashboard</h1>
            {userName && <p className={styles.subheading}>Welcome back, {userName}</p>}
          </div>
          <button className={styles.discoverBtn} onClick={() => router.push("/discover")}>
            + Find more jobs
          </button>
        </div>

        {loading ? (
          <p className={styles.stateText}>Loading…</p>
        ) : error ? (
          <p className={styles.stateText}>{error}</p>
        ) : (
          <>
            <div className={styles.statGrid}>
              {STATUS_META.map((s) => (
                <div key={s.key} className={styles.statCard}>
                  <div className={styles.statDot} style={{ background: s.color }} />
                  <div>
                    <p className={styles.statCount}>{counts[s.key]}</p>
                    <p className={styles.statLabel}>{s.label}</p>
                  </div>
                </div>
              ))}
            </div>

            <section className={styles.recentSection}>
              <h2 className={styles.sectionTitle}>Recent activity</h2>

              {recent.length === 0 ? (
                <p className={styles.stateText}>
                  No saved jobs yet — head to Discover to start swiping.
                </p>
              ) : (
                <div className={styles.recentList}>
                  {recent.map((job) => {
                    const meta = STATUS_META.find((s) => s.key === job.status) || STATUS_META[0];
                    return (
                      <div
                        key={job.id}
                        className={styles.recentRow}
                        onClick={() => router.push(`/jobs/${job.id}`)}
                        role="button"
                        tabIndex={0}
                      >
                        <div>
                          <p className={styles.recentTitle}>{job.title}</p>
                          <p className={styles.recentCompany}>{job.company}</p>
                        </div>
                        <div className={styles.recentRight}>
                          <span
                            className={styles.statusBadge}
                            style={{ background: meta.color }}
                          >
                            {meta.label}
                          </span>
                          <span className={styles.recentTimestamp}>
                            {formatTimestamp(job.created_at)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}