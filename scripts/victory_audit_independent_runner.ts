import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { createClient } from '@supabase/supabase-js';
import {
  getOrganizationAndWebsiteSchema,
  getProductPageSchema,
  getBreadcrumbSchema,
  getFaqPageSchema,
  BASE_URL,
  ORG_ID,
  WEBSITE_ID
} from '../lib/schema';
import sitemap from '../app/sitemap';

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const APP_DIR = path.join(__dirname, '..', 'app');

interface AuditResult {
  section: string;
  check: string;
  passed: boolean;
  details: string;
}

const auditResults: AuditResult[] = [];

function check(section: string, condition: boolean, name: string, details: string) {
  auditResults.push({
    section,
    check: name,
    passed: condition,
    details: condition ? `PASS: ${details}` : `FAIL: ${details}`
  });
  if (!condition) {
    console.error(`❌ [FAIL] [${section}] ${name}: ${details}`);
  } else {
    console.log(`✅ [PASS] [${section}] ${name}: ${details}`);
  }
}

async function runIndependentAudit() {
  console.log('================================================================');
  console.log('🛡️  INDEPENDENT VICTORY AUDITOR — FULL SYSTEM AUDIT SUITE');
  console.log('================================================================\n');

  // ---------------------------------------------------------------------------
  // SECTION 1: Favicons & SERP Asset Suite (R1)
  // ---------------------------------------------------------------------------
  console.log('--- SECTION 1: Favicon & SERP Asset Suite ---');
  
  // 1.1 favicon.ico binary inspection
  const icoPath = path.join(PUBLIC_DIR, 'favicon.ico');
  check('Favicons', fs.existsSync(icoPath), 'favicon.ico exists', `Found at ${icoPath}`);
  if (fs.existsSync(icoPath)) {
    const icoBuf = fs.readFileSync(icoPath);
    check('Favicons', icoBuf.length > 50000, 'favicon.ico size > 50KB (multi-layer)', `${icoBuf.length} bytes`);
    
    const reserved = icoBuf.readUInt16LE(0);
    const type = icoBuf.readUInt16LE(2);
    const count = icoBuf.readUInt16LE(4);
    check('Favicons', reserved === 0 && type === 1, 'ICO Header magic bytes valid', `Reserved: ${reserved}, Type: ${type}`);
    check('Favicons', count === 6, 'ICO contains exactly 6 layers', `Layers count: ${count}`);

    const expectedIcoSizes = [16, 32, 48, 64, 128, 256];
    for (let i = 0; i < count; i++) {
      const entryOffset = 6 + i * 16;
      const rawW = icoBuf.readUInt8(entryOffset);
      const rawH = icoBuf.readUInt8(entryOffset + 1);
      const expectedSize = expectedIcoSizes[i];
      const actualSize = rawW === 0 ? 256 : rawW;
      check('Favicons', actualSize === expectedSize, `ICO Layer #${i+1} size ${expectedSize}x${expectedSize}`, `Found: ${actualSize}x${rawH === 0 ? 256 : rawH}`);
      
      const imgLen = icoBuf.readUInt32LE(entryOffset + 8);
      const imgOff = icoBuf.readUInt32LE(entryOffset + 12);
      const imgBuf = icoBuf.subarray(imgOff, imgOff + imgLen);
      
      try {
        const meta = await sharp(imgBuf).metadata();
        check('Favicons', meta.width === expectedSize && meta.height === expectedSize, `ICO Layer #${i+1} Sharp decode`, `${meta.width}x${meta.height}, format=${meta.format}`);
      } catch (err: any) {
        check('Favicons', false, `ICO Layer #${i+1} Sharp decode failed`, err.message);
      }
    }
  }

  // 1.2 Standalone PNGs
  const pngAssets = [
    { name: 'favicon-16x16.png', size: 16 },
    { name: 'favicon-32x32.png', size: 32 },
    { name: 'favicon-48x48.png', size: 48 },
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'icon-192.png', size: 192 },
    { name: 'icon-512.png', size: 512 }
  ];

  for (const asset of pngAssets) {
    const p = path.join(PUBLIC_DIR, asset.name);
    check('Favicons', fs.existsSync(p), `PNG file ${asset.name} exists`, `Found at ${p}`);
    if (fs.existsSync(p)) {
      const meta = await sharp(p).metadata();
      check('Favicons', meta.width === asset.size && meta.height === asset.size, `PNG ${asset.name} dimensions (${asset.size}x${asset.size})`, `Actual: ${meta.width}x${meta.height}`);
    }
  }

  // 1.3 site.webmanifest
  const manifestPath = path.join(PUBLIC_DIR, 'site.webmanifest');
  check('Favicons', fs.existsSync(manifestPath), 'site.webmanifest exists', `Found at ${manifestPath}`);
  if (fs.existsSync(manifestPath)) {
    const raw = fs.readFileSync(manifestPath, 'utf8');
    const parsed = JSON.parse(raw);
    check('Favicons', parsed.name && parsed.short_name, 'site.webmanifest has name & short_name', `${parsed.name} | ${parsed.short_name}`);
    check('Favicons', Array.isArray(parsed.icons) && parsed.icons.length >= 2, 'site.webmanifest has icons array', `Icons count: ${parsed.icons?.length}`);
  }

  // 1.4 app/layout.tsx icon configuration & google verification
  const layoutPath = path.join(APP_DIR, 'layout.tsx');
  check('Favicons', fs.existsSync(layoutPath), 'app/layout.tsx exists', `Found at ${layoutPath}`);
  if (fs.existsSync(layoutPath)) {
    const layoutCode = fs.readFileSync(layoutPath, 'utf8');
    check('Favicons', layoutCode.includes('/favicon.ico'), 'app/layout.tsx references /favicon.ico', 'Found');
    check('Favicons', layoutCode.includes('/favicon-48x48.png'), 'app/layout.tsx references /favicon-48x48.png (Google guideline)', 'Found');
    check('Favicons', layoutCode.includes('/apple-touch-icon.png'), 'app/layout.tsx references /apple-touch-icon.png', 'Found');
    check('Favicons', layoutCode.includes('/site.webmanifest'), 'app/layout.tsx references /site.webmanifest', 'Found');
    check('Favicons', layoutCode.includes('zhBoVXVcROJG7C0ebSblYcbHgDkgAHx1dXss2fUGO58'), 'app/layout.tsx has Google Verification token', 'Found');
  }

  // ---------------------------------------------------------------------------
  // SECTION 2: Schema.org Knowledge Graph & GEO (R2)
  // ---------------------------------------------------------------------------
  console.log('\n--- SECTION 2: Schema.org Knowledge Graph & GEO ---');

  // 2.1 Organization & WebSite
  const orgWebsiteSchema: any = getOrganizationAndWebsiteSchema();
  check('Schema.org', orgWebsiteSchema['@context'] === 'https://schema.org', 'Root @context is schema.org', orgWebsiteSchema['@context']);
  const graph = orgWebsiteSchema['@graph'];
  check('Schema.org', Array.isArray(graph) && graph.length === 2, '@graph contains 2 entities', `Count: ${graph?.length}`);

  const orgEntity = graph?.find((e: any) => e['@id'] === ORG_ID);
  check('Schema.org', !!orgEntity, 'Organization entity exists with valid @id', ORG_ID);
  if (orgEntity) {
    check('Schema.org', orgEntity.name === 'Isabel Pepe', 'Organization name is Isabel Pepe', orgEntity.name);
    check('Schema.org', orgEntity.legalName.includes('Creativia'), 'Organization legalName has Creativia', orgEntity.legalName);
    check('Schema.org', orgEntity.vatID === 'IT06399670659', 'Organization VAT ID is IT06399670659', orgEntity.vatID);
    check('Schema.org', Array.isArray(orgEntity.founder) && orgEntity.founder.length === 2, 'Organization founders: Elena & Mario', `Founders: ${orgEntity.founder.map((f: any) => f.name).join(', ')}`);
    check('Schema.org', orgEntity.priceRange === '€€', 'Organization priceRange is €€', orgEntity.priceRange);
    check('Schema.org', !!orgEntity.hasMerchantReturnPolicy, 'Organization hasMerchantReturnPolicy defined', 'Defined');
  }

  const websiteEntity = graph?.find((e: any) => e['@id'] === WEBSITE_ID);
  check('Schema.org', !!websiteEntity, 'WebSite entity exists with valid @id', WEBSITE_ID);
  if (websiteEntity) {
    check('Schema.org', websiteEntity.potentialAction?.['@type'] === 'SearchAction', 'WebSite has SearchAction', websiteEntity.potentialAction?.['@type']);
  }

  // 2.2 Product Schema
  const sampleProduct = {
    name: 'Anello Lune d\'Argent',
    slug: 'anello-lune-d-argent',
    sku: 'ALDA-01',
    description: 'Solitario in Moissanite',
    price: 180,
    discount_price: 150,
    category: 'Anelli',
    plating: 'Rodio Puro',
    gemstone: 'Moissanite GRA 2.0ct',
    image_primary: 'https://www.isabelpepe.com/images/anello.jpg',
    is_active: true
  };
  const prodSchema: any = getProductPageSchema(sampleProduct, [sampleProduct.image_primary]);
  const prodGraph = prodSchema['@graph'];
  check('Schema.org', Array.isArray(prodGraph) && prodGraph.length === 3, 'Product Page schema contains Product, Breadcrumbs, FAQPage', `Entities: ${prodGraph?.map((e: any) => e['@type']).join(', ')}`);

  const prodEntity = prodGraph?.find((e: any) => e['@type'] === 'Product');
  check('Schema.org', prodEntity?.name === sampleProduct.name, 'Product entity name matches', prodEntity?.name);
  check('Schema.org', prodEntity?.offers?.price === '150.00', 'Product offer price reflects discount_price', prodEntity?.offers?.price);
  check('Schema.org', prodEntity?.offers?.availability === 'https://schema.org/InStock', 'Product availability is InStock', prodEntity?.offers?.availability);
  check('Schema.org', !!prodEntity?.offers?.shippingDetails, 'Product has shippingDetails', 'Present');
  check('Schema.org', !!prodEntity?.offers?.hasMerchantReturnPolicy, 'Product has hasMerchantReturnPolicy', 'Present');

  // 2.3 public/llms.txt
  const llmsPath = path.join(PUBLIC_DIR, 'llms.txt');
  check('GEO', fs.existsSync(llmsPath), 'public/llms.txt exists', `Found at ${llmsPath}`);
  if (fs.existsSync(llmsPath)) {
    const llmsContent = fs.readFileSync(llmsPath, 'utf8');
    check('GEO', llmsContent.length > 3000, 'public/llms.txt size > 3KB', `${llmsContent.length} bytes`);
    check('GEO', llmsContent.includes('Elena e Mario'), 'llms.txt mentions Elena e Mario', 'Found');
    check('GEO', llmsContent.includes('06399670659'), 'llms.txt has P.IVA 06399670659', 'Found');
    check('GEO', llmsContent.includes('Argento Sterling 925'), 'llms.txt details Argento 925', 'Found');
    check('GEO', llmsContent.includes('1.0 Micron'), 'llms.txt details Oro 18K 1.0 Micron', 'Found');
    check('GEO', llmsContent.includes('E-Coating'), 'llms.txt details E-Coating', 'Found');
    check('GEO', llmsContent.includes('5%'), 'llms.txt details 5% animal pledge', 'Found');
    check('GEO', llmsContent.includes('/regali/donna-elegante') && llmsContent.includes('/guide/gioielli-demi-fine'), 'llms.txt lists all 4 gifting landing pages', 'Found');
  }

  // ---------------------------------------------------------------------------
  // SECTION 3: Gifting & Occasion Landing Pages (R3)
  // ---------------------------------------------------------------------------
  console.log('\n--- SECTION 3: Gifting & Guide Landing Pages ---');

  const giftingPages = [
    { name: 'Donna Elegante', path: 'regali/donna-elegante/page.tsx', route: '/regali/donna-elegante' },
    { name: 'Anniversario', path: 'regali/anniversario/page.tsx', route: '/regali/anniversario' },
    { name: 'Compleanno', path: 'regali/compleanno/page.tsx', route: '/regali/compleanno' },
    { name: 'Guida Demi-Fine', path: 'guide/gioielli-demi-fine/page.tsx', route: '/guide/gioielli-demi-fine' }
  ];

  for (const gp of giftingPages) {
    const p = path.join(APP_DIR, gp.path);
    check('LandingPages', fs.existsSync(p), `Landing page file exists: ${gp.path}`, `Found at ${p}`);
    if (fs.existsSync(p)) {
      const code = fs.readFileSync(p, 'utf8');
      check('LandingPages', code.includes('supabase') && code.includes('from(\'products\')'), `${gp.name} queries Supabase products dynamically`, 'Found');
      check('LandingPages', code.includes('application/ld+json'), `${gp.name} injects JSON-LD structured data`, 'Found');
      check('LandingPages', code.includes('FaqSection') || code.includes('faqs'), `${gp.name} includes FAQ section`, 'Found');
      check('LandingPages', code.includes('ProductTrustBadges'), `${gp.name} includes ProductTrustBadges`, 'Found');
      check('LandingPages', code.includes('export const metadata'), `${gp.name} defines export const metadata`, 'Found');
    }
  }

  // ---------------------------------------------------------------------------
  // SECTION 4: Supabase Database Active Products Verification
  // ---------------------------------------------------------------------------
  console.log('\n--- SECTION 4: Supabase Database Active Products & Slug Check ---');
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://aarojhgdvzeorhimszpk.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhcm9qaGdkdnplb3JoaW1zenBrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyNDQ0ODIsImV4cCI6MjA5NTgyMDQ4Mn0.bI58QLfKC7FtwoW7Cnml4RNnww8rU29bNQ-1YjjH54k';
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const { data: dbProducts, error: dbErr } = await supabase
    .from('products')
    .select('id, name, slug, price, discount_price, image_primary, is_active')
    .eq('is_active', true);

  check('Database', !dbErr && !!dbProducts, 'Supabase query for active products succeeded', `Active products: ${dbProducts?.length}`);
  const activeSlugs = new Set(dbProducts?.map(p => p.slug));

  // Check the slugs in donna-elegante, anniversario, compleanno, demi-fine
  const donnaSlugs = ['isabel-romance', 'set-vivienne', 'siena-gold', 'vendome-pearl', 'mon-amour-royale', 'anello-imperial', 'set-sweet-romance', 'orecchini-opera'];
  const anniversarioSlugs = ['anello-lune-d-argent', 'anello-imperial', 'bracciale-tennis-monte-carlo', 'eclat-royal', 'set-versailles', 'set-vivienne', 'collana-brera-gold', 'isabel-romance', 'set-ternel'];
  const compleannoSlugs = ['orecchini-reve', 'orecchini-duchesse', 'fleur', 'collana-metamorphose', 'bracciale-iconique', 'orecchini-jos-phine', 'orecchini-butterfly', 'set-papillon-splendeur', 'collana-etoile', 'anello-chatelaine-silver'];
  const guideSlugs = ['siena-gold', 'set-glow-ribbon', 'anello-chatelaine-silver', 'vendome-pearl', 'orecchini-opera', 'bracciale-harmonie', 'set-sweet-romance', 'collana-brera-silver'];

  const allGiftingSlugs = [
    { page: 'Donna Elegante', slugs: donnaSlugs },
    { page: 'Anniversario', slugs: anniversarioSlugs },
    { page: 'Compleanno', slugs: compleannoSlugs },
    { page: 'Guida Demi-Fine', slugs: guideSlugs }
  ];

  for (const gs of allGiftingSlugs) {
    const missingSlugs = gs.slugs.filter(s => !activeSlugs.has(s));
    check('Database', missingSlugs.length === 0, `${gs.page} target slugs all exist in DB`, missingSlugs.length === 0 ? `All ${gs.slugs.length} present` : `Missing: ${missingSlugs.join(', ')}`);
  }

  // ---------------------------------------------------------------------------
  // SECTION 5: Dynamic Sitemap Execution (R5)
  // ---------------------------------------------------------------------------
  console.log('\n--- SECTION 5: Dynamic Sitemap Execution ---');
  const sitemapEntries = await sitemap();
  check('Sitemap', Array.isArray(sitemapEntries) && sitemapEntries.length >= 50, 'sitemap() returned >= 50 URLs', `Count: ${sitemapEntries.length}`);

  const requiredUrls = [
    `${BASE_URL}`,
    `${BASE_URL}/shop`,
    `${BASE_URL}/regali/donna-elegante`,
    `${BASE_URL}/regali/anniversario`,
    `${BASE_URL}/regali/compleanno`,
    `${BASE_URL}/guide/gioielli-demi-fine`,
    `${BASE_URL}/chi-siamo`,
    `${BASE_URL}/impegno-animali`,
    `${BASE_URL}/garanzia`,
    `${BASE_URL}/cura-gioielli`,
    `${BASE_URL}/guida-taglie`,
    `${BASE_URL}/assistenza-clienti`,
    `${BASE_URL}/spedizioni-resi`,
    `${BASE_URL}/termini-condizioni`,
    `${BASE_URL}/privacy`,
    `${BASE_URL}/cookie-policy`
  ];

  for (const reqUrl of requiredUrls) {
    const entry = sitemapEntries.find(e => e.url === reqUrl);
    check('Sitemap', !!entry, `Sitemap contains static route: ${reqUrl.replace(BASE_URL, '') || '/'}`, entry ? `priority=${entry.priority}, freq=${entry.changeFrequency}` : 'MISSING');
  }

  // Check product URLs in sitemap
  let allActiveInSitemap = true;
  for (const p of dbProducts || []) {
    const pUrl = `${BASE_URL}/prodotto/${p.slug}`;
    if (!sitemapEntries.some(e => e.url === pUrl)) {
      allActiveInSitemap = false;
      console.error(`Missing product in sitemap: ${pUrl}`);
    }
  }
  check('Sitemap', allActiveInSitemap, 'All active products present in sitemap', `Verified ${dbProducts?.length} product URLs`);

  // Check for duplicate URLs
  const urlCounts: Record<string, number> = {};
  sitemapEntries.forEach(e => {
    urlCounts[e.url] = (urlCounts[e.url] || 0) + 1;
  });
  const duplicates = Object.entries(urlCounts).filter(([_, c]) => c > 1);
  check('Sitemap', duplicates.length === 0, 'No duplicate URLs in sitemap', duplicates.length === 0 ? 'Clean' : `Duplicates: ${duplicates.map(([u]) => u).join(', ')}`);

  // ---------------------------------------------------------------------------
  // SECTION 6: Metadata Overhaul Check (R4)
  // ---------------------------------------------------------------------------
  console.log('\n--- SECTION 6: Intent-Driven Metadata Overhaul Across Main Pages ---');
  const metadataPages = [
    'app/shop/page.tsx',
    'app/chi-siamo/page.tsx',
    'app/impegno-animali/page.tsx',
    'app/garanzia/page.tsx',
    'app/spedizioni-resi/page.tsx',
    'app/guida-taglie/page.tsx',
    'app/cura-gioielli/page.tsx',
    'app/assistenza-clienti/page.tsx'
  ];

  for (const mp of metadataPages) {
    const fullP = path.join(__dirname, '..', mp);
    if (fs.existsSync(fullP)) {
      const code = fs.readFileSync(fullP, 'utf8');
      check('Metadata', code.includes('metadata') || code.includes('generateMetadata'), `Metadata defined in ${mp}`, 'Found');
      check('Metadata', !code.includes('moissanite pura') && !code.includes('prezzo fabbrica'), `No commoditized spam keywords in ${mp}`, 'Clean');
    }
  }

  // ---------------------------------------------------------------------------
  // SUMMARY
  // ---------------------------------------------------------------------------
  console.log('\n================================================================');
  const total = auditResults.length;
  const passedCount = auditResults.filter(r => r.passed).length;
  const failedCount = total - passedCount;

  console.log(`TOTAL CHECKS: ${total}`);
  console.log(`PASSED: ${passedCount}`);
  console.log(`FAILED: ${failedCount}`);
  console.log('================================================================');

  if (failedCount === 0) {
    console.log('🎉 ALL VICTORY AUDIT CHECKS PASSED WITH ZERO ERRORS!');
  } else {
    console.error(`❌ AUDIT DETECTED ${failedCount} FAILURES.`);
  }

  return failedCount === 0;
}

runIndependentAudit().then(success => {
  process.exit(success ? 0 : 1);
}).catch(err => {
  console.error('Audit exception:', err);
  process.exit(1);
});
