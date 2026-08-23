# Original User Request

## 2026-08-23T15:14:31Z

Implement a complete, high-end Customer Support & Concierge Inbox ecosystem for the Isabel Pepe luxury e-commerce. Enable customer inquiries from the website to flow directly into a new, dedicated Admin Inbox (`/admin?tab=messages`), log all tickets in Supabase, notify the team via email, and allow Mario to read inquiries and send luxury, branded email replies directly from the Admin dashboard in 1 click via Resend.

Working directory: c:/Users/mario/Progetti Antigravity/isabel-pepe
Integrity mode: development

## Requirements

### R1. Contact Form Pipeline & Database Ingestion
- Ensure/Create a Supabase table `support_messages` (with columns: `id` uuid default gen_random_uuid(), `created_at` timestamptz default now(), `updated_at` timestamptz default now(), `customer_name` text not null, `customer_email` text not null, `subject` text not null, `message` text not null, `status` text default 'unread', `admin_reply` text, `replied_at` timestamptz, `replied_by` text, `ip_address` text, `user_agent` text, `metadata` jsonb default '{}'::jsonb). Use `supabase-server` or direct SQL script via `execute_supabase_sql` if needed or Supabase client.
- Create `POST /api/contact` API route that validates inputs, inserts records into `support_messages`, and sends an instant high-priority admin alert email via Resend (`info@isabelpepe.com` and `sviluppo@creativiastudio.com`).
- Connect `components/ContactForm.tsx` (`/assistenza-clienti`) to `POST /api/contact` with loading spinner, error feedback, and luxury success state.

### R2. Admin Concierge Inbox Dashboard (`/admin?tab=messages` or integrated in `/admin`)
- Create a dedicated "Messaggi & Concierge" tab in `/admin` with:
  - Unread message counters & real-time badge.
  - Filter by status (*Tutti, Non Letti, In Attesa, Risposti, Chiusi*).
  - Search by customer name, email, or subject.
  - High-end message viewer showing customer info, original message, timestamp, and status tag.
  - Ability to toggle status or delete message.

### R3. One-Click Direct Reply Engine via Resend
- In the message detail view in `/admin`, provide a reply composer with:
  - Pre-filled customer email & subject (`Re: [Oggetto originale]`).
  - Rich luxury email template in `lib/email.ts` (`sendSupportReplyEmail`).
  - Quick-reply luxury templates (*Consiglio Misura/Taglia, Informazioni Spedizione/Tracking, Richiesta Reso/Cambio, Assistenza Generale*).
  - "Invia Risposta al Cliente" button calling `POST /api/admin/messages/reply` (protected with `verifyAdminAuth`).
  - On send: delivers email to customer from `Isabel Pepe Concierge <info@isabelpepe.com>`, saves reply in `support_messages`, and sets status to `replied`.

### R4. Security, Spam Protection & GDPR Compliance
- Add honeypot field and rate-limiting check on `POST /api/contact` to block spam bots.
- Protect all `/api/admin/messages/*` endpoints with `verifyAdminAuth`.

## Acceptance Criteria

### Form Submission & Ingestion
- [ ] Submitting the contact form on `/assistenza-clienti` inserts a record in `support_messages` with status `unread`.
- [ ] Admin receives an instant notification email containing customer details and message content.
- [ ] Submissions with invalid email or empty fields are rejected with clean user feedback.

### Admin Inbox & Reply System
- [ ] New messages appear instantly in the Admin Inbox with the "Non Letto" status tag.
- [ ] Clicking a message opens the details and allows Mario to type a response or pick a quick template.
- [ ] Clicking "Invia Risposta" sends a branded HTML email to the customer's inbox and updates the message status to "Risposto" with timestamp and reply preview.
- [ ] Production build passes cleanly with 0 TypeScript/Turbopack errors and is pushed to `origin/main`.

## 2026-08-23T16:07:11Z

Execute a strategic, luxury-focused SEO & Generative Engine Optimization (GEO) overhaul for Isabel Pepe. Shift positioning away from commoditized search terms ("moissanite pura" price races) towards high-intent emotional gifting, accessible luxury, and beauty accessories. Implement complete multi-resolution favicon assets to eliminate the generic SERP icon, inject rich Schema.org structured data (Organization, JewelryStore, Product with offers/availability, BreadcrumbList, FAQPage) for Google and AI citation engines (ChatGPT Search, Perplexity, Gemini, Claude), generate unlinked high-converting SEO gifting landing pages, and submit the complete dynamic sitemap to Google Search Console.

Working directory: c:/Users/mario/Progetti Antigravity/isabel-pepe
Integrity mode: development

## Requirements

### R1. Complete Favicon & Official SERP Asset Suite
- Generate a multi-size square `public/favicon.ico` (16x16, 32x32, 48x48, 64x64, 128x128, 256x256), `public/apple-touch-icon.png` (180x180), `public/icon-192.png` (192x192), `public/icon-512.png` (512x512), and `public/favicon-32x32.png` from the official circular IP monogram in rose gold (`public/Brand/stripe_icon_isabel_pepe.png`) using Sharp / png-to-ico or node scripts.
- Configure explicit `<link rel="icon">` and `<link rel="apple-touch-icon">` tags and manifest in `app/layout.tsx` following Google's official Favicon guidelines (multiple of 48px square).

