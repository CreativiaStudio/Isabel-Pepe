# Report Audit di Messa Online — E-Commerce Isabel Pepe

**Progetto**: Platform E-Commerce Isabel Pepe (`isabel-pepe-v2`)  
**Data Audit**: 29 Luglio 2026  
**Stato**: Completed — Critical Blockers & Vulnerabilities Identified  
**Autore**: Team di Audit Tecnico (Explorer 1, Explorer 2, Explorer 3, Worker 1)  

---

## Executive Summary & Audit Overview

Il presente documento costituisce il **Report Generale di Audit per la Messa Online** dell'e-commerce di gioielli **Isabel Pepe**. L'analisi tecnica ha valutato integralmente l'architettura dell'applicazione (Next.js App Router, Supabase Database, Cloudflare R2, Stripe Hosted Checkout, Tailwind CSS) ed è stata suddivisa nei 6 moduli di controllo previsti (R1-R6), culminating nella Roadmap Prioritizzata per il Go-Live (R7).

### Sintesi Diagnostica Complessiva:
L'infrastruttura dell'e-commerce presenta un design visivo raffinato ed elegante e una base tecnologica moderna. Tuttavia, **il sistema NON è in alcun modo pronto per il lancio commerciale** causa la presenza di **vulnerabilità di sicurezza critiche**, configurazioni errate nei sistemi di pagamento, schema di database incompleto, totale assenza di pagine legali e banner cookie GDPR, oltre all'assenza di tracciamento analytics e integrazione logistica.

| Modulo Audit | Area Tematica | Valutazione Stato | Livello di Rischio |
|---|---|---|---|
| **R1** | Catalogo Prodotti & Media | 48 prodotti in DB (3 attivi, 45 bozze); bug esposizione bozze su shop; media non ottimizzati; schema DB privo di peso/dimensioni. | **ALTO / CRITICO** |
| **R2** | Pagamenti & Checkout | Vulnerabilità critica manipolazione prezzo da client (`/api/checkout`); Secret Webhook non configurato; assenza di idempotenza. | **CRITICO (P0)** |
| **R3** | Logistica & Spedizioni | Invio email spedizione simulato (`console.log`); 0% API corrieri (Poste/DHL); regola spedizione fissa a €0.00 nel checkout. | **BLOCKER (P0)** |
| **R4** | Sicurezza & Protezione Dati | Area `/admin` priva di autenticazione (controlli commentati); segreti esposti in `.env.local`; assenza di rate limiting e validazione Zod. | **CRITICO (P0)** |
| **R5** | Conformità GDPR & Legale | Dati societari mancanti nel Footer (P.IVA, REA, PEC); assenza totale di pagine policy (Privacy, Cookie, Condizioni); assenza banner Cookie. | **ALTO (P1)** |
| **R6** | SEO, Analytics & Performance | Metadata di default ("Create Next App"); `sitemap.xml` e `robots.txt` assenti; 0% Pixel/GTM/GA4/CAPI; tag `<img>` grezzi sulla Home. | **MEDIO-ALTO (P1/P2)** |

---

## R1. Audit Completo Catalogo Prodotti e Media

### 1.1 Volume Catalogo & Bug Visibilità Prodotti Bozza (Drafts)
* **Analisi Database**: Il database Supabase contiene un totale di **48 prodotti**.
  * **Prodotti Attivi (`is_active = true`)**: **3 prodotti** (`ASB4054-PINK` - Bracciale Eden Rose, `A180-SET` - Set Vivienne, `BTN005-GOLD` - Collana Brera Gold).
  * **Prodotti Inattivi / Bozza (`is_active = false`)**: **45 prodotti**.
* **Bug Critico Frontend (`app/shop/page.tsx` Linea 15)**:
  Nel componente dello shop, la query Supabase esegue:
  ```typescript
  const { data: products } = await supabase.from('products').select('*');
  ```
  La query **non applica il filtro `.eq('is_active', true)`**. Di conseguenza, tutti i 45 prodotti in bozza (compresi quelli privi di immagini, con descrizioni provvisorie e senza Stripe ID validi) vengono pubblicamente mostrati nella griglia dello shop agli utenti finali.

### 1.2 Mappatura Deficit Campi su Tutti i 48 Prodotti
L'ispezione dello schema di database (`supabase_schema.sql`) e dei record presenti in Supabase evidenzia significative incompletezze informative:

