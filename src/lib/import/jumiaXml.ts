/**
 * Flexible Jumia / affiliate product XML parser.
 * Supports common feed shapes: <product>, <item>, Google Shopping-style tags.
 */

export type ParsedJumiaProduct = {
  externalId: string | null;
  name: string;
  price: number | null;
  originalPrice: number | null;
  productUrl: string | null;
  imageUrl: string | null;
  brand: string | null;
  category: string | null;
  description: string | null;
};

function decodeXmlEntities(s: string): string {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, '$1')
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .trim();
}

function tagValue(block: string, tags: string[]): string | null {
  for (const tag of tags) {
    const escaped = tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(
      '<(?:[A-Za-z0-9_]+:)?' + escaped + '(?:\\s[^>]*)?>([\\s\\S]*?)</(?:[A-Za-z0-9_]+:)?' + escaped + '>',
      'i'
    );
    const m = block.match(re);
    if (m?.[1]) {
      const v = decodeXmlEntities(m[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
      if (v) return v;
    }
    const attrRe = new RegExp(
      '<(?:[A-Za-z0-9_]+:)?' + escaped + '[^>]*(?:href|url|src)=["\']([^"\']+)["\']',
      'i'
    );
    const am = block.match(attrRe);
    if (am?.[1]) return decodeXmlEntities(am[1]);
  }
  return null;
}

function parsePrice(raw: string | null): number | null {
  if (!raw) return null;
  const cleaned = raw.replace(/[^\d.,]/g, '').replace(/,/g, '');
  if (!cleaned) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function extractBlocks(xml: string): string[] {
  const blocks: string[] = [];
  const re =
    /<(?:product|item|entry|offer)(?:\s[^>]*)?>[\s\S]*?<\/(?:product|item|entry|offer)>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null) {
    blocks.push(m[0]);
  }
  return blocks;
}

export function parseJumiaXml(xmlText: string): ParsedJumiaProduct[] {
  const xml = xmlText.replace(/^\uFEFF/, '').trim();
  if (!xml.includes('<')) {
    throw new Error('File does not look like XML.');
  }

  const blocks = extractBlocks(xml);
  if (!blocks.length) {
    throw new Error(
      'No <product> or <item> entries found. Export a Jumia product XML feed and try again.'
    );
  }

  const out: ParsedJumiaProduct[] = [];
  const seen = new Set<string>();

  for (const block of blocks) {
    const name =
      tagValue(block, ['title', 'name', 'product_name', 'productname']) || null;
    if (!name || name.length < 2) continue;

    const externalId =
      tagValue(block, ['product_id', 'id', 'sku', 'offer_id', 'mpn']) || null;

    const productUrl = tagValue(block, [
      'link',
      'product_url',
      'url',
      'deep_link',
      'affiliate_url',
      'click_url',
    ]);

    const imageUrl = tagValue(block, [
      'image_link',
      'image_url',
      'image',
      'picture',
      'thumbnail',
      'main_image',
    ]);

    const price =
      parsePrice(tagValue(block, ['sale_price', 'price'])) || null;
    const originalPrice =
      parsePrice(tagValue(block, ['original_price', 'list_price', 'regular_price'])) || null;

    const brand = tagValue(block, ['brand', 'manufacturer']);
    const category = tagValue(block, [
      'category',
      'product_type',
      'google_product_category',
    ]);
    const description = tagValue(block, [
      'description',
      'short_description',
      'summary',
    ]);

    const key = (externalId || productUrl || name).toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);

    out.push({
      externalId,
      name: name.slice(0, 200),
      price,
      originalPrice:
        originalPrice && price && originalPrice > price ? originalPrice : null,
      productUrl,
      imageUrl,
      brand: brand?.slice(0, 80) || null,
      category: category?.slice(0, 200) || null,
      description: description?.slice(0, 2000) || null,
    });
  }

  return out;
}

export function guessCategorySlug(
  categoryText: string | null,
  productName: string
): string | null {
  const hay = `${categoryText || ''} ${productName}`.toLowerCase();
  const rules: [RegExp, string][] = [
    [/smart\s*phone|mobile phone|android|iphone|phone/, 'smartphones'],
    [/laptop|notebook|macbook/, 'laptops'],
    [/tablet|ipad/, 'tablets'],
    [/earbud|headphone|earphone|speaker|audio|soundbar/, 'audio'],
    [/watch|wearable|band|fitness/, 'wearables'],
    [/\btv\b|television|smart tv/, 'tvs'],
    [/camera|dslr|gopro/, 'cameras'],
    [/console|ps5|xbox|nintendo|gaming/, 'gaming'],
    [/power\s*bank|charger|battery pack/, 'power-banks'],
    [/case|cable|charger|accessory|adapter|screen protector/, 'accessories'],
  ];
  for (const [re, slug] of rules) {
    if (re.test(hay)) return slug;
  }
  return null;
}

export function guessBrandSlug(
  brandText: string | null,
  productName: string
): string | null {
  const hay = `${brandText || ''} ${productName}`.toLowerCase();
  const brands = [
    'samsung',
    'apple',
    'xiaomi',
    'infinix',
    'tecno',
    'hp',
    'dell',
    'lenovo',
    'asus',
    'anker',
    'poco',
    'freeyond',
  ];
  for (const b of brands) {
    if (hay.includes(b)) return b;
  }
  return null;
}
