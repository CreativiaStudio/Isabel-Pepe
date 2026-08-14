# Audit Report: Security (R4), Legal & GDPR (R5), and SEO & Performance (R6)

**Target System:** Isabel Pepe E-Commerce (`isabel-pepe-v2`)  
**Audit Date:** 2026-07-29  
**Auditor:** Explorer 3 (Security, Legal/GDPR, SEO & Performance Auditor)  
**Status:** High Risk Findings Identified — Action Required Before Public Go-Live

---

## 1. Executive Summary

This comprehensive audit evaluates the readiness of the Isabel Pepe e-commerce platform across three critical pillars:
1. **R4 Security & Data Protection:** Critical security vulnerabilities were discovered, including commented-out authentication guards on `/admin` and `/account`, missing input validation schemas (Zod), absent API rate-limiting, raw text tracking without hash/anonymization, and exposed credentials in `.env.local`.
2. **R5 GDPR & Legal Compliance:** The platform completely lacks legal compliance infrastructure. Missing elements include statutory footer company details (P.IVA, REA, Cap. Soc., Legal Address), mandatory legal policy pages (Privacy, Terms of Sale, Cookie, 14-day Return Policy), cookie consent banner, and server-side consent enforcement.
3. **R6 SEO, Analytics & Performance:** While basic Next.js dynamic metadata is present on product pages, the global metadata is generic boilerplate ("Create Next App"). `sitemap.xml` and `robots.txt` are entirely missing. Web analytics/pixels (GTM, Meta Pixel, GA4, CAPI) are unintegrated, and unoptimized standard `<img>` tags are used extensively in core pages.

---

## 2. R4 Security & Data Protection Audit

### 2.1 Environment Configuration & Secret Management
* **File Examined:** `.env.local`
* **Findings:**
  * `.env.example` does NOT exist in the repository root. (Missing template for deployment).
  * `.env.local` contains active production/test keys: Supabase Service Role Key (`SUPABASE_SERVICE_ROLE_KEY`), Cloudflare R2 secret access key (`R2_SECRET_ACCESS_KEY`), Stripe Secret Key (`STRIPE_SECRET_KEY`), Anthropic API Key (`ANTHROPIC_API_KEY`), ElevenLabs API Key (`ELEVENLABS_API_KEY`), and direct DB connection string with hardcoded password `SUPABASE_DB_URL`.
  * `STRIPE_WEBHOOK_SECRET` is set to placeholder string `"inserisci_qui_il_webhook_secret_di_stripe"`.
* **Risk Level:** **HIGH**
* **Recommendation:** Create `.env.example` with sanitized placeholders. Rotate all API keys before production launch and configure proper environment variables in host provider (Vercel/Cloudflare).

### 2.2 Route Protection & Authorization (Middleware & Pages)
* **Files Examined:** `proxy.ts` (lines 35–42), `app/admin/page.tsx` (lines 12–17), `app/account/page.tsx` (lines 11–14)
* **Findings:**
  * **Critical Bypass in Middleware (`proxy.ts`):** Lines 35–42 show admin authentication logic is commented out:
    ```typescript
    // PROTEZIONE ADMIN: temporaneamente disabilitata per dev/demo locale
    // const ADMIN_EMAILS = ['sviluppo@creativiastudio.com']
    // if (request.nextUrl.pathname.startsWith('/admin')) { ... }
    ```
  * **Critical Bypass in Admin Page (`app/admin/page.tsx`):** Lines 12–17 show server-side admin check is also commented out:
    ```typescript
    // PROTEZIONE SERVER-SIDE: Temporaneamente disabilitata per dev/demo locale
    // const supabaseAuth = await createClient();
    // const { data: { user } } = await supabaseAuth.auth.getUser();
    // if (!user || !ADMIN_EMAILS.includes(user.email || '')) { redirect('/login'); }
    ```
  * **Impact:** Anyone accessing `/admin` gets full read access to products, orders, customer records, and abandoned carts, as well as access to administrative Server Actions (`addProduct`, `deleteProduct`, `updateOrderStatus`, `getMediaLibrary`).
* **Risk Level:** **CRITICAL**

### 2.3 Input Validation & Schemas
* **Files Examined:** `app/api/checkout/route.ts`, `app/api/coupons/validate/route.ts`, `app/api/track/route.ts`, `app/admin/actions.ts`
* **Findings:**
  * No Zod schema library or structural input validation is used across API routes or Server Actions.
  * Inputs are manually cast/parsed (e.g., `req.json()`, `formData.get()`, `parseFloat()`).
  * In `app/api/checkout/route.ts` (lines 99–105), client-supplied cart items are trusted and serialized directly into Stripe metadata.
* **Risk Level:** **MEDIUM**

