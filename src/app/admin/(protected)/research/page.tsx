import { requireAdmin } from '@/lib/auth/admin';
import { redirect } from 'next/navigation';

export default async function AIResearchPage() {
  const auth = await requireAdmin();
  if (!auth.authorized) redirect('/admin/login');

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">AI Research</h1>
      <p className="mt-2 max-w-2xl text-sm text-surface-400">
        Pipeline: approved source → retrieval → extraction → attribution → admin approval → database. Never auto-publish.
      </p>
      <div className="mt-6 rounded-xl border border-surface-800 bg-surface-900 p-6">
        <label className="block text-sm text-surface-300">
          Product name to research
          <input className="mt-1 w-full max-w-md rounded-lg border border-surface-700 bg-surface-950 px-3 py-2 text-white" placeholder="Samsung Galaxy A26" />
        </label>
        <button type="button" className="mt-4 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white">Run research</button>
        <div className="mt-8 space-y-4 border-t border-surface-800 pt-6">
          <h2 className="font-semibold text-white">Results workspace</h2>
          <p className="text-sm text-surface-400">
            Extracted fields with source, confidence, conflicts. Actions: Approve · Edit · Reject · Save draft.
          </p>
          <div className="rounded-lg border border-dashed border-surface-700 p-6 text-center text-sm text-surface-500">
            Implement providers in <code className="text-surface-300">src/lib/ai/provider.ts</code>
          </div>
        </div>
      </div>
    </div>
  );
}
