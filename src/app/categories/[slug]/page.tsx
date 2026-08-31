import { getProductsByCategorySlug } from '@/lib/data/products';
import { ProductCard } from '@/components/products/ProductCard';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { category } = await getProductsByCategorySlug(slug, 1);
  return { title: category?.name || 'Category' };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { category, products } = await getProductsByCategorySlug(slug);

  if (!category) notFound();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <nav className="text-sm font-medium text-surface-300 light:text-slate-600">
        <Link href="/" className="hover:text-brand-400 light:hover:text-brand-600">
          Home
        </Link>
        <span className="mx-1 opacity-60">/</span>
        <span className="text-white light:text-slate-900">{category.name}</span>
      </nav>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-white light:text-slate-900">
        {category.name}
      </h1>
      <p className="mt-2 max-w-2xl text-base font-medium text-surface-200 light:text-slate-700">
        Find and compare the best {category.name.toLowerCase()} available through partner stores.
      </p>
      <p className="mt-2 text-sm font-semibold text-surface-300 light:text-slate-600">
        {products.length} products
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="rounded-2xl border border-surface-600 bg-surface-900 p-4 light:border-slate-200 light:bg-white">
          <h2 className="text-sm font-bold text-white light:text-slate-900">Filter</h2>
          <p className="mt-2 text-xs font-medium text-surface-300 light:text-slate-600">
            Price, brand, RAM, storage — extend with URL params.
          </p>
        </aside>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
          {products.length === 0 && (
            <p className="col-span-full font-medium text-surface-300 light:text-slate-600">
              No published products in this category yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
