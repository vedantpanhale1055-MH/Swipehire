"use client";

import { useState } from "react";
import styles from "./KanbanBoard.module.css";
import mockApplications from "@/lib/mockApplications";

const COLUMNS = [
  { key: "saved", label: "Saved" },
  { key: "applied", label: "Applied" },
  { key: "interview", label: "Interview" },
  { key: "offer", label: "Offer" },
];

const NAV_ITEMS = [
  { label: "Dashboard", icon: "🏠" },
  { label: "Jobs", icon: "🔍" },
  { label: "Applications", icon: "💼", active: true },
  { label: "Calendar", icon: "📅" },
  { label: "Documents", icon: "📄" },
  { label: "Stats", icon: "📊" },
  { label: "Settings", icon: "⚙️" },
];

export default function KanbanBoard() {
  const [columns, setColumns] = useState(mockApplications);
  const [dragCard, setDragCard] = useState(null); // { id, fromColumn }

  function handleDragStart(cardId, fromColumn) {
    setDragCard({ id: cardId, fromColumn });
  }

  function handleDrop(toColumn) {
    if (!dragCard) return;
    const { id, fromColumn } = dragCard;
    if (fromColumn === toColumn) {
      setDragCard(null);
      return;
    }

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
  }

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <span className={styles.brandIcon}>💼</span>
          <span>SwipeHire</span>
        </div>

        <nav className={styles.nav}>
          {NAV_ITEMS.map((item) => (
            <div
              key={item.label}
              className={`${styles.navItem} ${item.active ? styles.navItemActive : ""}`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </nav>

        <div className={styles.userCard}>
          <div className={styles.userAvatar}>V</div>
          <div>
            <p className={styles.userName}>Vedant P.</p>
            <p className={styles.userEmail}>vedant@example.com</p>
          </div>
        </div>
      </aside>

      <main className={styles.main}>
        <div className={styles.topBar}>
          <h1 className={styles.heading}>Applications</h1>
          <input className={styles.search} placeholder="Search jobs..." />
        </div>

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
      </main>
    </div>
  );
}