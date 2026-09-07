import { createClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { ArticlesFilter } from '@/components/articles/ArticlesFilter';
import { Orbitron } from 'next/font/google';

const orbitron = Orbitron({
  subsets: ['latin'],
  weight: ['600', '700', '800', '900'],
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
    <div className="min-h-[70vh] bg-[#07080c] light:bg-[#f3f5f9]">
      {/* Hero — mature editorial */}
      <section className="relative overflow-hidden border-b border-white/[0.07] light:border-slate-200/90">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_18%_0%,rgba(47,107,255,0.16),transparent_55%)] light:bg-[radial-gradient(ellipse_90%_70%_at_18%_0%,rgba(37,99,235,0.08),transparent_55%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 top-0 h-64 w-64 rounded-full bg-sky-500/10 blur-3xl light:bg-sky-400/15"
        />

        <div className="relative mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-300 backdrop-blur-md light:border-slate-200 light:bg-white light:text-slate-600 light:shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-[#3b82f6]" />
            Editorial
          </span>

          {/* Blue plate image sits BEHIND the robotic lettering */}
          <div className="relative mt-6 inline-block max-w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://litter.catbox.moe/zhk4ht.png"
              alt=""
              className="pointer-events-none absolute -inset-x-6 -inset-y-5 h-[calc(100%+2.5rem)] w-[calc(100%+3rem)] scale-110 rounded-2xl object-cover object-center opacity-70 light:opacity-25"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-x-6 -inset-y-5 rounded-2xl bg-gradient-to-r from-[#07080c]/55 via-[#07080c]/25 to-[#07080c]/55 light:from-white/70 light:via-white/40 light:to-white/70"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-x-2 -inset-y-1 rounded-xl bg-[#2f6bff]/25 blur-xl light:bg-brand-400/20"
            />

            <h1
              className={`${orbitron.className} relative text-[1.5rem] font-extrabold uppercase leading-[1.2] tracking-[0.08em] text-white light:text-slate-900 sm:text-[2.05rem] sm:leading-[1.15]`}
              style={{
                textShadow:
                  '0 0 28px rgba(47,107,255,0.55), 0 1px 2px rgba(0,0,0,0.65)',
              }}
            >
              Articles & Buying Guides
            </h1>
          </div>

          <p className="mt-5 max-w-md text-[14px] leading-relaxed text-slate-400 light:text-slate-600 sm:text-[15px]">
            Clear budgets, real needs, and honest picks for shoppers in Nigeria.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-4 py-7 sm:px-6 sm:py-9 lg:px-8">
        {articles.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/12 bg-white/[0.03] px-6 py-20 text-center light:border-slate-300 light:bg-white light:shadow-sm">
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
