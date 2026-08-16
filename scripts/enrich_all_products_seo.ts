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

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Mancano le chiavi API per Supabase in .env.local");
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Carica mapping fattura
const invoicePath = path.resolve(process.cwd(), 'scripts/invoice_data.json');
let invoiceData: any[] = [];
if (fs.existsSync(invoicePath)) {
  invoiceData = JSON.parse(fs.readFileSync(invoicePath, 'utf8'));
}

function getInvoiceInfo(sku: string) {
  if (!sku) return null;
  const match = invoiceData.find(item => item.sku.toLowerCase() === sku.toLowerCase());
  if (match) return match;
  // Prova match parziale
  const prefix = sku.split('-')[0];
  return invoiceData.find(item => item.sku.toLowerCase().startsWith(prefix.toLowerCase())) || null;
}

function determinePlating(product: any, inv: any): { isGold: boolean; platingText: string; platingShort: string } {
  const nameLower = (product.name || '').toLowerCase();
  const skuLower = (product.sku || '').toLowerCase();
  const currentPlating = (product.plating || '').toLowerCase();
  const invPlating = inv ? (inv.plating || '').toLowerCase() : '';

  const isGold = nameLower.includes('gold') || 
                 nameLower.includes('oro') || 
                 skuLower.includes('gold') || 
                 currentPlating.includes('oro') || 
                 currentPlating.includes('18k') || 
                 invPlating.includes('oro') || 
                 nameLower.includes('eden rose') || 
                 nameLower.includes('siena') || 
                 nameLower.includes('soleil') || 
                 nameLower.includes('aurora') || 
                 nameLower.includes('papillon') || 
                 nameLower.includes('vivienne') || 
                 nameLower.includes('vendôme');

  if (isGold) {
    return {
      isGold: true,
      platingText: 'Placcatura Oro 18K a Spessore (1.0 µm) + Nano-Protective E-Coating (1.0 µm)',
      platingShort: 'Oro 18K'
    };
  } else {
    return {
      isGold: false,
      platingText: 'Finitura in Rodio Puro a Specchio (0.1 µm) + Nano-Protective E-Coating (1.0 µm)',
      platingShort: 'Rodio Puro & Argento 925'
    };
  }
}

function determineGemstone(product: any, inv: any): { gemstoneText: string; isPearl: boolean } {
  const nameLower = (product.name || '').toLowerCase();
  const currentGem = (product.gemstone || '').toLowerCase();
  const invGem = inv ? (inv.gemstone || '').toLowerCase() : '';

  if (nameLower.includes('pearl') || nameLower.includes('perle') || currentGem.includes('perle') || invGem.includes('perle')) {
    return {
      gemstoneText: "Perle Naturali d'Acqua Dolce Selezionate a Mano",
      isPearl: true
    };
  }

  if (nameLower.includes('pink') || nameLower.includes('rose') || (inv && inv.carats && inv.carats.includes('pink'))) {
    return {
      gemstoneText: "Pietre di Luce Rosa ad Altissima Rifrazione (Taglio Brillante)",
      isPearl: false
    };
  }

  return {
    gemstoneText: "Pietre di Pura Luce ad Altissima Rifrazione (Taglio Brillante VVS1 D-Color)",
    isPearl: false
  };
}

