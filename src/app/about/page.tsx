export const metadata = { title: 'About' };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-bold text-white light:text-slate-900">About TechPick NG</h1>
      <div className="mt-6 space-y-4 text-base font-medium leading-relaxed text-surface-200 light:text-slate-700">
        <p>
          TechPick NG helps you find, compare, and buy tech smarter in Nigeria — product information,
          editorial analysis, community opinions, and multi-store price comparison.
        </p>
        <p>
          We do not process payments. When you click a store link, you go to the retailer (e.g. Jumia,
          Amazon) to complete the purchase. We may earn a commission through affiliate links.
        </p>
        <p>
          Prices and availability change. Always confirm the final price and terms on the retailer
          site. We aim to show a last-checked time on offers where available.
        </p>
      </div>
    </div>
  );
}
