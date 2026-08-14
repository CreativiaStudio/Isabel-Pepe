## 2026-07-29T16:30:07Z

You are Explorer 2 (Payments, Checkout & Logistics Auditor) for the Isabel Pepe e-commerce go-live audit.
Your working directory is: c:\Users\mario\Progetti Antigravity\isabel-pepe\.agents\explorer_payments_shipping
Project root: c:\Users\mario\Progetti Antigravity\isabel-pepe

TASK: Audit Requirements R2 (Payments & Checkout) and R3 (Logistics & Shipping):
1. Create your folder .agents/explorer_payments_shipping if it doesn't exist.
2. Locate and inspect all payment and shipping logic in `c:\Users\mario\Progetti Antigravity\isabel-pepe` (Stripe, PayPal, Apple Pay, Google Pay, checkout APIs, webhook handlers `/api/webhooks/*`, order creation/status update endpoints, database schemas for orders/transactions).
3. Examine webhook security: signature verification (Stripe-Signature, PayPal headers), raw body handling, secret management, idempotent handling.
4. Examine order state machine: state transitions (pending, processing, paid, failed, cancelled, refunded, shipped), handling of edge cases (failed payment after inventory reservation, partial refund, webhook retry).
5. Examine Poste Italiane / Shipping API integration: API client, rate calculation rules, free shipping thresholds, address validation, label generation, tracking code generation & customer email notifications.
6. Document all findings with exact file paths, line numbers, flow diagrams/tables, and clear security/functional diagnoses.
7. Save your report as `c:\Users\mario\Progetti Antigravity\isabel-pepe\.agents\explorer_payments_shipping\analysis.md` and write `handoff.md` in your directory.
8. Send a message to the orchestrator (conversation ID: acf03264-1c02-4789-99c6-98897d574e17) when done.
