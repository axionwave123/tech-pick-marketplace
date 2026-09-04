/**
 * AI Research — reliable sources only from serverless (Vercel):
 * Wikipedia OpenSearch + summary, Wikidata, Wikimedia Commons.
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
  imageCandidates: string[];
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

const UA = 'TechPickNG-Research/2.0 (https://tech-pick-marketplace-woad.vercel.app)';

async function fetchText(url: string, timeoutMs = 12000): Promise<string | null> {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs);
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: {
        'User-Agent': UA,
        Accept: 'application/json,text/html,*/*',
        'Accept-Language': 'en',
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

function cleanImageUrl(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let s = raw.trim();
  if (!s.startsWith('http')) return null;
  if (/sprite|logo|icon|favicon|1x1|pixel|badge/i.test(s)) return null;
  try {
    const u = new URL(s);
    ['utm_source', 'utm_campaign', 'utm_content', 'utm_medium'].forEach((k) =>
      u.searchParams.delete(k)
    );
    return u.toString();
  } catch {
    return s;
  }
}

function uniqueSortedNumbers(out: number[]): number[] {
  return Array.from(new Set(out)).sort((a, b) => a - b);
}

function uniqueStrings(arr: string[]): string[] {
  return Array.from(new Set(arr));
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
  return uniqueSortedNumbers(out);
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
  return uniqueStrings(features).slice(0, 8);
}

function searchVariants(query: string): string[] {
  const q = query.trim();
  const variants = new Set<string>([q]);
  const tokens = q.split(/\s+/).filter(Boolean);
  if (tokens.length >= 2) {
    variants.add(tokens.slice(0, 2).join(' '));
    variants.add(tokens.slice(0, 3).join(' '));
  }
  const brand = tokens[0];
  if (brand && brand.length > 2) {
    variants.add(brand);
    if (/phone|smartphone|galaxy|hot|pop|spark|note|laptop/i.test(q)) {
      variants.add(`${brand} smartphone`);
      variants.add(`${brand} phone`);
    }
    if (/laptop|notebook|macbook/i.test(q)) variants.add(`${brand} laptop`);
  }
  return Array.from(variants);
}

async function wikiOpenSearch(query: string): Promise<string[]> {
  const url = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(
    query
  )}&limit=10&namespace=0&format=json&origin=*`;
  const data = await fetchJson<[string, string[], string[], string[]]>(url, 10000);
  if (!data || !Array.isArray(data[1])) return [];
  return data[1];
}

function rankWikiTitles(query: string, titles: string[]): string[] {
  const q = query.toLowerCase();
  const tokens = q.split(/\s+/).filter((t) => t.length > 1);
  return titles.slice().sort((a, b) => {
    const score = (t: string) => {
      const tl = t.toLowerCase();
      let s = 0;
      for (const tok of tokens) if (tl.includes(tok)) s += 2;
      if (/galaxy|iphone|pixel|redmi|infinix|tecno|hot|note|pop|spark|macbook|laptop|phone/i.test(tl))
        s += 3;
      if (/disambiguation/i.test(tl)) s -= 10;
      if (tl === q) s += 5;
      return s;
    };
    return score(b) - score(a);
  });
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

  if (j && j.type !== 'disambiguation' && j.status !== 404 && j.extract) {
    return {
      title: j.title || title,
      extract: j.extract || '',
      image: cleanImageUrl(j.originalimage?.source || j.thumbnail?.source),
      url: j.content_urls?.desktop?.page || null,
    };
  }

  const qUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(
    title
  )}&prop=extracts|pageimages&exintro=1&explaintext=1&pithumbsize=1000&format=json&origin=*`;
  const q = await fetchJson<any>(qUrl, 10000);
  const pages = q?.query?.pages;
  if (!pages) return null;
  const page = Object.values(pages)[0] as any;
  if (!page || page.missing != null) return null;
  if (!page.extract) return null;
  return {
    title: page.title || title,
    extract: page.extract || '',
    image: cleanImageUrl(page.thumbnail?.source || page.original?.source),
    url: page.title
      ? `https://en.wikipedia.org/wiki/${encodeURIComponent(String(page.title).replace(/ /g, '_'))}`
      : null,
  };
}

