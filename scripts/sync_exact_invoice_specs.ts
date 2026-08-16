import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Carica variabili d'ambiente da .env.local
const envFile = fs.readFileSync(path.resolve(process.cwd(), '.env.local'), 'utf8');
const env: Record<string, string> = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].replace(/['"\r]/g, '').trim();
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

const invoiceData: any[] = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'scripts/invoice_data.json'), 'utf8'));

// Mappatura esatta SKU fattura -> Dettagli Tecnici Reali
const exactSpecs: Record<string, {
  name: string;
  category: string;
  isGold: boolean;
  plating: string;
  carats: string;
  gemstone: string;
}> = {
  "ASB3142": {
    name: "Orecchini Rivière",
    category: "Orecchini",
    isGold: false,
    plating: "Finitura Rodio Puro (0.1µm) + Nano-Coating (1.0µm)",
    carats: "0.80ct + 0.80ct (1.60 Carati Totali)",
    gemstone: "Pietre di Pura Luce (Taglio Brillante VVS1 D-Color)"
  },
  "BTB047": {
    name: "Siena Gold",
    category: "Collane",
    isGold: true,
    plating: "Placcatura Oro 18K (1.0µm) + Nano-Coating (1.0µm)",
    carats: "Taglio Brillante Pura Luce",
    gemstone: "Pietre di Pura Luce (Taglio Brillante VVS1 D-Color)"
  },
  "MS12242": {
    name: "Collana Chantilly",
    category: "Collane",
    isGold: false,
    plating: "Finitura Rodio Puro (0.1µm) + Nano-Coating (1.0µm)",
    carats: "3.20 Carati Totali",
    gemstone: "Pietre di Pura Luce (Taglio Brillante VVS1 D-Color)"
  },
  "MS1105": {
    name: "Collana Symbiose",
    category: "Collane",
    isGold: false,
    plating: "Finitura Rodio Puro (0.1µm) + Nano-Coating (1.0µm)",
    carats: "1.10 Carati",
    gemstone: "Pietre di Pura Luce (Taglio Brillante VVS1 D-Color)"
  },
  "ASB4064": {
    name: "Mon Amour Royale",
    category: "Bracciali",
    isGold: false,
    plating: "Finitura Rodio Puro (0.1µm) + Nano-Coating (1.0µm)",
    carats: "1.00 Carato",
    gemstone: "Pietre di Pura Luce (Taglio Brillante VVS1 D-Color)"
  },
  "MSR1075": {
    name: "Anello Constellation",
    category: "Anelli",
    isGold: false,
    plating: "Finitura Rodio Puro (0.1µm) + Nano-Coating (1.0µm)",
    carats: "1.00 Carato",
    gemstone: "Pietre di Pura Luce (Taglio Brillante VVS1 D-Color)"
  },
  "BTN005-SILVER": {
    name: "Collana Brera Silver",
    category: "Collane",
    isGold: false,
    plating: "Finitura Rodio Puro (0.1µm) + Nano-Coating (1.0µm)",
    carats: "Full Light Pavé",
    gemstone: "Pietre di Pura Luce (Taglio Brillante VVS1 D-Color)"
  },
  "BTN005-GOLD": {
    name: "Collana Brera Gold",
    category: "Collane",
    isGold: true,
    plating: "Placcatura Oro 18K (1.0µm) + Nano-Coating (1.0µm)",
    carats: "Full Light Pavé",
    gemstone: "Pietre di Pura Luce (Taglio Brillante VVS1 D-Color)"
  },
  "BTN006": {
    name: "Collana Éclipse",
    category: "Collane",
    isGold: false,
    plating: "Finitura Rodio Puro (0.1µm) + Nano-Coating (1.0µm)",
    carats: "Taglio Brillante Pura Luce",
    gemstone: "Pietre di Pura Luce (Taglio Brillante VVS1 D-Color)"
  },
  "MS1208": {
    name: "Collana Duo Harmonie",
    category: "Collane",
    isGold: false,
    plating: "Finitura Rodio Puro (0.1µm) + Nano-Coating (1.0µm)",
    carats: "1.00 Carato",
    gemstone: "Pietre di Pura Luce (Taglio Brillante VVS1 D-Color)"
  },
  "ASB3035": {
    name: "Orecchini Éternel",
    category: "Orecchini",
    isGold: false,
    plating: "Finitura Rodio Puro (0.1µm) + Nano-Coating (1.0µm)",
    carats: "0.50ct + 0.50ct (1.00 Carato Totale)",
    gemstone: "Pietre di Pura Luce (Taglio Brillante VVS1 D-Color)"
  },
  "MS1093": {
    name: "Collana L'Éternel",
    category: "Collane",
    isGold: false,
    plating: "Finitura Rodio Puro (0.1µm) + Nano-Coating (1.0µm)",
    carats: "0.60 Carati",
    gemstone: "Pietre di Pura Luce (Taglio Brillante VVS1 D-Color)"
  },
  "ASB0041": {
    name: "Orecchini Pétale d'Argent",
    category: "Orecchini",
    isGold: false,
    plating: "Finitura Rodio Puro (0.1µm) + Nano-Coating (1.0µm)",
    carats: "1.08ct + 1.08ct (2.16 Carati Totali)",
    gemstone: "Pietre di Pura Luce (Taglio Brillante VVS1 D-Color)"
  },
  "ASB4054-WHITE": {
    name: "Bracciale Harmonie White",
    category: "Bracciali",
    isGold: false,
    plating: "Finitura Rodio Puro (0.1µm) + Nano-Coating (1.0µm)",
    carats: "1.00 Carato",
    gemstone: "Pietre di Pura Luce (Taglio Brillante VVS1 D-Color)"
  },
  "ASB4054-PINK": {
    name: "Bracciale Eden Rose",
    category: "Bracciali",
    isGold: false,
    plating: "Finitura Rodio Puro (0.1µm) + Nano-Coating (1.0µm)",
    carats: "1.00 Carato (Cristalli Rosa)",
    gemstone: "Cristalli di Luce Rosa (Taglio Brillante)"
  },
  "MSR1089": {
    name: "Solitaire Gold Grace",
    category: "Anelli",
    isGold: true,
    plating: "Placcatura Oro 18K (1.0µm) + Nano-Coating (1.0µm)",
    carats: "1.00 Carato Solitario",
    gemstone: "Pietre di Pura Luce (Taglio Brillante VVS1 D-Color)"
  },
  "MSR1078": {
    name: "Anello Châtelaine Silver",
    category: "Anelli",
    isGold: false,
    plating: "Finitura Rodio Puro (0.1µm) + Nano-Coating (1.0µm)",
    carats: "1.00 Carato Solitario",
    gemstone: "Pietre di Pura Luce (Taglio Brillante VVS1 D-Color)"
  },
  "MSR1093": {
    name: "Anello Fleur de Lumière",
    category: "Anelli",
    isGold: false,
    plating: "Finitura Rodio Puro (0.1µm) + Nano-Coating (1.0µm)",
    carats: "1.00 Carato",
    gemstone: "Pietre di Pura Luce (Taglio Brillante VVS1 D-Color)"
  },
  "A180-SET": {
    name: "Set Vivienne",
    category: "Set",
    isGold: true,
    plating: "Placcatura Oro 18K (1.0µm) + Nano-Coating (1.0µm)",
    carats: "Taglio Brillante V-Design",
    gemstone: "Pietre di Pura Luce (Taglio Brillante VVS1 D-Color)"
  },
  "BTS018-EARRING": {
    name: "Glow Ribbon",
    category: "Orecchini",
    isGold: true,
    plating: "Placcatura Oro 18K (1.0µm) + Nano-Coating (1.0µm)",
    carats: "Taglio Brillante Pavé",
    gemstone: "Pietre di Pura Luce (Taglio Brillante VVS1 D-Color)"
  },
  "MS12236": {
    name: "Collana Métamorphose",
    category: "Collane",
    isGold: true,
    plating: "Placcatura Oro 18K (1.0µm) + Nano-Coating (1.0µm)",
    carats: "Farfalla Full Light Pavé",
    gemstone: "Pietre di Pura Luce (Taglio Brillante VVS1 D-Color)"
  },
  "BTB024": {
    name: "Eclat Royal",
    category: "Bracciali",
    isGold: true,
    plating: "Placcatura Oro 18K (1.0µm) + Nano-Coating (1.0µm)",
    carats: "Link Full Light",
    gemstone: "Pietre di Pura Luce (Taglio Brillante VVS1 D-Color)"
  },
  "ASB4068": {
    name: "Bracciale Tennis Monte Carlo",
    category: "Bracciali",
    isGold: false,
    plating: "Finitura Rodio Puro (0.1µm) + Nano-Coating (1.0µm)",
    carats: "0.50 Carati",
    gemstone: "Pietre di Pura Luce (Taglio Brillante VVS1 D-Color)"
  },
  "ASB4055": {
    name: "Bracciale Cascade",
    category: "Bracciali",
    isGold: false,
    plating: "Finitura Rodio Puro (0.1µm) + Nano-Coating (1.0µm)",
    carats: "Cascade Full Light",
    gemstone: "Pietre di Pura Luce (Taglio Brillante VVS1 D-Color)"
  },
  "MSR1139": {
    name: "Anello Imperial",
    category: "Anelli",
    isGold: false,
    plating: "Finitura Rodio Puro (0.1µm) + Nano-Coating (1.0µm)",
    carats: "3.60 Carati Multi-Light",
    gemstone: "Pietre di Pura Luce (Taglio Brillante VVS1 D-Color)"
  },
  "BTS036": {
    name: "Set Papillon Splendeur",
    category: "Set",
    isGold: false,
    plating: "Finitura Rodio Puro (0.1µm) + Nano-Coating (1.0µm)",
    carats: "1.00ct + 1.00ct",
    gemstone: "Pietre di Pura Luce (Taglio Brillante VVS1 D-Color)"
  },
  "MSR1220": {
    name: "Anello Lune d'Argent",
    category: "Anelli",
    isGold: false,
    plating: "Finitura Rodio Puro (0.1µm) + Nano-Coating (1.0µm)",
    carats: "2.00 Carati Solitario",
    gemstone: "Pietre di Pura Luce (Taglio Brillante VVS1 D-Color)"
  },
  "ASB3057": {
    name: "Orecchini Butterfly",
    category: "Orecchini",
    isGold: false,
    plating: "Finitura Rodio Puro (0.1µm) + Nano-Coating (1.0µm)",
    carats: "1.60 Carati Fiore",
    gemstone: "Pietre di Pura Luce (Taglio Brillante VVS1 D-Color)"
  },
  "A114": {
    name: "Orecchini Rêve",
    category: "Orecchini",
    isGold: false,
    plating: "Finitura Rodio Puro (0.1µm) + Nano-Coating (1.0µm)",
    carats: "0.20ct + 0.20ct (0.40 Carati Totali)",
    gemstone: "Pietre di Pura Luce (Taglio Brillante VVS1 D-Color)"
  },
  "ASB3141": {
    name: "Orecchini Soirée",
    category: "Orecchini",
    isGold: false,
    plating: "Finitura Rodio Puro (0.1µm) + Nano-Coating (1.0µm)",
    carats: "Full Light Soirée",
    gemstone: "Pietre di Pura Luce (Taglio Brillante VVS1 D-Color)"
  },
  "A113": {
    name: "Orecchini Duchesse",
    category: "Orecchini",
    isGold: false,
    plating: "Finitura Rodio Puro (0.1µm) + Nano-Coating (1.0µm)",
    carats: "0.50ct + 0.50ct (1.00 Carato Totale)",
    gemstone: "Pietre di Pura Luce (Taglio Brillante VVS1 D-Color)"
  },
  "MS1141": {
    name: "Fleur",
    category: "Collane",
    isGold: false,
    plating: "Finitura Rodio Puro (0.1µm) + Nano-Coating (1.0µm)",
    carats: "1.00 Carato",
    gemstone: "Pietre di Pura Luce (Taglio Brillante VVS1 D-Color)"
  },
  "BTN028": {
    name: "Isabel Romance",
    category: "Collane",
    isGold: true,
    plating: "Placcatura Oro 18K (1.0µm) + Nano-Coating (1.0µm)",
    carats: "Cuore Full Light Pavé",
    gemstone: "Pietre di Pura Luce (Taglio Brillante VVS1 D-Color)"
  },
  "ASB4019": {
    name: "Bracciale Iconique",
    category: "Bracciali",
    isGold: false,
    plating: "Finitura Rodio Puro (0.1µm) + Nano-Coating (1.0µm)",
    carats: "1.00 Carato",
    gemstone: "Pietre di Pura Luce (Taglio Brillante VVS1 D-Color)"
  },
  "ASB4043": {
    name: "Bracciale Radiance",
    category: "Bracciali",
    isGold: false,
    plating: "Finitura Rodio Puro (0.1µm) + Nano-Coating (1.0µm)",
    carats: "1.00 Carato",
    gemstone: "Pietre di Pura Luce (Taglio Brillante VVS1 D-Color)"
  },
  "MS1096": {
    name: "Collana étoile",
    category: "Collane",
    isGold: false,
    plating: "Finitura Rodio Puro (0.1µm) + Nano-Coating (1.0µm)",
    carats: "1.00 Carato",
    gemstone: "Pietre di Pura Luce (Taglio Brillante VVS1 D-Color)"
  },
  "ASB3093": {
    name: "Orecchini Joséphine",
    category: "Orecchini",
    isGold: false,
    plating: "Finitura Rodio Puro (0.1µm) + Nano-Coating (1.0µm)",
    carats: "Cristalli Rosa Taglio Brillante",
    gemstone: "Cristalli di Luce Rosa (Taglio Brillante)"
  },
  "A144": {
    name: "Set Versailles",
    category: "Set",
    isGold: false,
    plating: "Finitura Rodio Puro (0.1µm) + Nano-Coating (1.0µm)",
    carats: "Parure Completa di Luce",
    gemstone: "Pietre di Pura Luce (Taglio Brillante VVS1 D-Color)"
  },
  "A118": {
    name: "Orecchini Opéra",
    category: "Orecchini",
    isGold: true,
    plating: "Placcatura Oro 18K (1.0µm) + Nano-Coating (1.0µm)",
    carats: "Cerchio 15mm Pavé",
    gemstone: "Pietre di Pura Luce (Taglio Brillante VVS1 D-Color)"
  },
  "PL-6": {
    name: "Set Perla Royal",
    category: "Set",
    isGold: true,
    plating: "Placcatura Oro 18K (1.0µm) + Nano-Coating (1.0µm)",
    carats: "Perle d'Acqua Dolce 4~5mm",
    gemstone: "Perle Naturali d'Acqua Dolce Selezionate a Mano"
  },
  "PL-30": {
    name: "Vendôme Pearl",
    category: "Collane",
    isGold: true,
    plating: "Placcatura Oro 18K (1.0µm) + Nano-Coating (1.0µm)",
    carats: "Perle d'Acqua Dolce 5~6mm",
    gemstone: "Perle Naturali d'Acqua Dolce Selezionate a Mano"
  },
  "PL-40": {
    name: "Collana Solitaire Paris",
    category: "Collane",
    isGold: true,
    plating: "Placcatura Oro 18K (1.0µm) + Nano-Coating (1.0µm)",
    carats: "Perle d'Acqua Dolce 10~11mm",
    gemstone: "Perle Naturali d'Acqua Dolce Selezionate a Mano"
  },
  "PL-15-BRACELET": {
    name: "Set Sweet Romance",
    category: "Bracciali",
    isGold: true,
    plating: "Placcatura Oro 18K (1.0µm) + Nano-Coating (1.0µm)",
    carats: "Perle d'Acqua Dolce 7.5~8mm",
    gemstone: "Perle Naturali d'Acqua Dolce Selezionate a Mano"
  }
};

