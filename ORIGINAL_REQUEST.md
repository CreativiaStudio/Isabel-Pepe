# Original User Request

## 2026-08-20T07:17:49Z

Implement the complete "Isabel Pepe Privilege Club" ecosystem. Transform the footer newsletter into an Haute Joaillerie VIP membership registration, enforce full GDPR compliance with timestamped consent logging in Supabase, trigger an automated luxury welcome email via Resend with the `PRIVILEGE10` discount code (10% off), implement a discreet luxury invitation popup for new visitors, and fully connect subscribers to the Admin CRM with filterable views and 1-click CSV export.

Working directory: c:/Users/mario/Progetti Antigravity/isabel-pepe
Integrity mode: development

## Requirements

### R1. Privilege Club Footer & GDPR Compliance
- Redesign `components/Footer.tsx` newsletter section with high-end luxury copywriting ("L'Atelier Privé — Il Club Esclusivo Isabel Pepe").
- Include explicit GDPR consent checkbox with direct link to Privacy Policy, anti-bot validation, and instant luxury success state.
- Create `/api/newsletter/subscribe` endpoint storing verified subscribers in `newsletter_subscribers` table (and linking to `customer_identities` / `customers` table for unified CRM view) with consent timestamp, IP, source ('footer' | 'popup_vip'), and UTM attribution.

### R2. Luxury Welcome Email via Resend (`PRIVILEGE10`)
- Add `sendPrivilegeWelcomeEmail` in `lib/email.ts` utilizing Resend API and official `Isabel Pepe <info@isabelpepe.com>` sender.
- Deliver an editorial Haute Joaillerie welcome email containing:
  - The exclusive welcome gift code: **`PRIVILEGE10`** (10% off).
  - Introduction to Isabel Pepe atelier perks: 48h early access to new limited creations, private seasonal sales, and complimentary jewelry care.
  - Direct 1-click CTA button to explore the collection.
- Ensure coupon `PRIVILEGE10` exists and is active in the `coupons` table in Supabase.

### R3. Elegant VIP Privilege Invitation Popup for New Visitors
- Create `components/PrivilegeClubModal.tsx`: an editorial, non-intrusive popup/toast that appears gently after 10-12 seconds on first visit (or on exit intent).
- Clearly communicate the 10% welcome gift and VIP membership perks.
- Persist dismissal in `localStorage` (`isabel_privilege_dismissed` / `isabel_subscribed`) so it never annoys returning or already-subscribed visitors.

### R4. CRM & Admin Panel Integration
- Upgrade the `/admin` CRM and Customer view to highlight Privilege Club members with a dedicated "Club Privé" tag/filter.
- Add a dedicated "Newsletter & Privilege Club" section in `/admin` displaying subscriber count, growth rate, subscription timestamps, and a 1-click CSV export button for marketing campaigns.

## Acceptance Criteria

### GDPR & Database Integrity
- [ ] Submissions without accepting GDPR consent are blocked with clear client-side feedback.
- [ ] Valid subscriptions insert/upsert records in Supabase `newsletter_subscribers` with `is_active: true`, `consent_given_at`, `source`, and `ip`.
- [ ] Duplicate emails do not trigger duplicate database entries.

### Welcome Email Delivery
- [ ] New subscriber immediately receives the official welcome email from `info@isabelpepe.com` with the code `PRIVILEGE10`.
- [ ] The code `PRIVILEGE10` validates successfully in the cart checkout applying a 10% discount.

### CRM & Admin Dashboard
- [ ] Subscribers appear in the Admin CRM table with a visible "Privilege Club" badge.
- [ ] Admin can download a complete CSV list of active subscribers.
- [ ] Build passes cleanly with 0 TypeScript/Turbopack errors and is pushed to `origin/main`.
