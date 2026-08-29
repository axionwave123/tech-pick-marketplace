import { getDeals } from '@/lib/data/products';
import { ProductCard } from '@/components/products/ProductCard';

export const metadata = { title: 'Deals & Discounts' };

export default async function DealsPage() {
  const deals = await getDeals(24);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-bold text-white light:text-slate-900">
        Hot Deals Today
      </h1>
      <p className="mt-2 text-base font-medium text-surface-200 light:text-slate-600">
        Offers with a lower current price vs listed original price in our data. Always verify on the
        retailer site.
      </p>
      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {deals.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
      {deals.length === 0 && (
        <p className="mt-8 text-base font-medium text-surface-300 light:text-slate-500">
          No active discounts in the current dataset.
        </p>
      )}
    </div>
  );
}
