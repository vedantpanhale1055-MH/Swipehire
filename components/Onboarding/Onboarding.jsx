"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./Onboarding.module.css";
import OnboardingForm from "./OnboardingForm";
import { getCurrentUser, getProfile, upsertProfile } from "@/lib/supabase";

export default function Onboarding() {
  const router = useRouter();

  const [userId, setUserId] = useState(null);
  const [initialProfile, setInitialProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const user = await getCurrentUser();
        if (!user) {
          router.replace("/login");
          return;
        }
        if (cancelled) return;
        setUserId(user.id);

        const profile = await getProfile(user.id);
        if (cancelled) return;
        setInitialProfile(profile);
      } catch (err) {
        if (!cancelled) setError(err.message || "Failed to load your profile.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [router]);

  async function handleSave(fields) {
    if (!userId) return;
    try {
      setSaving(true);
      setError(null);
      await upsertProfile(userId, fields);
      router.replace("/discover");
    } catch (err) {
      setError(err.message || "Failed to save your profile. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className={styles.centered}>
        <p>Loading…</p>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Let's set up your profile</h1>
        <p className={styles.subtitle}>
          This takes under a minute and powers your job matches and AI resume
          tailoring. You can fill in the rest of your resume later.
        </p>

        {error && <p className={styles.error}>{error}</p>}

        <OnboardingForm
          initialProfile={initialProfile}
          onSave={handleSave}
          saving={saving}
        />

        <button
          type="button"
          className={styles.skipLink}
          onClick={() => router.replace("/discover")}
        >
          Skip for now
        </button>
      </div>
    </main>
  );
}