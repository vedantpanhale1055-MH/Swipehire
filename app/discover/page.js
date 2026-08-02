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

  const remaining = jobs.slice(index, index + 3); // top 3 for stack effect
  const currentJob = jobs[index];

  function handleSwipe(direction) {
    if (!currentJob) return;

    if (direction === "right") {
      setSavedIds((prev) => [...prev, currentJob.id]);
    } else {
      setRejectedIds((prev) => [...prev, currentJob.id]);
    }
    setIndex((prev) => prev + 1);
  }

  const isFinished = index >= jobs.length;

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
          remaining
            .map((job, i) => (
              <SwipeCard
                key={job.id}
                job={job}
                isTop={i === 0}
                onSwipe={i === 0 ? handleSwipe : () => {}}
              />
            ))
            .reverse()
        )}
      </div>

      {!isFinished && (
        <div className={styles.actions}>
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
        </div>
      )}
    </div>
  );
}