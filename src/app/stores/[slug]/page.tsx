import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';

export default async function StorePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: store } = await supabase
    .from('stores')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (!store) notFound();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-white light:text-surface-900">{store.name}</h1>
      <p className="mt-2 text-surface-200 light:text-surface-600">
        Partner store page. Products and offers for this retailer appear across the catalog; this template supports
        Jumia, Amazon, and future affiliates without hard-coding a single partner.
      </p>
      {store.website_url && (
        <a
          href={store.website_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-block text-sm font-medium text-brand-400 light:text-brand-600 hover:underline"
        >
          Visit {store.name} website
        </a>
      )}
    </div>
  );
}
