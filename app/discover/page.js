"use client";

import { useState } from "react";
import SwipeCard from "@/components/SwipeCard/SwipeCard";
import mockJobs from "@/lib/mockJobs";
import styles from "./discover.module.css";

export default function DiscoverPage() {
  const [jobs] = useState(mockJobs);
  const [index, setIndex] = useState(0);
  const [savedIds, setSavedIds] = useState([]);
  const [rejectedIds, setRejectedIds] = useState([]);
  const [history, setHistory] = useState([]); // stack of { jobId, direction }

  const stack = jobs.slice(index, index + 3); // top 3 for stack effect
  const currentJob = jobs[index];
  const isFinished = index >= jobs.length;

  function handleSwipe(direction) {
    if (!currentJob) return;

    if (direction === "right") {
      setSavedIds((prev) => [...prev, currentJob.id]);
    } else {
      setRejectedIds((prev) => [...prev, currentJob.id]);
    }
    setHistory((prev) => [...prev, { jobId: currentJob.id, direction }]);
    setIndex((prev) => prev + 1);
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
    <div className={styles.page}>
      <h1 className={styles.heading}>Discover</h1>

      <div className={styles.stackWrapper}>
        {isFinished ? (
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
        {!isFinished && (
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
  );
}