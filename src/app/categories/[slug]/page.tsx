import { getProductsByCategorySlug, getCategories } from '@/lib/data/products';
import { ProductCard } from '@/components/products/ProductCard';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

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
  const [{ category, products }, categories] = await Promise.all([
    getProductsByCategorySlug(slug),
    getCategories(),
  ]);

  if (!category) notFound();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <nav className="text-sm font-medium text-surface-300 light:text-slate-600">
        <Link href="/" className="hover:text-brand-400 light:hover:text-brand-600">
          Home
        </Link>
        <span className="mx-1 opacity-60">/</span>
        <Link href="/search" className="hover:text-brand-400 light:hover:text-brand-600">
          Categories
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

      <div className="mt-5 flex flex-wrap gap-2">
        <Link
          href="/search"
          className="rounded-full bg-surface-800 px-3 py-1.5 text-xs font-bold text-surface-200 hover:bg-surface-700 light:bg-slate-100 light:text-slate-700 sm:text-sm"
        >
          All
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/categories/${c.slug}`}
            className={`rounded-full px-3 py-1.5 text-xs font-bold sm:text-sm ${
              c.slug === slug
                ? 'bg-brand-600 text-white'
                : 'bg-surface-800 text-surface-200 hover:bg-surface-700 light:bg-slate-100 light:text-slate-700'
            }`}
          >
            {c.name}
          </Link>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
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
  );
}
