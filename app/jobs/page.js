"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar/Sidebar";
import { getCurrentUser, getUserJobs, deleteJob } from "@/lib/supabase";
import styles from "./jobs.module.css";

const STATUS_FILTERS = [
  { key: "all", label: "All" },
  { key: "saved", label: "Saved" },
  { key: "applied", label: "Applied" },
  { key: "interview", label: "Interview" },
  { key: "offer", label: "Offer" },
];

const STATUS_BADGE_CLASS = {
  saved: "badgeSaved",
  applied: "badgeApplied",
  interview: "badgeInterview",
  offer: "badgeOffer",
};

function formatDate(isoString) {
  if (!isoString) return "";
  return new Date(isoString).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function JobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [deletingId, setDeletingId] = useState(null);

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

  const visibleJobs = useMemo(() => {
    let result = jobs;

    if (statusFilter !== "all") {
      result = result.filter((job) => job.status === statusFilter);
    }

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      result = result.filter(
        (job) =>
          job.title?.toLowerCase().includes(q) ||
          job.company?.toLowerCase().includes(q) ||
          job.location?.toLowerCase().includes(q)
      );
    }

    result = [...result].sort((a, b) => {
      if (sortBy === "newest") return new Date(b.created_at) - new Date(a.created_at);
      if (sortBy === "oldest") return new Date(a.created_at) - new Date(b.created_at);
      if (sortBy === "company") return (a.company || "").localeCompare(b.company || "");
      if (sortBy === "title") return (a.title || "").localeCompare(b.title || "");
      return 0;
    });

    return result;
  }, [jobs, query, statusFilter, sortBy]);

  async function handleDelete(e, jobId) {
    e.stopPropagation();
    if (!confirm("Remove this job from your tracker?")) return;
    setDeletingId(jobId);
    try {
      await deleteJob(jobId);
      setJobs((prev) => prev.filter((job) => job.id !== jobId));
    } catch (err) {
      console.error("Failed to delete job:", err);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className={styles.container}>
      <Sidebar />
      <main className={styles.main}>
        <h1 className={styles.title}>Jobs</h1>
        <p className={styles.subtitle}>
          Every job you've saved or applied to, in one searchable list.
        </p>

        <div className={styles.toolbar}>
          <input
            type="text"
            placeholder="Search by title, company, or location..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={styles.searchInput}
          />

          <div className={styles.filterGroup}>
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.key}
                className={`${styles.filterChip} ${
                  statusFilter === f.key ? styles.filterChipActive : ""
                }`}
                onClick={() => setStatusFilter(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className={styles.sortSelect}
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="company">Company (A-Z)</option>
            <option value="title">Title (A-Z)</option>
          </select>
        </div>

        {loading ? (
          <div className={styles.placeholder}>
            <p>Loading jobs...</p>
          </div>
        ) : visibleJobs.length === 0 ? (
          <div className={styles.placeholder}>
            <p>
              {jobs.length === 0
                ? "No saved jobs yet — swipe right on Discover to add some."
                : "No jobs match your search or filter."}
            </p>
          </div>
        ) : (
          <div className={styles.list}>
            <div className={styles.listHeader}>
              <span className={styles.colTitle}>Role</span>
              <span className={styles.colCompany}>Company</span>
              <span className={styles.colLocation}>Location</span>
              <span className={styles.colStatus}>Status</span>
              <span className={styles.colDate}>Saved</span>
              <span className={styles.colActions} />
            </div>
            {visibleJobs.map((job) => (
              <div
                key={job.id}
                className={styles.row}
                onClick={() => router.push(`/jobs/${job.id}`)}
              >
                <span className={styles.colTitle}>{job.title}</span>
                <span className={styles.colCompany}>{job.company}</span>
                <span className={styles.colLocation}>{job.location || "—"}</span>
                <span className={styles.colStatus}>
                  <span
                    className={`${styles.badge} ${
                      styles[STATUS_BADGE_CLASS[job.status]] || ""
                    }`}
                  >
                    {job.status}
                  </span>
                </span>
                <span className={styles.colDate}>{formatDate(job.created_at)}</span>
                <span className={styles.colActions}>
                  <button
                    className={styles.deleteBtn}
                    onClick={(e) => handleDelete(e, job.id)}
                    disabled={deletingId === job.id}
                    title="Remove job"
                  >
                    {deletingId === job.id ? "..." : "✕"}
                  </button>
                </span>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}