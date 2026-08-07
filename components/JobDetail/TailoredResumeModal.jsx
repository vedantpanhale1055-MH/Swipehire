"use client";

import { useEffect, useState } from "react";
import { getProfile } from "@/lib/supabase"; // adjust name if your actual export differs
import { buildResumeText } from "@/lib/resumeText";
import styles from "./TailoredResumeModal.module.css";

/**
 * Props:
 *  - job: the current job object (needs job.description)
 *  - onClose(): closes the modal
 */
export default function TailoredResumeModal({ job, onClose }) {
  const [status, setStatus] = useState("loading"); // loading | error | done
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const profile = await getProfile();
        if (!profile) {
          throw new Error("No profile found — fill out Resume Builder first.");
        }

        const resumeText = buildResumeText(profile);

        const res = await fetch("/api/tailor-resume", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            resumeText,
            jobDescription: job.description,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Something went wrong");

        if (!cancelled) {
          setResult(data.tailored);
          setStatus("done");
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
          setStatus("error");
        }
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [job]);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
          ✕
        </button>

        <h2 className={styles.heading}>📄 Tailored Resume</h2>
        <p className={styles.subheading}>for {job.title} at {job.company}</p>

        {status === "loading" && (
          <div className={styles.loading}>Tailoring your resume…</div>
        )}

        {status === "error" && (
          <div className={styles.error}>{error}</div>
        )}

        {status === "done" && result && (
          <div className={styles.result}>
            <section>
              <h3 className={styles.sectionTitle}>Summary</h3>
              <p className={styles.summary}>{result.summary}</p>
            </section>

            <section>
              <h3 className={styles.sectionTitle}>Tailored Bullets</h3>
              <ul className={styles.bulletList}>
                {result.bullets?.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            </section>

            {result.keywords_added?.length > 0 && (
              <section>
                <h3 className={styles.sectionTitle}>Keywords Added</h3>
                <div className={styles.chipRow}>
                  {result.keywords_added.map((kw) => (
                    <span key={kw} className={styles.chip}>
                      {kw}
                    </span>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}