| Nome Campo | Colonna Presente in DB | Prodotti Mancanti | % Mancante | Note Audit & Impatto |
|---|---|---|---|---|
| **Peso (`weight`)** | ❌ **No** | 48 | 100.0% | Colonna totalmente assente dallo schema SQL e dai tipi TypeScript |
| **Dimensioni (`dimensions`)** | ❌ **No** | 48 | 100.0% | Colonna totalmente assente dallo schema SQL e dai tipi TypeScript |
| **Taglie Anelli (`sizes`)** | ✅ Sì | 48 | 100.0% | Array JSON vuoto `[]` su tutti i prodotti (inclusi i 6 anelli a catalogo) |
| **Descrizione (`description`)** | ✅ Sì | 46 | 95.8% | **46/48** mostrano il testo provvisorio: `"Descrizione provvisoria da fattura."` |
| **Prezzo Scontato (`discount_price`)**| ✅ Sì | 45 | 93.8% | Solo 3 prodotti promozionali hanno un prezzo scontato impostato |
| **Galleria Immagini (`gallery`)** | ✅ Sì | 37 | 77.1% | **37 prodotti** hanno l'array galleria vuoto `[]` (0 su 5 slot popolati) |
| **Immagine Secondaria (`image_secondary`)** | ✅ Sì | 34 | 70.8% | **34 prodotti** hanno `NULL`, disabilitando l'effetto hover nella griglia |
| **Immagine Primaria (`image_primary`)** | ✅ Sì | 26 | 54.2% | **26 prodotti** hanno `NULL`, generando riquadri bianchi/rotti nello shop |
| **Carati (`carats`)** | ✅ Sì | 13 | 27.1% | Mancante su collane/bracciali in perle e set in metallo semplice |
| **Meta Title / Desc SEO** | ✅ Sì | 6 | 12.5% | 6 prodotti privi di titoli e descrizioni SEO personalizzate |
| **Stripe Product / Price ID** | ✅ Sì | 1 | 2.1% | Mancante per lo SKU `PL-15-BRACELET` |
| **Placcatura (`plating`)** | ✅ Sì | 1 | 2.1% | Mancante per lo SKU `ASB3093` |
| **SKU, Titolo, Slug, Prezzo, Stock** | ✅ Sì | 0 | 0.0% | Popolati al 100% su tutti i 48 prodotti |

### 1.3 Analisi Media, Cloudflare R2 e Next.js Image Optimization
* **Infrastruttura Cloudflare R2 (`lib/r2.ts`)**:
  * La libreria di upload utilizza `@aws-sdk/client-s3` con parametro `forcePathStyle: true`.
  * La compressione immagini viene eseguita server-side tramite `sharp`, ridimensionando a larghezza massima 1500px e convertendo in formato WebP (qualità 80, effort 4).
* **Defetto di Configurazione Next.js (`next.config.ts`)**:
  * Il file `next.config.ts` **non dichiara l'oggetto `images.remotePatterns`** per il dominio CDN di Cloudflare R2 (`pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev`).
  * L'utilizzo del componente `<Image />` di Next.js causa l'eccezione di runtime: `Error: Invalid src prop on next/image, hostname... is not configured`.
* **Analisi Componenti UI & Tag HTML Standard `<img>`**:
  * Per aggirare l'errore di configurazione, i componenti `ProductCard.tsx`, `ProductGallery.tsx` e `app/page.tsx` utilizzano tag HTML standard `<img>`.
  * **Conseguenze**: Rinuncia totale ai benefici dell'ottimizzazione automatica di Next.js (formattazione AVIF/WebP dinamica, srcset reattivi per mobile, lazy-loading nativo, prevenzione del Cumulative Layout Shift - CLS).
  * Inoltre, `ProductCard.tsx` (Linea 65) non possiede alcuna logica di fallback per i 26 prodotti con `image_primary = NULL`, mostrando immagini spezzate.

---

## R2. Audit Pagamenti e Checkout

### 2.1 Vulnerabilità Critica: Manipolazione Prezzo Unitario Lato Client (P0)
* **File Coinvolto**: `app/api/checkout/route.ts` (Linee 12-30)
* **Descrizione del Defetto**:
  Il gestore della rotta di checkout legge l'array degli articoli direttamente dal corpo della richiesta JSON inviata dal client:
  ```typescript
  const body = await request.json();
  const items = Array.isArray(body) ? body : body.items;
  
  const lineItems = items.map((item: { id: string; name: string; price: number; quantity: number }) => ({
    price_data: {
      currency: 'eur',
      product_data: { name: item.name },
      unit_amount: Math.round(item.price * 100), // <-- PREZZO FIDATO DAL CLIENT!
    },
    quantity: item.quantity,
  }));
  ```
