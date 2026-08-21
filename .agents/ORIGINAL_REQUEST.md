# Original User Request

## Initial Request — 2026-08-20T09:18:13+02:00

You are the Project Orchestrator for implementing the "Isabel Pepe Privilege Club" ecosystem.

## Workspace & Context
- Workspace Root: c:/Users/mario/Progetti Antigravity/isabel-pepe
- Your working directory: c:/Users/mario/Progetti Antigravity/isabel-pepe/.agents/orchestrator_1
- Authoritative User Request: c:/Users/mario/Progetti Antigravity/isabel-pepe/.agents/ORIGINAL_REQUEST.md

## Detailed Mission & Requirements
1. **Privilege Club Footer & GDPR Compliance (R1)**:
   - Redesign `components/Footer.tsx` newsletter section with high-end luxury copywriting ("L'Atelier Privé — Il Club Esclusivo Isabel Pepe").
   - Include explicit GDPR consent checkbox with direct link to Privacy Policy, anti-bot validation (e.g. honeypot/simple bot check), and instant luxury success state.
   - Create `/api/newsletter/subscribe` endpoint storing verified subscribers in `newsletter_subscribers` table (and linking to `customer_identities` / `customers` table for unified CRM view) with consent timestamp, IP, source ('footer' | 'popup_vip'), and UTM attribution. Ensure idempotent upsert / no duplicate errors.

2. **Luxury Welcome Email via Resend (PRIVILEGE10) (R2)**:
   - Add `sendPrivilegeWelcomeEmail` in `lib/email.ts` utilizing Resend API and official `Isabel Pepe <info@isabelpepe.com>` sender.
   - Deliver an editorial Haute Joaillerie welcome email containing:
     - The exclusive welcome gift code: `PRIVILEGE10` (10% off).
     - Introduction to Isabel Pepe atelier perks: 48h early access to new limited creations, private seasonal sales, and complimentary jewelry care.
     - Direct 1-click CTA button to explore the collection.
   - Ensure coupon `PRIVILEGE10` exists and is active in the `coupons` table in Supabase.

3. **Elegant VIP Privilege Invitation Popup for New Visitors (R3)**:
   - Create `components/PrivilegeClubModal.tsx`: an editorial, non-intrusive popup/toast that appears gently after 10-12 seconds on first visit (or on exit intent).
   - Clearly communicate the 10% welcome gift and VIP membership perks.
   - Persist dismissal in `localStorage` (`isabel_privilege_dismissed` / `isabel_subscribed`) so it never annoys returning or already-subscribed visitors.
   - Mount appropriately in the layout or root provider.

4. **CRM & Admin Panel Integration (R4)**:
   - Upgrade the `/admin` CRM and Customer view to highlight Privilege Club members with a dedicated "Club Privé" tag/filter.
   - Add a dedicated "Newsletter & Privilege Club" section in `/admin` displaying subscriber count, growth rate, subscription timestamps, and a 1-click CSV export button for marketing campaigns.

5. **Acceptance Criteria & Verification**:
   - Submissions without accepting GDPR consent are blocked with clear client-side feedback.
   - Valid subscriptions insert/upsert records in Supabase `newsletter_subscribers` with `is_active: true`, `consent_given_at`, `source`, and `ip`.
   - Duplicate emails do not trigger duplicate database entries.
   - New subscriber immediately receives the official welcome email from `info@isabelpepe.com` with the code `PRIVILEGE10`.
   - The code `PRIVILEGE10` validates successfully in the cart checkout applying a 10% discount.
   - Subscribers appear in the Admin CRM table with a visible "Privilege Club" badge.
   - Admin can download a complete CSV list of active subscribers.
   - Build passes cleanly with 0 TypeScript/Turbopack errors and changes are committed/pushed if required.

## 2026-08-21T15:10:11Z

Fix the product certificate ecosystem across the Isabel Pepe luxury e-commerce. Audit and repair all broken certificate image paths (such as pearl certificates 404), ensure 100% accurate classification (Moissanite Oro 18K, Moissanite Rodio Puro, Perle Naturali Oro 18K, Metalli Nobili), and guarantee certificates are prominently visible and interactive on every single product page.

Working directory: c:/Users/mario/Progetti Antigravity/isabel-pepe
Integrity mode: development

## Requirements

### R1. Forensic Certificate Asset & Path Audit
- Fix missing and mismatched certificate image files in `public/Brand/` (e.g. resolve `/Brand/certificato_perle_oro18k.webp` mapping to `certificato_perle_card_clean.webp` and create exact standardized WebP/JPG aliases).
- Audit all 41+ live catalog products in Supabase and ensure that every product's certificate modal, trust badges, and guarantee sections load the exact matching certificate with 0 broken 404 images.

### R2. Precision Product Classification & Certificate Matching
- Ensure each product renders the correct certificate type based on materials, plating, and stones:
  1. **Moissanite in Oro 18K** (`certificato_moissanite_oro18k.webp` + GRA Report, Card, Cover)
  2. **Moissanite in Rodio Puro** (`certificato_moissanite_rodio.webp` + GRA Report, Card, Cover)
  3. **Perle Naturali d'Acqua Dolce in Oro 18K** (`certificato_perle_card_clean.webp` / `certificato_perle_oro18k.webp`)
  4. **Argento 925 / Cristalli / Metalli Nobili** (`certificato_argento925.webp` / `certificato_metalli_isabel_clean.webp`)
- Prevent non-Moissanite products (such as `ASB3093` Cristalli Rosa) from displaying inappropriate Moissanite GRA tabs.

### R3. Enhanced Certificate Visibility on Product Pages
- Ensure the Certificate is impossible to miss: in addition to the interactive "Doppia Certificazione / Garanzia Ufficiale" modal, offer an integrated high-resolution certificate preview card / tab and ensure smooth, responsive viewing on all mobile and desktop viewports.
- Support instant zoom, crisp high-DPI rendering, and anti-scraping drag protection.

### R4. Complete Catalog & Page Verification
- Verify `/prodotto/[slug]` for every single active and draft product across all 5 categories (Anelli, Bracciali, Collane, Orecchini, Set).
- Verify `/garanzia` page certificate modal (`CertificateViewerModal.tsx`) and Packaging modal (`PackagingModal.tsx`).

## Acceptance Criteria

### Asset Integrity & 0 Broken Links
- [ ] Every certificate image URL referenced in `ProductTrustBadges.tsx`, `CertificateViewerModal.tsx`, and `PackagingModal.tsx` returns HTTP 200 with zero 404 errors.
- [ ] Running an automated asset check across all 41 products in Supabase confirms 100% valid local and remote image paths.

### Product Classification Accuracy
- [ ] Pearl creations (PL-6, PL-15, PL-30, PL-40) display the Pearl & 18K Gold certificate and appropriate guarantee copy.
- [ ] 18K Gold Moissanite creations display the 18K Gold Moissanite certificate + 3 GRA tabs.
- [ ] Rhodium Moissanite creations display the Rhodium Moissanite certificate + 3 GRA tabs.
- [ ] Silver/Crystal creations display the Sterling Silver 925 Authenticity certificate.

### UX & Build Integrity
- [ ] Modal opens smoothly on both mobile and desktop with zero layout overflow or truncated titles.
- [ ] Production build (`npm run build`) completes with 0 TypeScript and Turbopack errors.
