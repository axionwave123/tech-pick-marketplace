export const metadata = { title: 'Contact / Help' };

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-surface-900">Contact & Help</h1>
      <p className="mt-2 text-surface-600">Report incorrect information, ask questions, or get support.</p>

      <form className="mt-8 space-y-4 rounded-2xl border border-surface-200 bg-white p-6 shadow-card">
        <div>
          <label className="block text-sm font-medium text-surface-700">Name</label>
          <input className="mt-1 w-full rounded-lg border border-surface-200 px-3 py-2 text-sm" name="name" />
        </div>
        <div>
          <label className="block text-sm font-medium text-surface-700">Email</label>
          <input type="email" className="mt-1 w-full rounded-lg border border-surface-200 px-3 py-2 text-sm" name="email" />
        </div>
        <div>
          <label className="block text-sm font-medium text-surface-700">Topic</label>
          <select className="mt-1 w-full rounded-lg border border-surface-200 px-3 py-2 text-sm" name="topic">
            <option>General support</option>
            <option>Report incorrect product info</option>
            <option>Report incorrect price / offer</option>
            <option>Partnership</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-surface-700">Message</label>
          <textarea className="mt-1 w-full rounded-lg border border-surface-200 px-3 py-2 text-sm" rows={5} name="message" />
        </div>
        <button type="submit" className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
          Send message
        </button>
        <p className="text-xs text-surface-400">Form UI ready — connect to email / Supabase edge function for production.</p>
      </form>

      <section className="mt-12">
        <h2 className="text-xl font-semibold text-surface-900">FAQ</h2>
        <ul className="mt-4 space-y-3 text-sm text-surface-700">
          <li><strong>Do you process payments?</strong> No. Checkout happens on the retailer site.</li>
          <li><strong>Are prices guaranteed?</strong> No. Prices change; we show last-checked times.</li>
          <li><strong>How do I report a wrong price?</strong> Use the form above with topic “Report incorrect price”.</li>
        </ul>
      </section>
    </div>
  );
}
