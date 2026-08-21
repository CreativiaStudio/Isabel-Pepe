# Execution Plan — Phase 1: Cybersecurity & SEO Foundations

## Objective
Implement and verify all 4 requirements from ORIGINAL_REQUEST.md:
- R1: Authoritative Checkout Price Validation (`app/api/checkout/route.ts`)
- R2: Strict Admin & AI API Security Guard (`lib/auth-guard.ts`, admin routes, jarvis routes, `middleware.ts`)
- R3: OWASP Security Headers in `next.config.ts`
- R4: Dynamic Sitemap & Robots.txt for Google Search Console (`app/sitemap.ts`, `app/robots.ts`)

## Steps
1. **Survey (Exploration)**:
   - Spawn 3 parallel Explorers to survey existing implementations, Supabase helpers, auth patterns, routing structure, Next.js configuration, and edge cases.
2. **Decomposition & Architecture (PROJECT.md)**:
   - Merge findings into `PROJECT.md` specifying exact interfaces, files, and changes needed.
3. **Implementation**:
   - Dispatch Worker to implement R1, R2, R3, R4 with full fidelity and integrity warnings.
4. **Independent Verification & Gate**:
   - Reviewer 1 & Reviewer 2: Verify code correctness, robustness, Next.js conventions, auth coverage.
   - Challenger 1 & Challenger 2: Adversarial tests (price tampering attack simulation, unauthorized admin/jarvis access, headers inspection, sitemap/robots XML/text verification).
   - Forensic Auditor: Integrity check (ensure no dummy/hardcoded mock bypasses).
   - Build Verification: `npm run build` must pass cleanly with 0 errors.
5. **Gate Evaluation**:
   - Check all criteria strictly (AND logic).
6. **Handoff & Report**:
   - Write `handoff.md`, update state, send message to parent.
