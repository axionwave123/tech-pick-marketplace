/** Lightweight fuzzy product-name matching for affiliate feed import (Phase 2). */

const STOP = new Set([
  'the',
  'a',
  'an',
  'and',
  'or',
  'for',
  'with',
  'of',
  'in',
  'on',
  'to',
  'by',
  'ng',
  'nigeria',
  'official',
  'store',
  'new',
  'buy',
  'sale',
  'free',
  'shipping',
  'gb',
  'ram',
  'rom',
]);

export function normalizeName(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function tokens(input: string): string[] {
  return normalizeName(input)
    .split(' ')
    .filter((t) => t.length > 1 && !STOP.has(t));
}

function bigramDice(a: string, b: string): number {
  const x = normalizeName(a).replace(/\s/g, '');
  const y = normalizeName(b).replace(/\s/g, '');
  if (!x.length || !y.length) return 0;
  if (x === y) return 1;
  if (x.length < 2 || y.length < 2) return x === y ? 1 : 0;
  const bg = (s: string) => {
    const set = new Map<string, number>();
    for (let i = 0; i < s.length - 1; i++) {
      const k = s.slice(i, i + 2);
      set.set(k, (set.get(k) || 0) + 1);
    }
    return set;
  };
  const A = bg(x);
  const B = bg(y);
  let overlap = 0;
  for (const [k, c] of A) {
    const d = B.get(k) || 0;
    overlap += Math.min(c, d);
  }
  return (2 * overlap) / (x.length - 1 + (y.length - 1));
}

function tokenScore(a: string, b: string): number {
  const ta = new Set(tokens(a));
  const tb = new Set(tokens(b));
  if (!ta.size || !tb.size) return 0;
  let inter = 0;
  for (const t of ta) if (tb.has(t)) inter += 1;
  const union = new Set([...ta, ...tb]).size;
  const jaccard = inter / union;
  const smaller = ta.size <= tb.size ? ta : tb;
  const larger = ta.size <= tb.size ? tb : ta;
  let contained = 0;
  for (const t of smaller) if (larger.has(t)) contained += 1;
  const containment = contained / smaller.size;
  return Math.max(jaccard, containment * 0.95);
}

export function nameSimilarity(a: string, b: string): number {
  const na = normalizeName(a);
  const nb = normalizeName(b);
  if (!na || !nb) return 0;
  if (na === nb) return 1;
  if (na.includes(nb) || nb.includes(na)) {
    const ratio = Math.min(na.length, nb.length) / Math.max(na.length, nb.length);
    return Math.max(0.82, ratio);
  }
  const dice = bigramDice(na, nb);
  const tok = tokenScore(na, nb);
  return dice * 0.45 + tok * 0.55;
}

export type FuzzyCandidate<T> = { item: T; score: number };

export function bestNameMatch<T extends { name: string }>(
  query: string,
  catalog: T[],
  minScore = 0.62
): FuzzyCandidate<T> | null {
  let best: FuzzyCandidate<T> | null = null;
  for (const item of catalog) {
    const score = nameSimilarity(query, item.name);
    if (score < minScore) continue;
    if (!best || score > best.score) best = { item, score };
  }
  return best;
}
