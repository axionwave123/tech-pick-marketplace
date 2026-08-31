import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/supabase/config';

/** Always true for this project — public URL + anon key are wired in config */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    SUPABASE_URL.startsWith('http') &&
      !SUPABASE_URL.includes('placeholder') &&
      SUPABASE_ANON_KEY.length > 40
  );
}

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch {
          // Server Component — ignore
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: '', ...options });
        } catch {
          // Server Component — ignore
        }
      },
    },
  });
}

/** Service role client — server-only, never expose to browser */
export function createServiceClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;

  return createSupabaseClient(SUPABASE_URL, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
