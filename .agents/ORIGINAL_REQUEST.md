# Original User Request

## 2026-08-23T19:48:48Z

Fix and definitively stabilize the product image upload system across the Isabel Pepe Admin panel. Eliminate all `Unexpected token '<', '<!DOCTYPE '... is not valid JSON` errors, handle large files (up to 20MB from iPhone/cameras), implement graceful error handling with automatic client-side WebP compression, server-side Sharp optimization with fallback, safe JSON/text response parsing, and a reliable Server Action / direct fallback pipeline.

Working directory: c:/Users/mario/Progetti Antigravity/isabel-pepe
Integrity mode: development

## Requirements

### R1. Resilient Upload Ingestion & Safe Response Handling
- In `app/admin/ProductForm.tsx`, replace unsafe `res.json()` calls with robust content-type checking and safe error parsing (read `res.text()` if HTML or non-JSON is returned, displaying a human-readable error rather than syntax crash).
- Upgrade `app/api/upload/route.ts` with explicit file size limits (support up to 20MB files), robust `try...catch` blocks, sanitized filenames, and guaranteed JSON error responses (`application/json`) in all scenarios (400, 413, 500) to prevent Next.js from emitting raw HTML error pages.

### R2. High-Performance Client-Side Image Pre-Processing & Compression
- Upgrade `compressImageClient` in `ProductForm.tsx` to handle all formats (JPEG, PNG, WebP, HEIC/HEIF) with canvas downscaling (max width 2000px, 85% WebP quality) so that 10-20MB smartphone uploads are compressed smoothly to ~200-500KB in the browser before hitting the wire, preventing 413 payload limits.
- Provide immediate instant blob previews with loading spinner per slot and retry button on network glitch.

### R3. Server-Side Cloudflare R2 Upload Pipeline & Fallback
- In `lib/r2.ts`, ensure `uploadToR2` cleanly catches Sharp processing exceptions with automatic raw buffer fallback if Sharp fails, guaranteeing that valid image files are always saved to Cloudflare R2 without 500 crashes.
- Support Server Action upload (`uploadProductImageAction` / `uploadPhotoServerAction`) as a seamless second-chance fallback if the REST `/api/upload` endpoint fails.

### R4. Complete 5-Slot Gallery & Admin Editing Stability
- Ensure adding, editing, replacing, and removing photos across all 5 slots (`slot1` Model, `slot2` Studio White/Pink, `slot3`, `slot4`, `slot5`) in `ProductForm.tsx` and `actions.ts` persists perfectly in Supabase `products.gallery`, `image_primary`, and `image_secondary`.
- Verify that editing existing products (like `Set Isabel Rose (A145)`) does not overwrite existing slot URLs when modifying other slots or metadata.

## Acceptance Criteria

### Error Prevention & Upload Reliability
- [ ] Uploading a large image (> 5MB) or raw phone photo in any slot completes successfully with valid WebP URL on Cloudflare R2.
- [ ] If network is abruptly interrupted or server errors, UI displays an informative luxury error banner with a 1-click retry button instead of a JSON parse exception.
- [ ] No `Unexpected token '<'` or unhandled syntax error occurs under any upload scenario.

### Product Form & Gallery Integrity
- [ ] Editing `Set Isabel Rose (A145)` and replacing slot1 photo successfully uploads to R2 and saves to Supabase without errors.
- [ ] Production build (`npm run build`) passes cleanly with 0 TypeScript/Turbopack errors and is pushed to `origin/main`.

## 2026-08-26T16:48:05Z

Build pristine, ultra-luxury master printable and web certificates for Isabel Pepe with 100% seamless cardstock texture, flawless 3D embossed logo crest, crisp typography, and zero patch borders or color discrepancies.

Working directory: c:/Users/mario/Progetti Antigravity/isabel-pepe
Integrity mode: development

## Requirements

### R1. 100% Seamless Cardstock Background & Border Integration
- Eliminate all rectangular patch overlays, seams, color mismatches, and border overlaps.
- The luxury textured ivory/cream paper with natural ambient lighting must extend continuously and uniformly across the entire card from edge to edge.
- The double filigree debossed border frame must remain 100% intact, crisp, and never overlapped or clipped.

### R2. High-Fidelity 3D Embossed Monogram & Sharp "ISABEL PEPE" Typography
- The ornate circular laurel crest with the 3D embossed Rose Gold "IP" monogram must be preserved in razor-sharp resolution.
- The embossed bronze "ISABEL PEPE" brand lettering must be 100% sharp, distinct, and never faded, blurred, or cut off at the base.

