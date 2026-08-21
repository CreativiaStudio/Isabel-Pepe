# Original User Request

## 2026-08-21T15:57:58Z

Execute Phase 1 of the Isabel Pepe Pre-Launch Master Checklist (Cybersecurity & SEO Foundations):

Working directory: c:/Users/mario/Progetti Antigravity/isabel-pepe
Integrity mode: development

## Requirements

### R1. Authoritative Checkout Price Validation (Shield against Price Tampering)
- In `app/api/checkout/route.ts`, extract all product IDs from the incoming cart payload.
- Query the Supabase `products` table (`id`, `name`, `price`, `discount_price`, `stock`, `is_active`) using `supabaseAdmin`.
- For each item in the cart, compute the unit price exclusively from `product.discount_price > 0 ? product.discount_price : product.price` found in Supabase. Strictly ignore and discard any `price` sent in the request body.
- If an item is not found or not active in the database, return a clear 400 error.
- Recompute the overall `totalAmount` for `abandoned_carts` strictly from database prices.

### R2. Strict Admin & AI API Security Guard
- Create `lib/auth-guard.ts` with `verifyAdminAuth()` checking that the incoming request has a valid Supabase session belonging to an authorized admin email (`sviluppo@creativiastudio.com`, `info@isabelpepe.com`, `mario@isabelpepe.com`, `mariopepe9@hotmail.it`).
- Apply this guard across `app/api/admin/products/route.ts`, `app/api/admin/identity/route.ts`, `app/api/admin/verify-certificates/route.ts`, `app/api/admin/analytics/*` (`funnel`, `geo`, `pages`, `sources`, `stream`, `summary`, `timeseries`), and `app/api/jarvis/*` (`route.ts`, `execute/route.ts`, `speak/route.ts`).
- Create/update root `middleware.ts` to enforce Supabase session handling and block unauthenticated access to `/admin` and `/api/admin/*`.

### R3. OWASP Security Headers in `next.config.ts`
- Configure the `headers()` async function in `next.config.ts` applying:
  - `X-DNS-Prefetch-Control: on`
  - `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
  - `X-Frame-Options: SAMEORIGIN`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: origin-when-cross-origin`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=()`

### R4. Dynamic Sitemap & Robots.txt for Google Search Console
- Create `app/sitemap.ts` fetching all active products (`is_active = true`) from Supabase and combining with all static pages (`/`, `/shop`, `/chi-siamo`, `/impegno-animali`, `/cura-gioielli`, `/assistenza-clienti`, `/garanzia`, `/guida-taglie`, `/spedizioni-resi`, `/termini-condizioni`, `/privacy`, `/cookie-policy`) with changeFrequency and priority.
- Create `app/robots.ts` allowing indexing of public pages, disallowing `/admin`, `/api`, `/account`, and referencing `https://www.isabelpepe.com/sitemap.xml`.

## Acceptance Criteria
- [ ] An adversarial test confirms that sending arbitrary prices to `POST /api/checkout` results in a Stripe checkout session with authentic DB prices.
- [ ] Unauthenticated requests to `/api/admin/products`, `/api/admin/analytics/summary`, and `/api/jarvis` return 401 Unauthorized.
- [ ] `next.config.ts` headers are active and valid.
- [ ] `app/sitemap.ts` and `app/robots.ts` build cleanly and generate valid responses.
- [ ] `npm run build` succeeds with 0 TypeScript and Turbopack errors.