async function syncExactSpecs() {
  console.log("🚀 Sincronizzazione Rigorosa Fattura -> Database Prodotti...");

  const { data: products, error } = await supabaseAdmin.from('products').select('*');
  if (error || !products) {
    console.error("Errore fetch:", error);
    return;
  }

  let updated = 0;

  for (const p of products) {
    const spec = exactSpecs[p.sku];
    if (!spec) {
      console.warn(`[WARN] Nessuna specifica esatta trovata per SKU: ${p.sku} (${p.name})`);
      continue;
    }

    const platingShort = spec.isGold ? 'Oro 18K' : 'Rodio Puro';
    const categorySingular = spec.category === 'Orecchini' ? 'Orecchini' :
                             spec.category === 'Collane' ? 'Collana' :
                             spec.category === 'Anelli' ? 'Anello' :
                             spec.category === 'Bracciali' ? 'Bracciale' :
                             spec.category === 'Set' ? 'Parure Set' : 'Gioiello';

    const seoTitle = `${spec.name} — ${categorySingular} in ${platingShort} & Argento 925 | Isabel Pepe`;
    const seoDesc = `Scopri ${spec.name} di Isabel Pepe: creazione demi-fine in Argento 925 con ${spec.plating}, ${spec.gemstone.toLowerCase()} e cofanetto di lusso con panno e garanzia inclusi.`;

    let introText = "";
    if (spec.category === 'Collane') {
      introText = `La collana ${spec.name} incarna la purezza del design demi-fine. Realizzata in pregiato Argento 925 Sterling e rifinita con ${spec.plating}, è progettata per posarsi con grazia e donare una luminosità inalterabile giorno dopo giorno.`;
    } else if (spec.category === 'Orecchini') {
      introText = `Gli orecchini ${spec.name} esaltano i lineamenti con riflessi di pura luce. Totalmente anallergici e nichel-free, offrono il perfetto equilibrio tra leggerezza quotidiana e brillantezza sofisticata.`;
    } else if (spec.category === 'Anelli') {
      introText = `L'anello ${spec.name} celebra l'eleganza intramontabile. La perfetta incastonatura custodisce la pietra centrale, garantendo comfort impeccabile e massima resistenza all'acqua e all'ossidazione.`;
    } else if (spec.category === 'Bracciali') {
      introText = `Il bracciale ${spec.name} avvolge il polso con raffinata morbidezza. Dotato di chiusura di sicurezza e rifinito con ${spec.plating}, è pensato per accompagnarti in ogni momento della vita.`;
    } else {
      introText = `La parure ${spec.name} è una creazione coordinata esclusiva, concepita per un regalo indimenticabile o per un evento speciale. Cofanetto rigido di lusso, panno lucidante e certificato di garanzia 24 mesi inclusi.`;
    }

    const fullDescription = `${introText}

CARATTERISTICHE & VALORI ISABEL PEPE:
• 🛡️ Doppio Scudo Protettivo: ${spec.plating}. 100% anallergico, nichel-free, anti-ossidazione e resistente all'acqua.
• 💎 Specifiche Pietra: ${spec.gemstone}${spec.carats ? ` • Caratura / Misura: ${spec.carats}` : ''}.
• 🎁 Cofanetto Regalo Signature: Astuccio rigido luxury, panno lucidante in microfibra e certificato di garanzia 24 mesi inclusi in ogni ordine.
• 🌿 Metallo Nobile: Anima in pregiato Argento 925 Sterling certificato.
• 🐾 L'Arte del Dono: Una parte di ogni acquisto viene devoluta per sostenere rifugi e cure veterinarie per animali in difficoltà.`;

    const { error: updateErr } = await supabaseAdmin.from('products').update({
      name: spec.name,
      category: spec.category,
      plating: spec.plating,
      carats: spec.carats,
      gemstone: spec.gemstone,
      seo_title: seoTitle,
      seo_description: seoDesc.slice(0, 160),
      description: fullDescription
    }).eq('id', p.id);

    if (updateErr) {
      console.error(`❌ Errore ${spec.name}:`, updateErr.message);
    } else {
      console.log(`✅ [OK] ${spec.name} (${p.sku}) -> ${spec.plating} | ${spec.carats}`);
      updated++;
    }
  }

  console.log(`\n🎉 Sincronizzazione completata! ${updated} prodotti allineati perfettamente alla fattura di riferimento.`);
}

syncExactSpecs();
