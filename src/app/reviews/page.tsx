import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { ScoreBadge } from '@/components/ui/Rating';

export const metadata = { title: 'TechPick Reviews' };

export default async function ReviewsHub() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('editorial_reviews')
    .select('id, rating, title, summary, product_id, products (name, slug)')
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-surface-900">TechPick Reviews</h1>
      <p className="mt-2 text-surface-600">In-depth analysis based on verified public information and sources.</p>
      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {(data || []).map((r: any) => (
          <Link
            key={r.id}
            href={r.products?.slug ? `/products/${r.products.slug}` : '#'}
            className="flex gap-4 rounded-2xl border border-surface-200 bg-white p-5 shadow-card transition hover:shadow-card-hover"
          >
            {r.rating != null && <ScoreBadge score={r.rating} />}
            <div>
              <h2 className="font-semibold text-surface-900">{r.products?.name || r.title}</h2>
              {r.summary && <p className="mt-1 line-clamp-2 text-sm text-surface-600">{r.summary}</p>}
            </div>
          </Link>
        ))}
      </div>
      {(!data || data.length === 0) && (
        <p className="mt-8 text-surface-500">No published editorial reviews yet.</p>
      )}
    </div>
  );
}
