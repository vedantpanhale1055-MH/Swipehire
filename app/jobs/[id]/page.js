"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import JobDetail from "@/components/JobDetail/JobDetail";
import { getSavedJobById } from "@/lib/supabase";

export default function JobDetailPage() {
  const router = useRouter();
  const params = useParams();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadJob() {
      try {
        setLoading(true);
        setError(null);

        // Jobs opened from the Discover feed haven't been saved yet, so
        // their id is a raw source id (e.g. "adzuna-123") — not a Supabase
        // row id. SwipeCard caches the full job in sessionStorage before
        // navigating here; check that first to avoid a DB lookup that will
        // never match for unsaved feed jobs.
        let cached = null;
        try {
          const raw = sessionStorage.getItem(`job:${params.id}`);
          if (raw) cached = JSON.parse(raw);
        } catch {
          // sessionStorage unavailable or bad JSON — fall through to DB lookup
        }

        if (cached) {
          if (!cancelled) setJob(cached);
          return;
        }

        const row = await getSavedJobById(params.id);
        if (!cancelled) {
          if (!row) {
            setError("Job not found.");
          } else {
            setJob(row);
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Failed to load job");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    if (params.id) {
      loadJob();
    }

    return () => {
      cancelled = true;
    };
  }, [params.id]);

  if (loading) return <p style={{ padding: 24 }}>Loading job…</p>;
  if (error) return <p style={{ padding: 24 }}>{error}</p>;

  return <JobDetail job={job} onBack={() => router.back()} />;
}