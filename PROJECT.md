# Project: Isabel Pepe Privilege Club Ecosystem

## Architecture
- **Framework**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4.
- **Database**: Supabase PostgreSQL with `supabaseAdmin` service role client.
- **Email Service**: Resend API (`info@isabelpepe.com`) via `lib/email.ts`.
- **Client State & Storage**: React Hooks, `localStorage` (`isabel_privilege_dismissed`, `isabel_subscribed`, `isabel_customer_email`).
- **Admin**: Protected Server Components + Client SSR hydration with CRM tags, filters, and CSV export.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | DB Table `newsletter_subscribers` | PostgreSQL schema with GDPR consent, IP, UTM, source, indexes, RLS | M1 | Survey / R1 |
| 2 | Coupon `PRIVILEGE10` Setup | Active 10% coupon record in `coupons` table | M1 | Survey / R2 |
| 3 | Subscribe API Route | `/api/newsletter/subscribe` endpoint with validation, honeypot, idempotent upsert, CRM sync | M1 | Survey / R1 |
| 4 | Haute Joaillerie Welcome Email | `sendPrivilegeWelcomeEmail` in `lib/email.ts` with luxury template, perks, `PRIVILEGE10` | M2 | Survey / R2 |
| 5 | Email Dispatch Integration | Trigger welcome email from subscribe route handler with error resilience | M2 | Survey / R2 |
| 6 | Luxury Footer Redesign | `components/Footer.tsx` Atelier Privé copy, GDPR checkbox, honeypot, instant success state | M3 | Survey / R1 |
| 7 | VIP Privilege Modal Popup | `components/PrivilegeClubModal.tsx` with 10-12s timer, exit intent, localStorage suppression | M3 | Survey / R3 |
| 8 | Root Layout Mounting | Mount `PrivilegeClubModal` in `app/layout.tsx` | M3 | Survey / R3 |
| 9 | CRM "Club Privé" Tag & Filter | Upgrade `CrmTable.tsx` to highlight & filter Privilege Club members | M4 | Survey / R4 |
| 10 | Admin Newsletter Management & CSV | Dedicated Admin tab with subscriber KPI metrics and UTF-8 BOM CSV export | M4 | Survey / R4 |
| 11 | E2E Testing Suite & Hardening | Full 5-tier test suite verifying end-to-end user flows, checkout discount, and edge cases | M5 / Test Track | Survey / R5 |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Database, Coupon & API Route | Schema creation, `PRIVILEGE10` coupon, `/api/newsletter/subscribe` endpoint | none | DONE |
| M2 | Luxury Welcome Email System | `lib/email.ts` welcome template, Resend integration | M1 | DONE |
| M3 | Frontend Luxury UI & Modal | `components/Footer.tsx` redesign, `components/PrivilegeClubModal.tsx`, `app/layout.tsx` | M1, M2 | IN_PROGRESS |
| M4 | Admin CRM & Subscribers Panel | `CrmTable.tsx` tag/filter, `NewsletterTable.tsx`, `AdminSidebar.tsx`, CSV export | M1 | PLANNED |
| M5 | E2E Test Suite & Hardening | Opaque-box testing (Tiers 1-4) and adversarial coverage hardening (Tier 5) | M1, M2, M3, M4 | PLANNED |

## Interface Contracts
### Client ↔ `/api/newsletter/subscribe`
- **Request**: `POST /api/newsletter/subscribe`
  - Body:
    ```json
    {
      "email": "string (required, valid email format)",
      "gdprConsent": true,
      "source": "footer" | "popup_vip",
      "utmSource": "string (optional)",
      "utmMedium": "string (optional)",
      "utmCampaign": "string (optional)",
      "website_url": "string (honeypot, must be empty)"
    }
    ```
- **Response**:
  - `200 OK`: `{ "success": true, "message": "Benvenuta nel Privilege Club", "coupon": "PRIVILEGE10" }`
  - `400 Bad Request`: `{ "error": "Consenso GDPR obbligatorio" }` or `{ "error": "Email non valida" }`
  - `200 OK (Honeypot Bot Trap)`: `{ "success": true }` (silently dropped without DB entry)

### `lib/email.ts` ↔ Resend API
- **Function**: `sendPrivilegeWelcomeEmail({ to: string, couponCode?: string }): Promise<{ success: boolean; data?: any; error?: any }>`
- **Sender**: `Isabel Pepe <info@isabelpepe.com>`
- **Subject**: `Benvenuta nell'Atelier Privé — Il Tuo Regalo Esclusivo Isabel Pepe`

### Admin CRM Data Model
- **Table**: `newsletter_subscribers`
  - Columns: `id` (uuid), `email` (varchar), `is_active` (boolean), `consent_given_at` (timestamptz), `source` (varchar), `ip_address` (text), `user_agent` (text), `utm_source` (text), `utm_medium` (text), `utm_campaign` (text), `created_at` (timestamptz), `updated_at` (timestamptz)

## Code Layout
- `app/api/newsletter/subscribe/route.ts` - Subscribe API endpoint
- `lib/email.ts` - Email dispatch & HTML templates
- `components/Footer.tsx` - Luxury footer with Privilege Club form
- `components/PrivilegeClubModal.tsx` - Luxury invitation modal popup
- `app/layout.tsx` - Global layout mounting modal
- `app/admin/NewsletterTable.tsx` - Admin subscriber management & CSV export
- `app/admin/CrmTable.tsx` - Customer table with Club Privé tag/filter
- `app/admin/AdminSidebar.tsx` - Sidebar navigation tabs
- `app/admin/DashboardClientWrapper.tsx` - Dynamic tab switcher
- `app/admin/page.tsx` - Admin server loader