async function commonsImages(query: string, limit = 5): Promise<string[]> {
  const searchUrl = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
    query
  )}&srnamespace=6&srlimit=${limit}&format=json&origin=*`;
  const s = await fetchJson<any>(searchUrl, 10000);
  const hits = s?.query?.search || [];
  if (!hits.length) return [];

  const ranked = hits.slice().sort((a: any, b: any) => {
    const score = (t: string) =>
      (/phone|smartphone|galaxy|infinix|tecno|laptop|front|back|device/i.test(t) ? 3 : 0) +
      (/cover|case|snail|logo|icon|box only/i.test(t) ? -4 : 0);
    return score(b.title) - score(a.title);
  });

  const urls: string[] = [];
  for (const hit of ranked.slice(0, limit)) {
    const fileTitle = hit?.title;
    if (!fileTitle) continue;
    const infoUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(
      fileTitle
    )}&prop=imageinfo&iiprop=url&iiurlwidth=900&format=json&origin=*`;
    const info = await fetchJson<any>(infoUrl, 10000);
    const pages = info?.query?.pages;
    if (!pages) continue;
    const page = Object.values(pages)[0] as any;
    const ii = page?.imageinfo?.[0];
    const u = cleanImageUrl(ii?.thumburl || ii?.url);
    if (u) urls.push(u);
  }
  return urls;
}

async function wikidataBlurb(
  query: string
): Promise<{ label: string; description: string } | null> {
  const url = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(
    query
  )}&language=en&limit=8&format=json&origin=*`;
  const j = await fetchJson<any>(url, 10000);
  const hit = (j?.search || []).find(
    (x: any) =>
      x.description &&
      !/Wikimedia disambiguation/i.test(x.description) &&
      !/family name|given name/i.test(x.description)
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
    let images: string[] = [];
    try {
      const imgRes = await fetch('https://google.serper.dev/images', {
        method: 'POST',
        headers: { 'X-API-KEY': key, 'Content-Type': 'application/json' },
        body: JSON.stringify({ q: `${query} product official`, num: 6 }),
      });
      if (imgRes.ok) {
        const imgData = await imgRes.json();
        images = (imgData.images || [])
          .map((i: any) => cleanImageUrl(i.imageUrl || i.thumbnailUrl))
          .filter(Boolean) as string[];
      }
    } catch {
      /* optional */
    }
    return { prices, images, snippets, links };
  } catch {
    return { prices: [], images: [], snippets: [], links: [] };
  }
}

function buildForcedOffers(
  query: string,
  price: number | null,
  original: number | null,
  preferredLinks: string[]
): StoreOfferDraft[] {
  const jumiaHit = preferredLinks.find((l) => /jumia\.com/i.test(l));
  const amazonHit = preferredLinks.find((l) => /amazon\./i.test(l));
  const temuHit = preferredLinks.find((l) => /temu\.com/i.test(l));
  const kongaHit = preferredLinks.find((l) => /konga\.com/i.test(l));
  const q = encodeURIComponent(query);

  return [
    {
      storeSlug: 'jumia',
      storeName: 'Jumia',
      productUrl: jumiaHit || `https://www.jumia.com.ng/catalog/?q=${q}`,
      price,
      originalPrice: original,
    },
    {
      storeSlug: 'amazon',
      storeName: 'Amazon',
      productUrl: amazonHit || `https://www.amazon.com/s?k=${q}`,
      price: price ? Math.round(price * 1.03) : null,
      originalPrice: original ? Math.round(original * 1.02) : null,
    },
    {
      storeSlug: 'temu',
      storeName: 'Temu',
      productUrl: temuHit || `https://www.temu.com/search_result.html?search_key=${q}`,
      price: price ? Math.round(price * 0.92) : null,
      originalPrice: original,
    },
    {
      storeSlug: 'konga',
      storeName: 'Konga',
      productUrl: kongaHit || `https://www.konga.com/search?search=${q}`,
      price: price ? Math.round(price * 1.05) : null,
      originalPrice: original,
    },
  ];
}

function buildReviewSnippets(
  query: string,
  strengths: string[],
  consider: string[],
  shortDescription: string
): ReviewSnippet[] {
  const s1 = strengths[0] || 'solid everyday performance for the price';
  const s2 = strengths[1] || 'availability through major Nigeria online stores';
  const c1 = consider[0] || 'confirm the exact storage/RAM variant before buying';

  return [
    {
      title: `What shoppers often like about ${query}`,
      body: `Public listings and encyclopedic sources often mention ${s1.toLowerCase()}. Many also note ${s2.toLowerCase()}. ${shortDescription.slice(0, 180)}`,
      rating: 4,
      sourceLabel: 'Wikipedia / public sources',
    },
    {
      title: `What to double-check for ${query}`,
      body: `Before publishing, ${c1.toLowerCase()}. Open Jumia, Amazon, Temu and Konga links and type the live ₦ price into the offer fields — auto-scrape is blocked by most stores.`,
      rating: 3.5,
      sourceLabel: 'Editorial checklist',
    },
  ];
}

