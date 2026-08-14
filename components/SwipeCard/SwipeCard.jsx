"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./SwipeCard.module.css";

/**
 * A single draggable job card.
 * Props:
 *  - job: { id, title, company, location, salary, tags, matchScore, description }
 *  - onSwipe(direction): called with "left" | "right" once the swipe threshold is crossed
 *  - isTop: whether this card is the top (interactive) card in the stack
 */
export default function SwipeCard({ job, onSwipe, isTop }) {
  const router = useRouter();
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);
  const cardRef = useRef(null);

  const SWIPE_THRESHOLD = 120;

  function handlePointerDown(e) {
    if (!isTop) return;
    setDragging(true);
    startX.current = e.clientX;
    cardRef.current?.setPointerCapture?.(e.pointerId);
  }

  function handlePointerMove(e) {
    if (!dragging || !isTop) return;
    setDragX(e.clientX - startX.current);
  }

  function handlePointerUp() {
    if (!dragging || !isTop) return;
    setDragging(false);

    if (dragX > SWIPE_THRESHOLD) {
      triggerSwipe("right");
    } else if (dragX < -SWIPE_THRESHOLD) {
      triggerSwipe("left");
    } else {
      setDragX(0);
    }
  }

  function triggerSwipe(direction) {
    setDragX(direction === "right" ? 600 : -600);
    setTimeout(() => {
      onSwipe(direction);
    }, 180);
  }

  const rotation = dragX / 20;
  const score = typeof job.matchScore === "number" ? job.matchScore : null;
  const ringDeg = score !== null ? (score / 100) * 360 : 0;

  function getMatchColor(value) {
    if (value >= 80) return "var(--color-success)";
    if (value >= 60) return "var(--color-warning)";
    return "var(--color-danger)";
  }
  const ringColor = score !== null ? getMatchColor(score) : "var(--color-primary)";

  return (
    <div
      ref={cardRef}
      className={styles.card}
      style={{
        transform: `translateX(${dragX}px) rotate(${rotation}deg)`,
        cursor: isTop ? (dragging ? "grabbing" : "grab") : "default",
        transition: dragging ? "none" : "transform 0.25s ease",
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {isTop && dragX > 40 && <div className={`${styles.stamp} ${styles.saveStamp}`}>SAVE</div>}
      {isTop && dragX < -40 && <div className={`${styles.stamp} ${styles.rejectStamp}`}>SKIP</div>}

      {isTop && (
        <button
          className={styles.infoBtn}
          onClick={(e) => {
            e.stopPropagation();
            try {
              sessionStorage.setItem(`job:${job.id}`, JSON.stringify(job));
            } catch {
              // sessionStorage unavailable — detail page falls back to DB lookup
            }
            router.push(`/jobs/${job.id}`);
          }}
          onPointerDown={(e) => e.stopPropagation()}
          aria-label="View details"
        >
          ⓘ
        </button>
      )}

      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>{job.title}</h2>
          <p className={styles.company}>{job.company}</p>
        </div>
        {score !== null && (
          <div
            className={styles.matchRing}
            style={{
              background: `conic-gradient(${ringColor} ${ringDeg}deg, var(--color-border) ${ringDeg}deg)`,
            }}
          >
            <div className={styles.matchRingInner}>
              <span className={styles.matchScore} style={{ color: ringColor }}>
                {score}%
              </span>
            </div>
          </div>
        )}
      </div>

      {isTop && (
        <>
          <div className={styles.meta}>
            <span>{job.location}</span>
            <span className={styles.dot}>•</span>
            <span>{job.salary}</span>
          </div>

          <p className={styles.description}>{job.description}</p>

          <div className={styles.tags}>
            {job.tags?.map((tag) => (
              <span key={tag} className={styles.tag}>
                {tag}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}