# Isabel Pepe Go-Live Audit Plan

## Overview
Comprehensive audit of Isabel Pepe e-commerce codebase to generate `report_messa_online.md` at project root covering R1 to R7.

## Audit Domains & Subtasks

### Explorer 1: R1 — Product Catalog & Media Audit
- **Files to examine**: Database schemas (Prisma/Drizzle/Supabase/SQL), product models, API routes (`/api/products`, `/api/media`, etc.), image handling components, Cloudflare R2 / S3 / CDN integration code, media optimization scripts.
- **Deliverables**:
  - Exact count and list of missing catalog fields (SKU, weight, descriptions, SEO metadata, prices, inventory, images, materials).
  - Cloudflare R2 / CDN integration status and asset optimization review.
  - Media asset completeness check.

### Explorer 2: R2 & R3 — Payments, Checkout & Logistics Audit
- **Files to examine**: Stripe integration, PayPal integration, Webhooks security (`/api/webhooks/stripe`, `/api/webhooks/paypal`), Apple Pay / Google Pay / Card flow, order state machine/DB schema, Poste Italiane API integration / shipping service, shipping cost calculation rules, free shipping thresholds, shipping label & tracking generation logic.
- **Deliverables**:
  - Functional & technical status of payment gateways & webhook signature verification.
  - State machine consistency for Orders (Pending, Paid, Failed, Refunded, Shipped).
  - Poste Italiane / Shipping API readiness, label generation, free shipping threshold verification.

### Explorer 3: R4, R5 & R6 — Security, GDPR/Legal, SEO & Performance Audit
- **Files to examine**: `.env.example`, `env.mjs`/`env.ts`, middleware, auth headers, CSRF/CORS/Rate limiting implementation, input validation schemas (Zod/Yup), session management, customer PII encryption/storage, footer components, legal pages (`privacy`, `terms`, `cookie-policy`, `returns`), cookie banner / GTM / Meta Pixel server-side tracking scripts, sitemap generator, `robots.txt`, 404 handling, Next.js config / image optimization.
- **Deliverables**:
  - Security vulnerability matrix (exposed keys, missing sanitization, CORS/CSRF gaps, rate limit missing endpoints).
  - Legal & GDPR compliance checklist (Company info, REA, P.IVA, PEC, Cap. Soc., Cookie banner consent, 14-day return compliance).
  - SEO & Analytics audit (Pixel/GA4/GTM server-side status, meta tags, OpenGraph, sitemap, robots.txt, 404, speed).

### Task Allocation & Verification
1. **Explorer 1**: `teamwork_preview_explorer` -> `.agents/explorer_catalog/`
2. **Explorer 2**: `teamwork_preview_explorer` -> `.agents/explorer_payments_shipping/`
3. **Explorer 3**: `teamwork_preview_explorer` -> `.agents/explorer_sec_legal_seo/`
4. **Worker**: `teamwork_preview_worker` -> `.agents/worker_report/` (Generates `report_messa_online.md`)
5. **Reviewer/Auditor**: `teamwork_preview_reviewer` -> `.agents/reviewer_audit/` (Verifies report completeness & accuracy)
