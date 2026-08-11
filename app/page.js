"use client";
// app/page.js
// REPLACES EXISTING FILE — overwrite the current root page.js with this.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, getProfile, isProfileComplete } from "@/lib/supabase";
import Landing from "@/components/Landing/Landing";

export default function Home() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function checkAuth() {
      const user = await getCurrentUser();
      if (cancelled) return;

      if (user) {
        setLoggedIn(true);
        const profile = await getProfile(user.id);
        if (cancelled) return;
        router.replace(isProfileComplete(profile) ? "/dashboard" : "/onboarding");
      } else {
        setChecking(false);
      }
    }

    checkAuth();

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (checking || loggedIn) {
    // Brief loading state while we check auth, or while redirecting a logged-in user
    return null;
  }

  return <Landing />;
}