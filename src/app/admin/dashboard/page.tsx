import { redirect } from 'next/navigation';

/** @deprecated Use (protected)/dashboard — kept to avoid dual trees during migration */
export default function LegacyDashboardRedirect() {
  redirect('/admin/dashboard');
}
