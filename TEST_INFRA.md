# Isabel Pepe Privilege Club — E2E Test Infrastructure & Specification
**Document Version**: 1.0.0  
**Project**: Isabel Pepe — Haute Joaillerie Italiana  
**Scope**: Privilege Club VIP Ecosystem (Footer, Modal, Subscribe API, Resend Welcome Email, Coupon `PRIVILEGE10`, CRM Unified View, CSV Export)  
**Target Environment**: Next.js 16 (App Router), TypeScript, Supabase PostgreSQL, Stripe Checkout, Resend API

---

## 1. Executive Summary & Testing Philosophy

The **Isabel Pepe Privilege Club** is a mission-critical VIP customer acquisition and retention channel for a high-end luxury jewelry brand. Testing this ecosystem requires zero tolerance for data corruption, privacy violations, or broken customer checkout flows.

Our test infrastructure adheres to a **4-Tier Comprehensive Testing Methodology**:
1. **Tier 1 — Exhaustive Feature Coverage**: Minimum of 5 isolated test cases for each functional capability.
2. **Tier 2 — Boundary & Corner Cases**: Stress-testing malformed inputs, SQL injection/XSS payloads, Unicode, race conditions, and coupon state boundaries.
3. **Tier 3 — Cross-Feature Integration**: Multi-step stateful workflows validating cross-module contracts (e.g. Subscribe ➔ Coupon ➔ Cart ➔ Checkout ➔ CRM).
4. **Tier 4 — Real-World Production Scenarios**: End-to-end customer journeys replicating genuine user behaviors and adversarial bot attacks.

```
+-------------------------------------------------------------------------+
|                  TIER 4: Real-World Production Scenarios                |
|  - Full VIP Onboarding Journey (Modal -> UTM -> Checkout -> CRM)        |
|  - Returning High-Value Customer Re-engagement                          |
|  - High-Volume Spambot Attack Resilience & Zero DB Pollution            |
+-------------------------------------------------------------------------+
                                    ▲
+-------------------------------------------------------------------------+
|                  TIER 3: Cross-Feature Integration                      |
|  - Subscribe -> Validate Coupon -> Create Checkout Session -> Verify CRM |
|  - Honeypot Trap + Malformed Input Short-Circuiting                     |
|  - Existing Customer Tag Merging & Preservation                         |
+-------------------------------------------------------------------------+
                                    ▲
+-------------------------------------------------------------------------+
|                  TIER 2: Boundary & Corner Cases                        |
|  - Malformed & Edge-case Emails (RFC 5322, Plus-addressing, spaces)     |
|  - Security Hardening (SQL Injection & XSS Payloads)                    |
|  - High Concurrency / Duplicate Submissions Race Condition              |
|  - Coupon Bounds (Expired, Inactive, Mismatched Target Email)           |
+-------------------------------------------------------------------------+
                                    ▲
+-------------------------------------------------------------------------+
|                  TIER 1: Exhaustive Feature Coverage (>=5 per feature)  |
|  1. Subscribe Endpoint  2. GDPR Rejection    3. Honeypot Anti-Bot       |
|  4. Coupon Validation   5. Welcome Email     6. CRM Synchronization     |
|  7. Admin KPI & CSV Export                                              |
+-------------------------------------------------------------------------+
```

---

## 2. Test Harness & Environment Architecture

### 2.1 Technology Stack & Test Runner
- **Runtime**: Node.js 25+ / TypeScript via `tsx`
- **Database Access**: Direct Supabase PostgreSQL via `@supabase/supabase-js` (`supabaseAdmin`) with isolated test tenant records and automatic cleanup.
- **Mocking & Isolation**: Mocking of external transactional email gateways (Resend) when API keys are not in test sandbox mode, combined with payload structure assertions.
- **Execution Script**: `npx tsx scripts/run_privilege_club_e2e.ts`

### 2.2 Test Data Isolation & Idempotency Rules
1. **Isolated Namespacing**: All test email addresses utilize unique timestamped domain identifiers (e.g., `e2e.vip.<timestamp>@isabelpepe-test.com`).
2. **Deterministic Teardown**: Each test suite records created entities and provides automated teardown hooks to purge test records from `newsletter_subscribers`, `crm_contacts`, and test carts.
3. **No Production Pollution**: Test records are tagged with `e2e-test` to ensure admin KPI queries during testing do not pollute production analytics.

