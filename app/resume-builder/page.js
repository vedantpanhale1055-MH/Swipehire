"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar/Sidebar";
import ResumeForm from "@/components/ResumeBuilder/ResumeForm";
import ResumePreview from "@/components/ResumeBuilder/ResumePreview";
import { getCurrentUser, getProfile, upsertProfile } from "@/lib/supabase";
import styles from "./resume-builder.module.css";

export default function ResumeBuilderPage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      try {
        setLoading(true);
        setError(null);
        const user = await getCurrentUser();
        if (!user) {
          if (!cancelled) setError("Please log in to build your profile.");
          return;
        }
        const data = await getProfile(user.id);
        if (!cancelled) setProfile(data);
      } catch (err) {
        if (!cancelled) setError(err.message || "Failed to load profile");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProfile();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSave(updatedProfile) {
    try {
      setSaving(true);
      setError(null);
      const user = await getCurrentUser();
      if (!user) {
        setError("Please log in to save your profile.");
        return;
      }
      const saved = await upsertProfile(user.id, updatedProfile);
      setProfile(saved);
    } catch (err) {
      setError(err.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={styles.layout}>
      <Sidebar />
      <main className={styles.main}>
        <h1 className={styles.heading}>Resume Builder</h1>
        <p className={styles.subtitle}>
          This information powers AI resume tailoring and job matching.
        </p>

        {loading ? (
          <p>Loading…</p>
        ) : error ? (
          <p className={styles.error}>{error}</p>
        ) : (
          <div className={styles.grid}>
            <ResumeForm
              initialProfile={profile}
              onSave={handleSave}
              saving={saving}
            />
            <div className={styles.previewPane}>
              <ResumePreview profile={profile} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}