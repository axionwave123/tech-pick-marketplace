'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth/admin';
import { runDailyPriceTrack } from '@/lib/tracking/priceTracker';

export async function runTrackingNow(): Promise<{ error?: string; summary?: string }> {
  const auth = await requireAdmin();
  if (!auth.authorized) return { error: 'Not authorized.' };

  try {
    const result = await runDailyPriceTrack(30);
    revalidatePath('/admin/tracking');
    revalidatePath('/admin/offers');
    revalidatePath('/admin/needs-update');
    return { summary: result.summary };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Tracking failed' };
  }
}
