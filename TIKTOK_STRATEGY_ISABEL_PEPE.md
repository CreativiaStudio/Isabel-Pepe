# STRATEGIA DI SOCIAL ADVERTISING & PIANO MEDIA ESECUTIVO TIKTOK
## Brand: Isabel Pepe — Alta Gioielleria Demi-Fine & Luxury Gifting
### Canale Ufficiale TikTok: `@isabel.pepe88` | E-Commerce: `www.isabelpepe.com`
**Data di Rilascio:** Settembre 2026 | **Versione:** 1.0 Production-Grade Master Blueprint  
**Autori:** Mario Pepe, Elena Dumea, Performance Media & Engineering Team  

---

```
   ██╗███████╗ █████╗ ██████╗ ███████╗██╗         ██████╗ ███████╗██████╗ ███████╗
   ██║██╔════╝██╔══██╗██╔══██╗██╔════╝██║         ██╔══██╗██╔════╝██╔══██╗██╔════╝
   ██║███████╗███████║██████╔╝█████╗  ██║         ██████╔╝█████╗  ██████╔╝█████╗  
   ██║╚════██║██╔══██║██╔══██╗██╔══╝  ██║         ██╔═══╝ ██╔══╝  ██╔═══╝ ██╔══╝  
   ██║███████║██║  ██║██████╔╝███████╗███████╗    ██║     ███████╗██║     ███████╗
   ╚═╝╚══════╝╚═╝  ╚═╝╚═════╝ ╚══════╝╚══════╝    ╚═╝     ╚══════╝╚═╝     ╚══════╝
```

---

## INDICE GENERALE DEL DOCUMENTO

