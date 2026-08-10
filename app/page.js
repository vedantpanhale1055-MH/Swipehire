"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, getProfile, isProfileComplete } from "@/lib/supabase";

export default function Home() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function checkAuth() {
      const user = await getCurrentUser();
      if (cancelled) return;

      if (user) {
        const profile = await getProfile(user.id);
        if (cancelled) return;
        router.replace(isProfileComplete(profile) ? "/dashboard" : "/onboarding");
      } else {
        router.replace("/login");
      }
    }

    checkAuth();

    return () => {
      cancelled = true;
    };
  }, [router]);

  // Brief loading state while we check auth and redirect
  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      {checking && <p>Loading…</p>}
    </main>
  );
}