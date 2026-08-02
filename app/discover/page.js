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
    setIndex((prev) => prev + 1);
  }

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