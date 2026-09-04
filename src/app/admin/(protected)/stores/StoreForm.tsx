'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { createStore, updateStore, type StoreFormState } from './actions';

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-500 disabled:opacity-50"
    >
      {pending ? 'Saving…' : label}
    </button>
  );
}

type Store = {
  id: string;
  name: string;
  slug: string;
  website_url: string | null;
  logo_url: string | null;
  country_code: string | null;
  status: string;
};

export function AddStoreForm() {
  const [state, action] = useFormState(createStore, {} as StoreFormState);

  return (
    <form action={action} className="rounded-xl border border-surface-700 bg-surface-900 p-5">
      <h2 className="text-lg font-bold text-white">Add a store</h2>
      <p className="mt-1 text-xs text-surface-400">
        e.g. Jumia, Amazon, Temu, Konga — each store keeps its own prices & discounts on products.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="text-surface-300">Store name *</span>
          <input
            name="name"
            required
            placeholder="Jumia"
            className="mt-1 w-full rounded-lg border border-surface-700 bg-surface-950 px-3 py-2 text-white"
          />
        </label>
        <label className="block text-sm">
          <span className="text-surface-300">Slug (optional)</span>
          <input
            name="slug"
            placeholder="jumia"
            className="mt-1 w-full rounded-lg border border-surface-700 bg-surface-950 px-3 py-2 text-white"
          />
        </label>
        <label className="block text-sm sm:col-span-2">
          <span className="text-surface-300">Website URL</span>
          <input
            name="website_url"
            type="url"
            placeholder="https://www.jumia.com.ng"
            className="mt-1 w-full rounded-lg border border-surface-700 bg-surface-950 px-3 py-2 text-white"
          />
        </label>
        <label className="block text-sm sm:col-span-2">
          <span className="text-surface-300">Logo image URL (optional)</span>
          <input
            name="logo_url"
            type="url"
            placeholder="https://…"
            className="mt-1 w-full rounded-lg border border-surface-700 bg-surface-950 px-3 py-2 text-white"
          />
        </label>
        <label className="block text-sm">
          <span className="text-surface-300">Country</span>
          <input
            name="country_code"
            defaultValue="NG"
            maxLength={4}
            className="mt-1 w-full rounded-lg border border-surface-700 bg-surface-950 px-3 py-2 text-white"
          />
        </label>
        <label className="block text-sm">
          <span className="text-surface-300">Status</span>
          <select
            name="status"
            defaultValue="active"
            className="mt-1 w-full rounded-lg border border-surface-700 bg-surface-950 px-3 py-2 text-white"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </label>
      </div>

      {state?.error && <p className="mt-3 text-sm text-red-400">{state.error}</p>}
      {state?.success && <p className="mt-3 text-sm text-emerald-400">{state.success}</p>}

      <div className="mt-4">
        <Submit label="Add store" />
      </div>
    </form>
  );
}

export function EditStoreForm({ store }: { store: Store }) {
  const [state, action] = useFormState(updateStore, {} as StoreFormState);

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="id" value={store.id} />
      <label className="block text-sm">
        <span className="text-surface-400">Name</span>
        <input
          name="name"
          defaultValue={store.name}
          required
          className="mt-1 w-full rounded-lg border border-surface-700 bg-surface-950 px-3 py-2 text-sm text-white"
        />
      </label>
      <label className="block text-sm">
        <span className="text-surface-400">Slug</span>
        <input
          name="slug"
          defaultValue={store.slug}
          required
          className="mt-1 w-full rounded-lg border border-surface-700 bg-surface-950 px-3 py-2 text-sm text-white"
        />
      </label>
      <label className="block text-sm">
        <span className="text-surface-400">Website</span>
        <input
          name="website_url"
          defaultValue={store.website_url || ''}
          className="mt-1 w-full rounded-lg border border-surface-700 bg-surface-950 px-3 py-2 text-sm text-white"
        />
      </label>
      <label className="block text-sm">
        <span className="text-surface-400">Logo URL</span>
        <input
          name="logo_url"
          defaultValue={store.logo_url || ''}
          className="mt-1 w-full rounded-lg border border-surface-700 bg-surface-950 px-3 py-2 text-sm text-white"
        />
      </label>
      <div className="grid grid-cols-2 gap-2">
        <label className="block text-sm">
          <span className="text-surface-400">Country</span>
          <input
            name="country_code"
            defaultValue={store.country_code || 'NG'}
            className="mt-1 w-full rounded-lg border border-surface-700 bg-surface-950 px-3 py-2 text-sm text-white"
          />
        </label>
        <label className="block text-sm">
          <span className="text-surface-400">Status</span>
          <select
            name="status"
            defaultValue={store.status}
            className="mt-1 w-full rounded-lg border border-surface-700 bg-surface-950 px-3 py-2 text-sm text-white"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </label>
      </div>
      {state?.error && <p className="text-xs text-red-400">{state.error}</p>}
      {state?.success && <p className="text-xs text-emerald-400">{state.success}</p>}
      <Submit label="Save changes" />
    </form>
  );
}
