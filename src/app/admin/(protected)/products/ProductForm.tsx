'use client';

import { useState, useTransition } from 'react';
import { createClient } from '@/lib/supabase/client';
import { createProduct, updateProduct, type ProductFormState } from './actions';

type Option = { id: string; name: string };

export type ProductEditValues = {
  id: string;
  name: string;
  slug: string;
  status: string;
  short_description: string;
  brand_id: string;
  category_id: string;
  image_url: string;
  store_id: string;
  price: string;
  original_price: string;
  product_url: string;
  offer_id: string;
};

export function ProductForm({
  brands,
  categories,
  stores,
  initial,
}: {
  brands: Option[];
  categories: Option[];
  stores: Option[];
  initial?: ProductEditValues;
}) {
  const isEdit = Boolean(initial?.id);
  const [state, setState] = useState<ProductFormState>({});
  const [imageUrl, setImageUrl] = useState(initial?.image_url || '');
  const [uploading, setUploading] = useState(false);
  const [pending, startTransition] = useTransition();

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setState({ error: 'Image must be under 5MB.' });
      return;
    }
    setUploading(true);
    setState({});
    try {
      const supabase = createClient();
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from('product-images').upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });
      if (error) {
        setState({ error: `Upload failed: ${error.message}` });
        setUploading(false);
        return;
      }
      const { data } = supabase.storage.from('product-images').getPublicUrl(path);
      setImageUrl(data.publicUrl);
    } catch (err) {
      setState({ error: err instanceof Error ? err.message : 'Upload failed' });
    }
    setUploading(false);
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (imageUrl) fd.set('image_url', imageUrl);
    startTransition(async () => {
      const result = isEdit ? await updateProduct({}, fd) : await createProduct({}, fd);
      if (result?.error) setState(result);
      else if (result?.success) setState(result);
    });
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mt-6 grid max-w-2xl gap-4 rounded-xl border border-surface-800 bg-surface-900 p-6"
    >
      {isEdit && <input type="hidden" name="id" value={initial!.id} />}
      {isEdit && initial?.offer_id && <input type="hidden" name="offer_id" value={initial.offer_id} />}

      {state.error && (
        <p className="rounded-lg border border-red-800 bg-red-950/50 px-3 py-2 text-sm text-red-300">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="rounded-lg border border-emerald-800 bg-emerald-950/40 px-3 py-2 text-sm text-emerald-200">
          {state.success}
        </p>
      )}

      <label className="block text-sm text-surface-300">
        Product name *
        <input
          name="name"
          required
          defaultValue={initial?.name}
          className="mt-1 w-full rounded-lg border border-surface-700 bg-surface-950 px-3 py-2 text-white"
          placeholder="Samsung Galaxy A26"
        />
      </label>

      <label className="block text-sm text-surface-300">
        Slug (optional — auto from name)
        <input
          name="slug"
          defaultValue={initial?.slug}
          className="mt-1 w-full rounded-lg border border-surface-700 bg-surface-950 px-3 py-2 text-white"
          placeholder="samsung-galaxy-a26"
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm text-surface-300">
          Brand
          <select
            name="brand_id"
            defaultValue={initial?.brand_id || ''}
            className="mt-1 w-full rounded-lg border border-surface-700 bg-surface-950 px-3 py-2 text-white"
          >
            <option value="">— None —</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm text-surface-300">
          Category
          <select
            name="category_id"
            defaultValue={initial?.category_id || ''}
            className="mt-1 w-full rounded-lg border border-surface-700 bg-surface-950 px-3 py-2 text-white"
          >
            <option value="">— None —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block text-sm text-surface-300">
        Short description
        <textarea
          name="short_description"
          rows={3}
          defaultValue={initial?.short_description}
          className="mt-1 w-full rounded-lg border border-surface-700 bg-surface-950 px-3 py-2 text-white"
          placeholder="Mid-range phone with AMOLED display…"
        />
      </label>

      <label className="block text-sm text-surface-300">
        Status
        <select
          name="status"
          defaultValue={initial?.status || 'published'}
          className="mt-1 w-full rounded-lg border border-surface-700 bg-surface-950 px-3 py-2 text-white"
        >
          <option value="draft">Draft</option>
          <option value="published">Published (shows on site)</option>
          <option value="archived">Archived</option>
        </select>
      </label>

      <div className="rounded-lg border border-surface-700 bg-surface-950 p-4">
        <p className="text-sm font-semibold text-white">Product image</p>
        <p className="mt-1 text-xs text-surface-400">Upload a file (max 5MB) or paste an image URL.</p>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={onFileChange}
          className="mt-3 block w-full text-sm text-surface-300 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-600 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white"
        />
        {uploading && <p className="mt-2 text-xs text-brand-400">Uploading…</p>}
        <label className="mt-3 block text-sm text-surface-300">
          Or image URL
          <input
            name="image_url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="mt-1 w-full rounded-lg border border-surface-700 bg-surface-900 px-3 py-2 text-white"
            placeholder="https://…"
          />
        </label>
        {imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt="Preview" className="mt-3 h-32 w-32 rounded-lg object-contain bg-white" />
        )}
      </div>

      <div className="rounded-lg border border-surface-700 bg-surface-950 p-4">
        <p className="text-sm font-semibold text-white">Price / offer (View deal link)</p>
        <p className="mt-1 text-xs text-surface-400">
          Paste the real Jumia/Amazon product link. If empty, we use a Jumia search for the product name so
          View deal still works.
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="block text-sm text-surface-300">
            Store
            <select
              name="store_id"
              defaultValue={initial?.store_id || ''}
              className="mt-1 w-full rounded-lg border border-surface-700 bg-surface-900 px-3 py-2 text-white"
            >
              <option value="">— Skip price —</option>
              {stores.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm text-surface-300">
            Current price (₦)
            <input
              name="price"
              type="number"
              min="0"
              step="1"
              defaultValue={initial?.price}
              className="mt-1 w-full rounded-lg border border-surface-700 bg-surface-900 px-3 py-2 text-white"
              placeholder="238000"
            />
          </label>
          <label className="block text-sm text-surface-300">
            Original price (₦) for discount badge
            <input
              name="original_price"
              type="number"
              min="0"
              step="1"
              defaultValue={initial?.original_price}
              className="mt-1 w-full rounded-lg border border-surface-700 bg-surface-900 px-3 py-2 text-white"
              placeholder="265000"
            />
          </label>
          <label className="block text-sm text-surface-300">
            Retailer product link (View deal)
            <input
              name="product_url"
              type="url"
              defaultValue={initial?.product_url}
              className="mt-1 w-full rounded-lg border border-surface-700 bg-surface-900 px-3 py-2 text-white"
              placeholder="https://www.jumia.com.ng/..."
            />
          </label>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 pt-2">
        <button
          type="submit"
          disabled={pending || uploading}
          className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-500 disabled:opacity-50"
        >
          {pending ? 'Saving…' : isEdit ? 'Save changes' : 'Save product'}
        </button>
      </div>
    </form>
  );
}
