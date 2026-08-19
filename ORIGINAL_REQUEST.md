# Original User Request

## Initial Request — 2026-08-17T17:27:34Z

Task Details:
Sviluppare ed eseguire una pipeline chirurgica per la sostituzione degli abiti delle modelle dell'e-commerce Isabel Pepe (partendo dall'Anello Imperial e replicabile sul resto del catalogo), garantendo la purezza assoluta del gioiello (0% alterazione o perdita di definizione allo zoom) e l'integrazione anatomica fotorealistica.

Requirements:
### R1. Isolamento e Protezione Assoluta del Gioiello (Pixel Preservation)
La pipeline deve estrarre e bloccare i pixel originali ad altissima definizione del gioiello (pietre Moissanite, castoni, griffe e riflessi del metallo) e delle dita a contatto. È severamente vietata la rigenerazione globale o la reinterpretazione AI delle pietre per prevenire qualsiasi sgranatura o deformazione in fase di zoom.

### R2. Sostituzione Sartoriale dell'Abbigliamento (Inpainting & Blending)
Sostituire esclusivamente il tessuto dell'abito (es. abito bianco/crema con colletto con un elegante abito/top sottoveste in pura seta nera a spalline sottili) garantendo ombre di contatto fotorealistiche sulla clavicola e sul collo, senza soluzione di continuità.

### R3. Pipeline Replicabile e Standardizzata per il Catalogo
Creare uno script/procedura automatizzata e documentata per elaborare le altre foto del catalogo Isabel Pepe mantenendo l'archivio master originale e generando asset ottimizzati in formato WebP ad alta risoluzione (1024x1536).

Acceptance Criteria:
- [ ] Il gioiello (Anello Imperial) mantiene le faccette e la brillantezza dell'asset originale anche a ingrandimento macro (zoom 200%).
- [ ] Nessun alone, bordo frastagliato o artefatto di ritaglio tra la pelle della modella e il nuovo abito.
- [ ] La foto finale è in formato WebP verticale (1024x1536) pronta per il caricamento nella galleria prodotto.
- [ ] L'originale è preservato nell'archivio storico (public/Archive/).

## Request — 2026-08-19T17:30:28Z

Implement an ultra-advanced, first-party analytics and traffic intelligence system for the Isabel Pepe luxury e-commerce. The system must eliminate bot noise and test traffic, track real unique visitors across sessions, capture complete multi-channel attribution (Google Organic Search, Meta Ads/Instagram UTMs, Direct, Referral), record geolocation and page engagement, compute real-time e-commerce conversion funnels, provide a high-end visual dashboard in the Admin area, and include dedicated drill-down detail views (e.g. comprehensive analytics page for "Pagine più esplorate", "Sorgenti di traffico nel dettaglio", "Analisi Geografica").

Working directory: c:/Users/mario/Progetti Antigravity/isabel-pepe
Integrity mode: development

## Requirements

### R1. First-Party Tracking Engine & Bot Immune Filter
- Upgrade `components/Tracker.tsx` and `app/api/track/route.ts` to capture `document.referrer`, complete UTM parameters (`utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`), client device type (Desktop, Mobile, Tablet), browser, and geolocation headers (`x-vercel-ip-country`, `x-vercel-ip-city`, `cf-ipcountry`).
- Filter out automated crawlers, uptime checkers, AI bots, headless scrapers, and local development/admin traffic so visitor counts represent genuine human visitors.
- Group repeated pageviews within a 30-minute window into cohesive visitor sessions.

### R2. Omnichannel Attribution Engine
Classify all incoming traffic into standardized, accurate buckets:
- **Google Organic Search**: Referrers containing `google.com`, `google.it`, `google.fr`, etc., without paid search parameters.
- **Meta Ads / Instagram / Facebook**: Visits originating from Instagram (`l.instagram.com`, `instagram.com`), Facebook, or tagged with Meta UTMs (`utm_source=meta|instagram|facebook`).
- **Direct Traffic**: Visitors landing directly via URL input, bookmarks, or direct apps.
- **Referral / PR**: External blogs, fashion press, partner websites, or WhatsApp links.

### R3. Comprehensive Visual Analytics & Funnel Dashboard
Revamp `app/admin/AnalyticsDashboard.tsx` into a high-end, responsive analytics suite featuring:
- **KPI Summary Cards**: Real Unique Human Visitors, Total Page Views, Active Live Visitors (last 5 min), Bounce Rate, and Average Session Duration.
- **Interactive Traffic Trend Charts**: Daily & hourly traffic curves with range filters (*Oggi, Ultimi 7 giorni, Ultimi 30 giorni, Mese Corrente*).
- **Traffic Sources Breakdown**: Visual chart comparing Google Organic vs Meta Ads vs Direct vs Referral with conversion rate per channel.
- **E-Commerce Conversion Funnel**: Step-by-step funnel visualization (Home/Landing ➔ Product Detail View ➔ Add to Cart ➔ Checkout Started ➔ Purchase Completed) with drop-off percentages.
- **Top Visited Jewels & Landing Pages**: Ranking of highest viewed products, categories, and editorial articles.
- **Geolocation Map & Top Cities**: Visual ranking of visitors by country (Italy, Switzerland, etc.) and Italian cities (Roma, Milano, Napoli, Salerno, etc.).

### R4. Dedicated Drill-Down Detail Pages
Create rich, dedicated detail views and modals/sub-routes for deep analysis:
- **Dettaglio Pagine Più Esplorate**: Table with bounce rates, average time spent, direct views vs internal navigations, and product-level engagement.
- **Dettaglio Sorgenti & Campagne**: Granular drill-down into specific campaign UTM tags, keywords, and referral URLs.
- **Dettaglio Geografico**: Granular city-by-city visitor distribution and conversion metrics.

### R5. Google Search Console & SEO Health Integration
Connect Search Console metrics (Google Search impressions, organic search clicks, CTR, and top ranking jewelry queries) directly into the Admin dashboard using Google Hub / Search Console API.

## Acceptance Criteria

### Data Quality & Bot Exclusion
- [ ] Known bots and crawlers (Googlebot, Bingbot, ByteSpider, etc.) are strictly excluded from unique visitor counts and traffic metrics.
- [ ] Admin navigation within `/admin` and internal API calls do not generate customer page views or skew analytics.

### Attribution & Channel Precision
- [ ] Visits from Google search engine domains are accurately labeled as "Google Organic" in the traffic sources breakdown.
- [ ] Campaign traffic with UTM parameters correctly surfaces campaign names, source, and medium in the analytics tables.

### Dashboard UX & Detail Exploration
- [ ] Date range selector dynamically refreshes all charts and KPIs without full page reloads.
- [ ] Conversion funnel clearly shows conversion percentages across all 5 stages of the purchasing journey.
- [ ] Clicking on "Pagine più esplorate" or traffic categories opens a detailed drill-down view with deep metrics.
- [ ] Build passes cleanly with 0 TypeScript/Turbopack errors and is committed to `origin/main`.