---

## 3. Tier 1: Exhaustive Feature Coverage (>= 5 Tests Per Feature)

### Feature 1: Newsletter Subscription Endpoint (`/api/newsletter/subscribe`)
- **T1.1.1 (Standard Footer Subscription)**: POST valid email with `source: "footer"` and `gdprConsent: true`. Expect `200 OK`, `success: true`, `coupon: "PRIVILEGE10"`, and record in `newsletter_subscribers`.
- **T1.1.2 (VIP Modal Popup Subscription)**: POST valid email with `source: "popup_vip"` and `gdprConsent: true`. Expect `200 OK` and record with `source: "popup_vip"`.
- **T1.1.3 (Full Metadata Payload)**: POST email with `first_name`, `last_name`, `phone`, `utm_source`, `utm_medium`, `utm_campaign`, `visitor_id`, `consent_id`. Expect all fields accurately stored in database.
- **T1.1.4 (Idempotent Resubscription)**: Submitting the same email a second time returns `200 OK` with `success: true` without throwing PostgreSQL unique constraint violations (upsert on email).
- **T1.1.5 (Audit Trail Capture)**: Verify that `ip_address`, `user_agent`, and `consent_given_at` (ISO timestamp) are recorded for regulatory compliance.

### Feature 2: GDPR Consent Enforcement & Rejection
- **T1.2.1 (Missing GDPR Field)**: POST payload without `gdprConsent`. Expect `400 Bad Request`, `error: "Consenso GDPR obbligatorio"`, and zero records in database.
- **T1.2.2 (Explicit False GDPR)**: POST payload with `gdprConsent: false`. Expect `400 Bad Request`.
- **T1.2.3 (Null / Undefined GDPR)**: POST payload with `gdprConsent: null`. Expect `400 Bad Request`.
- **T1.2.4 (String False GDPR)**: POST payload with `gdprConsent: "false"`. Expect `400 Bad Request`.
- **T1.2.5 (No Side-Effects on Rejection)**: Verify that when GDPR is rejected, no records are added or updated in either `newsletter_subscribers` or `crm_contacts`.

### Feature 3: Honeypot & Anti-Bot Trapping
- **T1.3.1 (Honeypot `website_url`)**: POST with `website_url: "https://spam-bot.xyz"`. Expect `200 OK` (dummy success response) but 0 rows inserted in `newsletter_subscribers`.
- **T1.3.2 (Honeypot `website_hp`)**: POST with `website_hp: "bot_filled"`. Expect `200 OK` dummy response and 0 rows inserted.
- **T1.3.3 (Honeypot `confirm_hp`)**: POST with `confirm_hp: "automated_payload"`. Expect `200 OK` dummy response and 0 rows inserted.
- **T1.3.4 (Known Crawler User-Agent)**: POST with human payload but `User-Agent: Mozilla/5.0 (compatible; Googlebot/2.1)`. Expect `200 OK` dummy response and 0 rows inserted.
- **T1.3.5 (Clean Human Request Pass-Through)**: POST with empty honeypot fields (`""`) and standard browser User-Agent. Expect real `200 OK` and row created in database.

### Feature 4: Coupon Validation (`PRIVILEGE10` via `/api/coupons/validate`)
- **T1.4.1 (Standard Validation)**: POST `{ code: "PRIVILEGE10" }`. Expect `200 OK`, `success: true`, `discount_percent: 10`.
- **T1.4.2 (Case-Insensitive Validation)**: POST `{ code: "privilege10" }` or `{ code: "Privilege10" }`. Expect `200 OK` and `code: "PRIVILEGE10"`.
- **T1.4.3 (Missing Code)**: POST `{ code: "" }` or `{}`. Expect `400 Bad Request` with `error: "Codice non fornito"`.
- **T1.4.4 (Non-Existent Code)**: POST `{ code: "INVALID_COUPON_99" }`. Expect `404 Not Found` with `error: "Codice inesistente o scaduto"`.
- **T1.4.5 (Inactive Code Check)**: Inactive coupon in database returns `400 Bad Request` with `error: "Codice non più attivo"`.

