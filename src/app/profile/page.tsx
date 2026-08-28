export const metadata = { title: 'Profile' };

export default function ProfilePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-surface-900">Your profile</h1>
      <p className="mt-2 text-surface-600">
        Registered users will be able to save products, save comparisons, view comments, and manage account settings.
      </p>
      <div className="mt-8 rounded-2xl border border-dashed border-surface-300 bg-surface-50 p-8 text-center text-sm text-surface-500">
        Sign-in via Supabase Auth is configured. Complete profile UI after connecting your project and enabling auth providers.
      </div>
    </div>
  );
}
