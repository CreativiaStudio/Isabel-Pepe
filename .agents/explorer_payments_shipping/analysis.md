# Technical Audit Report: Payments, Checkout & Logistics (Requirements R2 & R3)

**Project:** Isabel Pepe E-Commerce Platform (`isabel-pepe-v2`)  
**Auditor:** Explorer 2 (Payments, Checkout & Logistics Auditor)  
**Date:** July 29, 2026  
**Status:** Audit Complete — Critical Vulnerabilities & Blockers Identified  

---

## 1. Executive Summary & Diagnostic Scorecard

| Area | Component / Requirement | Audit Finding Status | Risk Level |
|---|---|---|---|
| **R2: Payments** | Stripe Checkout API (`/api/checkout`) | Functional with critical price tampering vulnerability | **CRITICAL** |
| **R2: Payments** | Multi-Payment Options (PayPal, Klarna, Scalapay) | Configured in Stripe Session, UI badges displayed | **LOW** |
| **R2: Payments** | Webhook Security (`/api/webhook`) | Configured in code, UNCONFIGURED in `.env.local` | **HIGH** |
| **R2: Payments** | Webhook Idempotency & Raw Body | Raw body processed; ZERO idempotency check | **HIGH** |
| **R2: Payments** | Order Creation & Abandoned Cart Recovery | Saves to DB on webhook; cart recovered flag updated | **MEDIUM** |
| **R2: Payments** | DB Schema & Transaction Consistency | `orders` table lacks `tracking_code`, `shipped_at`, `status` constraints | **HIGH** |
| **R3: Logistics** | Shipping API Client (Poste Italiane / DHL) | **NON-EXISTENT**. Manual tracking entry only in admin UI | **BLOCKER** |
| **R3: Logistics** | Shipping Rates & Threshold Rules | Hardcoded placeholder note; NO calculation logic in code | **BLOCKER** |
| **R3: Logistics** | Address Validation | NO client/server validation; standard Stripe address collection | **MEDIUM** |
| **R3: Logistics** | Label Generation | **NON-EXISTENT**. No label generation or PDF output | **BLOCKER** |
| **R3: Logistics** | Customer Tracking Emails | **SIMULATED ONLY** (`console.log`). Resend commented out | **BLOCKER** |

---

## 2. Detailed Audit: Requirement R2 (Payments & Checkout)

### 2.1 Checkout Architecture & Flow

```
[Client: CartDrawer.tsx]
       │
       │ (1) POST /api/checkout { items: [{id, name, price, quantity}], customerEmail, couponCode }
       ▼
[Server: app/api/checkout/route.ts]
       │
       ├─► Reads price directly from CLIENT payload (no DB re-fetch!) ⚠️ CRITICAL
       ├─► Inserts abandoned cart into `abandoned_carts`
       ├─► Validates coupon in DB & creates single-use Stripe coupon
       ├─► Calls stripe.checkout.sessions.create()
       │
       ▼ (2) Returns { sessionId, url }
[Stripe Hosted Checkout Page]
       │
       │ (3) User completes payment
       ▼
[Stripe Webhook Event: checkout.session.completed]
       │
       ▼ (4) POST /api/webhook
[Server: app/api/webhook/route.ts]
       ├─► Verifies stripe-signature using STRIPE_WEBHOOK_SECRET
       ├─► Inserts order into `orders` DB table
       ├─► Updates `abandoned_carts` status to 'recovered'
       ├─► Upserts `customers` DB table (CRM)
       └─► Decrements product stock in `products` DB table
```

### 2.2 Payment Gateways & Alternative Payment Methods (APMs)
* **File Reference:** `app/api/checkout/route.ts` (lines 87–95), `components/CartDrawer.tsx` (lines 272–288).
* **Payment Methods Configured:**
  * Stripe Checkout Session specifies `payment_method_types: ['card', 'paypal', 'klarna', 'scalapay']`.
  * Front-end UI in `CartDrawer.tsx` displays badges for PayPal, Klarna, Scalapay.
* **Apple Pay / Google Pay:** Handled automatically by Stripe Checkout when viewing on supported devices/browsers if enabled in the Stripe Merchant Dashboard.
* **Currency:** Hardcoded to `eur` (line 22 & line 77).
* **Allowed Shipping Countries:** Restricted to Italy (`IT`), San Marino (`SM`), and Vatican City (`VA`) (line 93).