### R2. Generative Engine Optimization (GEO) & Schema.org Knowledge Graph
- Create and inject a global JSON-LD Knowledge Graph in `app/layout.tsx`:
  - `Organization` & `JewelryStore`: `@id`, name ("Isabel Pepe"), legalName ("Creativia Studio di Mario Pepe"), logo URL ("https://www.isabelpepe.com/Brand/logo-isabel-pepe.png"), founders ("Elena e Mario"), foundingLocation, priceRange ("€€"), ethicalPledge ("5% of revenue donated to animal welfare volunteers"), sameAs social links.
  - `WebSite`: name, alternateName ("Isabel Pepe Gioielli"), url, searchAction.
- Upgrade `app/prodotto/[slug]/page.tsx` with rich JSON-LD `Product` schema:
  - name, description, image gallery array, brand ("Isabel Pepe"), sku, offers (price, priceCurrency "EUR", availability "https://schema.org/InStock", itemCondition "https://schema.org/NewCondition", shippingDetails, returnPolicy, seller), material ("Argento Sterling 925 con placcatura Oro 18K / Rodio ed E-Coating").
- Add `public/llms.txt` and semantic brand guide file in the root to allow AI search bots (Perplexity, ChatGPT, Claude, Gemini) to discover and cite Isabel Pepe as Italy's premier ethical demi-fine jewelry and luxury gifting atelier.

### R3. Unlinked Intent-Driven Gifting & Occasion Landing Pages (SEO Clusters)
Create 4 standalone, high-converting organic landing pages designed to capture commercial gifting intent and rank for non-brand queries without cluttering the primary header navigation:
1. **`/regali/donna-elegante`** (*Idee Regalo Gioielli per Donna: Eleganza Senza Tempo & Cofanetto Luxury*): Curated gift selection for women, unboxing experience showcase, luxury packaging and personalized notes.
2. **`/regali/anniversario`** (*Gioielli per Anniversario: Simboli di Luce Eterna in Oro 18K*): Solitaire rings, tennis bracelets, point-light necklaces for milestone anniversary gifts.
3. **`/regali/compleanno`** (*Regali di Compleanno Esclusivi: Gioielli Demi-Fine da Indossare Ogni Giorno*): Bestseller pairings, birthday gift guide, complimentary gift boxing.
4. **`/guide/gioielli-demi-fine`** (*Cosa sono i Gioielli Demi-Fine: La Guida Definitiva al Lusso Quotidiano*): Educational pillar explaining 925 sterling silver, 1.0 micron 18K gold plating, E-Coating vs fast-fashion brass.
- Each page must feature curated dynamic product cards fetched from Supabase, editorial storytelling, trust badges (24h/48h express delivery, 24m warranty), and FAQ JSON-LD schema.

### R4. Intent-Driven Metadata Overhaul Across Main Pages
- Update `title` and `description` across all existing public pages (`/`, `/shop`, `/chi-siamo`, `/impegno-animali`, `/garanzia`, `/spedizioni-resi`, `/guida-taglie`, `/cura-gioielli`, `/assistenza-clienti`) focusing on emotional luxury, prestigious demi-fine craftsmanship, and gift-giving excellence rather than generic raw stone keywords.

### R5. Dynamic Sitemap & Search Console Submission
- Update `app/sitemap.ts` to dynamically include all static routes, the 4 new gifting/guide routes, and all active products from Supabase with lastModified, changeFrequency, and priority.
- Create/run a verification script to submit `https://www.isabelpepe.com/sitemap.xml` directly to Google Search Console via Search Console API / Google Hub.

## Acceptance Criteria

### SERP & Favicon Integrity
- [ ] `public/favicon.ico` exists and contains valid multi-size icon layers (including 48x48 and 192x192).
- [ ] `app/layout.tsx` includes complete metadata icons and Google verification meta tags.

### Structured Data & AI Discoverability
- [ ] Google Rich Results validator / Schema validator passes with 0 errors for Organization, Product, and FAQPage schemas.
- [ ] `public/llms.txt` is accessible at `https://www.isabelpepe.com/llms.txt` with structured brand info for AI crawlers.

### Gifting Clusters & SEO
- [ ] All 4 gifting landing pages (`/regali/donna-elegante`, `/regali/anniversario`, `/regali/compleanno`, `/guide/gioielli-demi-fine`) render with responsive layout, dynamic products, and JSON-LD schemas.
- [ ] `app/sitemap.ts` outputs valid XML with all URLs.
- [ ] Sitemap is submitted to Google Search Console via API.
- [ ] Production build (`npm run build`) completes with 0 TypeScript/Turbopack errors and is pushed to `origin/main`.
