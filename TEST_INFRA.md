# TEST_INFRA.md — Isabel Pepe Concierge & Customer Support E2E Test Infrastructure

Authoritative E2E Test Infrastructure & Verification Architecture for Isabel Pepe Luxury Customer Support & Concierge Inbox Ecosystem.

---

## 1. Executive Summary & Testing Philosophy

The **Isabel Pepe Luxury Customer Support & Concierge Inbox Ecosystem** is a mission-critical customer acquisition, high-touch support, and retention pipeline. It bridges public customer inquiries submitted on the e-commerce storefront (`/assistenza-clienti`) with an authenticated administrative concierge dashboard (`/admin?tab=messages`), an automated transactional alert system, and a 1-click branded luxury email reply engine powered by Resend.

To guarantee zero regression, rock-solid security, spam resilience, and impeccable luxury brand tone, the test infrastructure is built upon an **Opaque-Box 4-Tier Automated Test Framework**:

1. **Tier 1 — Feature Coverage**: Exhaustive unit-level and functional endpoint verification covering all primary behaviors, data persistence, email triggers, and status state machines (minimum 5 tests per feature).
2. **Tier 2 — Boundary & Corner Cases**: Hostile input validation, SQL injection / XSS payload neutralization, Unicode/emoji fidelity, honeypot traps, bot User-Agent detection, rapid request throttling, and constraint enforcement.
3. **Tier 3 — Cross-Feature Combinations**: Multi-step integration pipelines validating the cohesive lifecycle across public ingestion, database triggers, admin dashboard queries, direct replies, and status transitions.
4. **Tier 4 — Real-World Luxury Concierge Scenarios**: End-to-end customer persona journeys modeling authentic customer interactions (ring sizing, shipping tracking, return requests, VIP custom jewelry commissions).

All tests are standalone, deterministic, self-contained, and feature automated database cleanup to prevent artifact contamination in production/staging Supabase instances.

---

## 2. System Under Test (SUT) & Architectural Mapping

```
                                  ┌───────────────────────────────┐
                                  │   Customer Contact Form UI    │
                                  │  (/assistenza-clienti, R1)   │
                                  └───────────────┬───────────────┘
                                                  │ POST /api/contact
                                                  ▼
┌───────────────────────────────┐   ┌───────────────────────────────┐
│   Security & Spam Shield      │──▶│   Contact Ingestion API       │
│  - Honeypot Trap (website_hp) │   │   - Input Validation (R1, R4) │
│  - Bot UA Detection           │   │   - Supabase Insert           │
│  - IP Rate Limiting           │   │   - Admin Notification Trigger│
└───────────────────────────────┘   └───────────────┬───────────────┘
                                                    │
                                                    ▼
                                    ┌───────────────────────────────┐
                                    │ Supabase: support_messages    │
                                    │  - RLS Policies               │
                                    │  - Status State Machine       │
                                    └───────────────┬───────────────┘
                                                    │
                     ┌──────────────────────────────┴──────────────────────────────┐
                     ▼                                                             ▼
    ┌─────────────────────────────────┐                           ┌─────────────────────────────────┐
    │   Admin Concierge Inbox UI      │                           │  One-Click Direct Reply Engine  │
    │   (/admin?tab=messages, R2)     │                           │  (POST /api/admin/messages/     │
    │   - SSR / Client Prefetching    │                           │   reply, R3)                    │
    │   - Search & Status Filters     │                           │   - verifyAdminAuth Guard (R4)  │
    │   - actions_messages.ts         │                           │   - Branded Resend Email        │
    └─────────────────────────────────┘                           │   - Status Update to 'replied'  │
                                                                  └─────────────────────────────────┘
```

### Key Components & Interface Contracts

