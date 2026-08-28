import Link from 'next/link';

export function Footer() {
  return (
    <footer className="mt-auto border-t border-surface-200 bg-surface-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2 font-bold text-brand-700">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-sm text-white">TP</span>
              TechPick NG
            </div>
            <p className="mt-3 text-sm text-surface-600">
              Find. Compare. Buy smart. Product discovery, reviews, and price comparison for tech in Nigeria.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-surface-900">Explore</h3>
            <ul className="mt-3 space-y-2 text-sm text-surface-600">
              <li><Link href="/categories/smartphones" className="hover:text-brand-600">Smartphones</Link></li>
              <li><Link href="/categories/laptops" className="hover:text-brand-600">Laptops</Link></li>
              <li><Link href="/deals" className="hover:text-brand-600">Deals</Link></li>
              <li><Link href="/compare" className="hover:text-brand-600">Compare</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-surface-900">Content</h3>
            <ul className="mt-3 space-y-2 text-sm text-surface-600">
              <li><Link href="/reviews" className="hover:text-brand-600">Reviews</Link></li>
              <li><Link href="/articles" className="hover:text-brand-600">Articles</Link></li>
              <li><Link href="/about" className="hover:text-brand-600">About</Link></li>
              <li><Link href="/contact" className="hover:text-brand-600">Contact / Help</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-surface-900">Legal</h3>
            <ul className="mt-3 space-y-2 text-sm text-surface-600">
              <li><Link href="/about#affiliate" className="hover:text-brand-600">Affiliate disclosure</Link></li>
              <li><span className="text-surface-400">Prices subject to change on retailer sites</span></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-surface-200 pt-6 text-center text-xs text-surface-500">
          © {new Date().getFullYear()} TechPick NG. Demo / development build. Not affiliated with listed retailers beyond potential future affiliate partnerships.
        </div>
      </div>
    </footer>
  );
}
