// lib/supabase.js
// Supabase client setup for SwipeHire — handles auth + database access.
// Zero-cost stack: Supabase free tier (Postgres + Auth + Storage).

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase env vars. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local'
  );
}

// Client-side / browser client (safe to use in components)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ---- Auth helpers ----

export async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) return null;
  return user;
}

// ---- Job tracker (Kanban) helpers ----

export async function saveJob(userId, job) {
  const { data, error } = await supabase
    .from('saved_jobs')
    .insert([{ user_id: userId, ...job, status: 'saved' }])
    .select();
  if (error) throw error;
  return data[0];
}

// Manually add a job into a specific column (used by the "+ Add Job" button
// on the Applications board, as opposed to saveJob() which always starts a
// job at status "saved" from the Discover swipe flow).
export async function addManualJob(userId, job, status) {
  const { data, error } = await supabase
    .from('saved_jobs')
    .insert([{ user_id: userId, ...job, status }])
    .select();
  if (error) throw error;
  return data[0];
}

export async function getUserJobs(userId) {
  const { data, error } = await supabase
    .from('saved_jobs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

// Fetch a single saved job by its row id (RLS already scopes this to the
// logged-in user, since saved_jobs policies check auth.uid() = user_id).
export async function getSavedJobById(jobId) {
  const { data, error } = await supabase
    .from('saved_jobs')
    .select('*')
    .eq('id', jobId)
    .maybeSingle();
  if (error) throw error;
  return data; // null if not found / not owned by this user
}

export async function updateJobStatus(jobId, status) {
  const { data, error } = await supabase
    .from('saved_jobs')
    .update({ status })
    .eq('id', jobId)
    .select();
  if (error) throw error;
  return data[0];
}

export async function deleteJob(jobId) {
  const { error } = await supabase.from('saved_jobs').delete().eq('id', jobId);
  if (error) throw error;
}

// ---- Profile / Resume helpers ----

export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data; // null if no profile row exists yet
}

export async function upsertProfile(userId, profile) {
  const { data, error } = await supabase
    .from('profiles')
    .upsert(
      [{ user_id: userId, ...profile, updated_at: new Date().toISOString() }],
      { onConflict: 'user_id' }
    )
    .select();
  if (error) throw error;
  return data[0];
}