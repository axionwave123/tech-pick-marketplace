# TechPick NG (tech-pick-marketplace)

Product discovery, reviews, price comparison, deals, and multi-store affiliate platform for technology products — built for Nigeria first, architected to expand categories and retailers.

**Stack:** Next.js 14 · TypeScript · Tailwind CSS · Supabase (PostgreSQL, Auth, RLS) · Vercel-ready

Repository: [github.com/axionwave123/tech-pick-marketplace](https://github.com/axionwave123/tech-pick-marketplace)

---

## Features

### Public
- Home (search, categories, trending, deals, articles)
- Search results
- Category pages (reusable template)
- Product pages (specs, editorial analysis, multi-store offers, affiliate CTAs)
- Price comparison with last-checked timestamps
- Deals, Articles, Reviews hubs
- Compare scaffold, Store pages, Profile, About, Contact

### Admin (RLS + server checks)
- Login at `/admin/login`
- Dashboard metrics
- Products, editorial reviews, articles, stores, offers
- AI Research workspace (approve before publish)
- Community moderation
- Analytics event model

### Data model
Normalized schema: products independent of stores; many offers per product; editorial vs community reviews separated; research runs + source attribution; analytics events.

---

## Quick start

### 1. Clone & install

```bash
git clone https://github.com/axionwave123/tech-pick-marketplace.git
cd tech-pick-marketplace
npm install
```

### 2. Supabase project

1. Create a project at [supabase.com](https://supabase.com)
2. In SQL Editor, run in order:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_rls_policies.sql`
   - `supabase/seed.sql` (demo data — labeled as demo; affiliate URLs are placeholders)
3. Enable Email auth (Authentication → Providers)

### 3. Environment

```bash
cp .env.example .env.local
```

Fill in:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Never commit real secrets.

### 4. Become the first admin

1. Sign up a user via Supabase Auth (or your app auth flow).
2. In SQL Editor:

```sql
INSERT INTO public.profiles (id, email, full_name)
SELECT id, email, raw_user_meta_data->>'full_name'
FROM auth.users
WHERE email = 'you@example.com'
ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

INSERT INTO public.admin_roles (user_id, role)
SELECT id, 'super_admin' FROM auth.users WHERE email = 'you@example.com'
ON CONFLICT DO NOTHING;
```

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) · Admin: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

---

## Deploy (Vercel)

1. Import the GitHub repo in Vercel
2. Set the same environment variables
3. Deploy

Compatible with Supabase + Vercel edge/serverless.

---

## Important product rules

- Do **not** invent specs, prices, or reviews
- Do **not** claim physical testing unless documented
- Affiliate demo links are **placeholders**
- Wording: “Best deal we found” among partner stores — not “cheapest on the internet”
- AI research requires **admin approval** before publish

---

## Project structure

```
src/
  app/           # App Router — public + admin routes
  components/    # UI, layout, product cards
  lib/           # Supabase, auth, data, AI providers, utils
  types/         # Shared TypeScript types
supabase/
  migrations/    # Schema + RLS
  seed.sql       # Demo data
```

---

## Roadmap hooks already in schema

- Multi-store affiliate programs with per-network tracking templates
- Price history
- Research runs / results with confidence + sources
- Analytics events for affiliate clicks
- Category-scoped specification definitions for comparisons

---

## License

Private/commercial use as you decide. Demo seed content is illustrative only.
