'use client';

import { useState, useTransition } from 'react';
import { createClient } from '@/lib/supabase/client';
import { createProduct, updateProduct, type ProductFormState } from './actions';

type Option = { id: string; name: string };

export type OfferRow = {
  key: string;
  offer_id?: string;
  store_id: string;
  price: string;
  original_price: string;
  product_url: string;
};

export type ProductEditValues = {
  id: string;
  name: string;
  slug: string;
  status: string;
  short_description: string;
  brand_id: string;
  category_id: string;
  image_url: string;
  /** All store offers for this product */
  offers: OfferRow[];
};

function newOfferRow(partial?: Partial<OfferRow>): OfferRow {
  return {
    key: `new-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    offer_id: partial?.offer_id,
    store_id: partial?.store_id || '',
    price: partial?.price || '',
    original_price: partial?.original_price || '',
    product_url: partial?.product_url || '',
  };
}

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

  const [offers, setOffers] = useState<OfferRow[]>(() => {
    if (initial?.offers && initial.offers.length > 0) {
      return initial.offers.map((o) =>
        newOfferRow({
          offer_id: o.offer_id,
          store_id: o.store_id,
          price: o.price,
          original_price: o.original_price,
          product_url: o.product_url,
        })
      );
    }
    // Start with one empty row so user can fill Jumia first, then add more
    return [newOfferRow()];
  });

  function updateOffer(key: string, field: keyof OfferRow, value: string) {
    setOffers((prev) =>
      prev.map((o) => (o.key === key ? { ...o, [field]: value } : o))
    );
  }

  function addOffer() {
    setOffers((prev) => [...prev, newOfferRow()]);
  }

  function removeOffer(key: string) {
    setOffers((prev) => {
      if (prev.length <= 1) {
        // Keep at least one empty row
        return [newOfferRow()];
      }
      return prev.filter((o) => o.key !== key);
    });
  }

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

    // Serialize all offer rows for the server action
    const payload = offers
      .filter((o) => o.store_id && o.price && Number(o.price) > 0)
      .map((o) => ({
        offer_id: o.offer_id || null,
        store_id: o.store_id,
        price: o.price,
        original_price: o.original_price || null,
        product_url: o.product_url || null,
      }));
    fd.set('offers_json', JSON.stringify(payload));

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

      {/* ——— Multi-store price offers ——— */}
      <div className="rounded-lg border border-surface-700 bg-surface-950 p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-white">Price / offers (View deal links)</p>
            <p className="mt-1 text-xs text-surface-400">
              Add one row per store (Jumia, Amazon, Temu, Konga…). Each gets its own price, discount
              and affiliate link so shoppers can compare.
            </p>
          </div>
          <button
            type="button"
            onClick={addOffer}
            className="shrink-0 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-brand-500"
          >
            + Add store offer
          </button>
        </div>

        <div className="mt-4 space-y-4">
          {offers.map((row, idx) => (
            <div
              key={row.key}
              className="rounded-lg border border-surface-700 bg-surface-900 p-3"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-surface-400">
                  Store offer #{idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeOffer(row.key)}
                  className="text-xs font-medium text-red-400 hover:text-red-300"
                >
                  Remove
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-sm text-surface-300 sm:col-span-2">
                  Store
                  <select
                    value={row.store_id}
                    onChange={(e) => updateOffer(row.key, 'store_id', e.target.value)}
                    className="mt-1 w-full rounded-lg border border-surface-700 bg-surface-950 px-3 py-2 text-white"
                  >
                    <option value="">— Select store —</option>
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
                    type="number"
                    min="0"
                    step="1"
                    value={row.price}
                    onChange={(e) => updateOffer(row.key, 'price', e.target.value)}
                    className="mt-1 w-full rounded-lg border border-surface-700 bg-surface-950 px-3 py-2 text-white"
                    placeholder="238000"
                  />
                </label>

                <label className="block text-sm text-surface-300">
                  Original price (₦) for discount badge
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={row.original_price}
                    onChange={(e) => updateOffer(row.key, 'original_price', e.target.value)}
                    className="mt-1 w-full rounded-lg border border-surface-700 bg-surface-950 px-3 py-2 text-white"
                    placeholder="265000"
                  />
                </label>

                <label className="block text-sm text-surface-300 sm:col-span-2">
                  Retailer / affiliate product link (View deal)
                  <input
                    type="url"
                    value={row.product_url}
                    onChange={(e) => updateOffer(row.key, 'product_url', e.target.value)}
                    className="mt-1 w-full rounded-lg border border-surface-700 bg-surface-950 px-3 py-2 text-white"
                    placeholder="https://www.jumia.com.ng/... or Amazon / Temu link"
                  />
                </label>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addOffer}
          className="mt-4 w-full rounded-lg border border-dashed border-surface-600 py-2.5 text-sm font-semibold text-brand-400 hover:border-brand-500 hover:bg-surface-900"
        >
          + Add another store (Amazon, Temu, Konga…)
        </button>

        {stores.length === 0 && (
          <p className="mt-3 text-xs text-amber-400">
            No stores yet. Go to{' '}
            <a href="/admin/stores" className="underline">
              Admin → Stores
            </a>{' '}
            and add Jumia, Amazon, Temu first.
          </p>
        )}
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