### R3. Flawless Dynamic Specifications Table
- The lower half must feature crisp, engraved typography (*Cinzel / Playfair Display* in warm bronze and *Helvetica Neue* in deep charcoal) with zero underlying ghost text.
- Standardized layout across all 4 product families:
  1. *Moissanite & Oro 18K*
  2. *Moissanite & Rodio Puro*
  3. *Perle Naturali d'Acqua Dolce & Oro 18K*
  4. *Argento Sterling 925 & Cristalli*

### R4. Multi-Channel Export (Print 300 DPI + Web Formats)
- Generate high-resolution 300 DPI print-ready PNG files (standard 85x55mm luxury card format at 2400x1560 px).
- Generate optimized WebP and JPG files for seamless e-commerce integration on product pages and guarantee modals.

## Acceptance Criteria

### Visual & Aesthetic Perfection
- [ ] Zero visible rectangular patches, color seams, or tone discrepancies across the entire card surface.
- [ ] "ISABEL PEPE" brand text and "IP" crest are 100% sharp with intact drop shadows and zero fading.
- [ ] Border frame is fully continuous without any overlay clipping.
- [ ] Zero underlying ghost text bleed anywhere on the card.

### Multi-Variant & Build Verification
- [ ] All 4 certificate variants share the exact same aesthetic master layout with tailored product specifications.
- [ ] Next.js production build (`npm run build`) completes with 0 errors.

## 2026-09-08T19:47:32Z

Strategia di social advertising e piano media esecutivo per il brand di alta gioielleria artigianale Isabel Pepe su TikTok: validazione organica dei video pubblicati, massimizzazione dell'awareness qualificata e conversione ad alta redditività verso l'e-commerce www.isabelpepe.com.

Working directory: C:\Users\mario\Progetti Antigravity\isabel-pepe
Integrity mode: development

## Requirements

### R1. Audit Creativo & Framework di Validazione Video Organici
Analizzare i video attualmente pubblicati sul profilo TikTok del brand (@isabel.pepe0) applicando un framework oggettivo di validazione a tre livelli per identificare il "Winner":
- Hook Rate (Stop Rate) a 2-3 secondi (target >= 50-55%)
- Tempo medio di visione / Retention (target >= 50% della durata del video)
- Save Rate / Salvataggi (target >= 1.5% - 2.0% come indicatore di intenzione d'acquisto / gifting)

### R2. Architettura Campagne & Metodo di Sponsorizzazione (Burst Strategy)
Progettare la struttura tecnica di erogazione paid adatta al mercato italiano per gioielleria demi-fine (argento 925, placcatura rodio/oro 18K, moissanite):
- Integrazione di Spark Ads (autorizzazione codice video organico da app senza cessione credenziali) vs TikTok Promote in-app
- Definizione della "Burst Strategy" (concentrazione del budget di 20€/giorno nei picchi di acquisto Giovedì-Domenica per rispettare i minimi di TikTok Ads Manager ottimizzando il ROAS)
- Targeting demografico qualificato: esclusione tassativa 13-17 anni, cluster Donne 22-54 anni (interessi lusso accessibile e gioielleria) e cluster Uomini 25-45 anni (gifting per anniversari e ricorrenze)

### R3. Funnel da Views a Vendite E-Commerce & Tracciamento Pixel
Definire il funnel di vendita a due stadi collegato al sito isabelpepe.com:
- Stadio 1 (Top of Funnel): Raccolta visualizzazioni qualificate e creazione della Custom Audience (visualizzatori 50%+ e interazioni)
- Stadio 2 (Bottom of Funnel): Campagna Web Conversions con retargeting su AddToCart e CompletePayment
- Specifiche di implementazione tecnica del TikTok Pixel e Advanced Matching su Next.js per evitare perdite di tracciamento

## Acceptance Criteria

### Piano Media & Guida Operativa
- [ ] Documento strategico esecutivo con istruzioni passo-passo per generare i codici Spark Ads dall'app TikTok e impostare la campagna su Ads Manager.
- [ ] Tabella di allocazione del budget con calendario di accensione/spegnimento e soglie di kill/scale.
- [ ] Specifiche per l'installazione del TikTok Pixel sul frontend Next.js (eventi standard: ViewContent, AddToCart, InitiateCheckout, CompletePayment).