| Component | Target File | Interface / Method | Primary Responsibility |
|---|---|---|---|
| **Database Schema** | Supabase `public.support_messages` | PostgreSQL Table | Stores customer tickets, status (`unread`, `pending`, `replied`, `closed`), admin replies, timestamps, IP, user-agent, metadata. |
| **Ingestion API** | `app/api/contact/route.ts` | `POST` | Validates input payload, verifies privacy consent, checks honeypots, inserts ticket into DB, dispatches admin alert email. |
| **Admin Reply API** | `app/api/admin/messages/reply/route.ts` | `POST` | Validates `verifyAdminAuth`, dispatches branded customer reply via Resend (`sendSupportReplyEmail`), updates message status. |
| **Admin Actions** | `app/admin/actions_messages.ts` | Server Actions | `updateMessageStatus(id, status)` and `deleteMessage(id)` with admin session validation. |
| **Auth Guard** | `lib/auth-guard.ts` | `verifyAdminAuth(req)` | Validates Bearer tokens and cookies against `ADMIN_EMAILS` whitelist. |
| **Email Service** | `lib/email.ts` | `sendSupportAdminNotificationEmail`, `sendSupportReplyEmail` | Generates high-end luxury HTML templates and sends via Resend REST API. |

---

## 3. 4-Tier Test Suite Specification

### Tier 1: Exhaustive Feature Coverage (7 Features / 25+ Tests)

#### Feature 1: Contact Form Ingestion API (`POST /api/contact`)
- **T1.1.1 — Standard Valid Submission**: Standard payload with valid name, email, subject, message, and privacy consent returns HTTP 200, `{ success: true, ticket_id }`, and persists a record in `support_messages` with `status: 'unread'`.
- **T1.1.2 — Rich Metadata & Tracking Persistence**: Submission with UTM tags, referrer, and custom metadata properly persists in the `metadata` JSONB column.
- **T1.1.3 — Database Field Integrity**: Verifies exact matching of `customer_name`, `customer_email`, `subject`, `message`, `ip_address`, `user_agent`, and `created_at` timestamp.
- **T1.1.4 — Admin Notification Dispatch Trigger**: Verifies that successful submission triggers admin alert notification to `info@isabelpepe.com` and `sviluppo@creativiastudio.com`.
- **T1.1.5 — Automatic Input Sanitization & Whitespace Trimming**: Ensures leading/trailing whitespace in email and name is stripped before database insertion.

#### Feature 2: Admin Direct Reply Engine (`POST /api/admin/messages/reply`)
- **T1.2.1 — Authorized Admin Reply Execution**: Admin with valid Bearer token submits reply text; endpoint updates record with `admin_reply`, `replied_at`, `replied_by`, and sets `status = 'replied'`.
- **T1.2.2 — Status Transition from Unread to Replied**: Verifies automatic transition of `unread` ticket to `replied`.
- **T1.2.3 — Status Transition from Pending to Replied**: Verifies transition of `pending` ticket to `replied`.
- **T1.2.4 — Branded Customer Email Dispatch**: Verifies dispatch payload with luxury email template to customer email address.
- **T1.2.5 — Non-Existent Ticket ID Rejection**: Returns HTTP 404 Not Found when attempting to reply to a non-existent UUID.

#### Feature 3: Security & Admin Auth Guard (`verifyAdminAuth`)
- **T1.3.1 — Unauthenticated Reply Attempt**: Rejects request without `Authorization` header with HTTP 401 Unauthorized.
- **T1.3.2 — Non-Admin Token Rejection**: Rejects authenticated user whose email is not in `ADMIN_EMAILS` with HTTP 401 Unauthorized.
- **T1.3.3 — Authorized Admin Whitelist Access**: Successfully authenticates authorized emails (`sviluppo@creativiastudio.com`, `info@isabelpepe.com`, `mario@isabelpepe.com`, `mariopepe9@hotmail.it`).
- **T1.3.4 — Malformed Bearer Token**: Rejects corrupted Bearer header strings with HTTP 401.
- **T1.3.5 — SQL / Header Injection in Auth Tokens**: Ensures malicious token strings fail authentication gracefully without unhandled exceptions.

