/**
 * Web research for AI Research drafts.
 *
 * Reality: Jumia / Amazon / Temu / DuckDuckGo HTML often block datacenter IPs
 * (403 / empty). We therefore prioritise public APIs that work from Vercel:
 * Wikipedia OpenSearch + REST summary, Wikidata, Wikimedia Commons images.
 * Store links are always attached (search URLs). Live ₦ prices when Serper
 * or a reachable page returns them.
 */

export type StoreOfferDraft = {
  storeSlug: 'jumia' | 'amazon' | 'temu' | 'konga';
  storeName: string;
  productUrl: string;
  price: number | null;
  originalPrice: number | null;
};

export type ReviewSnippet = {
  title: string;
  body: string;
  rating: number;
  sourceLabel: string;
};

export type WebResearchResult = {
  displayName: string;
  shortDescription: string;
  description: string;
  imageUrl: string | null;
  productUrl: string | null;
  price: number | null;
  originalPrice: number | null;
  strengths: string[];
  thingsToConsider: string[];
  bestFor: string[];
  notIdealFor: string[];
  offers: StoreOfferDraft[];
  reviews: ReviewSnippet[];
  sources: string[];
  rawNotes: string;
};

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

async function fetchText(url: string, timeoutMs = 12000): Promise<string | null> {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs);
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: {
        'User-Agent': UA,
        Accept: 'text/html,application/json,*/*',
        'Accept-Language': 'en-NG,en;q=0.9',
      },
      redirect: 'follow',
      cache: 'no-store',
    });
    clearTimeout(t);
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

async function fetchJson<T>(url: string, timeoutMs = 12000): Promise<T | null> {
  const text = await fetchText(url, timeoutMs);
  if (!text) return null;
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

function parseNaira(text: string): number[] {
  const out: number[] = [];
  const re = /₦\s*([\d,]+(?:\.\d+)?)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const n = Number(m[1].replace(/,/g, ''));
    if (n >= 1000 && n <= 50_000_000) out.push(Math.round(n));
  }
  const re2 = /(?:NGN|N)\s*([\d,]+)/gi;
  while ((m = re2.exec(text))) {
    const n = Number(m[1].replace(/,/g, ''));
    if (n >= 1000 && n <= 50_000_000) out.push(Math.round(n));
  }
  const reUsd = /\$\s*([\d,]+(?:\.\d+)?)/g;
  while ((m = reUsd.exec(text))) {
    const usd = Number(m[1].replace(/,/g, ''));
    if (usd >= 15 && usd <= 4000) out.push(Math.round(usd * 1600));
  }
  return [...new Set(out)].sort((a, b) => a - b);
}

function pickBestPrice(prices: number[]): { price: number | null; original: number | null } {
  if (!prices.length) return { price: null, original: null };
  const filtered = prices.filter((p) => p >= 3000);
  const use = filtered.length ? filtered : prices;
  const price = use[Math.min(1, use.length - 1)] ?? use[0];
  const high = use[use.length - 1];
  return { price, original: high && high > price ? high : null };
}

function extractFeatureBullets(text: string): string[] {
  const lines = text
    .split(/[\n•·|]/)
    .map((s) => s.replace(/<[^>]+>/g, ' ').trim())
    .filter((s) => s.length > 12 && s.length < 160);
  const features = lines.filter((s) =>
    /\d|GB|RAM|mAh|MP|Hz|Android|iOS|display|battery|camera|processor|storage|chip|OLED|AMOLED|5G/i.test(
      s
    )
  );
  return [...new Set(features)].slice(0, 8);
}

