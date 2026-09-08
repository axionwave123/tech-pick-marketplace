import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNaira(amount: number | null | undefined): string {
  if (amount == null || Number.isNaN(amount)) return '—';
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDiscount(original: number | null, current: number): string | null {
  if (!original || original <= current) return null;
  const pct = Math.round(((original - current) / original) * 100);
  return `-${pct}%`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function relativeTime(date: string | null): string {
  if (!date) return 'Unknown';
  const d = new Date(date);
  const now = new Date();
  const sec = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (sec < 60) return 'Just now';
  if (sec < 3600) return `${Math.floor(sec / 60)} min ago`;
  if (sec < 86400) return `${Math.floor(sec / 3600)} hours ago`;
  if (sec < 604800) return `${Math.floor(sec / 86400)} days ago`;
  return d.toLocaleDateString('en-NG', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function ratingStars(rating: number, max = 5): string {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5 ? 1 : 0;
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(Math.max(0, max - full - half));
}

/** Split a search query into safe tokens (words) for multi-word matching. */
export function searchTokens(query: string): string[] {
  return (query || '')
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((t) => t.replace(/[%_,]/g, '').trim())
    .filter((t) => t.length > 0)
    .slice(0, 8);
}

/** True if haystack contains every token (word-by-word). */
export function matchesAllTokens(haystack: string, tokens: string[]): boolean {
  if (!tokens.length) return true;
  const h = (haystack || '').toLowerCase();
  return tokens.every((t) => h.includes(t));
}
