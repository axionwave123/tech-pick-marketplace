/**
 * Lightweight web research for AI Research drafts.
 * Pulls public search/Wikipedia data — never auto-publishes.
 */

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
  sources: string[];
  rawNotes: string;
};

const UA =
  'Mozilla/5.0 (compatible; TechPickNG/1.0; +https://tech-pick-marketplace-woad.vercel.app)';

function parseNaira(text: string): number[] {
  const out: number[] = [];
  const re = /₦\s*([\d,]+(?:\.\d+)?)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const n = Number(m[1].replace(/,/g, ''));
    if (n >= 1000 && n <= 50_000_000) out.push(Math.round(n));
  }
  // NGN / N forms
  const re2 = /(?:NGN|N)\s*([\d,]+)/gi;
  while ((m = re2.exec(text))) {
    const n = Number(m[1].replace(/,/g, ''));
    if (n >= 1000 && n <= 50_000_000) out.push(Math.round(n));
  }
  return out;
}

function extractJumiaUrls(html: string): string[] {
  const urls = new Set<string>();
  const re = /https?:\/\/(?:www\.)?jumia\.com\.ng\/[a-zA-Z0-9\-._~:/?#\[\]@!$&'()*+,;=%]+/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    let u = m[0].replace(/[),.]+$/, '');
    // skip pure catalog/home
    if (/\/catalog\/?\?/.test(u) || u.endsWith('jumia.com.ng/')) continue;
    if (u.includes('/mlp-') || u.includes('/category')) continue;
    urls.add(u.split('&')[0]);
  }
  // encoded in uddg=
  const re2 = /uddg=([^&"']+)/g;
  while ((m = re2.exec(html))) {
    try {
      const decoded = decodeURIComponent(m[1]);
      if (decoded.includes('jumia.com.ng') && !decoded.includes('/catalog/?')) {
        urls.add(decoded.split('&')[0]);
      }
    } catch {
      /* ignore */
    }
  }
  return [...urls];
}

function extractImageUrls(html: string): string[] {
  const urls = new Set<string>();
  const re =
    /https?:\/\/[^"'\s]+\.(?:jpg|jpeg|png|webp)(?:\?[^"'\s]*)?/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const u = m[0];
    if (/logo|icon|sprite|pixel|1x1|avatar|badge/i.test(u)) continue;
    if (u.length > 8) urls.add(u);
  }
  // Jumia CDN patterns
  const reJ = /https?:\/\/[^"'\s]*jumia[^"'\s]*\.(?:jpg|jpeg|png|webp)[^"'\s]*/gi;
  while ((m = reJ.exec(html))) urls.add(m[0]);
  return [...urls].slice(0, 10);
}

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
      next: { revalidate: 0 },
    });
    clearTimeout(t);
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

