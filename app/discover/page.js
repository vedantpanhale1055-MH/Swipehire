"use client";

import { useState, useEffect } from "react";
import SwipeCard from "@/components/SwipeCard/SwipeCard";
import Sidebar from "@/components/Sidebar/Sidebar";
import FiltersPanel from "@/components/FiltersPanel/FiltersPanel";
import { saveJob, getCurrentUser, getProfile } from "@/lib/supabase";
import { buildResumeText } from "@/lib/resumeText";
import styles from "./discover.module.css";

const EMPTY_FILTERS = { jobType: "", city: "", workMode: "", paidStatus: "" };

// Only show jobs that clear this match score against the user's resume.
const MIN_MATCH_SCORE = 70;
// Try to gather at least this many qualifying matches before stopping.
const TARGET_GOOD_MATCHES = 5;
// Cap how many Adzuna pages we'll page through looking for matches, so a
// resume/filter combo with genuinely few good fits doesn't hammer the API.
const MAX_PAGES = 3;

export default function DiscoverPage() {
  const [allJobs, setAllJobs] = useState([]); // accumulated, already filtered to 70%+ (or unscored if no resume)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [noProfile, setNoProfile] = useState(false);
  const [ranOutOfPages, setRanOutOfPages] = useState(false);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [index, setIndex] = useState(0);
  const [savedIds, setSavedIds] = useState([]);
  const [rejectedIds, setRejectedIds] = useState([]);
  const [history, setHistory] = useState([]); // stack of { jobId, direction }

  // Any filter change re-runs the whole search: fetch a page, score it
  // against the resume, keep only 70%+ matches passing the other filters,
  // and if there aren't enough yet, fetch the next page and repeat.
  useEffect(() => {
    let cancelled = false;

    function passesLocalFilters(job) {
      if (filters.workMode && job.workMode !== filters.workMode) return false;
      if (
        filters.jobType === "internship" &&
        filters.paidStatus &&
        job.paidStatus !== filters.paidStatus
      ) {
        return false;
      }
      return true;
    }

    async function loadJobs() {
      try {
        setLoading(true);
        setError(null);
        setNoProfile(false);
        setRanOutOfPages(false);
        setIndex(0);
        setHistory([]);
        setAllJobs([]);

        const hasServerFilters = Boolean(filters.jobType || filters.city);
        let page = hasServerFilters ? 1 : Math.floor(Math.random() * 5) + 1;

        // Resolve the resume once up front — if there isn't one, we can't
        // score or threshold-filter, so just show whatever matches the
        // other filters on a single page (previous behavior).
        let resumeText = null;
        const user = await getCurrentUser();
        if (user) {
          const profile = await getProfile(user.id);
          if (profile) resumeText = buildResumeText(profile);
        }
        if (!resumeText && !cancelled) {
          setNoProfile(true);
        }

        let collected = [];
        let attempts = 0;
        let hasMore = true;

        while (hasMore && attempts < MAX_PAGES && !cancelled) {
          attempts += 1;

          const params = new URLSearchParams({ page: String(page) });
          if (filters.jobType) params.set("employmentType", filters.jobType);
          if (filters.city) params.set("where", filters.city);

          const res = await fetch(`/api/jobs?${params.toString()}`);
          if (!res.ok) throw new Error(`Request failed: ${res.status}`);
          const { jobs: fetchedJobs, nextPage } = await res.json();

          let batch = fetchedJobs.filter(passesLocalFilters);

          if (resumeText && batch.length > 0) {
            const scoreRes = await fetch("/api/score-jobs", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ resumeText, jobs: batch }),
            });
            if (scoreRes.ok) {
              const { jobs: scored } = await scoreRes.json();
              batch = scored;
            } else {
              console.error("Scoring failed:", await scoreRes.text());
            }
          }

          collected = collected.concat(batch);
          if (!cancelled) setAllJobs(collected);

          const goodCount = resumeText
            ? collected.filter(
                (j) => typeof j.matchScore === "number" && j.matchScore >= MIN_MATCH_SCORE
              ).length
            : collected.length;

          if (!resumeText || goodCount >= TARGET_GOOD_MATCHES || !nextPage) {
            hasMore = false;
            if (resumeText && goodCount < TARGET_GOOD_MATCHES && !cancelled) {
              setRanOutOfPages(true);
            }
          } else {
            page = nextPage;
          }
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
  }, [filters.jobType, filters.city, filters.workMode, filters.paidStatus]);

  // Once a resume is in play, only surface jobs that cleared the match bar,
  // best matches first. Without a resume there's nothing to threshold, so
  // show everything that was fetched (already passed the other filters).
  const jobs = noProfile
    ? allJobs
    : allJobs
        .filter((j) => typeof j.matchScore === "number" && j.matchScore >= MIN_MATCH_SCORE)
        .sort((a, b) => b.matchScore - a.matchScore);

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

  // Adzuna's own India dataset is thinner than what a general Google search
  // turns up (Internshala, LinkedIn, Naukri, company pages, etc.). Rather
  // than pretend SwipeHire has full coverage, offer a direct escape hatch
  // built from the active filters when results are sparse.
  function buildGoogleSearchUrl() {
    const parts = [];
    if (filters.workMode) parts.push(filters.workMode);
    parts.push(filters.jobType ? filters.jobType.replace("_", "-") : "job");
    parts.push("jobs in", filters.city || "India");
    const query = `${parts.join(" ")}`.trim();
    return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
  }

  const showGoogleFallback = !loading && !error && jobs.length < 5;

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />

      <div className={styles.page} style={{ flex: 1 }}>
        <h1 className={styles.heading}>Discover</h1>

        <FiltersPanel filters={filters} onChange={setFilters} />

        {!noProfile && (
          <p style={{ fontSize: 13, color: "var(--color-text-secondary, #666)", margin: "-8px 0 12px" }}>
            {loading
              ? "Finding your best matches…"
              : `Showing ${MIN_MATCH_SCORE}%+ matches for your resume.`}
          </p>
        )}
        {ranOutOfPages && !loading && (
          <p style={{ fontSize: 13, color: "var(--color-text-secondary, #666)", margin: "-8px 0 12px" }}>
            Only found {jobs.length} job{jobs.length === 1 ? "" : "s"} at {MIN_MATCH_SCORE}%+ match for these filters.
          </p>
        )}
        {showGoogleFallback && (
          <p style={{ fontSize: 13, margin: "-8px 0 12px" }}>
            Not finding enough here?{" "}
            <a
              href={buildGoogleSearchUrl()}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--color-primary, #f97316)", textDecoration: "underline" }}
            >
              Search on Google
            </a>{" "}
            for more.
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
              <a
                href={buildGoogleSearchUrl()}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--color-primary, #f97316)", textDecoration: "underline", fontSize: 13 }}
              >
                Search on Google for more
              </a>
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