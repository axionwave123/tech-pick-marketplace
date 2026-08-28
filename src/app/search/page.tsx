import { searchProducts } from '@/lib/data/products';
import { ProductCard } from '@/components/products/ProductCard';

export const metadata = { title: 'Search' };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q || '').trim();
  const products = query ? await searchProducts(query) : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-surface-900">
        {query ? (
          <>
            Search results for <span className="text-brand-600">“{query}”</span>
          </>
        ) : (
          'Search products'
        )}
      </h1>
      {query && (
        <p className="mt-1 text-sm text-surface-500">{products.length} results found</p>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="hidden rounded-2xl border border-surface-200 bg-white p-4 lg:block">
          <h2 className="text-sm font-semibold text-surface-900">Filters</h2>
          <p className="mt-2 text-xs text-surface-500">
            Category, price range, brand, rating, RAM, storage — wire to query params as you scale.
          </p>
        </aside>

        <div>
          {!query && (
            <p className="text-surface-600">Enter a search term to find products.</p>
          )}
          {query && products.length === 0 && (
            <p className="text-surface-600">No products matched. Try another keyword or connect seed data.</p>
          )}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
