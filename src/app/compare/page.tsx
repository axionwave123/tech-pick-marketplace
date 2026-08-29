import Link from 'next/link';

export const metadata = { title: 'Compare Products' };

export default function ComparePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-bold text-white light:text-slate-900">
        Product Comparison
      </h1>
      <p className="mt-2 max-w-2xl text-base font-medium text-surface-200 light:text-slate-600">
        Compare price, display, RAM, storage, battery, camera, processor and other category-specific
        fields. Select products from product pages (“Add to compare”) or open with query params.
      </p>
      <div className="mt-10 rounded-2xl border border-dashed border-surface-600 bg-surface-900/60 p-12 text-center light:border-slate-300 light:bg-slate-100">
        <p className="font-medium text-surface-200 light:text-slate-700">
          Comparison table UI is scaffolded for multi-product selection.
        </p>
        <p className="mt-2 text-sm text-surface-400 light:text-slate-500">
          Use seed products from{' '}
          <Link
            href="/categories/smartphones"
            className="font-semibold text-brand-300 hover:underline light:text-brand-600"
          >
            Smartphones
          </Link>{' '}
          and extend client state / URL `ids` parsing as you grow.
        </p>
      </div>
    </div>
  );
}
