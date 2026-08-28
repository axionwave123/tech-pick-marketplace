/**
 * Minimal pass-through layout for /admin/*
 * Auth + chrome live in (protected)/layout for dashboard routes.
 * Login uses only this + root layout (no admin gate).
 */
export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
