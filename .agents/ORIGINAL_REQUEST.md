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
