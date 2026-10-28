import { ImportClient } from './ImportClient';

export const metadata = {
  title: 'Import assistant · Admin',
};

export default function ImportPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-400">
          Product pipeline
        </p>
        <h1 className="mt-1 font-display text-2xl font-bold text-white light:text-slate-900">
          Import assistant
        </h1>
        <p className="mt-2 text-sm text-surface-300 light:text-slate-600">
          <strong>Phase 1:</strong> Jumia XML creates products + Jumia prices.{' '}
          <strong>Phase 2:</strong> Amazon / Temu / Konga CSV matches by name and attaches store
          offers under the same product.
        </p>
      </div>
      <ImportClient />
    </div>
  );
}
