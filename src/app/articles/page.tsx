import { createClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { ArticlesFilter } from '@/components/articles/ArticlesFilter';
import { Orbitron } from 'next/font/google';

const orbitron = Orbitron({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  display: 'swap',
});

export const metadata = {
  title: 'Articles & Buying Guides',
  description:
    'Honest buying guides, comparisons and tech tips to help you buy smarter in Nigeria.',
};
export const dynamic = 'force-dynamic';

export default async function ArticlesHub() {
  let articles: {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    article_type: string | null;
    featured_image_url: string | null;
    published_at: string | null;
    filter_category: string | null;
    filter_price: string | null;
    filter_need: string | null;
  }[] = [];

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data } = await supabase
        .from('articles')
        .select(
          'id, title, slug, excerpt, article_type, featured_image_url, published_at, filter_category, filter_price, filter_need'
        )
        .eq('status', 'published')
        .order('published_at', { ascending: false });
      articles = data || [];
    } catch {
      articles = [];
    }
  }

  return (
    <div className="min-h-[70vh] bg-[#08090e] light:bg-[#f4f6fa]">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/[0.08] light:border-slate-200/90">
        {/* Blue circuit / tech plate behind the lettering */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://litter.catbox.moe/zhk4ht.png"
          alt=""
          className="pointer-events-none absolute inset-0 h-full w-full scale-[1.08] object-cover object-[center_35%] opacity-[0.55] light:opacity-[0.18]"
        />
        {/* Deep scrim — keeps the page mature, not washed out */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#06070c]/50 via-[#08090e]/75 to-[#08090e] light:from-white/60 light:via-[#f4f6fa]/88 light:to-[#f4f6fa]"
        />
        {/* Focused blue bloom behind the headline only */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-[42%] h-[220px] w-[min(92%,520px)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#2f6bff]/35 blur-[70px] light:bg-brand-400/25"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute left-[12%] top-[38%] h-28 w-28 rounded-full bg-sky-400/20 blur-3xl light:bg-sky-300/20"
        />

        <div className="relative mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#2f6bff]/35 bg-[#0c1224]/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9db7ff] backdrop-blur-md light:border-brand-200 light:bg-white/95 light:text-brand-700 light:shadow-sm">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#2f6bff] opacity-50" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#2f6bff]" />
            </span>
            Editorial
          </span>

          {/* Robotic lettering with blue plate sitting behind it */}
          <div className="relative mt-5 inline-block max-w-full">
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-x-4 -inset-y-3 rounded-2xl bg-[#2f6bff]/18 blur-2xl light:bg-brand-400/20"
            />
            <h1
              className={`${orbitron.className} relative text-[1.55rem] font-bold uppercase leading-[1.18] tracking-[0.06em] text-white light:text-slate-900 sm:text-[2.15rem] sm:leading-[1.15]`}
              style={{
                textShadow:
                  '0 0 40px rgba(47,107,255,0.45), 0 2px 12px rgba(0,0,0,0.55)',
              }}
            >
              Articles &amp; Buying Guides
            </h1>
          </div>

          <p className="mt-4 max-w-md text-[14px] leading-relaxed text-slate-400 light:text-slate-600 sm:text-[15px]">
            Clear budgets, real needs, and honest picks for shoppers in Nigeria.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-4 py-7 sm:px-6 sm:py-9 lg:px-8">
        {articles.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/12 bg-white/[0.03] px-6 py-20 text-center backdrop-blur-md light:border-slate-300 light:bg-white light:shadow-sm">
            <p className="text-sm font-medium text-zinc-400 light:text-slate-600">
              No published guides yet — check back soon.
            </p>
          </div>
        ) : (
          <ArticlesFilter articles={articles} />
        )}
      </div>
    </div>
  );
}
