import fs from 'fs';
import path from 'path';

const LLMS_PATH = path.join(__dirname, '..', 'public', 'llms.txt');

interface TestResult {
  category: string;
  name: string;
  passed: boolean;
  details: string;
}

const results: TestResult[] = [];

function assert(category: string, condition: boolean, name: string, details: string) {
  results.push({
    category,
    name,
    passed: condition,
    details: condition ? `PASS: ${details}` : `FAIL: ${details}`,
  });
  if (!condition) {
    console.error(`❌ [FAIL] [${category}] ${name}: ${details}`);
  } else {
    console.log(`✅ [PASS] [${category}] ${name}: ${details}`);
  }
}

async function runLlmsTests() {
  console.log('================================================================');
  console.log('🚀 EMPIRICAL ADVERSARIAL TEST: public/llms.txt Brand Facts & GEO');
  console.log('================================================================\n');

  // --- 1. File existence & Size ---
  assert('FileStats', fs.existsSync(LLMS_PATH), 'llms.txt exists', `File at ${LLMS_PATH}`);
  const content = fs.readFileSync(LLMS_PATH, 'utf-8');
  assert('FileStats', content.length > 500, 'llms.txt non-trivial size', `Byte length: ${content.length}`);

  // --- 2. Markdown Hierarchy & Syntax ---
  const lines = content.split(/\r?\n/);
  const headings = lines.filter((l) => l.startsWith('#'));
  
  assert('MarkdownStructure', headings.length >= 6, 'Contains multiple markdown headings', `Found ${headings.length} headings`);
  assert('MarkdownStructure', headings[0].startsWith('# Isabel Pepe'), 'Top-level H1 title is Isabel Pepe', headings[0]);

  // Check heading hierarchy (no skipping from # to ###)
  let validHierarchy = true;
  let prevLevel = 0;
  for (const h of headings) {
    const level = h.match(/^#+/)?.[0].length || 0;
    if (level > prevLevel + 1 && prevLevel > 0) {
      validHierarchy = false;
    }
    prevLevel = level;
  }
  assert('MarkdownStructure', validHierarchy, 'Heading levels follow logical hierarchy without skipping', `Valid: ${validHierarchy}`);

  // --- 3. Core Brand Facts Accuracy ---
  const lower = content.toLowerCase();

  // Founders
  assert(
    'BrandFacts',
    content.includes('Elena') && (content.includes('Mario Pepe') || content.includes('Mario')),
    'Founders: Elena and Mario Pepe mentioned',
    'Elena & Mario present'
  );

  // Legal entity & P.IVA
  assert(
    'BrandFacts',
    content.includes('Creativia Digital Studio') && content.includes('06399670659'),
    'Legal entity & P.IVA accuracy',
    'Creativia Digital Studio di Mario Pepe (06399670659) present'
  );

  // Location
  assert(
    'BrandFacts',
    content.includes('Salerno'),
    'Location: Salerno (SA) mentioned',
    'Salerno present'
  );

  // Ethical Pledge: 5% to animals
  assert(
    'BrandFacts',
    content.includes('5%') && (lower.includes('animali') || lower.includes('volontari')),
    'Ethical Pledge: 5% donation for animal welfare',
    '5% animal welfare pledge present'
  );

  // Warranty: 24 months
  assert(
    'BrandFacts',
    content.includes('24') && (lower.includes('mesi') || lower.includes('garanzia')),
    'Warranty: 24 months legal guarantee',
    '24 mesi garanzia present'
  );

  // Shipping: 24-48h express / Poste / SDA
  assert(
    'BrandFacts',
    (content.includes('24-48') || content.includes('48h') || content.includes('24h')) &&
      (lower.includes('poste') || lower.includes('sda') || lower.includes('express')),
    'Shipping: 24-48h express delivery with Poste Italiane / SDA',
    '24-48h express shipping present'
  );

  // Returns: 14 days
  assert(
    'BrandFacts',
    content.includes('14') && (lower.includes('giorni') || lower.includes('reso')),
    'Returns: 14 days return policy',
    '14 giorni reso present'
  );

  // Craftsmanship & Materials
  assert(
    'BrandFacts',
    content.includes('Argento Sterling 925') || content.includes('Argento 925'),
    'Material: 925 Sterling Silver',
    'Argento 925 verified'
  );
  assert(
    'BrandFacts',
    content.includes('Oro 18K') && (content.includes('1.0') || content.includes('micron')),
    'Plating: 18K Gold 1.0 Micron plating',
    'Oro 18K 1.0 Micron verified'
  );
  assert(
    'BrandFacts',
    content.includes('E-Coating') || content.includes('e-coating'),
    'Protection: E-Coating nano-seal',
    'E-Coating verified'
  );
  assert(
    'BrandFacts',
    content.includes('Moissanite') && content.includes('GRA'),
    'Stones: GRA Certified Moissanite',
    'Moissanite GRA verified'
  );

  // Luxury packaging / Unboxing
  assert(
    'BrandFacts',
    lower.includes('cofanetto') && (lower.includes('incluso') || lower.includes('luxury')),
    'Packaging: Luxury gift box included',
    'Cofanetto luxury incluso verified'
  );

  // --- 4. Route URLs Audit ---
  const urlRegex = /https:\/\/www\.isabelpepe\.com([a-zA-Z0-9\/\-_]*)/g;
  const matches = [...content.matchAll(urlRegex)];
  const uniqueUrls = Array.from(new Set(matches.map((m) => m[0])));

  assert(
    'URLAudit',
    uniqueUrls.length >= 10,
    'llms.txt contains comprehensive URL directory',
    `Found ${uniqueUrls.length} unique URLs`
  );

  // Verify key routes are listed
  const expectedRoutes = [
    'https://www.isabelpepe.com',
    'https://www.isabelpepe.com/shop',
    'https://www.isabelpepe.com/chi-siamo',
    'https://www.isabelpepe.com/impegno-animali',
    'https://www.isabelpepe.com/garanzia',
    'https://www.isabelpepe.com/spedizioni-resi',
    'https://www.isabelpepe.com/guida-taglie',
    'https://www.isabelpepe.com/cura-gioielli',
    'https://www.isabelpepe.com/assistenza-clienti',
    'https://www.isabelpepe.com/regali/donna-elegante',
    'https://www.isabelpepe.com/regali/anniversario',
    'https://www.isabelpepe.com/regali/compleanno',
    'https://www.isabelpepe.com/guide/gioielli-demi-fine',
  ];

  for (const exp of expectedRoutes) {
    assert(
      'URLAudit',
      uniqueUrls.includes(exp),
      `Expected route in llms.txt: ${exp}`,
      uniqueUrls.includes(exp) ? 'Present' : 'Missing'
    );
  }

  // --- SUMMARY ---
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  console.log('\n================================================================');
  console.log(`LLMS.TXT TEST SUMMARY: ${passed}/${total} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runLlmsTests().catch((err) => {
  console.error('Fatal llms.txt test error:', err);
  process.exit(1);
});