1. [PARTE I: EXECUTIVE SUMMARY & BRAND POSITIONING](#parte-i-executive-summary--brand-positioning)
   - 1.1 Profilo del Brand & Canali Ufficiali
   - 1.2 DNA Tecnico & Materiali Demi-Fine
   - 1.3 Economia Unitaria & Fasce di Prezzo
   - 1.4 La Filosofia Strategica: Validazione Organica Prima di Scalare
2. [PARTE II: R1 — CREATIVE AUDIT & FRAMEWORK DI VALIDAZIONE VIDEO ORGANICI](#parte-ii-r1--creative-audit--framework-di-validazione-video-organici)
   - 2.1 I 5 Pilastri Creativi Demi-Fine (Script, Scenografie e Hook)
   - 2.2 Framework Quantitativo a 3 Livelli (Formule e Benchmark)
   - 2.3 Analisi Psicologica del Save Rate (Wishlist & Gifting Proxy)
   - 2.4 Modello di Scoring Composito CVS (Creative Validation Score)
   - 2.5 Tabella di Classificazione a 4 Quadranti & Protocollo Re-Edit
   - 2.6 Significatività Statistica & Finestra di Osservazione
   - 2.7 Checklist Operativa Pre-Flight in 10 Punti per il Team Social
3. [PARTE III: R2 — ARCHITETTURA CAMPAGNE PAID & BURST STRATEGY](#parte-iii-r2--architettura-campagne-paid--burst-strategy)
   - 3.1 Audit Tecnico, Fiscale & Algoritmico: Spark Ads vs TikTok Promote
   - 3.2 Guida Passo-Passo da Smartphone & Riscatto in Ads Manager (Codice a 365 Giorni)
   - 3.3 Razionale Economico della Burst Strategy (20,00 €/giorno Giovedì-Domenica)
   - 3.4 Correlazione con i Pattern di Consumo E-Commerce in Italia
   - 3.5 Tabella di Dayparting Orario & Schedulazione Automatica
   - 3.6 Targeting Demografico Qualificato & Esclusione Tassativa 13-17 Anni
   - 3.7 Segmentazione Cluster A (Donne 22-54) e Cluster B (Uomini 25-45 Gifting)
   - 3.8 Matrice Rigorosa di Decision-Making: Codici KILL-01..05 & Protocolli di Scale
4. [PARTE IV: R3 — FUNNEL E-COMMERCE & TRACCIAMENTO TIKTOK PIXEL SU NEXT.JS](#parte-iv-r3--funnel-e-commerce--tracciamento-tiktok-pixel-su-nextjs)
   - 4.1 Architettura del Funnel a Due Stadi (TOFU -> BOFU)
   - 4.2 Configurazione Custom Audiences & Esclusioni su TikTok Ads Manager
   - 4.3 Strategia di Ottimizzazione: CompletePayment vs AddToCart Fallback
   - 4.4 Implementazione Tecnica Next.js 16 App Router (Codice Completo Type-Safe)
     - `types/tiktok.d.ts`
     - `lib/tiktok-pixel.ts` (con Advanced Matching SHA-256 Web Crypto API)
     - `components/TikTokPixel.tsx` (Script non-bloccante, Route Change SPA, Idempotenza)
     - `components/ProductViewTracker.tsx`
   - 4.5 Mappatura Eventi Standard & Payload JSON (ViewContent, AddToCart, InitiateCheckout, CompletePayment)
   - 4.6 Protezione Idempotente su CompletePayment (`sessionStorage`)
   - 4.7 Conformità GDPR & Binding Dinamico con `CookieBanner.tsx`
   - 4.8 Protocollo di Validazione QA in 4 Fasi
5. [PARTE V: OPERATIONAL LAUNCH ROADMAP (PIANO DI RILASCIO A 4 SETTIMANE)](#parte-v-operational-launch-roadmap-piano-di-rilascio-a-4-settimane)
   - Settimana 1: Infrastruttura Tecnica, Pixel Next.js & QA Test
   - Settimana 2: Seeding Creativo Organico & Calcolo CVS Score
   - Settimana 3: Autorizzazione Spark Ads 365gg & Lancio 1ª Burst Wave
   - Settimana 4: Valutazione Metriche, Matrice Kill/Scale & Retargeting BOFU
6. [PARTE VI: APPENDICI TECNICHE & LINEE GUIDA PER MARIO ED ELENA](#parte-vi-appendici-tecniche--linee-guida-per-mario-ed-elena)
   - Quick Reference Card Giornaliera
   - Tabella Parametri Esecutivi Pronti all'Uso

---

# PARTE I: EXECUTIVE SUMMARY & BRAND POSITIONING

## 1.1 Profilo del Brand & Canali Ufficiali
**Isabel Pepe** è un brand italiano di alta gioielleria artigianale e demi-fine fondato a Salerno da **Mario Pepe** ed **Elena Dumea**. Il brand nasce con una missione chiara: colmare il vuoto strutturale presente nel mercato della gioielleria, posizionandosi esattamente all'intersezione tra la bigiotteria economica usa-e-getta (soggetta ad annerimento, leghe povere in zinco/ottone e irritazioni cutanee) e l'alta gioielleria tradizionale inaccessibile (con ricarichi commerciali del 1.000% tipici delle maison di lusso).

- **Canale Ufficiale TikTok**: `@isabel.pepe88` (https://www.tiktok.com/@isabel.pepe88)
- **Store Ufficiale E-Commerce**: `https://www.isabelpepe.com`
- **Piattaforma E-Commerce**: Next.js 16.2.4 (App Router), React 19.2.4, Supabase Database, Stripe Live Checkout, Tailwind CSS v4.
- **Logistica e Consegne**: Spedizioni express 24/48h assicurate su territorio nazionale (Poste Italiane / SDA / Packlink PRO) con packaging luxury regalo sempre incluso nel prezzo.

```
       ┌─────────────────────────────────────────────────────────────────┐
       │                   ISABEL PEPE VALUE MATRIX                      │
       ├─────────────────────────┬───────────────────────────────────────┤
       │ Bigiotteria da Fast-    │ Isabel Pepe Demi-Fine Luxury:         │
       │ Fashion (10€ - 30€):    │ Gioielli Nobilmente Fusi & Rifiniti:  │
       │ • Ottone, rame, zinco   │ • 100% Argento Sterling 925 Certif.   │
       │ • Macchia la pelle      │ • Placcatura Oro 18K a 1.0 micron     │
       │ • Vetro o zirconi opachi│ • Finitura Rodio Puro a Specchio      │
       │ • Busta in plastica     │ • Nano-Sigillo E-Coating Waterproof   │
       │ • Zero valore nel tempo │ • Moissanite GRA VVS1 D-Color         │
       │                         │ • Scrigno Rigido in Velluto & Card    │
       └─────────────────────────┴───────────────────────────────────────┘
```

## 1.2 DNA Tecnico & Materiali Demi-Fine
Tutta la comunicazione video e pubblicitaria di Isabel Pepe deve rispecchiare con rigore scientifico e fascino visivo le caratteristiche dei materiali impiegati:

1. **Argento Sterling 925 Certificato**:
   - Metallo nobile puro al 92.5%, fuso secondo standard orafi anallergici (100% nichel-free, piombo-free e cadmio-free), in piena conformità al Regolamento Europeo REACH.
   - Ogni pezzo presenta la punzonatura di legge **"S925"** impressa a caldo o incisa a laser, affiancata dal monogramma depositato **"IP"**.
2. **Placcatura Oro 18K a Spessore (1.0 Micron)**:
   - A differenza della placcatura commerciale standard (denominata "flash plating", spessa appena 0.03 - 0.05 micron), Isabel Pepe applica un bagno galvanico a spessore di **1.0 micron di Oro 18 Carati (Oro Giallo o Oro Rosa)**, garantendo una durata e una corposità del colore fino a 20 volte superiore rispetto ai gioielli da grande distribuzione.
3. **Finitura in Rodio Puro a Specchio (Finitura Platino)**:
   - Per le creazioni silver, il gioiello viene bagnato in rodio metallico puro (il metallo nobile più raro e costoso al mondo, superiore all'oro e al platino). Il rodio conferisce una lucentezza a specchio glaciale, prevenendo l'ossidazione naturale dell'argento.
4. **Nano-Sigillo Molecolare E-Coating (Impermeabilità Assoluta)**:
   - Tutti i gioielli sono sottoposti a un processo di cataforesi elettrolitica trasparente (*E-Coating*). Questo film protettivo invisibile dello spessore di pochi nanometri sigilla il metallo contro sudore, acqua marina, cloro, umidità, creme e profumi, rendendo i gioielli **completamente impermeabili (waterproof & sweat-proof)**.
5. **Pietre di Pura Luce: Moissanite Certificata GRA**:
   - Carburo di silicio sintetizzato in laboratorio con qualità ottiche superiori a qualsiasi altra gemma sul pianeta:
     * **Purezza**: VVS1 (nessuna inclusione visibile a 10x).
     * **Colore**: D-Color (massimo grado di bianco ottico e trasparenza assoluta).
     * **Taglio**: Brillante rotondo a 57 faccette con simmetria *Hearts and Arrows* perfetta.
     * **Indice di Rifrazione (RI)**: **2.65 - 2.69** (superiore a quello del diamante naturale che è 2.42).
     * **Dispersione Ottica (Fuoco)**: **0.104** (oltre 2.4 volte superiore al diamante naturale che si ferma a 0.044), capace di riflettere scintille prismatiche multicolore ad ogni movimento.
     * **Durezza Scala Mohs**: **9.25** (resistente a graffi e abrasioni quotidiane, superata unicamente dal diamante).
     * **Certificazione Ufficiale**: Ogni gemma a partire da 0.5 carati è accompagnata dal certificato nominale **GRA (Global Gemological Research Academy)** con codice seriale univoco inciso a laser sul bordo della pietra (cintura).
6. **Perle Naturali Coltivate d'Acqua Dolce**:
   - Perle autentiche barocche o sferiche con oriente serico, lucentezza perlacea profonda e forma organica, accoppiate a montature in Argento 925.
7. **Esperienza di Dono a Scrigno & Confezione Luxury**:
   - Confezione rigida soft-touch con apertura a scrigno, finiture interne in morbido velluto nero o cipria, logo impresso a caldo in lamina dorata/oro rosa.
   - Certificato Master di Garanzia 24 Mesi stampato su cartoncino d'arte ivory debossed con monogramma 3D in rilievo.
   - Panno in microfibra brandizzato per la cura quotidiana e donazione del 5% di ogni ordine a rifugi per animali.

## 1.3 Economia Unitaria & Fasce di Prezzo
Il catalogo di `isabelpepe.com` è strutturato per garantire un **Average Order Value (AOV) compreso tra 120,00 € e 180,00 €**, ideale per assorbire i costi di acquisizione su paid media e generare marginalità netta elevata:

| Categoria di Prodotto | Esempi Iconici nel Catalogo | Fascia di Prezzo | Marginalità Lorda Tipica |
| :--- | :--- | :---: | :---: |
| **Punto Luce Singolo** | Collana Luce Divina, Orecchini Punto Luce D-Color | 49,00 € - 79,00 € | 72% - 78% |
| **Anelli Solitari & Eternità** | Anello Solitario Eden Rose, Anello a Fascia Moissanite | 79,00 € - 119,00 € | 75% - 80% |
| **Bracciali Tennis** | Bracciale Tennis Moissanite 3mm/4mm S925 | 129,00 € - 189,00 € | 78% - 82% |
| **Parure Complete & Luxury Set** | **Set Isabel Rose (A145)** (Collana + Orecchini + Anello) | 149,00 € - 229,00 € | 80% - 85% |

### Leve di Agevolazione Transazionale su Frontend:
- **Spedizione Express 24/48h Gratuita**: Nessun costo nascosto al checkout che causi l'abbandono del carrello.
- **Rateizzazione BNPL (Buy Now Pay Later)**: Integrazione nativa di **Klarna (3 rate a tasso zero)**, **PayPal Paga in 3 Rate** e **Scalapay**, abbattendo la soglia psicologica dell'acquisto da 150€ a soli 50€ al mese.

## 1.4 La Filosofia Strategica: Validazione Organica Prima di Scalare
In una nicchia come la gioielleria demi-fine su TikTok, **il paid media non deve essere utilizzato per "scoprire" se un video piace**, bensì esclusivamente per moltiplicare la portata di contenuti che hanno già dimostrato oggettivamente di:
1. Catturare lo sguardo dell'utente nei primi 2 secondi (**Hook Rate**).
2. Trattenere l'attenzione fino alla fine (**Retention Rate**).
3. Innescare il desiderio profondo di possesso o regalo (**Save Rate**).

La presente strategia unisce la creatività artigianale (R1), il rigore matematico del media buying concentrato (R2) e l'eccellenza telemetrica del tracciamento dati (R3) in un'unica macchina ad alto rendimento.

---

# PARTE II: R1 — CREATIVE AUDIT & FRAMEWORK DI VALIDAZIONE VIDEO ORGANICI

## 2.1 I 5 Pilastri Creativi Demi-Fine (Script, Scenografie e Hook)
Per nutrire il profilo TikTok `@isabel.pepe88` con contenuti eterogenei ma costantemente allineati all'estetica *Old Money & Quiet Luxury*, la produzione video è organizzata in cinque pilastri creativi.

```
       ┌─────────────────────────────────────────────────────────────┐
       │             I 5 PILASTRI CREATIVI ISABEL PEPE               │
       └──────────────────────────────┬──────────────────────────────┘
                                      │
        ┌──────────────┬──────────────┼──────────────┬──────────────┐
        ▼              ▼              ▼              ▼              ▼
   [PILASTRO 1]   [PILASTRO 2]   [PILASTRO 3]   [PILASTRO 4]   [PILASTRO 5]
  Artigianalità   Brillantezza     Unboxing       Styling &     Social Proof
   & Dettaglio    & Rifrazione    Packaging      Outfit Old      & Reazioni
      Orafo        Moissanite       Lusso          Money           Reali
```

---

### PILASTRO 1: Artigianalità, Laboratorio & Punzonatura
- **Obiettivo**: Distruggere la percezione di "prodotto drop-shipping" o "bigiotteria cinese", posizionando Isabel Pepe come atelier di gioielleria nobile.
- **Scenografia & Attrezzatura**: Banco da orafo in legno massello scuro, illuminazione calda direzionale, pinzette di precisione in acciaio satinato, panno in microfibra, calibro digitale per misurazioni al decimo di millimetro, lente d'ingrandimento da orafo (loupe 10x/20x).
- **Inquadrature Macro Chiave**:
  1. *Frame 0-2s*: Macro estrema (lente 100mm o zoom 3x stabilizzato) che scorre lungo la montatura del gioiello fino a mettere a fuoco l'incisione laser **"S925"** e il logo **"IP"**.
  2. *Frame 2-6s*: La pinzetta che posiziona delicatamente la pietra Moissanite nella montatura a 4 griffe.
  3. *Frame 6-12s*: Lucidatura finale a specchio con il panno che rivela la lucentezza del rodio puro o dell'oro 18K.
- **Script Video (Esempio ASMR / Voiceover)**:
  * *Audio*: ASMR puro (tintinnio metallico dell'argento, fruscio del panno in microfibra, respiro calmo) oppure voce calda narrante:
  * *Voiceover*: *"Non usiamo ottone o leghe di zinco che lasciano le dita verdi dopo tre giorni. Ogni nostra creazione nasce in vero Argento 925 massiccio, viene bagnata in Oro 18 carati a 1 micron e sigillata con il nano-trattamento E-Coating. La punzonatura che vedi qui non mente mai."*
- **Metriche Target del Pilastro**: Hook Rate 2s $\ge$ 50% | Retention $\ge$ 52% | Save Rate $\ge$ 1.5%.

---

### PILASTRO 2: Brillantezza & Rifrazione Moissanite (Luce Naturale vs Flash Macro & Diamond Tester)
- **Obiettivo**: Elettrificare lo spettatore dimostrando l'incredibile resa ottica della Moissanite e provando la sua autenticità fisica mediante strumenti di laboratorio gemmologico.
- **Fisica Ottica della Moissanite**:
  * Indice di rifrazione: **2.65 - 2.69** (diamante naturale: 2.42).
  * Dispersione (fuoco arcobaleno): **0.104** (diamante naturale: 0.044 -> la Moissanite riflette 2.4 volte più scintille).
  * Conducibilità termica identica al diamante naturale (supera a pieni voti i test termici).
- **Format Visivo A: The Flash Shock (Visual Hook)**:
  * *Frame 0.0 - 0.8s*: Il gioiello mostrato in luce d'ambiente soffusa o semi-buio.
  * *Frame 0.8s (SNAP)*: Accensione simultanea del flash LED dello smartphone a 5 cm dalla pietra. L'obiettivo della telecamera viene travolto da fasci di luce prismatici multicolore (*Rainbow Fire*).
- **Format Visivo B: The Diamond Tester Challenge**:
  * Inquadratura del dispositivo professionale per il test dei diamanti (*Diamond Selector II*).
  * *Step 1*: La punta della penna termica tocca uno zircone o pezzo di vetro: la barra LED rimane a zero e non emette alcun suono (*"Nessuna reazione, zero conducibilità"*).
  * *Step 2*: La punta tocca la gemma Isabel Pepe montata sul solitario: la barra LED sale istantaneamente dal verde al giallo fino al rosso massimo con un segnale acustico acuto continuo (*BEEP BEEP BEEP*).
  * *Testo a schermo*: *"Perché spendere 6.000€ per un diamante naturale quando la nostra Moissanite passa il test dei gioiellieri e brilla persino di più a 99€?"*
- **Metriche Target del Pilastro**: **Hook Rate 2s $\ge$ 56% - 62%** | Retention $\ge$ 50% | Save Rate $\ge$ 1.8%.

---

### PILASTRO 3: Unboxing Packaging Lusso & Rituale Sensoriale
- **Obiettivo**: Rassicurare l'acquirente sul fatto che l'esperienza visiva e tattile all'arrivo del pacco sarà all'altezza delle più prestigiose maison di lusso mondiali, stimolando il salvataggio per regali futuri.
- **Dettagli Scenografici dell'Unboxing**:
  1. Rimozione della busta di spedizione brandizzata, rivelando lo scrigno rigido soft-touch Isabel Pepe con monogramma dorato in rilievo.
  2. *Scatto ASMR*: Pressione della chiusura a scrigno che si apre con uno scatto sonoro sordo e piacevole, svelando il gioiello adagiato sul cuscino in velluto.
  3. *Certificati Ufficiali*: Estrazione del Certificato Master su cartoncino d'arte ivory spesso 350g con debossing dorato e della tessera magnetica GRA con matricola univoca.
  4. Presenza del panno di pulizia microfibra personalizzato e della bustina da viaggio in raso.
- **Voiceover d'Accompagnamento**:
  * *"Quando ordini un regalo per una persona importante, la confezione non è un dettaglio: è la prima cosa che vede. Ecco esattamente cosa ricevi a casa con spedizione express 24/48h gratuita e garanzia 24 mesi inclusa."*
- **Metriche Target del Pilastro**: Hook Rate 2s $\ge$ 48% | Retention $\ge$ 52% | **Save Rate $\ge$ 2.2% - 3.2%** (il più alto in assoluto per le wishlist).

---

### PILASTRO 4: Styling su Modella & Outfit Pairings (Old Money Aesthetic)
- **Obiettivo**: Fornire ispirazione pratica di eleganza contemporanea (*Quiet Luxury*), dimostrando come i gioielli Isabel Pepe completino outfit quotidiani e da cerimonia.
- **Linee Guida Estetiche per le Riprese**:
  * **Mani & Unghie**: Manicure perfetta in stile *Clean Girl* (nude lattiginoso, smalto trasparente o french sottilissima). Assoluto divieto di unghie rovinate o smalti sgargianti che distolgano l'attenzione dal gioiello.
  * **Abbigliamento Modella**: Colori neutri ed eleganti (bianco avorio, panna, beige cammello, nero sartoriale). Camicia di lino sbottonata, blazer doppiopetto, maglione in cashmere a girocollo, top in seta con scollo a V.
  * **Composizioni Gioiello (Layering & Stacking)**:
    - *Bracciale Tennis Stacking*: Abbinamento del bracciale tennis Moissanite 3mm con un orologio vintage a maglia jubileo in acciaio/oro.
    - *Collana Cascata di Luce*: Girocollo punto luce Moissanite 40cm abbinato a un pendente a goccia su catena 45cm.
- **Dinamica di Movimento**:
  * Modella che sposta delicatamente una ciocca di capelli dietro l'orecchio, rivelando il bagliore dell'orecchino punto luce; camminata alla luce del sole con il bracciale tennis che cattura la luce ad ogni passo.
- **Metriche Target del Pilastro**: Hook Rate 2s $\ge$ 50% | Retention $\ge$ 53% | Save Rate $\ge$ 1.6%.

---

### PILASTRO 5: Social Proof Autentica & Reazioni Reali (Gifting & POV)
- **Obiettivo**: Sfruttare l'empatia della sorpresa e la prova sociale per abbattere ogni esitazione d'acquisto, specialmente nel pubblico maschile e nelle ricorrenze.
- **Archetipi Narrativi**:
  1. *POV Regalo Anniversario*: *"Ho deciso di sorprendere la mia compagna per il nostro quinto anniversario. Non le ho detto quanto ho speso: ecco la sua reazione appena ha aperto lo scrigno."*
  2. *Reazione Spontanea*: Apertura dello scrigno, sguardo estasiato, esclamazione spontanea: *"Amore, ma sei impazzito?! Quanto hai speso?!"* seguita dalla prova al dito della luce della Moissanite.
  3. *Confronto Diretto (Side-by-Side)*: Cliente che mette a confronto alla luce del sole il proprio anello con diamante da 4.500€ e il solitario Moissanite Isabel Pepe da 89€: *"Metteteli vicini. La Moissanite brilla il doppio e nessuno dei miei amici riesce a distinguerli."*
  4. *Waterproof & Durability Test*: Doccia o bagno con collana e anello indossati: *"La indosso ininterrottamente da 6 mesi: doccia, piscina, mare. Non è mai annerita grazie all'argento 925 e all'E-Coating."*
- **Metriche Target del Pilastro**: Hook Rate 2s $\ge$ 54% | Retention $\ge$ 55% | Save Rate $\ge$ 1.5%.

---

## 2.2 Framework Quantitativo a 3 Livelli (Formule e Benchmark)
Un video organico pubblicato sul canale `@isabel.pepe88` non può essere considerato idoneo alla sponsorizzazione se non supera rigorosamente tutti e tre i seguenti filtri matematici:

```
┌─────────────────────────────────────────────────────────────────────────┐
│              FRAMEWORK DI VALIDAZIONE A 3 LIVELLI (PRE-ADS)             │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                 ┌───────────────────┴───────────────────┐
                 │                                       │
                 ▼                                       ▼
     ┌───────────────────────┐               ┌───────────────────────┐
     │       LIVELLO 1       │               │       LIVELLO 2       │
     │  Hook Rate (2s / 3s)  │ ────────────> │ Retention Rate (AWT)  │
     │   Target: >= 50-55%   │               │     Target: >= 50%    │
     └───────────────────────┘               └───────────┬───────────┘
                                                         │
                                                         ▼
                                             ┌───────────────────────┐
                                             │       LIVELLO 3       │
                                             │       Save Rate       │
                                             │  Target: >= 1.5-2.0%  │
                                             └───────────┬───────────┘
                                                         │
                                                         ▼
                                             ┌───────────────────────┐
                                             │   QUALIFICA WINNER    │
                                             │  Autorizzato Spark Ad │
                                             └───────────────────────┘
```

### Livello 1: Hook Rate (Stop Rate) a 2 e 3 Secondi
Misura la percentuale di utenti che arresta lo scroll compulsivo del feed "Per Te" (FYP) e guarda almeno 2 o 3 secondi del video:

$$\text{Hook Rate}_{2s} = \left( \frac{\text{Visualizzazioni Video a 2 Secondi}}{\text{Impression Totali}} \right) \times 100$$

$$\text{Hook Rate}_{3s} = \left( \frac{\text{Visualizzazioni Video a 3 Secondi}}{\text{Impression Totali}} \right) \times 100$$

- **Target Minimo per Ammissione Paid**: **$\ge 50.0\%$ (a 2s)** oppure **$\ge 42.0\%$ (a 3s)**.
- *Perché è Vitale*: Un Hook Rate inferiore al 40% significa che il 60%+ del pubblico passa oltre senza conoscere il brand. Sponsorizzare un video con basso Hook Rate comporta CPM d'asta gonfiati del 60-80% perché l'algoritmo rileva scarso gradimento iniziale.
- *Safe Zone TikTok*: Tutti gli hook testuali e gli elementi visivi primari devono essere posizionati tra il **15% dall'alto** e il **35% dal basso**, lasciando liberi i margini laterali del 10% per non essere coperti dall'interfaccia dell'app (pulsanti like, commenta, salva a destra e didascalia in basso).

### Livello 2: Retention Rate / Average Watch Time (AWT)
Misura la capacità del montaggio di mantenere incollato lo spettatore dopo i primi secondi:

$$\text{Watch Time Ratio (\%)} = \left( \frac{\text{Tempo Medio di Visione in Secondi}}{\text{Durata Complessiva del Video in Secondi}} \right) \times 100$$

$$\text{Completion Rate (\%)} = \left( \frac{\text{Visualizzazioni Complete al 100\%}}{\text{Visualizzazioni Totali}} \right) \times 100$$

- **Durata Ottimale (Golden Ratio)**: **14 - 22 secondi**. Sotto i 12 secondi il video non trasmette credibilità sui materiali; sopra i 25 secondi il decadimento della ritenzione compromette l'algoritmo.
- **Target Minimo**: **$\ge 50.0\%$** di Watch Time Ratio e **$\ge 20.0\%$** di Completion Rate.
- **Regole di Montaggio Dinamico**:
  * Tagli visivi e cambi di angolatura ogni **1.2 - 1.8 secondi**.
  * **Seamless Loop**: Montaggio in ciclo continuo, in cui l'ultimo frame si salda senza interruzioni al primo (anche con loop sintattico del testo o della voce), inducendo molti utenti a rivedere il video una seconda volta e portando la retention sopra il 100%.

### Livello 3: Save Rate (Tasso di Salvataggi)
Misura la percentuale di spettatori che preme deliberatamente sull'icona del segnalibro per salvare il video tra i propri preferiti:

$$\text{Save Rate (\%)} = \left( \frac{\text{Numero di Salvataggi (Saves / Bookmarks)}}{\text{Visualizzazioni Totali del Video (Views)}} \right) \times 100$$

- **Target Minimo per Ammissione Paid**: **$\ge 1.50\%$** (ovvero almeno 15 salvataggi ogni 1.000 visualizzazioni).
- **Target Top Performer**: **$\ge 2.00\% - 3.00\%$**.

---

## 2.3 Analisi Psicologica del Save Rate (Wishlist & Gifting Proxy)
Nella gioielleria demi-fine (dove l'ordine medio varia tra 120€ e 180€), le metriche di engagement non hanno tutte lo stesso valore commerciale:

```
┌────────────────────────────────────────────────────────────────────────┐
│             GERARCHIA DEL VALORE DI ENGAGEMENT SU TIKTOK               │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
    [LIKE] ───────────────> [COMMENTO] ─────────────> [SALVATAGGIO]
  Vanity Metric          Curiosità / Dubbio        Intenzione d'Acquisto
  Basso Sforzo             Medio Sforzo            Forte Valore Futuro
  Zero Correlazione       Spesso Dispersivo         "Wishlist & Gifting"
  alle Vendite            ("Prezzo?", "Spedite?")    Correlazione Diretta
                                                       al Carrello
```

1. **Il Like è un Riflesso Passivo**: Il doppio tocco richiede zero attrito e zero impegno mentale. L'utente medio elargisce decine di like al giorno senza ricordare cosa ha visto. Meno dello 0.3% degli utenti che mettono like acquisterà mai il prodotto.
2. **Il Commento è Spesso Rumore**: I commenti sono frequentemente richieste superficiali (*"prezzo?"*, *"dove si compra?"*) di utenti che non apriranno mai il sito.
3. **Il Salvataggio è l'Azione Digitale a Massimo Valore Intenzionale**:
   - Salvare un video comporta un costo cognitivo cosciente: l'utente inserisce il video nella propria cartella personale (*"Idee Regalo"*, *"Wishlist Compleanno"*, *"Gioielli da Comprare"*).
   - **Meccanica del Gifting Femminile**: La donna salva il video per non dimenticare il brand quando vorrà premiarsi (*self-reward*), oppure per inoltrarlo direttamente su WhatsApp al partner con il messaggio: *"Guarda che meraviglia questo anello di Isabel Pepe, per il nostro anniversario vorrei questo"*.
   - **Meccanica del Gifting Maschile**: L'uomo che incappa nel video e nota l'eleganza del packaging lo salva per avere la soluzione pronta in vista di compleanno o San Valentino.
4. **Il Peso Decisivo nell'Algoritmo di Raccomandazione ByteDance**:
   - L'algoritmo di TikTok attribuisce al **Salvataggio un peso stimato tra 5x e 8x rispetto al Like**.
   - TikTok premia i contenuti che stimolano l'utente a ritornare sull'app per consultare i preferiti. Un video ad alto Save Rate viene contrassegnato dal sistema come "Asset ad Alto Valore Utile", garantendo un CPM paid notevolmente più basso e un indice di conversione carrello molto più elevato.

---

## 2.4 Modello di Scoring Composito CVS (Creative Validation Score)
Per rimuovere ogni ambiguità soggettiva (*"questo video mi piace"*), è istituito l'algoritmo matematico **Creative Validation Score (CVS)** su scala 0-100:

$$\text{CVS} = \left( S_{\text{hook}} \times 0.35 \right) + \left( S_{\text{ret}} \times 0.35 \right) + \left( S_{\text{save}} \times 0.30 \right)$$

Ciascun punteggio parziale ($S$) viene normalizzato su base 100 in base alla seguente griglia oggettiva:

| Parametro Rilevato | Score 0 pt (Critico) | Score 50 pt (Soglia Base) | Score 85 pt (Target Isabel Pepe) | Score 100 pt (Top Elite) |
| :--- | :---: | :---: | :---: | :---: |
| **Hook Rate 2s ($S_{\text{hook}}$)** | < 30.0% | 40.0% | **50.0%** | $\ge 60.0\%$ |
| **Watch Time Ratio ($S_{\text{ret}}$)** | < 30.0% | 40.0% | **50.0%** | $\ge 65.0\%$ |
| **Save Rate ($S_{\text{save}}$)** | < 0.60% | 1.00% | **1.50%** | $\ge 2.50\%$ |

### 🔒 Regola di Ammissione Condizionale (Hard Gating Floor per Tier A):
Il punteggio composito CVS costituisce una condizione *necessaria ma non sufficiente* per l'accesso allo status di Winner Assoluto (Tier A). Per neutralizzare falsi positivi derivanti da video "clickbait" (con ganci e ritenzione eccezionali che compensano matematicamente un basso indice di salvataggio), l'approvazione per la sponsorizzazione a pagamento impone la seguente **congiunzione logica tassativa**:

$$\mathbf{\text{Tier A Winner} \iff (\text{CVS} \ge 85) \land (\text{Hook Rate} \ge 50.0\%) \land (\text{Retention Rate} \ge 50.0\%) \land (\text{Save Rate} \ge 1.50\%)}$$

> **HARD GATING FLOOR SUI SALVATAGGI (Save Rate >= 1.50%)**:  
> Se il **Save Rate è inferiore a 1.50%**, il video **NON PUÒ in alcun caso essere approvato come Tier A**, indipendentemente dal punteggio CVS ottenuto (anche qualora il CVS fosse pari a 90 o superiore). Senza l'intenzione d'acquisto certificata dal salvataggio organico, ogni erogazione paid si tradurrebbe in dispersione economica a basso ROAS.

---

## 2.5 Tabella di Classificazione a 4 Quadranti & Protocollo Re-Edit

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                TABELLA DI CLASSIFICAZIONE CREATIVA                               │
├───────────────┬────────────┬──────────────────────────────────────┬──────────────────────────────┤
│ CATEGORIA     │ RANGE CVS  │ CRITERI CHIAVE SULLE METRICHE        │ AZIONE OPERATIVA IMMEDIATA   │
├───────────────┼────────────┼──────────────────────────────────────┼──────────────────────────────┤
│ 🏆 WINNER     │ 85 - 100   │ • CVS >= 85 (Hard Gate Conjunction): │ APPROVAZIONE SPARK ADS       │
│ ASSOLUTO      │            │   - Hook Rate >= 50.0%               │ • Generare codice Spark Ads  │
│ (Tier A)      │            │   - Retention >= 50.0%               │ • Inserire in Burst Strategy │
│               │            │   - Save Rate >= 1.50% (Tassativo!)  │ • Budget 20€/giorno Gio-Dom  │
├───────────────┼────────────┼──────────────────────────────────────┼──────────────────────────────┤
│ ⚠️ POTENZIALE │ 65 - 84    │ • Retention >= 50.0%                 │ HOOK RE-EDIT & RE-TEST       │
│ HOOK RE-EDIT  │            │ • Save Rate >= 1.50%                 │ • NON sponsorizzare ancora   │
│ (Tier B)      │            │ • Hook Rate tra 40.0% e 49.9%        │ • Tagliare primi 2.5 secondi │
│               │            │   (Dead Zone 45-49.9% Risolta!)      │ • Montare 3 nuovi hook       │
│               │            │                                      │ • Ripubblicare organicamente │
├───────────────┼────────────┼──────────────────────────────────────┼──────────────────────────────┤
│ 🛑 SCROLLER   │ 50 - 64    │ • Hook Rate >= 50.0%                 │ DA SCARTARE PER ADS          │
│ BAIT          │            │ • Retention < 38.0%                  │ • L'intro attira ma il corpo │
│ (Tier C)      │            │ • Save Rate < 0.90%                  │   delude / annoia            │
│               │            │                                      │ • Zero budget pubblicitario  │
├───────────────┼────────────┼──────────────────────────────────────┼──────────────────────────────┤
│ ❌ DA         │ < 50       │ • Hook < 40.0%                       │ ARCHIVIAZIONE DEFINITIVA     │
│ SCARTARE      │            │ • Retention < 40.0%                  │ • Fallimento strutturale di  │
│ (Tier D)      │            │ • Save Rate < 1.00%                  │   concept ed esecuzione      │
└───────────────┴────────────┴──────────────────────────────────────┴──────────────────────────────┘
```

> **Risoluzione Definitiva della Dead Zone (Intervallo 45.0% - 49.9%)**:  
> Nel framework originario, i video con Hook Rate compreso tra il 45.0% e il 49.9% ricadevano in un limbo operativo non categorizzato. Nel modello consolidato, il **Tier B include rigorosamente tutti i video con Hook Rate compreso tra 40.0% e 49.9%** a parità di corpo solido (Retention $\ge 50.0\%$ e Save Rate $\ge 1.50\%$). Tale perimetro garantisce che ogni asset ad alto potenziale di conversione venga tempestivamente intercettato e sottoposto al protocollo di Hook Re-Edit.

### Protocollo Operativo di Recupero per Tier B (Hook Re-Edit):
Il Tier B racchiude i video più promettenti: il prodotto, la musica e la dimostrazione finale convincono chi li guarda (ritenzione e salvataggi elevati), ma l'inizio era troppo lento per fermare lo scorrimento del feed.
1. Riaprire il file di montaggio sorgente (CapCut / Premiere Pro / DaVinci).
2. **Cancellare interamente i primi 2.5 secondi originari**.
3. Montare **3 nuove varianti di Hook** nei primi 1.5 secondi:
   - *Variante 1 (Flash Shock)*: Zoom macro della Moissanite con flash LED accecante a frame zero.
   - *Variante 2 (Diamond Tester Beep)*: La penna termica che suona con barra rossa nei primi 0.5 secondi.
   - *Variante 3 (Copy ad Alto Contrasto in Safe Zone)*: *"Costa 99€ ma tutti pensano che sia da 5.000€"*.
4. Ripubblicare sul canale `@isabel.pepe88` a distanza di 48 ore.
5. La variante che innalza l'Hook Rate sopra il 50% viene promossa istantaneamente a **Tier A (Winner)**.

---

## 2.6 Significatività Statistica & Finestra di Osservazione
Per evitare false conclusioni derivanti da campioni numericamente insignificanti (es. 2 salvataggi su 40 visualizzazioni darebbero un Save Rate fittizio del 5.0%):
- **Soglia Minima di Campionamento**: Il video deve totalizzare almeno **800 - 1.200 visualizzazioni organiche** prima di calcolare il punteggio CVS.
- **Finestra Temporale di Analisi**: La valutazione deve avvenire tra le **48 e le 72 ore** dalla pubblicazione (il tempo necessario a TikTok per completare la distribuzione nei cluster di prova FYP).

---

## 2.7 Checklist Operativa Pre-Flight in 10 Punti per il Team Social
Prima di generare il codice Spark Ads e stanziare budget pubblicitario, il Media Buyer o il Social Media Manager deve convalidare positivamente tutti i 10 punti di controllo:

| N° | Checkpoint di Controllo | Standard Tassativo Richiesto | Esito |
| :---: | :--- | :--- | :---: |
| **1** | **Significatività Statistica** | Almeno 1.000 visualizzazioni organiche accumulate in 48-72h. | [ ] PASS |
| **2** | **Hook Rate (Stop Rate 2s/3s)** | Hook Rate 2s $\ge$ 50.0% (o 3s $\ge$ 42.0%) verificato su Analytics. | [ ] PASS |
| **3** | **Retention Rate / AWT** | Watch Time medio $\ge$ 50.0% della durata complessiva del video. | [ ] PASS |
| **4** | **Save Rate (Intenzione d'Acquisto)** | Rapporto Salvataggi / Views $\ge$ 1.50% (almeno 15 salvataggi su 1.000 views). | [ ] PASS |
| **5** | **Licenza Musicale Commerciale** | Audio originale/ASMR oppure brano appartenente alla **TikTok Commercial Music Library**. *L'uso di audio trending coperti da copyright consumer causa il rigetto dell'annuncio o la disattivazione del sonoro in paid.* | [ ] PASS |
| **6** | **Safe Zone Compliance** | Testi, gioielli e call-to-action contenuti tra il 15% superiore e il 35% inferiore, senza sovrapposizione con i pulsanti di sistema TikTok. | [ ] PASS |
| **7** | **Giacenza di Magazzino (Stock Check)** | Disponibilità immediata su `isabelpepe.com` di **almeno 10-15 pezzi** per il modello protagonista del video, oppure riassortimento garantito in 48h. | [ ] PASS |
| **8** | **Allineamento Scheda Prodotto** | La landing page dell'e-commerce riporta esattamente la confezione, il certificato, le specifiche dei metalli e il prezzo annunciato nel video. | [ ] PASS |
| **9** | **Autorizzazione Spark Ads a 365 Giorni** | Impostazioni pubblicitarie abilitate nel video -> Autorizzazione concessa per **365 giorni** -> Codice generato e copiato. | [ ] PASS |
| **10**| **Telemetria Pixel Verificata** | TikTok Pixel attivo su `isabelpepe.com` con ricezione corretta di `ViewContent` e `AddToCart`. | [ ] PASS |

---

# PARTE III: R2 — ARCHITETTURA CAMPAGNE PAID & BURST STRATEGY

## 3.1 Audit Tecnico, Fiscale & Algoritmico: Spark Ads vs TikTok Promote
Un errore fatale commesso da molti brand emergenti è l'uso della funzione interna all'app **"Promuovi" (TikTok Promote)**. Per Isabel Pepe, l'unica via ammessa per fare paid advertising professionale è l'erogazione di **Spark Ads tramite TikTok Ads Manager**.

```
+-----------------------------------------------------------------------------------+
|               CONFRONTO COMPARATIVO: TIKTOK PROMOTE VS SPARK ADS                  |
+-----------------------------------------------------------------------------------+
| CARATTERISTICA                | TIKTOK PROMOTE (In-App) | SPARK ADS (Ads Manager) |
|-------------------------------+-------------------------+-------------------------|
| Obiettivo Primario            | Vanity metrics (Views)  | Web Conversions (Sales) |
| Collegamento TikTok Pixel     | ASSENTE                 | COMPLETO (Eventi + CAPI)|
| Advanced Matching (SHA-256)   | IMPOSSIBILE             | ATTIVO (Email + Telefono|
| Esclusione Minori (13-17)     | Inaffidabile/Parziale   | TASSATIVA AL 100%       |
| Bidding Strategy              | Offerta opaca automatica| Lowest Cost / Cost Cap  |
| Regime Fiscale Fattura        | In-App Purchase (+30%)  | B2B Reverse Charge VIES |
| Detraibilità IVA (22%)        | NO (Ricevuta Consumer)  | SI (Fattura Irlanda)    |
| Preservazione Social Proof    | Limitata                | PERMANENTE SUL PROFILO  |
| Cessione Password Profilo     | Richiesta da agenzie    | ZERO (Solo Codice Auth) |
+-----------------------------------------------------------------------------------+
```

### Aspetti Fiscali & Legali (Deducibilità Fiscale e Commissioni Store):
- **TikTok Promote**: Viene fatturato tramite **Apple App Store** o **Google Play Store** come acquisto in-app consumer. Include la trattenuta/ricarico del 30% degli store e genera una semplice ricevuta personale priva dei riferimenti di Partita IVA aziendale. **L'IVA al 22% non è detraibile e il costo non è deducibile dal reddito d'impresa**.
- **Spark Ads via Ads Manager**: Viene fatturato direttamente da **TikTok Technology Limited (Dublino, Irlanda)** con regolare fattura B2B intestata alla Partita IVA dell'azienda in regime di **Reverse Charge intracomunitario (VIES)**. L'intero investimento pubblicitario è fiscalmente deducibile al 100% come spesa di marketing, e l'IVA non viene anticipata né sprecata.

### Il Volano di Brand Equity (Flywheel Effect di Spark Ads):
A differenza dei normali annunci "Dark Post" (in cui commenti e like si cancellano una volta spenta l'inserzione), **con Spark Ads ogni like, condivisione e commento entusiasta rimane impresso sul video organico visibile nel profilo `@isabel.pepe88`**. In questo modo, il denaro investito in pubblicità accresce perennemente la riprova sociale del profilo aziendale.

---

## 3.2 Guida Passo-Passo da Smartphone & Riscatto in Ads Manager (Codice a 365 Giorni)

```
+-----------------------------------------------------------------------------------+
|                           FLUSSO OPERATIVO SPARK ADS                              |
|                                                                                   |
|  [App TikTok Smartphone]              [Generazione Codice]      [Ads Manager PC]  |
|  Profilo @isabel.pepe88                Video "Winner"            Creative Library  |
|  -> Impostazioni pubblicitarie        -> Impostazioni pubbl.    -> Spark Ads      |
|  -> Toggle ON                         -> Durata 365 giorni      -> Incolla Codice |
|                                       -> Copia Codice Auth      -> Pronto al Go!  |
+-----------------------------------------------------------------------------------+
```

### FASE 1: Abilitazione Master delle Autorizzazioni sull'App TikTok
*(Da eseguire una sola volta da smartphone sul profilo `@isabel.pepe88`)*
1. Aprire l'app TikTok e accedere al profilo `@isabel.pepe88`.
2. Toccare il menu in alto a destra (**☰ tre linee orizzontali**).
3. Selezionare **TikTok Studio** (o *Strumenti per i creator*).
4. Scorrere fino a **Impostazioni pubblicitarie** (Ad settings).
5. Portare l'interruttore **Autorizzazione pubblicitaria** su **ON (Verde/Attivo)**.

### FASE 2: Generazione del Codice Video Spark Ads a 365 Giorni
*(Da eseguire per ogni video validato come Tier A Winner)*
1. Aprire il video qualificato a schermo intero sul profilo `@isabel.pepe88`.
2. Toccare l'icona con i **tre puntini (...)** in basso a destra (oppure l'icona *Condividi*).
3. Nella barra inferiore delle azioni, scorrere verso destra e toccare l'icona **Impostazioni pubblicitarie**.
4. Spuntare l'accettazione dei Termini e attivare l'interruttore **Autorizzazione pubblicitaria (ON)**.
5. Alla voce **Periodo di autorizzazione**, selezionare tassativamente **365 giorni**.
   * *Avvertenza*: Se si seleziona per errore 30 giorni, al 31° giorno la campagna verrà improvvisamente sospesa da TikTok per scadenza permessi, azzerando l'apprendimento algoritmico accumulato.
6. Toccare **Genera codice** e poi **Copia codice**. Verrà copiata una stringa alfanumerica univoca negli appunti.

### FASE 3: Riscatto del Codice su TikTok Ads Manager da Computer
1. Accedere da desktop a `https://ads.tiktok.com` con l'account aziendale Isabel Pepe.
2. Nel menu in alto, posizionarsi su **Risorse (Assets)** e cliccare su **Creatività (Creative)**.
3. Selezionare nel menu laterale la voce **Spark Ads** (o *Spark Ads Posts*).
4. Cliccare sul pulsante blu **Richiedi autorizzazione (Apply for Authorization)**.
5. Incollare il codice alfanumerico copiato dallo smartphone e cliccare **Cerca**.
6. Verificare l'anteprima del video con la dicitura `@isabel.pepe88` e cliccare **Conferma**.
7. Il video è ora collegato all'account pubblicitario e pronto per essere selezionato nelle campagne di conversione.

---

## 3.3 Razionale Economico della Burst Strategy (20,00 €/giorno Giovedì-Domenica)

### Il Vincolo Minimo di Piattaforma per Ad Group:
In TikTok Ads Manager per l'area Euro, **il budget giornaliero minimo consentito per singolo Gruppo di Annunci (Ad Group) è pari a 20,00 €**. Non è tecnicamente possibile impostare cifre inferiori (es. 10€ o 15€).

### La Trappola della Diluizione Settimanale (11,43 €/giorno):
Spalmare un budget iniziale di test di **80,00 € a settimana** (~320-350€ al mese) su tutti i 7 giorni comporterebbe una spesa teorica di 11,43 € al giorno. Tale approccio:
- È impossibile su singolo Ad Group senza ricorrere a complessi artifici di CBO multi-gruppo.
- Disperderebbe il budget in poche centinaia di visualizzazioni al giorno durante momenti feriali a bassissima propensione d'acquisto.
- Impedirebbe all'algoritmo di raccogliere i segnali minimi di conversione necessari a superare la fase di apprendimento (*Learning Phase*).

### La Soluzione Ingegneristica: Burst Strategy a 4 Giorni:
Concentrare il budget settimanale di 80,00 € nei **4 giorni a più alto rendimento della settimana**:
$$\text{Budget Settimanale} = 20{,}00\text{ €/giorno} \times 4\text{ giorni (Giovedì, Venerdì, Sabato, Domenica)} = 80{,}00\text{ €}$$
L'Ad Group opera costantemente alla piena soglia tecnica di 20,00 €/giorno, garantendo un volume di impression concentrate sufficiente a dominare le aste nei momenti chiave di shopping online.

---

## 3.4 Correlazione con i Pattern di Consumo E-Commerce in Italia
Nel mercato italiano della gioielleria demi-fine (bene di lusso accessibile a forte carica emozionale):
- **Lunedì – Mercoledì (Fase a Basso Tasso di Conversione)**:
  * Alto carico lavorativo e cognitivo.
  * Navigazione TikTok rapida e distratta durante spostamenti o pause brevi.
  * Forte resistenza a estrarre la carta di credito per acquisti da 120€-180€; carrelli abbandonati superiori all'85%.
- **Giovedì – Venerdì (Pianificazione del Weekend & Shopping Serale)**:
  * Decompressione settimanale, accredito stipendi e pianificazione degli eventi del weekend.
  * L'utente dedica tempo a navigare sull'e-commerce e a valutare parure e regali.
- **Sabato – Domenica (Weekend Leisure & Picco Assoluto)**:
  * La **Domenica sera, specialmente tra le 18:00 e le 23:30**, rappresenta il picco statistico nazionale di conversioni e-commerce in Italia. Gli utenti navigano rilassati da casa e finalizzano gli acquisti pianificati nei giorni precedenti.

---

## 3.5 Tabella di Dayparting Orario & Schedulazione Automatica
Per evitare spreco di impression nelle ore notturne o al mattino presto, la Burst Strategy impone la seguente schedulazione oraria nativa:

| Giorno | Finestra Oraria Attiva | Ore Totali | Focus Strategico |
| :--- | :--- | :---: | :--- |
| **Lunedì** | **SPENTO (Nessuna erogazione)** | 0 h | Azzeramento dispersione feriale. |
| **Martedì** | **SPENTO (Nessuna erogazione)** | 0 h | Preservazione liquidità pubblicitaria. |
| **Mercoledì** | **SPENTO (Nessuna erogazione)** | 0 h | Standby per potenziale scaling futuro. |
| **Giovedì** | **18:00 – 23:30** | 5.5 h | Relax serale, pianificazione weekend, payday. |
| **Venerdì** | **18:00 – 23:30** | 5.5 h | Dopocena, shopping emotivo e regalo partner. |
| **Sabato** | **11:00 – 23:30** | 12.5 h | Tempo libero, outfit inspiration e social shopping. |
| **Domenica** | **11:00 – 23:30** | 12.5 h | **Peak Window assoluta (dalle 18:00 alle 23:30)**. |

**Totale Ore Erogazione:** 36 ore settimanali a massima concentrazione.

### Modalità di Impostazione: Dayparting Programmato (Zero Switch Manuale)
Non spegnere e riaccendere l'Ad Group manualmente ogni settimana: lo spegnimento manuale prolungato per più di 48 ore resetta la fase di apprendimento dell'algoritmo.
- In TikTok Ads Manager -> Ad Group -> **Budget e Programmazione**:
  - Selezionare **Orario specifico (Dayparting)** anziché "Tutto il giorno".
  - Nella matrice 7x24, colorare in blu unicamente i blocchi: Giovedì (18-24), Venerdì (18-24), Sabato (11-24), Domenica (11-24).
  - Lasciare vuoti tutti gli altri orari e le giornate Lunedì-Mercoledì.
  - L'Ad Group rimarrà formalmente `Attivo` senza interruzioni di apprendimento, erogando i 20€ giornalieri unicamente nelle ore ad alta conversione.

### ⚠️ Configurazione Mandataria del Fuso Orario dell'Account Pubblicitario:
Il TikTok Ad Account aziendale deve essere tassativamente configurato con il fuso orario:
$$\mathbf{(GMT+01:00)\text{ Europe/Rome (Ora di Roma / CET / CEST)}}$$

> **PERICOLO DISALLINEAMENTO DAYPARTING**:  
> In TikTok Ads Manager, la griglia oraria di Dayparting fa riferimento esclusivo al fuso orario impostato a livello di Ad Account (e non all'ora locale del singolo utente raggiunto). Se l'account fosse configurato su fusi predefiniti UTC o USA (es. Pacific Time o Eastern Time), la finestra 18:00–23:30 scatterebbe nelle prime ore del mattino o in piena notte sul mercato italiano, distruggendo il rendimento e disperdendo il budget in orari a tasso di conversione nullo. Verificare preliminarmente l'impostazione in *Ads Manager -> Impostazioni Account -> Fuso Orario*.

---

## 3.6 Targeting Demografico Qualificato & Esclusione Tassativa 13-17 Anni

```
  ┌────────────────────────────────────────────────────────────────────────┐
  │         ESCLUSIONE TASSATIVA DELLA FASCIA MINORENNI (13-17 ANNI)       │
  ├────────────────────────────────────────────────────────────────────────┤
  │ • Zero Potere d'Acquisto: Nessuna carta di credito autonoma per ordini │
  │   da 120€ - 180€.                                                      │
  │ • Vanity Trap di Piattaforma: La fascia 13-17 ha un altissimo tasso di │
  │   swipe e click curiosi, generando CTR apparentemente stellari (3%) ma │
  │   un rimbalzo al 95% su e-commerce.                                    │
  │ • Cannibalizzazione del Budget: L'algoritmo Lowest Cost dirotterebbe   │
  │   il 70% della spesa su questa fascia, bruciando i 20€/gg senza vendite│
  │                                                                        │
  │ >> REGOLA: DESELEZIONARE SEMPRE LA CASELLA 13-17 IN OGNI AD GROUP. <<  │
  └────────────────────────────────────────────────────────────────────────┘
```

---

## 3.7 Segmentazione Cluster A (Donne 22-54) e Cluster B (Uomini 25-45 Gifting)

### CLUSTER A: Donne 22-54 Anni (Self-Reward & Old Money Demi-Fine)
- **Motivazione d'Acquisto**: Autogratificazione (*"Merito di brillare"*), gioiello di classe da indossare ogni giorno senza paura che annerisca sotto la doccia o al mare.
- **Parametri Ads Manager**:
  * *Geolocalizzazione*: Italia (tutto il territorio).
  * *Genere*: Donna.
  * *Fasce d'Età*: `25-34`, `35-44`, `45-54` (opzionale `18-24` solo in split test per pezzi entry-level).
  * *Interessi*: Gioielli, Beni di lusso, Accessori moda, Old Money Aesthetic, Quiet Luxury.
  * *Comportamenti*: E-Commerce Shoppers (utenti che hanno completato acquisti online nella categoria Fashion/Accessories negli ultimi 30 giorni).
  * *Prodotti Chiave*: **Set Isabel Rose (A145)**, Anello Solitario Moissanite, Bracciale Tennis 3mm.

### CLUSTER B: Uomini 25-45 Anni (Gifting & Soluzione Regalo Perfetta)
- **Motivazione d'Acquisto**: Risolvere l'ansia del regalo per anniversari, compleanni o ricorrenze; fare un figurone garantito senza rischio di sbagliare confezione o misura.
- **Parametri Ads Manager**:
  * *Geolocalizzazione*: Italia.
  * *Genere*: Uomo.
  * *Fasce d'Età*: `25-34`, `35-44` (uomini economicamente stabili con relazioni consolidate).
  * *Interessi*: Regali e feste, Gioielli raffinati, Orologi e beni di lusso, Romantico e anniversari.
  * *Leve Comunicative*: Cofanetto regalo in velluto incluso, certificato di garanzia con sigillo in ceralacca, spedizione 24/48h anonima e sicura, reso garantito.
  * *Prodotti Chiave*: Parure complete, Bracciali Tennis, Collane Punto Luce.

---

## 3.8 Matrice Rigorosa di Decision-Making: Codici KILL-01..05 & Protocolli di Scale

### Matrice delle Regole di Spegnimento Immediato (Kill Rules):

| Codice Regola | Trigger Temporale / Spesa | Metrica Rilevata | Diagnosi del Problema | Azione Correttiva Immediata |
| :---: | :---: | :---: | :---: | :---: |
| **KILL-01** | Primi **10,00 €** spesi (o 1.000 impression) | **Hook Rate < 30%** e **CTR < 0.60%** | Il gancio visivo iniziale non arresta lo scorrimento del feed. | **SPEGNERE IMMEDIATAMENTE l'annuncio**. Sostituire con un hook visivo più incisivo (flash macro). |
| **KILL-02** | Primi **20,00 €** spesi (fine Giorno 1) | **(Spesa >= 20,00 €) AND (CTR < 0.70%) AND (CPC > 0.85 €)** (con meno di 20 clic generati) | Basso indice di pertinenza dell'asta o creatività non performante. | **SPEGNERE l'Ad Group**. Verificare che l'età 13-17 sia esclusa e allargare leggermente gli interessi. |
| **KILL-03** | Primi **20,00 € – 30,00 €** spesi | **35+ Clic al sito ma ZERO AddToCart** | Attrito evidente sulla pagina prodotto (prezzo percepito, velocità mobile). | **PAUSA CAMPAGNA**. Testare velocità mobile di `isabelpepe.com`, layout scheda e chiarezza della CTA. |
| **KILL-04** | Al raggiungimento di **40,00 €** spesi (Giorno 2) | **Cost per AddToCart > 14.00 €** (oppure 0 carrelli) | Costo di acquisizione carrello insostenibile rispetto ai margini operativi. | **SPEGNERE DEFINITIVAMENTE l'Ad Group**. Il video non converte su scala paid. |
| **KILL-05** | Al termine della Burst (**80,00 €** spesi) | 10+ Carrelli registrati ma **ZERO Checkout Avviati / Ordini** | Attrito nel flusso transazionale (es. spese di spedizione inattese o dubbi sui pagamenti). | **STOP SPESA ADV**. Intervento prioritario sul checkout Stripe prima di riattivare il traffico. |

> **IMMUNITÀ AI PICCHI CPM MACROECONOMICI (Regola di Salvaguardia KILL-02)**:  
> Poiché $\text{CPC} = \frac{\text{CPM}}{1000 \times \text{CTR}}$, durante periodi di forte inflazione dell'asta su TikTok (es. Black Friday, Q4, festività nazionali o congestionamento del weekend con $\text{CPM} > 8{,}00\text{ €}$), il CPC può temporaneamente superare la soglia di 0.85 € anche in presenza di un video altamente attrattivo.  
> **Clausola di Salvaguardia**: Se il **CTR è $\ge 0.90\%$** (a conferma dell'elevata pertinenza creativa e dell'interesse genuino dell'audience), **NON spegnere l'annuncio per il solo CPC elevato**. In questo scenario il costo per clic riflette una contingenza macroeconomica temporanea della domanda pubblicitaria e non un deficit del contenuto creativo.

### Protocollo di Scaling Progressivo:
Quando un video Spark Ads supera le soglie e dimostra sostenibilità economica, si attiva la procedura di incremento:

```
                  FLUSSO DI SCALING PROGRESSIVO ISABEL PEPE
                  
  [BURST STANDARD]              [SCALE ORIZZONTALE]             [SCALE VERTICALE]
  Giovedì - Domenica    -->     Mercoledì - Domenica    -->     Budget +20%
  20€/giorno = 80€/sett         20€/giorno = 100€/sett          24€/giorno = 120€/sett
  ROAS >= 3.0x (14gg)           Stabilità confermata            Mantenimento CPA
```

1. **Scale Orizzontale (Estensione al Mercoledì su Finestra Mobile a 14 Giorni)**:
   - *Condizione*: L'Ad Group mantiene **ROAS $\ge 3.0\text{x}$** e **Cost per AddToCart $\le 6.00\text{ €}$** valutati su una **finestra mobile di 14 giorni (2 cicli consecutivi di burst, pari a 160,00 € totali spesi)** generando almeno 2-3 ordini e-commerce.
   - *Mitigazione della Varianza Stocastica di Poisson*: Con un budget di 80 € a ciclo e un CPC medio di 0.65 € (~123 clic), ipotizzando un tasso di conversione (CVR) fisiologico dell'1.0% per gioielleria demi-fine su traffico freddo, il numero atteso di ordini per singola burst è pari a $\lambda = 1.23$. La probabilità di Poisson di registrare $\ge 2$ ordini su una sola burst è appena del **34.8%**, implicando che nel 65.2% dei casi un video profittevole rischierebbe di essere bloccato per pura varianza statistica del campione ridotto. Estendendo l'orizzonte a **14 giorni (160 € di spesa, ~246 clic, $\lambda = 2.46$)**, la probabilità $P(\ge 2 \text{ ordini})$ sale a oltre il **70.5%**, garantendo decisioni di scaling robuste ed esenti da rumore casuale.
   - *Azione*: Estendere il Dayparting al Mercoledì (18:00 - 23:30). La settimana passa da 4 a **5 giorni di burst** e il budget settimanale sale a **100,00 €**. L'algoritmo non subisce shock di budget giornaliero mantenendo l'erogazione costante.
2. **Scale Verticale (Incremento Conservativo del +20%)**:
   - *Condizione*: La campagna a 5 giorni mantiene un ROAS $\ge 3.0\text{x}$ stabile per due settimane consecutive.
   - *Azione*: Aumentare il budget giornaliero dell'Ad Group del **+20%**: da 20,00 € a **24,00 € al giorno** (spesa settimanale su 5 giorni: 120,00 €). Mai aumentare il budget di oltre il 20-25% ogni 72 ore per preservare la stabilità d'asta.
3. **Winner Stacking (Rinnovamento Creativo Continuo)**:
   - Quando un video comincia a mostrare segni di stanchezza creativa (frequenza $> 2.2$ e CTR in calo), affiancare un secondo Ad Group con un nuovo codice Spark Ads autorizzato proveniente dalla validazione organica.

---

# PARTE IV: R3 — FUNNEL E-COMMERCE & TRACCIAMENTO TIKTOK PIXEL SU NEXT.JS

## 4.1 Architettura del Funnel a Due Stadi (TOFU -> BOFU)
Il funnel di vendita di Isabel Pepe separa nettamente la fase di qualificazione dell'interesse (Top of Funnel) dalla fase di chiusura commerciale ad alta marginalità (Bottom of Funnel):

```
                    ┌──────────────────────────────────────────────┐
                    │ STAGE 1: Top of Funnel (TOFU)                │
                    │ - Video Organici ad alto ingaggio            │
                    │ - Spark Ads su creatività validate           │
                    │ - KPI: Hook >= 50%, Retention >= 50%, Save >= 1.5% │
                    └──────────────────────┬───────────────────────┘
                                           │
                                           ▼
                    ┌──────────────────────────────────────────────┐
                    │ QUALIFIED AUDIENCE GENERATION (TikTok Ads)   │
                    │ 1. Video Views >= 50% (Retention qualificata) │
                    │ 2. Engaged & Video Savers (Wishlist proxy)    │
                    │ 3. Website Visitors (Pixel ViewContent/Cart) │
                    └──────────────────────┬───────────────────────┘
                                           │
                                           ▼
                    ┌──────────────────────────────────────────────┐
                    │ STAGE 2: Bottom of Funnel (BOFU)             │
                    │ - Campagna Web Conversions (Retargeting)     │
                    │ - Offerta: CompletePayment (fallback AddToCart)│
                    │ - Trigger: Cofanetto Velluto Omaggio,        │
                    │   Spedizione 48h Gratis, Garanzia 24 Mesi    │
                    │ - Esclusione: Acquirenti ultimi 180 giorni   │
                    └──────────────────────┬───────────────────────┘
                                           │
                                           ▼
                                [ ACQUISTO SU STRIPE ]
```

## 4.2 Configurazione Custom Audiences & Esclusioni su TikTok Ads Manager
All'interno di TikTok Ads Manager (*Assets -> Audiences -> Create Audience -> Custom Audience*):

1. **`CA_TT_VideoViews_50Plus_Last30D` (Audience Spettatori Qualificati)**:
   - *Origine*: Engagement -> Video Views.
   - *Criterio*: Utenti che hanno visualizzato **almeno il 50% del video** o lo hanno completato al 100%.
   - *Finestra di Conservazione*: 30 giorni (e archivio a 60 giorni per periodi festivi).
2. **`CA_TT_Profile_Engaged_Savers_Last60D` (Audience Wishlist & Alto Intento)**:
   - *Origine*: Engagement -> TikTok Account.
   - *Criterio*: Utenti che hanno **salvato uno o più video** o interagito con il profilo `@isabel.pepe88`.
   - *Finestra di Conservazione*: 60 giorni.
3. **`WCA_Website_Visitors_30D` & `WCA_AddToCart_7D` (Audience E-Commerce)**:
   - *Origine*: Website Traffic (TikTok Pixel).
   - *Criterio*: Visitatori di `isabelpepe.com` e utenti che hanno scatenato l'evento `AddToCart` senza acquistare.
4. **`WCA_CompletePayment_180D` (ESCLUSIONE TASSATIVA NEGATIVE AUDIENCE)**:
   - *Criterio*: Utenti che hanno completato un acquisto negli ultimi 180 giorni.
   - *Azione*: **Escludere categoricamente da tutti i gruppi BOFU** per non sprecare budget su chi ha già acquistato e preservare l'eleganza del brand.

## 4.3 Strategia di Ottimizzazione: CompletePayment vs AddToCart Fallback
- **Regime Ordinario**: Obiettivo Campagna = **Conversions**, Evento di Ottimizzazione = **`CompletePayment`**. L'algoritmo di TikTok cerca profili con storico di spesa su carta di credito.
- **Learning Phase Fallback (Avviamento)**: Se nelle prime due settimane il singolo Ad Group non raggiunge la soglia critica di **50 transazioni settimanali** (necessarie a TikTok per stabilizzare l'apprendimento d'asta), commutare temporaneamente l'evento di ottimizzazione su **`AddToCart`**. Una volta raggiunto un volume solido di carrelli e acquisti, riportare l'evento primario su `CompletePayment`.

---

## 4.4 Implementazione Tecnica Next.js 16 App Router (Codice Completo Type-Safe)
La codebase di `isabelpepe.com` utilizza Next.js 16.2.4 con React 19. Per garantire il tracciamento privo di errori e pienamente compatibile con le transizioni Single Page Application (SPA), di seguito vengono fornite le implementazioni definitive file per file.

### 1. Definizione Tipi TypeScript: `types/tiktok.d.ts`
Creare il file `types/tiktok.d.ts`:

```typescript
// =========================================================================
// ISABEL PEPE - TIKTOK PIXEL TYPESCRIPT DEFINITIONS (HARDENED)
// File: types/tiktok.d.ts
// =========================================================================

export interface TikTokIdentifyParams {
  email?: string;
  phone_number?: string;
  external_id?: string;
}

export interface TikTokContentItem {
  content_id: string;
  content_type: 'product' | 'product_group';
  content_name?: string;
  quantity?: number;
  price?: number;
}

export interface TikTokEventParams {
  content_id?: string;
  content_type?: string;
  content_name?: string;
  content_category?: string;
  quantity?: number;
  price?: number;
  value?: number;
  currency?: string;
  order_id?: string;
  contents?: TikTokContentItem[];
  description?: string;
  query?: string;
  [key: string]: unknown;
}

export interface TikTokEventOptions {
  event_id?: string;
  [key: string]: unknown;
}

export interface TikTokQueue {
  (action: string, ...args: unknown[]): void;
  page: (options?: TikTokEventOptions) => void;
  track: (event: string, params?: TikTokEventParams, options?: TikTokEventOptions) => void;
  identify: (params: TikTokIdentifyParams) => void;
  load: (pixelId: string, options?: unknown) => void;
  instances: () => unknown[];
  holdConsent: () => void;
  grantConsent: () => void;
  revokeConsent: () => void;
  enableCookie: () => void;
  disableCookie: () => void;
  _i?: Record<string, unknown>;
  methods?: string[];
}

declare global {
  interface Window {
    ttq?: TikTokQueue;
    TiktokAnalyticsObject?: string;
  }
}

export {};
```

---

### 2. Modulo Helper & Advanced Matching: `lib/tiktok-pixel.ts`
Creare il file `lib/tiktok-pixel.ts`. Questo modulo implementa l'hashing crittografico SHA-256 via Web Crypto API nativa con **fallback automatico bitwise pure-JS a 32-bit** (garantendo che nessun PII venga mai trasmesso in chiaro anche in assenza di SubtleCrypto), normalizza i numeri di telefono in formato internazionale E.164, applica il controllo preventivo del consenso marketing a tutte le funzioni e protegge la persistenza `sessionStorage` dalle restrizioni di Safari Private Browsing:

```typescript
// =========================================================================
// ISABEL PEPE - TIKTOK PIXEL CLIENT HELPER & ADVANCED MATCHING (HARDENED)
// File: lib/tiktok-pixel.ts
// =========================================================================

import {
  TikTokContentItem,
  TikTokEventParams,
  TikTokEventOptions,
  TikTokIdentifyParams,
} from '@/types/tiktok';

export const TIKTOK_PIXEL_ID = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID || '';

/**
 * Verifica dinamica se il consenso marketing è concesso nel localStorage
 */
export function hasActiveMarketingConsent(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const saved = localStorage.getItem('isabel_pepe_cookie_consent');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed?.categories?.marketing === true;
    }
  } catch {
    return false;
  }
  return false;
}

/**
 * Fallback puro JavaScript a 32-bit per il calcolo di SHA-256 standard.
 * Garantisce hashing crittografico sicuro anche in assenza di window.crypto.subtle
 * (es. ambienti dev HTTP, localhost non-HTTPS, webview restrittive).
 */
function pureJsSha256(str: string): string {
  const ascii = unescape(encodeURIComponent(str));
  const rightRotate = (value: number, amount: number) =>
    (value >>> amount) | (value << (32 - amount));

  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  const words: number[] = [];
  const asciiBitLength = ascii.length * 8;

  let hash: number[] = [];
  const k: number[] = [];
  let primeCounter = 0;

  const isPrime = (candidate: number) => {
    for (let factor = 2; factor <= Math.sqrt(candidate); factor++) {
      if (candidate % factor === 0) return false;
    }
    return true;
  };

  for (let candidate = 2; primeCounter < 64; candidate++) {
    if (isPrime(candidate)) {
      if (primeCounter < 8) {
        hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
      }
      k[primeCounter] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
      primeCounter++;
    }
  }

  words[asciiBitLength >> 5] |= 0x80 << (24 - (asciiBitLength % 32));
  words[(((asciiBitLength + 64) >> 9) << 4) + 15] = asciiBitLength;

  for (let i = 0; i < ascii.length; i++) {
    words[i >> 2] |= ascii.charCodeAt(i) << (24 - (i % 4) * 8);
  }

  for (let j = 0; j < words.length; j += 16) {
    const w = words.slice(j, j + 16);
    const oldHash = hash.slice(0);

    for (let i = 0; i < 64; i++) {
      const w15 = w[i - 15], w2 = w[i - 2];
      const s0 = rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3);
      const s1 = rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10);
      w[i] = (i < 16) ? (w[i] || 0) : ((w[i - 16] + s0 + w[i - 7] + s1) | 0);

      const s1_h = rightRotate(hash[4], 6) ^ rightRotate(hash[4], 11) ^ rightRotate(hash[4], 25);
      const ch = (hash[4] & hash[5]) ^ (~hash[4] & hash[6]);
      const temp1 = (hash[7] + s1_h + ch + k[i] + w[i]) | 0;
      const s0_h = rightRotate(hash[0], 2) ^ rightRotate(hash[0], 13) ^ rightRotate(hash[0], 22);
      const maj = (hash[0] & hash[1]) ^ (hash[0] & hash[2]) ^ (hash[1] & hash[2]);
      const temp2 = (s0_h + maj) | 0;

      hash = [(temp1 + temp2) | 0, hash[0], hash[1], hash[2], (hash[3] + temp1) | 0, hash[4], hash[5], hash[6]];
    }

    for (let i = 0; i < 8; i++) {
      hash[i] = (hash[i] + oldHash[i]) | 0;
    }
  }

  let result = '';
  for (let i = 0; i < 8; i++) {
    for (let j = 3; j >= 0; j--) {
      const b = (hash[i] >> (j * 8)) & 255;
      result += (b < 16 ? '0' : '') + b.toString(16);
    }
  }
  return result;
}

/**
 * Calcola l'hash SHA-256 esadecimale standard.
 * Prioritizza la Web Crypto API nativa del browser e degrada in modo trasparente
 * sul fallback bitwise pure-JS se subtle non è disponibile.
 * FAIL-SAFE: Non restituisce MAI il testo in chiaro e rigetta stringhe vuote/whitespace.
 */
export async function sha256Hex(plainText: string): Promise<string> {
  if (!plainText || typeof plainText !== 'string') return '';
  const trimmed = plainText.trim();
  if (trimmed.length === 0) return '';

  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(trimmed);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[TikTok Pixel] SubtleCrypto digest failed, fallback to pure-JS SHA-256:', err);
      }
      return pureJsSha256(trimmed);
    }
  }

  // Fallback sicuro pure-JS (mai esporre plainText in chiaro!)
  return pureJsSha256(trimmed);
}

/**
 * Normalizza il recapito telefonico nel formato internazionale E.164 (+39...)
 */
export function normalizePhoneE164(rawPhone: string): string {
  if (!rawPhone || typeof rawPhone !== 'string') return '';
  let cleaned = rawPhone.trim().replace(/[^\d+]/g, '');
  if (!cleaned) return '';

  // Assicura al massimo un unico '+' iniziale
  if (cleaned.includes('+')) {
    cleaned = '+' + cleaned.replace(/\+/g, '');
  }

  if (cleaned.startsWith('00')) {
    cleaned = '+' + cleaned.slice(2);
  } else if (!cleaned.startsWith('+')) {
    if (cleaned.startsWith('39') && cleaned.length >= 11 && cleaned.length <= 13) {
      cleaned = '+' + cleaned;
    } else if (cleaned.length >= 9 && cleaned.length <= 11) {
      cleaned = '+39' + cleaned;
    } else {
      cleaned = '+' + cleaned;
    }
  }

  // Verifica standard E.164 (+ seguito da 7 a 15 cifre numeriche)
  if (!/^\+[1-9]\d{6,14}$/.test(cleaned)) {
    return '';
  }

  return cleaned;
}

/**
 * Invia l'evento ttq.page() durante le transizioni di rotta in SPA
 */
export function trackTikTokPageView(): void {
  if (typeof window === 'undefined' || !window.ttq) return;
  if (!hasActiveMarketingConsent()) return;

  try {
    window.ttq.page();
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[TikTok Pixel] Errore PageView:', err);
    }
  }
}

/**
 * Invia identificatori cliente con hashing SHA-256 (Advanced Matching)
 */
export async function identifyTikTokUser(params: {
  email?: string;
  phone?: string;
  visitorId?: string;
}): Promise<void> {
  if (typeof window === 'undefined' || !window.ttq) return;
  if (!hasActiveMarketingConsent()) return;

  try {
    const identifyPayload: TikTokIdentifyParams = {};

    if (params.email && typeof params.email === 'string') {
      const cleanEmail = params.email.trim().toLowerCase();
      if (cleanEmail.length > 0 && cleanEmail.includes('@')) {
        const hash = await sha256Hex(cleanEmail);
        if (hash) identifyPayload.email = hash;
      }
    }

    if (params.phone && typeof params.phone === 'string') {
      const cleanPhone = normalizePhoneE164(params.phone);
      if (cleanPhone) {
        const hash = await sha256Hex(cleanPhone);
        if (hash) identifyPayload.phone_number = hash;
      }
    }

    if (params.visitorId && typeof params.visitorId === 'string') {
      const cleanVisitor = params.visitorId.trim();
      if (cleanVisitor.length > 0) {
        const hash = await sha256Hex(cleanVisitor);
        if (hash) identifyPayload.external_id = hash;
      }
    }

    if (Object.keys(identifyPayload).length > 0) {
      window.ttq.identify(identifyPayload);
    }
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[TikTok Pixel] Errore Identify:', err);
    }
  }
}

/**
 * Helper generico per invio eventi standard protetto da controllo consenso e try/catch
 */
export function trackTikTokEvent(
  eventName: string,
  params?: TikTokEventParams,
  options?: TikTokEventOptions
): void {
  if (typeof window === 'undefined' || !window.ttq) return;
  if (!hasActiveMarketingConsent()) return;

  try {
    window.ttq.track(eventName, params, options);
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[TikTok Pixel] Errore evento ${eventName}:`, err);
    }
  }
}

// -------------------------------------------------------------------------
// SHORTCUT OPERATIVI PER EVENTI E-COMMERCE
// -------------------------------------------------------------------------

export function trackTikTokViewContent(product: {
  id: string;
  name: string;
  price: number;
  category?: string;
}): void {
  trackTikTokEvent('ViewContent', {
    content_id: product.id,
    content_type: 'product',
    content_name: product.name,
    content_category: product.category || 'Gioielli',
    price: Number(product.price),
    value: Number(product.price),
    currency: 'EUR',
  });
}

export function trackTikTokAddToCart(item: {
  id: string;
  name: string;
  price: number;
  quantity?: number;
}): void {
  const qty = item.quantity || 1;
  trackTikTokEvent('AddToCart', {
    content_id: item.id,
    content_type: 'product',
    content_name: item.name,
    quantity: qty,
    price: Number(item.price),
    value: Number((item.price * qty).toFixed(2)),
    currency: 'EUR',
  });
}

export function trackTikTokInitiateCheckout(
  items: { id: string; name: string; price: number; quantity: number }[],
  totalValue: number
): void {
  const contents: TikTokContentItem[] = items.map((i) => ({
    content_id: i.id,
    content_type: 'product',
    content_name: i.name,
    quantity: i.quantity,
    price: Number(i.price),
  }));

  trackTikTokEvent('InitiateCheckout', {
    contents,
    value: Number(totalValue.toFixed(2)),
    currency: 'EUR',
  });
}

export function trackTikTokCompletePayment(order: {
  orderId: string;
  total: number;
  items?: { id: string; name: string; price: number; quantity: number }[];
}): void {
  if (!order || !order.orderId) return;

  // Guardia anti-duplicazione protetta da try/catch contro Safari Private Mode
  if (typeof window !== 'undefined') {
    try {
      const storageKey = `isabel_tt_payment_${order.orderId}`;
      if (sessionStorage.getItem(storageKey)) {
        return;
      }
      sessionStorage.setItem(storageKey, 'true');
    } catch {
      // In modalità privata (Safari Private Browsing) o storage disabilitato,
      // l'eccezione SecurityError viene intercettata senza bloccare il tracciamento
    }
  }

  const contents: TikTokContentItem[] = (order.items || []).map((i) => ({
    content_id: i.id,
    content_type: 'product',
    content_name: i.name,
    quantity: i.quantity,
    price: Number(i.price),
  }));

  // Invia event_id nelle opzioni per la deduplicazione nativa TikTok Events API
  trackTikTokEvent(
    'CompletePayment',
    {
      order_id: order.orderId,
      value: Number(order.total.toFixed(2)),
      currency: 'EUR',
      contents: contents.length > 0 ? contents : undefined,
    },
    { event_id: order.orderId }
  );
}
```

---

### 3. Componente Client Next.js: `components/TikTokPixel.tsx`
Creare il file `components/TikTokPixel.tsx`. Questo componente gestisce l'inizializzazione non-bloccante (`strategy="afterInteractive"`), l'idempotenza `ttq._i[pixelId]` per evitare doppie inizializzazioni, il cambio rotta in SPA basato unicamente su `pathname` (evitando pageview spuri su filtri query string), l'incapsulamento protetto in `<Suspense fallback={null}>` per conformità con Next.js 16 App Router, e la gestione dinamica del consenso GDPR con **revoca attiva** (`revokeConsent()`, `disableCookie()` ed eliminazione immediata dei cookie di tracciamento `_ttp` e `_ttclid`):

```tsx
'use client';

// =========================================================================
// ISABEL PEPE - TIKTOK PIXEL INTEGRATION COMPONENT (HARDENED)
// File: components/TikTokPixel.tsx
// =========================================================================

import { useEffect, useRef, useState, Suspense } from 'react';
import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { TIKTOK_PIXEL_ID, trackTikTokPageView, hasActiveMarketingConsent } from '@/lib/tiktok-pixel';

function TikTokPixelInner() {
  const pathname = usePathname();
  const [hasMarketingConsent, setHasMarketingConsent] = useState(false);
  const isInitialMount = useRef(true);

  // 1. Verifica Consenso Cookie GDPR e Binding al ciclo di vita
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Sincronizzazione iniziale stato consenso
    setHasMarketingConsent(hasActiveMarketingConsent());

    const handleConsentUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{ categories?: { marketing?: boolean } }>;
      const marketing = customEvent.detail?.categories?.marketing;

      if (marketing === true) {
        setHasMarketingConsent(true);
        if (window.ttq?.grantConsent) {
          window.ttq.grantConsent();
        }
      } else if (marketing === false) {
        setHasMarketingConsent(false);
        // Revoca attiva TikTok SDK ed eliminazione cookie _ttp e _ttclid
        if (window.ttq?.revokeConsent) {
          window.ttq.revokeConsent();
        }
        if (window.ttq?.disableCookie) {
          window.ttq.disableCookie();
        }
        // Pulizia esplicita cookie di prima parte _ttp e _ttclid
        document.cookie = '_ttp=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; Max-Age=0;';
        document.cookie = '_ttclid=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; Max-Age=0;';
      }
    };

    window.addEventListener('isabel_cookie_consent', handleConsentUpdate);
    return () => {
      window.removeEventListener('isabel_cookie_consent', handleConsentUpdate);
    };
  }, []);

  // 2. Gestione Transizioni di Rotta SPA (solo su effettivo cambio pathname)
  useEffect(() => {
    if (!hasMarketingConsent) return;

    // Al primo caricamento, il pageview viene inviato dall'inizializzazione dello script
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Su ogni effettivo cambio di percorso in SPA, invia ttq.page()
    trackTikTokPageView();
  }, [pathname, hasMarketingConsent]);

  // Se il Pixel ID non è configurato o l'utente non ha prestato consenso marketing, non montare nulla
  if (!TIKTOK_PIXEL_ID || !hasMarketingConsent) {
    return null;
  }

  return (
    <Script
      id="tiktok-pixel-base"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          !function (w, d, t) {
            w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];
            ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"];
            ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};
            for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);
            ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};
            ttq.load=function(e,n){
              var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;
              ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};
              var a=document.createElement("script");
              a.type="text/javascript",a.async=!0,a.src=r+"?sdkid="+e+"&lib="+t;
              var c=document.getElementsByTagName("script")[0];
              c.parentNode.insertBefore(a,c)
            };
            if (!ttq._i || !ttq._i['${TIKTOK_PIXEL_ID}']) {
              ttq.load('${TIKTOK_PIXEL_ID}');
              ttq.page();
            }
          }(window, document, 'ttq');
        `,
      }}
    />
  );
}

export default function TikTokPixel() {
  return (
    <Suspense fallback={null}>
      <TikTokPixelInner />
    </Suspense>
  );
}
```

> **Guida all'Integrazione in `app/layout.tsx` (Next.js 16 Suspense Boundary)**:  
> Analogamente al componente proprietario `<Tracker />`, inserire `<TikTokPixel />` nel body di `app/layout.tsx` avvolto in un boundary `<Suspense fallback={null}>` per preservare la static site generation (SSG) e prevenire de-ottimizzazioni in fase di build:
> ```tsx
> <Suspense fallback={null}>
>   <Tracker />
> </Suspense>
> <Suspense fallback={null}>
>   <TikTokPixel />
> </Suspense>
> ```

---

### 4. Micro-Componente ViewContent: `components/ProductViewTracker.tsx`
Creare il file `components/ProductViewTracker.tsx`. Questo componente client viene inserito nella pagina del prodotto `app/prodotto/[slug]/page.tsx` (Server Component) per scatenare `ViewContent` all'apertura della scheda prodotto:

```tsx
'use client';

// =========================================================================
// ISABEL PEPE - PRODUCT VIEW TRACKER COMPONENT
// File: components/ProductViewTracker.tsx
// =========================================================================

import { useEffect } from 'react';
import { trackTikTokViewContent } from '@/lib/tiktok-pixel';

interface Props {
  product: {
    id: string;
    name: string;
    price: number;
    discount_price?: number | null;
    category?: string;
  };
}

export default function ProductViewTracker({ product }: Props) {
  useEffect(() => {
    const finalPrice =
      product.discount_price && product.discount_price > 0
        ? product.discount_price
        : product.price;

    trackTikTokViewContent({
      id: product.id,
      name: product.name,
      price: finalPrice,
      category: product.category || 'Gioielli',
    });
  }, [product.id, product.name, product.price, product.discount_price, product.category]);

  return null; // Componente invisibile a impatto DOM zero
}
```

---

## 4.5 Mappatura Eventi Standard & Payload JSON

### Evento 1: `ViewContent` (Apertura Scheda Prodotto)
- **Collocazione**: Inserito in `app/prodotto/[slug]/page.tsx` tramite `<ProductViewTracker product={product} />`.
- **Payload Specifico**:
```json
{
  "content_id": "a145-isabel-rose",
  "content_type": "product",
  "content_name": "Set Isabel Rose — Collana e Orecchini Punto Luce",
  "content_category": "Parure",
  "price": 149.00,
  "value": 149.00,
  "currency": "EUR"
}
```

### Evento 2: `AddToCart` (Aggiunta al Carrello)
- **Collocazione**: Inserito in `components/AddToCartButton.tsx` e `components/StickyMobileAddToCart.tsx` all'interno dell'handler di click `handleAddToCart`.
- **Payload Specifico**:
```json
{
  "content_id": "tnn003-silver",
  "content_type": "product",
  "content_name": "Bracciale Tennis Moissanite 3mm Rodio",
  "quantity": 1,
  "price": 129.00,
  "value": 129.00,
  "currency": "EUR"
}
```

### Evento 3: `InitiateCheckout` (Click Procedi al Checkout)
- **Collocazione**: Inserito in `components/CartDrawer.tsx` all'interno di `handleCheckout`, prima del reindirizzamento alla sessione Stripe. Contestualmente viene scatenato `identifyTikTokUser({ email, phone, visitorId })` se i dati di contatto sono già stati inseriti.
- **Payload Specifico**:
```json
{
  "contents": [
    {
      "content_id": "tnn003-silver",
      "content_type": "product",
      "content_name": "Bracciale Tennis Moissanite 3mm Rodio",
      "quantity": 1,
      "price": 129.00
    },
    {
      "content_id": "par012-rhodium",
      "content_type": "product",
      "content_name": "Punto Luce Brera Rodio",
      "quantity": 1,
      "price": 49.00
    }
  ],
  "value": 178.00,
  "currency": "EUR"
}
```

### Evento 4: `CompletePayment` (Conferma Ordine E-Commerce)
- **Collocazione**: Inserito in `app/success/SuccessClient.tsx` all'interno del blocco di risposta positiva di `/api/checkout/confirm`.
- **Payload Specifico**:
```json
{
  "order_id": "e8c2014e-b5c4-4b68-98e9-d3e921d78901",
  "value": 178.00,
  "currency": "EUR",
  "contents": [
    {
      "content_id": "tnn003-silver",
      "content_type": "product",
      "content_name": "Bracciale Tennis Moissanite 3mm Rodio",
      "quantity": 1,
      "price": 129.00
    },
    {
      "content_id": "par012-rhodium",
      "content_type": "product",
      "content_name": "Punto Luce Brera Rodio",
      "quantity": 1,
      "price": 49.00
    }
  ]
}
```

---

## 4.6 Protezione Idempotente su CompletePayment (`sessionStorage` & Resilienza Safari)
Per impedire che il Pixel registri conversioni duplicate qualora il cliente ricarichi la pagina `/success?session_id=...` o vi acceda nuovamente dalla cronologia/preferiti del browser:
1. **Deduplicazione Client-Side via `sessionStorage`**: La funzione `trackTikTokCompletePayment` in `lib/tiktok-pixel.ts` memorizza la chiave univoca `isabel_tt_payment_${orderId}`. Se la transazione è già stata tracciata nella sessione corrente, la chiamata viene interrotta istantaneamente.
2. **Resilienza alle Restrizioni di Safari Private Browsing (`try...catch`)**: In ambienti di navigazione anonima (iOS Safari Private Mode) o con impostazioni restrittive anti-tracciamento, l'accesso diretto a `sessionStorage` scatena un'eccezione non gestita di tipo `SecurityError: The operation is insecure`. Nel codice implementato, l'accesso allo storage è integralmente avvolto in un blocco `try...catch`: qualora lo storage sia inaccessibile, l'errore viene neutralizzato e l'evento di conversione viene comunque inviato a TikTok senza causare crash sull'interfaccia cliente di `/success`.
3. **Deduplicazione Server/Client con `event_id`**: Contestualmente al payload standard, l'evento `CompletePayment` trasmette l'opzione `{ event_id: order.orderId }`. Questo parametro consente a TikTok Events Manager di deduplicare in modo perfetto l'evento con il rispettivo tracciamento server-side emesso da `lib/tiktok-events-api.ts`.

---

## 4.7 Conformità GDPR & Binding Dinamico con `CookieBanner.tsx`
Nel pieno rispetto del Regolamento UE 2016/679 (GDPR) e delle Linee Guida del Garante Privacy italiano (Luglio 2021):
1. **Nessun Tracciamento Preventivo**: Il tag TikTok Pixel non viene caricato finché l'utente non esprime il consenso esplicito alla categoria `marketing`. Se il consenso non è concesso, `<TikTokPixel />` restituisce `null` e nessun asset ByteDance viene scaricato.
2. **Controllo Preventivo su Tutti gli Helper (`hasActiveMarketingConsent`)**: Ogni funzione di tracciamento in `lib/tiktok-pixel.ts` (`trackTikTokPageView`, `identifyTikTokUser`, `trackTikTokEvent`, `trackTikTokAddToCart`, etc.) verifica preliminarmente `hasActiveMarketingConsent()`. Anche se il metodo venisse invocato programmaticamente prima del consenso o dopo una revoca, nessun pacchetto di telemetria viene inviato ai server TikTok.
3. **Attivazione Dinamica Istantanea**: All'accettazione dei cookie nel banner, viene emesso l'evento `window.dispatchEvent(new CustomEvent('isabel_cookie_consent', { detail: { categories: { marketing: true } } }))`. Il componente `TikTokPixel.tsx` riceve il segnale, chiama `window.ttq.grantConsent()`, monta lo script via Next.js Script e avvia la telemetria senza richiedere il ricaricamento del browser.
4. **Revoca Attiva e Distruzione dei Cookie (`revokeConsent` & Purge)**: Qualora l'utente revochi il consenso marketing dal pannello delle preferenze:
   - Viene invocato il metodo SDK nativo `window.ttq.revokeConsent()`.
   - Viene disabilitata l'emissione dei cookie con `window.ttq.disableCookie()`.
   - Vengono cancellati immediatamente dal browser i cookie first-party `_ttp` e `_ttclid` sovrascrivendoli con data di scadenza passata (`Expires=Thu, 01 Jan 1970 00:00:01 GMT; Max-Age=0;`).
   - Lo stato locale `hasMarketingConsent` commuta su `false`, bloccando all'istante ogni ulteriore tracciamento.

---

## 4.8 Protocollo di Validazione QA in 4 Fasi
Prima del lancio definitivo delle campagne pubblicitarie, eseguire la seguente procedura di collaudo:

```
┌────────────────────────────────────────────────────────────────────────┐
│                      PROTOCOLLO DI VALIDAZIONE QA                      │
├───────────────┬────────────────────────────────────────────────────────┤
│ FASE 1        │ Ispezione con estensione Chrome TikTok Pixel Helper    │
│               │ (Verifica Pageview e assenza di warning o duplicati).  │
├───────────────┼────────────────────────────────────────────────────────┤
│ FASE 2        │ Debug Live in TikTok Events Manager (Test Events Tool) │
│               │ (Flusso: ViewContent -> AddToCart -> CompletePayment). │
├───────────────┼────────────────────────────────────────────────────────┤
│ FASE 3        │ Controllo Event Quality Score (EQS >= 8.5/10)          │
│               │ (Verifica hashing SHA-256 su email e cellulare).       │
├───────────────┼────────────────────────────────────────────────────────┤
│ FASE 4        │ Verifica Attribuzione Cookie First-Party & ttclid      │
│               │ (Presenza cookie _ttp e persistenza parametro URL).    │
└───────────────┴────────────────────────────────────────────────────────┘
```

1. **Fase 1: TikTok Pixel Helper (Google Chrome)**:
   - Aprire una finestra di navigazione in incognito su `isabelpepe.com`.
   - Prima del click sul cookie banner: l'estensione deve mostrare **0 pixel rilevati**.
   - Cliccando su "Accetta Tutti": il Pixel ID deve comparire istantaneamente con spunta verde sull'evento `Pageview`.
2. **Fase 2: Test Events Tool (TikTok Ads Manager)**:
   - In Events Manager -> Test Events, generare l'URL di test.
   - Completare una transazione fittizia: verificare che la console di TikTok mostri in sequenza real-time `ViewContent`, `AddToCart`, `InitiateCheckout` e `CompletePayment` con tutti i parametri monetari corrispondenti.
3. **Fase 3: Event Quality Score (EQS)**:
   - Verificare nella scheda Diagnostics di TikTok Ads Manager che il punteggio EQS per `AddToCart` e `CompletePayment` raggiunga il giudizio **"Good" o "Great" ($\ge 8.5/10$)**, a conferma dell'efficacia dell'Advanced Matching.
4. **Fase 4: Attribuzione Parametro `ttclid` e Cookie `_ttp`**:
   - Visitare `https://www.isabelpepe.com/?ttclid=test_click_id_999`.
   - Verificare nel tab Application dei Developer Tools del browser la corretta scrittura del cookie `_ttp` e la memorizzazione del canale `traffic_channel: 'TikTok'` nella sessione Supabase.

---

# PARTE V: OPERATIONAL LAUNCH ROADMAP (PIANO DI RILASCIO A 4 SETTIMANE)

Il piano operativo scandisce le attività tecniche, creative e di media buying lungo quattro settimane di rilascio controllato:

```
┌─────────────────────────────────────────────────────────────────────────┐
│               OPERATIONAL LAUNCH ROADMAP (4 SETTIMANE)                  │
├───────────────┬─────────────────────────────────────────────────────────┤
│ SETTIMANA 1   │ SETUP TECNICO, IMPLEMENTAZIONE PIXEL & COLLAUDO QA      │
│               │ • Deploy file TikTokPixel.tsx, lib/tiktok-pixel.ts      │
│               │ • Configurazione variabile NEXT_PUBLIC_TIKTOK_PIXEL_ID  │
│               │ • Esecuzione QA Protocol (Pixel Helper + Test Events)   │
├───────────────┼─────────────────────────────────────────────────────────┤
│ SETTIMANA 2   │ SEEDING CREATIVO ORGANICO & CALCOLO CVS SCORE           │
│               │ • Produzione e pubblicazione di 4 video sui 5 pilastri  │
│               │ • Monitoraggio 48-72h (Hook Rate, Retention, Save Rate) │
│               │ • Applicazione formula CVS: selezione del Tier A Winner │
├───────────────┼─────────────────────────────────────────────────────────┤
│ SETTIMANA 3   │ AUTORIZZAZIONE SPARK ADS 365GG & LANCIO 1ª BURST WAVE   │
│               │ • Generazione codice Spark Ads a 365gg da smartphone    │
│               │ • Riscatto in Ads Manager & Setup Ad Group Burst        │
│               │ • Attivazione Giovedì ore 18:00 (20€/gg, Dayparting)    │
├───────────────┼─────────────────────────────────────────────────────────┤
│ SETTIMANA 4   │ ANALISI METRICHE, MATRICE KILL/SCALE & RETARGETING BOFU │
│               │ • Audit indicatori primi 80€ spesi (CTR, CPC, Carrelli) │
│               │ • Attivazione regole KILL-01..05 o Scaling Orizzontale  │
│               │ • Configurazione Custom Audiences TOFU e Retargeting    │
└───────────────┴─────────────────────────────────────────────────────────┘
```

### Dettaglio delle Azioni Settimana per Settimana:

#### SETTIMANA 1: Infrastruttura Tecnica, Pixel Next.js & Collaudo QA
- Integrazione nel repository Next.js dei 4 moduli (`types/tiktok.d.ts`, `lib/tiktok-pixel.ts`, `components/TikTokPixel.tsx`, `components/ProductViewTracker.tsx`).
- Inserimento dell'ID del Pixel aziendale nella dashboard Vercel / file `.env.production` (`NEXT_PUBLIC_TIKTOK_PIXEL_ID`).
- Verifica agganci su bottoni `AddToCartButton.tsx`, drawer `CartDrawer.tsx` e pagina di arrivo `SuccessClient.tsx`.
- Completamento delle 4 fasi del Protocollo QA e conferma dello stato attivo in TikTok Events Manager.

#### SETTIMANA 2: Seeding Creativo Organico & Calcolo CVS Score
- Elena e Mario realizzano e pubblicano sul profilo `@isabel.pepe88` almeno 4 video dedicati ai formati prioritari:
  1. *Video 1*: Flash Shock Moissanite & Diamond Tester (Pilastro 2).
  2. *Video 2*: Unboxing Scrigno Luxury con apertura ASMR e certificato GRA (Pilastro 3).
  3. *Video 3*: Macro punzonatura S925, banco da orafo e panno di pulizia (Pilastro 1).
  4. *Video 4*: Styling bracciale tennis e solitario su modella con manicure nude (Pilastro 4).
- Al raggiungimento delle 1.000 visualizzazioni (48-72h), estrazione dei dati da TikTok Analytics e calcolo del punteggio CVS.
- Identificazione del video con CVS $\ge 85$ (Tier A Winner). Se un video ottiene tra 65 e 84 punti (Tier B), esecuzione immediata dell'Hook Re-Edit.

#### SETTIMANA 3: Autorizzazione Spark Ads 365gg & Lancio 1ª Burst Wave
- Da smartphone: attivazione Ad Authorization sul video Winner, impostazione durata 365 giorni e copia del codice alfanumerico.
- Da TikTok Ads Manager: riscatto del codice in *Creative -> Spark Ads Posts*.
- Creazione della campagna **Web Conversions** denominata `CAMP_CONV_BURST_ISABEL_PEPE_W1`.
- Configurazione Ad Group:
  * Budget giornaliero: **20,00 € / giorno**.
  * Schedulazione: **Dayparting nativo** (Giovedì-Venerdì 18:00-23:30, Sabato-Domenica 11:00-23:30).
  * Targeting: Italia, **Età 13-17 deselezionata**, Cluster A (Donne 25-54) o Cluster B (Uomini 25-45).
  * Ottimizzazione: `CompletePayment` (o `AddToCart` fallback).
- Giovedì ore 18:00: inizio erogazione automatica della prima ondata di burst (80,00 € totali fino a Domenica ore 23:30).

#### SETTIMANA 4: Analisi Metriche, Matrice Kill/Scale & Retargeting BOFU
- Lunedì mattina: analisi completa del rendimento dei primi 80€ spesi.
  * Se CTR < 0.60% o CPC > 0.85€ o zero carrelli: applicazione regole **KILL-01 / KILL-03**, spegnimento dell'annuncio e selezione del secondo video organico in graduatoria.
  * Se ROAS $\ge 3.0\text{x}$ e Cost per AddToCart $\le 6.00\text{ €}$: attivazione **Scale Orizzontale**, estendendo il Dayparting al Mercoledì ore 18:00 (budget settimanale: 100,00 €).
- Popolamento delle prime Custom Audiences in Events Manager:
  * Creazione del segmento `CA_TT_VideoViews_50Plus_Last30D` e `CA_TT_Profile_Engaged_Savers_Last60D`.
- Impostazione del gruppo di retargeting BOFU per chiudere le visite al sito e i carrelli non finalizzati con leva sul cofanetto regalo omaggio e spedizione 24/48h gratuita.

---

# PARTE VI: APPENDICI TECNICHE & LINEE GUIDA PER MARIO ED ELENA

## Quick Reference Card Giornaliera per Mario ed Elena:

```
┌────────────────────────────────────────────────────────────────────────┐
│             PROMEMORIA OPERATIVO QUOTIDIANO ISABEL PEPE                │
├────────────────────────────────────────────────────────────────────────┤
│ 1. NON toccare MAI il pulsante "Promuovi" dentro l'applicazione        │
│    TikTok su smartphone. Usa SOLO Spark Ads da Ads Manager desktop.    │
│ 2. NON usare musiche pop commerciali coperte da copyright non          │
│    commerciale: scegli solo tracce dalla TikTok Commercial Library.    │
│ 3. Controlla sempre che le riprese mostrino:                           │
│    - La luce viva della Moissanite o delle perle.                      │
│    - Lo scrigno regalo rigido con velluto e certificato GRA debossed.  │
│    - La punzonatura S925 e il logo IP.                                 │
│ 4. Assicurati che l'età 13-17 sia SEMPRE SPENTA in ogni gruppo annunci.│
│ 5. I 20€/giorno lavorano SOLO dal Giovedì sera alla Domenica sera:     │
│    il Lunedì, Martedì e Mercoledì l'account riposa senza spendere 1€.  │
│ 6. Se dopo 20€ spesi non vedi almeno un'aggiunta al carrello, FERMATI: │
│    applica la regola KILL-03 e verifica la scheda prodotto sul sito.   │
└────────────────────────────────────────────────────────────────────────┘
```

## Tabella Parametri Esecutivi Pronti all'Uso:

| Parametro Configurazione | Valore Mandatario da Inserire in Piattaforma |
| :--- | :--- |
| **Objective Campagna** | Conversioni Sito Web (Web Conversions) |
| **Ad Format** | Spark Ads (con codice video organico autorizzato a 365 giorni) |
| **URL di Destinazione** | `https://www.isabelpepe.com/prodotto/[slug-gioiello]` |
| **Budget Type** | Daily Budget a livello di Ad Group (ABO): 20,00 € / giorno |
| **Strategia d'Asta** | Lowest Cost (Costo più basso) |
| **Dayparting Settimanale** | Gio-Ven 18:00-23:30 \| Sab-Dom 11:00-23:30 \| Lun-Mer spento |
| **Fuso Orario Ad Account** | `(GMT+01:00) Europe/Rome` (Tassativo per allineamento Dayparting 18:00-23:30) |
| **Targeting Geografico** | Italia (tutto il territorio nazionale) |
| **Fasce d'Età Inserite** | `25-34`, `35-44`, `45-54` (**13-17 categoricamente deselezionata**) |
| **Finestra Attribuzione** | 7-day Click / 1-day View |
| **Tracking Frontend** | TikTok Pixel con Advanced Matching SHA-256 e Cookie Consent GDPR |

---
*Fine del Documento Strategico Master — Isabel Pepe TikTok Media Plan 2026*
