'use client';

import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  type ArticleBlock,
  type ArticleProductBlock,
  type ButtonPosition,
  type ImageSize,
  BUTTON_POSITION_CLASS,
  IMAGE_SIZE_CLASS,
  newId,
} from '@/lib/article-blocks';

type ProductHit = {
  id: string;
  name: string;
  slug: string;
  status: string;
  imageUrl: string | null;
};

const POSITIONS: { id: ButtonPosition; label: string }[] = [
  { id: 'top-left', label: 'Top left' },
  { id: 'top-right', label: 'Top right' },
  { id: 'center', label: 'Center' },
  { id: 'bottom-left', label: 'Bottom left' },
  { id: 'bottom-center', label: 'Bottom center' },
  { id: 'bottom-right', label: 'Bottom right' },
];

const SIZES: { id: ImageSize; label: string }[] = [
  { id: 'sm', label: 'Small' },
  { id: 'md', label: 'Medium' },
  { id: 'lg', label: 'Large' },
  { id: 'full', label: 'Full width' },
];

export function ArticleBlockEditor({
  value,
  onChange,
}: {
  value: ArticleBlock[];
  onChange: (blocks: ArticleBlock[]) => void;
}) {
  const update = useCallback(
    (id: string, patch: Partial<ArticleBlock>) => {
      onChange(value.map((b) => (b.id === id ? ({ ...b, ...patch } as ArticleBlock) : b)));
    },
    [onChange, value]
  );

  const remove = (id: string) => onChange(value.filter((b) => b.id !== id));

  const move = (id: string, dir: -1 | 1) => {
    const i = value.findIndex((b) => b.id === id);
    if (i < 0) return;
    const j = i + dir;
    if (j < 0 || j >= value.length) return;
    const next = [...value];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  const addText = () => onChange([...value, { id: newId(), type: 'text', text: '' }]);

  const addProduct = () =>
    onChange([
      ...value,
      {
        id: newId(),
        type: 'product_embed',
        productId: '',
        productSlug: '',
        productName: '',
        productStatus: 'missing',
        imageUrl: '',
        size: 'md',
        buttonPosition: 'bottom-center',
        buttonLabel: 'View deal',
      },
    ]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-bold text-white">Article body</p>
          <p className="text-xs text-surface-400">
            Add text and product images with a View deal button that links to the product page.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={addText} className="rounded-lg border border-surface-600 bg-surface-950 px-3 py-2 text-xs font-bold text-surface-200 hover:border-brand-500 hover:text-white">
            + Text
          </button>
          <button type="button" onClick={addProduct} className="rounded-lg bg-brand-600 px-3 py-2 text-xs font-bold text-white hover:bg-brand-500">
            + Product image
          </button>
        </div>
      </div>

      {value.length === 0 && (
        <p className="rounded-xl border border-dashed border-surface-600 px-4 py-8 text-center text-sm text-surface-500">
          No blocks yet. Add text or a product image.
        </p>
      )}

      <div className="space-y-4">
        {value.map((block, index) => (
          <div key={block.id} className="rounded-2xl border border-surface-700 bg-surface-950/80 p-3 sm:p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <span className="rounded-full bg-surface-800 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-surface-300">
                {block.type === 'text' ? 'Text' : 'Product image'} - {index + 1}
              </span>
              <div className="flex flex-wrap gap-1">
                <button type="button" onClick={() => move(block.id, -1)} disabled={index === 0} className="rounded-lg border border-surface-700 px-2 py-1 text-[11px] font-semibold text-surface-300 disabled:opacity-30">Up</button>
                <button type="button" onClick={() => move(block.id, 1)} disabled={index === value.length - 1} className="rounded-lg border border-surface-700 px-2 py-1 text-[11px] font-semibold text-surface-300 disabled:opacity-30">Down</button>
                <button type="button" onClick={() => remove(block.id)} className="rounded-lg border border-red-800/50 px-2 py-1 text-[11px] font-semibold text-red-400">Remove</button>
              </div>
            </div>

            {block.type === 'text' ? (
              <textarea
                value={block.text}
                onChange={(e) => update(block.id, { text: e.target.value })}
                rows={5}
                className="w-full rounded-xl border border-surface-700 bg-surface-900 px-3 py-2 text-sm leading-relaxed text-white placeholder:text-surface-500"
                placeholder="Write a paragraph..."
              />
            ) : (
              <ProductEmbedEditor block={block} onChange={(patch) => update(block.id, patch)} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ProductEmbedEditor({
  block,
  onChange,
}: {
  block: ArticleProductBlock;
  onChange: (patch: Partial<ArticleProductBlock>) => void;
}) {
  const [query, setQuery] = useState(block.productName || '');
  const [hits, setHits] = useState<ProductHit[]>([]);
  const [searching, setSearching] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setHits([]);
      return;
    }
    let cancelled = false;
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from('products')
          .select('id, name, slug, status, product_images(url, is_primary, sort_order)')
          .ilike('name', `%${query.trim()}%`)
          .order('name')
          .limit(8);
        if (cancelled) return;
        const mapped: ProductHit[] = (data || []).map((p: {
          id: string;
          name: string;
          slug: string;
          status: string;
          product_images?: { url: string; is_primary?: boolean; sort_order?: number }[];
        }) => {
          const imgs = p.product_images || [];
          const primary =
            imgs.find((i) => i.is_primary)?.url ||
            imgs.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))[0]?.url ||
            null;
          return { id: p.id, name: p.name, slug: p.slug, status: p.status, imageUrl: primary };
        });
        setHits(mapped);
        setOpen(true);
      } catch {
        if (!cancelled) setHits([]);
      }
      if (!cancelled) setSearching(false);
    }, 280);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [query]);

  function pickProduct(p: ProductHit) {
    onChange({
      productId: p.id,
      productSlug: p.slug,
      productName: p.name,
      productStatus:
        p.status === 'published' || p.status === 'draft' || p.status === 'archived'
          ? p.status
          : 'missing',
      imageUrl: block.imageUrl || p.imageUrl || '',
    });
    setQuery(p.name);
    setOpen(false);
  }

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return;
    setUploading(true);
    try {
      const supabase = createClient();
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `articles/embeds/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from('product-images').upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });
      if (!error) {
        const { data } = supabase.storage.from('product-images').getPublicUrl(path);
        onChange({ imageUrl: data.publicUrl });
      }
    } catch {
      /* ignore */
    }
    setUploading(false);
  }

  const statusOk = block.productStatus === 'published' && block.productSlug;
  const statusLabel =
    block.productStatus === 'published'
      ? 'Published - link ready'
      : block.productStatus === 'draft'
        ? 'Draft - publish product first'
        : block.productStatus === 'archived'
          ? 'Archived - not public'
          : block.productId
            ? 'Unknown status'
            : 'No product selected';

  return (
    <div className="space-y-4">
      <div className="relative">
        <label className="block text-xs font-semibold text-surface-400">Product name (search catalog)</label>
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!e.target.value.trim()) {
              onChange({ productId: '', productSlug: '', productName: '', productStatus: 'missing' });
            }
          }}
          onFocus={() => hits.length > 0 && setOpen(true)}
          className="mt-1 w-full rounded-xl border border-surface-700 bg-surface-900 px-3 py-2.5 text-sm text-white"
          placeholder="Type product name..."
          autoComplete="off"
        />
        {searching && <p className="mt-1 text-[11px] text-surface-500">Searching...</p>}
        {open && hits.length > 0 && (
          <ul className="absolute z-30 mt-1 max-h-56 w-full overflow-y-auto rounded-xl border border-surface-600 bg-surface-900 shadow-xl">
            {hits.map((p) => (
              <li key={p.id}>
                <button type="button" onClick={() => pickProduct(p)} className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-surface-800">
                  {p.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.imageUrl} alt="" className="h-10 w-10 rounded-lg object-cover" />
                  ) : (
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-800 text-[10px] text-surface-500">-</span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-white">{p.name}</span>
                    <span className="text-[11px] text-surface-500">/{p.slug}</span>
                  </span>
                  <span className={p.status === 'published' ? 'shrink-0 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-400' : 'shrink-0 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-400'}>
                    {p.status}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className={statusOk ? 'rounded-xl border border-emerald-700/40 bg-emerald-950/30 px-3 py-2 text-xs font-semibold text-emerald-300' : 'rounded-xl border border-amber-700/40 bg-amber-950/30 px-3 py-2 text-xs font-semibold text-amber-300'}>
        {statusLabel}
        {statusOk && (
          <span className="mt-0.5 block font-normal text-emerald-400/80">View deal -&gt; /products/{block.productSlug}</span>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-semibold text-surface-400">Image</label>
          <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={onUpload} className="mt-1 block w-full text-xs text-surface-300 file:mr-2 file:rounded-lg file:border-0 file:bg-brand-600 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-white" />
          {uploading && <p className="mt-1 text-[11px] text-brand-400">Uploading...</p>}
          <input value={block.imageUrl} onChange={(e) => onChange({ imageUrl: e.target.value })} className="mt-2 w-full rounded-lg border border-surface-700 bg-surface-900 px-2 py-1.5 text-xs text-white" placeholder="Or paste image URL" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-surface-400">Button label</label>
          <input value={block.buttonLabel} onChange={(e) => onChange({ buttonLabel: e.target.value })} className="mt-1 w-full rounded-xl border border-surface-700 bg-surface-900 px-3 py-2 text-sm text-white" placeholder="View deal" />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <p className="mb-1.5 text-xs font-semibold text-surface-400">Image size</p>
          <div className="flex flex-wrap gap-1.5">
            {SIZES.map((s) => (
              <button key={s.id} type="button" onClick={() => onChange({ size: s.id })} className={block.size === s.id ? 'rounded-lg bg-brand-600 px-2.5 py-1.5 text-[11px] font-bold text-white' : 'rounded-lg border border-surface-700 px-2.5 py-1.5 text-[11px] font-semibold text-surface-300'}>
                {s.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-1.5 text-xs font-semibold text-surface-400">View deal position</p>
          <div className="grid grid-cols-3 gap-1.5">
            {POSITIONS.map((p) => (
              <button key={p.id} type="button" onClick={() => onChange({ buttonPosition: p.id })} className={block.buttonPosition === p.id ? 'rounded-lg bg-brand-600 px-1.5 py-1.5 text-[10px] font-bold text-white' : 'rounded-lg border border-surface-700 px-1.5 py-1.5 text-[10px] font-semibold text-surface-300'}>
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {block.imageUrl && (
        <div className={`${IMAGE_SIZE_CLASS[block.size]} relative overflow-hidden rounded-2xl border border-surface-700 bg-white`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={block.imageUrl} alt="" className="aspect-[4/3] w-full object-cover" />
          <span className={`absolute ${BUTTON_POSITION_CLASS[block.buttonPosition]} rounded-full bg-brand-600 px-3 py-1.5 text-[11px] font-bold text-white shadow-lg`}>
            {block.buttonLabel || 'View deal'}
          </span>
        </div>
      )}
    </div>
  );
}
