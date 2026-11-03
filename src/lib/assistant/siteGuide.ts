/**
 * Lightweight site guide — helps visitors navigate without a full LLM.
 * Answers common intents and links into search / categories / deals / articles.
 */

export type AssistantLink = { label: string; href: string };

export type AssistantReply = {
  text: string;
  links: AssistantLink[];
};

type ProductHit = {
  name: string;
  slug: string;
  price?: number | null;
};

const NAV: AssistantLink[] = [
  { label: 'Home', href: '/' },
  { label: 'Deals', href: '/deals' },
  { label: 'Articles & guides', href: '/articles' },
  { label: 'Compare products', href: '/compare' },
  { label: 'Smartphones', href: '/categories/smartphones' },
  { label: 'Laptops', href: '/categories/laptops' },
  { label: 'Power banks', href: '/categories/power-banks' },
  { label: 'Search', href: '/search' },
];

function searchHref(q: string) {
  return `/search?q=${encodeURIComponent(q.trim())}`;
}

function normalize(s: string) {
  return s.toLowerCase().replace(/\s+/g, ' ').trim();
}

function extractQuery(message: string): string {
  const m = normalize(message)
    .replace(
      /^(i want|i need|looking for|find|show me|search for|help me|where is|how do i|can you|please)\s+/g,
      ''
    )
    .replace(/\?+$/g, '')
    .trim();
  return m.slice(0, 80);
}

export function guideReply(
  message: string,
  productHits: ProductHit[] = []
): AssistantReply {
  const q = normalize(message);
  if (!q) {
    return {
      text: 'Ask me anything about the site — e.g. “cheap phones”, “laptop deals”, or “where are articles?”',
      links: NAV.slice(0, 5),
    };
  }

  if (/^(hi|hello|hey|help|what can you do)\b/.test(q)) {
    return {
      text: 'Hi — I help you move around TechPick NG faster. Try: “phones under budget”, “Infinix Smart”, “compare”, or “reading guides”.',
      links: [
        { label: 'Browse smartphones', href: '/categories/smartphones' },
        { label: 'Today’s deals', href: '/deals' },
        { label: 'Guides & articles', href: '/articles' },
        { label: 'Search everything', href: '/search' },
      ],
    };
  }

  if (/\b(deal|discount|cheap|budget|promo|offer|lowest price)\b/.test(q)) {
    return {
      text: 'For lower prices, start on Deals. You can also search a product name and compare store totals (price + shipping when available).',
      links: [
        { label: 'Open Deals', href: '/deals' },
        { label: 'Search products', href: '/search' },
        { label: 'Smartphones', href: '/categories/smartphones' },
      ],
    };
  }

  if (/\b(article|guide|review|read|blog|how to)\b/.test(q)) {
    return {
      text: 'Buying guides and reviews live under Articles. Open a guide, then jump to product pages for live store prices.',
      links: [
        { label: 'Read articles', href: '/articles' },
        { label: 'User reviews', href: '/reviews' },
        { label: 'Home', href: '/' },
      ],
    };
  }

  if (/\b(compare|comparison|vs|versus)\b/.test(q)) {
    return {
      text: 'Use Compare to put products side by side. Open a product page and tap Compare, or go straight to the compare list.',
      links: [
        { label: 'Compare page', href: '/compare' },
        { label: 'Browse phones', href: '/categories/smartphones' },
        { label: 'Browse laptops', href: '/categories/laptops' },
      ],
    };
  }

  if (/\b(phone|smartphone|android|iphone)\b/.test(q)) {
    const query = extractQuery(message);
    return {
      text: productHits.length
        ? `Here are phones/products that match. Open one for prices across Jumia, Amazon, Temu, and more.`
        : `Browse smartphones, or search for a model name (e.g. Infinix, Samsung, Tecno).`,
      links: [
        ...productHits.slice(0, 4).map((p) => ({
          label: p.name,
          href: `/products/${p.slug}`,
        })),
        { label: 'All smartphones', href: '/categories/smartphones' },
        { label: `Search “${query.slice(0, 40)}”`, href: searchHref(query) },
      ],
    };
  }

  if (/\b(laptop|notebook|macbook)\b/.test(q)) {
    return {
      text: 'Laptops are under Categories → Laptops. Search a brand or model if you already know it.',
      links: [
        { label: 'Laptops', href: '/categories/laptops' },
        { label: 'Search laptops', href: searchHref('laptop') },
        { label: 'Deals', href: '/deals' },
      ],
    };
  }

  if (/\b(power bank|powerbank|charger)\b/.test(q)) {
    return {
      text: 'Power banks and charging gear are grouped here.',
      links: [
        { label: 'Power banks', href: '/categories/power-banks' },
        { label: 'Accessories', href: '/categories/accessories' },
        { label: 'Search', href: searchHref('power bank') },
      ],
    };
  }

  if (productHits.length) {
    return {
      text: `I found ${productHits.length} product${productHits.length === 1 ? '' : 's'} related to that. Tap one to see store prices, or refine search.`,
      links: [
        ...productHits.slice(0, 5).map((p) => ({
          label: p.price != null ? `${p.name} · from NGN ${Math.round(p.price).toLocaleString()}` : p.name,
          href: `/products/${p.slug}`,
        })),
        { label: 'More search results', href: searchHref(extractQuery(message)) },
      ],
    };
  }

  const query = extractQuery(message);
  return {
    text: `I can take you to search for “${query}”, or jump to the main sections of the site.`,
    links: [
      { label: `Search “${query.slice(0, 40)}”`, href: searchHref(query) },
      { label: 'Categories / phones', href: '/categories/smartphones' },
      { label: 'Deals', href: '/deals' },
      { label: 'Articles', href: '/articles' },
      { label: 'Home', href: '/' },
    ],
  };
}
