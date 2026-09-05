'use server';

import { createClient, createServiceClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export type ReportResult = { ok: true } | { ok: false; error: string };

export async function submitUserReport(formData: FormData): Promise<ReportResult> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: 'Service unavailable. Try again later.' };
  }

  const name = String(formData.get('name') || '').trim().slice(0, 120);
  const email = String(formData.get('email') || '').trim().slice(0, 200);
  const report_type = String(formData.get('report_type') || 'problem').trim().slice(0, 40);
  const message = String(formData.get('message') || '').trim().slice(0, 4000);
  const page_url = String(formData.get('page_url') || '').trim().slice(0, 500);

  if (!message || message.length < 5) {
    return { ok: false, error: 'Please describe the problem (at least a few words).' };
  }

  const allowedTypes = new Set(['problem', 'wrong_price', 'wrong_info', 'bug', 'suggestion', 'other']);
  const type = allowedTypes.has(report_type) ? report_type : 'problem';

  try {
    const supabase = await createClient();
    const { error } = await supabase.from('user_reports').insert({
      name: name || null,
      email: email || null,
      report_type: type,
      message,
      page_url: page_url || null,
      status: 'new',
    });

    if (error) {
      const service = createServiceClient();
      const { error: err2 } = await service.from('user_reports').insert({
        name: name || null,
        email: email || null,
        report_type: type,
        message,
        page_url: page_url || null,
        status: 'new',
      });
      if (err2) {
        console.error('submitUserReport', err2);
        return { ok: false, error: 'Could not send report. Please try again.' };
      }
    }

    revalidatePath('/admin/reports');
    return { ok: true };
  } catch (e) {
    console.error('submitUserReport', e);
    return { ok: false, error: 'Could not send report. Please try again.' };
  }
}

export async function updateReportStatus(
  id: string,
  status: 'new' | 'read' | 'resolved',
  admin_note?: string
): Promise<ReportResult> {
  if (!isSupabaseConfigured()) return { ok: false, error: 'Unavailable' };
  try {
    const supabase = await createClient();
    const payload: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
    if (admin_note !== undefined) payload.admin_note = admin_note;
    const { error } = await supabase.from('user_reports').update(payload).eq('id', id);
    if (error) {
      console.error('updateReportStatus', error);
      return { ok: false, error: error.message };
    }
    revalidatePath('/admin/reports');
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: 'Update failed' };
  }
}
