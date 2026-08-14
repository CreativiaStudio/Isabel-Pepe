# Handoff Report: Payments, Checkout & Logistics Audit (R2 & R3)

**Auditor:** Explorer 2 (Payments, Checkout & Logistics Auditor)  
**Target Path:** `c:\Users\mario\Progetti Antigravity\isabel-pepe\.agents\explorer_payments_shipping\handoff.md`  
**Date:** July 29, 2026  

---

## 1. Observation

Direct observations and findings from code inspection across `c:\Users\mario\Progetti Antigravity\isabel-pepe`:

1. **Client Price Trust in Checkout Route:**
   - File: `app/api/checkout/route.ts` lines 20–30:
     ```typescript
     unit_amount: Math.round(item.price * 100),
     ```
     `item.price` comes directly from `request.json()` payload without querying Supabase database prices.

2. **Unset Webhook Secret Environment Variable:**
   - File: `.env.local` line 9:
     ```env
     STRIPE_WEBHOOK_SECRET=inserisci_qui_il_webhook_secret_di_stripe
     ```
   - File: `app/api/webhook/route.ts` lines 12–15:
     ```typescript
     if (!webhookSecret) {
       console.error('Missing STRIPE_WEBHOOK_SECRET');
       return NextResponse.json({ error: 'Webhook secret is missing' }, { status: 500 });
     }
     ```

3. **Absence of Webhook Idempotency:**
   - File: `app/api/webhook/route.ts` lines 30–64:
     No lookup is performed on `orders` for `stripe_session_id` before inserting a new order, incrementing customer spend, or decrementing product stock.

4. **Missing Database Schema Columns:**
   - File: `supabase_schema.sql` lines 21–31 defines `orders` table without `tracking_code` or `shipped_at` columns.
   - File: `app/admin/actions_orders.ts` lines 31 & 34 attempts to update `shipped_at` and `tracking_code`.

5. **Simulated Email Notifications:**
   - File: `lib/email.ts` lines 5–11 outputs to `console.log`:
     ```typescript
     console.log(`=== SIMULAZIONE INVIO EMAIL ===`);
     ```
     Resend API call is commented out (lines 14–32) and `RESEND_API_KEY` is missing from `.env.local`.

6. **Missing Shipping Carrier API & Shipping Rates:**
   - File: `app/admin/ShippingTable.tsx` lines 96–103 provides manual input for tracking code; zero integration with Poste Italiane, DHL, or carrier APIs.
   - File: `app/api/checkout/route.ts` specifies no `shipping_options`; shipping cost defaults to €0.00.

---

## 2. Logic Chain

1. **Price Tampering Vulnerability:**
   - *Observation 1* shows unit amount calculation uses raw client JSON data.
   - *Logic:* Because unit prices are not re-fetched or checked against authoritative DB records, any request modified to send `price: 0.01` will create a valid Stripe Checkout session charging €0.01.
   - *Conclusion:* High security risk of financial fraud.

2. **Webhook Failure & Unhandled Orders:**
   - *Observation 2* shows `STRIPE_WEBHOOK_SECRET` is set to placeholder text.
   - *Logic:* `stripe.webhooks.constructEvent` will fail signature verification in production.
   - *Conclusion:* Stripe payments will succeed on the gateway, but orders will fail to insert into Supabase, customer CRM stats will not update, and stock won't decrement.

3. **Database & Order State Inconsistencies:**
   - *Observations 3 & 4* show missing DB columns in SQL schema and zero duplicate-check logic in webhooks.
   - *Logic:* Duplicate webhooks from Stripe will result in duplicate DB entries and incorrect stock deductions; fresh DB deployments from `supabase_schema.sql` will throw runtime errors when marking orders as shipped.

4. **Logistics & Customer Communication Gap:**
   - *Observations 5 & 6* show email notifications are simulated in console logs and carrier shipping APIs/rate logic are absent.
   - *Logic:* Store operators cannot automate label creation, shipping cost calculations, or customer shipping confirmation emails.

---

## 3. Caveats

- **External Gateway Dashboards:** The Stripe Dashboard configuration (e.g. enabling Apple Pay, Google Pay, domain verification) could not be checked directly as it requires live credentials.
- **Production Supabase DB:** Live database tables on Supabase cloud were not directly queried via SQL connection string during this static audit; observations reflect `supabase_schema.sql` and server actions code.

---

## 4. Conclusion

Requirements R2 (Payments & Checkout) and R3 (Logistics & Shipping) contain **3 Critical/Blocker vulnerabilities** (Client Price Manipulation, Unset Webhook Secret, Simulated Email Confirmation) and **3 High-severity gaps** (Lack of Idempotency, Missing Shipping Rate Calculation, No Carrier Label API).

The system cannot safely go live until these issues are remediated.

---

## 5. Verification Method

To independently verify these findings:

1. **Verify Price Tampering:**
   - Run `npm run dev`
   - Send HTTP POST request to `http://localhost:3000/api/checkout`:
     ```json
     {
       "items": [{"id": "<valid_product_id>", "name": "Test Item", "price": 0.01, "quantity": 1}],
       "customerEmail": "tester@example.com"
     }
     ```
   - Check if response returns a valid Stripe checkout URL for €0.01.

2. **Verify Webhook Signature Failure:**
   - Inspect `.env.local` line 9 for placeholder string.
   - Trigger test webhook via Stripe CLI (`stripe trigger checkout.session.completed`).
   - Observe `400 Bad Request` or signature error in console.

3. **Verify Email Simulation:**
   - Inspect `lib/email.ts` line 5 to verify `sendShippingConfirmationEmail` prints `=== SIMULAZIONE INVIO EMAIL ===` instead of dispatching emails via Resend.