* **Impatto di Sicurezza**: Un utente malintenzionato può intercettare la chiamata POST verso `/api/checkout` (es. tramite Postman o Developer Tools) e modificare il valore `price` di un gioiello da €185.00 a €0.01. Stripe genererà una sessione di pagamento per 1 centesimo di euro, incasserà 1 centesimo e il webhook confermerà l'ordine come completato e pagato.

### 2.2 Errore di Configurazione Critico: Secret Webhook Stripe Mancante (P0)
* **File Coinvolto**: `.env.local` (Linea 9), `app/api/webhook/route.ts` (Linea 23)
* **Descrizione**: Il file `.env.local` contiene il valore segnaposto: `STRIPE_WEBHOOK_SECRET=inserisci_qui_il_webhook_secret_di_stripe`.
* **Impatto**: In ambiente di staging o produzione, la verifica della firma (`stripe.webhooks.constructEvent`) fallirà sistematicamente lanciando un errore HTTP 400/500. Gli ordini pagati su Stripe non verranno salvati nel database Supabase, le giacenze di magazzino non verranno decrementate e le notifiche clienti non partiranno.

### 2.3 Rischio Elevato: Mancanza di Idempotenza nel Webhook Stripe (P1)
* **File Coinvolto**: `app/api/webhook/route.ts` (Linee 30-60)
* **Descrizione**: Il gestore dell'evento `checkout.session.completed` inserisce il record dell'ordine ed effettua l'aggiornamento dello stock senza verificare se il `stripe_session_id` sia già stato processato in precedenza.
* **Impatto**: In caso di tentativi di re-invio da parte dei server Stripe (retry di rete) o messaggi duplicati, il sistema:
  1. Inserirà un ordine duplicato nella tabella `orders`.
  2. Raddoppierà erroneamente il valore `total_spent` del cliente nel CRM.
  3. Decrementerà una seconda volta lo stock del prodotto.

### 2.4 Mismatch Schema Database: Tabella `orders` (P1)
* **File Coinvolti**: `supabase_schema.sql` (Linee 20-31), `app/admin/actions_orders.ts` (Linee 31, 34)
* **Descrizione**: La definizione formale della tabella `orders` in `supabase_schema.sql` include solo i campi: `id`, `stripe_session_id`, `customer_email`, `customer_name`, `amount_total`, `status`, `shipping_address`, `items`, `created_at`.
* **Impatto**: La Server Action `actions_orders.ts` tenta di eseguire l'UPDATE sulle colonne `tracking_code` e `shipped_at`. Se il database viene ripristinato dallo script SQL di base, la gestione delle spedizioni lato admin andrà in crash per colonna inesistente.

---

## R3. Audit Logistica e Spedizioni

### 3.1 Blocco Email Notifica Cliente: Simulazione tramite `console.log` (P0)
* **File Coinvolto**: `lib/email.ts` (Linee 5-35), `app/admin/actions_orders.ts` (Linee 55-62)
* **Analisi**: La funzione `sendShippingConfirmationEmail` non invia alcuna email reale:
  ```typescript
  export async function sendShippingConfirmationEmail(customerEmail: string, customerName: string, trackingCode: string, orderId: string) {
    console.log(`\n\n=== SIMULAZIONE INVIO EMAIL ===`);
    console.log(`A: ${customerEmail} (${customerName})`);
    ...
  }
  ```
  Il codice del client SDK Resend è commentato e la variabile `RESEND_API_KEY` non è presente nel file `.env.local`. Quando l'amministratore inserisce il codice di tracciamento nell'interfaccia admin, l'acquirente **non riceve alcuna comunicazione**.

### 3.2 Blocco Regole di Spedizione e Soglie nel Checkout (P1)
* **File Coinvolti**: `app/api/checkout/route.ts`, `components/CartDrawer.tsx` (Linea 290)
* **Analisi**: Il carrello indica la dicitura *"Spedizione e tasse calcolate al checkout"*. Tuttavia, nel file `/api/checkout/route.ts`, la chiamata a `stripe.checkout.sessions.create()` **non definisce il parametro `shipping_options`**.
* **Impatto**: Il costo di spedizione risulta sempre pari a €0.00. Non è implementata alcuna logica di calcolo dei costi di spedizione standard né di soglia per spedizione gratuita (es. "Spedizione gratuita sopra i 100€").

