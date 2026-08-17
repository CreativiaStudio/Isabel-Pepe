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
