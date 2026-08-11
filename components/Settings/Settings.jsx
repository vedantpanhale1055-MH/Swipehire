"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./Settings.module.css";
import Sidebar from "@/components/Sidebar/Sidebar";
import { getCurrentUser, getProfile, upsertProfile, isUsernameAvailable, signOut } from "@/lib/supabase";

export default function Settings() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState(null);
  const [username, setUsername] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);
  const [savingPortfolio, setSavingPortfolio] = useState(false);
  const [portfolioError, setPortfolioError] = useState(null);
  const [portfolioSaved, setPortfolioSaved] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const user = await getCurrentUser();
        if (cancelled) return;
        if (!user) {
          router.replace("/login");
          return;
        }
        setEmail(user.email || "");
        setUserId(user.id);

        const profile = await getProfile(user.id);
        if (cancelled) return;
        setUsername(profile?.username || "");
        setIsPublic(Boolean(profile?.is_public));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function handleSavePortfolio(e) {
    e.preventDefault();
    if (!userId) return;

    const cleaned = username.trim().toLowerCase();
    setPortfolioError(null);
    setPortfolioSaved(false);

    if (isPublic && !cleaned) {
      setPortfolioError("Choose a username before making your portfolio public.");
      return;
    }

    setSavingPortfolio(true);
    try {
      if (cleaned) {
        const available = await isUsernameAvailable(cleaned, userId);
        if (!available) {
          setPortfolioError("That username is already taken.");
          setSavingPortfolio(false);
          return;
        }
      }

      await upsertProfile(userId, { username: cleaned || null, is_public: isPublic });
      setUsername(cleaned);
      setPortfolioSaved(true);
    } catch (err) {
      setPortfolioError(err.message || "Failed to save your portfolio settings.");
    } finally {
      setSavingPortfolio(false);
    }
  }

  async function handleSignOut() {
    setSigningOut(true);
    setError(null);
    try {
      await signOut();
      router.push("/login");
    } catch (err) {
      setError(err.message || "Failed to sign out");
      setSigningOut(false);
    }
  }

  return (
    <div className={styles.layout}>
      <Sidebar />

      <main className={styles.main}>
        <h1 className={styles.heading}>Settings</h1>

        {loading ? (
          <p className={styles.stateText}>Loading…</p>
        ) : (
          <>
            <section className={styles.card}>
              <h2 className={styles.cardTitle}>Account</h2>
              <div className={styles.row}>
                <span className={styles.rowLabel}>Email</span>
                <span className={styles.rowValue}>{email}</span>
              </div>
            </section>

            <section className={styles.card}>
              <h2 className={styles.cardTitle}>Profile</h2>
              <p className={styles.cardBody}>
                Manage your resume details, skills, and experience used for job
                matching and AI resume tailoring.
              </p>
              <button
                className={styles.secondaryBtn}
                onClick={() => router.push("/resume-builder")}
              >
                Edit Resume Profile
              </button>
            </section>

            <section className={styles.card}>
              <h2 className={styles.cardTitle}>Portfolio</h2>
              <p className={styles.cardBody}>
                Publish a public page of your profile at a link you can share —
                phone and email are never shown on it.
              </p>

              <form className={styles.portfolioForm} onSubmit={handleSavePortfolio}>
                <div className={styles.portfolioField}>
                  <span className={styles.rowLabel}>swipehire.app/portfolio/</span>
                  <input
                    className={styles.usernameInput}
                    type="text"
                    value={username}
                    onChange={(e) =>
                      setUsername(e.target.value.replace(/[^a-z0-9-]/gi, "").toLowerCase())
                    }
                    placeholder="your-name"
                  />
                </div>

                <label className={styles.toggleRow}>
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                  />
                  <span>Make my portfolio public</span>
                </label>

                {portfolioError && <p className={styles.error}>{portfolioError}</p>}
                {portfolioSaved && !portfolioError && (
                  <p className={styles.success}>Saved.</p>
                )}

                <button
                  type="submit"
                  className={styles.secondaryBtn}
                  disabled={savingPortfolio}
                >
                  {savingPortfolio ? "Saving…" : "Save"}
                </button>

                {isPublic && username && (
                  <a
                    className={styles.portfolioLink}
                    href={`/portfolio/${username}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View your public portfolio →
                  </a>
                )}
              </form>
            </section>

            <section className={styles.card}>
              <h2 className={styles.cardTitle}>Session</h2>
              {error && <p className={styles.error}>{error}</p>}
              <button
                className={styles.dangerBtn}
                onClick={handleSignOut}
                disabled={signingOut}
              >
                {signingOut ? "Signing out…" : "Sign out"}
              </button>
            </section>
          </>
        )}
      </main>
    </div>
  );
}