### Feature 5: Luxury Welcome Email System
- **T1.5.1 (Email Dispatch Function)**: Verify `sendPrivilegeWelcomeEmail` exists and accepts recipient email and name parameters.
- **T1.5.2 (Coupon Code Presence in Email)**: Generated welcome email HTML contains `PRIVILEGE10` and 10% discount callout.
- **T1.5.3 (Haute Joaillerie Perks Copy)**: Generated welcome email contains atelier perks: 48h early access, seasonal private sales, complimentary jewelry care.
- **T1.5.4 (Official Sender Header)**: Dispatcher specifies `Isabel Pepe <info@isabelpepe.com>` as sender.
- **T1.5.5 (Non-Fatal Resilience)**: Subscribe endpoint handler wraps email trigger in try/catch so email network failures never block the HTTP 200 response.

### Feature 6: CRM & Customer Unified Synchronization
- **T1.6.1 (CRM Contact Creation)**: Subscribing creates or updates record in `crm_contacts` with email, names, and phone.
- **T1.6.2 (Marketing Consent & Status)**: `crm_contacts.marketing_consent` is set to `true`, status set to `'lead'`.
- **T1.6.3 (Privilege Club Tags)**: `crm_contacts.tags` contains `['isabel-pepe', 'privilege-club', 'newsletter', 'gdpr-marketing-ok']`.
- **T1.6.4 (Customer Table Tagging)**: If customer exists in `customers` table, `'Club Privé'` tag is appended to customer tags.
- **T1.6.5 (CRM Tag Filtering)**: Querying `crm_contacts` with `@> ARRAY['privilege-club']` retrieves all Privilege Club members.

### Feature 7: Admin Newsletter KPI & CSV Export
- **T1.7.1 (Subscriber Count Metric)**: Query total active subscribers where `is_active = true`.
- **T1.7.2 (Growth Metric Grouping)**: Subscriptions grouped by `created_at::date` calculates daily/weekly signups.
- **T1.7.3 (RFC-4180 CSV Formatting)**: CSV builder formats columns `Email, Nome, Cognome, Telefono, Data Iscrizione, Fonte, UTM Source, UTM Campaign`.
- **T1.7.4 (Excel UTF-8 BOM Header)**: CSV starts with byte order mark `\uFEFF` ensuring accents (`Éclipse`, `Joséphine`) render correctly in Microsoft Excel.
- **T1.7.5 (CSV Value Escaping)**: Names containing commas (`"Pepe, Elena"`) or quotes are wrapped in double quotes according to RFC-4180.

---

## 4. Tier 2: Boundary, Edge & Adversarial Corner Cases

### 4.1 Email Format Boundaries
- **T2.1 (Padded Whitespace)**: `"   test.vip@isabelpepe.com  "` ➔ trimmed and normalized to lowercase.
- **T2.2 (Plus Addressing)**: `"user+privilege2026@isabelpepe.com"` ➔ accepted as valid RFC-compliant address.
- **T2.3 (Missing Domain / TLD)**: `"invalid@"`, `"user@nodomain"`, `"user@.com"` ➔ rejected with `400 Bad Request`.
- **T2.4 (Double Symbols & Spaces)**: `"user@@domain.com"`, `"user @domain.com"` ➔ rejected with `400 Bad Request`.

### 4.2 Security & Injection Hardening
- **T2.5 (SQL Injection in Email)**: `admin' OR '1'='1` ➔ rejected by email validator; parameterization prevents SQL injection.
- **T2.6 (SQL Injection in Name Fields)**: `Elena'); DROP TABLE newsletter_subscribers;--` ➔ safely stored as literal text in PostgreSQL parameterized query.
- **T2.7 (XSS Script Injection in Names/UTM)**: `<script>alert('XSS')</script>` ➔ sanitized and safely stored without script execution in admin CRM or CSV.

### 4.3 Unicode & Extreme Payload Limits
- **T2.8 (Accented & Multilingual Names)**: `Éléonore Nuvolari`, `Chloé Ångström`, `山田 太郎` ➔ stored accurately with UTF-8 encoding.
- **T2.9 (Emoji in Metadata)**: `Elena 💎✨` in name fields ➔ stored cleanly in database and CSV export.
- **T2.10 (Extreme Length UTM Parameters)**: 500-character UTM campaign string ➔ stored without truncating database exceptions.

