export const metadata = { title: 'Profile' };

export default function ProfilePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-bold text-white light:text-slate-900">Your profile</h1>
      <p className="mt-2 text-base font-medium text-surface-200 light:text-slate-600">
        Saved products, comparisons, and account settings will appear here after public auth is
        connected.
      </p>
    </div>
  );
}
