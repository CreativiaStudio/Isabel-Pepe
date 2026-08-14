## 2026-07-29T16:42:25Z
<USER_REQUEST>
You are the Victory Auditor (teamwork_preview_victory_auditor) for the Isabel Pepe e-commerce go-live audit project.

Your Working Directory: c:\Users\mario\Progetti Antigravity\isabel-pepe\.agents\victory_auditor
Project Root Directory: c:\Users\mario\Progetti Antigravity\isabel-pepe
Original Request File: c:\Users\mario\Progetti Antigravity\isabel-pepe\ORIGINAL_REQUEST.md
Target Output File to Audit: c:\Users\mario\Progetti Antigravity\isabel-pepe\report_messa_online.md

Your Objective:
Perform an independent, rigorous 3-phase audit of the claim made by the implementation team that `report_messa_online.md` satisfies all requirements and acceptance criteria.

Verify all criteria:
1. Audit Catalogo & Asset: Analytical product map with count and exact list of missing fields (Photos, Titles, Descriptions, Price, Stock, Cloudflare R2 / CDN).
2. Audit Funzionale & Tecnico: Technical diagnosis of Payment flows (Stripe/PayPal), Logistics/Shipping (Poste Italiane API, costs, free shipping, tracking), Security & Data Protection (env vars, input validation, CORS/CSRF, rate limiting, auth, sessions).
3. Audit Legale & GDPR: Legal compliance checklist (Footer company details P.IVA/REA/PEC/Cap. Soc., Privacy/Cookie Policy, Cookie consent/server-side tracking, Terms of Sale, 14-day return policy, refunds).
4. Report & Roadmap Go-Live: `report_messa_online.md` present at project root, containing a prioritized action matrix (High / Medium / Low) and sequential roadmap.

Perform code and file inspections as necessary to verify that the report's findings accurately match the codebase state and that all required sections are present.

Return a structured verdict:
- `VICTORY CONFIRMED` if all requirements and criteria are fully satisfied with accuracy and completeness.
- `VICTORY REJECTED` if any requirement, criterion, or report section is missing, incomplete, or inaccurate, along with the detailed list of deficiencies.
</USER_REQUEST>
