"use client";
// app/portfolio/[username]/page.js
// NEW FILE — replaces the empty "page,js" placeholder (typo'd filename, deleted).

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getPublicProfileByUsername } from "@/lib/supabase";
import Portfolio from "@/components/Portfolio/Portfolio";
import styles from "@/components/Portfolio/Portfolio.module.css";

export default function PortfolioPage() {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await getPublicProfileByUsername(username);
        if (!cancelled) setProfile(data);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (username) load();
    return () => {
      cancelled = true;
    };
  }, [username]);

  if (loading) return null;

  if (!profile) {
    return (
      <div className={styles.page}>
        <div className={styles.notFound}>
          <h1 className={styles.notFoundTitle}>This portfolio isn't available</h1>
          <p className={styles.notFoundBody}>
            It may not exist, or the owner hasn't made it public yet.
          </p>
          <Link href="/" className={styles.headerCta}>
            Go to SwipeHire
          </Link>
        </div>
      </div>
    );
  }

  return <Portfolio profile={profile} />;
}