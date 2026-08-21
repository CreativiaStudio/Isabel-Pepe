/**
 * EMPIRICAL ADVERSARIAL STRESS TEST SUITE
 * Challenger Agent: challenger_1
 * Target: lib/certificates.ts & public/Brand/* assets
 */

import fs from 'fs';
import path from 'path';
import { 
  getProductCertificateInfo, 
  CERTIFICATE_PRESETS, 
  CertificateType,
  ProductInput,
  ProductCertificateInfo
} from '../lib/certificates';
import { ensureCertificateAliases } from '../lib/init-assets';

interface AdversarialTestFailure {
  testSuite: string;
  testCase: string;
  expected: any;
  actual: any;
  reason: string;
}

const failures: AdversarialTestFailure[] = [];
let totalAssertions = 0;

function assert(condition: boolean, testSuite: string, testCase: string, expected: any, actual: any, reason: string) {
  totalAssertions++;
  if (!condition) {
    failures.push({ testSuite, testCase, expected, actual, reason });
    console.error(`❌ [FAIL] ${testSuite} -> ${testCase}: ${reason} (Expected: ${JSON.stringify(expected)}, Actual: ${JSON.stringify(actual)})`);
  }
}

const publicDir = path.resolve(process.cwd(), 'public');

function verifyAssetFile(imgSrc: string, context: string): boolean {
  if (!imgSrc || typeof imgSrc !== 'string') {
    assert(false, 'Asset Integrity', context, 'Non-empty string path', imgSrc, 'Image path is empty or invalid type');
    return false;
  }
  const cleanPath = imgSrc.replace(/^\//, '');
  const absPath = path.join(publicDir, cleanPath);
  const exists = fs.existsSync(absPath);
  assert(exists, 'Asset Integrity', `${context} exists: ${imgSrc}`, true, exists, `File does not exist on disk at ${absPath}`);
  if (exists) {
    const stats = fs.statSync(absPath);
    const hasSize = stats.size > 0;
    assert(hasSize, 'Asset Integrity', `${context} non-zero size: ${imgSrc}`, '> 0 bytes', `${stats.size} bytes`, `File on disk has 0 bytes: ${absPath}`);
    return hasSize;
  }
  return false;
}

// -----------------------------------------------------------------------------
// SUITE 1: Extreme & Boundary Input Stress Testing
// -----------------------------------------------------------------------------
console.log('🔥 [Suite 1/5] Running Boundary & Malformed Inputs Stress Tests...');

// 1.1 Empty object
{
  const res = getProductCertificateInfo({});
  assert(res !== null && typeof res === 'object', 'Boundary Inputs', 'Empty Object {}', 'Valid object', res, 'Result must be a valid ProductCertificateInfo object');
  assert(res.certificateType === 'silver_crystals', 'Boundary Inputs', 'Empty Object Tier', 'silver_crystals', res.certificateType, 'Empty object should safely fall back to silver_crystals');
  assert(res.hasGraTabs === false, 'Boundary Inputs', 'Empty Object GRA tabs', false, res.hasGraTabs, 'Empty object must not have GRA tabs');
  assert(res.tabs.length >= 1, 'Boundary Inputs', 'Empty Object Tabs count', '>= 1', res.tabs.length, 'Empty object must have at least 1 tab');
  verifyAssetFile(res.certificateImage, 'Empty Object Master Image');
  res.tabs.forEach((tab, i) => verifyAssetFile(tab.imageSrc, `Empty Object Tab ${i}`));
}

// 1.2 Undefined / Null input
{
  const resNull = getProductCertificateInfo(undefined as any);
  assert(resNull.certificateType === 'silver_crystals', 'Boundary Inputs', 'undefined input', 'silver_crystals', resNull.certificateType, 'undefined input must not throw and fallback safely');
  
  const resNullObj = getProductCertificateInfo(null as any);
  assert(resNullObj.certificateType === 'silver_crystals', 'Boundary Inputs', 'null input', 'silver_crystals', resNullObj.certificateType, 'null input must not throw and fallback safely');
}

// 1.3 Null/Undefined property values
{
  const malformed: ProductInput = {
    name: undefined,
    gemstone: undefined,
    materials: undefined,
    plating: undefined,
    description: undefined,
    color: undefined,
    sku: undefined,
    category: undefined
  };
  const res = getProductCertificateInfo(malformed);
  assert(res.certificateType === 'silver_crystals', 'Boundary Inputs', 'All properties undefined', 'silver_crystals', res.certificateType, 'All undefined properties must fallback safely');
  assert(res.hasGraTabs === false, 'Boundary Inputs', 'All undefined properties GRA', false, res.hasGraTabs, 'Must not have GRA');
}

// 1.4 Extra Whitespace, Tabs, Newlines & Mixed Case
{
  const messyMoissGold: ProductInput = {
    name: "   \n\t oReCchInI OPÉRA   \n",
    gemstone: "\t  MOISSANITE CERTIFICATA gra (VVS1 D-COLOR)   \r\n",
    materials: "   ARGENTO STERLING 925   ",
    plating: " \n  PLACCATURA ORO 18K (1.0 MICRON) \t  ",
    sku: "   a118  "
  };
  const res = getProductCertificateInfo(messyMoissGold);
  assert(res.certificateType === 'moissanite_gold', 'Boundary Inputs', 'Messy Moiss Gold', 'moissanite_gold', res.certificateType, 'Messy string trimming and casing must resolve to moissanite_gold');
  assert(res.hasGraTabs === true, 'Boundary Inputs', 'Messy Moiss Gold GRA', true, res.hasGraTabs, 'Must have GRA tabs');
  assert(res.tabs.length === 4, 'Boundary Inputs', 'Messy Moiss Gold Tab count', 4, res.tabs.length, 'Must have 4 tabs');
  res.tabs.forEach((tab, i) => verifyAssetFile(tab.imageSrc, `Messy Moiss Gold Tab ${i}`));
}

// 1.5 Conflicting Keywords (Pearl + Moissanite)
{
  const conflictPearlMoiss: ProductInput = {
    name: "Collana Moissanite e Perle",
    gemstone: "Perla d'Acqua Dolce e Moissanite VVS1",
    materials: "Argento 925",
    plating: "Oro 18K",
    sku: "PL-CONFL-1"
  };
  const res = getProductCertificateInfo(conflictPearlMoiss);
  assert(res.certificateType === 'pearl_gold', 'Conflicting Keywords', 'Pearl vs Moissanite', 'pearl_gold', res.certificateType, 'Pearls must have higher precedence than Moissanite');
  assert(res.hasGraTabs === false, 'Conflicting Keywords', 'Pearl vs Moissanite GRA', false, res.hasGraTabs, 'Pearls must NEVER have GRA tabs even if Moissanite is mentioned in text');
  assert(res.tabs.length === 2, 'Conflicting Keywords', 'Pearl vs Moissanite Tab Count', 2, res.tabs.length, 'Pearl must have exactly 2 tabs');
}

// 1.6 Conflicting Keywords (Crystal/Zircon + Moissanite)
{
  const conflictZirconMoiss: ProductInput = {
    name: "Anello Halo Moissanite & Zirconi",
    gemstone: "Zirconi Luminosi con Taglio Brillante e Moissanite",
    materials: "Argento 925",
    plating: "Rodio",
    sku: "TEST-ZIRC-1"
  };
  const res = getProductCertificateInfo(conflictZirconMoiss);
  assert(res.certificateType === 'silver_crystals', 'Conflicting Keywords', 'Zircon vs Moissanite', 'silver_crystals', res.certificateType, 'Explicit Zircon/Crystal must disqualify from Moissanite GRA tabs');
  assert(res.hasGraTabs === false, 'Conflicting Keywords', 'Zircon vs Moissanite GRA', false, res.hasGraTabs, 'Zircon must not have GRA tabs');
  assert(res.certificateImage.includes('certificato_argento925'), 'Conflicting Keywords', 'Zircon Image', 'certificato_argento925.webp', res.certificateImage, 'Must use silver 925 certificate');
}

// 1.7 Non-standard Gemstones (Lab-Grown Diamond, Emerald, Ruby, Sapphire, etc.)
{
  const exoticGems = [
    { name: "Smeraldo Colombiano", gem: "Smeraldo Naturale", expectedType: 'silver_crystals', hasGra: false },
    { name: "Rubino Birmano", gem: "Rubino Sintetico", expectedType: 'silver_crystals', hasGra: false },
    { name: "Zaffiro Reale", gem: "Zaffiro Blu Ceylon", expectedType: 'silver_crystals', hasGra: false },
    { name: "Diamante Lab-Grown", gem: "Diamante IGI Lab Grown", expectedType: 'silver_crystals', hasGra: false },
    { name: "Cubic Zirconia 5A", gem: "Cubic Zirconia Premium", expectedType: 'silver_crystals', hasGra: false }
  ];

  for (const item of exoticGems) {
    const res = getProductCertificateInfo({ name: item.name, gemstone: item.gem, materials: "Argento 925", plating: "Rodio" });
    assert(res.certificateType === item.expectedType, 'Exotic Gemstones', item.name, item.expectedType, res.certificateType, `Exotic gem ${item.gem} must not falsely claim Moissanite/GRA`);
    assert(res.hasGraTabs === item.hasGra, 'Exotic Gemstones', `${item.name} GRA`, item.hasGra, res.hasGraTabs, `Exotic gem ${item.gem} must have hasGraTabs = ${item.hasGra}`);
  }
}

// 1.8 Plating String Variations
{
  const platingTests = [
    { plating: "Oro 18K", isGold: true },
    { plating: "18k Yellow Gold Plated", isGold: true },
    { plating: "Placcatura Oro Giallo 1.0 Micron", isGold: true },
    { plating: "Oro Rosa 18K", isGold: true },
    { plating: "Rodio Puro a Specchio", isGold: false },
    { plating: "Finitura Rodio 0.1 Micron", isGold: false },
    { plating: "Platino Puro", isGold: false },
    { plating: "Nessuna Placcatura / Argento Naturale", isGold: false }
  ];

  for (const pt of platingTests) {
    const res = getProductCertificateInfo({
      name: "Solitario Elegance",
      gemstone: "Moissanite VVS1 D-Color",
      materials: "Argento 925",
      plating: pt.plating
    });
    const expectedType: CertificateType = pt.isGold ? 'moissanite_gold' : 'moissanite_rhodium';
    assert(res.certificateType === expectedType, 'Plating Variations', pt.plating, expectedType, res.certificateType, `Plating "${pt.plating}" expected ${expectedType}`);
  }
}

// -----------------------------------------------------------------------------
// SUITE 2: CERTIFICATE_PRESETS Integrity
// -----------------------------------------------------------------------------
console.log('\n🏛️ [Suite 2/5] Verifying CERTIFICATE_PRESETS integrity & completeness...');

const presetKeys: CertificateType[] = ['moissanite_gold', 'moissanite_rhodium', 'pearl_gold', 'silver_crystals'];

for (const key of presetKeys) {
  const preset = CERTIFICATE_PRESETS[key];
  assert(Boolean(preset), 'Presets', `Preset exists: ${key}`, true, Boolean(preset), `CERTIFICATE_PRESETS must contain key ${key}`);
  assert(preset.certificateType === key, 'Presets', `Preset certificateType matches key: ${key}`, key, preset.certificateType, 'Preset certificateType mismatch');
  assert(Boolean(preset.badgeTitle), 'Presets', `${key} badgeTitle`, 'Non-empty', preset.badgeTitle, 'Missing badgeTitle');
  assert(Boolean(preset.badgeSubtitle), 'Presets', `${key} badgeSubtitle`, 'Non-empty', preset.badgeSubtitle, 'Missing badgeSubtitle');
  assert(Boolean(preset.modalTitle), 'Presets', `${key} modalTitle`, 'Non-empty', preset.modalTitle, 'Missing modalTitle');
  assert(Boolean(preset.modalCategory), 'Presets', `${key} modalCategory`, 'Non-empty', preset.modalCategory, 'Missing modalCategory');
  assert(Array.isArray(preset.tabs) && preset.tabs.length > 0, 'Presets', `${key} tabs array`, '> 0', preset.tabs.length, 'Missing or empty tabs');
  assert(Array.isArray(preset.features) && preset.features.length > 0, 'Presets', `${key} features array`, '> 0', preset.features.length, 'Missing or empty features');
  
  verifyAssetFile(preset.certificateImage, `Preset ${key} Master Image`);
  preset.tabs.forEach((tab, idx) => {
    assert(Boolean(tab.id), 'Presets', `${key} tab[${idx}] id`, 'Non-empty', tab.id, 'Missing tab id');
    assert(Boolean(tab.label), 'Presets', `${key} tab[${idx}] label`, 'Non-empty', tab.label, 'Missing tab label');
    assert(Boolean(tab.alt), 'Presets', `${key} tab[${idx}] alt`, 'Non-empty', tab.alt, 'Missing tab alt');
    assert(Boolean(tab.description), 'Presets', `${key} tab[${idx}] description`, 'Non-empty', tab.description, 'Missing tab description');
    verifyAssetFile(tab.imageSrc, `Preset ${key} Tab ${idx} (${tab.id})`);
  });
}

// -----------------------------------------------------------------------------
// SUITE 3: Live Catalog (41 Products) Comprehensive Audit
// -----------------------------------------------------------------------------
console.log('\n📦 [Suite 3/5] Verifying 100% of Live Catalog Products from Supabase / db_snapshot.json...');

ensureCertificateAliases();

const snapshotPath = path.resolve(process.cwd(), 'scripts/db_snapshot.json');
let products: any[] = [];
if (fs.existsSync(snapshotPath)) {
  products = JSON.parse(fs.readFileSync(snapshotPath, 'utf8'));
}

assert(products.length === 41, 'Catalog Completeness', 'Total Catalog Products Count', 41, products.length, 'Catalog must contain exactly 41 products');

let livePearlCount = 0;
let liveMoissGoldCount = 0;
let liveMoissRhodiumCount = 0;
let liveSilverCount = 0;

for (const p of products) {
  const sku = (p.sku || '').toUpperCase();
  const info = getProductCertificateInfo(p);

  // Check counts
  if (info.certificateType === 'pearl_gold') livePearlCount++;
  else if (info.certificateType === 'moissanite_gold') liveMoissGoldCount++;
  else if (info.certificateType === 'moissanite_rhodium') liveMoissRhodiumCount++;
  else if (info.certificateType === 'silver_crystals') liveSilverCount++;

  // Verify master image on disk
  verifyAssetFile(info.certificateImage, `Product ${sku} (${p.name}) Master Image`);

  // Verify every tab image on disk
  info.tabs.forEach((tab, i) => {
    verifyAssetFile(tab.imageSrc, `Product ${sku} Tab ${i} (${tab.id})`);
  });

  // Tab count rules per tier
  if (info.certificateType === 'pearl_gold') {
    assert(info.hasGraTabs === false, 'Catalog Rules', `Product ${sku} Pearl hasGraTabs`, false, info.hasGraTabs, 'Pearl products must not have GRA tabs');
    assert(info.tabs.length === 2, 'Catalog Rules', `Product ${sku} Pearl tab count`, 2, info.tabs.length, 'Pearl products must have exactly 2 tabs');
  } else if (info.certificateType === 'moissanite_gold') {
    assert(info.hasGraTabs === true, 'Catalog Rules', `Product ${sku} MoissGold hasGraTabs`, true, info.hasGraTabs, 'Moissanite Gold products must have GRA tabs');
    assert(info.tabs.length === 4, 'Catalog Rules', `Product ${sku} MoissGold tab count`, 4, info.tabs.length, 'Moissanite Gold products must have exactly 4 tabs');
    assert(info.certificateImage.includes('certificato_moissanite_oro18k'), 'Catalog Rules', `Product ${sku} MoissGold Cert Image`, 'certificato_moissanite_oro18k', info.certificateImage, 'Moissanite Gold must use gold cert');
  } else if (info.certificateType === 'moissanite_rhodium') {
    assert(info.hasGraTabs === true, 'Catalog Rules', `Product ${sku} MoissRhodium hasGraTabs`, true, info.hasGraTabs, 'Moissanite Rhodium products must have GRA tabs');
    assert(info.tabs.length === 4, 'Catalog Rules', `Product ${sku} MoissRhodium tab count`, 4, info.tabs.length, 'Moissanite Rhodium products must have exactly 4 tabs');
    assert(info.certificateImage.includes('certificato_moissanite_rodio'), 'Catalog Rules', `Product ${sku} MoissRhodium Cert Image`, 'certificato_moissanite_rodio', info.certificateImage, 'Moissanite Rhodium must use rhodium cert');
  } else if (info.certificateType === 'silver_crystals') {
    assert(info.hasGraTabs === false, 'Catalog Rules', `Product ${sku} Silver hasGraTabs`, false, info.hasGraTabs, 'Silver products must NOT have GRA tabs');
    assert(info.tabs.length === 1, 'Catalog Rules', `Product ${sku} Silver tab count`, 1, info.tabs.length, 'Silver products must have 1 tab');
    assert(info.certificateImage.includes('certificato_argento925'), 'Catalog Rules', `Product ${sku} Silver Cert Image`, 'certificato_argento925', info.certificateImage, 'Silver must use argento925 cert');
  }
}

assert(livePearlCount === 4, 'Catalog Distribution', 'Total Pearl Products', 4, livePearlCount, 'Pearl count must be 4');
assert(liveMoissGoldCount === 10, 'Catalog Distribution', 'Total Moissanite Gold Products', 10, liveMoissGoldCount, 'Moiss Gold count must be 10');
assert(liveMoissRhodiumCount === 26, 'Catalog Distribution', 'Total Moissanite Rhodium Products', 26, liveMoissRhodiumCount, 'Moiss Rhodium count must be 26');
assert(liveSilverCount === 1, 'Catalog Distribution', 'Total Silver Products', 1, liveSilverCount, 'Silver count must be 1');

// -----------------------------------------------------------------------------
// SUITE 4: Regression Testing for Critical SKUs
// -----------------------------------------------------------------------------
console.log('\n🎯 [Suite 4/5] Running Critical SKU Regression Tests...');

// 4.1 All 4 Pearl SKUs
const pearlSkus = ['PL-6', 'PL-15-BRACELET', 'PL-30', 'PL-40'];
for (const sku of pearlSkus) {
  const prod = products.find(p => p.sku === sku);
  assert(Boolean(prod), 'Regression', `Pearl SKU exists: ${sku}`, true, Boolean(prod), `SKU ${sku} not found in catalog`);
  if (prod) {
    const cert = getProductCertificateInfo(prod);
    assert(cert.certificateType === 'pearl_gold', 'Regression', `SKU ${sku} type`, 'pearl_gold', cert.certificateType, `${sku} must be pearl_gold`);
    assert(cert.hasGraTabs === false, 'Regression', `SKU ${sku} hasGraTabs`, false, cert.hasGraTabs, `${sku} must NEVER have GRA tabs`);
    assert(cert.tabs.length === 2, 'Regression', `SKU ${sku} tabs count`, 2, cert.tabs.length, `${sku} must have exactly 2 tabs`);
    assert(!cert.tabs.some(t => t.id === 'report' || t.id === 'cover'), 'Regression', `SKU ${sku} no GRA tab ids`, true, false, `${sku} has forbidden GRA tabs`);
    assert(!cert.tabs.some(t => t.imageSrc.toLowerCase().includes('gra_')), 'Regression', `SKU ${sku} no GRA images`, true, false, `${sku} contains GRA image references`);
  }
}

// 4.2 ASB3093 (Orecchini Joséphine Cristalli Rosa)
{
  const prod = products.find(p => p.sku === 'ASB3093');
  assert(Boolean(prod), 'Regression', 'ASB3093 exists', true, Boolean(prod), 'ASB3093 not found in catalog');
  if (prod) {
    const cert = getProductCertificateInfo(prod);
    assert(cert.certificateType === 'silver_crystals', 'Regression', 'ASB3093 type', 'silver_crystals', cert.certificateType, 'ASB3093 must be silver_crystals');
    assert(cert.hasGraTabs === false, 'Regression', 'ASB3093 hasGraTabs', false, cert.hasGraTabs, 'ASB3093 must NEVER have GRA tabs');
    assert(cert.tabs.length === 1, 'Regression', 'ASB3093 tabs count', 1, cert.tabs.length, 'ASB3093 must have exactly 1 tab');
    assert(cert.certificateImage === '/Brand/certificato_argento925.webp', 'Regression', 'ASB3093 certImage', '/Brand/certificato_argento925.webp', cert.certificateImage, 'ASB3093 must use certificato_argento925.webp');
    assert(cert.tabs[0].imageSrc === '/Brand/certificato_argento925.webp', 'Regression', 'ASB3093 tab 0 image', '/Brand/certificato_argento925.webp', cert.tabs[0].imageSrc, 'ASB3093 tab image must be certificato_argento925.webp');
    assert(!cert.tabs.some(t => t.imageSrc.includes('moissanite') || t.imageSrc.includes('gra')), 'Regression', 'ASB3093 no moiss/gra images', true, false, 'ASB3093 contains moissanite/GRA images');
  }
}

// 4.3 ASB4054-PINK (Bracciale Eden Rose)
{
  const prod = products.find(p => p.sku === 'ASB4054-PINK');
  assert(Boolean(prod), 'Regression', 'ASB4054-PINK exists', true, Boolean(prod), 'ASB4054-PINK not found in catalog');
  if (prod) {
    const cert = getProductCertificateInfo(prod);
    assert(cert.certificateType === 'moissanite_rhodium', 'Regression', 'ASB4054-PINK type', 'moissanite_rhodium', cert.certificateType, 'ASB4054-PINK must be moissanite_rhodium');
    assert(cert.hasGraTabs === true, 'Regression', 'ASB4054-PINK hasGraTabs', true, cert.hasGraTabs, 'ASB4054-PINK MUST have GRA tabs');
    assert(cert.tabs.length === 4, 'Regression', 'ASB4054-PINK tabs count', 4, cert.tabs.length, 'ASB4054-PINK must have 4 tabs');
    assert(cert.certificateImage === '/Brand/certificato_moissanite_rodio.webp', 'Regression', 'ASB4054-PINK certImage', '/Brand/certificato_moissanite_rodio.webp', cert.certificateImage, 'ASB4054-PINK must use certificato_moissanite_rodio.webp');
  }
}

// 4.4 BTN005-GOLD (Collana Brera Gold) vs BTN005-SILVER (Collana Brera Silver)
{
  const goldProd = products.find(p => p.sku === 'BTN005-GOLD');
  const silverProd = products.find(p => p.sku === 'BTN005-SILVER');
  assert(Boolean(goldProd), 'Regression', 'BTN005-GOLD exists', true, Boolean(goldProd), 'BTN005-GOLD missing');
  assert(Boolean(silverProd), 'Regression', 'BTN005-SILVER exists', true, Boolean(silverProd), 'BTN005-SILVER missing');
  if (goldProd && silverProd) {
    const goldCert = getProductCertificateInfo(goldProd);
    const silverCert = getProductCertificateInfo(silverProd);
    assert(goldCert.certificateType === 'moissanite_gold', 'Regression', 'BTN005-GOLD type', 'moissanite_gold', goldCert.certificateType, 'BTN005-GOLD must be moissanite_gold');
    assert(silverCert.certificateType === 'moissanite_rhodium', 'Regression', 'BTN005-SILVER type', 'moissanite_rhodium', silverCert.certificateType, 'BTN005-SILVER must be moissanite_rhodium');
    assert(goldCert.hasGraTabs === true && silverCert.hasGraTabs === true, 'Regression', 'Both Brera have GRA', true, true, 'Both must have GRA');
  }
}

// -----------------------------------------------------------------------------
// SUITE 5: Component Hardcoded Paths Audit
// -----------------------------------------------------------------------------
console.log('\n🔍 [Suite 5/5] Auditing static asset references across UI components...');

const componentFiles = [
  'components/ProductTrustBadges.tsx',
  'components/CertificateViewerModal.tsx',
  'components/PackagingModal.tsx',
  'app/garanzia/page.tsx'
];

for (const compRel of componentFiles) {
  const compPath = path.resolve(process.cwd(), compRel);
  assert(fs.existsSync(compPath), 'UI Components', `Component exists: ${compRel}`, true, fs.existsSync(compPath), `Component file missing at ${compPath}`);
  if (fs.existsSync(compPath)) {
    const content = fs.readFileSync(compPath, 'utf8');
    // Match any /Brand/... paths
    const brandMatches = content.match(/\/Brand\/[a-zA-Z0-9_\-\.]+\.(webp|jpg|png|svg)/g) || [];
    for (const match of brandMatches) {
      verifyAssetFile(match, `Static reference in ${compRel}: ${match}`);
    }
  }
}

// -----------------------------------------------------------------------------
// SUMMARY & RESULTS OUTPUT
// -----------------------------------------------------------------------------
console.log('\n======================================================');
console.log(`📊 ADVERSARIAL STRESS TEST SUMMARY`);
console.log(`• Total Assertions: ${totalAssertions}`);
console.log(`• Total Failures: ${failures.length}`);
console.log('======================================================\n');

if (failures.length === 0) {
  console.log('🏆 VERDICT: ALL TESTS PASSED WITH 0 FAILURES. CLASSIFICATION ENGINE & ASSETS ARE 100% BULLETPROOF.');
  process.exit(0);
} else {
  console.error(`💥 VERDICT: ${failures.length} FAILURE(S) DETECTED!`);
  failures.forEach((f, idx) => {
    console.error(`\n[${idx + 1}] ${f.testSuite} :: ${f.testCase}`);
    console.error(`    Reason: ${f.reason}`);
    console.error(`    Expected: ${JSON.stringify(f.expected)}`);
    console.error(`    Actual:   ${JSON.stringify(f.actual)}`);
  });
  process.exit(1);
}
