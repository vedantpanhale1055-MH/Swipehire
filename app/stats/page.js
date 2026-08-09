"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar/Sidebar";
import { getCurrentUser, getUserJobs } from "@/lib/supabase";
import styles from "./stats.module.css";

const STATUS_ORDER = [
  { key: "saved", label: "Saved" },
  { key: "applied", label: "Applied" },
  { key: "interview", label: "Interview" },
  { key: "offer", label: "Offer" },
];

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

export default function StatsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const user = await getCurrentUser();
      if (!user) {
        router.push("/login");
        return;
      }
      try {
        const rows = await getUserJobs(user.id);
        setJobs(rows || []);
      } catch (err) {
        console.error("Failed to load stats:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  const counts = useMemo(() => {
    const c = { saved: 0, applied: 0, interview: 0, offer: 0 };
    for (const job of jobs) {
      if (c[job.status] !== undefined) c[job.status] += 1;
    }
    return c;
  }, [jobs]);

  const total = jobs.length;
  const maxCount = Math.max(1, ...STATUS_ORDER.map((s) => counts[s.key]));

  const responseRate = useMemo(() => {
    if (counts.applied + counts.interview + counts.offer === 0) return 0;
    const applied = counts.applied + counts.interview + counts.offer;
    const responded = counts.interview + counts.offer;
    return Math.round((responded / applied) * 100);
  }, [counts]);

  const offerRate = useMemo(() => {
    const applied = counts.applied + counts.interview + counts.offer;
    if (applied === 0) return 0;
    return Math.round((counts.offer / applied) * 100);
  }, [counts]);

  const savedLast7 = useMemo(
    () => jobs.filter((j) => new Date(j.created_at) >= daysAgo(7)).length,
    [jobs]
  );

  const companyCounts = useMemo(() => {
    const map = {};
    for (const job of jobs) {
      if (!job.company) continue;
      map[job.company] = (map[job.company] || 0) + 1;
    }
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [jobs]);

  return (
    <div className={styles.layout}>
      <Sidebar />
      <main className={styles.main}>
        <h1 className={styles.heading}>Stats</h1>
        <p className={styles.subheading}>How your job search is going.</p>

        {loading ? (
          <p className={styles.comingSoon}>Loading stats...</p>
        ) : total === 0 ? (
          <p className={styles.comingSoon}>
            No jobs saved yet — swipe right on Discover to start tracking.
          </p>
        ) : (
          <>
            <div className={styles.statGrid}>
              <div className={styles.statCard}>
                <span className={styles.statValue}>{total}</span>
                <span className={styles.statLabel}>Total jobs tracked</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statValue}>{savedLast7}</span>
                <span className={styles.statLabel}>Saved in last 7 days</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statValue}>{responseRate}%</span>
                <span className={styles.statLabel}>Response rate</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statValue}>{offerRate}%</span>
                <span className={styles.statLabel}>Offer rate (of applied)</span>
              </div>
            </div>

            <h2 className={styles.sectionHeading}>Application Funnel</h2>
            <div className={styles.funnelCard}>
              {STATUS_ORDER.map((s) => (
                <div key={s.key} className={styles.funnelRow}>
                  <span className={styles.funnelLabel}>{s.label}</span>
                  <div className={styles.funnelBarTrack}>
                    <div
                      className={`${styles.funnelBarFill} ${styles["fill_" + s.key]}`}
                      style={{ width: `${(counts[s.key] / maxCount) * 100}%` }}
                    />
                  </div>
                  <span className={styles.funnelCount}>{counts[s.key]}</span>
                </div>
              ))}
            </div>

            {companyCounts.length > 0 && (
              <>
                <h2 className={styles.sectionHeading}>Top Companies</h2>
                <div className={styles.funnelCard}>
                  {companyCounts.map(([company, count]) => (
                    <div key={company} className={styles.funnelRow}>
                      <span className={styles.funnelLabel}>{company}</span>
                      <div className={styles.funnelBarTrack}>
                        <div
                          className={`${styles.funnelBarFill} ${styles.fill_company}`}
                          style={{ width: `${(count / companyCounts[0][1]) * 100}%` }}
                        />
                      </div>
                      <span className={styles.funnelCount}>{count}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}