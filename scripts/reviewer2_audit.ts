import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Carica variabili d'ambiente da .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  console.error("❌ File .env.local non trovato");
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
  console.error("❌ Credenziali Supabase mancanti in .env.local");
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function runReviewer2Audit() {
  console.log("================================================================================");
  console.log("🕵️ REVIEWER 2 ADVERSARIAL AUDIT: CATALOG, SUPABASE & PRODUCT SEO");
  console.log("================================================================================");

  const { data: products, error } = await supabaseAdmin
    .from('products')
    .select('*');

  if (error || !products) {
    console.error("❌ Errore critico nel fetch dei prodotti da Supabase:", error);
    process.exit(1);
  }

  console.log(`📊 Totale record prodotti trovati nel DB: ${products.length}`);

  let totalFailures = 0;
  const failureLog: string[] = [];

  function recordFailure(msg: string) {
    totalFailures++;
    failureLog.push(msg);
    console.error(`  ❌ ${msg}`);
  }

  // 1. Audit Volume
  if (products.length !== 43) {
    recordFailure(`Conteggio prodotti errato: attesi 43, trovati ${products.length}`);
  } else {
    console.log("✅ [1/9] Volume catalogo: esattamente 43 prodotti.");
  }

  // 2. Audit SEO Titles
  let titleErrors = 0;
  products.forEach(p => {
    if (!p.seo_title || typeof p.seo_title !== 'string' || p.seo_title.trim().length === 0) {
      recordFailure(`[${p.sku}] seo_title mancante o vuoto`);
      titleErrors++;
      return;
    }
    const len = p.seo_title.length;
    if (len > 60) {
      recordFailure(`[${p.sku}] seo_title eccede 60 caratteri (${len} ch): "${p.seo_title}"`);
      titleErrors++;
    }
    if (!p.seo_title.includes('Isabel Pepe')) {
      recordFailure(`[${p.sku}] seo_title non contiene il brand 'Isabel Pepe': "${p.seo_title}"`);
      titleErrors++;
    }
  });
  if (titleErrors === 0) {
    console.log("✅ [2/9] SEO Titles: tutti i 43 prodotti hanno seo_title valido e <= 60 caratteri.");
  }

  // 3. Audit SEO Descriptions (140 - 155 chars)
  let descErrors = 0;
  products.forEach(p => {
    if (!p.seo_description || typeof p.seo_description !== 'string' || p.seo_description.trim().length === 0) {
      recordFailure(`[${p.sku}] seo_description mancante o vuoto`);
      descErrors++;
      return;
    }
    const len = p.seo_description.length;
    if (len < 140 || len > 155) {
      recordFailure(`[${p.sku}] seo_description fuori dal range 140-155 caratteri (${len} ch): "${p.seo_description}"`);
      descErrors++;
    }
    const descLower = p.seo_description.toLowerCase();
    if (!descLower.includes('cofanetto') && !descLower.includes('regalo') && !descLower.includes('garanzia')) {
      recordFailure(`[${p.sku}] seo_description manca di menzione di valore aggiunto (cofanetto/regalo/garanzia): "${p.seo_description}"`);
      descErrors++;
    }
  });
  if (descErrors === 0) {
    console.log("✅ [3/9] SEO Descriptions: tutti i 43 prodotti sono conformi nel range 140-155 caratteri.");
  }

  // 4. Audit Rich Descriptions (Storytelling + 5 Technical Bullets)
  let contentErrors = 0;
  products.forEach(p => {
    const desc = p.description || '';
    const descLower = desc.toLowerCase();

    // Check required sections / keywords
    const hasMetalloBase = descLower.includes('argento sterling 925') || descLower.includes('metallo base');
    const hasScudo = descLower.includes('doppio scudo protettivo') || descLower.includes('e-coating');
    const hasPietreOPerle = descLower.includes('pietre di pura luce') || descLower.includes('perle naturali') || descLower.includes('taglio brillante');
    const hasPackaging = descLower.includes('packaging signature') || descLower.includes('cofanetto rigido luxury');
    const hasAnimalDono = descLower.includes("l'arte del dono") || descLower.includes('salvaguardia degli animali');

    if (!hasMetalloBase || !hasScudo || !hasPietreOPerle || !hasPackaging || !hasAnimalDono) {
      recordFailure(`[${p.sku}] description incompleta nei bullet point obbligatori. Metallo:${hasMetalloBase}, Scudo:${hasScudo}, Pietre:${hasPietreOPerle}, Packaging:${hasPackaging}, Animali:${hasAnimalDono}`);
      contentErrors++;
    }
    if (desc.includes('Descrizione provvisoria da fattura')) {
      recordFailure(`[${p.sku}] description contiene testo provvisorio placeholder!`);
      contentErrors++;
    }
  });
  if (contentErrors === 0) {
    console.log("✅ [4/9] Rich Description: tutti i 43 prodotti contengono storytelling e tutti i 5 bullet point tecnici.");
  }

  // 5. Audit Prezzi (> 0.00)
  let priceErrors = 0;
  products.forEach(p => {
    const numPrice = Number(p.price);
    if (isNaN(numPrice) || numPrice <= 0) {
      recordFailure(`[${p.sku}] Prezzo non valido: ${p.price}`);
      priceErrors++;
    }
  });
  if (priceErrors === 0) {
    console.log("✅ [5/9] Prezzi catalogo: tutti i 43 prodotti hanno prezzi validi, positivi e > €0.00.");
  }

  // 6. Audit Slugs Sanitization
  let slugErrors = 0;
  const pASB3142 = products.find(p => p.sku === 'ASB3142');
  const pASB4019 = products.find(p => p.sku === 'ASB4019');

  if (!pASB3142 || pASB3142.slug !== 'orecchini-riviere') {
    recordFailure(`ASB3142 slug non sanitizzato: '${pASB3142?.slug}' (atteso: 'orecchini-riviere')`);
    slugErrors++;
  }
  if (!pASB4019 || pASB4019.slug !== 'bracciale-iconique') {
    recordFailure(`ASB4019 slug non sanitizzato: '${pASB4019?.slug}' (atteso: 'bracciale-iconique')`);
    slugErrors++;
  }

  products.forEach(p => {
    if (p.slug && p.slug.toLowerCase().includes('moissanite')) {
      recordFailure(`[${p.sku}] Slug contiene 'moissanite': ${p.slug}`);
      slugErrors++;
    }
  });
  if (slugErrors === 0) {
    console.log("✅ [6/9] Slugs sanitization: ASB3142='orecchini-riviere', ASB4019='bracciale-iconique', zero 'moissanite' negli slugs.");
  }

  // 7. Audit Zero Forbidden Terms across ENTIRE database
  let forbiddenTermErrors = 0;
  products.forEach(p => {
    const fullJson = JSON.stringify(p).toLowerCase();
    if (fullJson.includes('moissanite')) {
      recordFailure(`[${p.sku}] Trovata occorrenza di 'moissanite' nel record: ${JSON.stringify(p)}`);
      forbiddenTermErrors++;
    }
    if (fullJson.includes('made in italy')) {
      recordFailure(`[${p.sku}] Trovata occorrenza di 'made in italy' nel record: ${JSON.stringify(p)}`);
      forbiddenTermErrors++;
    }
    if (fullJson.includes('manifattura italiana')) {
      recordFailure(`[${p.sku}] Trovata occorrenza di 'manifattura italiana' nel record: ${JSON.stringify(p)}`);
      forbiddenTermErrors++;
    }
    if (fullJson.includes('alta oreficeria')) {
      recordFailure(`[${p.sku}] Trovata occorrenza di 'alta oreficeria' nel record: ${JSON.stringify(p)}`);
      forbiddenTermErrors++;
    }
    if (fullJson.includes('alta gioielleria italiana')) {
      recordFailure(`[${p.sku}] Trovata occorrenza di 'alta gioielleria italiana' nel record: ${JSON.stringify(p)}`);
      forbiddenTermErrors++;
    }
  });
  if (forbiddenTermErrors === 0) {
    console.log("✅ [7/9] Zero Forbidden Terms: esattamente 0 occorrenze di 'moissanite', 'Made in Italy', 'Alta oreficeria' nell'intero database.");
  }

  // 8. Audit Plating & Materials & Gemstone consistency
  let specErrors = 0;
  products.forEach(p => {
    if (!p.materials || p.materials.trim() === '') {
      recordFailure(`[${p.sku}] materials vuoto`);
      specErrors++;
    }
    if (!p.plating || p.plating.trim() === '' || p.plating === 'Nessuna') {
      recordFailure(`[${p.sku}] plating non valido: '${p.plating}'`);
      specErrors++;
    }
    if (!p.gemstone || p.gemstone.trim() === '' || p.gemstone === 'Nessuna') {
      recordFailure(`[${p.sku}] gemstone non valido: '${p.gemstone}'`);
      specErrors++;
    }
  });
  if (specErrors === 0) {
    console.log("✅ [8/9] Specifiche tecniche (materials, plating, gemstone): 100% popolate e valide.");
  }

  // 9. Audit Immagini e Gallery
  let imgErrors = 0;
  products.forEach(p => {
    if (!p.image_primary || typeof p.image_primary !== 'string' || p.image_primary.trim() === '') {
      recordFailure(`[${p.sku}] image_primary mancante o vuoto`);
      imgErrors++;
    }
    const primLower = (p.image_primary || '').toLowerCase();
    const secLower = (p.image_secondary || '').toLowerCase();
    const gallLower = JSON.stringify(p.gallery || []).toLowerCase();
    if (primLower.includes('moissanite') || secLower.includes('moissanite') || gallLower.includes('moissanite')) {
      recordFailure(`[${p.sku}] URL immagini contengono 'moissanite'`);
      imgErrors++;
    }
  });
  if (imgErrors === 0) {
    console.log("✅ [9/9] Image URLs & Gallery: 100% validi e zero occorrenze residue di moissanite nei path.");
  }

  console.log("================================================================================");
  console.log(`🏁 AUDIT COMPLETATO: ${totalFailures} errori riscontrati.`);
  console.log("================================================================================");

  if (totalFailures > 0) {
    console.error("🚨 DETTAGLIO FALLIMENTI:");
    failureLog.forEach(f => console.error(`  - ${f}`));
    process.exit(1);
  } else {
    console.log("🌟 VERDETTO SUPABASE DATABASE: 100% APPROVATO E CONFORME A TUTTI I CRITERI.");
  }
}

runReviewer2Audit();