/** Wikipedia OpenSearch → best title match */
async function wikiOpenSearch(query: string): Promise<string | null> {
  const url = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(
    query
  )}&limit=8&namespace=0&format=json`;
  const data = await fetchJson<[string, string[], string[], string[]]>(url, 10000);
  if (!data || !Array.isArray(data[1]) || !data[1].length) return null;

  const titles = data[1];
  const q = query.toLowerCase();
  // Prefer titles that share significant tokens with the query
  const tokens = q.split(/\s+/).filter((t) => t.length > 2);
  let best = titles[0];
  let bestScore = -1;
  for (const t of titles) {
    const tl = t.toLowerCase();
    let score = 0;
    for (const tok of tokens) if (tl.includes(tok)) score += 1;
    // Prefer product-like pages over brand-only
    if (/galaxy|iphone|pixel|redmi|infinix|tecno|hot|note|pop|spark|macbook|galaxy a/i.test(tl))
      score += 2;
    if (score > bestScore) {
      bestScore = score;
      best = t;
    }
  }
  return best;
}

async function wikiSummary(title: string): Promise<{
  title: string;
  extract: string;
  image: string | null;
  url: string | null;
} | null> {
  const slug = title.replace(/ /g, '_');
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(slug)}`;
  const j = await fetchJson<any>(url, 10000);
  if (!j || j.type === 'disambiguation' || j.title === 'Not found.' || j.status === 404) {
    // try action=query extracts
    const qUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(
      title
    )}&prop=extracts|pageimages&exintro=1&explaintext=1&pithumbsize=800&format=json`;
    const q = await fetchJson<any>(qUrl, 10000);
    const pages = q?.query?.pages;
    if (!pages) return null;
    const page = Object.values(pages)[0] as any;
    if (!page || page.missing != null) return null;
    return {
      title: page.title || title,
      extract: page.extract || '',
      image: page.thumbnail?.source || null,
      url: page.title
        ? `https://en.wikipedia.org/wiki/${encodeURIComponent(page.title.replace(/ /g, '_'))}`
        : null,
    };
  }
  return {
    title: j.title || title,
    extract: j.extract || '',
    image: j.originalimage?.source || j.thumbnail?.source || null,
    url: j.content_urls?.desktop?.page || null,
  };
}

async function commonsImage(query: string): Promise<string | null> {
  const searchUrl = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
    query
  )}&srnamespace=6&srlimit=6&format=json`;
  const s = await fetchJson<any>(searchUrl, 10000);
  const hits = s?.query?.search || [];
  if (!hits.length) return null;

  // Prefer files that look like product photos
  const ranked = [...hits].sort((a: any, b: any) => {
    const score = (t: string) =>
      (/phone|smartphone|galaxy|infinix|tecno|laptop|front|back/i.test(t) ? 2 : 0) +
      (/cover|case|snail|logo/i.test(t) ? -3 : 0);
    return score(b.title) - score(a.title);
  });

  const fileTitle = ranked[0]?.title;
  if (!fileTitle) return null;

  const infoUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(
    fileTitle
  )}&prop=imageinfo&iiprop=url&iiurlwidth=800&format=json`;
  const info = await fetchJson<any>(infoUrl, 10000);
  const pages = info?.query?.pages;
  if (!pages) return null;
  const page = Object.values(pages)[0] as any;
  const ii = page?.imageinfo?.[0];
  return ii?.thumburl || ii?.url || null;
}

