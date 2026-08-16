import * as fs from 'fs';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';

const projectRoot = process.cwd();

// Load .env.local
const envPath = path.resolve(projectRoot, '.env.local');
const env = {};
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split(/\r?\n/).forEach(line => {
    const idx = line.indexOf('=');
    if (idx !== -1) {
      const k = line.substring(0, idx).trim();
      const v = line.substring(idx + 1).trim().replace(/^['"]|['"]$/g, '');
      env[k] = v;
    }
  });
}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

async function runFinalChallengerVerification() {
  console.log("================================================================================");
  console.log("🛡️  CHALLENGER 3: FINAL EMPIRICAL VERIFICATION HARNESS");
  console.log("================================================================================\n");

  const results = {
    totalTests: 0,
    passed: 0,
    failed: 0,
    suites: {},
    failures: [],
    details: {}
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

  // ============================================================================
  // SUITE 1: APP/PAGE.TSX & FRONTEND PURITY (ZERO MOISSANITE & BANNED CLAIMS)
  // ============================================================================
  const s1 = "Suite 1: Frontend Code & Content Purity";

  // 1A. app/page.tsx check
  const pageContent = fs.readFileSync(path.join(projectRoot, 'app', 'page.tsx'), 'utf8');
  const moissInPage = /moissanite/i.test(pageContent);
  recordTest(s1, "app/page.tsx has zero occurrences of 'moissanite' in text or URLs", !moissInPage,
    moissInPage ? "Found moissanite in app/page.tsx" : "0 occurrences verified");

  // 1B. All files in app/, components/, lib/, public/
  const publicFiles = [];
  function scanDir(dir) {
    if (!fs.existsSync(dir)) return;
    for (const item of fs.readdirSync(dir)) {
      const full = path.join(dir, item);
      if (fs.statSync(full).isDirectory()) scanDir(full);
      else if (/\.(tsx|ts|js|jsx|json|css|md|html)$/i.test(full)) publicFiles.push(full);
    }
  }
  ['app', 'components', 'lib', 'public'].forEach(d => scanDir(path.join(projectRoot, d)));

  let moissPublicHits = [];
  let bannedPublicHits = [];
  const bannedTermsRegex = /(made\s+in\s+italy|manifattura\s+italiana|alta\s+gioielleria|alta\s+oreficeria|haute\s+joaillerie)/i;

  for (const f of publicFiles) {
    const rel = path.relative(projectRoot, f);
    const content = fs.readFileSync(f, 'utf8');
    const lines = content.split('\n');
    lines.forEach((l, idx) => {
      if (/moissanite/i.test(l)) {
        moissPublicHits.push({ file: rel, line: idx + 1, text: l.trim() });
      }
      if (bannedTermsRegex.test(l)) {
        bannedPublicHits.push({ file: rel, line: idx + 1, text: l.trim() });
      }
    });
  }

  recordTest(s1, "All frontend source files (app, components, lib, public) have zero 'moissanite'", moissPublicHits.length === 0,
    moissPublicHits.length > 0 ? `Hits: ${JSON.stringify(moissPublicHits, null, 2)}` : `Scanned ${publicFiles.length} files: 0 occurrences`);

  recordTest(s1, "All frontend source files have zero 'Made in Italy' / 'Alta Gioielleria'", bannedPublicHits.length === 0,
    bannedPublicHits.length > 0 ? `Hits: ${JSON.stringify(bannedPublicHits, null, 2)}` : `Scanned ${publicFiles.length} files: 0 occurrences`);

  // ============================================================================
  // SUITE 2: PRE-RENDERED HTML METADATA & H1 VALIDATION
  // ============================================================================
  const s2 = "Suite 2: Pre-rendered HTML Metadata & Semantic H1 Verification";
  const nextHtmlDir = path.join(projectRoot, '.next', 'server', 'app');

  let htmlFiles = [];
  if (fs.existsSync(nextHtmlDir)) {
    function findHtmlFiles(dir) {
      for (const item of fs.readdirSync(dir)) {
        const full = path.join(dir, item);
        if (fs.statSync(full).isDirectory()) findHtmlFiles(full);
        else if (item.endsWith('.html') && !item.startsWith('_') && item !== '404.html' && item !== '500.html') {
          htmlFiles.push(full);
        }
      }
    }
    findHtmlFiles(nextHtmlDir);
  }

  let titleErrors = [];
  let descErrors = [];
  let h1Discrepancies = [];
  const pageAuditTable = [];

  for (const f of htmlFiles) {
    const rel = path.relative(nextHtmlDir, f);
    const content = fs.readFileSync(f, 'utf8');

    // Title
    const titleMatch = content.match(/<title>([^<]*)<\/title>/);
    const title = titleMatch ? titleMatch[1].replace(/&amp;/g, '&').replace(/&#x27;/g, "'") : '';
    const titleLen = title.length;

    // Description
    const descMatch = content.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i) ||
                      content.match(/<meta\s+content=["']([^"']*)["']\s+name=["']description["']/i);
    const desc = descMatch ? descMatch[1].replace(/&amp;/g, '&').replace(/&#x27;/g, "'") : '';
    const descLen = desc.length;

    // H1
    const h1Matches = content.match(/<h1[\s\S]*?<\/h1>/gi) || [];
    const h1Count = h1Matches.length;
    const h1Text = h1Matches.map(h => h.replace(/<[^>]+>/g, '').trim()).join(' | ');

    pageAuditTable.push({
      route: rel.replace(/index\.html$/, '').replace(/\.html$/, '') || '/',
      title,
      titleLen,
      desc,
      descLen,
      h1Count,
      h1Text
    });

    if (titleLen === 0 || titleLen > 60) {
      titleErrors.push({ route: rel, title, length: titleLen });
    }

    if (descLen < 140 || descLen > 155) {
      descErrors.push({ route: rel, desc, length: descLen });
    }

    if (h1Count !== 1) {
      h1Discrepancies.push({ route: rel, count: h1Count, text: h1Text });
    }
  }

  recordTest(s2, "All pre-rendered static routes have <title> length strictly <= 60 chars", titleErrors.length === 0,
    titleErrors.length > 0 ? `Errors: ${JSON.stringify(titleErrors, null, 2)}` : `All ${htmlFiles.length} rendered pages compliant (max observed: ${Math.max(...pageAuditTable.map(p => p.titleLen))} chars)`);

  recordTest(s2, "All pre-rendered static routes have <meta description> strictly in [140, 155] chars", descErrors.length === 0,
    descErrors.length > 0 ? `Errors: ${JSON.stringify(descErrors, null, 2)}` : `All ${htmlFiles.length} rendered pages compliant (range: ${Math.min(...pageAuditTable.map(p => p.descLen))} - ${Math.max(...pageAuditTable.map(p => p.descLen))} chars)`);

  recordTest(s2, "All pre-rendered static routes have exactly ONE semantic <h1> tag (including /login)", h1Discrepancies.length === 0,
    h1Discrepancies.length > 0 ? `Errors: ${JSON.stringify(h1Discrepancies, null, 2)}` : `All ${htmlFiles.length} rendered pages have exactly 1 <h1>`);

  // Login page specific verification
  const loginEntry = pageAuditTable.find(p => p.route === 'login' || p.route.includes('login'));
  recordTest(s2, "Route /login renders exactly 1 semantic <h1> tag with proper title & description", 
    !!loginEntry && loginEntry.h1Count === 1 && loginEntry.titleLen <= 60 && loginEntry.descLen >= 140 && loginEntry.descLen <= 155,
    loginEntry ? `H1: "${loginEntry.h1Text}", Title (${loginEntry.titleLen}): "${loginEntry.title}", Desc (${loginEntry.descLen}): "${loginEntry.desc}"` : "Login page not found");

  // ============================================================================
  // SUITE 3: SUPABASE 43-PRODUCT COMPREHENSIVE AUDIT
  // ============================================================================
  const s3 = "Suite 3: Supabase 43-Product Catalog Audit";

  let products = [];
  if (supabase) {
    const { data, error } = await supabase.from('products').select('*').order('sku', { ascending: true });
    if (error) {
      console.error("Supabase Query Error:", error);
    } else {
      products = data || [];
    }
  }

  recordTest(s3, "Supabase product count equals exactly 43", products.length === 43, `Found ${products.length} products`);

  let dbMoiss = [];
  let dbBanned = [];
  let dbTitleErrors = [];
  let dbDescErrors = [];
  let dbPillarErrors = [];
  let dbPriceErrors = [];
  let dbSlugErrors = [];
  const slugSet = new Set();

  for (const p of products) {
    const pJson = JSON.stringify(p);
    if (/moissanite/i.test(pJson)) dbMoiss.push({ sku: p.sku, name: p.name });
    if (bannedTermsRegex.test(pJson)) dbBanned.push({ sku: p.sku, name: p.name });

    const title = p.seo_title || '';
    if (title.length === 0 || title.length > 60) {
      dbTitleErrors.push({ sku: p.sku, title, len: title.length });
    }

    const desc = p.seo_description || '';
    if (desc.length < 140 || desc.length > 155) {
      dbDescErrors.push({ sku: p.sku, desc, len: desc.length });
    }

    const price = Number(p.price);
    if (isNaN(price) || price <= 0) {
      dbPriceErrors.push({ sku: p.sku, price: p.price });
    }

    const fullDesc = (p.description || '').toLowerCase();
    const hasShield = fullDesc.includes('scudo') || fullDesc.includes('e-coating') || fullDesc.includes('rodio') || fullDesc.includes('placcatura');
    const hasBox = fullDesc.includes('cofanetto') || fullDesc.includes('astuccio') || fullDesc.includes('packaging');
    const hasStones = fullDesc.includes('pietre') || fullDesc.includes('perle') || fullDesc.includes('brillante');
    const hasDonation = fullDesc.includes('dono') || fullDesc.includes('animali');
    const hasSilver = fullDesc.includes('argento 925') || fullDesc.includes('argento sterling');

    if (!hasShield || !hasBox || !hasStones || !hasDonation || !hasSilver) {
      dbPillarErrors.push({ sku: p.sku, shield: hasShield, box: hasBox, stones: hasStones, donation: hasDonation, silver: hasSilver });
    }

    if (!p.slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p.slug) || slugSet.has(p.slug)) {
      dbSlugErrors.push({ sku: p.sku, slug: p.slug });
    }
    slugSet.add(p.slug);
  }

  recordTest(s3, "Zero 'moissanite' in all columns across all 43 products", dbMoiss.length === 0,
    dbMoiss.length > 0 ? `Found in: ${JSON.stringify(dbMoiss)}` : "43/43 clean");

  recordTest(s3, "Zero 'Made in Italy' / 'Alta Gioielleria' in all columns across all 43 products", dbBanned.length === 0,
    dbBanned.length > 0 ? `Found in: ${JSON.stringify(dbBanned)}` : "43/43 clean");

  recordTest(s3, "All 43 products have seo_title strictly <= 60 chars", dbTitleErrors.length === 0,
    dbTitleErrors.length > 0 ? `Errors: ${JSON.stringify(dbTitleErrors, null, 2)}` : `43/43 compliant (max title len: ${Math.max(...products.map(p => (p.seo_title || '').length))} chars)`);

  recordTest(s3, "All 43 products have seo_description strictly in [140, 155] chars", dbDescErrors.length === 0,
    dbDescErrors.length > 0 ? `Errors: ${JSON.stringify(dbDescErrors, null, 2)}` : `43/43 compliant (range: ${Math.min(...products.map(p => (p.seo_description || '').length))} - ${Math.max(...products.map(p => (p.seo_description || '').length))} chars)`);

  recordTest(s3, "All 43 products have valid commercial pricing (price > €0.00)", dbPriceErrors.length === 0,
    dbPriceErrors.length > 0 ? `Errors: ${JSON.stringify(dbPriceErrors)}` : "43/43 valid");

  recordTest(s3, "All 43 products include rich description with 4 brand pillars", dbPillarErrors.length === 0,
    dbPillarErrors.length > 0 ? `Errors: ${JSON.stringify(dbPillarErrors, null, 2)}` : "43/43 compliant");

  recordTest(s3, "All 43 products have unique, valid kebab-case slugs", dbSlugErrors.length === 0,
    dbSlugErrors.length > 0 ? `Errors: ${JSON.stringify(dbSlugErrors, null, 2)}` : "43/43 unique & valid");

  // ============================================================================
  // PRINT SUMMARY & REPORT
  // ============================================================================
  console.log("\n================================================================================");
  console.log("📊 FINAL VERIFICATION RESULTS SUMMARY");
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

  const verdict = results.failed === 0 ? "APPROVE" : "REJECT";
  console.log("\n================================================================================");
  console.log(`🎯 FINAL VERDICT: ${verdict}`);
  console.log("================================================================================\n");

  console.log("📄 PRE-RENDERED STATIC ROUTES AUDIT TABLE:");
  console.log("| Route | Title (len) | Title | Meta Desc (len) | Meta Description | H1 (Count) | H1 Text |");
  console.log("|---|---|---|---|---|---|---|");
  for (const r of pageAuditTable) {
    console.log(`| ${r.route} | ${r.titleLen} | ${r.title} | ${r.descLen} | ${r.desc} | ${r.h1Count} | ${r.h1Text} |`);
  }

  return { results, verdict, pageAuditTable, products };
}

runFinalChallengerVerification().catch(e => {
  console.error("FATAL ERROR IN FINAL CHALLENGER HARNESS:", e);
  process.exit(1);
});
