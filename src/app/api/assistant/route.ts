import { NextResponse } from 'next/server';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { guideReply } from '@/lib/assistant/siteGuide';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const message = String(body?.message || '').trim().slice(0, 400);

    if (!message) {
      return NextResponse.json(guideReply(''), { status: 200 });
    }

    type Hit = { name: string; slug: string; price?: number | null };
    let hits: Hit[] = [];

    if (isSupabaseConfigured()) {
      try {
        const supabase = await createClient();
        const tokens = message
          .toLowerCase()
          .replace(/[^\p{L}\p{N}\s]/gu, ' ')
          .split(/\s+/)
          .filter((t) => t.length > 1)
          .slice(0, 4);

        let query = supabase
          .from('products')
          .select('name, slug, status, product_offers ( price, status )')
          .eq('status', 'published')
          .limit(8);

        if (tokens.length) {
          const orFilter = tokens.map((t) => `name.ilike.%${t}%`).join(',');
          query = query.or(orFilter);
        }

        const { data } = await query;
        hits = (data || []).map((p: any) => {
          const offers = (p.product_offers || []).filter(
            (o: any) => o.status === 'active' && o.price != null
          );
          const price =
            offers.length > 0
              ? Math.min(...offers.map((o: any) => Number(o.price)))
              : null;
          return { name: p.name as string, slug: p.slug as string, price };
        });
      } catch (e) {
        console.error('assistant product lookup', e);
      }
    }

    const reply = guideReply(message, hits);
    return NextResponse.json(reply);
  } catch (e) {
    console.error('assistant route', e);
    return NextResponse.json(
      {
        text: 'Something went wrong. Try Search or open Categories from the top menu.',
        links: [
          { label: 'Search', href: '/search' },
          { label: 'Home', href: '/' },
        ],
      },
      { status: 200 }
    );
  }
}
