"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./KanbanBoard.module.css";
import Sidebar from "@/components/Sidebar/Sidebar";
import { getCurrentUser, getUserJobs, updateJobStatus } from "@/lib/supabase";

const COLUMNS = [
  { key: "saved", label: "Saved" },
  { key: "applied", label: "Applied" },
  { key: "interview", label: "Interview" },
  { key: "offer", label: "Offer" },
];

const CARD_COLORS = ["#F4A259", "#5B8A72", "#7C77B9", "#E07A5F", "#3D8FA6"];

function colorForCompany(name) {
  if (!name) return CARD_COLORS[0];
  const sum = name
    .split("")
    .reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return CARD_COLORS[sum % CARD_COLORS.length];
}

function formatTimestamp(isoString) {
  if (!isoString) return "";
  const date = new Date(isoString);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

/**
 * Groups a flat list of saved_jobs rows into { saved: [...], applied: [...], ... }
 * shaped for the board, and adapts each row's fields (title/company/location/
 * created_at) into the card display fields (role/company/timestamp/color/initial)
 * the board renders.
 */
function groupJobsByStatus(rows) {
  const grouped = { saved: [], applied: [], interview: [], offer: [] };

  for (const row of rows) {
    const status = COLUMNS.some((c) => c.key === row.status) ? row.status : "saved";
    grouped[status].push({
      id: row.id,
      company: row.company,
      role: row.title,
      timestamp: formatTimestamp(row.created_at),
      color: colorForCompany(row.company),
      initial: (row.company || "?").charAt(0).toUpperCase(),
    });
  }

  return grouped;
}

export default function KanbanBoard() {
  const router = useRouter();

  const [columns, setColumns] = useState({
    saved: [],
    applied: [],
    interview: [],
    offer: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dragCard, setDragCard] = useState(null); // { id, fromColumn }
  const [wasDragged, setWasDragged] = useState(false); // suppress click right after a drag

  useEffect(() => {
    let cancelled = false;

    async function loadJobs() {
      try {
        setLoading(true);
        setError(null);
        const user = await getCurrentUser();
        if (!user) {
          if (!cancelled) {
            setError("Please log in to see your saved jobs.");
          }
          return;
        }
        const rows = await getUserJobs(user.id);
        if (!cancelled) {
          setColumns(groupJobsByStatus(rows));
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Failed to load applications");
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

  function handleDragStart(cardId, fromColumn) {
    setDragCard({ id: cardId, fromColumn });
  }

  function handleDragEnd() {
    // Mark that a drag just happened so the trailing click (native browsers
    // fire click after drop in some cases) doesn't also trigger navigation.
    setWasDragged(true);
    setTimeout(() => setWasDragged(false), 0);
  }

  function handleDrop(toColumn) {
    if (!dragCard) return;
    const { id, fromColumn } = dragCard;
    if (fromColumn === toColumn) {
      setDragCard(null);
      return;
    }

    // Optimistic local update
    setColumns((prev) => {
      const card = prev[fromColumn].find((c) => c.id === id);
      if (!card) return prev;

      return {
        ...prev,
        [fromColumn]: prev[fromColumn].filter((c) => c.id !== id),
        [toColumn]: [...prev[toColumn], card],
      };
    });

    setDragCard(null);

    // Persist to Supabase; roll back on failure
    updateJobStatus(id, toColumn).catch((err) => {
      console.error("Failed to update job status:", err);
      setColumns((prev) => {
        const card = prev[toColumn].find((c) => c.id === id);
        if (!card) return prev;
        return {
          ...prev,
          [toColumn]: prev[toColumn].filter((c) => c.id !== id),
          [fromColumn]: [...prev[fromColumn], card],
        };
      });
    });
  }

  function handleCardClick(cardId) {
    if (wasDragged) return;
    router.push(`/jobs/${cardId}`);
  }

  return (
    <div className={styles.layout}>
      <Sidebar />

      <main className={styles.main}>
        <div className={styles.topBar}>
          <h1 className={styles.heading}>Applications</h1>
          <input className={styles.search} placeholder="Search jobs..." />
        </div>

        {loading ? (
          <p className={styles.heading}>Loading applications…</p>
        ) : error ? (
          <p className={styles.heading}>{error}</p>
        ) : (
          <div className={styles.board}>
            {COLUMNS.map((col) => (
              <div
                key={col.key}
                className={styles.column}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(col.key)}
              >
                <div className={styles.columnHeader}>
                  <span className={styles.columnTitle}>{col.label}</span>
                  <span className={styles.columnCount}>{columns[col.key].length}</span>
                </div>

                <div className={styles.cardList}>
                  {columns[col.key].map((card) => (
                    <div
                      key={card.id}
                      className={styles.card}
                      draggable
                      onDragStart={() => handleDragStart(card.id, col.key)}
                      onDragEnd={handleDragEnd}
                      onClick={() => handleCardClick(card.id)}
                      role="button"
                      tabIndex={0}
                    >
                      <div className={styles.cardTop}>
                        <div className={styles.cardIcon} style={{ background: card.color }}>
                          {card.initial}
                        </div>
                        <div>
                          <p className={styles.cardCompany}>{card.company}</p>
                          <p className={styles.cardRole}>{card.role}</p>
                        </div>
                      </div>
                      <p className={styles.cardTimestamp}>{card.timestamp}</p>
                    </div>
                  ))}
                </div>

                <button className={styles.addJobBtn}>+ Add Job</button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}