#### Feature 4: Admin Inbox State Transitions & Message Management
- **T1.4.1 — Transition Unread to Pending**: `updateMessageStatus(id, 'pending')` updates status to `pending` and sets `updated_at`.
- **T1.4.2 — Transition Pending to Closed**: `updateMessageStatus(id, 'closed')` updates status to `closed`.
- **T1.4.3 — Ticket Reopening (Closed to Unread)**: `updateMessageStatus(id, 'unread')` reopens ticket.
- **T1.4.4 — Message Deletion**: `deleteMessage(id)` deletes message from `support_messages`.
- **T1.4.5 — Unread Message Counter Metric**: Database count of `status = 'unread'` accurately matches expected active tickets.

---

### Tier 2: Boundary & Corner Cases (15 Tests)

- **T2.1 — Missing Customer Name**: Request lacking `name` returns HTTP 400 Bad Request with descriptive error.
- **T2.2 — Missing Customer Email**: Request lacking `email` returns HTTP 400 Bad Request.
- **T2.3 — Missing Subject**: Request lacking `subject` returns HTTP 400 Bad Request.
- **T2.4 — Missing Message Body**: Request lacking `message` returns HTTP 400 Bad Request.
- **T2.5 — Missing GDPR Privacy Consent**: Request with `privacy: false` or omitted returns HTTP 400 Bad Request.
- **T2.6 — Malformed Email Formats**: Rejects invalid emails (e.g., `plainaddress`, `@missinguser.com`, `user@.com`, `user@domain..com`) with HTTP 400.
- **T2.7 — Oversized Message Payload**: Handles large message strings (10,000+ characters) without database crashes.
- **T2.8 — SQL Injection Payloads in Fields**: Injects `'; DROP TABLE support_messages; --` into fields; verifies safe parameterization.
- **T2.9 — XSS / Script Injection in Inquiries**: Injects `<script>alert('xss')</script>` and `<img src=x onerror=alert(1)>`; verifies safe sanitization.
- **T2.10 — Multilingual & Emoji Unicode Fidelity**: Inquiries containing emojis (💍 💎 ✨ 🎁) and special characters (accented letters, quotes) retain 100% byte fidelity.
- **T2.11 — Honeypot Trap Trigger**: Request with non-empty `website_hp` triggers bot trap (blocks database insertion).
- **T2.12 — Bot User-Agent Detection**: Requests from automated scrapers (e.g. `curl`, `python-requests`, `PostmanRuntime`) handled according to bot policy.
- **T2.13 — Rapid Submission Rate Limiting**: Repeated bursts from identical IP trigger HTTP 429 Too Many Requests.
- **T2.14 — Empty Admin Reply Rejection**: Attempt to reply with empty `reply_text` returns HTTP 400 Bad Request.
- **T2.15 — Invalid Database Status Constraint**: Setting status outside allowed enum (`'invalid_status'`) fails constraint check.

---

### Tier 3: Cross-Feature Combinations (4 Complex Integration Flows)

- **T3.1 — Full Concierge Ingestion-to-Resolution Lifecycle**:
  1. Customer submits contact form on `/assistenza-clienti`.
  2. Record created in `support_messages` with `status: 'unread'`.
  3. Admin fetches message, transitions status to `pending`.
  4. Admin sends reply via `POST /api/admin/messages/reply`.
  5. Status updates to `replied` with `admin_reply` and timestamp.
  6. Admin completes case and updates status to `closed`.
- **T3.2 — Multi-Ticket Customer Aggregation & Filtering**:
  1. Single customer submits multiple inquiries (e.g. Sizing, Warranty, Delivery).
  2. Database stores each as independent ticket.
  3. Admin query filtering by email returns all customer tickets in chronological order.
  4. Admin replies to one ticket without affecting the status of others.
