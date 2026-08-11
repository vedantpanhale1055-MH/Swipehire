'use client';
// app/(auth)/signup/page.js
// REPLACES EXISTING FILE — overwrite the current signup page.js with this.

import { useState } from 'react';
import { signUp } from '@/lib/supabase';
import AuthLayout from '@/components/Auth/AuthLayout';
import styles from '@/components/Auth/AuthForm.module.css';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signUp(email, password);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <AuthLayout
        eyebrow="Right for the role, left to pass"
        title="Check your email"
        subtitle={null}
      >
        <div className={styles.successIcon} aria-hidden="true">
          ✓
        </div>
        <p className={styles.successText}>
          We sent a confirmation link to <strong>{email}</strong>. Confirm it, then log in.
        </p>
        <p className={styles.switchLine}>
          <a href="/login">Go to login</a>
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      eyebrow="Right for the role, left to pass"
      title="Create your account"
      subtitle="Start swiping through real job listings in minutes."
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
            autoComplete="new-password"
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className={styles.input}
          />
          <span className={styles.hint}>Minimum 6 characters.</span>
        </div>

        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}

        <button type="submit" disabled={loading} className={styles.submitButton}>
          {loading ? 'Creating account…' : 'Sign up'}
        </button>
      </form>

      <p className={styles.switchLine}>
        Already have an account? <a href="/login">Log in</a>
      </p>
    </AuthLayout>
  );
}