### 2.4 CSRF / CORS & Rate Limiting
* **Files Examined:** `proxy.ts`, `next.config.ts`, `app/api/*`
* **Findings:**
  * Rate limiting is completely absent across all public endpoints (`/api/checkout`, `/api/coupons/validate`, `/api/track`, `/api/jarvis`).
  * Threat of brute-force on `/api/coupons/validate` (testing discount codes) or DoS on `/api/track` and AI endpoints (`/api/jarvis`).
* **Risk Level:** **MEDIUM-HIGH**

### 2.5 Session Security & Data Hashing/Encryption
* **Files Examined:** `components/Tracker.tsx` (lines 6–23), `app/api/track/route.ts` (lines 18–24)
* **Findings:**
  * `Tracker.tsx` generates an unhashed `visitorId` using `Math.random()` and timestamps, stored in `localStorage` as `isabel_visitor_id`.
  * IP anonymization or user-agent hashing is not implemented before saving into `page_views`.
* **Risk Level:** **MEDIUM**

### 2.6 Database Connection Security
* **Files Examined:** `lib/supabase.ts` (lines 1–13), `supabase_schema.sql` (lines 33–44)
* **Findings:**
  * Row Level Security (RLS) is enabled on `products` and `orders`. Public select is enabled for `products`.
  * `supabaseAdmin` uses `SUPABASE_SERVICE_ROLE_KEY` on the server-side, which properly bypasses RLS for admin actions.

---

## 3. R5 Legal & GDPR Audit

### 3.1 Statutory Company Footer Details (Italian Civil Code Art. 2250)
* **File Examined:** `components/Footer.tsx` (lines 33–41)
* **Findings:**
  * Footer only displays: `© 2026 ISABEL PEPE. TUTTI I DIRITTI RISERVATI.`
  * **Missing Required Legal Elements:**
    * Ragione Sociale (Legal Company Name)
    * Partita IVA (P.IVA)
    * Codice Fiscale
    * Numero REA e Camera di Commercio
    * Capitale Sociale (Cap. Soc. e stato di versamento)
    * Sede Legale (Registered Address)
    * Indirizzo PEC (Posta Elettronica Certificata)
* **Risk Level:** **HIGH** (Non-compliance with Italian e-commerce disclosure laws).

### 3.2 Legal Policy Pages
* **Files Examined:** `app/` directory structure
* **Findings:**
  * Privacy Policy page (`/privacy` or `/privacy-policy`): **MISSING**
  * Terms & Conditions / Terms of Sale (`/termini-condizioni` or `/condizioni-vendita`): **MISSING**
  * Cookie Policy page (`/cookie-policy`): **MISSING**
  * Shipping & Return Policy page (`/spedizioni-resi`): **MISSING** (Footer links to `#`).
* **Risk Level:** **HIGH**

### 3.3 Consumer Rights & 14-Day Return Policy
* **Files Examined:** `app/prodotto/[slug]/page.tsx` (line 172), `components/Footer.tsx` (line 18)
* **Findings:**
  * Product page badge states "Reso 30 Giorni", but there is no binding legal text or page explaining how the statutory 14-day right of withdrawal (D.Lgs. 206/2005 - Codice del Consumo) is exercised, return address, or refund timeframe.
* **Risk Level:** **MEDIUM-HIGH**

### 3.4 Cookie Consent Banner & Consent Enforcement
* **Files Examined:** `app/layout.tsx`, `components/Tracker.tsx`
* **Findings:**
  * No cookie banner (Iubenda, Cookiebot, or custom GDPR banner) is rendered.
  * `Tracker.tsx` executes immediately on mount and fires `/api/track` HTTP requests without checking consent.
* **Risk Level:** **HIGH**

---

## 4. R6 SEO, Analytics & Performance Audit

### 4.1 Global & Page SEO Meta Tags
* **Files Examined:** `app/layout.tsx` (lines 15–18), `app/prodotto/[slug]/page.tsx` (lines 10–30)
* **Findings:**
  * `app/layout.tsx` metadata is placeholder:
    ```typescript
    export const metadata: Metadata = {
      title: "Create Next App",
      description: "Generated by create next app",
    };
    ```
  * OpenGraph and Twitter card tags are missing from `layout.tsx`.
  * Product page metadata (`generateMetadata` in `app/prodotto/[slug]/page.tsx`) correctly sets `title`, `description`, and `openGraph.images`.

### 4.2 Web Analytics & Tracking (GTM, Meta Pixel, GA4, CAPI)
* **Files Examined:** `app/layout.tsx`, `components/`
* **Findings:**
  * Meta Pixel (Facebook Pixel): **NOT INSTALLED**
  * Google Tag Manager (GTM): **NOT INSTALLED**
  * Google Analytics 4 (GA4): **NOT INSTALLED**
  * Server-Side Conversions API (CAPI): **NOT INSTALLED** (Only custom database tracking via `Tracker.tsx` → `page_views` table).

