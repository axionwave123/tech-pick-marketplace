import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Download a remote image and store it in the product-images bucket.
 * Falls back to the original URL if upload fails (still usable if domain allowed).
 */
export async function persistProductImage(
  supabase: SupabaseClient,
  productId: string,
  remoteUrl: string,
  index = 0
): Promise<{ url: string; stored: boolean } | null> {
  if (!remoteUrl?.startsWith('http')) return null;

  // Prefer clean Wikimedia URLs without tracking params
  let source = remoteUrl;
  try {
    const u = new URL(remoteUrl);
    ['utm_source', 'utm_campaign', 'utm_content', 'utm_medium'].forEach((k) =>
      u.searchParams.delete(k)
    );
    source = u.toString();
  } catch {
    /* keep */
  }

  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 15000);
    const res = await fetch(source, {
      signal: ctrl.signal,
      headers: {
        'User-Agent': 'TechPickNG-Research/2.0',
        Accept: 'image/*,*/*',
      },
      redirect: 'follow',
    });
    clearTimeout(t);

    if (!res.ok) {
      return { url: source, stored: false };
    }

    const contentType = (res.headers.get('content-type') || 'image/jpeg').split(';')[0];
    if (!contentType.startsWith('image/')) {
      return { url: source, stored: false };
    }

    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 500 || buf.length > 4_500_000) {
      return { url: source, stored: false };
    }

    const ext =
      contentType.includes('png')
        ? 'png'
        : contentType.includes('webp')
          ? 'webp'
          : contentType.includes('gif')
            ? 'gif'
            : 'jpg';

    const path = `research/${productId}/${index}-${Date.now()}.${ext}`;

    const { error: upErr } = await supabase.storage.from('product-images').upload(path, buf, {
      contentType,
      upsert: true,
    });

    if (upErr) {
      console.error('storage upload failed', upErr.message);
      return { url: source, stored: false };
    }

    const { data } = supabase.storage.from('product-images').getPublicUrl(path);
    return { url: data.publicUrl || source, stored: true };
  } catch (e) {
    console.error('persistProductImage', e);
    return { url: source, stored: false };
  }
}
