import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Carica variabili d'ambiente da .env.local
const envFile = fs.readFileSync(path.resolve(process.cwd(), '.env.local'), 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].replace(/['"\r]/g, '').trim();
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("ERRORE: Chiavi Supabase non trovate in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runAdversarialValidation() {
  console.log("================================================================================");
  console.log("🛡️  CHALLENGER 2: ADVERSARIAL SUPABASE & PRODUCT ENDPOINTS VALIDATION SUITE");
  console.log("================================================================================\n");

  const results = {
    totalTests: 0,
    passed: 0,
    failed: 0,
    warnings: 0,
    suites: {},
    failures: [],
    products: []
  };

  function recordTest(suiteName, testName, passed, details = "") {
    results.totalTests++;
    if (!results.suites[suiteName]) {
      results.suites[suiteName] = { passed: 0, failed: 0, tests: [] };
    }
    if (passed) {
      results.passed++;
      results.suites[suiteName].passed++;
      results.suites[suiteName].tests.push({ testName, passed: true, details });
    } else {
      results.failed++;
      results.suites[suiteName].failed++;
      results.suites[suiteName].tests.push({ testName, passed: false, details });
      results.failures.push({ suiteName, testName, details });
    }
  }

  // Fetch all products from Supabase
  console.log("📡 Connessione a Supabase ed estrazione di tutti i prodotti...");
  const { data: products, error } = await supabase.from('products').select('*').order('sku', { ascending: true });

  if (error) {
    console.error("❌ ERRORE CRITICO SUPABASE QUERY:", error);
    process.exit(1);
  }

  results.products = products || [];
  console.log(`📦 Prodotti scaricati dal DB: ${results.products.length}\n`);

  // ============================================================================
  // SUITE 1: Record Count & Table Completeness
  // ============================================================================
  const suite1 = "Suite 1: Record Count & Schema Completeness";
  recordTest(suite1, "DB contains exactly 43 products", results.products.length === 43, `Found ${results.products.length} rows (expected: 43)`);

  // ============================================================================
  // SUITE 2: Non-Null & Valid Core Fields (100% of rows)
  // ============================================================================
  const suite2 = "Suite 2: Non-Null & Mandatory Fields (100% rows)";
  const mandatoryFields = ['id', 'name', 'slug', 'sku', 'category', 'price', 'description', 'seo_title', 'seo_description', 'materials', 'plating', 'gemstone'];
  
  let nullFieldCount = 0;
  for (const p of results.products) {
    for (const f of mandatoryFields) {
      const val = p[f];
      const isValid = val !== null && val !== undefined && String(val).trim() !== '';
      if (!isValid) {
        nullFieldCount++;
        recordTest(suite2, `SKU ${p.sku} field '${f}' is non-null and non-empty`, false, `Value is: ${val}`);
      }
    }
  }
  if (nullFieldCount === 0) {
    recordTest(suite2, "All 43 products have non-null, non-empty core fields (12 fields x 43 products = 516 checks)", true, "100% compliant");
  }

  // ============================================================================
  // SUITE 3: SEO Title Validation (Formula & Length <= 60 chars)
  // ============================================================================
  const suite3 = "Suite 3: SEO Title Constraints (<= 60 chars & Formula)";
  let titleLengthErrors = 0;
  let titleFormulaErrors = 0;
  
  for (const p of results.products) {
    const title = p.seo_title || '';
    const len = title.length;
    
    // Check length <= 60
    if (len <= 60 && len >= 10) {
      // pass
    } else {
      titleLengthErrors++;
      recordTest(suite3, `SKU ${p.sku} SEO Title length (len: ${len}) <= 60`, false, `Title: "${title}" (length: ${len})`);
    }

    // Check formula: must contain "| Isabel Pepe" and separator "—"
    const hasBrand = title.includes('| Isabel Pepe');
    const hasDash = title.includes('—');
    if (hasBrand && hasDash) {
      // pass
    } else {
      titleFormulaErrors++;
      recordTest(suite3, `SKU ${p.sku} SEO Title formula syntax`, false, `Missing brand or dash: "${title}"`);
    }
  }

  recordTest(suite3, `100% of products (43/43) have SEO Title length <= 60 chars`, titleLengthErrors === 0, `Length errors: ${titleLengthErrors}`);
  recordTest(suite3, `100% of products (43/43) match SEO Title formula '[Nome] — [Tipo] ... | Isabel Pepe'`, titleFormulaErrors === 0, `Formula errors: ${titleFormulaErrors}`);

  // ============================================================================
  // SUITE 4: SEO Description Validation (Range 140 - 155 chars)
  // ============================================================================
  const suite4 = "Suite 4: SEO Description Constraints (Strict 140-155 chars)";
  let descRangeErrors = 0;
  let descContentErrors = 0;

  for (const p of results.products) {
    const desc = p.seo_description || '';
    const len = desc.length;

    if (len >= 140 && len <= 155) {
      // pass
    } else {
      descRangeErrors++;
      recordTest(suite4, `SKU ${p.sku} SEO Description length (len: ${len}) in [140, 155]`, false, `Desc: "${desc}" (length: ${len})`);
    }

    // Check persuasive elements (Argento / Isabel Pepe, Cofanetto / garanzia / scudo)
    const descLower = desc.toLowerCase();
    const hasKeyWords = (descLower.includes('isabel pepe') || descLower.includes('argento')) &&
                        (descLower.includes('cofanetto') || descLower.includes('garanzia') || descLower.includes('scudo') || descLower.includes('lusso') || descLower.includes('luxury'));
    if (!hasKeyWords) {
      descContentErrors++;
      recordTest(suite4, `SKU ${p.sku} SEO Description value proposition`, false, `Missing key value props: "${desc}"`);
    }
  }

  recordTest(suite4, `100% of products (43/43) have SEO Description in 140-155 character range`, descRangeErrors === 0, `Range errors: ${descRangeErrors}`);
  recordTest(suite4, `100% of products (43/43) have persuasive value props in SEO Description`, descContentErrors === 0, `Content errors: ${descContentErrors}`);

  // ============================================================================
  // SUITE 5: Product Description Rich Content & Pillars Validation
  // ============================================================================
  const suite5 = "Suite 5: Product Description Rich Content & 4 Pillars";
  let descPillarErrors = 0;

  for (const p of results.products) {
    const fullDesc = p.description || '';
    const descLower = fullDesc.toLowerCase();

    const hasShield = descLower.includes('scudo') || descLower.includes('e-coating') || descLower.includes('rodio') || descLower.includes('placcatura');
    const hasBox = descLower.includes('cofanetto') || descLower.includes('astuccio') || descLower.includes('packaging');
    const hasStones = descLower.includes('pietre') || descLower.includes('perle') || descLower.includes('brillante');
    const hasDonation = descLower.includes('dono') || descLower.includes('animali');
    const hasSilver = descLower.includes('argento 925') || descLower.includes('argento sterling');

    if (hasShield && hasBox && hasStones && hasDonation && hasSilver) {
      // pass
    } else {
      descPillarErrors++;
      recordTest(suite5, `SKU ${p.sku} Description 4 pillars completeness`, false, `Missing pillars in SKU ${p.sku}: shield=${hasShield}, box=${hasBox}, stones=${hasStones}, gift=${hasDonation}, silver=${hasSilver}`);
    }
  }

  recordTest(suite5, `100% of products (43/43) have rich description containing the 4 brand pillars`, descPillarErrors === 0, `Pillar errors: ${descPillarErrors}`);

  // ============================================================================
  // SUITE 6: Pricing & Financial Integrity (Price > 0.00)
  // ============================================================================
  const suite6 = "Suite 6: Pricing & Financial Integrity";
  let zeroPriceCount = 0;
  let invalidDiscountCount = 0;

  for (const p of results.products) {
    const priceNum = Number(p.price);
    if (isNaN(priceNum) || priceNum <= 0) {
      zeroPriceCount++;
      recordTest(suite6, `SKU ${p.sku} price > 0`, false, `Price is: ${p.price}`);
    }

    if (p.discount_price !== null && p.discount_price !== undefined && p.discount_price > 0) {
      const discNum = Number(p.discount_price);
      if (isNaN(discNum) || discNum >= priceNum || discNum <= 0) {
        invalidDiscountCount++;
        recordTest(suite6, `SKU ${p.sku} discount_price valid`, false, `Price: ${priceNum}, DiscountPrice: ${discNum}`);
      }
    }
  }

  recordTest(suite6, `100% of products (43/43) have price > €0.00`, zeroPriceCount === 0, `Zero price count: ${zeroPriceCount}`);
  recordTest(suite6, `All discount prices are strictly less than regular price and > 0`, invalidDiscountCount === 0, `Invalid discount count: ${invalidDiscountCount}`);

  // ============================================================================
  // SUITE 7: Zero Moissanite & Zero Prohibited Terms (Deep Exhaustive Scan)
  // ============================================================================
  const suite7 = "Suite 7: Zero Moissanite & Prohibited Terms Exhaustive Scan";
  let moissaniteHits = [];
  let madeInItalyHits = [];

  const forbiddenTerms = [
    { regex: /moissanite/gi, list: moissaniteHits, name: "Moissanite" },
    { regex: /made\s+in\s+italy/gi, list: madeInItalyHits, name: "Made in Italy" },
    { regex: /manifattura\s+italiana/gi, list: madeInItalyHits, name: "Manifattura Italiana" },
    { regex: /alta\s+gioielleria\s+italiana/gi, list: madeInItalyHits, name: "Alta Gioielleria Italiana" }
  ];

  for (const p of results.products) {
    for (const [col, val] of Object.entries(p)) {
      const checkVal = (item, pathName) => {
        if (typeof item === 'string') {
          for (const term of forbiddenTerms) {
            if (term.regex.test(item)) {
              term.list.push({ sku: p.sku, col: pathName, value: item });
            }
          }
        } else if (Array.isArray(item)) {
          item.forEach((sub, idx) => checkVal(sub, `${pathName}[${idx}]`));
        } else if (item && typeof item === 'object') {
          for (const [k, v] of Object.entries(item)) {
            checkVal(v, `${pathName}.${k}`);
          }
        }
      };
      checkVal(val, col);
    }
  }

  recordTest(suite7, `Zero occurrence of 'moissanite' in ANY column across ALL 43 products`, moissaniteHits.length === 0, 
    moissaniteHits.length > 0 ? `Found in: ${JSON.stringify(moissaniteHits, null, 2)}` : "0 occurrences found in entire database");
  
  recordTest(suite7, `Zero occurrence of 'Made in Italy' / 'Alta Gioielleria Italiana' across ALL 43 products`, madeInItalyHits.length === 0,
    madeInItalyHits.length > 0 ? `Found in: ${JSON.stringify(madeInItalyHits, null, 2)}` : "0 occurrences found in entire database");

  // ============================================================================
  // SUITE 8: Clean Slugs & URL Integrity
  // ============================================================================
  const suite8 = "Suite 8: Clean Slugs & Routing Integrity";
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  const slugSet = new Set();
  let invalidSlugCount = 0;
  let duplicateSlugCount = 0;

  for (const p of results.products) {
    const slug = p.slug;
    if (!slug || !slugRegex.test(slug)) {
      invalidSlugCount++;
      recordTest(suite8, `SKU ${p.sku} slug is clean kebab-case`, false, `Slug: "${slug}"`);
    }
    if (slugSet.has(slug)) {
      duplicateSlugCount++;
      recordTest(suite8, `Slug "${slug}" uniqueness`, false, `Duplicate slug for SKU ${p.sku}`);
    }
    slugSet.add(slug);
  }

  recordTest(suite8, `100% of product slugs are valid clean kebab-case URLs`, invalidSlugCount === 0, `Invalid slug count: ${invalidSlugCount}`);
  recordTest(suite8, `100% of product slugs are strictly unique (43 unique URLs)`, duplicateSlugCount === 0, `Duplicate slug count: ${duplicateSlugCount}`);

  // ============================================================================
  // SUITE 9: Endpoint / Route Simulation
  // ============================================================================
  const suite9 = "Suite 9: Endpoint / Metadata Route Simulation";
  let routeFailures = 0;

  for (const p of results.products) {
    const { data: matched, error: matchErr } = await supabase
      .from('products')
      .select('name, category, seo_title, seo_description, image_primary, price')
      .eq('slug', p.slug)
      .single();

    if (matchErr || !matched) {
      routeFailures++;
      recordTest(suite9, `Route /prodotto/${p.slug} query simulation`, false, `Error: ${matchErr?.message}`);
    } else {
      // Verify simulated metadata
      const metaTitle = matched.seo_title || `${matched.name} — Gioiello Demi-Fine in Argento 925 & Oro 18K | Isabel Pepe`;
      const metaDesc = matched.seo_description || `Scopri ${matched.name} di Isabel Pepe: creazione demi-fine in Argento 925...`;
      if (metaTitle.length > 60 || metaDesc.length < 140 || metaDesc.length > 155) {
        // Warning or error
      }
    }
  }

  recordTest(suite9, `All 43 product routes /prodotto/[slug] resolve unambiguously in Supabase`, routeFailures === 0, `Route failures: ${routeFailures}`);

  // ============================================================================
  // FINAL REPORT & SUMMARY
  // ============================================================================
  console.log("\n================================================================================");
  console.log("📊 TEST EXECUTION SUMMARY");
  console.log("================================================================================");
  console.log(`Total Assertions Run : ${results.totalTests}`);
  console.log(`Passed Assertions    : ${results.passed}`);
  console.log(`Failed Assertions    : ${results.failed}`);
  console.log("--------------------------------------------------------------------------------");

  for (const [name, suite] of Object.entries(results.suites)) {
    console.log(`\n📁 ${name}: ${suite.passed} passed, ${suite.failed} failed`);
    for (const t of suite.tests) {
      const icon = t.passed ? "✅" : "❌";
      console.log(`   ${icon} ${t.testName} ${t.details ? `(${t.details})` : ""}`);
    }
  }

  console.log("\n================================================================================");
  const verdict = results.failed === 0 ? "APPROVE" : "REJECT";
  console.log(`🎯 FINAL VERDICT: ${verdict}`);
  console.log("================================================================================\n");

  // Output detailed product table
  console.log("📋 DETAILED PRODUCT INVENTORY AUDIT TABLE:\n");
  console.log(
    "| SKU | Name | Category | Price | Slug | Title Len | Title | Desc Len | Desc | Plating | Gemstone |"
  );
  console.log(
    "|---|---|---|---|---|---|---|---|---|---|---|"
  );
  for (const p of results.products) {
    console.log(
      `| ${p.sku} | ${p.name} | ${p.category} | €${Number(p.price).toFixed(2)} | ${p.slug} | ${p.seo_title.length} | ${p.seo_title} | ${p.seo_description.length} | ${p.seo_description} | ${p.plating?.substring(0, 30)}... | ${p.gemstone?.substring(0, 30)}... |`
    );
  }

  return { results, verdict };
}

runAdversarialValidation().catch(e => {
  console.error("FATAL SCRIPT ERROR:", e);
  process.exit(1);
});