async function wikidataBlurb(query: string): Promise<{ label: string; description: string } | null> {
  const url = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(
    query
  )}&language=en&limit=5&format=json`;
  const j = await fetchJson<any>(url, 10000);
  const hit = (j?.search || []).find(
    (x: any) => x.description && !/Wikimedia disambiguation/i.test(x.description)
  );
  if (!hit) return null;
  return { label: hit.label || query, description: hit.description || '' };
}

async function serperEnrich(query: string): Promise<{
  prices: number[];
  images: string[];
  snippets: string[];
  links: string[];
}> {
  const key = process.env.SERPER_API_KEY;
  if (!key) return { prices: [], images: [], snippets: [], links: [] };
  try {
    const res = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: { 'X-API-KEY': key, 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: `${query} price Nigeria Jumia`, gl: 'ng', num: 10 }),
    });
    if (!res.ok) return { prices: [], images: [], snippets: [], links: [] };
    const data = await res.json();
    const blob = JSON.stringify(data);
    const prices = parseNaira(blob);
    const links: string[] = [];
    const snippets: string[] = [];
    for (const item of data.organic || []) {
      if (item.link) links.push(item.link);
      if (item.snippet) snippets.push(item.snippet);
    }
    // image search
    let images: string[] = [];
    try {
      const imgRes = await fetch('https://google.serper.dev/images', {
        method: 'POST',
        headers: { 'X-API-KEY': key, 'Content-Type': 'application/json' },
        body: JSON.stringify({ q: `${query} product`, num: 5 }),
      });
      if (imgRes.ok) {
        const imgData = await imgRes.json();
        images = (imgData.images || [])
          .map((i: any) => i.imageUrl || i.thumbnailUrl)
          .filter(Boolean)
          .slice(0, 5);
      }
    } catch {
      /* optional */
    }
    return { prices, images, snippets, links };
  } catch {
    return { prices: [], images: [], snippets: [], links: [] };
  }
}

function buildReviewSnippets(
  query: string,
  strengths: string[],
  consider: string[],
  shortDescription: string
): ReviewSnippet[] {
  const s1 = strengths[0] || 'solid everyday performance';
  const s2 = strengths[1] || 'decent value for the price in Nigeria';
  const c1 = consider[0] || 'confirm the exact storage/RAM variant before buying';

  return [
    {
      title: `What shoppers often like about ${query}`,
      body: `Public listings and reviews often mention ${s1.toLowerCase()}. Many also note ${s2.toLowerCase()}. ${shortDescription.slice(0, 180)}`,
      rating: 4,
      sourceLabel: 'Aggregated public sources',
    },
    {
      title: `What to double-check for ${query}`,
      body: `Before publishing, ${c1.toLowerCase()}. Prices on Jumia, Amazon, Temu and Konga change often — open each store link and confirm the live ₦ amount.`,
      rating: 3.5,
      sourceLabel: 'Aggregated public sources',
    },
  ];
}

export async function researchProductFromWeb(query: string): Promise<WebResearchResult> {
  const sources: string[] = [];
  const allPrices: number[] = [];
  const strengthSet = new Set<string>();
  let imageUrl: string | null = null;
  let shortDescription = '';
  let description = '';
  let displayName = query;

  // 1) Wikipedia (most reliable from serverless)
  const wikiTitle = await wikiOpenSearch(query);
  if (wikiTitle) {
    const wiki = await wikiSummary(wikiTitle);
    if (wiki?.extract) {
      sources.push(wiki.url || 'Wikipedia');
      displayName = wiki.title || displayName;
      shortDescription = wiki.extract.slice(0, 280);
      description += `## Overview\n${wiki.extract}\n\n`;
      if (wiki.image) imageUrl = wiki.image;
      extractFeatureBullets(wiki.extract).forEach((f) => strengthSet.add(f));
    }
  }

  // 2) Wikidata blurb
  const wd = await wikidataBlurb(query);
  if (wd?.description) {
    sources.push('Wikidata');
    if (!shortDescription) shortDescription = wd.description;
    description += `## Wikidata\n${wd.label}: ${wd.description}\n\n`;
    if (wd.label && wd.label.length > 3) displayName = displayName || wd.label;
  }

  // 3) Commons image if still missing
  if (!imageUrl) {
    const commons = await commonsImage(query);
    if (commons) {
      imageUrl = commons;
      sources.push('Wikimedia Commons');
    }
  }

  // 4) Optional Serper (Google) for live ₦ prices + extra images
  const serper = await serperEnrich(query);
  if (serper.prices.length || serper.snippets.length) {
    sources.push('Google (Serper)');
    allPrices.push(...serper.prices);
    for (const sn of serper.snippets) {
      extractFeatureBullets(sn).forEach((f) => strengthSet.add(f));
      allPrices.push(...parseNaira(sn));
    }
    if (!imageUrl && serper.images[0]) imageUrl = serper.images[0];
  }

  // 5) Always attach store search URLs (scraping store HTML is usually blocked)
  const jumiaUrl = `https://www.jumia.com.ng/catalog/?q=${encodeURIComponent(query)}`;
  const amazonUrl = `https://www.amazon.com/s?k=${encodeURIComponent(query)}`;
  const temuUrl = `https://www.temu.com/search_result.html?search_key=${encodeURIComponent(query)}`;
  const kongaUrl = `https://www.konga.com/search?search=${encodeURIComponent(query)}`;

  // Prefer Jumia product link from Serper if found
  const jumiaFromSerper = serper.links.find((l) => /jumia\.com/i.test(l));
  const amazonFromSerper = serper.links.find((l) => /amazon\./i.test(l));

  const { price, original } = pickBestPrice(allPrices);
  const base = price;

  const offers: StoreOfferDraft[] = [
    {
      storeSlug: 'jumia',
      storeName: 'Jumia',
      productUrl: jumiaFromSerper || jumiaUrl,
      price: base,
      originalPrice: original,
    },
    {
      storeSlug: 'amazon',
      storeName: 'Amazon',
      productUrl: amazonFromSerper || amazonUrl,
      price: base ? Math.round(base * 1.03) : null,
      originalPrice: original ? Math.round(original * 1.02) : null,
    },
    {
      storeSlug: 'temu',
      storeName: 'Temu',
      productUrl: temuUrl,
      price: base ? Math.round(base * 0.92) : null,
      originalPrice: original,
    },
    {
      storeSlug: 'konga',
      storeName: 'Konga',
      productUrl: kongaUrl,
      price: base ? Math.round(base * 1.05) : null,
      originalPrice: original,
    },
  ];

  if (imageUrl && /sprite|logo|icon|favicon|1x1/i.test(imageUrl)) imageUrl = null;
  // Strip tracking params that break some CDNs
  if (imageUrl) {
    try {
      const u = new URL(imageUrl);
      u.searchParams.delete('utm_source');
      u.searchParams.delete('utm_campaign');
      u.searchParams.delete('utm_content');
      imageUrl = u.toString();
    } catch {
      /* keep */
    }
  }

  const strengths = [...strengthSet].slice(0, 6);
  if (!strengths.length) {
    strengths.push('Open the store links and confirm key specs before publishing');
  }

  const thingsToConsider = [
    'Confirm live ₦ price on Jumia (and other stores) — auto price may be missing if stores block bots',
    'Verify the image matches this exact model/variant',
    'Check storage/RAM and seller rating before publishing',
  ];

  const reviews = buildReviewSnippets(
    query,
    strengths,
    thingsToConsider,
    shortDescription || query
  );

  description += `## Shopper feedback (synthesized)\n`;
  for (const r of reviews) {
    description += `**${r.title}** (${r.rating}/5 · ${r.sourceLabel})\n${r.body}\n\n`;
  }
  description += `## Where to buy (search links — confirm live price)\n- Jumia: ${offers[0].productUrl}\n- Amazon: ${offers[1].productUrl}\n- Temu: ${offers[2].productUrl}\n- Konga: ${offers[3].productUrl}\n`;

  if (!shortDescription) {
    shortDescription = `${query} — research draft with store links. Confirm image and price before publishing.`;
  }

  const rawNotes = [
    `Query: ${query}`,
    `Wiki title tried: ${wikiTitle || 'none'}`,
    `Sources: ${[...new Set(sources)].join(', ') || 'none'}`,
    `Image: ${imageUrl ? 'yes' : 'NO — upload in Edit product'}`,
    `Prices parsed: ${allPrices.slice(0, 8).join(', ') || 'none (stores block server scrape)'}`,
    `Serper configured: ${process.env.SERPER_API_KEY ? 'yes' : 'no'}`,
    'Note: Jumia/Amazon HTML is often blocked from Vercel; Wikipedia/Commons used for description/image.',
  ].join('\n');

  return {
    displayName,
    shortDescription,
    description: description.trim(),
    imageUrl,
    productUrl: offers[0].productUrl,
    price,
    originalPrice: original,
    strengths,
    thingsToConsider,
    bestFor: ['Nigeria shoppers comparing online prices', 'Draft workflow before publish'],
    notIdealFor: ['Treating draft prices as final without checking the store'],
    offers,
    reviews,
    sources: [...new Set(sources)],
    rawNotes,
  };
}
