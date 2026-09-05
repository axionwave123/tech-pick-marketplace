import { ContactForm } from '@/components/ContactForm';

export const metadata = { title: 'Contact' };

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-bold text-white light:text-slate-900">Contact & Help</h1>
      <p className="mt-2 text-base font-medium text-surface-200 light:text-slate-600">
        Report incorrect information, wrong prices, bugs, or ask a general question. Messages go to the admin
        reports inbox.
      </p>
      <ContactForm />
    </div>
  );
}
