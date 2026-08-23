# Orchestration Plan: Isabel Pepe Customer Support & Concierge Inbox Ecosystem

## Objective
Implement end-to-end luxury customer concierge inbox, contact form ingestion, database storage in Supabase, email alerts and one-click direct customer replies via Resend, admin auth protection, spam filters, verification, and git push.

## Phases
1. **Phase 0: Survey & Scope Mapping**
   - Spawn 3 Explorers:
     - Explorer 1: Contact Form (`components/ContactForm.tsx`, `/assistenza-clienti`, current API route or mock, Supabase connection/tables).
     - Explorer 2: Admin Dashboard structure (`app/admin/*` or `components/admin/*`, tabs, layouts, styling system, state).
     - Explorer 3: Email infrastructure (`lib/email.ts`, Resend config, templates, auth utilities `verifyAdminAuth`, rate limiting).
   - Synthesize survey reports into `PROJECT.md`.

2. **Phase 1: Milestone Decomposition & Interface Contracts**
   - M1: Database schema (`support_messages`), Supabase migration/SQL, Types/Interfaces.
   - M2: API Pipeline (`POST /api/contact` with honeypot & rate-limit, email alert to admin).
   - M3: Contact Form Frontend update (`ContactForm.tsx` connecting to API with luxury UX).
   - M4: Admin Concierge Inbox UI (`/admin?tab=messages`, filters, search, badge, viewer, status update).
   - M5: Admin Reply Engine & Email Templates (`POST /api/admin/messages/reply`, Resend luxury HTML templates, quick-replies).
   - M6: E2E Verification, Turbopack production build check (`npm run build`), Git commit & push.

3. **Phase 2: Execution & Gated Verification**
   - For each milestone: Explorer -> Worker -> Reviewer -> Challenger -> Auditor -> Gate check.

4. **Phase 3: Final Acceptance & Deployment**
   - Production build verification (`npm run build`).
   - Git status & commit push to `origin/main`.
   - Sentinel final completion report.
