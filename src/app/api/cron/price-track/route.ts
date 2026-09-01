import { NextRequest, NextResponse } from 'next/server';
import { runDailyPriceTrack } from '@/lib/tracking/priceTracker';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/** Daily job: vercel.json → 0 6 * * * (06:00 UTC ≈ 07:00 WAT) */
function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get('authorization');
  const q = req.nextUrl.searchParams.get('secret');
  const ua = req.headers.get('user-agent') || '';

  // Official Vercel Cron request
  if (ua.includes('vercel-cron')) return true;

  // Manual / external trigger with shared secret
  if (secret && auth === `Bearer ${secret}`) return true;
  if (secret && q === secret) return true;

  return false;
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const limit = Number(req.nextUrl.searchParams.get('limit') || 40);
  try {
    const result = await runDailyPriceTrack(Math.min(Math.max(limit, 1), 80));
    return NextResponse.json({ ok: true, ...result, schedule: 'daily 06:00 UTC' });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Track failed';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
