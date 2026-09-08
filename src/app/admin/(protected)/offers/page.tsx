import { requireAdmin } from '@/lib/auth/admin';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import {
  OffersPriceEditor,
  type EditorProduct,
  type EditorOffer,
} from './OffersPriceEditor';

export default async function AdminOffersPage() {
  const auth = await requireAdmin();
  if (!auth.authorized) redirect('/admin/login');

  const supabase = await createClient();

  // Published + drafts (needs update) so you can edit prices for both
  const { data: products } = await supabase
    .from('products')
    .select(
      `
      id,
      name,
      slug,
      status,
      product_offers (
        id,
        price,
        original_price,
        availability,
        last_checked_at,
        product_url,
        status,
        store_id,
        stores ( id, name )
      )
    `
    )
    .in('status', ['published', 'draft'])
    .order('name', { ascending: true })
    .limit(300);

  const editorProducts: EditorProduct[] = (products || [])
    .map((p) => {
      const rawOffers = (p.product_offers || []) as unknown as {
        id: string;
        price: number;
        original_price: number | null;
        availability: string | null;
        last_checked_at: string | null;
        product_url: string | null;
        status: string | null;
        store_id: string;
        stores: { id: string; name: string } | { id: string; name: string }[] | null;
      }[];

      const offers: EditorOffer[] = rawOffers
        .filter((o) => o.status === 'active' || o.status == null)
        .map((o) => {
          const store = Array.isArray(o.stores) ? o.stores[0] : o.stores;
          return {
            id: o.id,
            price: Number(o.price) || 0,
            original_price: o.original_price != null ? Number(o.original_price) : null,
            availability: o.availability,
            last_checked_at: o.last_checked_at,
            product_url: o.product_url,
            store_id: o.store_id,
            store_name: store?.name || 'Store',
          };
        })
        .sort((a, b) => a.price - b.price);

      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        status: p.status || 'draft',
        offers,
      };
    })
    .filter((p) => p.offers.length > 0);

  const totalOffers = editorProducts.reduce((n, p) => n + p.offers.length, 0);
  const publishedCount = editorProducts.filter((p) => p.status === 'published').length;
  const draftCount = editorProducts.filter((p) => p.status === 'draft').length;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">See prices</h1>
          <p className="mt-1 text-sm text-surface-400">
            View and update each store’s price for published products and drafts that need update.
          </p>
        </div>
        <p className="text-xs font-medium text-surface-500">
          {editorProducts.length} product{editorProducts.length === 1 ? '' : 's'} · {totalOffers}{' '}
          offer{totalOffers === 1 ? '' : 's'}
          {publishedCount || draftCount
            ? ` · ${publishedCount} published · ${draftCount} draft`
            : ''}
        </p>
      </div>

      <OffersPriceEditor products={editorProducts} />
    </div>
  );
}