async function enrichAllProducts() {
  console.log("🚀 Inizio arricchimento catalogo Isabel Pepe (Posizionamento Demi-Fine)...");

  const { data: products, error } = await supabaseAdmin.from('products').select('*');
  if (error || !products) {
    console.error("Errore fetch prodotti:", error);
    return;
  }

  console.log(`Trovati ${products.length} prodotti nel database.`);
  let updatedCount = 0;

  for (const p of products) {
    const inv = getInvoiceInfo(p.sku);
    const { isGold, platingText, platingShort } = determinePlating(p, inv);
    const { gemstoneText, isPearl } = determineGemstone(p, inv);

    // 1. Pulizia Nome Prodotto da "Moissanite" o diciture grezze
    let cleanName = p.name
      .replace(/moissanite/gi, '')
      .replace(/s925\+/gi, '')
      .replace(/s925/gi, '')
      .replace(/full/gi, '')
      .replace(/cz/gi, '')
      .replace(/\s+/g, ' ')
      .trim();

    // 2. SEO Title (Formula: [Nome] — [Tipo Gioiello] in [Placcatura] & Argento 925 | Isabel Pepe)
    const categorySingular = p.category === 'Orecchini' ? 'Orecchini' :
                             p.category === 'Collane' ? 'Collana' :
                             p.category === 'Anelli' ? 'Anello' :
                             p.category === 'Bracciali' ? 'Bracciale' :
                             p.category === 'Set' ? 'Parure Set' : 'Gioiello';

    let seoTitle = `${cleanName} — ${categorySingular} in ${platingShort} & Argento 925 | Isabel Pepe`;
    if (seoTitle.length > 70) {
      seoTitle = `${cleanName} — ${categorySingular} in ${platingShort} | Isabel Pepe`;
    }

    // 3. SEO Description (140-155 caratteri orientata a regalo, durabilità e lusso accessibile)
    let seoDesc = `Scopri ${cleanName}: creazione demi-fine in Argento 925 con ${isGold ? 'placcatura Oro 18K 1.0µm' : 'finitura in Rodio Puro'} e doppio scudo E-Coating. Cofanetto regalo luxury e garanzia inclusi.`;
    if (seoDesc.length > 160) {
      seoDesc = `Scopri ${cleanName} di Isabel Pepe: creazione demi-fine in Argento 925, doppio scudo protettivo, cofanetto regalo e garanzia 24 mesi inclusi.`;
    }

    // 4. Descrizione Narrativa Persuasiva + Bullet Points Tecnici
    let introText = "";
    if (p.category === 'Collane') {
      introText = `La collana ${cleanName} incarna l'essenza della luce contemporanea. Disegnata per posarsi con grazia sul décolleté, unisce la purezza dell'Argento 925 Sterling a una finitura preziosa e resistente, donando una radiosità naturale sia di giorno che nelle occasioni più esclusive.`;
    } else if (p.category === 'Orecchini') {
      introText = `Gli orecchini ${cleanName} sono pensati per incorniciare il volto con riflessi di pura eleganza. Leggeri, comodi e totalmente anallergici, donano uno scintillio continuo ad ogni movimento senza mai appesantire il lobo.`;
    } else if (p.category === 'Anelli') {
      introText = `L'anello ${cleanName} celebra l'eleganza intramontabile e la forza del design demi-fine. La sua incastonatura a regola d'arte valorizza la purezza della pietra centrale, offrendo un comfort impeccabile per essere indossato ogni giorno.`;
    } else if (p.category === 'Bracciali') {
      introText = `Il bracciale ${cleanName} unisce armonia geometrica e scintillio vibrante. Studiato per avvolgere il polso con morbidezza, offre una chiusura di sicurezza raffinata ed una resistenza straordinaria all'usura quotidiana.`;
    } else {
      introText = `La parure ${cleanName} è una composizione armoniosa creata per regalare un'emozione indimenticabile. Un set coordinato dal fascino eterno che illumina con sofisticata discrezione.`;
    }

    const fullDescription = `${introText}

CARATTERISTICHE & VALORI ISABEL PEPE:
• 🛡️ Doppio Scudo Protettivo: ${platingText}. 100% anallergico, nichel-free, anti-ossidazione e resistente all'acqua.
• 🎁 Cofanetto Regalo Signature: Astuccio rigido luxury, panno lucidante in microfibra e certificato di garanzia 24 mesi inclusi in ogni ordine.
• ✨ Pietre di Pura Luce: ${gemstoneText}.
• 🌿 Metallo Nobile: Anima in pregiato Argento 925 Sterling certificato.
• 🐾 L'Arte del Dono: Una parte di ogni acquisto viene devoluta per sostenere rifugi e cure veterinarie per animali in difficoltà.`;

    // 5. Aggiornamento record nel database Supabase
    const { error: updateErr } = await supabaseAdmin.from('products').update({
      name: cleanName,
      seo_title: seoTitle,
      seo_description: seoDesc,
      description: fullDescription,
      materials: 'Argento 925 Sterling Anallergico Nichel-Free',
      plating: platingText,
      gemstone: gemstoneText,
    }).eq('id', p.id);

    if (updateErr) {
      console.error(`❌ Errore aggiornamento ${cleanName} (${p.sku}):`, updateErr.message);
    } else {
      console.log(`✅ Aggiornato: [${p.sku}] ${cleanName} -> ${seoTitle}`);
      updatedCount++;
    }
  }

  console.log(`\n🎉 Operazione completata! ${updatedCount} prodotti aggiornati con successo nel database Supabase.`);
}

enrichAllProducts();
