import { requireAdmin } from '@/lib/auth/admin';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { formatNaira, relativeTime } from '@/lib/utils';

type OfferRow = {
  id: string;
  price: number;
  original_price: number | null;
  discount_percent: number | null;
  availability: string | null;
  last_checked_at: string | null;
  status: string | null;
  products: { id: string; name: string; slug: string } | null;
  stores: { id: string; name: string; logo_url: string | null } | null;
};

type ProductGroup = {
  productId: string;
  productName: string;
  productSlug: string;
  offers: OfferRow[];
};

export default async function AdminOffersPage() {
  const auth = await requireAdmin();
  if (!auth.authorized) redirect('/admin/login');

  const supabase = await createClient();
  const { data } = await supabase
    .from('product_offers')
    .select(
      'id, price, original_price, discount_percent, availability, last_checked_at, status, products(id, name, slug), stores(id, name, logo_url)'
    )
    .eq('status', 'active')
    .order('price', { ascending: true })
    .limit(500);

  const rows = (data || []) as unknown as OfferRow[];

  // Group by product — any store added shows under its product automatically
  const groupMap = new Map<string, ProductGroup>();
  for (const o of rows) {
    const pid = o.products?.id || 'unknown';
    const pname = o.products?.name || 'Unknown product';
    const pslug = o.products?.slug || '';
    if (!groupMap.has(pid)) {
      groupMap.set(pid, {
        productId: pid,
        productName: pname,
        productSlug: pslug,
        offers: [],
      });
    }
    groupMap.get(pid)!.offers.push(o);
  }

  // Sort products by name; offers already price-sorted from query
  const groups = Array.from(groupMap.values()).sort((a, b) =>
    a.productName.localeCompare(b.productName, 'en')
  );

  for (const g of groups) {
    g.offers.sort((a, b) => a.price - b.price);
  }

  const totalOffers = rows.length;
  const totalProducts = groups.length;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">See prices</h1>
          <p className="mt-1 text-sm text-surface-400">
            Prices by product and store — same layout for every store you add.
          </p>
        </div>
        <p className="text-xs font-medium text-surface-500">
          {totalProducts} product{totalProducts === 1 ? '' : 's'} · {totalOffers} active offer
          {totalOffers === 1 ? '' : 's'}
        </p>
      </div>

      {groups.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-surface-700 bg-surface-900/50 px-6 py-16 text-center text-sm text-surface-400">
          No active offers yet. Add store prices when editing a product.
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          {groups.map((group) => {
            const lowest = group.offers[0]?.price;
            return (
              <div
                key={group.productId}
                className="overflow-hidden rounded-xl border border-surface-800 bg-surface-900/40"
              >
                {/* Product header */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-surface-800 bg-surface-900 px-4 py-3">
                  <div className="min-w-0">
                    <h2 className="truncate text-sm font-bold text-white sm:text-base">
                      {group.productName}
                    </h2>
                    <p className="mt-0.5 text-[11px] text-surface-500">
                      {group.offers.length} store{group.offers.length === 1 ? '' : 's'}
                      {lowest != null && (
                        <>
                          {' '}
                          · best{' '}
                          <span className="font-semibold text-emerald-400">
                            {formatNaira(lowest)}
                          </span>
                        </>
                      )}
                    </p>
                  </div>
                  {group.productSlug && (
                    <div className="flex shrink-0 gap-2">
                      <Link
                        href={`/products/${group.productSlug}`}
                        className="rounded-lg border border-surface-700 px-2.5 py-1 text-[11px] font-semibold text-surface-300 hover:border-brand-500 hover:text-white"
                      >
                        View site
                      </Link>
                      <Link
                        href={`/admin/products/${group.productId}`}
                        className="rounded-lg bg-brand-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-brand-500"
                      >
                        Edit product
                      </Link>
                    </div>
                  )}
                </div>

                {/* Store rows — Store | Price | Discount | Last checked */}
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[560px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-surface-800 text-[11px] uppercase tracking-wide text-surface-500">
                        <th className="px-4 py-2.5 font-semibold">Store</th>
                        <th className="px-4 py-2.5 font-semibold">Price</th>
                        <th className="px-4 py-2.5 font-semibold">Discount</th>
                        <th className="px-4 py-2.5 font-semibold">Last checked</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-800/80">
                      {group.offers.map((o, idx) => {
                        const isBest = o.price === lowest;
                        const storeName = o.stores?.name || 'Store';
                        const discount =
                          o.discount_percent != null
                            ? `${o.discount_percent}%`
                            : o.original_price != null && o.original_price > o.price
                              ? `${Math.round(((o.original_price - o.price) / o.original_price) * 100)}%`
                              : '—';
                        return (
                          <tr
                            key={o.id}
                            className={
                              isBest
                                ? 'bg-emerald-950/25'
                                : idx % 2 === 1
                                  ? 'bg-surface-950/40'
                                  : ''
                            }
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2.5">
                                {o.stores?.logo_url ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={o.stores.logo_url}
                                    alt=""
                                    className="h-7 w-7 rounded-md border border-surface-700 bg-white object-contain p-0.5"
                                  />
                                ) : (
                                  <span className="flex h-7 w-7 items-center justify-center rounded-md border border-surface-700 bg-surface-800 text-[10px] font-bold text-surface-400">
                                    {storeName.slice(0, 2).toUpperCase()}
                                  </span>
                                )}
                                <span className="font-semibold text-white">{storeName}</span>
                                {isBest && (
                                  <span className="rounded bg-emerald-600 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
                                    Best
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={
                                  isBest
                                    ? 'font-bold text-emerald-300'
                                    : 'font-semibold text-white'
                                }
                              >
                                {formatNaira(o.price)}
                              </span>
                              {o.original_price != null && o.original_price > o.price && (
                                <span className="ml-2 text-xs text-surface-500 line-through">
                                  {formatNaira(o.original_price)}
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {discount !== '—' ? (
                                <span className="font-semibold text-red-400">{discount}</span>
                              ) : (
                                <span className="text-surface-500">—</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-surface-400">
                              {relativeTime(o.last_checked_at)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
