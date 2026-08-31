/**
 * Public Supabase config (safe for browser).
 * NEXT_PUBLIC_* vars are preferred; these fallbacks ensure the live site
 * works even if Vercel env was not present at build time.
 */
export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith('http') &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')
    ? process.env.NEXT_PUBLIC_SUPABASE_URL
    : 'https://ubwtnqrbdvwqbdezykaf.supabase.co';

export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 40
    ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVid3RucXJiZHZ3cWJkZXp5a2FmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc5MzU0NTUsImV4cCI6MjEwMzUxMTQ1NX0.ZRacWrHHXs8I0krGdN7hVmAJksK0UReX0GdDcd_LMyM';
