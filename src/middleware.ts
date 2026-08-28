import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /admin/* except login
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const response = await updateSession(request);
    // Session refresh only here; fine-grained auth in layout/server components
    return response;
  }

  return updateSession(request);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
