/**
 * Flexible CSV / TSV parser for Amazon, Temu, Konga (and similar) affiliate product feeds.
 * Detects headers and maps common column aliases.
 */

export type ParsedFeedRow = {
  name: string;
  price: number | null;
  originalPrice: number | null;
  productUrl: string | null;
  imageUrl: string | null;
  brand: string | null;
};

const NAME_KEYS = ['name', 'title', 'product_name', 'productname', 'product title', 'item_name'];
const PRICE_KEYS = ['price', 'sale_price', 'sale price', 'current_price', 'amount', 'deal_price'];
const ORIGINAL_KEYS = ['original_price', 'list_price', 'regular_price', 'was_price', 'mrp'];
const URL_KEYS = [
  'url',
  'link',
  'product_url',
  'product url',
  'affiliate_url',
  'affiliate url',
  'tracking_url',
  'click_url',
  'deep_link',
];
const IMAGE_KEYS = ['image', 'image_url', 'image url', 'image_link', 'thumbnail', 'picture'];
const BRAND_KEYS = ['brand', 'manufacturer', 'make'];

function parsePrice(raw: string | null | undefined): number | null {
  if (!raw) return null;
  const cleaned = String(raw).replace(/[^\d.,]/g, '').replace(/,/g, '');
  if (!cleaned) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function splitLine(line: string, delim: string): string[] {
  const out: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (ch === delim && !inQuotes) {
      out.push(cur.trim());
      cur = '';
      continue;
    }
    cur += ch;
  }
  out.push(cur.trim());
  return out;
}

function detectDelimiter(headerLine: string): string {
  const commas = (headerLine.match(/,/g) || []).length;
  const tabs = (headerLine.match(/\t/g) || []).length;
  const semis = (headerLine.match(/;/g) || []).length;
  if (tabs >= commas && tabs >= semis && tabs > 0) return '\t';
  if (semis > commas) return ';';
  return ',';
}

function findCol(headers: string[], aliases: string[]): number {
  const lower = headers.map((h) => h.toLowerCase().trim());
  for (const a of aliases) {
    const i = lower.indexOf(a);
    if (i >= 0) return i;
  }
  for (let i = 0; i < lower.length; i++) {
    for (const a of aliases) {
      if (lower[i].includes(a) || a.includes(lower[i])) return i;
    }
  }
  return -1;
}

function cell(cols: string[], idx: number): string | null {
  if (idx < 0 || idx >= cols.length) return null;
  const v = cols[idx]?.trim();
  return v || null;
}

export function parseAffiliateCsv(text: string): ParsedFeedRow[] {
  const lines = text
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .map((l) => l.trimEnd())
    .filter((l) => l.trim().length > 0);

  if (lines.length < 2) {
    throw new Error('CSV needs a header row and at least one data row.');
  }

  const delim = detectDelimiter(lines[0]);
  const headers = splitLine(lines[0], delim).map((h) => h.replace(/^"|"$/g, ''));

  const nameIdx = findCol(headers, NAME_KEYS);
  const priceIdx = findCol(headers, PRICE_KEYS);
  const origIdx = findCol(headers, ORIGINAL_KEYS);
  const urlIdx = findCol(headers, URL_KEYS);
  const imageIdx = findCol(headers, IMAGE_KEYS);
  const brandIdx = findCol(headers, BRAND_KEYS);

  if (nameIdx < 0) {
    throw new Error(
      'Could not find a product name column. Use a header like name, title, or product_name.'
    );
  }

  const out: ParsedFeedRow[] = [];
  const seen = new Set<string>();

  for (let i = 1; i < lines.length; i++) {
    const cols = splitLine(lines[i], delim).map((c) => c.replace(/^"|"$/g, ''));
    const name = cell(cols, nameIdx);
    if (!name || name.length < 2) continue;

    const price = parsePrice(cell(cols, priceIdx));
    const originalPrice = parsePrice(cell(cols, origIdx));
    const productUrl = cell(cols, urlIdx);
    const imageUrl = cell(cols, imageIdx);
    const brand = cell(cols, brandIdx);

    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);

    out.push({
      name: name.slice(0, 220),
      price,
      originalPrice:
        originalPrice && price && originalPrice > price ? originalPrice : null,
      productUrl,
      imageUrl: imageUrl && /^https?:\/\//i.test(imageUrl) ? imageUrl : null,
      brand: brand?.slice(0, 80) || null,
    });
  }

  return out;
}

export function parseAffiliateXmlLoose(xmlText: string): ParsedFeedRow[] {
  const blocks =
    xmlText.match(
      /<(?:product|item|entry|offer)(?:\s[^>]*)?>[\s\S]*?<\/(?:product|item|entry|offer)>/gi
    ) || [];

  if (!blocks.length) {
    throw new Error('No product rows found in XML. Prefer CSV with name, price, url columns.');
  }

  function tag(block: string, names: string[]): string | null {
    for (const n of names) {
      const re = new RegExp(
        '<(?:[A-Za-z0-9_]+:)?' + n + '(?:\\s[^>]*)?>([\\s\\S]*?)</(?:[A-Za-z0-9_]+:)?' + n + '>',
        'i'
      );
      const m = block.match(re);
      if (m?.[1]) {
        const v = m[1]
          .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, '$1')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        if (v) return v;
      }
    }
    return null;
  }

  const out: ParsedFeedRow[] = [];
  for (const block of blocks) {
    const name = tag(block, ['title', 'name', 'product_name']);
    if (!name) continue;
    const price = parsePrice(tag(block, ['sale_price', 'price']));
    const originalPrice = parsePrice(tag(block, ['original_price', 'list_price', 'regular_price']));
    const productUrl = tag(block, ['link', 'url', 'product_url', 'affiliate_url', 'click_url']);
    const imageUrl = tag(block, ['image_link', 'image_url', 'image']);
    const brand = tag(block, ['brand', 'manufacturer']);
    out.push({
      name: name.slice(0, 220),
      price,
      originalPrice:
        originalPrice && price && originalPrice > price ? originalPrice : null,
      productUrl,
      imageUrl: imageUrl && /^https?:\/\//i.test(imageUrl) ? imageUrl : null,
      brand: brand?.slice(0, 80) || null,
    });
  }
  return out;
}
