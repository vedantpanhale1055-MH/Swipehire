"use client";

import { useState, useEffect, useMemo } from "react";
import SwipeCard from "@/components/SwipeCard/SwipeCard";
import Sidebar from "@/components/Sidebar/Sidebar";
import FiltersPanel from "@/components/FiltersPanel/FiltersPanel";
import { saveJob, getCurrentUser, getProfile } from "@/lib/supabase";
import { buildResumeText } from "@/lib/resumeText";
import styles from "./discover.module.css";

const EMPTY_FILTERS = { jobType: "", city: "", workMode: "", paidStatus: "" };

export default function DiscoverPage() {
  const [allJobs, setAllJobs] = useState([]); // fetched (+ scored) from the server
  const [loading, setLoading] = useState(true);
  const [scoring, setScoring] = useState(false);
  const [error, setError] = useState(null);
  const [noProfile, setNoProfile] = useState(false);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [index, setIndex] = useState(0);
  const [savedIds, setSavedIds] = useState([]);
  const [rejectedIds, setRejectedIds] = useState([]);
  const [history, setHistory] = useState([]); // stack of { jobId, direction }

  // Job type + city are real Adzuna query params, so changing either refetches.
  useEffect(() => {
    let cancelled = false;

    async function loadJobs() {
      try {
        setLoading(true);
        setError(null);
        setNoProfile(false);
        setIndex(0);
        setHistory([]);

        // Randomizing the page only makes sense for a broad, unfiltered
        // browse. A narrow filtered search (e.g. "internship" in Pune) may
        // only have 1-2 pages of real results — picking a random page up to
        // 5 can land past the end and come back nearly empty.
        const hasServerFilters = Boolean(filters.jobType || filters.city);
        const page = hasServerFilters ? 1 : Math.floor(Math.random() * 5) + 1;
        const params = new URLSearchParams({ page: String(page) });
        if (filters.jobType) params.set("employmentType", filters.jobType);
        if (filters.city) params.set("where", filters.city);

        const res = await fetch(`/api/jobs?${params.toString()}`);
        if (!res.ok) {
          throw new Error(`Request failed: ${res.status}`);
        }
        const { jobs: fetchedJobs } = await res.json();
        if (cancelled) return;

        setAllJobs(fetchedJobs);
        setLoading(false);

        // Score jobs against the user's resume, if they have one.
        const user = await getCurrentUser();
        if (!user) {
          setNoProfile(true);
          return;
        }

        const profile = await getProfile(user.id);
        if (!profile) {
          setNoProfile(true);
          return;
        }

        const resumeText = buildResumeText(profile);
        setScoring(true);

        const scoreRes = await fetch("/api/score-jobs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resumeText, jobs: fetchedJobs }),
        });

        if (!scoreRes.ok) {
          console.error("Scoring failed:", await scoreRes.text());
          return;
        }

        const { jobs: scoredJobs } = await scoreRes.json();
        if (!cancelled) {
          setAllJobs(scoredJobs);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Failed to load jobs");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          setScoring(false);
        }
      }
    }

    loadJobs();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.jobType, filters.city]);

  // Work mode + paid status aren't real Adzuna params (Adzuna doesn't expose
  // them) — they're detected client-side per job, so filter locally instead
  // of refetching.
  const jobs = useMemo(() => {
    return allJobs.filter((job) => {
      if (filters.workMode && job.workMode !== filters.workMode) return false;
      if (
        filters.jobType === "internship" &&
        filters.paidStatus &&
        job.paidStatus !== filters.paidStatus
      ) {
        return false;
      }
      return true;
    });
  }, [allJobs, filters.workMode, filters.paidStatus, filters.jobType]);

  // Reset position in the deck whenever the client-side filtered list changes.
  useEffect(() => {
    setIndex(0);
    setHistory([]);
  }, [filters.workMode, filters.paidStatus]);

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

        <FiltersPanel filters={filters} onChange={setFilters} />

        {scoring && (
          <p style={{ fontSize: 13, color: "var(--color-text-secondary, #666)", margin: "-8px 0 12px" }}>
            Scoring matches against your resume…
          </p>
        )}
        {noProfile && !loading && (
          <p style={{ fontSize: 13, color: "var(--color-text-secondary, #666)", margin: "-8px 0 12px" }}>
            Add your resume in Resume Builder to see AI match scores.
          </p>
        )}

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