### 3.3 Blocco API Corrieri e Generazione Etichette (P1)
* **File Coinvolto**: `app/admin/ShippingTable.tsx`
* **Analisi**: L'integrazione con API di corrieri (Poste Italiane / Crono / DHL / BRT) è **realizzata allo 0%**.
  * Non esistono chiamate SDK, HTTP o webhook verso sistemi logistici.
  * La gestione della spedizione è al 100% manuale: l'amministratore copia l'indirizzo di spedizione negli appunti del PC e digita manualmente il codice di tracciamento in una casella di testo.
  * Non è presente alcun sistema di generazione etichette in formato PDF o ZPL.

---

## R4. Audit Sicurezza e Protezione Dati

### 4.1 Vulnerabilità Critica: Accesso Non Autenticato all'Area Admin (P0)
* **File Coinvolti**: `proxy.ts` (Linee 35-42), `app/admin/page.tsx` (Linee 12-17)
* **Analisi**: Sia nel middleware (`proxy.ts`) che nel componente server di pagina (`app/admin/page.tsx`), i controlli di autenticazione e di verifica delle email autorizzate (`ADMIN_EMAILS`) **sono stati totalmente commentati**:
  ```typescript
  // PROTEZIONE ADMIN: temporaneamente disabilitata per dev/demo locale
  // const ADMIN_EMAILS = ['sviluppo@creativiastudio.com']
  // if (request.nextUrl.pathname.startsWith('/admin')) { ... }
  ```
* **Impatto**: Qualsiasi utente che navighi sull'URL `/admin` ottiene l'accesso completo al pannello di amministrazione, visualizzando ordini, dati personali dei clienti, carrelli abbandonati ed eseguendo Server Actions per eliminare o creare prodotti.

### 4.2 Gestione Variabili d'Ambiente e Credenziali Esposte (P1)
* **File Coinvolto**: `.env.local`
* **Analisi**:
  * Il file `.env.example` **non esiste** nella root del progetto.
  * `.env.local` contiene credenziali di produzione attive: Supabase Service Role Key, Cloudflare R2 Secret Access Key, Stripe Secret Key, Anthropic API Key, ElevenLabs API Key e la stringa di connessione diretta al DB con password in chiaro (`SUPABASE_DB_URL`).

### 4.3 Lacune Validazione Input, CORS/CSRF e Rate Limiting (P2)
* **Analisi**: Nessuna rotta API (`/api/checkout`, `/api/coupons/validate`, `/api/track`, `/api/jarvis`) o Server Action utilizza librerie di validazione dello schema degli input (es. Zod).
* **Rate Limiting**: Totalmente assente. Le API sono vulnerabili a attacchi di brute-force (es. enumerazione codici sconto su `/api/coupons/validate`) e attacchi Denial of Service (DoS) sugli endpoint AI.

---

## R5. Audit Conformità GDPR, Legale e Trasparenza

### 5.1 Dati Societari Obbligatori Mancanti nel Footer (P1)
* **File Coinvolto**: `components/Footer.tsx` (Linee 33-41)
* **Analisi**: Il footer del sito mostra unicamente la dicitura: `© 2026 ISABEL PEPE. TUTTI I DIRITTI RISERVATI.`
* **Elememti Obbligatori Mancanti (Art. 2250 Codice Civile / Normativa E-Commerce)**:
  1. Ragione Sociale completa
  2. Partita IVA (P.IVA) e Codice Fiscale
  3. Numero REA e Camera di Commercio di iscrizione
  4. Capitale Sociale versato
  5. Indirizzo della Sede Legale
  6. Indirizzo PEC (Posta Elettronica Certificata)

### 5.2 Assenza Pagine di Policy Legale Obbligatorie (P1)
* **Struttura Directory (`app/`)**:
  * Pagina Privacy Policy (`/privacy`): **MANCANTE**
  * Pagina Termini e Condizioni di Vendita (`/condizioni-vendita`): **MANCANTE**
  * Pagina Cookie Policy (`/cookie-policy`): **MANCANTE**
  * Pagina Spedizioni e Resi (`/spedizioni-resi`): **MANCANTE** (I link nel footer puntano ad ancore vuote `#`).

### 5.3 Banner Consenso Cookie e Tracciamento Lato Server (P1)
* **File Coinvolti**: `app/layout.tsx`, `components/Tracker.tsx`
* **Analisi**: Nessun banner di gestione del consenso ai cookie (es. Iubenda, Cookiebot o banner personalizzato conformi GDPR) è integrato nel layout.
* Il tracciatore custom (`Tracker.tsx`) viene eseguito immediatamente al montaggio del componente e invia richieste a `/api/track` (popolando la tabella `page_views`) **senza verificare l'ottenimento del previo consenso dell'utente**.

