"use client";

import { useState, useEffect } from "react";
import SwipeCard from "@/components/SwipeCard/SwipeCard";
import Sidebar from "@/components/Sidebar/Sidebar";
import { saveJob, getCurrentUser } from "@/lib/supabase";
import styles from "./discover.module.css";

export default function DiscoverPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [index, setIndex] = useState(0);
  const [savedIds, setSavedIds] = useState([]);
  const [rejectedIds, setRejectedIds] = useState([]);
  const [history, setHistory] = useState([]); // stack of { jobId, direction }

  useEffect(() => {
    let cancelled = false;

    async function loadJobs() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/jobs");
        if (!res.ok) {
          throw new Error(`Request failed: ${res.status}`);
        }
        const { jobs: fetchedJobs } = await res.json();
        if (!cancelled) {
          setJobs(fetchedJobs);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Failed to load jobs");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadJobs();

    return () => {
      cancelled = true;
    };
  }, []);

  const stack = jobs.slice(index, index + 3); // top 3 for stack effect
  const currentJob = jobs[index];
  const isFinished = !loading && !error && index >= jobs.length;

  function handleSwipe(direction) {
    if (!currentJob) return;

    if (direction === "right") {
      setSavedIds((prev) => [...prev, currentJob.id]);
      persistSavedJob(currentJob);
    } else {
      setRejectedIds((prev) => [...prev, currentJob.id]);
    }
    setHistory((prev) => [...prev, { jobId: currentJob.id, direction }]);
    setIndex((prev) => prev + 1);
  }

  async function persistSavedJob(job) {
    try {
      const user = await getCurrentUser();
      if (!user) {
        console.warn("No logged-in user — skipping save to Supabase.");
        return;
      }
      await saveJob(user.id, {
        title: job.title,
        company: job.company,
        location: job.location,
        description: job.fullDescription || job.description,
        url: job.url,
      });
    } catch (err) {
      console.error("Failed to save job:", err);
    }
  }

  function handleUndo() {
    if (history.length === 0 || index === 0) return;

    const last = history[history.length - 1];

    if (last.direction === "right") {
      setSavedIds((prev) => prev.filter((id) => id !== last.jobId));
    } else {
      setRejectedIds((prev) => prev.filter((id) => id !== last.jobId));
    }

    setHistory((prev) => prev.slice(0, -1));
    setIndex((prev) => prev - 1);
  }

  const canUndo = history.length > 0 && index > 0;

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />

      <div className={styles.page} style={{ flex: 1 }}>
        <h1 className={styles.heading}>Discover</h1>

        <div className={styles.stackWrapper}>
          {loading ? (
            <div className={styles.emptyState}>
              <p>Loading jobs…</p>
            </div>
          ) : error ? (
            <div className={styles.emptyState}>
              <p>Couldn&apos;t load jobs.</p>
              <span>{error}</span>
            </div>
          ) : isFinished ? (
            <div className={styles.emptyState}>
              <p>You&apos;re all caught up.</p>
              <span>{savedIds.length} saved · {rejectedIds.length} skipped</span>
            </div>
          ) : (
            stack
              .map((job, i) => (
                <div
                  key={job.id}
                  className={styles.cardSlot}
                  style={{
                    transform: `translateY(${i * 10}px) scale(${1 - i * 0.04})`,
                    zIndex: stack.length - i,
                    transition: "transform 0.25s ease",
                  }}
                >
                  <SwipeCard
                    job={job}
                    isTop={i === 0}
                    onSwipe={i === 0 ? handleSwipe : () => {}}
                  />
                </div>
              ))
              .reverse()
          )}
        </div>

        <div className={styles.actions}>
          <button
            className={`${styles.actionBtn} ${styles.undoBtn}`}
            onClick={handleUndo}
            disabled={!canUndo}
            aria-label="Undo"
          >
            ↺
          </button>
          {!isFinished && !loading && !error && (
            <>
              <button
                className={`${styles.actionBtn} ${styles.rejectBtn}`}
                onClick={() => handleSwipe("left")}
                aria-label="Reject"
              >
                ✕
              </button>
              <button
                className={`${styles.actionBtn} ${styles.saveBtn}`}
                onClick={() => handleSwipe("right")}
                aria-label="Save"
              >
                ♥
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}