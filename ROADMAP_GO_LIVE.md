# Roadmap Messa Online — Isabel Pepe

Questo documento traccia in tempo reale l'avanzamento delle attività per la messa online dell'e-commerce **Isabel Pepe**.

> **Focus Attuale**: FASE 2 — Completamento e perfezionamento del Catalogo Prodotti & Asset Media.

---

## 🎯 Stato di Avanzamento Generale

- [ ] **FASE 1**: Sicurezza Critica, Protezione Admin & Checkout
- [ ] **FASE 2**: Catalogo Prodotti, Asset R2 & Galleria Media *(IN CORSO)*
- [ ] **FASE 3**: Spedizioni, Logistica & Poste Italiane
- [ ] **FASE 4**: Conformità Legale, GDPR, Cookie, SEO & Analytics
- [ ] **FASE 5**: Collaudo End-to-End & Go-Live Ufficiale

---

## 📋 Checklist Dettagliata Attività

### FASE 1: Sicurezza Critica & Checkout
- [ ] **ACT-01**: Re-integrare la protezione di autenticazione dell'area `/admin` in `proxy.ts` e `app/admin/page.tsx`.
- [ ] **ACT-02**: Eliminare la lettura del prezzo dal client in `/api/checkout` e forzare il ricalcolo sicuro lato server dal DB Supabase.
- [ ] **ACT-03**: Configurare la chiave `STRIPE_WEBHOOK_SECRET` reale in `.env.local` e gestire la verifica della firma nel webhook.
- [ ] **ACT-04**: Attivare l'invio delle email reali per conferme ordine e spedizioni tramite Resend API (`lib/email.ts`).
- [ ] **ACT-06**: Implementare la logica di idempotenza sul `stripe_session_id` nel webhook per evitare ordini duplicati.

---

### FASE 2: Catalogo Prodotti & Asset Media *(FASE IN CORSO)*
- [x] **ACT-FIX-STICKY**: Reso sticky e sempre visibile il pannello di modifica prodotto nell'admin durante lo scroll della lista.
- [x] **ACT-05**: Applicato il filtro `is_active = true` nello shop (`app/shop/page.tsx`) così le 45 bozze senza foto rimangono nascoste fino all'attivazione.
- [x] **ACT-08**: Configurato `images.remotePatterns` in `next.config.ts` per autorizzare il dominio CDN Cloudflare R2 (`pub-69fc...r2.dev`).
- [ ] **ACT-15a (Prodotti)**: Verificare e completare i 48 prodotti nell'Admin (foto primaria `image_primary`, foto secondaria `image_secondary`, SKU, titoli SEO e prezzi).
- [ ] **ACT-15b (Galleria 5 Slot)**: Caricare per ciascun prodotto la galleria completa di 5 slot (1: Modella 2:3, 2: Sfondo Rosa 1:1, 3: Panoramica 1:1, 4: Video Pack .mp4, 5: Video Gioiello .mp4).
- [ ] **ACT-15c (Descrizioni Editorial)**: Inserire le descrizioni commerciali eleganti su tutti i prodotti sostituendo il testo provvisorio da fattura.
- [ ] **ACT-07**: Aggiornare lo schema Supabase aggiungendo le colonne `weight` e `dimensions` per la futura gestione spedizioni.

---

### FASE 3: Spedizioni & Logistica
- [ ] **ACT-14**: Configurare `shipping_options` in Stripe Checkout (es. Spedizione Express Poste Italiane €6.90 e Soglia Spedizione Gratuita sopra 100€).
- [ ] **ACT-LOGISTIC-1**: Definire e integrare il flusso di generazione etichette e invio del codice di tracciamento per Poste Italiane.

---

### FASE 4: Conformità Legale, GDPR, SEO & Analytics
- [ ] **ACT-09**: Aggiornare il Footer con i dati societari legali obbligatori (Ragione Sociale, P.IVA, REA, Sede Legale, Cap. Soc., PEC).
- [ ] **ACT-10**: Creare le pagine di policy legale (`/privacy`, `/cookie-policy`, `/condizioni-vendita`, `/spedizioni-resi`).
- [ ] **ACT-11**: Implementare il Banner Consenso Cookie GDPR e bloccare il tracciamento preventivo in `Tracker.tsx`.
- [ ] **ACT-12**: Generare `app/sitemap.ts` e `app/robots.ts` dinamici per Next.js.
- [ ] **ACT-13**: Sostituire i metadata "Create Next App" in `layout.tsx` con i meta tag reali SEO e OpenGraph per la condivisione social.
- [ ] **ACT-17**: Integrare il tracciamento di conversione (Meta Pixel, Google Tag Manager / GA4).

---

### FASE 5: Collaudo End-to-End & Go-Live
- [ ] **ACT-TEST-E2E**: Eseguire un test di acquisto completo in Stripe Test Mode con verifica carrello, checkout, email e magazzino.
- [ ] **ACT-GO-LIVE**: Inserire le chiavi API Stripe in modalità Live e procedere con il lancio pubblico ufficiale.
