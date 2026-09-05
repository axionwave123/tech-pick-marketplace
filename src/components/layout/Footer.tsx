import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-surface-800 bg-surface-950">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4 lg:px-8">
        <div>
          <p className="font-display text-lg font-bold text-white">TechPick NG</p>
          <p className="mt-2 text-sm text-surface-400">
            Find. Compare. Buy smart — product discovery and price comparison for tech in Nigeria.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Explore</p>
          <ul className="mt-3 space-y-2 text-sm text-surface-400">
            <li>
              <Link href="/deals" className="hover:text-brand-300">
                Deals
              </Link>
            </li>
            <li>
              <Link href="/reviews" className="hover:text-brand-300">
                Reviews
              </Link>
            </li>
            <li>
              <Link href="/articles" className="hover:text-brand-300">
                Articles
              </Link>
            </li>
            <li>
              <Link href="/compare" className="hover:text-brand-300">
                Compare
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Company</p>
          <ul className="mt-3 space-y-2 text-sm text-surface-400">
            <li>
              <Link href="/about" className="hover:text-brand-300">
                About
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-brand-300">
                Contact
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-brand-300">
                Report a problem
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Legal</p>
          <p className="mt-3 text-xs leading-relaxed text-surface-500">
            We may earn a commission when you buy through affiliate links. Prices and availability can change;
            always confirm on the retailer site.
          </p>
        </div>
      </div>
      <div className="border-t border-surface-800 py-4 text-center text-xs text-surface-500">
        © {new Date().getFullYear()} TechPick NG. All rights reserved.
      </div>
    </footer>
  );
}
