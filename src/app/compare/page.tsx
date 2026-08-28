import Link from 'next/link';

export const metadata = { title: 'Compare Products' };

export default function ComparePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-surface-900">Product Comparison</h1>
      <p className="mt-2 max-w-2xl text-surface-600">
        Compare price, display, RAM, storage, battery, camera, processor and other category-specific fields.
        Select products from product pages (“Add to compare”) or open with query params.
      </p>
      <div className="mt-10 rounded-2xl border border-dashed border-surface-300 bg-surface-50 p-12 text-center">
        <p className="text-surface-600">Comparison table UI is scaffolded for multi-product selection.</p>
        <p className="mt-2 text-sm text-surface-500">
          Use seed products from{' '}
          <Link href="/categories/smartphones" className="text-brand-600 hover:underline">
            Smartphones
          </Link>{' '}
          and extend client state / URL `ids` parsing as you grow.
        </p>
      </div>
    </div>
  );
}
