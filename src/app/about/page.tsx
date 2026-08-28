export const metadata = { title: 'About' };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-surface-900">About TechPick NG</h1>
      <div className="mt-8 space-y-6 text-surface-700">
        <p>
          TechPick NG is a product-discovery, review, price-comparison, and deals platform focused on technology
          products in Nigeria — with architecture ready to expand into other categories.
        </p>
        <h2 className="text-xl font-semibold text-surface-900">How product information is collected</h2>
        <p>
          Product identity and specifications are curated and approved by administrators. An AI research pipeline can
          assist with structuring public information, but nothing is published without admin review.
        </p>
        <h2 className="text-xl font-semibold text-surface-900">How recommendations work</h2>
        <p>
          Editorial analysis highlights strengths and considerations based on available sources. We do not claim
          physical lab testing unless that is explicitly documented.
        </p>
        <h2 className="text-xl font-semibold text-surface-900">How price comparisons work</h2>
        <p>
          Offers are tied to products and stores independently. Each offer has a price, optional original price,
          availability, and last-checked timestamp. We show the best deal we found among partner stores — not a claim
          of being the cheapest on the entire internet.
        </p>
        <h2 id="affiliate" className="text-xl font-semibold text-surface-900">Affiliate disclosure</h2>
        <p>
          When you click through to a retailer via a tracking link, TechPick NG may earn a commission at no extra cost
          to you. Affiliate URLs in the demo seed are placeholders only.
        </p>
      </div>
    </div>
  );
}
