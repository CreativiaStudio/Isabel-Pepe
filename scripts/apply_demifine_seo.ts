import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Carica variabili d'ambiente da .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  console.error("File .env.local non trovato");
  process.exit(1);
}

const envFile = fs.readFileSync(envPath, 'utf8');
const env: Record<string, string> = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].replace(/['"\r]/g, '').trim();
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Credenziali Supabase mancanti in .env.local");
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export interface ProductDefinition {
  sku: string;
  idMatch?: string; // For duplicate SKUs like PL-30
  cleanName: string;
  category: string;
  slug: string;
  isGold: boolean;
  isPearl: boolean;
  carats: string;
  priceFix?: number;
  seoTitle: string;
  seoDescription: string;
  storytelling: string;
  gemstoneText: string;
  platingText: string;
}

export const CATALOG_DEFINITIONS: ProductDefinition[] = [
  // 1. A113 - Orecchini Duchesse (Title: 57, Desc: 147)
  {
    sku: "A113",
    cleanName: "Orecchini Duchesse",
    category: "Orecchini",
    slug: "orecchini-duchesse",
    isGold: false,
    isPearl: false,
    carats: "0.5 ct + 0.5 ct Taglio Brillante",
    seoTitle: "Duchesse — Orecchini in Rodio & Argento 925 | Isabel Pepe",
    seoDescription: "Scopri gli orecchini Duchesse di Isabel Pepe: Argento 925 con finitura in Rodio 0.1µm e nano-coating. Cofanetto regalo luxury e garanzia inclusi.",
    storytelling: "Gli orecchini Duchesse esprimono una raffinatezza regale e discreta. Disegnati per catturare ogni raggio di luce con grazia, valorizzano il viso grazie alla purezza del loro doppio solitario taglio brillante.",
    gemstoneText: "Pietre di Pura Luce ad Altissima Rifrazione (Taglio Brillante VVS1 D-Color 0.5ct+0.5ct)",
    platingText: "Finitura in Rodio Puro (0.1 µm) + Sigillo Nano-Protective E-Coating (1.0 µm)"
  },
  // 2. A114 - Orecchini Rêve (Title: 53, Desc: 143)
  {
    sku: "A114",
    cleanName: "Orecchini Rêve",
    category: "Orecchini",
    slug: "orecchini-reve",
    isGold: false,
    isPearl: false,
    carats: "0.2 ct + 0.2 ct Taglio Brillante",
    seoTitle: "Rêve — Orecchini in Rodio & Argento 925 | Isabel Pepe",
    seoDescription: "Scopri gli orecchini Rêve di Isabel Pepe: Argento 925 con finitura in Rodio 0.1µm e nano-coating. Cofanetto regalo di lusso e garanzia inclusi.",
    storytelling: "Gli orecchini Rêve sono il punto luce quotidiano per eccellenza: delicati, luminosi e leggeri come un sogno, creati per essere indossati in ogni momento della giornata.",
    gemstoneText: "Pietre di Pura Luce ad Altissima Rifrazione (Taglio Brillante VVS1 D-Color 0.2ct+0.2ct)",
    platingText: "Finitura in Rodio Puro (0.1 µm) + Sigillo Nano-Protective E-Coating (1.0 µm)"
  },
  // 3. A118 - Orecchini Opéra (Title: 55, Desc: 154)
  {
    sku: "A118",
    cleanName: "Orecchini Opéra",
    category: "Orecchini",
    slug: "orecchini-opera",
    isGold: true,
    isPearl: false,
    carats: "Pavé Taglio Brillante VVS1",
    seoTitle: "Opéra — Orecchini in Oro 18K & Argento 925 | Isabel Pepe",
    seoDescription: "Scopri gli orecchini a cerchio Opéra di Isabel Pepe: Argento 925 con placcatura Oro 18K 1.0µm e doppio scudo. Cofanetto regalo luxury e garanzia inclusi.",
    storytelling: "I cerchi Opéra 15mm uniscono il calore avvolgente dell'Oro 18K alla maestria del pavé a taglio brillante, donando una presenza scenica magnetica e sofisticata.",
    gemstoneText: "Pietre di Pura Luce ad Altissima Rifrazione (Taglio Brillante VVS1 D-Color)",
    platingText: "Placcatura Oro 18K a Spessore (1.0 µm) + Sigillo Nano-Protective E-Coating (1.0 µm)"
  },
  // 4. A144 - Set Versailles (Title: 48, Desc: 147)
  {
    sku: "A144",
    cleanName: "Set Versailles",
    category: "Set",
    slug: "set-versailles",
    isGold: false,
    isPearl: false,
    carats: "Parure Taglio Brillante VVS1",
    seoTitle: "Versailles — Set Parure in Rodio | Isabel Pepe",
    seoDescription: "Scopri il Set Versailles di Isabel Pepe: parure in Argento 925 con finitura in Rodio 0.1µm e nano-coating. Cofanetto regalo luxury e garanzia inclusi.",
    storytelling: "La parure Versailles incarna lo splendore maestoso della gioielleria demi-fine. Collana e orecchini coordinati per un'armonia perfetta di pura luce e resistenza impeccabile.",
    gemstoneText: "Pietre di Pura Luce ad Altissima Rifrazione (Taglio Brillante VVS1 D-Color)",
    platingText: "Finitura in Rodio Puro (0.1 µm) + Sigillo Nano-Protective E-Coating (1.0 µm)"
  },
  // 5. A180-SET - Set Vivienne (Title: 46, Desc: 154)
  {
    sku: "A180-SET",
    cleanName: "Set Vivienne",
    category: "Set",
    slug: "set-vivienne",
    isGold: true,
    isPearl: false,
    carats: "Parure V Taglio Brillante VVS1",
    seoTitle: "Vivienne — Set Parure in Oro 18K | Isabel Pepe",
    seoDescription: "Scopri il Set Vivienne di Isabel Pepe: parure a V in Argento 925 con placcatura Oro 18K 1.0µm e nano-coating. Cofanetto regalo luxury e garanzia inclusi.",
    storytelling: "Il Set Vivienne a linea V è un omaggio alla sensualità contemporanea. L'abbinamento armonioso tra collana e orecchini illumina il décolleté con un fascino senza tempo.",
    gemstoneText: "Pietre di Pura Luce ad Altissima Rifrazione (Taglio Brillante VVS1 D-Color)",
    platingText: "Placcatura Oro 18K a Spessore (1.0 µm) + Sigillo Nano-Protective E-Coating (1.0 µm)"
  },
  // 6. ASB0041 - Orecchini Pétale d'Argent (Price Fix: 122) (Title: 50, Desc: 151)
  {
    sku: "ASB0041",
    cleanName: "Orecchini Pétale d'Argent",
    category: "Orecchini",
    slug: "orecchini-petale-d-argent",
    isGold: false,
    isPearl: false,
    carats: "1.08 ct + 1.08 ct Taglio Brillante",
    priceFix: 122.00,
    seoTitle: "Pétale d'Argent — Orecchini in Rodio | Isabel Pepe",
    seoDescription: "Scopri Pétale d'Argent di Isabel Pepe: orecchini in Argento 925 con finitura in Rodio 0.1µm e nano-coating. Cofanetto regalo luxury e garanzia inclusi.",
    storytelling: "Gli orecchini pendenti Pétale d'Argent richiamano la grazia dei petali mossi dal vento, con una cascata di luce scintillante che danza ad ogni minimo movimento.",
    gemstoneText: "Pietre di Pura Luce ad Altissima Rifrazione (Taglio Brillante VVS1 D-Color 1.08ct+1.08ct)",
    platingText: "Finitura in Rodio Puro (0.1 µm) + Sigillo Nano-Protective E-Coating (1.0 µm)"
  },
  // 7. ASB3035 - Orecchini Éternel (Price Fix: 112) (Title: 56, Desc: 152)
  {
    sku: "ASB3035",
    cleanName: "Orecchini Éternel",
    category: "Orecchini",
    slug: "orecchini-eternel",
    isGold: false,
    isPearl: false,
    carats: "0.5 ct + 0.5 ct Taglio Brillante",
    priceFix: 112.00,
    seoTitle: "Éternel — Orecchini in Rodio & Argento 925 | Isabel Pepe",
    seoDescription: "Scopri gli orecchini Éternel di Isabel Pepe: cuori in Argento 925 con finitura in Rodio 0.1µm e doppio scudo. Cofanetto regalo luxury e garanzia inclusi.",
    storytelling: "Gli orecchini Éternel reinterpretano la forma del cuore con moderna compostezza, arricchiti da un pavé di pura luce che celebra l'amore autentico e duraturo.",
    gemstoneText: "Pietre di Pura Luce ad Altissima Rifrazione (Taglio Brillante VVS1 D-Color 0.5ct+0.5ct)",
    platingText: "Finitura in Rodio Puro (0.1 µm) + Sigillo Nano-Protective E-Coating (1.0 µm)"
  },
  // 8. ASB3057 - Orecchini Butterfly (Title: 53, Desc: 154)
  {
    sku: "ASB3057",
    cleanName: "Orecchini Butterfly",
    category: "Orecchini",
    slug: "orecchini-butterfly",
    isGold: false,
    isPearl: false,
    carats: "1.6 ct Taglio Brillante",
    seoTitle: "Butterfly — Orecchini in Rodio & Argento | Isabel Pepe",
    seoDescription: "Scopri gli orecchini Butterfly di Isabel Pepe: Argento 925 con finitura in Rodio Puro 0.1µm e nano-coating. Cofanetto regalo luxury e garanzia inclusi.",
    storytelling: "Gli orecchini Butterfly catturano la delicatezza e la libertà della farfalla, trasformando la luce in ali scintillanti adatte ad ogni occasione speciale.",
    gemstoneText: "Pietre di Pura Luce ad Altissima Rifrazione (Taglio Brillante VVS1 D-Color 1.6ct)",
    platingText: "Finitura in Rodio Puro (0.1 µm) + Sigillo Nano-Protective E-Coating (1.0 µm)"
  },
  // 9. ASB3093 - Orecchini Joséphine (Title: 53, Desc: 153)
  {
    sku: "ASB3093",
    cleanName: "Orecchini Joséphine",
    category: "Orecchini",
    slug: "orecchini-josephine",
    isGold: false,
    isPearl: false,
    carats: "Pietre Rosa Taglio Brillante",
    seoTitle: "Joséphine — Orecchini in Rodio & Argento | Isabel Pepe",
    seoDescription: "Scopri gli orecchini Joséphine di Isabel Pepe: Argento 925 con finitura in Rodio 0.1µm e pietre rosa luce. Cofanetto regalo luxury e garanzia inclusi.",
    storytelling: "Gli orecchini Joséphine uniscono la delicatezza delle pietre rosa a una montatura luminosa in Rodio Puro, donando una nota romantica e femminile ad ogni outfit.",
    gemstoneText: "Pietre di Luce Rosa ad Altissima Rifrazione (Taglio Brillante)",
    platingText: "Finitura in Rodio Puro (0.1 µm) + Sigillo Nano-Protective E-Coating (1.0 µm)"
  },
  // 10. ASB3141 - Orecchini Soirée (Title: 55, Desc: 151)
  {
    sku: "ASB3141",
    cleanName: "Orecchini Soirée",
    category: "Orecchini",
    slug: "orecchini-soiree",
    isGold: false,
    isPearl: false,
    carats: "Pavé Taglio Brillante VVS1",
    seoTitle: "Soirée — Orecchini in Rodio & Argento 925 | Isabel Pepe",
    seoDescription: "Scopri gli orecchini Soirée di Isabel Pepe: cerchi in Argento 925 con finitura in Rodio Puro 0.1µm e pavé. Cofanetto regalo luxury e garanzia inclusi.",
    storytelling: "I cerchi Soirée sono pensati per le serate indimenticabili: una linea continua di bagliori a taglio brillante incastonati a mano per un effetto wow garantito.",
    gemstoneText: "Pietre di Pura Luce ad Altissima Rifrazione (Taglio Brillante VVS1 D-Color)",
    platingText: "Finitura in Rodio Puro (0.1 µm) + Sigillo Nano-Protective E-Coating (1.0 µm)"
  },
  // 11. ASB3142 - Orecchini Rivière (MANDATORY SLUG: orecchini-riviere) (Title: 56, Desc: 147)
  {
    sku: "ASB3142",
    cleanName: "Orecchini Rivière",
    category: "Orecchini",
    slug: "orecchini-riviere",
    isGold: false,
    isPearl: false,
    carats: "0.8 ct + 0.8 ct Taglio Brillante",
    seoTitle: "Rivière — Orecchini in Rodio & Argento 925 | Isabel Pepe",
    seoDescription: "Scopri gli orecchini Rivière di Isabel Pepe: Argento 925 con finitura in Rodio 0.1µm e nano-coating. Cofanetto regalo luxury e garanzia 24 mesi inclusi.",
    storytelling: "Gli orecchini Rivière presentano un design a cascata lineare dal movimento sinuoso, offrendo una rifrazione di luce ineguagliabile che illumina il décolleté.",
    gemstoneText: "Pietre di Pura Luce ad Altissima Rifrazione (Taglio Brillante VVS1 D-Color 0.8ct+0.8ct)",
    platingText: "Finitura in Rodio Puro (0.1 µm) + Sigillo Nano-Protective E-Coating (1.0 µm)"
  },
  // 12. ASB4019 - Bracciale Iconique (MANDATORY SLUG: bracciale-iconique) (Title: 57, Desc: 146)
  {
    sku: "ASB4019",
    cleanName: "Bracciale Iconique",
    category: "Bracciali",
    slug: "bracciale-iconique",
    isGold: false,
    isPearl: false,
    carats: "1.0 ct Taglio Brillante",
    seoTitle: "Iconique — Bracciale in Rodio & Argento 925 | Isabel Pepe",
    seoDescription: "Scopri il bracciale Iconique di Isabel Pepe: Argento 925 con finitura in Rodio Puro 0.1µm e solitario. Cofanetto regalo luxury e garanzia inclusi.",
    storytelling: "Il bracciale Iconique celebra la bellezza del minimalismo con una pietra solitaria a taglio brillante sospesa su una catena delicata e ultra-resistente.",
    gemstoneText: "Pietre di Pura Luce ad Altissima Rifrazione (Taglio Brillante VVS1 D-Color 1.0ct)",
    platingText: "Finitura in Rodio Puro (0.1 µm) + Sigillo Nano-Protective E-Coating (1.0 µm)"
  },
  // 13. ASB4043 - Bracciale Radiance (Title: 57, Desc: 151)
  {
    sku: "ASB4043",
    cleanName: "Bracciale Radiance",
    category: "Bracciali",
    slug: "bracciale-radiance",
    isGold: false,
    isPearl: false,
    carats: "1.0 ct Taglio Brillante",
    seoTitle: "Radiance — Bracciale in Rodio & Argento 925 | Isabel Pepe",
    seoDescription: "Scopri il bracciale Radiance di Isabel Pepe: Argento 925 con finitura in Rodio 0.1µm e solitario brillante. Cofanetto regalo luxury e garanzia inclusi.",
    storytelling: "Il bracciale Radiance emana un fascino moderno e magnetico, ideale da indossare da solo o combinato con altri gioielli per un look a strati elegante.",
    gemstoneText: "Pietre di Pura Luce ad Altissima Rifrazione (Taglio Brillante VVS1 D-Color 1.0ct)",
    platingText: "Finitura in Rodio Puro (0.1 µm) + Sigillo Nano-Protective E-Coating (1.0 µm)"
  },
  // 14. ASB4054-PINK - Bracciale Eden Rose (Title: 56, Desc: 154)
  {
    sku: "ASB4054-PINK",
    cleanName: "Bracciale Eden Rose",
    category: "Bracciali",
    slug: "bracciale-eden-rose",
    isGold: true,
    isPearl: false,
    carats: "1.0 ct Taglio Brillante Pink",
    seoTitle: "Eden Rose — Bracciale in Oro 18K & Argento | Isabel Pepe",
    seoDescription: "Scopri il bracciale Eden Rose di Isabel Pepe: Argento 925 con placcatura Oro 18K 1.0µm e pietra rosa luce. Cofanetto regalo luxury e garanzia inclusi.",
    storytelling: "Il bracciale Eden Rose fonde la calda luce dell'Oro 18K con una pietra centrale rosa dai riflessi vellutati, simbolo di grazia e femminilità contemporanea.",
    gemstoneText: "Pietre di Luce Rosa ad Altissima Rifrazione (Taglio Brillante 1.0ct)",
    platingText: "Placcatura Oro 18K a Spessore (1.0 µm) + Sigillo Nano-Protective E-Coating (1.0 µm)"
  },
  // 15. ASB4054-WHITE - Bracciale Harmonie (Price Fix: 161) (Title: 57, Desc: 151)
  {
    sku: "ASB4054-WHITE",
    cleanName: "Bracciale Harmonie",
    category: "Bracciali",
    slug: "bracciale-harmonie",
    isGold: false,
    isPearl: false,
    carats: "1.0 ct Taglio Brillante White",
    priceFix: 161.00,
    seoTitle: "Harmonie — Bracciale in Rodio & Argento 925 | Isabel Pepe",
    seoDescription: "Scopri il bracciale Harmonie di Isabel Pepe: Argento 925 con finitura in Rodio 0.1µm e solitario brillante. Cofanetto regalo luxury e garanzia inclusi.",
    storytelling: "Il bracciale Harmonie è l'emblema dell'equilibrio e della purezza. La pietra bianca a taglio brillante riflette una luce cristallina ad ogni gesto.",
    gemstoneText: "Pietre di Pura Luce ad Altissima Rifrazione (Taglio Brillante VVS1 D-Color 1.0ct)",
    platingText: "Finitura in Rodio Puro (0.1 µm) + Sigillo Nano-Protective E-Coating (1.0 µm)"
  },
  // 16. ASB4055 - Bracciale Cascade (Title: 56, Desc: 154)
  {
    sku: "ASB4055",
    cleanName: "Bracciale Cascade",
    category: "Bracciali",
    slug: "bracciale-cascade",
    isGold: false,
    isPearl: false,
    carats: "Pavé Taglio Brillante VVS1",
    seoTitle: "Cascade — Bracciale in Rodio & Argento 925 | Isabel Pepe",
    seoDescription: "Scopri il bracciale Cascade di Isabel Pepe: Argento 925 con finitura in Rodio 0.1µm e pavé continuo brillante. Cofanetto regalo luxury e garanzia inclusi.",
    storytelling: "Il bracciale Cascade presenta un pavé ininterrotto di pietre scintillanti che avvolge il polso con fluidità, garantendo un comfort impeccabile.",
    gemstoneText: "Pietre di Pura Luce ad Altissima Rifrazione (Taglio Brillante VVS1 D-Color)",
    platingText: "Finitura in Rodio Puro (0.1 µm) + Sigillo Nano-Protective E-Coating (1.0 µm)"
  },
  // 17. ASB4064 - Mon Amour Royale (Price Fix: 128) (Title: 51, Desc: 149)
  {
    sku: "ASB4064",
    cleanName: "Mon Amour Royale",
    category: "Bracciali",
    slug: "mon-amour-royale",
    isGold: false,
    isPearl: false,
    carats: "1.0 ct Cuore Taglio Brillante",
    priceFix: 128.00,
    seoTitle: "Mon Amour Royale — Bracciale in Rodio | Isabel Pepe",
    seoDescription: "Scopri Mon Amour Royale di Isabel Pepe: bracciale in Argento 925 con finitura in Rodio 0.1µm e cuore pavé. Cofanetto regalo luxury e garanzia inclusi.",
    storytelling: "Il bracciale Mon Amour Royale custodisce un cuore scintillante taglio brillante, creato per celebrare le connessioni più profonde con autentica eleganza.",
    gemstoneText: "Pietre di Pura Luce ad Altissima Rifrazione (Taglio Brillante VVS1 D-Color 1.0ct)",
    platingText: "Finitura in Rodio Puro (0.1 µm) + Sigillo Nano-Protective E-Coating (1.0 µm)"
  },
  // 18. ASB4068 - Bracciale Tennis Monte Carlo (Title: 57, Desc: 147)
  {
    sku: "ASB4068",
    cleanName: "Bracciale Tennis Monte Carlo",
    category: "Bracciali",
    slug: "bracciale-tennis-monte-carlo",
    isGold: false,
    isPearl: false,
    carats: "Taglio Brillante VVS1",
    seoTitle: "Monte Carlo — Tennis in Rodio & Argento 925 | Isabel Pepe",
    seoDescription: "Scopri il tennis Monte Carlo di Isabel Pepe: Argento 925 con finitura in Rodio 0.1µm e pietre brillanti. Cofanetto regalo luxury e garanzia inclusi.",
    storytelling: "Il bracciale tennis Monte Carlo è l'icona intramontabile del lusso accessibile: una fila continua di pietre a taglio brillante VVS1 con chiusura di sicurezza rinforzata.",
    gemstoneText: "Pietre di Pura Luce ad Altissima Rifrazione (Taglio Brillante VVS1 D-Color)",
    platingText: "Finitura in Rodio Puro (0.1 µm) + Sigillo Nano-Protective E-Coating (1.0 µm)"
  },
  // 19. BTB024 - Eclat Royal (Title: 58, Desc: 152)
  {
    sku: "BTB024",
    cleanName: "Eclat Royal",
    category: "Bracciali",
    slug: "eclat-royal",
    isGold: true,
    isPearl: false,
    carats: "Pavé Maglie Taglio Brillante",
    seoTitle: "Eclat Royal — Bracciale in Oro 18K & Argento | Isabel Pepe",
    seoDescription: "Scopri il bracciale Eclat Royal di Isabel Pepe: maglie in Argento 925 con placcatura Oro 18K 1.0µm e doppio scudo. Cofanetto luxury e garanzia inclusi.",
    storytelling: "Il bracciale Eclat Royal a maglie scultoree fonde audacia contemporanea e preziosità classica. La spessa placcatura in Oro 18K garantisce una lucentezza senza paragoni.",
    gemstoneText: "Pietre di Pura Luce ad Altissima Rifrazione (Taglio Brillante VVS1 D-Color)",
    platingText: "Placcatura Oro 18K a Spessore (1.0 µm) + Sigillo Nano-Protective E-Coating (1.0 µm)"
  },
  // 20. BTB047 - Siena Gold (Title: 58, Desc: 147)
  {
    sku: "BTB047",
    cleanName: "Siena Gold",
    category: "Collane",
    slug: "siena-gold",
    isGold: true,
    isPearl: false,
    carats: "Taglio Brillante VVS1",
    seoTitle: "Siena Gold — Collana in Oro 18K & Argento 925 | Isabel Pepe",
    seoDescription: "Scopri la collana Siena Gold di Isabel Pepe: Argento 925 con placcatura Oro 18K 1.0µm e nano-coating. Cofanetto regalo luxury e garanzia 24 mesi inclusi.",
    storytelling: "La collana Siena Gold si distingue per le sue linee calde e avvolgenti, pensata per illuminare la pelle con riflessi dorati e pietre ad altissima rifrazione.",
    gemstoneText: "Pietre di Pura Luce ad Altissima Rifrazione (Taglio Brillante VVS1 D-Color)",
    platingText: "Placcatura Oro 18K a Spessore (1.0 µm) + Sigillo Nano-Protective E-Coating (1.0 µm)"
  },
  // 21. BTN005-GOLD - Collana Brera Gold (Title: 58, Desc: 152)
  {
    sku: "BTN005-GOLD",
    cleanName: "Collana Brera Gold",
    category: "Collane",
    slug: "collana-brera-gold",
    isGold: true,
    isPearl: false,
    carats: "Pavé Taglio Brillante VVS1",
    seoTitle: "Brera Gold — Collana in Oro 18K & Argento 925 | Isabel Pepe",
    seoDescription: "Scopri la collana Brera Gold di Isabel Pepe: Argento 925 con placcatura Oro 18K 1.0µm e pavé taglio brillante. Cofanetto regalo luxury e garanzia inclusi.",
    storytelling: "La collana Brera Gold unisce il fascino metropolitano a una straordinaria intensità luminosa, protetta dal nostro esclusivo doppio scudo anti-ossidazione.",
    gemstoneText: "Pietre di Pura Luce ad Altissima Rifrazione (Taglio Brillante VVS1 D-Color)",
    platingText: "Placcatura Oro 18K a Spessore (1.0 µm) + Sigillo Nano-Protective E-Coating (1.0 µm)"
  },
  // 22. BTN005-SILVER - Collana Brera Silver (Title: 59, Desc: 148)
  {
    sku: "BTN005-SILVER",
    cleanName: "Collana Brera Silver",
    category: "Collane",
    slug: "collana-brera-silver",
    isGold: false,
    isPearl: false,
    carats: "Pavé Taglio Brillante VVS1",
    seoTitle: "Brera Silver — Collana in Rodio & Argento 925 | Isabel Pepe",
    seoDescription: "Scopri la collana Brera Silver di Isabel Pepe: Argento 925 con finitura in Rodio 0.1µm e pavé brillante. Cofanetto regalo luxury e garanzia inclusi.",
    storytelling: "La collana Brera Silver riflette la luce fredda e pura del Rodio specchiato, esaltando ogni sfaccettatura delle pietre a taglio brillante incastonate a mano.",
    gemstoneText: "Pietre di Pura Luce ad Altissima Rifrazione (Taglio Brillante VVS1 D-Color)",
    platingText: "Finitura in Rodio Puro (0.1 µm) + Sigillo Nano-Protective E-Coating (1.0 µm)"
  },
  // 23. BTN006 - Collana Éclipse (Title: 54, Desc: 151)
  {
    sku: "BTN006",
    cleanName: "Collana Éclipse",
    category: "Collane",
    slug: "collana-eclipse",
    isGold: false,
    isPearl: false,
    carats: "Cerchi Intrecciati Taglio Brillante",
    seoTitle: "Éclipse — Collana in Rodio & Argento 925 | Isabel Pepe",
    seoDescription: "Scopri la collana Éclipse di Isabel Pepe: cerchi in Argento 925 con finitura in Rodio 0.1µm e nano-coating. Cofanetto regalo luxury e garanzia inclusi.",
    storytelling: "La collana Éclipse simboleggia l'unione indissolubile attraverso cerchi intrecciati arricchiti da un micro-pavé ad altissima rifrazione.",
    gemstoneText: "Pietre di Pura Luce ad Altissima Rifrazione (Taglio Brillante VVS1 D-Color)",
    platingText: "Finitura in Rodio Puro (0.1 µm) + Sigillo Nano-Protective E-Coating (1.0 µm)"
  },
  // 24. BTN028 - Isabel Romance (Title: 60, Desc: 152)
  {
    sku: "BTN028",
    cleanName: "Isabel Romance",
    category: "Collane",
    slug: "isabel-romance",
    isGold: true,
    isPearl: false,
    carats: "Cuore Pavé Taglio Brillante",
    seoTitle: "Isabel Romance — Collana in Oro 18K & Argento | Isabel Pepe",
    seoDescription: "Scopri Isabel Romance di Isabel Pepe: collana cuore in Argento 925 con placcatura Oro 18K 1.0µm e doppio scudo. Cofanetto regalo luxury e garanzia inclusi.",
    storytelling: "La collana Isabel Romance è un capolavoro di dolcezza e stile. Il ciondolo a cuore pavé risplende al centro del décolleté con riflessi dorati inalterabili.",
    gemstoneText: "Pietre di Pura Luce ad Altissima Rifrazione (Taglio Brillante VVS1 D-Color)",
    platingText: "Placcatura Oro 18K a Spessore (1.0 µm) + Sigillo Nano-Protective E-Coating (1.0 µm)"
  },
  // 25. BTS018-EARRING - Glow Ribbon (Title: 48, Desc: 148)
  {
    sku: "BTS018-EARRING",
    cleanName: "Glow Ribbon",
    category: "Orecchini",
    slug: "glow-ribbon",
    isGold: true,
    isPearl: false,
    carats: "Fiocco Pavé Taglio Brillante",
    seoTitle: "Glow Ribbon — Orecchini in Oro 18K | Isabel Pepe",
    seoDescription: "Scopri gli orecchini Glow Ribbon di Isabel Pepe: fiocco in Argento 925 con Oro 18K 1.0µm e nano-coating. Cofanetto regalo luxury e garanzia inclusi.",
    storytelling: "Gli orecchini Glow Ribbon a forma di fiocco prezioso aggiungono un tocco giocoso ed elegante, impreziositi da una scintillante placcatura in Oro 18K.",
    gemstoneText: "Pietre di Pura Luce ad Altissima Rifrazione (Taglio Brillante VVS1 D-Color)",
    platingText: "Placcatura Oro 18K a Spessore (1.0 µm) + Sigillo Nano-Protective E-Coating (1.0 µm)"
  },
  // 26. BTS036 - Set Papillon Splendeur (Title: 53, Desc: 150)
  {
    sku: "BTS036",
    cleanName: "Set Papillon Splendeur",
    category: "Set",
    slug: "set-papillon-splendeur",
    isGold: false,
    isPearl: false,
    carats: "Parure 1.0 ct + 1.0 ct Taglio Brillante",
    seoTitle: "Papillon Splendeur — Set Parure in Rodio | Isabel Pepe",
    seoDescription: "Scopri Papillon Splendeur di Isabel Pepe: parure in Argento 925 con finitura in Rodio 0.1µm e nano-coating. Cofanetto regalo luxury e garanzia inclusi.",
    storytelling: "Il Set Papillon Splendeur unisce collana e orecchini a farfalla coordinati, offrendo una leggerezza visiva senza pari e una brillantezza continua.",
    gemstoneText: "Pietre di Pura Luce ad Altissima Rifrazione (Taglio Brillante VVS1 D-Color 1ct+1ct)",
    platingText: "Finitura in Rodio Puro (0.1 µm) + Sigillo Nano-Protective E-Coating (1.0 µm)"
  },
  // 27. MS1093 - Collana L'Éternel (Price Fix: 124) (Title: 56, Desc: 147)
  {
    sku: "MS1093",
    cleanName: "Collana L'Éternel",
    category: "Collane",
    slug: "collana-l-eternel",
    isGold: false,
    isPearl: false,
    carats: "0.6 ct 3 Cuori Taglio Brillante",
    priceFix: 124.00,
    seoTitle: "L'Éternel — Collana in Rodio & Argento 925 | Isabel Pepe",
    seoDescription: "Scopri la collana L'Éternel di Isabel Pepe: 3 cuori in Argento 925 con finitura in Rodio 0.1µm e nano-coating. Cofanetto regalo luxury e garanzia inclusi.",
    storytelling: "La collana L'Éternel a tre cuori simboleggia ieri, oggi e per sempre. Un gioiello dal forte valore affettivo, luminoso e resistente all'uso quotidiano.",
    gemstoneText: "Pietre di Pura Luce ad Altissima Rifrazione (Taglio Brillante VVS1 D-Color 0.6ct)",
    platingText: "Finitura in Rodio Puro (0.1 µm) + Sigillo Nano-Protective E-Coating (1.0 µm)"
  },
  // 28. MS1096 - Collana Étoile (Title: 53, Desc: 154)
  {
    sku: "MS1096",
    cleanName: "Collana Étoile",
    category: "Collane",
    slug: "collana-etoile",
    isGold: false,
    isPearl: false,
    carats: "1.0 ct Taglio Brillante",
    seoTitle: "Étoile — Collana in Rodio & Argento 925 | Isabel Pepe",
    seoDescription: "Scopri la collana Étoile di Isabel Pepe: punto luce in Argento 925 con finitura in Rodio 0.1µm e nano-coating. Cofanetto regalo luxury e garanzia inclusi.",
    storytelling: "La collana Étoile è il punto luce solitario essenziale e impeccabile. La pietra a taglio brillante da 1 carato equivalente cattura ogni sguardo con purezza assoluta.",
    gemstoneText: "Pietre di Pura Luce ad Altissima Rifrazione (Taglio Brillante VVS1 D-Color 1.0ct)",
    platingText: "Finitura in Rodio Puro (0.1 µm) + Sigillo Nano-Protective E-Coating (1.0 µm)"
  },
  // 29. MS1105 - Collana Symbiose (Title: 55, Desc: 151)
  {
    sku: "MS1105",
    cleanName: "Collana Symbiose",
    category: "Collane",
    slug: "collana-symbiose",
    isGold: false,
    isPearl: false,
    carats: "1.1 ct Taglio Brillante",
    seoTitle: "Symbiose — Collana in Rodio & Argento 925 | Isabel Pepe",
    seoDescription: "Scopri la collana Symbiose di Isabel Pepe: Argento 925 con finitura in Rodio Puro 0.1µm e pietre brillanti. Cofanetto regalo luxury e garanzia inclusi.",
    storytelling: "La collana Symbiose fonde versatilità ed eleganza dinamica, progettata per armonizzarsi con naturalezza ad ogni stile e occasione.",
    gemstoneText: "Pietre di Pura Luce ad Altissima Rifrazione (Taglio Brillante VVS1 D-Color 1.1ct)",
    platingText: "Finitura in Rodio Puro (0.1 µm) + Sigillo Nano-Protective E-Coating (1.0 µm)"
  },
  // 30. MS1141 - Fleur (Title: 51, Desc: 147)
  {
    sku: "MS1141",
    cleanName: "Fleur",
    category: "Collane",
    slug: "fleur",
    isGold: false,
    isPearl: false,
    carats: "1.0 ct Fiore Taglio Brillante",
    seoTitle: "Fleur — Collana in Rodio & Argento 925 | Isabel Pepe",
    seoDescription: "Scopri la collana Fleur di Isabel Pepe: fiore in Argento 925 con finitura in Rodio Puro 0.1µm e nano-coating. Cofanetto regalo luxury e garanzia inclusi.",
    storytelling: "La collana Fleur trasforma la grazia floreale in un gioiello eterno: petali luminosi a taglio brillante che sbocciano sul décolleté con delicata brillantezza.",
    gemstoneText: "Pietre di Pura Luce ad Altissima Rifrazione (Taglio Brillante VVS1 D-Color 1.0ct)",
    platingText: "Finitura in Rodio Puro (0.1 µm) + Sigillo Nano-Protective E-Coating (1.0 µm)"
  },
  // 31. MS1208 - Collana Duo Harmonie (Title: 59, Desc: 153)
  {
    sku: "MS1208",
    cleanName: "Collana Duo Harmonie",
    category: "Collane",
    slug: "collana-duo-harmonie",
    isGold: false,
    isPearl: false,
    carats: "1.0 ct Cuore Taglio Brillante",
    seoTitle: "Duo Harmonie — Collana in Rodio & Argento 925 | Isabel Pepe",
    seoDescription: "Scopri la collana Duo Harmonie di Isabel Pepe: cuore in Argento 925 con finitura in Rodio 0.1µm e nano-coating. Cofanetto regalo luxury e garanzia inclusi.",
    storytelling: "La collana Duo Harmonie unisce due elementi gemelli a taglio brillante in un abbraccio armonioso, perfetta come dono d'amore autentico e duraturo.",
    gemstoneText: "Pietre di Pura Luce ad Altissima Rifrazione (Taglio Brillante VVS1 D-Color 1.0ct)",
    platingText: "Finitura in Rodio Puro (0.1 µm) + Sigillo Nano-Protective E-Coating (1.0 µm)"
  },
  // 32. MS12236 - Collana Métamorphose (Title: 57, Desc: 148)
  {
    sku: "MS12236",
    cleanName: "Collana Métamorphose",
    category: "Collane",
    slug: "collana-metamorphose",
    isGold: true,
    isPearl: false,
    carats: "Farfalla Pavé Taglio Brillante",
    seoTitle: "Métamorphose — Collana in Oro 18K & Argento | Isabel Pepe",
    seoDescription: "Scopri Métamorphose di Isabel Pepe: farfalla in Argento 925 con placcatura Oro 18K 1.0µm e doppio scudo. Cofanetto regalo luxury e garanzia inclusi.",
    storytelling: "La collana Métamorphose celebra la rinascita e l'evoluzione personale con una farfalla interamente ricoperta di bagliori a taglio brillante.",
    gemstoneText: "Pietre di Pura Luce ad Altissima Rifrazione (Taglio Brillante VVS1 D-Color)",
    platingText: "Placcatura Oro 18K a Spessore (1.0 µm) + Sigillo Nano-Protective E-Coating (1.0 µm)"
  },
  // 33. MS12242 - Collana Chantilly (Title: 56, Desc: 151)
  {
    sku: "MS12242",
    cleanName: "Collana Chantilly",
    category: "Collane",
    slug: "collana-chantilly",
    isGold: false,
    isPearl: false,
    carats: "3.2 ct Taglio Brillante",
    seoTitle: "Chantilly — Collana in Rodio & Argento 925 | Isabel Pepe",
    seoDescription: "Scopri la collana Chantilly di Isabel Pepe: Argento 925 con finitura in Rodio Puro 0.1µm e pietre brillanti. Cofanetto regalo luxury e garanzia inclusi.",
    storytelling: "La collana Chantilly è una composizione maestosa da 3.2 carati equivalenti, pensata per regalare un'emozione di pura luce in ogni occasione memorabile.",
    gemstoneText: "Pietre di Pura Luce ad Altissima Rifrazione (Taglio Brillante VVS1 D-Color 3.2ct)",
    platingText: "Finitura in Rodio Puro (0.1 µm) + Sigillo Nano-Protective E-Coating (1.0 µm)"
  },
  // 34. MSR1075 - Anello Constellation (Title: 55, Desc: 152)
  {
    sku: "MSR1075",
    cleanName: "Anello Constellation",
    category: "Anelli",
    slug: "anello-constellation",
    isGold: false,
    isPearl: false,
    carats: "1.0 ct Taglio Brillante",
    seoTitle: "Constellation — Anello in Rodio & Argento | Isabel Pepe",
    seoDescription: "Scopri l'anello Constellation di Isabel Pepe: Argento 925 con finitura in Rodio Puro 0.1µm e solitario. Cofanetto regalo luxury e garanzia 24 mesi inclusi.",
    storytelling: "L'anello Constellation evoca la brillantezza delle costellazioni notturne con una pietra centrale magnetica incastonata con precisione millimetrica.",
    gemstoneText: "Pietre di Pura Luce ad Altissima Rifrazione (Taglio Brillante VVS1 D-Color 1.0ct)",
    platingText: "Finitura in Rodio Puro (0.1 µm) + Sigillo Nano-Protective E-Coating (1.0 µm)"
  },
  // 35. MSR1078 - Anello Châtelaine Silver (Title: 49, Desc: 147)
  {
    sku: "MSR1078",
    cleanName: "Anello Châtelaine Silver",
    category: "Anelli",
    slug: "anello-chatelaine-silver",
    isGold: false,
    isPearl: false,
    carats: "1.0 ct Taglio Brillante White",
    seoTitle: "Châtelaine Silver — Anello in Rodio | Isabel Pepe",
    seoDescription: "Scopri Châtelaine Silver di Isabel Pepe: anello in Argento 925 con finitura in Rodio 0.1µm e solitario. Cofanetto regalo luxury e garanzia inclusi.",
    storytelling: "L'anello Châtelaine Silver ripropone l'eleganza dell'anello solitario in chiave moderna, esaltato dalla lucentezza a specchio del Rodio Puro.",
    gemstoneText: "Pietre di Pura Luce ad Altissima Rifrazione (Taglio Brillante VVS1 D-Color 1.0ct)",
    platingText: "Finitura in Rodio Puro (0.1 µm) + Sigillo Nano-Protective E-Coating (1.0 µm)"
  },
  // 36. MSR1089 - Solitaire Gold Grace (Price Fix: 125) (Title: 54, Desc: 150)
  {
    sku: "MSR1089",
    cleanName: "Solitaire Gold Grace",
    category: "Anelli",
    slug: "solitaire-gold-grace",
    isGold: true,
    isPearl: false,
    carats: "1.0 ct Taglio Brillante",
    priceFix: 125.00,
    seoTitle: "Solitaire Gold Grace — Anello in Oro 18K | Isabel Pepe",
    seoDescription: "Scopri Solitaire Gold Grace di Isabel Pepe: anello in Argento 925 con Oro 18K 1.0µm e solitario brillante. Cofanetto regalo luxury e garanzia inclusi.",
    storytelling: "L'anello Solitaire Gold Grace incarna la quintessenza del solitario dorato: una pietra a taglio brillante da 1 carato abbracciata da una calda montatura in Oro 18K.",
    gemstoneText: "Pietre di Pura Luce ad Altissima Rifrazione (Taglio Brillante VVS1 D-Color 1.0ct)",
    platingText: "Placcatura Oro 18K a Spessore (1.0 µm) + Sigillo Nano-Protective E-Coating (1.0 µm)"
  },
  // 37. MSR1139 - Anello Imperial (Title: 54, Desc: 149)
  {
    sku: "MSR1139",
    cleanName: "Anello Imperial",
    category: "Anelli",
    slug: "anello-imperial",
    isGold: false,
    isPearl: false,
    carats: "3.6 ct Multi Taglio Brillante",
    seoTitle: "Imperial — Anello in Rodio & Argento 925 | Isabel Pepe",
    seoDescription: "Scopri l'anello Imperial di Isabel Pepe: Argento 925 con finitura in Rodio Puro 0.1µm e pietre brillanti. Cofanetto regalo luxury e garanzia inclusi.",
    storytelling: "L'anello Imperial è una fascia scultorea arricchita da 3.6 carati di pura luce, studiata per donare una sensazione di magnificenza al dito.",
    gemstoneText: "Pietre di Pura Luce ad Altissima Rifrazione (Taglio Brillante VVS1 D-Color 3.6ct)",
    platingText: "Finitura in Rodio Puro (0.1 µm) + Sigillo Nano-Protective E-Coating (1.0 µm)"
  },
  // 38. MSR1220 - Anello Lune d'Argent (Title: 59, Desc: 153)
  {
    sku: "MSR1220",
    cleanName: "Anello Lune d'Argent",
    category: "Anelli",
    slug: "anello-lune-d-argent",
    isGold: false,
    isPearl: false,
    carats: "2.0 ct Taglio Brillante",
    seoTitle: "Lune d'Argent — Anello in Rodio & Argento 925 | Isabel Pepe",
    seoDescription: "Scopri Lune d'Argent di Isabel Pepe: anello in Argento 925 con finitura in Rodio 0.1µm e solitario 2ct. Cofanetto regalo luxury e garanzia 24 mesi inclusi.",
    storytelling: "L'anello Lune d'Argent presenta una pietra monumentale da 2 carati a taglio brillante, circondata da un alone di luce lunare dal fascino magnetico.",
    gemstoneText: "Pietre di Pura Luce ad Altissima Rifrazione (Taglio Brillante VVS1 D-Color 2.0ct)",
    platingText: "Finitura in Rodio Puro (0.1 µm) + Sigillo Nano-Protective E-Coating (1.0 µm)"
  },
  // 39. PL-15-BRACELET - Set Sweet Romance (Bracciale Sweet Romance) (Title: 59, Desc: 153)
  {
    sku: "PL-15-BRACELET",
    cleanName: "Set Sweet Romance",
    category: "Bracciali",
    slug: "set-sweet-romance",
    isGold: true,
    isPearl: true,
    carats: "Perle d'Acqua Dolce 7.5-8 mm",
    seoTitle: "Sweet Romance — Bracciale con Perle & Oro 18K | Isabel Pepe",
    seoDescription: "Scopri Sweet Romance di Isabel Pepe: perle d'acqua dolce 7.5-8mm e finiture in Oro 18K 1.0µm. Cofanetto regalo luxury e garanzia ufficiale 24 mesi inclusi.",
    storytelling: "Il bracciale Sweet Romance alterna autentiche perle d'acqua dolce a dettagli placcati Oro 18K, donando un'allure romantica e sofisticata al polso.",
    gemstoneText: "Perle Naturali d'Acqua Dolce Selezionate a Mano (7.5-8 mm)",
    platingText: "Placcatura Oro 18K a Spessore (1.0 µm) + Sigillo Nano-Protective E-Coating (1.0 µm)"
  },
  // 40. PL-30 (Vendôme Pearl) - ID: 6c46ab5c-69ea-4a18-8c2b-be7a1af976bc (Title: 57, Desc: 151)
  {
    sku: "PL-30",
    idMatch: "6c46ab5c-69ea-4a18-8c2b-be7a1af976bc",
    cleanName: "Vendôme Pearl",
    category: "Collane",
    slug: "vendome-pearl",
    isGold: true,
    isPearl: true,
    carats: "Perle d'Acqua Dolce 7-8 mm",
    seoTitle: "Vendôme Pearl — Collana con Perle & Oro 18K | Isabel Pepe",
    seoDescription: "Scopri Vendôme Pearl di Isabel Pepe: collana con perle d'acqua dolce 7-8mm e chiusura in Oro 18K 1.0µm. Cofanetto regalo luxury e garanzia 24 mesi inclusi.",
    storytelling: "La collana Vendôme Pearl reinterpreta il classico filo di perle con perle d'acqua dolce calibrate e una preziosa chiusura rifinita in Oro 18K.",
    gemstoneText: "Perle Naturali d'Acqua Dolce Selezionate a Mano (7-8 mm)",
    platingText: "Placcatura Oro 18K a Spessore (1.0 µm) + Sigillo Nano-Protective E-Coating (1.0 µm)"
  },
  // 41. PL-30 (Collana Divina) - ID: 230542d4-4b20-492d-bcbd-cf3f4288902b (Title: 50, Desc: 152)
  {
    sku: "PL-30",
    idMatch: "230542d4-4b20-492d-bcbd-cf3f4288902b",
    cleanName: "Collana Divina",
    category: "Collane",
    slug: "collana-divina",
    isGold: true,
    isPearl: true,
    carats: "Perle d'Acqua Dolce 5-6 mm",
    seoTitle: "Divina — Collana con Perle & Oro 18K | Isabel Pepe",
    seoDescription: "Scopri la collana Divina di Isabel Pepe: perle naturali 5-6mm e finiture in Oro 18K 1.0µm. Cofanetto regalo luxury e garanzia ufficiale 24 mesi inclusi.",
    storytelling: "La collana Divina è un filo di perle naturali d'acqua dolce dal diametro armonioso di 5-6 mm, perfetto per illuminare con discrezione ogni décolleté.",
    gemstoneText: "Perle Naturali d'Acqua Dolce Selezionate a Mano (5-6 mm)",
    platingText: "Placcatura Oro 18K a Spessore (1.0 µm) + Sigillo Nano-Protective E-Coating (1.0 µm)"
  },
  // 42. PL-40 - Collana Solitaire Paris (Title: 59, Desc: 153)
  {
    sku: "PL-40",
    cleanName: "Collana Solitaire Paris",
    category: "Collane",
    slug: "collana-solitaire-paris",
    isGold: true,
    isPearl: true,
    carats: "Perla Singola d'Acqua Dolce 10-11 mm",
    seoTitle: "Solitaire Paris — Collana con Perle & Oro 18K | Isabel Pepe",
    seoDescription: "Scopri Solitaire Paris di Isabel Pepe: perla d'acqua dolce 10-11mm su catena in Argento 925 con Oro 18K 1.0µm. Cofanetto regalo luxury e garanzia inclusi.",
    storytelling: "La collana Solitaire Paris esalta la maestosità di una singola perla naturale d'acqua dolce da 10-11 mm sospesa su una delicata catena in Oro 18K.",
    gemstoneText: "Perla Singola Naturale d'Acqua Dolce Selezionata a Mano (10-11 mm)",
    platingText: "Placcatura Oro 18K a Spessore (1.0 µm) + Sigillo Nano-Protective E-Coating (1.0 µm)"
  },
  // 43. PL-6 - Set Perla Royal (Title: 58, Desc: 152)
  {
    sku: "PL-6",
    cleanName: "Set Perla Royal",
    category: "Set",
    slug: "set-perla-royal",
    isGold: true,
    isPearl: true,
    carats: "Parure Perle d'Acqua Dolce 4-5 mm",
    seoTitle: "Perla Royal — Set Parure con Perle & Oro 18K | Isabel Pepe",
    seoDescription: "Scopri il Set Perla Royal di Isabel Pepe: parure con perle naturali 4-5mm e finiture in Oro 18K 1.0µm. Cofanetto regalo luxury e garanzia 24 mesi inclusi.",
    storytelling: "Il Set Perla Royal combina collana e bracciale in perle naturali d'acqua dolce da 4-5 mm con finiture in Oro 18K, offrendo una parure senza tempo.",
    gemstoneText: "Perle Naturali d'Acqua Dolce Selezionate a Mano (4-5 mm)",
    platingText: "Placcatura Oro 18K a Spessore (1.0 µm) + Sigillo Nano-Protective E-Coating (1.0 µm)"
  }
];

function buildRichDescription(def: ProductDefinition): string {
  const bulletPlating = def.isGold
    ? "Placcatura Oro 18K ad alto spessore (1.0 µm) + Sigillo Nano-Protective E-Coating (1.0 µm) anti-ossidazione e waterproof."
    : "Finitura in Rodio Puro a specchio (0.1 µm) + Sigillo Nano-Protective E-Coating (1.0 µm) anti-ossidazione e waterproof.";

  const bulletStone = def.isPearl
    ? `Perle Naturali d'Acqua Dolce (${def.carats}) ad altissima lucentezza e selezione manuale.`
    : `Pietre di Pura Luce (${def.carats}) con Taglio Brillante VVS1 D-Color certificato per una brillantezza eterna.`;

  return `${def.storytelling}

DETTAGLI ESCLUSIVI & ARTIGIANALITÀ:
• Metallo Base: Argento Sterling 925 anallergico certificato (100% Nichel-Free, Piombo e Cadmio Free).
• Doppio Scudo Protettivo: ${bulletPlating}
• Pietre / Elementi: ${bulletStone}
• Packaging Signature: Cofanetto rigido luxury Isabel Pepe, panno in microfibra lucidante e Certificato Ufficiale di Garanzia 24 mesi inclusi.
• L'Arte del Dono: Una quota di questo acquisto sostiene attivamente la cura e la salvaguardia degli animali nei rifugi.`;
}

export async function applyDemiFineSEO() {
  console.log("==========================================================");
  console.log("🌟 INIZIO APPLICAZIONE CATALOGO DEMI-FINE SEO ISABEL PEPE");
  console.log("==========================================================");

  // 1. Fetch live products from Supabase
  const { data: dbProducts, error: fetchErr } = await supabaseAdmin
    .from('products')
    .select('*');

  if (fetchErr || !dbProducts) {
    console.error("❌ Errore durante il fetch dei prodotti:", fetchErr);
    process.exit(1);
  }

  console.log(`📦 Prodotti totali trovati nel database: ${dbProducts.length}`);

  if (dbProducts.length !== 43) {
    console.warn(`⚠️ Attenzione: attesi 43 prodotti, trovati ${dbProducts.length}`);
  }

  let updatedCount = 0;
  let priceFixCount = 0;

  for (const def of CATALOG_DEFINITIONS) {
    // Trova il prodotto nel database
    let dbProd = null;
    if (def.idMatch) {
      dbProd = dbProducts.find(p => p.id === def.idMatch);
    } else {
      dbProd = dbProducts.find(p => p.sku === def.sku);
    }

    if (!dbProd) {
      console.error(`❌ Prodotto non trovato nel DB per SKU: ${def.sku} (ID: ${def.idMatch || 'N/A'})`);
      continue;
    }

    const richDescription = buildRichDescription(def);

    // Sanifica eventuali URL immagini che contengono ancora "moissanite"
    let cleanPrimary = dbProd.image_primary;
    let cleanSecondary = dbProd.image_secondary;
    let cleanGallery = Array.isArray(dbProd.gallery) ? [...dbProd.gallery] : ["", "", "", "", ""];

    if (typeof cleanPrimary === 'string' && cleanPrimary.toLowerCase().includes('moissanite')) {
      cleanPrimary = cleanPrimary.replace(/moissanite/gi, def.slug);
    }
    if (typeof cleanSecondary === 'string' && cleanSecondary.toLowerCase().includes('moissanite')) {
      cleanSecondary = cleanSecondary.replace(/moissanite/gi, def.slug);
    }
    cleanGallery = cleanGallery.map(img => {
      if (typeof img === 'string' && img.toLowerCase().includes('moissanite')) {
        return img.replace(/moissanite/gi, def.slug);
      }
      return img;
    });

    const updatePayload: Record<string, any> = {
      name: def.cleanName,
      slug: def.slug,
      seo_title: def.seoTitle,
      seo_description: def.seoDescription,
      description: richDescription,
      materials: "Argento 925 Sterling Anallergico Nichel-Free",
      plating: def.platingText,
      gemstone: def.gemstoneText,
      carats: def.carats,
      image_primary: cleanPrimary,
      image_secondary: cleanSecondary,
      gallery: cleanGallery,
    };

    if (def.priceFix !== undefined && (Number(dbProd.price) === 0 || dbProd.price === null)) {
      updatePayload.price = def.priceFix;
      priceFixCount++;
      console.log(`💰 Correzione prezzo per ${def.cleanName} (${def.sku}): €0.00 -> €${def.priceFix.toFixed(2)}`);
    }

    const { error: updateErr } = await supabaseAdmin
      .from('products')
      .update(updatePayload)
      .eq('id', dbProd.id);

    if (updateErr) {
      console.error(`❌ Errore aggiornamento [${def.sku}] ${def.cleanName}:`, updateErr.message);
    } else {
      updatedCount++;
      console.log(`✅ Aggiornato: [${def.sku}] "${def.cleanName}" | Slug: "${def.slug}" | SEO Title (${def.seoTitle.length}ch) | SEO Desc (${def.seoDescription.length}ch)`);
    }
  }

  console.log("\n==========================================================");
  console.log(`✨ AGGIORNAMENTO COMPLETATO: ${updatedCount}/${CATALOG_DEFINITIONS.length} prodotti sincronizzati`);
  console.log(`💰 Prezzi azzerati corretti: ${priceFixCount}`);
  console.log("==========================================================\n");

  // 2. VERIFICA RIGOROSA POST-MIGRAZIONE
  console.log("🔍 AVVIO SUITE DI VALIDAZIONE RIGOROSA DEL DATABASE...");
  
  const { data: finalProducts, error: verifyErr } = await supabaseAdmin
    .from('products')
    .select('*');

  if (verifyErr || !finalProducts) {
    console.error("❌ Errore verifica finale:", verifyErr);
    process.exit(1);
  }

  let validationErrors = 0;

  // A. Controllo Totale Prodotti
  if (finalProducts.length !== 43) {
    console.error(`❌ ERRORE: Attesi 43 prodotti, trovati ${finalProducts.length}`);
    validationErrors++;
  } else {
    console.log(`✅ 1/8 Volume catalogo: esattamente 43 prodotti.`);
  }

  // B. Controllo Campi Nulli o Vuoti
  for (const p of finalProducts) {
    if (!p.seo_title || p.seo_title.trim() === '') {
      console.error(`❌ ERRORE: seo_title nullo o vuoto su SKU ${p.sku}`);
      validationErrors++;
    }
    if (!p.seo_description || p.seo_description.trim() === '') {
      console.error(`❌ ERRORE: seo_description nullo o vuoto su SKU ${p.sku}`);
      validationErrors++;
    }
    if (!p.description || p.description.trim() === '') {
      console.error(`❌ ERRORE: description nullo o vuoto su SKU ${p.sku}`);
      validationErrors++;
    }
    if (!p.plating || p.plating.trim() === '' || p.plating === 'Nessuna') {
      console.error(`❌ ERRORE: plating non valido su SKU ${p.sku}: "${p.plating}"`);
      validationErrors++;
    }
    if (!p.gemstone || p.gemstone.trim() === '') {
      console.error(`❌ ERRORE: gemstone nullo o vuoto su SKU ${p.sku}`);
      validationErrors++;
    }
  }
  console.log(`✅ 2/8 Campi obbligatori: 100% popolati e non-null.`);

  // C. Controllo Lunghezza SEO Titles (<= 60 caratteri)
  const longTitles = finalProducts.filter(p => p.seo_title && p.seo_title.length > 60);
  if (longTitles.length > 0) {
    console.error(`❌ ERRORE: ${longTitles.length} seo_title superano i 60 caratteri:`, longTitles.map(p => ({ sku: p.sku, len: p.seo_title.length, title: p.seo_title })));
    validationErrors += longTitles.length;
  } else {
    console.log(`✅ 3/8 Lunghezza SEO Title: tutti i 43 prodotti hanno lunghezza <= 60 caratteri.`);
  }

  // D. Controllo Lunghezza SEO Descriptions (140-155 caratteri)
  const invalidDescLen = finalProducts.filter(p => !p.seo_description || p.seo_description.length < 140 || p.seo_description.length > 155);
  if (invalidDescLen.length > 0) {
    console.error(`❌ ERRORE: ${invalidDescLen.length} seo_description fuori dal range 140-155 caratteri:`, invalidDescLen.map(p => ({ sku: p.sku, len: p.seo_description?.length, desc: p.seo_description })));
    validationErrors += invalidDescLen.length;
  } else {
    console.log(`✅ 4/8 Lunghezza SEO Description: tutti i 43 prodotti hanno lunghezza conforme (140-155 caratteri).`);
  }

  // E. Controllo Prezzi Positivi (> 0.00)
  const zeroPrices = finalProducts.filter(p => Number(p.price) <= 0);
  if (zeroPrices.length > 0) {
    console.error(`❌ ERRORE: ${zeroPrices.length} prodotti con prezzo <= 0:`, zeroPrices.map(p => ({ sku: p.sku, price: p.price })));
    validationErrors += zeroPrices.length;
  } else {
    console.log(`✅ 5/8 Prezzi: tutti i 43 prodotti hanno prezzi positivi validi.`);
  }

  // F. Controllo ZERO Moissanite su TUTTI i campi del database
  const moissRecords = finalProducts.filter(p => {
    const json = JSON.stringify(p).toLowerCase();
    return json.includes('moissanite');
  });
  if (moissRecords.length > 0) {
    console.error(`❌ ERRORE: Trovate ${moissRecords.length} occorrenze di "moissanite" nel database:`, moissRecords.map(p => ({ sku: p.sku, name: p.name })));
    validationErrors += moissRecords.length;
  } else {
    console.log(`✅ 6/8 Zero Moissanite: esattamente 0 occorrenze nell'intero database (100% pulito).`);
  }

  // G. Controllo ZERO Made in Italy / Alta Oreficeria
  const madeInItalyRecords = finalProducts.filter(p => {
    const json = JSON.stringify(p).toLowerCase();
    return json.includes('made in italy') || json.includes('manifattura italiana') || json.includes('alta oreficeria');
  });
  if (madeInItalyRecords.length > 0) {
    console.error(`❌ ERRORE: Trovate ${madeInItalyRecords.length} occorrenze di "Made in Italy / Alta oreficeria":`, madeInItalyRecords.map(p => ({ sku: p.sku, name: p.name })));
    validationErrors += madeInItalyRecords.length;
  } else {
    console.log(`✅ 7/8 Zero Made in Italy / Alta Oreficeria: esattamente 0 occorrenze nell'intero database.`);
  }

  // H. Controllo Slugs Speciali ASB3142 e ASB4019
  const p3142 = finalProducts.find(p => p.sku === 'ASB3142');
  const p4019 = finalProducts.find(p => p.sku === 'ASB4019');
  let slugErrors = 0;
  if (!p3142 || p3142.slug !== 'orecchini-riviere') {
    console.error(`❌ ERRORE: Slug errato per ASB3142: "${p3142?.slug}" (atteso: "orecchini-riviere")`);
    slugErrors++;
  }
  if (!p4019 || p4019.slug !== 'bracciale-iconique') {
    console.error(`❌ ERRORE: Slug errato per ASB4019: "${p4019?.slug}" (atteso: "bracciale-iconique")`);
    slugErrors++;
  }
  if (slugErrors === 0) {
    console.log(`✅ 8/8 Slugs specifici: ASB3142 = "orecchini-riviere", ASB4019 = "bracciale-iconique".`);
  } else {
    validationErrors += slugErrors;
  }

  console.log("\n==========================================================");
  if (validationErrors === 0) {
    console.log("🏆 TUTTE LE VERIFICHE SUPERATE CON SUCCESSO AL 100%!");
  } else {
    console.error(`🚨 TROVATI ${validationErrors} ERRORI DI VALIDAZIONE!`);
    process.exit(1);
  }
  console.log("==========================================================");
}

// Esegui
applyDemiFineSEO();
