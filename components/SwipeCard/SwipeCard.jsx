"use client";

import { useRef, useState } from "react";
import styles from "./SwipeCard.module.css";

/**
 * A single draggable job card.
 * Props:
 *  - job: { id, title, company, location, salary, tags, matchScore, description }
 *  - onSwipe(direction): called with "left" | "right" once the swipe threshold is crossed
 *  - isTop: whether this card is the top (interactive) card in the stack
 */
export default function SwipeCard({ job, onSwipe, isTop }) {
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
  const opacity = isTop ? 1 : 0.6;
  const scale = isTop ? 1 : 0.96;

  return (
    <div
      ref={cardRef}
      className={styles.card}
      style={{
        transform: `translateX(${dragX}px) rotate(${rotation}deg) scale(${scale})`,
        opacity,
        cursor: isTop ? (dragging ? "grabbing" : "grab") : "default",
        transition: dragging ? "none" : "transform 0.25s ease, opacity 0.25s ease",
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {dragX > 40 && <div className={`${styles.stamp} ${styles.saveStamp}`}>SAVE</div>}
      {dragX < -40 && <div className={`${styles.stamp} ${styles.rejectStamp}`}>SKIP</div>}

      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>{job.title}</h2>
          <p className={styles.company}>{job.company}</p>
        </div>
        {typeof job.matchScore === "number" && (
          <div className={styles.matchBadge}>{job.matchScore}%</div>
        )}
      </div>

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
    </div>
  );
}