### 5.4 Trasparenza Diritto di Recesso di 14 Giorni
* **Analisi**: La scheda prodotto riporta il badge "Reso 30 Giorni", ma non esiste alcun testo contrattuale vincolante che disciplini l'esercizio del diritto di recesso entro 14 giorni ai sensi del Codice del Consumo (D.Lgs. 206/2005), le modalità di invio e l'indirizzo di resa dei prodotti.

---

## R6. Audit SEO, Analytics e Performance

### 6.1 Analisi Metadata Globali e OpenGraph (P2)
* **File Coinvolto**: `app/layout.tsx` (Linee 15-18)
* **Analisi**: I metadata globali del sito sono rimasti ai valori di default di Next.js:
  ```typescript
  export const metadata: Metadata = {
    title: "Create Next App",
    description: "Generated by create next app",
  };
  ```
  Mancano i tag OpenGraph (`og:image`, `og:title`, `og:description`) e i tag Twitter Card nel layout principale.

### 6.2 Assenza Sitemap.xml e Robots.txt (P1)
* **Analisi**: I file `sitemap.xml` (o `app/sitemap.ts`) e `robots.txt` (o `app/robots.ts`) **sono completamente assenti**. I motori di ricerca non dispongono delle istruzioni di indicizzazione e della mappa degli URL dei prodotti.

### 6.3 Copertura Tracking & Analytics (P1)
* **Analisi**: L'integrazione di strumenti di web analytics e pixel pubblicitari è pari allo **0%**:
  * Meta Pixel (Facebook Pixel): **NON INSTALLATO**
  * Google Tag Manager (GTM): **NON INSTALLATO**
  * Google Analytics 4 (GA4): **NON INSTALLATO**
  * Conversions API (CAPI): **NON INSTALLATO**

### 6.4 Impatto Performance e Core Web Vitals (P2)
* **File Coinvolti**: `app/page.tsx` (Linee 19, 57, 70, 80, 124)
* **Analisi**: La Home Page carica immagini ad alta risoluzione (`/Products/Modella Premium.jpg`, `/Products/Collana Lusso Old Money.jpg`) direttamente tramite tag `<img>`. Questo comporta penalizzazioni sul Largest Contentful Paint (LCP) e sul punteggio di prestazione Core Web Vitals da dispositivo mobile.

---

## R7. Report di Messa Online e Roadmap Prioritizzata

### 7.1 Matrice Integrata delle Azioni di Bonifica

