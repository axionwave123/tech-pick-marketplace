import { getProductsByCategorySlug } from '@/lib/data/products';
import { ProductCard } from '@/components/products/ProductCard';
import { notFound } from 'next/navigation';

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
      <nav className="text-sm text-surface-500">
        <span>Home</span> <span className="mx-1">/</span> <span className="text-surface-900">{category.name}</span>
      </nav>
      <h1 className="mt-2 text-3xl font-bold text-surface-900">{category.name}</h1>
      <p className="mt-1 text-surface-600">
        Find and compare the best {category.name.toLowerCase()} available through partner stores.
      </p>
      <p className="mt-2 text-sm text-surface-500">{products.length} products</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="rounded-2xl border border-surface-200 bg-white p-4">
          <h2 className="text-sm font-semibold">Filter</h2>
          <p className="mt-2 text-xs text-surface-500">Price, brand, RAM, storage — extend with URL params.</p>
        </aside>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
          {products.length === 0 && (
            <p className="col-span-full text-surface-500">No published products in this category yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