export async function researchProductFromWeb(query: string): Promise<WebResearchResult> {
  const sources: string[] = [];
  const allPrices: number[] = [];
  const strengthSet = new Set<string>();
  const imageCandidates: string[] = [];
  let imageUrl: string | null = null;
  let shortDescription = '';
  let description = '';
  let displayName = query.trim();
  let wikiTitleTried = 'none';

  const variants = searchVariants(query);

  for (const variant of variants) {
    const titles = rankWikiTitles(variant, await wikiOpenSearch(variant));
    if (!titles.length) continue;
    for (const title of titles.slice(0, 3)) {
      wikiTitleTried = title;
      const wiki = await wikiSummary(title);
      if (!wiki?.extract) continue;
      const extract = wiki.extract;
      sources.push(wiki.url || 'Wikipedia');
      displayName = wiki.title || displayName;
      shortDescription = extract.slice(0, 300);
      description += `## Overview (Wikipedia)\n${extract}\n\n`;
      if (wiki.image) {
        imageUrl = wiki.image;
        imageCandidates.push(wiki.image);
      }
      extractFeatureBullets(extract).forEach((f) => strengthSet.add(f));
      break;
    }
    if (shortDescription) break;
  }

  for (const variant of variants.slice(0, 3)) {
    const wd = await wikidataBlurb(variant);
    if (!wd?.description) continue;
    sources.push('Wikidata');
    if (!shortDescription) shortDescription = `${wd.label}: ${wd.description}`;
    description += `## Wikidata\n**${wd.label}** — ${wd.description}\n\n`;
    break;
  }

  if (!imageUrl || imageCandidates.length < 2) {
    for (const variant of variants.slice(0, 4)) {
      const imgs = await commonsImages(variant, 4);
      for (const img of imgs) {
        if (!imageCandidates.includes(img)) imageCandidates.push(img);
      }
      if (imgs.length) {
        sources.push('Wikimedia Commons');
        if (!imageUrl) imageUrl = imgs[0];
        break;
      }
    }
  }

  const serper = await serperEnrich(query);
  if (serper.prices.length || serper.snippets.length || serper.images.length) {
    sources.push('Google (Serper)');
    allPrices.push(...serper.prices);
    for (const sn of serper.snippets) {
      extractFeatureBullets(sn).forEach((f) => strengthSet.add(f));
      allPrices.push(...parseNaira(sn));
    }
    for (const img of serper.images) {
      if (img && !imageCandidates.includes(img)) imageCandidates.push(img);
    }
    if (!imageUrl && serper.images[0]) imageUrl = serper.images[0];
  }

  const { price, original } = pickBestPrice(allPrices);
  const offers = buildForcedOffers(query, price, original, serper.links);

  const strengths = Array.from(strengthSet).slice(0, 6);
  if (!strengths.length) {
    strengths.push('Open store links and confirm key specs before publishing');
    strengths.push('Compare Jumia vs Konga seller ratings');
  }

  const thingsToConsider = [
    'Live ₦ price is NOT auto-scraped from Jumia (blocked) — open the link and type the price in Edit',
    'Verify the image matches this exact model/variant',
    'Check storage/RAM and warranty before publishing',
  ];

  if (!shortDescription) {
    shortDescription = `${query} — research draft with Jumia/Amazon/Temu/Konga links. Confirm image and ₦ price before publishing.`;
  }

  const reviews = buildReviewSnippets(query, strengths, thingsToConsider, shortDescription);

  description += `## Shopper notes (synthesized)\n`;
  for (const r of reviews) {
    description += `**${r.title}** (${r.rating}/5 · ${r.sourceLabel})\n${r.body}\n\n`;
  }
  description += `## Where to buy (confirm live price)\n`;
  for (const o of offers) {
    description += `- **${o.storeName}**: ${o.productUrl}\n`;
  }

  const rawNotes = [
    `Query: ${query}`,
    `Variants tried: ${variants.join(' | ')}`,
    `Wiki title: ${wikiTitleTried}`,
    `Sources: ${uniqueStrings(sources).join(', ') || 'none'}`,
    `Image: ${imageUrl ? 'yes' : 'NO'} (${imageCandidates.length} candidates)`,
    `Prices parsed: ${allPrices.slice(0, 8).join(', ') || 'none — set manually in Edit'}`,
    `Offers forced: ${offers.length} (Jumia, Amazon, Temu, Konga)`,
    `Serper: ${process.env.SERPER_API_KEY ? 'configured' : 'not set'}`,
  ].join('\n');

  return {
    displayName,
    shortDescription,
    description: description.trim(),
    imageUrl: cleanImageUrl(imageUrl),
    imageCandidates: imageCandidates.map((u) => cleanImageUrl(u)).filter(Boolean) as string[],
    productUrl: offers[0].productUrl,
    price,
    originalPrice: original,
    strengths,
    thingsToConsider,
    bestFor: ['Draft workflow before publish', 'Nigeria multi-store comparison'],
    notIdealFor: ['Using draft ₦ as final without opening the store'],
    offers,
    reviews,
    sources: uniqueStrings(sources),
    rawNotes,
  };
}
