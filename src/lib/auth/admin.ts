import { createClient } from '@/lib/supabase/server';

export async function getSessionUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function isAdminUser(userId?: string): Promise<boolean> {
  const supabase = await createClient();
  const uid = userId ?? (await getSessionUser())?.id;
  if (!uid) return false;

  const { data } = await supabase
    .from('admin_roles')
    .select('role')
    .eq('user_id', uid)
    .in('role', ['super_admin', 'admin', 'editor', 'moderator'])
    .limit(1)
    .maybeSingle();

  return !!data;
}

export async function requireAdmin() {
  const user = await getSessionUser();
  if (!user) {
    return { authorized: false as const, user: null, reason: 'unauthenticated' as const };
  }
  const ok = await isAdminUser(user.id);
  if (!ok) {
    return { authorized: false as const, user, reason: 'forbidden' as const };
  }
  return { authorized: true as const, user, reason: null };
}