### 4.3 Sitemap & Robots.txt
* **Files Examined:** `app/sitemap.ts`, `app/robots.ts`, `public/sitemap.xml`, `public/robots.txt`
* **Findings:**
  * `sitemap.xml` / `sitemap.ts`: **MISSING**
  * `robots.txt` / `robots.ts`: **MISSING**

### 4.4 Error Boundaries & 404 Page
* **Files Examined:** `app/not-found.tsx`, `app/error.tsx`
* **Findings:**
  * Custom `not-found.tsx` (404 page): **MISSING** (Uses Next.js default fallback).
  * Global `error.tsx` boundary: **MISSING**.

### 4.5 Image & Asset Optimizations
* **Files Examined:** `app/page.tsx` (lines 19, 57, 70, 80, 124), `components/Footer.tsx`
* **Findings:**
  * Core landing page (`app/page.tsx`) uses standard HTML `<img>` tags for high-resolution images (`/Products/Modella Premium.jpg`, `/Products/Collana Lusso Old Money.jpg`, etc.) instead of `next/image`.
  * `next/image` is only used in `ProductGallery.tsx` and `ProductCard.tsx`.
  * Standard `<img>` tags prevent automatic WebP/AVIF formatting, responsive srcset generation, and lazy loading optimizations.

---

## 5. Compliance & Security Issue Matrix

| ID | Domain | Severity | Issue Description | Location | Remediation Action |
|---|---|---|---|---|---|
| **SEC-01** | Security | **CRITICAL** | Middleware admin authentication guard is commented out | `proxy.ts:35-42` | Re-enable auth check in `proxy.ts` matching `/admin` path. |
| **SEC-02** | Security | **CRITICAL** | Server-side admin page auth check is commented out | `app/admin/page.tsx:12-17` | Re-enable user/email verification against `ADMIN_EMAILS`. |
| **SEC-03** | Security | **HIGH** | Exposed secret keys and hardcoded DB password in `.env.local` | `.env.local:4,8,10,13,17,23,24` | Rotate credentials, sanitize `.env.local`, create `.env.example`. |
| **SEC-04** | Security | **HIGH** | Unverified Stripe Webhook Secret | `.env.local:9`, `app/api/webhook/route.ts` | Set valid `STRIPE_WEBHOOK_SECRET` in environment. |
| **SEC-05** | Security | **MEDIUM** | Missing API Rate Limiting | All `/api/*` endpoints | Add rate limiting middleware (e.g. `@upstash/ratelimit`). |
| **LEG-01** | Legal | **HIGH** | Missing statutory company footer details (P.IVA, REA, PEC, Sede) | `components/Footer.tsx:33-41` | Update Footer with complete company legal identifiers. |
| **LEG-02** | Legal | **HIGH** | Missing mandatory legal pages (Privacy, Cookie, Terms of Sale) | `app/` root directory | Create `/privacy`, `/cookie-policy`, `/condizioni-vendita` pages. |
| **LEG-03** | Legal | **HIGH** | Unenforced cookie tracking & missing Cookie Consent Banner | `app/layout.tsx`, `components/Tracker.tsx` | Integrate GDPR cookie banner and gate `Tracker.tsx` on consent. |
| **SEO-01** | SEO | **HIGH** | Missing `sitemap.xml` and `robots.txt` | `app/` / `public/` | Implement Next.js `sitemap.ts` and `robots.ts`. |
| **SEO-02** | SEO | **MEDIUM** | Boilerplate metadata in `app/layout.tsx` ("Create Next App") | `app/layout.tsx:15-18` | Update root metadata with brand title, keywords, OpenGraph. |
| **SEO-03** | Analytics | **HIGH** | Missing GTM, Meta Pixel, GA4, Meta CAPI | `app/layout.tsx` | Integrate analytics scripts and Conversions API. |
| **PERF-01**| Performance | **MEDIUM** | Unoptimized `<img>` tags on homepage | `app/page.tsx:19,57,70,80` | Convert standard HTML `<img>` tags to `next/image` `<Image />`. |

---

## 6. Actionable Audit Verification Method

To verify remediations independently:
1. **Security Verification:**
   - Run `curl -i http://localhost:3000/admin` without cookies. Expected: `307 Temporary Redirect` to `/login`.
   - Run `git status` / inspect repository to confirm `.env.local` is ignored and `.env.example` exists.
2. **Legal Verification:**
   - Inspect footer at `http://localhost:3000/` for P.IVA, REA, PEC, and Sede Legale text.
   - Navigate to `/privacy`, `/cookie-policy`, `/condizioni-vendita` and confirm status 200.
3. **SEO & Performance Verification:**
   - Request `http://localhost:3000/sitemap.xml` and `http://localhost:3000/robots.txt`.
   - Inspect document `<head>` on homepage to verify brand title, OpenGraph tags, and pixel scripts.
