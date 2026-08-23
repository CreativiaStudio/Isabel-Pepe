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
