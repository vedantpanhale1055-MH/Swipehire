"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar/Sidebar";
import { getCurrentUser, getUserJobs } from "@/lib/supabase";
import styles from "./documents.module.css";

function formatDate(isoString) {
  if (!isoString) return "";
  return new Date(isoString).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function DocumentsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    async function load() {
      const user = await getCurrentUser();
      if (!user) {
        router.push("/login");
        return;
      }
      try {
        const rows = await getUserJobs(user.id);
        setJobs((rows || []).filter((job) => job.tailored_resume));
      } catch (err) {
        console.error("Failed to load documents:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  function handleCopy(job) {
    const r = job.tailored_resume;
    const text = [
      `Summary: ${r.summary || ""}`,
      "",
      "Bullets:",
      ...(r.bullets || []).map((b) => `- ${b}`),
      "",
      r.keywords_added?.length ? `Keywords added: ${r.keywords_added.join(", ")}` : "",
    ].join("\n");
    navigator.clipboard?.writeText(text);
  }

  return (
    <div className={styles.container}>
      <Sidebar />
      <main className={styles.main}>
        <h1 className={styles.title}>Documents</h1>
        <p className={styles.subtitle}>Your master resume and saved tailored versions.</p>

        <div className={styles.masterCard}>
          <div>
            <h2 className={styles.masterTitle}>Master Resume</h2>
            <p className={styles.masterSubtitle}>
              Your base resume, built and edited in Resume Builder.
            </p>
          </div>
          <button
            className={styles.masterBtn}
            onClick={() => router.push("/resume-builder")}
          >
            Open Resume Builder
          </button>
        </div>

        <h2 className={styles.sectionHeading}>Tailored Resumes</h2>

        {loading ? (
          <div className={styles.placeholder}>
            <p>Loading documents...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className={styles.placeholder}>
            <p>
              No tailored resumes saved yet. Open a saved job and use "Tailor
              Resume" → "Save to Documents" to keep one here.
            </p>
          </div>
        ) : (
          <div className={styles.docList}>
            {jobs.map((job) => {
              const isOpen = openId === job.id;
              const r = job.tailored_resume;
              return (
                <div key={job.id} className={styles.docCard}>
                  <button
                    className={styles.docHeader}
                    onClick={() => setOpenId(isOpen ? null : job.id)}
                  >
                    <div className={styles.docInfo}>
                      <span className={styles.docRole}>{job.title}</span>
                      <span className={styles.docCompany}>{job.company}</span>
                    </div>
                    <div className={styles.docMeta}>
                      <span className={styles.docDate}>
                        Saved {formatDate(job.tailored_resume_at)}
                      </span>
                      <span className={styles.chevron}>{isOpen ? "▾" : "▸"}</span>
                    </div>
                  </button>

                  {isOpen && (
                    <div className={styles.docBody}>
                      <section>
                        <h3 className={styles.docSectionTitle}>Summary</h3>
                        <p className={styles.docSummary}>{r.summary}</p>
                      </section>

                      <section>
                        <h3 className={styles.docSectionTitle}>Tailored Bullets</h3>
                        <ul className={styles.docBullets}>
                          {r.bullets?.map((b, i) => (
                            <li key={i}>{b}</li>
                          ))}
                        </ul>
                      </section>

                      {r.keywords_added?.length > 0 && (
                        <section>
                          <h3 className={styles.docSectionTitle}>Keywords Added</h3>
                          <div className={styles.chipRow}>
                            {r.keywords_added.map((kw) => (
                              <span key={kw} className={styles.chip}>{kw}</span>
                            ))}
                          </div>
                        </section>
                      )}

                      <div className={styles.docActions}>
                        <button
                          className={styles.actionBtn}
                          onClick={() => handleCopy(job)}
                        >
                          Copy as text
                        </button>
                        <button
                          className={styles.actionBtnSecondary}
                          onClick={() => router.push(`/jobs/${job.id}`)}
                        >
                          View job
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}