| ID Azione | Modulo | Descrizione Intervento | Priorità | File Target Principali |
|---|---|---|---|---|
| **ACT-01** | R4 | Re-integrare protezione autenticazione area `/admin` in middleware e server page | **CRITICA (P0)** | `proxy.ts`, `app/admin/page.tsx` |
| **ACT-02** | R2 | Eliminare fiducia del prezzo client in `/api/checkout`; recuperare prezzi da DB | **CRITICA (P0)** | `app/api/checkout/route.ts` |
| **ACT-03** | R2 | Configurare segreto Webhook Stripe valido in `.env.local` | **CRITICA (P0)** | `.env.local`, `app/api/webhook/route.ts` |
| **ACT-04** | R3 | Sostituire mock `console.log` email con SDK Resend e chiave API reale | **CRITICA (P0)** | `lib/email.ts`, `.env.local` |
| **ACT-05** | R1 | Aggiungere filtro `is_active: true` nelle query shop per nascondere prodotti bozza | **ALTA (P1)** | `app/shop/page.tsx`, `app/page.tsx` |
| **ACT-06** | R2 | Implementare idempotenza su `stripe_session_id` nel webhook per evitare duplicati | **ALTA (P1)** | `app/api/webhook/route.ts` |
| **ACT-07** | R1/R2 | Aggiornare schema DB Supabase con colonne `weight`, `dimensions`, `tracking_code`, `shipped_at` | **ALTA (P1)** | `supabase_schema.sql`, Supabase DB |
| **ACT-08** | R1 | Configurare `images.remotePatterns` in `next.config.ts` per CDN Cloudflare R2 | **ALTA (P1)** | `next.config.ts` |
| **ACT-09** | R5 | Aggiornare Footer con dati legali societari completi (P.IVA, REA, PEC, Cap. Soc., Sede) | **ALTA (P1)** | `components/Footer.tsx` |
| **ACT-10** | R5 | Creare pagine di policy legale (`/privacy`, `/cookie-policy`, `/condizioni-vendita`) | **ALTA (P1)** | `app/privacy/page.tsx`, etc. |
| **ACT-11** | R5 | Implementare Banner Consenso Cookie GDPR e bloccare tracciamento preventivo | **ALTA (P1)** | `components/CookieBanner.tsx`, `Tracker.tsx` |
| **ACT-12** | R6 | Generare `sitemap.ts` e `robots.ts` dinamici per Next.js | **ALTA (P1)** | `app/sitemap.ts`, `app/robots.ts` |
| **ACT-13** | R6 | Sostituire metadata boilerplate in `layout.tsx` con SEO title/desc/OpenGraph reali | **ALTA (P1)** | `app/layout.tsx` |
| **ACT-14** | R3 | Configurare `shipping_options` in Stripe Checkout e soglia spedizione gratuita | **MEDIA (P2)** | `app/api/checkout/route.ts` |
| **ACT-15** | R1 | Completare descrizioni e galleria immagini (5 foto R2) sui 45 prodotti in bozza | **MEDIA (P2)** | Database Supabase / Admin |
| **ACT-16** | R6 | Convertire tag HTML `<img>` in componenti `<Image />` di Next.js su Home e Shop | **MEDIA (P2)** | `app/page.tsx`, `components/ProductCard.tsx` |
| **ACT-17** | R6 | Integrare Script GTM / Meta Pixel / GA4 tramite Next.js Script o consenso cookie | **MEDIA (P2)** | `app/layout.tsx` |
| **ACT-18** | R4 | Creare `.env.example` e implementare Rate Limiting sugli endpoint API | **BASSA (P3)** | `.env.example`, `proxy.ts` |

---

### 7.2 Roadmap di Messa Online Sequenziale Fase-per-Fase

```
┌─────────────────────────────────────────────────────────────────────────┐
│ FASE 1: SICUREZZA CRITICA & BLOCCHI DI PAGAMENTO                        │
│ ‣ Ripristino Auth /admin in proxy.ts e admin/page.tsx                   │
│ ‣ Bonifica Checkout: Calcolo prezzi lato Server da DB Supabase           │
│ ‣ Impostazione STRIPE_WEBHOOK_SECRET effettivo in .env.local             │
│ ‣ Attivazione invio email reali tramite Resend API                       │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ FASE 2: SCHEMI DB, CATOLOGO PRODOTTI & CHECKOUT LOGIC                   │
│ ‣ Migration DB: Aggiunta colonne weight, dimensions, tracking_code       │
│ ‣ Risoluzione bug esposizione bozze: Filtro is_active = true su Shop    │
│ ‣ Aggiunta images.remotePatterns per Cloudflare R2 in next.config.ts     │
│ ‣ Implementazione Idempotenza Webhook Stripe                            │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ FASE 3: SPEDIZIONI, MEDIA & DRIVER LOGISTICI                            │
│ ‣ Configurazione regole e costi di spedizione in Stripe Checkout        │
│ ‣ Popolamento descrizioni editoriali e gallerie 5-slot su Supabase      │
│ ‣ Sostituzione tag <img> con Next.js <Image /> e logica di fallback     │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ FASE 4: CONFORMITÀ LEGALE, GDPR, SEO & ANALYTICS                        │
│ ‣ Aggiornamento Footer con dati societari obbligatori                    │
│ ‣ Creazione pagine /privacy, /cookie-policy, /condizioni-vendita         │
│ ‣ Integrazione Banner Consenso Cookie e blocco tracciatori preventivi    │
│ ‣ Implementazione sitemap.ts, robots.ts e Metadata OpenGraph globali    │
│ ‣ Integrazione Tag Manager / Meta Pixel / GA4                            │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ FASE 5: COLLAUDO END-TO-END & GO-LIVE                                   │
│ ‣ Esecuzione test E2E acquisto completo in Stripe Test Mode             │
│ ‣ Verifica ricezione email di conferma ordine e tracciamento spedizione  │
│ ‣ Audit finale di sicurezza, permessi RLS e verifica chiavi prod        │
│ ‣ Switch in Stripe Live Mode e Pubblicazione Ufficiale                  │
└─────────────────────────────────────────────────────────────────────────┘
```

---
*Report compilato e validato dal Team di Audit Tecnico.*
