export const metadata = { title: 'Contact' };

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-bold text-white light:text-slate-900">Contact & Help</h1>
      <p className="mt-2 text-base font-medium text-surface-200 light:text-slate-600">
        Report incorrect information, wrong prices, or ask a general question.
      </p>
      <form className="mt-8 space-y-4">
        <div>
          <label className="block text-sm font-semibold text-white light:text-slate-800">Name</label>
          <input
            className="mt-1 w-full rounded-xl border border-surface-600 bg-surface-900 px-4 py-2.5 text-white light:border-slate-300 light:bg-white light:text-slate-900"
            name="name"
            type="text"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-white light:text-slate-800">Email</label>
          <input
            className="mt-1 w-full rounded-xl border border-surface-600 bg-surface-900 px-4 py-2.5 text-white light:border-slate-300 light:bg-white light:text-slate-900"
            name="email"
            type="email"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-white light:text-slate-800">Message</label>
          <textarea
            className="mt-1 w-full rounded-xl border border-surface-600 bg-surface-900 px-4 py-2.5 text-white light:border-slate-300 light:bg-white light:text-slate-900"
            name="message"
            rows={5}
          />
        </div>
        <button
          type="button"
          className="rounded-xl bg-brand-600 px-6 py-2.5 font-bold text-white hover:bg-brand-500"
        >
          Send (wire to email / ticket later)
        </button>
      </form>
    </div>
  );
}
