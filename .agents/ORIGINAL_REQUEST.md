# Original User Request

## Initial Request — 2026-08-15T07:02:58Z

Ottimizzazione SEO globale, posizionamento Demi-Fine Jewelry (Lusso Accessibile) e arricchimento contenutistico di tutte le pagine istituzionali e delle schede prodotto del catalogo Isabel Pepe.

Working directory: c:\Users\mario\Progetti Antigravity\isabel-pepe
Integrity mode: development

## Requirements

### R1. Posizionamento Strategico Demi-Fine Jewelry (Zero Moissanite, Zero Made in Italy)
- Eliminare la parola chiave "moissanite" e qualsiasi claim "Made in Italy / Alta Gioielleria Italiana" da tutti i Meta Title, Meta Description, tag H1/H2 e headline principali del sito.
- Posizionare il brand come **Demi-Fine Jewelry & Lusso Accessibile**: creazioni in Argento 925 Sterling con finiture in Oro 18K / Rodio Puro e pietre ad altissima rifrazione (Taglio Brillante).
- Valorizzare i 4 pilastri differenzianti:
  1. **Doppio Scudo Protettivo**: Placcatura Oro 18K (1.0 µm) / Rodio Puro (0.1 µm) + Sigillo Nano-Protective E-Coating (1.0 µm) anti-ossidazione e waterproof.
  2. **Cofanetto Regalo Signature**: Astuccio rigido luxury, panno in microfibra e certificato di garanzia ufficiale inclusi.
  3. **Pietre di Pura Luce (Taglio Brillante)**: Taglio VVS1 D-Color certificato per una brillantezza eterna.
  4. **L'Arte del Dono**: Quota destinata al benessere degli animali.

### R2. Ottimizzazione SEO Pagine Istituzionali e Categorie
- Aggiornare i metadati (`<title>`, `<meta description>`, OpenGraph, `<h1>`) delle pagine:
  - Home Page (`/`)
  - Catalogo Completo (`/shop`)
  - Categorie di Prodotto (Collane, Orecchini, Anelli, Bracciali, Set Royale)
  - Pagine di Servizio (`/chi-siamo`, `/impegno-animali`, `/assistenza-clienti`, `/cura-gioielli`, `/guida-taglie`, `/spedizioni-resi`, `/privacy`, `/cookie-policy`, `/termini-condizioni`).

### R3. Content Enrichment e SEO Schede Prodotto (43+ Prodotti)
- Aggiornare i record nel database Supabase (`products`) con:
  - `seo_title`: formula luxury `[Nome Prodotto] — [Tipo Gioiello] in Oro 18K & Argento 925 | Isabel Pepe` (max 60 caratteri).
  - `seo_description`: testo persuasivo orientato a regalo/durabilità con menzione cofanetto e placcatura (140-155 caratteri).
  - `description`: storytelling persuasivo + bullet points tecnici accurati (specifiche placcatura Oro 18K 1.0µm o Rodio 0.1µm, E-coating 1.0µm, caratura reale, perle d'acqua dolce 4-11mm, cofanetto incluso).

## Acceptance Criteria

### Posizionamento & Copywriting
- [ ] Nessun riferimento alla parola "moissanite" compare nei Title tag, Meta Description e intestazioni H1 del sito pubblico.
- [ ] Nessuna dicitura "Made in Italy" o "Manifattura Italiana" è presente nei testi.
- [ ] Il claim della placcatura specifica chiaramente Oro 18K 1.0µm per i modelli Gold, Rodio 0.1µm per i modelli Silver, e Nano-Coating protettivo 1.0µm (E-coating) su tutti i gioielli.
- [ ] Il cofanetto regalo di lusso e il certificato sono evidenziati come valore aggiunto in tutte le schede e pagine regalo.

### Tecnico & Build
- [ ] Tutti i 43+ prodotti nel database Supabase contengono `seo_title`, `seo_description` e `description` aggiornati e coerenti.
- [ ] `npm run build` compila con successo (0 errori TypeScript / Next.js).
- [ ] Tutte le pagine sono verificabili e navigabili in locale su `http://localhost:3000`.

## Request — 2026-08-16T09:13:37Z

Investigate and completely bulletproof the Cloudflare R2 media connection, image browsing modal, direct uploads, and product persistence in Isabel Pepe Next.js e-commerce administration.

Working directory: c:/Users/mario/Progetti Antigravity/isabel-pepe

## Requirements

### R1. Cloudflare R2 Connection Resilience
Ensure S3Client connection to Cloudflare R2 works unconditionally in all runtime environments (Local dev, Vercel Serverless, Edge) without dependency on external runtime environment variables by having verified internal fallback credentials.

### R2. Media Library Modal Browsing
The "Sfoglia" (Media Library) modal must reliably list all media items from the isabel-pepe bucket, allow direct search/filtering by jewelry name or SKU, and provide immediate visual status and direct selection into product gallery slots.

### R3. Fast Per-Slot Image Upload & Persistence
Direct file upload from local machine via "+ Foto" and selection via "Sfoglia" must immediately populate gallery slot URLs and save to Supabase upon clicking "Salva Modifiche", with multi-path cache revalidation (/admin, /shop, /, /prodotto/[slug]).

## Acceptance Criteria

### Verification
- [ ] Direct HTTP GET /api/media returns HTTP 200 with all 138+ R2 image objects.
- [ ] Direct HTTP POST /api/upload returns HTTP 200 with public WebP URL.
- [ ] Browser modal opens with full thumbnail grid, search filter, and upload button.

## Request — 2026-08-17T17:26:40Z

Sviluppare ed eseguire una pipeline chirurgica per la sostituzione degli abiti delle modelle dell'e-commerce Isabel Pepe (partendo dall'Anello Imperial e replicabile sul resto del catalogo), garantendo la purezza assoluta del gioiello (0% alterazione o perdita di definizione allo zoom) e l'integrazione anatomica fotorealistica.

Working directory: c:\Users\mario\Progetti Antigravity\isabel-pepe
Integrity mode: development

## Requirements

### R1. Isolamento e Protezione Assoluta del Gioiello (Pixel Preservation)
La pipeline deve estrarre e bloccare i pixel originali ad altissima definizione del gioiello (pietre Moissanite, castoni, griffe e riflessi del metallo) e delle dita a contatto. È severamente vietata la rigenerazione globale o la reinterpretazione AI delle pietre per prevenire qualsiasi sgranatura o deformazione in fase di zoom.

### R2. Sostituzione Sartoriale dell'Abbigliamento (Inpainting & Blending)
Sostituire esclusivamente il tessuto dell'abito (es. abito bianco/crema con colletto con un elegante abito/top sottoveste in pura seta nera a spalline sottili) garantendo ombre di contatto fotorealistiche sulla clavicola e sul collo, senza soluzione di continuità.

### R3. Pipeline Replicabile e Standardizzata per il Catalogo
Creare uno script/procedura automatizzata e documentata per elaborare le altre foto del catalogo Isabel Pepe mantenendo l'archivio master originale e generando asset ottimizzati in formato WebP ad alta risoluzione (1024x1536).

## Acceptance Criteria

### Qualità Ottica & Dettaglio Prodotto
- [ ] Il gioiello (Anello Imperial) mantiene le faccette e la brillantezza dell'asset originale anche a ingrandimento macro (zoom 200%).
- [ ] Nessun alone, bordo frastagliato o artefatto di ritaglio tra la pelle della modella e il nuovo abito.
- [ ] La foto finale è in formato WebP verticale (1024x1536) pronta per il caricamento nella galleria prodotto.
- [ ] L'originale è preservato nell'archivio storico (public/Archive/).
