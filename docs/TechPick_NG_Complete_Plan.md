# TechPick NG — Complete Product & Technical Plan

**Document purpose:** Full record of the original plan so you can check completeness.
**Source:** Your original specification (product discovery / affiliate platform brief).
**Repo:** tech-pick-marketplace

---

## 1. Business idea

**Name:** TechPick NG

**Type:** Product-discovery, product-review, price-comparison, deals, and affiliate platform.

**Initial focus — technology products:**
- Smartphones
- Laptops
- Tablets
- Earbuds / headphones
- Smartwatches
- TVs
- Cameras
- Gaming products
- Computer accessories
- Power banks
- Other electronics

**Expansion:** Architecture must support other product categories later (not tech-only forever).

**First affiliate/store partner:** Jumia — but architecture must **not** be designed only around Jumia.

**Future partners:** Amazon and other legitimate affiliate programs. Multi-store from day one in the data model.

### Core user journey

1. User searches for a product
2. Sees product information
3. Reads TechPick analysis / reviews
4. Sees community opinions
5. Compares products
6. Compares available store prices / offers
7. Chooses a store
8. Clicks an affiliate link
9. Is sent to the retailer’s product page to complete the purchase

**TechPick NG does NOT process payment or checkout.**

---

## 2. Technology stack

| Layer | Choice |
|--------|--------|
| Framework | Next.js |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Backend / DB | Supabase + PostgreSQL |
| Auth | Supabase Auth |
| Files | Supabase Storage (where appropriate) |
| Hosting | Vercel-compatible |
| Source control | GitHub-compatible project structure |

**Devices:** Mobile, tablet, desktop — mobile should feel like a polished modern app while remaining a website.

---

## 3. Public website screens

### 3.1 Home
- TechPick NG branding
- Large search bar
- Product categories
- Trending products
- Popular comparisons
- Latest articles
- Best deals
- Recommended products

### 3.2 Search results
- Search query display
- Product cards (images, ratings, prices, discounts, available stores)
- Filters, sorting, pagination

### 3.3 Category page (reusable template)
Phones, Laptops, TVs, Audio, Gaming, Cameras, Appliances, and future categories. Filtering and sorting.

### 3.4 Product page (critical)
- Name, brand, images, rating, specifications
- What makes it stand out, strengths, things to consider
- TechPick editorial analysis, community opinions
- Related articles, similar products, Compare button
- Available stores, price comparison, discounts
- Affiliate buttons (e.g. Check Price on Jumia / Amazon) with each retailer’s tracking URL

### 3.5 Product comparison
Price, Display, RAM, Storage, Battery, Camera, Processor, and other category-specific specs.

### 3.6 Price comparison
Per store: current price, original price, discount, availability, last checked, affiliate link.
Wording: “Best deal we found” — not “cheapest on the entire internet” unless data supports it.

### 3.7 Deals & discounts
Product, original/current price, discount, store, expiration when known, View Deal.

### 3.8–3.9 Articles hub & article page
Buying guides, comparisons, how-to, tips, news. Title, image, content, product recs, affiliate buttons, related articles.

### 3.10–3.11 Reviews hub & review page
Editorial reviews. Overview, specs, strengths, considerations, performance areas, verdict, community opinions.
Do not claim physical testing unless supplied. AI analysis needs sources.

### 3.12 Store page
Reusable for Jumia, Amazon, future partners — not hard-coded to one store.

### 3.13 User profile
Save products, save comparisons, view comments/reviews, manage account.

### 3.14 About
What TechPick does, how data is collected, recommendations, price comparison, affiliate disclosure.

### 3.15 Contact / Help
Contact form, FAQ, report incorrect info/price, general support.

---

## 4. Private admin system

Secure: Supabase Auth + roles + RLS. Not “hide the URL.”

- `/admin/login` → `/admin/dashboard` when authorized
- Dashboard metrics (products, articles, reviews, offers, AI pending, clicks, etc.)
- Product management + full editor + AI Research (approve/edit/reject/draft — never auto-publish)
- Editorial reviews, articles, stores & affiliate programs, offers & prices
- Community moderation (separate from editorial)
- Analytics (views, searches, affiliate clicks, etc.)
- You as first admin; more admins addable later without rewriting auth

---

## 5. Database (normalized PostgreSQL / Supabase)

Entities include: profiles, admin_roles, products, brands, categories, specs, images, stores, affiliate_programs, product_offers, price_history, editorial_reviews, user_reviews, comments, articles, tags, sources, research_runs/results, moderation, analytics_events.

Products independent of stores. One product → many offers.

---

## 6. Reviews

- **Editorial:** official TechPick analysis (users cannot edit)
- **Community:** user ratings/comments with moderation status

---

## 7. AI pipeline

Approved source → retrieval → extraction → structured data + sources → validation → **admin approval** → DB → public site.
Provider abstraction for future data sources.

---

## 8. Search

Product name search; design for filters like price, RAM, storage, “gaming laptops,” etc.

---

## 9. Security

Auth, admin roles, RLS, server checks, protected routes, env secrets, no keys in frontend, validation.

---

## 10. UI/UX

Public: modern, premium, mobile-first. Admin: usability first.

---

## 11. Data rules

No invented specs/prices/reviews. No fake testing claims. Source attribution. Last-checked on prices.

---

## 12. Scalability

100 → 1,000 → 10,000+ products. Indexes, pagination, reusable templates.

---

## 13–15. Structure, seed, deployment

Professional folder structure. Labeled demo seed (placeholder affiliate URLs). GitHub + Vercel + Supabase. No secrets in repo.

---

## Delivered vs remaining

**Delivered:** Repo architecture, schema/RLS/seed SQL, public + admin shells, multi-store model, Vercel-deployable app.

**You still do:** Supabase project + Vercel env vars + run SQL; then CRUD, real content, affiliate URLs, AI provider, compare/filters/auth polish.

---

*Open this file on GitHub: docs/TechPick_NG_Complete_Plan.md*