### 2.3 Webhook Verification, Raw Body Handling & Security Diagnosis
* **File Reference:** `app/api/webhook/route.ts` (lines 11–27), `.env.local` (line 9).
* **Raw Body Handling:** Correctly retrieves raw request body via `await req.text()` (line 17) in Next.js Route Handlers.
* **Signature Verification:** Uses `stripe.webhooks.constructEvent(payload, signature, webhookSecret)` (line 23).
* **CRITICAL SECURITY RISK #1 — Unset Webhook Secret in Environment:**
  * `.env.local` line 9 contains: `STRIPE_WEBHOOK_SECRET=inserisci_qui_il_webhook_secret_di_stripe`.
  * **Impact:** In production or staging, webhook signature verification will crash with `400 Bad Request` or fail completely with HTTP 500 (`Missing STRIPE_WEBHOOK_SECRET`), resulting in unhandled purchases where money is captured by Stripe but no order is created in the database, stock is not updated, and CRM entries are missed.
* **CRITICAL SECURITY RISK #2 — Lack of Idempotency Protection:**
  * `app/api/webhook/route.ts` has **NO idempotency check**. Stripe webhooks can be delivered multiple times (retries or network duplicates).
  * **Impact:** When a duplicate `checkout.session.completed` event is received:
    1. A duplicate order record is inserted into the `orders` table.
    2. Customer `total_spent` in `customers` table is incorrectly doubled.
    3. Product stock in `products` table is decremented a second time.

### 2.4 Vulnerability: Client-Provided Price Manipulation
* **File Reference:** `app/api/checkout/route.ts` (lines 12–30), `components/CartDrawer.tsx` (lines 77–83).
* **Code Trace:**
  ```typescript
  // app/api/checkout/route.ts (lines 12, 20-30)
  const body = await request.json();
  const items = Array.isArray(body) ? body : body.items;
  
  const lineItems = items.map((item: { id: string; name: string; price: number; quantity: number; image?: string }) => ({
    price_data: {
      currency: 'eur',
      product_data: { name: item.name },
      unit_amount: Math.round(item.price * 100), // <-- TRUSTS CLIENT PRICE!
    },
    quantity: item.quantity,
  }));
  ```
* **Exploit Path:** A malicious user can intercept the POST request to `/api/checkout` using browser DevTools or Postman and change `items[0].price` from `185.00` to `0.01`. Stripe will create a checkout session for €0.01, charge the client €0.01, and the webhook will process the order as `paid`.
* **Required Fix:** `/api/checkout` must fetch product IDs from Supabase DB, obtain authoritative prices server-side, and calculate line item prices using server data.

### 2.5 Database Schema & Order State Machine Analysis
* **File Reference:** `supabase_schema.sql` (lines 20–31), `app/admin/actions_orders.ts` (lines 27–66).
* **DB Schema Deficiencies:**
  * Schema definition in `supabase_schema.sql` lines 21–31:
    ```sql
    CREATE TABLE orders (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        stripe_session_id VARCHAR(255) UNIQUE,
        customer_email VARCHAR(255) NOT NULL,
        customer_name VARCHAR(255) NOT NULL,
        amount_total DECIMAL(10, 2) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        shipping_address JSONB,
        items JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
    );
    ```
  * **Missing Columns in DB Schema File:** `tracking_code` and `shipped_at` are written to by `actions_orders.ts` (lines 31, 34), but are **NOT declared** in `supabase_schema.sql`. If Supabase DB was built directly from `supabase_schema.sql`, updating order status to `shipped` with a tracking code will throw a database column error.
* **Order State Transitions:**
  * Code supports states: `'pending'`, `'paid'`, `'shipped'`, `'delivered'`.
  * Admin UI (`OrdersTable.tsx` lines 67–71, 108–117) displays state choices: `In Attesa (pending)`, `Da Spedire (paid)`, `Spedito (shipped)`, `Consegnato (delivered)`.
  * **Missing State Machine Logic:**
    * **No `cancelled` or `failed` state handling:** If a payment fails on Stripe, no webhook handles `payment_intent.payment_failed` or `checkout.session.expired`.
    * **No refund handling:** No logic exists for full or partial refunds (`charge.refunded` or admin refund actions).
    * **Inventory reservation race condition:** Product stock is only decremented in `app/api/webhook/route.ts` (lines 122–136) AFTER payment succeeds. There is no temporary inventory lock during checkout. If stock is 1 and two users enter checkout simultaneously, both can purchase the item, resulting in overselling.

