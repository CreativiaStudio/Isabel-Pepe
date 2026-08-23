# Project: Isabel Pepe Luxury Customer Support & Concierge Inbox Ecosystem

## Architecture
- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS
- **Database**: Supabase PostgreSQL (`support_messages` table, RLS, indexes)
- **Email Delivery**: Resend REST API (`lib/email.ts`) with luxury HTML templates
- **Auth & Security**: 3-tier admin auth (`verifyAdminAuth`, `proxy.ts`, `isAdminEmail`), honeypots, `isBotUserAgent`, IP rate limiting
- **Admin Dashboard**: SSR prefetching (`app/admin/page.tsx`) + Client tab routing (`DashboardClientWrapper.tsx`, `AdminSidebar.tsx`, `MessagesTable.tsx`, `actions_messages.ts`)
- **Public Contact UI**: `components/ContactForm.tsx` (`app/assistenza-clienti/page.tsx`)

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Database Schema | `support_messages` table with RLS, indexes, and status constraints | M1 | ORIGINAL_REQUEST §R1 |
| 2 | Ingestion API & Bot Trap | `POST /api/contact` with validation, honeypot, rate limiting, and DB insert | M2 | ORIGINAL_REQUEST §R1, §R4 |
| 3 | Admin Alert Email | Instant high-priority notification email to Mario & Dev team via Resend | M2 | ORIGINAL_REQUEST §R1 |
| 4 | Luxury Contact Form UI | Interactive form in `components/ContactForm.tsx` with loading, error, and success states | M3 | ORIGINAL_REQUEST §R1 |
| 5 | Admin Concierge Inbox UI | `/admin?tab=messages` with sidebar badge, filters, search, viewer, status updates | M4 | ORIGINAL_REQUEST §R2 |
| 6 | One-Click Direct Reply Engine | Direct customer reply composer with luxury templates, `sendSupportReplyEmail`, and API route | M5 | ORIGINAL_REQUEST §R3 |
| 7 | End-to-End Verification & Build | Full E2E test pass (Tiers 1-5), `npm run build` Turbopack 0-error check, and git push | M6 | ORIGINAL_REQUEST §Acceptance Criteria |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | M1: Database Schema & Supabase Setup | Execute SQL migration for `support_messages` table, indexes, and RLS policies | none | PLANNED |
| 2 | M2: Contact Ingestion API & Email Alert | Create `POST /api/contact` with spam traps, rate limiter, DB insert, and `sendSupportAdminNotificationEmail` | M1 | PLANNED |
| 3 | M3: Luxury Contact Form Frontend | Update `components/ContactForm.tsx` with API integration, validation UX, honeypot, loading/success states | M2 | PLANNED |
| 4 | M4: Admin Concierge Inbox Dashboard | Create `app/admin/actions_messages.ts`, `app/admin/MessagesTable.tsx`, update `AdminSidebar.tsx` and `page.tsx` | M1 | PLANNED |
| 5 | M5: Direct Reply Engine & Luxury Templates | Implement `sendSupportReplyEmail` in `lib/email.ts`, `POST /api/admin/messages/reply`, quick-reply templates | M4 | PLANNED |
| 6 | M6: E2E Testing, Build & Git Push | Execute E2E test suites (Tiers 1-5), verify `npm run build`, commit & push to `origin/main` | M1, M2, M3, M4, M5 | PLANNED |

## Interface Contracts

### 1. Database Table: `public.support_messages`
```sql
CREATE TABLE IF NOT EXISTS public.support_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'unread' CHECK (status IN ('unread', 'pending', 'replied', 'closed')),
    admin_reply TEXT,
    replied_at TIMESTAMPTZ,
    replied_by TEXT,
    ip_address TEXT,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}'::jsonb
);
```

### 2. Contact Ingestion: `POST /api/contact`
- **Request Body**:
  ```json
  {
    "name": "Maria Rossi",
    "email": "maria@example.com",
    "subject": "Consiglio Misura Anello",
    "message": "Vorrei un consiglio sulla misura dell'anello Solitaire...",
    "privacy": true,
    "website_hp": ""
  }
  ```
- **Response**:
  - `200 OK`: `{ "success": true, "message": "Messaggio inviato con successo", "ticket_id": "uuid" }`
  - `400 Bad Request`: `{ "error": "Campi obbligatori mancanti o email non valida" }`
  - `429 Too Many Requests`: `{ "error": "Troppe richieste. Riprova tra qualche minuto." }`

### 3. Admin Reply: `POST /api/admin/messages/reply`
- **Request Headers**: `Authorization: Bearer <token>` or admin cookie session
- **Request Body**:
  ```json
  {
    "message_id": "uuid",
    "reply_text": "Gentile Maria, grazie per aver contattato Isabel Pepe...",
    "subject": "Re: Consiglio Misura Anello"
  }
  ```
- **Response**:
  - `200 OK`: `{ "success": true, "message": "Risposta inviata con successo", "replied_at": "timestamp" }`
  - `401 Unauthorized`: `{ "error": "Accesso non autorizzato" }`
  - `404 Not Found`: `{ "error": "Messaggio non trovato" }`

### 4. Admin Server Actions: `app/admin/actions_messages.ts`
- `updateMessageStatus(id: string, status: 'unread' | 'pending' | 'replied' | 'closed')`
- `deleteMessage(id: string)`

## Code Layout
- `lib/email.ts` — Resend email templates (`sendSupportAdminNotificationEmail`, `sendSupportReplyEmail`)
- `app/api/contact/route.ts` — Public contact ingestion endpoint with rate limiting & bot traps
- `app/api/admin/messages/reply/route.ts` — Admin reply endpoint protected by `verifyAdminAuth`
- `app/admin/actions_messages.ts` — Server actions for message status & deletion
- `app/admin/MessagesTable.tsx` — Admin Concierge Inbox UI with filter, search, detail viewer, quick replies
- `app/admin/AdminSidebar.tsx` — Navigation item with dynamic unread counter badge
- `app/admin/page.tsx` — SSR prefetching of `support_messages`
- `app/admin/DashboardClientWrapper.tsx` — Tab rendering for `activeTab === 'messages'`
- `components/ContactForm.tsx` — Public customer contact form component
- `scripts/test_e2e_concierge.ts` — E2E test runner for customer support ecosystem
