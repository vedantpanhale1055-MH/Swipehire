"use client";
// components/Onboarding/Onboarding.jsx
// REPLACES EXISTING FILE — now wrapped in AuthLayout to match login/signup.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./Onboarding.module.css";
import formStyles from "@/components/Auth/AuthForm.module.css";
import AuthLayout from "@/components/Auth/AuthLayout";
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
    <AuthLayout
      eyebrow="One quick step"
      title="Let's set up your profile"
      subtitle="Takes under a minute, and powers your job matches and AI resume tailoring."
    >
      {error && (
        <p className={formStyles.error} role="alert">
          {error}
        </p>
      )}

      <OnboardingForm initialProfile={initialProfile} onSave={handleSave} saving={saving} />

      <button
        type="button"
        className={styles.skipLink}
        onClick={() => router.replace("/discover")}
      >
        Skip for now
      </button>
    </AuthLayout>
  );
}