### 4.4 High Concurrency & Race Conditions
- **T2.11 (Simultaneous Duplicate Requests)**: 5 parallel requests with identical email submitted concurrently at the same millisecond ➔ all return `200 OK`, exactly 1 database row exists.

### 4.5 Coupon Boundary Rules
- **T2.12 (Expired Coupon Code)**: Coupon with `expires_at` in the past ➔ rejected with `400 Bad Request` ("Codice scaduto").
- **T2.13 (Targeted Customer Coupon Mismatch)**: Coupon locked to `vip@isabelpepe.com` attempted by `other@isabelpepe.com` ➔ rejected with `403 Forbidden`.
- **T2.14 (Targeted Customer Coupon Match)**: Coupon locked to `vip@isabelpepe.com` attempted with matching email ➔ validated with `200 OK`.

---

## 5. Tier 3: Cross-Feature Integration Pipelines

### Pipeline 1: Full VIP Acquisition ➔ Coupon ➔ Checkout ➔ CRM Lifecycle
1. **Step 1**: Visitor arrives via Instagram Ad campaign (`utm_source=instagram`, `utm_campaign=privilege_launch`).
2. **Step 2**: Subscribes to Privilege Club via `/api/newsletter/subscribe` with GDPR consent.
3. **Step 3**: Database records subscriber in `newsletter_subscribers` with attribution and in `crm_contacts` with `privilege-club` tag.
4. **Step 4**: System returns `PRIVILEGE10`. Customer validates coupon via `/api/coupons/validate`.
5. **Step 5**: Customer creates cart with "Collana Éclipse" (€262.00). Applying 10% coupon results in €26.20 discount, total €235.80.
6. **Step 6**: Admin CRM query fetches customer and confirms `privilege-club` tag and subscriber status.

### Pipeline 2: Spambot Trap + Invalid Input Short-Circuiting
1. Bot sends combined payload: filled honeypot `website_url: "http://bot.net"` + invalid email `not-an-email` + `gdprConsent: false`.
2. Honeypot detector intercepts first and returns `200 OK` dummy response without executing database queries or revealing error messages to the bot.

### Pipeline 3: Returning Customer Tag Preservation
1. Pre-existing contact in `crm_contacts` has tags `['vip-buyer', 'boutique-client']`.
2. Customer subscribes to Privilege Club online.
3. CRM sync merges tags to `['vip-buyer', 'boutique-client', 'isabel-pepe', 'privilege-club', 'newsletter', 'gdpr-marketing-ok']` without erasing existing tags.

---

## 6. Tier 4: Real-World Production Scenarios

### Scenario 1: New VIP Acquisition Journey via Modal Popup
- Visitor browses product gallery for 10 seconds, triggers Privilege Club Modal.
- Enters `elena.vip@example.com`, `Elena`, `Pepe`, accepts GDPR.
- Receives instant luxury confirmation with coupon `PRIVILEGE10`.
- Adds high-end jewelry to cart, applies `PRIVILEGE10`, proceeds to checkout with 10% discount.
- Admin views new VIP subscriber in Admin CRM with "Club Privé" tag.

### Scenario 2: Returning Customer Loyalty Re-engagement via Footer
- Long-time customer visits homepage, enters email in luxury footer form.
- Re-subscription succeeds smoothly without error.
- Admin exports active subscribers list to CSV; customer appears once with latest timestamp and source `'footer'`.

### Scenario 3: Bot Flood Resilience Under Load
- Automated attack script fires 20 spam submissions with bot User-Agents and honeypot traps.
- All requests return `200 OK` dummy responses within <50ms.
- Database subscriber count remains completely unchanged with zero spam pollution.

---

## 7. Execution Guide & Verification Commands

To run the automated E2E test suite:

```bash
# Run the complete Isabel Pepe Privilege Club E2E Test Suite
npx tsx scripts/run_privilege_club_e2e.ts

# Or run individual tier verification scripts
npx tsx tests/privilege-club/tier1-feature-coverage.test.ts
npx tsx tests/privilege-club/tier2-boundary-corner-cases.test.ts
npx tsx tests/privilege-club/tier3-cross-feature-combinations.test.ts
npx tsx tests/privilege-club/tier4-real-world-scenarios.test.ts
```
