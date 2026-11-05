import { createClient } from '@/lib/supabase/server';

export type AdminAlert = {
  id: string;
  title: string;
  detail: string;
  href: string;
  severity: 'high' | 'medium' | 'low';
  count?: number;
};

export type AdminAlertSummary = {
  total: number;
  high: number;
  alerts: AdminAlert[];
};

/** Aggregate actionable admin items into a notification list */
export async function getAdminAlerts(): Promise<AdminAlertSummary> {
  const supabase = await createClient();
  const alerts: AdminAlert[] = [];

  const [drafts, pendingReviews, newReports, needsUpdate] = await Promise.all([
    supabase.from('products').select('id', { count: 'exact', head: true }).eq('status', 'draft'),
    supabase
      .from('user_reviews')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending'),
    supabase.from('user_reports').select('id', { count: 'exact', head: true }).eq('status', 'new'),
    supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'needs_update'),
  ]);

  const draftCount = drafts.count ?? 0;
  const reviewCount = pendingReviews.count ?? 0;
  const reportCount = newReports.count ?? 0;
  const needsCount = needsUpdate.count ?? 0;

  if (reportCount > 0) {
    alerts.push({
      id: 'reports',
      title: 'New user reports',
      detail: `${reportCount} report${reportCount === 1 ? '' : 's'} waiting for review`,
      href: '/admin/reports',
      severity: 'high',
      count: reportCount,
    });
  }

  if (reviewCount > 0) {
    alerts.push({
      id: 'reviews',
      title: 'Pending reviews',
      detail: `${reviewCount} user review${reviewCount === 1 ? '' : 's'} to moderate`,
      href: '/admin/moderation',
      severity: 'high',
      count: reviewCount,
    });
  }

  if (draftCount > 0) {
    alerts.push({
      id: 'drafts',
      title: 'Draft products ready to publish',
      detail: `${draftCount} draft${draftCount === 1 ? '' : 's'} not on the public site yet`,
      href: '/admin/drafts',
      severity: 'medium',
      count: draftCount,
    });
  }

  if (needsCount > 0) {
    alerts.push({
      id: 'needs_update',
      title: 'Products need update',
      detail: `${needsCount} product${needsCount === 1 ? '' : 's'} marked needs_update`,
      href: '/admin/needs-update',
      severity: 'medium',
      count: needsCount,
    });
  }

  const high = alerts.filter((a) => a.severity === 'high').reduce((n, a) => n + (a.count || 1), 0);
  const total = alerts.reduce((n, a) => n + (a.count || 1), 0);

  return { total, high, alerts };
}
