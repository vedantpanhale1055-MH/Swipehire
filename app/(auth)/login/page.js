'use client';
// app/(auth)/login/page.js
// REPLACES EXISTING FILE — overwrite the current login page.js with this.

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, getCurrentUser, getProfile, isProfileComplete } from '@/lib/supabase';
import AuthLayout from '@/components/Auth/AuthLayout';
import styles from '@/components/Auth/AuthForm.module.css';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
      const user = await getCurrentUser();
      const profile = user ? await getProfile(user.id) : null;
      router.push(isProfileComplete(profile) ? '/discover' : '/onboarding');
    } catch (err) {
      setError(err.message || 'Failed to log in');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      eyebrow="Right for the role, left to pass"
      title="Welcome back"
      subtitle="Log in to pick up where you left off."
    >
      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        <div className={styles.field}>
          <label htmlFor="email" className={styles.label}>
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={styles.input}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="password" className={styles.label}>
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={styles.input}
          />
        </div>

        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}

        <button type="submit" disabled={loading} className={styles.submitButton}>
          {loading ? 'Logging in…' : 'Log in'}
        </button>
      </form>

      <p className={styles.switchLine}>
        No account? <a href="/signup">Sign up</a>
      </p>
    </AuthLayout>
  );
}