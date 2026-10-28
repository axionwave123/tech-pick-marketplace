'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

type Mode = 'login' | 'forgot';

export default function AdminLoginPage() {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }
    router.push('/admin/dashboard');
    router.refresh();
  }

  async function onForgot(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const supabase = createClient();
    const origin =
      typeof window !== 'undefined' ? window.location.origin : 'https://tech-pick-marketplace-woad.vercel.app';
    const redirectTo = `${origin}/admin/reset-password`;

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo,
    });

    setLoading(false);
    if (resetError) {
      setError(resetError.message);
      return;
    }
    setMessage(
      'If an account exists for that email, a reset link was sent. Check your inbox (and spam). The link opens a page to set a new password.'
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-950 px-4">
      <div className="w-full max-w-md rounded-2xl border border-surface-800 bg-surface-900 p-8 shadow-xl">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-lg font-bold text-white">
            TP
          </div>
          <h1 className="mt-4 text-xl font-bold text-white">
            {mode === 'login' ? 'TechPick NG Admin' : 'Reset password'}
          </h1>
          <p className="mt-1 text-sm text-surface-400">
            {mode === 'login'
              ? 'Sign in to restricted area'
              : 'We will email you a secure link to choose a new password'}
          </p>
        </div>

        {mode === 'login' ? (
          <form onSubmit={onLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-surface-300">Email</label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-surface-700 bg-surface-950 px-3 py-2.5 text-sm text-white outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <div className="flex items-center justify-between gap-2">
                <label className="block text-sm font-medium text-surface-300">Password</label>
                <button
                  type="button"
                  onClick={() => {
                    setMode('forgot');
                    setError(null);
                    setMessage(null);
                  }}
                  className="text-xs font-semibold text-brand-400 hover:text-brand-300"
                >
                  Forgot password?
                </button>
              </div>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-lg border border-surface-700 bg-surface-950 px-3 py-2.5 text-sm text-white outline-none focus:border-brand-500"
              />
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            {message && <p className="text-sm text-emerald-400">{message}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-500 disabled:opacity-50"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        ) : (
          <form onSubmit={onForgot} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-surface-300">Admin email</label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-1 w-full rounded-lg border border-surface-700 bg-surface-950 px-3 py-2.5 text-sm text-white outline-none focus:border-brand-500"
              />
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            {message && <p className="text-sm text-emerald-400">{message}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-500 disabled:opacity-50"
            >
              {loading ? 'Sending…' : 'Send reset link'}
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
                setMessage(null);
              }}
              className="w-full text-center text-sm font-medium text-surface-400 hover:text-white"
            >
              ← Back to sign in
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-xs text-surface-500">
          Access requires an admin role in the database. Unauthorized users are denied even if
          authenticated.
        </p>
        <p className="mt-3 text-center text-xs text-surface-600">
          <Link href="/" className="hover:text-surface-400">
            ← Public site
          </Link>
        </p>
      </div>
    </div>
  );
}
