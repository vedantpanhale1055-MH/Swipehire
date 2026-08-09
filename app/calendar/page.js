"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar/Sidebar";
import { getCurrentUser, getUserJobs, updateInterviewDate } from "@/lib/supabase";
import styles from "./calendar.module.css";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function dateKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

function buildMonthGrid(year, month) {
  const firstOfMonth = new Date(year, month, 1);
  const startOffset = firstOfMonth.getDay(); // 0 = Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export default function CalendarPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    async function load() {
      const user = await getCurrentUser();
      if (!user) {
        router.push("/login");
        return;
      }
      try {
        const rows = await getUserJobs(user.id);
        setJobs(rows || []);
      } catch (err) {
        console.error("Failed to load jobs:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  const interviewJobs = useMemo(
    () => jobs.filter((job) => job.status === "interview"),
    [jobs]
  );

  const scheduledJobs = useMemo(
    () => interviewJobs.filter((job) => job.interview_date),
    [interviewJobs]
  );

  const unscheduledJobs = useMemo(
    () => interviewJobs.filter((job) => !job.interview_date),
    [interviewJobs]
  );

  const jobsByDay = useMemo(() => {
    const map = {};
    for (const job of scheduledJobs) {
      const key = dateKey(new Date(job.interview_date));
      if (!map[key]) map[key] = [];
      map[key].push(job);
    }
    return map;
  }, [scheduledJobs]);

  const upcoming = useMemo(
    () =>
      [...scheduledJobs].sort(
        (a, b) => new Date(a.interview_date) - new Date(b.interview_date)
      ),
    [scheduledJobs]
  );

  const grid = useMemo(
    () => buildMonthGrid(cursor.year, cursor.month),
    [cursor]
  );

  const today = new Date();
  const todayKey = dateKey(today);

  function goToMonth(delta) {
    setCursor((prev) => {
      let month = prev.month + delta;
      let year = prev.year;
      if (month < 0) { month = 11; year -= 1; }
      if (month > 11) { month = 0; year += 1; }
      return { year, month };
    });
  }

  async function handleSetDate(jobId, value) {
    if (!value) return;
    setSavingId(jobId);
    try {
      const iso = new Date(value).toISOString();
      const updated = await updateInterviewDate(jobId, iso);
      setJobs((prev) =>
        prev.map((job) => (job.id === jobId ? { ...job, interview_date: updated.interview_date } : job))
      );
    } catch (err) {
      console.error("Failed to set interview date:", err);
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className={styles.container}>
      <Sidebar />
      <main className={styles.main}>
        <h1 className={styles.title}>Calendar</h1>
        <p className={styles.subtitle}>Track interviews and deadlines.</p>

        {loading ? (
          <div className={styles.placeholder}>
            <p>Loading calendar...</p>
          </div>
        ) : (
          <div className={styles.layout}>
            <div className={styles.calendarCard}>
              <div className={styles.calendarHeader}>
                <button className={styles.navBtn} onClick={() => goToMonth(-1)}>
                  ‹
                </button>
                <span className={styles.monthLabel}>
                  {MONTH_NAMES[cursor.month]} {cursor.year}
                </span>
                <button className={styles.navBtn} onClick={() => goToMonth(1)}>
                  ›
                </button>
              </div>

              <div className={styles.weekdayRow}>
                {WEEKDAYS.map((w) => (
                  <span key={w} className={styles.weekday}>{w}</span>
                ))}
              </div>

              <div className={styles.grid}>
                {grid.map((date, i) => {
                  if (!date) return <div key={i} className={styles.emptyCell} />;
                  const key = dateKey(date);
                  const dayJobs = jobsByDay[key] || [];
                  const isToday = key === todayKey;
                  return (
                    <div
                      key={i}
                      className={`${styles.cell} ${isToday ? styles.cellToday : ""}`}
                    >
                      <span className={styles.cellNumber}>{date.getDate()}</span>
                      {dayJobs.map((job) => (
                        <button
                          key={job.id}
                          className={styles.cellEvent}
                          onClick={() => router.push(`/jobs/${job.id}`)}
                          title={`${job.title} @ ${job.company}`}
                        >
                          {job.company}
                        </button>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className={styles.sidebarCol}>
              <div className={styles.panel}>
                <h2 className={styles.panelTitle}>Upcoming interviews</h2>
                {upcoming.length === 0 ? (
                  <p className={styles.emptyText}>No interviews scheduled yet.</p>
                ) : (
                  <ul className={styles.upcomingList}>
                    {upcoming.map((job) => (
                      <li
                        key={job.id}
                        className={styles.upcomingItem}
                        onClick={() => router.push(`/jobs/${job.id}`)}
                      >
                        <div className={styles.upcomingDate}>
                          {new Date(job.interview_date).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                          })}
                          <span className={styles.upcomingTime}>
                            {new Date(job.interview_date).toLocaleTimeString(undefined, {
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <div className={styles.upcomingInfo}>
                          <span className={styles.upcomingRole}>{job.title}</span>
                          <span className={styles.upcomingCompany}>{job.company}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className={styles.panel}>
                <h2 className={styles.panelTitle}>Needs a date</h2>
                {unscheduledJobs.length === 0 ? (
                  <p className={styles.emptyText}>
                    Every interview-stage job has a date set.
                  </p>
                ) : (
                  <ul className={styles.unscheduledList}>
                    {unscheduledJobs.map((job) => (
                      <li key={job.id} className={styles.unscheduledItem}>
                        <div className={styles.upcomingInfo}>
                          <span className={styles.upcomingRole}>{job.title}</span>
                          <span className={styles.upcomingCompany}>{job.company}</span>
                        </div>
                        <input
                          type="datetime-local"
                          className={styles.dateInput}
                          disabled={savingId === job.id}
                          onChange={(e) => handleSetDate(job.id, e.target.value)}
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}