---

## 3. Detailed Audit: Requirement R3 (Logistics & Shipping)

### 3.1 Carrier API Integration (Poste Italiane / DHL / Shipping Client)
* **File Reference:** Entire codebase searched (`app/admin/ShippingTable.tsx`, `app/admin/actions_orders.ts`, `lib/email.ts`).
* **Audit Finding:** **0% Courier API Integration.**
  * There is NO API client, SDK, or HTTP call for Poste Italiane (SDA / Crono), DHL, BRT, or any shipping carrier.
  * In `app/admin/ShippingTable.tsx`, shipping management is 100% manual: the store admin manually types a tracking code into an HTML text input field (`trackingInputs[order.id]`) and clicks "Segna Spedito".
  * Address format is copied to clipboard via a client button (`copyToClipboard`) to manually paste into an external postal application.

### 3.2 Shipping Rates, Calculation & Free Shipping Thresholds
* **File Reference:** `app/api/checkout/route.ts`, `components/CartDrawer.tsx` line 290.
* **Audit Finding:** **NO Shipping Rate Calculation Code.**
  * `CartDrawer.tsx` line 290 displays: *"Spedizione e tasse calcolate al checkout"*.
  * However, `app/api/checkout/route.ts` does NOT configure `shipping_options` in `stripe.checkout.sessions.create()`.
  * **Result:** Shipping cost is always €0.00 at checkout, regardless of order subtotal or destination. No free shipping threshold rules (e.g. "Free shipping above €100") are implemented anywhere in the code.

### 3.3 Address Validation & Processing
* **File Reference:** `app/api/checkout/route.ts` lines 92–94.
* **Audit Finding:** Standard Stripe address collection (`allowed_countries: ['IT', 'SM', 'VA']`).
* **Deficiencies:**
  * No address validation API (e.g., CAP validation, street name verification, or Poste Italiane / Google Places address normalization).
  * Incomplete addresses entered by customers on Stripe are passed straight into `orders.shipping_address` JSONB without structural sanitization or validation.

### 3.4 Shipping Label Generation
* **File Reference:** Entire project root.
* **Audit Finding:** **NON-EXISTENT.**
  * No shipping label generation logic exists.
  * No PDF rendering (e.g., PDFKit, Puppeteer) or carrier label format API calls exist.

### 3.5 Tracking Code Generation & Customer Email Notifications
* **File Reference:** `lib/email.ts` (lines 5–35), `app/admin/actions_orders.ts` (lines 55–62).
* **Audit Finding:** **EMAIL NOTIFICATIONS ARE SIMULATED PLACEHOLDERS.**
  * In `lib/email.ts`:
    ```typescript
    export async function sendShippingConfirmationEmail(customerEmail: string, customerName: string, trackingCode: string, orderId: string) {
      console.log(`\n\n=== SIMULAZIONE INVIO EMAIL ===`);
      console.log(`A: ${customerEmail} (${customerName})`);
      console.log(`Oggetto: Il tuo ordine Isabel Pepe è in viaggio!`);
      ...
    }
    ```
  * Actual Resend API code is commented out (lines 14–32).
  * `RESEND_API_KEY` is not present in `.env.local`.
  * **Result:** When an admin marks an order as shipped and inputs a tracking code, NO email is delivered to the customer; it only prints a `console.log` on the server terminal.

---

## 4. Synthesis of Findings & Risk Categorization