async function wikiSummary(query: string): Promise<{
  title?: string;
  extract?: string;
  image?: string;
  url?: string;
} | null> {
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query.replace(/\s+/g, '_'))}`;
  const text = await fetchText(url, 8000);
  if (!text) return null;
  try {
    const j = JSON.parse(text);
    if (j.type === 'disambiguation' || j.title === 'Not found.') return null;
    return {
      title: j.title,
      extract: j.extract,
      image: j.thumbnail?.source || j.originalimage?.source,
      url: j.content_urls?.desktop?.page,
    };
  } catch {
    return null;
  }
}

async function duckDuckGoHtml(query: string): Promise<string | null> {
  return fetchText(
    `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`,
    12000
  );
}

async function duckDuckGoJson(query: string): Promise<{
  Abstract?: string;
  AbstractText?: string;
  Image?: string;
  AbstractURL?: string;
  Heading?: string;
  RelatedTopics?: { Text?: string; FirstURL?: string }[];
} | null> {
  const text = await fetchText(
    `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`,
    8000
  );
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function pickBestPrice(prices: number[]): { price: number | null; original: number | null } {
  if (!prices.length) return { price: null, original: null };
  const sorted = [...prices].sort((a, b) => a - b);
  // Prefer mid-low range to avoid accessories / outliers
  const filtered = sorted.filter((p) => p >= 5000);
  const use = filtered.length ? filtered : sorted;
  const price = use[0];
  const original = use.length > 1 ? use[use.length - 1] : null;
  return { price, original: original && original > price ? original : null };
}

function extractFeatureBullets(text: string): string[] {
  const lines = text
    .split(/[\n•·\-]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 12 && s.length < 120);
  const features = lines.filter((s) =>
    /\d|GB|RAM|mAh|MP|Hz|Android|display|battery|camera|processor|storage/i.test(s)
  );
  return [...new Set(features)].slice(0, 6);
}

export async function researchProductFromWeb(query: string): Promise<WebResearchResult> {
  const sources: string[] = [];
  const allPrices: number[] = [];
  const jumiaUrls: string[] = [];
  let imageUrl: string | null = null;
  let shortDescription = '';
  let description = '';
  let displayName = query;
  const strengthSet = new Set<string>();

  const qJumia = `${query} site:jumia.com.ng Nigeria price`;
  const qPrice = `${query} price Nigeria Jumia`;

  const [wiki, ddgJson, ddgHtml, ddgJumiaHtml] = await Promise.all([
    wikiSummary(query),
    duckDuckGoJson(query),
    duckDuckGoHtml(qPrice),
    duckDuckGoHtml(qJumia),
  ]);

  if (wiki?.extract) {
    sources.push(wiki.url || 'Wikipedia');
    shortDescription = wiki.extract.slice(0, 280);
    description += wiki.extract + '\n\n';
    if (wiki.image) imageUrl = wiki.image;
    if (wiki.title) displayName = wiki.title;
    extractFeatureBullets(wiki.extract).forEach((f) => strengthSet.add(f));
  }

  if (ddgJson?.AbstractText) {
    sources.push(ddgJson.AbstractURL || 'DuckDuckGo');
    if (!shortDescription) shortDescription = ddgJson.AbstractText.slice(0, 280);
    description += ddgJson.AbstractText + '\n\n';
    if (!imageUrl && ddgJson.Image) {
      imageUrl = ddgJson.Image.startsWith('http')
        ? ddgJson.Image
        : `https://duckduckgo.com${ddgJson.Image}`;
    }
    if (ddgJson.Heading) displayName = ddgJson.Heading;
  }

  for (const html of [ddgHtml, ddgJumiaHtml]) {
    if (!html) continue;
    sources.push('Web search');
    allPrices.push(...parseNaira(html));
    jumiaUrls.push(...extractJumiaUrls(html));
    if (!imageUrl) {
      const imgs = extractImageUrls(html);
      const preferred =
        imgs.find((u) => /jumia|product|phone|laptop/i.test(u)) || imgs[0];
      if (preferred) imageUrl = preferred;
    }
    extractFeatureBullets(html.replace(/<[^>]+>/g, ' ')).forEach((f) => strengthSet.add(f));
  }

  // Optional: Serper / Brave if env keys exist (richer results)
  const serperKey = process.env.SERPER_API_KEY;
  if (serperKey) {
    try {
      const res = await fetch('https://google.serper.dev/search', {
        method: 'POST',
        headers: { 'X-API-KEY': serperKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({ q: qPrice, gl: 'ng', num: 8 }),
      });
      if (res.ok) {
        const data = await res.json();
        sources.push('Google (Serper)');
        const blob = JSON.stringify(data);
        allPrices.push(...parseNaira(blob));
        jumiaUrls.push(...extractJumiaUrls(blob));
        for (const item of data.organic || []) {
          if (item.snippet) {
            allPrices.push(...parseNaira(item.snippet));
            extractFeatureBullets(item.snippet).forEach((f) => strengthSet.add(f));
          }
          if (item.link?.includes('jumia.com.ng')) jumiaUrls.unshift(item.link);
        }
      }
    } catch {
      /* optional */
    }
  }

  const { price, original } = pickBestPrice(allPrices);
  const productUrl =
    jumiaUrls[0] ||
    `https://www.jumia.com.ng/catalog/?q=${encodeURIComponent(query)}`;

  // Image fallback: open product-looking Unsplash only as last resort label not product photo
  // Prefer null so admin can upload real image if web found nothing solid
  if (imageUrl && /sprite|logo|icon/i.test(imageUrl)) imageUrl = null;

  const strengths = [...strengthSet].slice(0, 6);
  if (!strengths.length) {
    strengths.push('Verify key specs on the retailer page before publishing');
  }

  const rawNotes = [
    `Query: ${query}`,
    `Sources: ${[...new Set(sources)].join(', ') || 'none'}`,
    `Prices seen: ${allPrices.slice(0, 8).join(', ') || 'none'}`,
    `Jumia links found: ${jumiaUrls.length}`,
    `Image: ${imageUrl ? 'yes' : 'no'}`,
    `Selected price: ${price ?? 'n/a'}`,
  ].join('\n');

  if (!shortDescription) {
    shortDescription = `Research draft for ${query}. Review price and image before publishing.`;
  }

  description =
    description.trim() ||
    `Auto-research draft for ${query}. Confirm details on Jumia/Amazon before publishing.`;

  return {
    displayName,
    shortDescription,
    description,
    imageUrl,
    productUrl,
    price,
    originalPrice: original,
    strengths,
    thingsToConsider: [
      'Confirm current price on the retailer site (prices change often)',
      'Verify the image matches this exact model/variant',
      'Check storage/RAM variant before publishing',
    ],
    sources: [...new Set(sources)],
    rawNotes,
  };
}