- **T3.3 — Honeypot & Bot Trap Isolation Under Load**:
  1. Spambot submits honeypot payload simultaneously with a legitimate customer submission.
  2. Spambot is rejected / neutralized without database record.
  3. Legitimate inquiry is inserted and unread badge count increases by exactly 1.
- **T3.4 — Admin Auth Guard Concurrency & Security Boundary**:
  1. Attacker attempts reply without token (fails 401).
  2. Attacker attempts reply with forged user (fails 401).
  3. Authorized admin replies successfully (succeeds 200, updates DB).

---

### Tier 4: Real-World Luxury Concierge Scenarios (4 Production Workflows)

- **T4.1 — Scenario: "Consiglio Misura Anello" (Ring Sizing Consultation)**:
  - Customer asks for advice on measuring finger size for the *Anello Solitaire* or *Anello Imperial*.
  - Admin replies with quick-template guide explaining Italian sizing (IT 12/14/16/18) and luxury ring sizer dispatch.
  - Verifies full email dispatch and status transition.
- **T4.2 — Scenario: "Informazioni Spedizione & Tracking" (Shipping & Tracking Status)**:
  - Customer inquires about express courier delivery (Poste Italiane / SDA via Packlink PRO).
  - Admin replies with tracking code and estimated delivery time.
  - Verifies ticket log and reply persistence.
- **T4.3 — Scenario: "Richiesta Reso / Cambio Gioiello" (Return & Exchange Request)**:
  - Customer requests return within 14-day statutory withdrawal period.
  - Admin replies with return authorization steps, packaging requirements for the luxury cofanetto, and pickup details.
  - Verifies ticket transition from `unread` -> `pending` -> `replied`.
- **T4.4 — Scenario: "VIP Bespoke Customization & Diamond Inquiry"**:
  - High-value client requests bespoke Moissanite/Diamond setting customization.
  - Ticket logged with high priority metadata.
  - Admin replies with personalized consultation invitation from Mario Pepe.

---

## 4. Test Harness & Execution Infrastructure

### Directory Structure
```
tests/concierge/
├── test-helpers.ts                        # Mock Request generator, assertions, Supabase cleanup
├── tier1-feature-coverage.test.ts         # Tier 1 test definitions
├── tier2-boundary-corner-cases.test.ts    # Tier 2 test definitions
├── tier3-cross-feature-combinations.test.ts # Tier 3 test definitions
└── tier4-real-world-scenarios.test.ts     # Tier 4 test definitions

scripts/
└── test_e2e_concierge.ts                  # Standalone master test runner
```

### Execution Command
```bash
npx tsx scripts/test_e2e_concierge.ts
```

### Expected Output & Pass Criteria
- **Zero uncaught exceptions** across all 4 tiers.
- **100% test pass rate** for valid feature implementations.
- **Automated teardown**: All generated test tickets cleaned up via `cleanupTestData()` upon completion.

---

## 5. Verification Matrix & Authoritative Standards

| Test Suite | Total Tests | Target SUT Area | Success Threshold |
|---|---|---|---|
| **Tier 1: Feature Coverage** | 20+ | `POST /api/contact`, `POST /api/admin/messages/reply`, `verifyAdminAuth`, `actions_messages.ts` | 100% Pass |
| **Tier 2: Boundary & Corner** | 15 | Spam traps, bot UA, rate limiting, SQLi/XSS, oversized inputs, Unicode | 100% Pass |
| **Tier 3: Cross-Feature** | 4 | Multi-step lifecycle, multi-ticket grouping, bot isolation, concurrency | 100% Pass |
| **Tier 4: Real-World Scenarios** | 4 | Sizing consultation, tracking, return/exchange, VIP inquiry | 100% Pass |
| **Total Test Suite** | **45+ Tests** | **Full Isabel Pepe Concierge Ecosystem** | **100% Pass** |
