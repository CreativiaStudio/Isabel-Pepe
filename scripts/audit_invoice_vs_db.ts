import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Carica variabili d'ambiente
const envFile = fs.readFileSync(path.resolve(process.cwd(), '.env.local'), 'utf8');
const env: Record<string, string> = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].replace(/['"\r]/g, '').trim();
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// FATTURA 1 (20260112IT - 6 articoli) + FATTURA 2 (20260316IT - 54 articoli di riga)
const allInvoices = [
  // --- FATTURA 1 (20260112IT) ---
  { invoice: "Fattura 1", sku: "ASB4031", name: "Bracciale S925 + moissanite 0.5+0.5ct + cz", qty: 1, cost: 35.22, plating: "Rodio 0.1um", category: "Bracciali" },
  { invoice: "Fattura 1", sku: "BTB023", name: "Bracciale S925 + moissanite 15+5cm", qty: 1, cost: 97.12, plating: "Oro 18K 1um", category: "Bracciali" },
  { invoice: "Fattura 1", sku: "MSR1101", name: "Anello S925 + moissanite 1ct US6 + cz", qty: 1, cost: 23.82, plating: "Rodio 0.1um", category: "Anelli" },
  { invoice: "Fattura 1", sku: "A145-EARRING", skuAlias: ["A145"], name: "Orecchini S925 + moissanite 0.5+0.5ct", qty: 1, cost: 33.20, plating: "Rodio 0.1um", category: "Orecchini" },
  { invoice: "Fattura 1", sku: "A145-NECKLACE", skuAlias: ["A145"], name: "Collana S925 + moissanite 0.5ct", qty: 1, cost: 33.60, plating: "Rodio 0.1um", category: "Collane" },
  { invoice: "Fattura 1", sku: "BTN006", name: "Collana S925 + moissanite (Eclipse)", qty: 1, cost: 77.24, plating: "Oro 18K 1um", category: "Collane" },

  // --- FATTURA 2 (20260316IT) ---
  { invoice: "Fattura 2", sku: "ASB3142", name: "Orecchini S925+ moissanite+ cz 0.8+0.8ct (Rivière)", qty: 1, cost: 35.28, plating: "Rodio 0.1um", category: "Orecchini" },
  { invoice: "Fattura 2", sku: "BTB047", name: "Collana S925+moissanite (Chérie)", qty: 1, cost: 68.49, plating: "Oro 18K 1um", category: "Collane" },
  { invoice: "Fattura 2", sku: "MS12242", name: "Collana S925+moissanite 3.2ct (Skyline)", qty: 2, cost: 49.36, plating: "Rodio 0.1um", category: "Collane" },
  { invoice: "Fattura 2", sku: "MS1105", name: "Collana S925+moissanite 1.1ct (Sourire)", qty: 2, cost: 36.64, plating: "Rodio 0.1um", category: "Collane" },
  { invoice: "Fattura 2", sku: "ASB4064", name: "Bracciale S925+moissanite 1ct (Mon Amour Royale / Halo)", qty: 2, cost: 32.71, plating: "Rodio 0.1um", category: "Bracciali" },
  { invoice: "Fattura 2", sku: "MSR1075", name: "Anello S925+ moissanite 1ct US6 (Diadema)", qty: 2, cost: 26.97, plating: "Rodio 0.1um", category: "Anelli" },
  { invoice: "Fattura 2", sku: "BTN005-SILVER", skuAlias: ["BTN005"], name: "Collana full moissanite Silver (Brera Silver)", qty: 2, cost: 64.00, plating: "Rodio 0.1um", category: "Collane" },
  { invoice: "Fattura 2", sku: "BTN005-GOLD", skuAlias: ["BTN005"], name: "Collana full moissanite Gold (Brera Gold)", qty: 2, cost: 77.03, plating: "Oro 18K 1um", category: "Collane" },
  { invoice: "Fattura 2", sku: "MS1208", name: "Collana cuore S925+ moissanite 1ct (Joséphine)", qty: 1, cost: 34.38, plating: "Rodio 0.1um", category: "Collane" },
  { invoice: "Fattura 2", sku: "ASB3035", name: "Orecchini cuori S925+moissanite 0.5+0.5ct (Cœur)", qty: 1, cost: 27.45, plating: "Rodio 0.1um", category: "Orecchini" },
  { invoice: "Fattura 2", sku: "MS1093", name: "Collana 3 cuori S925+moissanite 0.6ct (Isabel Romance)", qty: 1, cost: 31.38, plating: "Rodio 0.1um", category: "Collane" },
  { invoice: "Fattura 2", sku: "ASB0041", name: "Orecchini pendenti S925+moissanite 1.08+1.08ct (Cascade)", qty: 2, cost: 30.82, plating: "Rodio 0.1um", category: "Orecchini" },
  { invoice: "Fattura 2", sku: "ASB4054-WHITE", skuAlias: ["ASB4054"], name: "Bracciale S925+ moissanite White (Harmonie White)", qty: 1, cost: 43.67, plating: "Rodio 0.1um", category: "Bracciali" },
  { invoice: "Fattura 2", sku: "ASB4054-PINK", skuAlias: ["ASB4054"], name: "Bracciale S925+ moissanite Pink (Eden Rose)", qty: 1, cost: 47.36, plating: "Rodio 0.1um", category: "Bracciali" },
  { invoice: "Fattura 2", sku: "MSR1089", name: "Anello S925+moissanite 1ct Gold US6 (Aura)", qty: 1, cost: 31.82, plating: "Oro 18K 1um", category: "Anelli" },
  { invoice: "Fattura 2", sku: "MSR1078", name: "Anello S925+ moissanite 1ct Silver US6 (Solitaire)", qty: 1, cost: 26.97, plating: "Rodio 0.1um", category: "Anelli" },
  { invoice: "Fattura 2", sku: "MSR1093", name: "Anello fiore S925+ moissanite 1ct US6 (Fleur)", qty: 1, cost: 24.56, plating: "Rodio 0.1um", category: "Anelli" },
  { invoice: "Fattura 2", sku: "A180-NECKLACE", skuAlias: ["A180", "SET-VIVIENNE"], name: "Collana V S925+moissanite Gold (Vivienne Collana / Set)", qty: 2, cost: 44.28, plating: "Oro 18K 1um", category: "Collane" },
  { invoice: "Fattura 2", sku: "A180-EARRING", skuAlias: ["A180", "SET-VIVIENNE"], name: "Orecchini V S925+moissanite Gold (Vivienne Orecchini / Set)", qty: 2, cost: 38.18, plating: "Oro 18K 1um", category: "Orecchini" },
  { invoice: "Fattura 2", sku: "BTS018-NECKLACE", skuAlias: ["BTS018", "SET-GLOW-RIBBON"], name: "Collana fiocco S925+moissanite Gold (Glow Ribbon Collana / Set)", qty: 1, cost: 57.62, plating: "Oro 18K 1um", category: "Collane" },
  { invoice: "Fattura 2", sku: "BTS018-EARRING", skuAlias: ["BTS018", "SET-GLOW-RIBBON"], name: "Orecchini fiocco S925+moissanite Gold (Glow Ribbon Orecchini / Set)", qty: 1, cost: 58.03, plating: "Oro 18K 1um", category: "Orecchini" },
  { invoice: "Fattura 2", sku: "MS12236", name: "Collana farfalla full moissanite (Métamorphose)", qty: 1, cost: 47.24, plating: "Oro 18K 1um", category: "Collane" },
  { invoice: "Fattura 2", sku: "BTB024", name: "Bracciale link full moissanite (Éternité)", qty: 1, cost: 103.56, plating: "Oro 18K 1um", category: "Bracciali" },
  { invoice: "Fattura 2", sku: "ASB4068", name: "Bracciale tennis moissanite 0.5ct (Rivière / Grace)", qty: 4, cost: 35.45, plating: "Rodio 0.1um", category: "Bracciali" },
  { invoice: "Fattura 2", sku: "ASB4055", name: "Bracciale full moissanite (Cascade)", qty: 1, cost: 35.05, plating: "Rodio 0.1um", category: "Bracciali" },
  { invoice: "Fattura 2", sku: "MSR1139", name: "Anello multi moissanite 3.6ct US6 (Quintessence)", qty: 2, cost: 35.14, plating: "Rodio 0.1um", category: "Anelli" },
  { invoice: "Fattura 2", sku: "BTS036-NECKLACE", skuAlias: ["BTS036", "SET-PAPILLON"], name: "Collana farfalla Moissanite (Papillon Collana / Set)", qty: 1, cost: 33.30, plating: "Rodio 0.1um", category: "Collane" },
  { invoice: "Fattura 2", sku: "BTS036-EARRING", skuAlias: ["BTS036", "SET-PAPILLON"], name: "Orecchini farfalla Moissanite 1+1ct (Papillon Orecchini / Set)", qty: 1, cost: 33.64, plating: "Rodio 0.1um", category: "Orecchini" },
  { invoice: "Fattura 2", sku: "MSR1220", name: "Anello moissanite 2ct US6 (Soleil)", qty: 1, cost: 27.97, plating: "Rodio 0.1um", category: "Anelli" },
  { invoice: "Fattura 2", sku: "ASB3057", name: "Orecchini fiore moissanite 1.6ct (Ariel)", qty: 2, cost: 29.05, plating: "Rodio 0.1um", category: "Orecchini" },
  { invoice: "Fattura 2", sku: "A114", name: "Orecchini moissanite 0.2+0.2ct (Rêve)", qty: 2, cost: 23.86, plating: "Rodio 0.1um", category: "Orecchini" },
  { invoice: "Fattura 2", sku: "ASB3141", name: "Orecchini full moissanite (Soirée)", qty: 1, cost: 39.69, plating: "Rodio 0.1um", category: "Orecchini" },
  { invoice: "Fattura 2", sku: "A113", name: "Orecchini moissanite 0.5+0.5ct (Duchesse)", qty: 1, cost: 23.84, plating: "Rodio 0.1um", category: "Orecchini" },
  { invoice: "Fattura 2", sku: "MS1141", name: "Collana fiore moissanite 1ct (Fleur Royale)", qty: 1, cost: 33.38, plating: "Rodio 0.1um", category: "Collane" },
  { invoice: "Fattura 2", sku: "BTN028", name: "Collana cuore full moissanite (Sweet Romance)", qty: 1, cost: 80.46, plating: "Oro 18K 1um", category: "Collane" },
  { invoice: "Fattura 2", sku: "ASB4019", name: "Bracciale moissanite 1ct (Iconique)", qty: 1, cost: 31.63, plating: "Rodio 0.1um", category: "Bracciali" },
  { invoice: "Fattura 2", sku: "ASB4043", name: "Bracciale moissanite 1ct (Heritage)", qty: 1, cost: 29.99, plating: "Rodio 0.1um", category: "Bracciali" },
  { invoice: "Fattura 2", sku: "MS1096", name: "Collana moissanite 1ct (Lumière)", qty: 1, cost: 39.65, plating: "Rodio 0.1um", category: "Collane" },
  { invoice: "Fattura 2", sku: "ASB3093", name: "Orecchini pink zirconi (Joséphine Orecchini)", qty: 1, cost: 21.27, plating: "Rodio", category: "Orecchini" },
  { invoice: "Fattura 2", sku: "A144-NECKLACE", skuAlias: ["A144", "SET-VERSAILLES"], name: "Collana moissanite (Versailles Collana / Set)", qty: 1, cost: 42.15, plating: "Rodio 0.1um", category: "Collane" },
  { invoice: "Fattura 2", sku: "A144-EARRING", skuAlias: ["A144", "SET-VERSAILLES"], name: "Orecchini moissanite (Versailles Orecchini / Set)", qty: 1, cost: 48.50, plating: "Rodio 0.1um", category: "Orecchini" },
  { invoice: "Fattura 2", sku: "A118", name: "Orecchini cerchio 15mm (Opéra)", qty: 1, cost: 36.33, plating: "Oro 18K 1um", category: "Orecchini" },
  { invoice: "Fattura 2", sku: "PL-6-NECKLACE", skuAlias: ["PL-6", "SET-PERLA-ROYAL"], name: "Collana perle acqua dolce 4~5mm (Perla Royal Collana / Set)", qty: 5, cost: 49.84, plating: "Oro 18K 1um", category: "Collane" },
  { invoice: "Fattura 2", sku: "PL-6-BRACELET", skuAlias: ["PL-6", "SET-PERLA-ROYAL"], name: "Bracciale perle acqua dolce 4~5mm (Perla Royal Bracciale / Set)", qty: 5, cost: 22.89, plating: "Oro 18K 1um", category: "Bracciali" },
  { invoice: "Fattura 2", sku: "PL-30", name: "Collana perle acqua dolce 5~6mm (Vendôme Pearl)", qty: 5, cost: 59.81, plating: "Oro 18K 1um", category: "Collane" },
  { invoice: "Fattura 2", sku: "PL-40", name: "Collana perle acqua dolce 10~11mm (Majesté Pearl)", qty: 5, cost: 56.31, plating: "Oro 18K 1um", category: "Collane" },
  { invoice: "Fattura 2", sku: "PL-15-NECKLACE", skuAlias: ["PL-15", "SET-AURORA-PEARL"], name: "Collana perle acqua dolce 9~10mm (Aurora Pearl Collana / Set)", qty: 5, cost: 43.70, plating: "Oro 18K 1um", category: "Collane" },
  { invoice: "Fattura 2", sku: "PL-15-BRACELET", skuAlias: ["PL-15", "SET-AURORA-PEARL"], name: "Bracciale perle acqua dolce 7.5~8mm (Aurora Pearl Bracciale / Set)", qty: 5, cost: 24.92, plating: "Oro 18K 1um", category: "Bracciali" },
];

async function runAudit() {
  console.log("===============================================================================");
  console.log("                   AUDIT COMPLETO: FATTURE vs SITO ISABEL PEPE                 ");
  console.log("===============================================================================\n");

  const { data: dbProducts, error } = await supabaseAdmin.from('products').select('*').order('name');
  if (error || !dbProducts) {
    console.error("Errore fetch DB:", error);
    return;
  }

  console.log(`📊 Totale Prodotti nel Database: ${dbProducts.length}`);
  const completed = dbProducts.filter(p => p.is_active);
  const drafts = dbProducts.filter(p => !p.is_active);
  console.log(`   • Prodotti Completati (Attivi): ${completed.length}`);
  console.log(`   • Prodotti in Bozza (Nascosti): ${drafts.length}`);
  console.log(`\n📋 Totale Righe in Fattura 1: 6`);
  console.log(`📋 Totale Righe in Fattura 2: 54`);
  console.log(`📋 Totale Articoli Fatturati (Fattura 1 + Fattura 2): ${allInvoices.length}\n`);

  const matched: any[] = [];
  const missing: any[] = [];

  for (const inv of allInvoices) {
    const dbMatch = dbProducts.find(p => {
      const pSku = (p.sku || '').toLowerCase().trim();
      const invSku = inv.sku.toLowerCase().trim();
      if (pSku === invSku) return true;
      if (pSku.startsWith(invSku) || invSku.startsWith(pSku)) return true;
      if (inv.skuAlias && inv.skuAlias.some((a: string) => pSku === a.toLowerCase() || pSku.includes(a.toLowerCase()) || (p.slug || '').includes(a.toLowerCase()))) return true;
      return false;
    });

    if (dbMatch) {
      matched.push({
        invoice: inv.invoice,
        invoiceSku: inv.sku,
        invoiceName: inv.name,
        dbId: dbMatch.id,
        dbSku: dbMatch.sku,
        dbName: dbMatch.name,
        dbCategory: dbMatch.category,
        dbPrice: dbMatch.price,
        dbStatus: dbMatch.is_active ? '✅ COMPLETATO' : '📝 BOZZA',
        dbSlug: dbMatch.slug
      });
    } else {
      missing.push({
        invoice: inv.invoice,
        invoiceSku: inv.sku,
        invoiceName: inv.name,
        category: inv.category,
        plating: inv.plating,
        cost: inv.cost
      });
    }
  }

  console.log("-------------------------------------------------------------------------------");
  console.log(`✅ ARTICOLI PRESENTI NEL SITO (${matched.length}/${allInvoices.length}):`);
  console.log("-------------------------------------------------------------------------------");
  matched.forEach((m, i) => {
    console.log(`${i+1}. [${m.invoice} - ${m.invoiceSku}] -> DB: "${m.dbName}" (SKU: ${m.dbSku}) | Cat: ${m.dbCategory} | Prezzo: €${m.dbPrice} | Stato: ${m.dbStatus}`);
  });

  console.log("\n-------------------------------------------------------------------------------");
  console.log(`🚨 ARTICOLI IN FATTURA MANCANTI NEL SITO (${missing.length}):`);
  console.log("-------------------------------------------------------------------------------");
  if (missing.length === 0) {
    console.log("TUTTI I PRODOTTI IN FATTURA SONO STATI INSERITI NEL DATABASE!");
  } else {
    missing.forEach((m, i) => {
      console.log(`${i+1}. [${m.invoice}] SKU: "${m.invoiceSku}" | Descrizione: ${m.invoiceName} | Categoria: ${m.category} | Finitura: ${m.plating} | Costo: $${m.cost}`);
    });
  }

  // Prodotti nel DB che non sono stati matchati direttamente
  const unmatchedDb = dbProducts.filter(p => !matched.some(m => m.dbId === p.id));
  console.log("\n-------------------------------------------------------------------------------");
  console.log(`🔍 ALTRI PRODOTTI NEL DB (SET ACCORPATI O PRODOTTI EXTRA): (${unmatchedDb.length})`);
  console.log("-------------------------------------------------------------------------------");
  unmatchedDb.forEach((p, i) => {
    console.log(`${i+1}. "${p.name}" (SKU: ${p.sku}) | Cat: ${p.category} | Prezzo: €${p.price} | Stato: ${p.is_active ? '✅ COMPLETATO' : '📝 BOZZA'} | Slug: ${p.slug}`);
  });
}

runAudit();

