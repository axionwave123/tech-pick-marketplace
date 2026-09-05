import { getProductsByCategorySlug, getCategories } from '@/lib/data/products';
import { ProductCard } from '@/components/products/ProductCard';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const CATEGORY_ICONS: Record<string, string> = {
  smartphones: '📱',
  laptops: '💻',
  tablets: '📟',
  audio: '🎧',
  gaming: '🎮',
  tvs: '📺',
  wearables: '⌚',
  cameras: '📷',
  accessories: '🔌',
  'power-banks': '🔋',
  power: '🔋',
};

const CATEGORY_BLURBS: Record<string, string> = {
  smartphones: 'Compare the latest Android phones from Samsung, Xiaomi, Tecno & more across Nigerian stores.',
  laptops: 'Business, student and gaming laptops — check prices on Jumia, Temu and partners.',
  tablets: 'Tablets for work, school and entertainment with multi-store price comparison.',
  audio: 'Headphones, earbuds and speakers with the best available deals.',
  gaming: 'Gaming laptops, consoles and accessories — find the lowest price.',
  tvs: 'Smart TVs and displays — compare offers before you buy.',
  wearables: 'Smartwatches and fitness trackers from top brands.',
  cameras: 'Cameras and photo gear with transparent price comparison.',
  accessories: 'Cables, cases, chargers and more tech accessories.',
  'power-banks': 'Portable power banks for phones and laptops on the go.',
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { category } = await getProductsByCategorySlug(slug, 1);
  return {
    title: category ? `${category.name} · TechPick NG` : 'Category',
    description: category
      ? `Compare ${category.name} prices across Jumia, Temu and other stores in Nigeria.`
      : undefined,
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [{ category, products }, categories] = await Promise.all([
    getProductsByCategorySlug(slug),
    getCategories(),
  ]);

  if (!category) notFound();

  const icon = CATEGORY_ICONS[category.slug] || '📦';
  const blurb =
    CATEGORY_BLURBS[category.slug] ||
    `Find and compare the best ${category.name.toLowerCase()} available through partner stores.`;

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-surface-800/80 bg-gradient-to-br from-surface-950 via-surface-900 to-brand-950/40 light:border-slate-200 light:from-slate-50 light:via-white light:to-brand-50/60">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-brand-500/15 blur-3xl light:bg-brand-400/20" />
        <div className="pointer-events-none absolute bottom-0 left-1/4 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          <nav className="flex flex-wrap items-center gap-1.5 text-sm font-medium text-surface-400 light:text-slate-500">
            <Link href="/" className="hover:text-brand-400 light:hover:text-brand-600">
              Home
            </Link>
            <span className="opacity-50">/</span>
            <Link href="/search" className="hover:text-brand-400 light:hover:text-brand-600">
              Browse
            </Link>
            <span className="opacity-50">/</span>
            <span className="text-white light:text-slate-900">{category.name}</span>
          </nav>

          <div className="mt-4 flex flex-wrap items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-surface-800 text-3xl shadow-lg ring-1 ring-white/10 light:bg-white light:ring-slate-200 sm:h-16 sm:w-16 sm:text-4xl">
              {icon}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="font-display text-3xl font-bold tracking-tight text-white light:text-slate-900 sm:text-4xl">
                {category.name}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-surface-300 light:text-slate-600 sm:text-base">
                {blurb}
              </p>
              <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-surface-800/80 px-3 py-1 text-xs font-semibold text-surface-200 light:bg-slate-100 light:text-slate-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                {products.length} product{products.length === 1 ? '' : 's'} available
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Category switcher */}
        <div className="mb-6">
          <p className="mb-3 text-xs font-bold uppercase tracking-wide text-surface-400 light:text-slate-500">
            Switch category
          </p>
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 scrollbar-hide sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
            <Link
              href="/search"
              className="shrink-0 rounded-full border border-surface-600/80 bg-surface-800/80 px-4 py-2 text-sm font-semibold text-surface-200 transition hover:border-brand-500/40 light:border-slate-200 light:bg-white light:text-slate-700 light:hover:border-brand-300"
            >
              All
            </Link>
            {categories.map((c) => {
              const cIcon = CATEGORY_ICONS[c.slug] || '📦';
              const active = c.slug === slug;
              return (
                <Link
                  key={c.id}
                  href={`/categories/${c.slug}`}
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition ${
                    active
                      ? 'bg-brand-600 text-white shadow-md shadow-brand-600/25'
                      : 'border border-surface-600/80 bg-surface-800/80 text-surface-200 hover:border-brand-500/40 light:border-slate-200 light:bg-white light:text-slate-700 light:hover:border-brand-300'
                  }`}
                >
                  <span className="text-base leading-none" aria-hidden>
                    {cIcon}
                  </span>
                  {c.name}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Grid */}
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-surface-600 bg-surface-900/40 px-6 py-16 text-center light:border-slate-300 light:bg-slate-50">
            <div className="text-4xl">{icon}</div>
            <h3 className="mt-4 text-lg font-bold text-white light:text-slate-900">
              No products in {category.name} yet
            </h3>
            <p className="mt-2 max-w-sm text-sm text-surface-400 light:text-slate-500">
              We're adding more deals soon. Browse other categories in the meantime.
            </p>
            <Link
              href="/search"
              className="mt-6 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-bold text-white shadow-md hover:bg-brand-500"
            >
              Browse all products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
