import { createServiceClient, createClient } from '@/lib/supabase/server';
import type { SupabaseClient } from '@supabase/supabase-js';

export type TrackResult = {
  offersChecked: number;
  pricesChanged: number;
  inventoryAlerts: number;
  errors: string[];
  summary: string;
};

const UA =
  'Mozilla/5.0 (compatible; TechPickNG-PriceBot/1.0; +https://tech-pick-marketplace-woad.vercel.app)';

function parseNairaPrices(text: string): number[] {
  const out: number[] = [];
  const re = /₦\s*([\d,]+(?:\.\d+)?)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const n = Number(m[1].replace(/,/g, ''));
    if (n >= 500 && n <= 50_000_000) out.push(Math.round(n));
  }
  const re2 = /(?:NGN|N)\s*([\d,]+)/gi;
  while ((m = re2.exec(text))) {
    const n = Number(m[1].replace(/,/g, ''));
    if (n >= 500 && n <= 50_000_000) out.push(Math.round(n));
  }
  return Array.from(new Set(out)).sort((a, b) => a - b);
}

function detectAvailability(html: string): string {
  const t = html.toLowerCase();
  if (
    /out of stock|currently unavailable|sold out|no longer available|item is unavailable/.test(t)
  ) {
    return 'out_of_stock';
  }
  if (/add to cart|buy now|in stock|add to bag|order now/.test(t)) {
    return 'in_stock';
  }
  return 'unknown';
}

async function fetchPage(url: string): Promise<string | null> {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 15000);
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: {
        'User-Agent': UA,
        Accept: 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-NG,en;q=0.9',
      },
      redirect: 'follow',
    });
    clearTimeout(t);
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

function pickPrice(prices: number[], previous: number | null): number | null {
  if (!prices.length) return null;
  if (previous && previous > 0) {
    const near = prices.filter((p) => p >= previous * 0.6 && p <= previous * 1.5);
    if (near.length) return near[0];
  }
  return prices[0];
}

async function resolveClient(client?: SupabaseClient): Promise<SupabaseClient> {
  if (client) return client;
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) return createServiceClient();
  try {
    return await createClient();
  } catch {
    return createServiceClient();
  }
}

/** Check active offers, log history, update price + availability */
export async function runDailyPriceTrack(
  limit = 40,
  client?: SupabaseClient
): Promise<TrackResult> {
  const supabase = await resolveClient(client);
  const errors: string[] = [];
  let offersChecked = 0;
  let pricesChanged = 0;
  let inventoryAlerts = 0;

  const { data: run, error: runErr } = await supabase
    .from('price_track_runs')
    .insert({ status: 'running' })
    .select('id')
    .single();

  if (runErr) {
    return {
      offersChecked: 0,
      pricesChanged: 0,
      inventoryAlerts: 0,
      errors: [runErr.message],
      summary: `Failed to start run: ${runErr.message}`,
    };
  }

  const { data: offers, error: offerErr } = await supabase
    .from('product_offers')
    .select(
      'id, product_id, store_id, price, original_price, availability, product_url, status, products(name, status)'
    )
    .eq('status', 'active')
    .not('product_url', 'is', null)
    .order('last_checked_at', { ascending: true, nullsFirst: true })
    .limit(limit);

  if (offerErr) {
    errors.push(offerErr.message);
  }

  for (const offer of offers || []) {
    const product = (offer as any).products;
    if (product?.status && product.status !== 'published' && product.status !== 'draft') {
      continue;
    }

    const url = String(offer.product_url || '').trim();
    if (!url.startsWith('http')) continue;

    offersChecked += 1;
    const html = await fetchPage(url);

    if (!html) {
      errors.push(`Fetch failed: ${product?.name || offer.id}`);
      await supabase
        .from('product_offers')
        .update({ last_checked_at: new Date().toISOString(), updated_at: new Date().toISOString() })
        .eq('id', offer.id);

      await supabase.from('price_history').insert({
        offer_id: offer.id,
        product_id: offer.product_id,
        store_id: offer.store_id,
        price: offer.price,
        original_price: offer.original_price,
        availability: offer.availability,
        source: 'cron',
        checked_at: new Date().toISOString(),
        notes: 'fetch_failed',
      });
      continue;
    }

    const prices = parseNairaPrices(html);
    const prev = offer.price != null ? Number(offer.price) : null;
    const newPrice = pickPrice(prices, prev);
    const availability = detectAvailability(html);

    const changed =
      newPrice != null && prev != null && prev > 0 && Math.abs(newPrice - prev) / prev >= 0.02;

    if (changed) pricesChanged += 1;
    if (availability === 'out_of_stock' && offer.availability !== 'out_of_stock') {
      inventoryAlerts += 1;
    }

    const nextPrice = newPrice ?? prev ?? 0;
    const discount =
      offer.original_price && Number(offer.original_price) > nextPrice
        ? Math.round(
            ((Number(offer.original_price) - nextPrice) / Number(offer.original_price)) * 100
          )
        : null;

    await supabase
      .from('product_offers')
      .update({
        price: nextPrice,
        discount_percent: discount,
        availability,
        last_checked_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', offer.id);

    await supabase.from('price_history').insert({
      offer_id: offer.id,
      product_id: offer.product_id,
      store_id: offer.store_id,
      price: nextPrice,
      original_price: offer.original_price,
      availability,
      currency: 'NGN',
      source: 'cron',
      checked_at: new Date().toISOString(),
      notes: changed
        ? `price_change ${prev} → ${newPrice}`
        : newPrice
          ? 'checked'
          : 'no_price_parsed',
    });
  }

  const summary = `Checked ${offersChecked} offers · ${pricesChanged} price changes · ${inventoryAlerts} stock alerts · ${errors.length} errors`;

  await supabase
    .from('price_track_runs')
    .update({
      status: 'completed',
      finished_at: new Date().toISOString(),
      offers_checked: offersChecked,
      prices_changed: pricesChanged,
      inventory_alerts: inventoryAlerts,
      errors: errors.slice(0, 30),
      summary,
    })
    .eq('id', run.id);

  return { offersChecked, pricesChanged, inventoryAlerts, errors, summary };
}