| ID | Issue Description | Location | Operational & Security Impact | Priority |
|---|---|---|---|---|
| **R2-01** | Client-side Price Manipulation | `app/api/checkout/route.ts:27` | Customers can modify request payload to purchase luxury items for €0.01. | **P0 (Critical)** |
| **R2-02** | Unset Webhook Secret | `.env.local:9` | Webhook verification fails or crashes; orders paid on Stripe won't record in DB. | **P0 (Critical)** |
| **R2-03** | Lack of Webhook Idempotency | `app/api/webhook/route.ts:30-60` | Network retries create duplicate orders, corrupt customer total spend, double-decrement stock. | **P1 (High)** |
| **R2-04** | Missing DB Schema Columns | `supabase_schema.sql:21-31` | `orders` table in SQL schema lacks `tracking_code` & `shipped_at` columns used in Server Actions. | **P1 (High)** |
| **R3-01** | Simulated Email Delivery | `lib/email.ts:5-35` | Customers receive ZERO email notifications when orders ship with tracking codes. | **P0 (Blocker)** |
| **R3-02** | No Carrier API Integration | `app/admin/ShippingTable.tsx` | No automated shipping labels, tracking sync, or automated carrier dispatch. | **P1 (High)** |
| **R3-03** | Missing Shipping Cost Logic | `app/api/checkout/route.ts` | Shipping is hardcoded to €0.00; no threshold rules or rates calculated at checkout. | **P1 (High)** |
| **R2-05** | Unhandled Order State Edge Cases | `app/api/webhook/route.ts` | No handling for failed/expired payment sessions or partial/full refunds. | **P2 (Medium)** |

---

## 5. Verification & Remediation Instructions

### 5.1 Verification Commands
1. **Database Schema Verification:**
   Execute against PostgreSQL DB / Supabase SQL Editor:
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'orders';
   ```
   *Expected:* Confirm presence of `tracking_code` (TEXT/VARCHAR) and `shipped_at` (TIMESTAMPTZ).

2. **Price Tampering Verification (curl test):**
   ```bash
   curl -X POST http://localhost:3000/api/checkout \
     -H "Content-Type: application/json" \
     -d '{"items":[{"id":"real-prod-id","name":"Bracciale Sospeso Luce","price":0.01,"quantity":1}],"customerEmail":"test@example.com"}'
   ```
   *Current behavior:* Returns valid Stripe checkout session URL for €0.01.  
   *Expected behavior:* Should validate product ID against database and reject client-supplied unit price.

3. **Stripe Webhook Signature Verification:**
   ```bash
   stripe listen --forward-to localhost:3000/api/webhook
   ```
   Inspect console output for signature mismatch error if `STRIPE_WEBHOOK_SECRET` in `.env.local` does not match CLI webhook signing secret `whsec_...`.

### 5.2 Specific Patch Recommendations (Proposed Code Snippets)

#### A. Fix Price Tampering in `/api/checkout/route.ts`:
```typescript
// Replace lines 20-30 in app/api/checkout/route.ts with server DB lookup:
const productIds = items.map((i: any) => i.id);
const { data: dbProducts } = await supabaseAdmin
  .from('products')
  .select('id, name, price')
  .in('id', productIds);

const productMap = new Map(dbProducts?.map(p => [p.id, p]));

const lineItems = items.map((item: any) => {
  const dbProd = productMap.get(item.id);
  if (!dbProd) throw new Error(`Product ${item.id} not found`);
  const actualPrice = dbProd.price; // Use verified server DB price
  return {
    price_data: {
      currency: 'eur',
      product_data: { name: dbProd.name },
      unit_amount: Math.round(actualPrice * 100),
    },
    quantity: item.quantity,
  };
});
```

#### B. Fix Idempotency in `/api/webhook/route.ts`:
```typescript
// Add idempotency check before processing event data (app/api/webhook/route.ts line 33):
const { data: existingOrder } = await supabaseAdmin
  .from('orders')
  .select('id')
  .eq('stripe_session_id', session.id)
  .single();

if (existingOrder) {
  console.log(`Order for session ${session.id} already processed. Skipping.`);
  return NextResponse.json({ received: true, duplicate: true });
}
```

#### C. Enable Resend Email in `lib/email.ts`:
1. Obtain Resend API Key and set `RESEND_API_KEY` in `.env.local`.
2. Uncomment Resend import and replace placeholder `console.log` in `lib/email.ts` with `resend.emails.send()`.

---

## 6. Conclusion

The Isabel Pepe platform has a functional baseline checkout flow via Stripe Hosted Checkout, but is **NOT ready for production go-live**. Immediate remediation of critical security vulnerabilities (client price tampering, missing webhook secret, webhook idempotency) and logistics blockers (missing shipping calculation, missing carrier API, simulated email confirmation) is required prior to commercial operations.
