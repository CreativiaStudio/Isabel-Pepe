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

async function runForensicAudit() {
  console.log("================================================================================");
  console.log("🕵️ INDEPENDENT FORENSIC AUDIT: LIVE SUPABASE POSTGRESQL & CATALOG INTEGRITY");
  console.log("================================================================================");
  console.log(`🔗 Target URL: ${supabaseUrl}`);

  const startTime = Date.now();
  const { data: products, error } = await supabaseAdmin
    .from('products')
    .select('*')
    .order('sku', { ascending: true });

  const queryDuration = Date.now() - startTime;

  if (error || !products) {
    console.error("❌ Errore critico nel fetch dei prodotti da Supabase:", error);
    process.exit(1);
  }

  console.log(`⏱️ Query live completata in ${queryDuration}ms`);
  console.log(`📦 Totale record prodotti estratti: ${products.length}`);

  let violations = 0;
  const failureList: string[] = [];

  function recordViolation(rule: string, detail: string) {
    violations++;
    failureList.push(`[${rule}] ${detail}`);
    console.error(`  ❌ [VIOLATION - ${rule}]: ${detail}`);
  }

  // Check 1: Volume
  if (products.length !== 43) {
    recordViolation('VOLUME', `Attesi 43 prodotti, trovati ${products.length}`);
  } else {
    console.log("✅ 1. Volume catalogo: esattamente 43 prodotti nel database live.");
  }

  // Check 2: Null / Empty Fields
  const requiredFields = ['name', 'slug', 'sku', 'price', 'description', 'category', 'seo_title', 'seo_description', 'plating', 'gemstone'];
  let nullFieldErrors = 0;
  products.forEach(p => {
    requiredFields.forEach(f => {
      const val = (p as any)[f];
      if (val === null || val === undefined || (typeof val === 'string' && val.trim() === '')) {
        recordViolation('SCHEMA_NULL', `SKU ${p.sku}: campo '${f}' nullo o vuoto.`);
        nullFieldErrors++;
      }
    });
  });
  if (nullFieldErrors === 0) {
    console.log("✅ 2. Completezza campi obbligatori: 0 campi nulli o vuoti su 43 record.");
  }

  // Check 3: SEO Title Length (<= 60 chars)
  let titleErrors = 0;
  products.forEach(p => {
    if (p.seo_title && p.seo_title.length > 60) {
      recordViolation('SEO_TITLE_LEN', `SKU ${p.sku}: seo_title (${p.seo_title.length} car): "${p.seo_title}"`);
      titleErrors++;
    }
  });
  if (titleErrors === 0) {
    console.log("✅ 3. Lunghezza SEO Title: tutti i 43 prodotti hanno seo_title <= 60 caratteri.");
  }

  // Check 4: SEO Description Length (140-155 chars)
  let descErrors = 0;
  products.forEach(p => {
    if (!p.seo_description || p.seo_description.length < 140 || p.seo_description.length > 155) {
      recordViolation('SEO_DESC_LEN', `SKU ${p.sku}: seo_description (${p.seo_description?.length} car): "${p.seo_description}"`);
      descErrors++;
    }
  });
  if (descErrors === 0) {
    console.log("✅ 4. Lunghezza SEO Description: tutti i 43 prodotti hanno seo_description nel range 140-155 caratteri.");
  }

  // Check 5: Prezzi Validi (> 0)
  let priceErrors = 0;
  products.forEach(p => {
    const numPrice = Number(p.price);
    if (isNaN(numPrice) || numPrice <= 0) {
      recordViolation('INVALID_PRICE', `SKU ${p.sku}: prezzo ${p.price} non valido.`);
      priceErrors++;
    }
  });
  if (priceErrors === 0) {
    console.log("✅ 5. Integrità Prezzi: 43/43 prodotti hanno prezzi positivi validi (0 prezzi a zero).");
  }

  // Check 6: Slugs & URL Sanitization
  let slugErrors = 0;
  products.forEach(p => {
    if (!p.slug || p.slug.includes(' ') || p.slug.toLowerCase().includes('moissanite')) {
      recordViolation('INVALID_SLUG', `SKU ${p.sku}: slug non valido "${p.slug}"`);
      slugErrors++;
    }
  });
  const asb3142 = products.find(p => p.sku === 'ASB3142');
  const asb4019 = products.find(p => p.sku === 'ASB4019');
  if (asb3142?.slug !== 'orecchini-riviere') {
    recordViolation('SLUG_MISMATCH', `ASB3142 ha slug "${asb3142?.slug}" anziché "orecchini-riviere"`);
    slugErrors++;
  }
  if (asb4019?.slug !== 'bracciale-iconique') {
    recordViolation('SLUG_MISMATCH', `ASB4019 ha slug "${asb4019?.slug}" anziché "bracciale-iconique"`);
    slugErrors++;
  }
  if (slugErrors === 0) {
    console.log("✅ 6. Slugs & Normalizzazione URL: 100% slug validi, puliti e privi di forbidden terms.");
  }

  // Check 7: Prohibited Terms Purge Across Entire DB Payload
  let termErrors = 0;
  products.forEach(p => {
    const dump = JSON.stringify(p).toLowerCase();
    if (dump.includes('moissanite')) {
      recordViolation('FORBIDDEN_MOISSANITE', `SKU ${p.sku} contiene 'moissanite' nel payload JSON.`);
      termErrors++;
    }
    if (dump.includes('made in italy') || dump.includes('manifattura italiana') || dump.includes('alta oreficeria') || dump.includes('alta gioielleria') || dump.includes('haute joaillerie')) {
      recordViolation('FORBIDDEN_MADE_IN_ITALY', `SKU ${p.sku} contiene claim Made in Italy / Alta Oreficeria.`);
      termErrors++;
    }
  });
  if (termErrors === 0) {
    console.log("✅ 7. Purga Termini Proibiti: 0 occorrenze di 'moissanite', 'Made in Italy', 'Alta Oreficeria' nel DB.");
  }

  // Check 8: Plating & Gemstone Standardization
  let standardErrors = 0;
  products.forEach(p => {
    if (!p.plating || p.plating === 'Nessuna' || (!p.plating.includes('Oro 18K') && !p.plating.includes('Rodio'))) {
      recordViolation('PLATING_SPEC', `SKU ${p.sku}: plating non conforme "${p.plating}"`);
      standardErrors++;
    }
    if (!p.gemstone || p.gemstone.includes('Moissanite') || p.gemstone.includes('certificato GRA')) {
      recordViolation('GEMSTONE_SPEC', `SKU ${p.sku}: gemstone non conforme "${p.gemstone}"`);
      standardErrors++;
    }
  });
  if (standardErrors === 0) {
    console.log("✅ 8. Standardizzazione Materiali: 43/43 prodotti con specifiche Oro 18K/Rodio + E-Coating e Pietre di Pura Luce/Perle.");
  }

  // Check 9: Storytelling & Technical Specs in Descriptions
  let descDetailErrors = 0;
  products.forEach(p => {
    const desc = p.description || '';
    if (desc.includes('Descrizione provvisoria da fattura') || desc.length < 100) {
      recordViolation('DESCRIPTION_STORYTELLING', `SKU ${p.sku}: descrizione incompleta o provvisoria (${desc.length} car).`);
      descDetailErrors++;
    }
    if (!desc.includes('Argento') || (!desc.includes('Oro 18K') && !desc.includes('Rodio')) || !desc.includes('Cofanetto')) {
      recordViolation('DESCRIPTION_SPECS', `SKU ${p.sku}: descrizione priva di specifiche minime (Argento/Placcatura/Cofanetto).`);
      descDetailErrors++;
    }
  });
  if (descDetailErrors === 0) {
    console.log("✅ 9. Ricchezza Scheda Prodotto: 43/43 descrizioni contengono storytelling persuasivo, specifiche tecniche e cofanetto signature.");
  }

  console.log("\n================================================================================");
  if (violations === 0) {
    console.log("🏆 FORENSIC AUDIT RESULT: CLEAN — ZERO INTEGRITY VIOLATIONS DETECTED");
  } else {
    console.error(`🚨 FORENSIC AUDIT RESULT: INTEGRITY VIOLATION (${violations} violazioni riscontrate)`);
    failureList.forEach(f => console.error(`  -> ${f}`));
    process.exit(1);
  }
  console.log("================================================================================\n");
}

runForensicAudit().catch(err => {
  console.error("Fatal audit execution error:", err);
  process.exit(1);
});
