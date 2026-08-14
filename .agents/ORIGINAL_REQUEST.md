# Original User Request

## Initial Request — 2026-07-29T16:28:26Z

Audit omnicomprensivo e report dettagliato per il go-live dell'e-commerce Isabel Pepe. L'obiettivo è mappare tutte le componenti essenziali (prodotti/media, pagamenti, spedizioni, sicurezza, conformità GDPR/legale, SEO e analytics) per garantire un lancio sul mercato sicuro, a norma di legge e con UX impeccabile.

Working directory: c:\Users\mario\Progetti Antigravity\isabel-pepe
Integrity mode: development

## Requirements

### R1. Audit Completo Catalogo Prodotti e Media
Analizzare il catalogo prodotti (database/CMS/codice):
- Identificare quanti e quali prodotti non hanno foto, titoli SEO-friendly, descrizioni complete, prezzi o varianti.
- Verificare la gestione degli asset su Cloudflare R2 / CDN e l'ottimizzazione del caricamento media.

### R2. Audit Pagamenti e Checkout (Stripe & PayPal)
Esaminare l'integrazione di pagamenti e gestione ordini:
- Verificare carrello, flusso di checkout, sicurezza dei webhook e gestione stati ordine.
- Mappare i requisiti tecnici per Stripe (Carte, Apple Pay, Google Pay) e PayPal.

### R3. Audit Logistica e Spedizioni (Poste Italiane)
Mappare i requisiti per la gestione delle spedizioni:
- Regole di calcolo costi di spedizione e soglia per la spedizione gratuita.
- Integrazione API con Poste Italiane per generazione etichette e invio automatico del codice di tracciamento.

### R4. Audit Sicurezza e Protezione Dati
Analisi tecnica delle vulnerabilità e delle configurazioni di sicurezza:
- Gestione sicura delle variabili d'ambiente (API keys, secret Stripe/PayPal/Poste).
- Validazione input, sanitizzazione, protezione da attacchi comuni (CORS, CSRF, Rate Limiting nei form di checkout/contatto).
- Sicurezza nella conservazione dei dati dei clienti e gestione sessioni.

### R5. Audit Conformità GDPR, Legale e Trasparenza
Verifica di tutti i requisiti legali obbligatori per un e-commerce in Italia/UE:
- Footer con dati societari obbligatori (P.IVA, Ragione Sociale, Sede Legale, Capitale Sociale, REA, PEC).
- Pagina Privacy Policy & Cookie Policy a norma GDPR.
- Gestione consensi/cookie (inclusi tracciamenti server-side / legitimate interest dove applicabile).
- Termini e Condizioni di Vendita, Diritto di Recesso (14 giorni), Garanzie e Modalità di Rimborso.

### R6. Audit SEO, Analytics e Performance
Verifica dei requisiti di tracciamento e posizionamento:
- Tracciamento conversioni (Meta Pixel, Google Tag Manager / Analytics / Server-Side tracking).
- Meta tag SEO, OpenGraph, sitemap.xml, robots.txt, gestione 404 e ottimizzazione performance/speed.

### R7. Report di Messa Online e Roadmap Prioritizzata
Produrre un report esaustivo in formato markdown (report_messa_online.md) salvato nella directory di lavoro, organizzato per aree tematiche con checklist operativa e roadmap sequenziale.

## Acceptance Criteria

### Audit Catalogo & Asset
- [ ] Mappa analitica dei prodotti con conteggio e lista esatta dei campi mancanti (Foto, Titoli, Descrizioni, Prezzo, Stock).

### Audit Funzionale & Tecnico
- [ ] Diagnosi dello stato dei flussi di Pagamento (Stripe/PayPal), Spedizioni (Poste Italiane), Sicurezza e Protezione API.

### Audit Legale & GDPR
- [ ] Checklist di conformità legale (Dati societari footer, Privacy Policy, Termini di vendita, Diritto di recesso, Gestione cookie).

### Report & Roadmap Go-Live
- [ ] File report_messa_online.md generato e salvato nella root del progetto, contenente la lista prioritizzata (Priorità High / Medium / Low) di tutte le azioni necessarie prima del lancio ufficiale.
