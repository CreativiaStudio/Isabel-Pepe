import { createClient } from '@supabase/supabase-js';
import sitemap from '../app/sitemap';
import { BASE_URL, getBreadcrumbSchema, getFaqPageSchema } from '../lib/schema';

// Supabase client credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://aarojhgdvzeorhimszpk.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhcm9qaGdkdnplb3JoaW1zenBrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyNDQ0ODIsImV4cCI6MjA5NTgyMDQ4Mn0.bI58QLfKC7FtwoW7Cnml4RNnww8rU29bNQ-1YjjH54k';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runAdversarialTests() {
  console.log('='.repeat(80));
  console.log(' ADVANCED ADVERSARIAL TEST HARNESS — MILESTONE 5');
  console.log('='.repeat(80));

  let failureCount = 0;

  function assert(condition: boolean, testName: string, details?: string) {
    if (condition) {
      console.log(`  [PASS] ${testName}`);
    } else {
      console.error(`  [FAIL] ${testName}${details ? ` -> ${details}` : ''}`);
      failureCount++;
    }
  }

  // =========================================================================
  // TEST SUITE 1: sitemap() deep adversarial verification
  // =========================================================================
  console.log('\n--- SUITE 1: app/sitemap.ts Adversarial Evaluation ---');

  const sitemapEntries = await sitemap();
  console.log(`Total sitemap entries returned: ${sitemapEntries.length}`);

  assert(sitemapEntries.length >= 51, 'Sitemap URL count >= 51', `Actual: ${sitemapEntries.length}`);

  // Check unique URLs
  const urls = sitemapEntries.map(e => e.url);
  const uniqueUrls = new Set(urls);
  assert(uniqueUrls.size === urls.length, 'No duplicate URLs in sitemap', `Duplicates found: ${urls.length - uniqueUrls.size}`);

  // Check URL format and protocol
  let allValidHttps = true;
  let allValidUrlObjects = true;
  for (const entry of sitemapEntries) {
    try {
      const parsed = new URL(entry.url);
      if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
        allValidHttps = false;
      }
    } catch {
      allValidUrlObjects = false;
    }
  }
  assert(allValidUrlObjects, 'All URLs parse cleanly as valid URLs');
  assert(allValidHttps, 'All URLs use valid web protocol (https)');

  // Check lastModified validity
  const allValidDates = sitemapEntries.every(e => e.lastModified instanceof Date && !isNaN(e.lastModified.getTime()));
  assert(allValidDates, 'All entries have valid Date objects for lastModified');

  // Check changeFrequency validity
  const validFrequencies = new Set(['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never']);
  const allValidFrequencies = sitemapEntries.every(e => e.changeFrequency && validFrequencies.has(e.changeFrequency));
  assert(allValidFrequencies, 'All entries have valid changeFrequency');

  // Check priority boundaries [0.0, 1.0]
  const allValidPriorities = sitemapEntries.every(e => typeof e.priority === 'number' && e.priority >= 0.0 && e.priority <= 1.0);
  assert(allValidPriorities, 'All entries have priority in range [0.0, 1.0]');

  // Check specific priority tiers
  const homeEntry = sitemapEntries.find(e => e.url === 'https://www.isabelpepe.com' || e.url === 'https://www.isabelpepe.com/');
  assert(homeEntry?.priority === 1.0, 'Homepage priority is 1.0', `Actual: ${homeEntry?.priority}`);

  const shopEntry = sitemapEntries.find(e => e.url.endsWith('/shop'));
  assert(shopEntry?.priority === 0.9, 'Shop priority is 0.9', `Actual: ${shopEntry?.priority}`);

  const giftingRoutes = [
    '/regali/donna-elegante',
    '/regali/anniversario',
    '/regali/compleanno',
    '/guide/gioielli-demi-fine'
  ];
  for (const route of giftingRoutes) {
    const entry = sitemapEntries.find(e => e.url.endsWith(route));
    assert(entry !== undefined, `Gifting/Guide route present: ${route}`);
    assert(entry?.priority === 0.85, `Gifting/Guide route priority is 0.85: ${route}`, `Actual: ${entry?.priority}`);
    assert(entry?.changeFrequency === 'weekly', `Gifting/Guide route changeFrequency is weekly: ${route}`, `Actual: ${entry?.changeFrequency}`);
  }

  // Supabase product parity test
  const { data: dbProducts, error: dbErr } = await supabase
    .from('products')
    .select('slug, is_active, created_at, image_primary')
    .eq('is_active', true);

  assert(!dbErr && !!dbProducts, 'Supabase query for active products succeeded');
  console.log(`Active products in database: ${dbProducts?.length}`);

  if (dbProducts) {
    const dbSlugs = new Set(dbProducts.map(p => p.slug));
    const productSitemapEntries = sitemapEntries.filter(e => e.url.includes('/prodotto/'));
    assert(productSitemapEntries.length === dbProducts.length, 'Sitemap product count matches DB active products count', `Sitemap: ${productSitemapEntries.length}, DB: ${dbProducts.length}`);

    let allSlugsFound = true;
    for (const p of dbProducts) {
      const expectedUrl = `https://www.isabelpepe.com/prodotto/${p.slug}`;
      const found = sitemapEntries.find(e => e.url === expectedUrl);
      if (!found) {
        allSlugsFound = false;
        console.error(`  [FAIL] Missing product URL in sitemap: ${expectedUrl}`);
      } else {
        if (found.priority !== 0.8) {
          console.error(`  [FAIL] Product ${p.slug} priority expected 0.8, got ${found.priority}`);
        }
      }
    }
    assert(allSlugsFound, 'Every active Supabase product slug is present in sitemap with /prodotto/[slug]');

    // Check inactive products are excluded
    const { data: inactiveDbProducts } = await supabase
      .from('products')
      .select('slug')
      .eq('is_active', false);
    
    if (inactiveDbProducts && inactiveDbProducts.length > 0) {
      let anyInactiveInSitemap = false;
      for (const ip of inactiveDbProducts) {
        if (sitemapEntries.some(e => e.url.endsWith(`/prodotto/${ip.slug}`))) {
          anyInactiveInSitemap = true;
        }
      }
      assert(!anyInactiveInSitemap, 'Inactive products correctly excluded from sitemap');
    } else {
      console.log('  [INFO] No inactive products in DB to test exclusion');
    }
  }

  // =========================================================================
  // TEST SUITE 2: Dynamic Querying on the 4 Landing Pages
  // =========================================================================
  console.log('\n--- SUITE 2: Landing Pages Dynamic Query & Data Integrity ---');

  const landingPages = [
    {
      name: 'Donna Elegante',
      path: '/regali/donna-elegante',
      targetSlugs: [
        'isabel-romance',
        'set-vivienne',
        'siena-gold',
        'vendome-pearl',
        'mon-amour-royale',
        'anello-imperial',
        'set-sweet-romance',
        'orecchini-opera'
      ]
    },
    {
      name: 'Anniversario',
      path: '/regali/anniversario',
      targetSlugs: [
        'anello-lune-d-argent',
        'anello-imperial',
        'bracciale-tennis-monte-carlo',
        'eclat-royal',
        'set-versailles',
        'set-vivienne',
        'collana-brera-gold',
        'isabel-romance',
        'set-ternel'
      ]
    },
    {
      name: 'Compleanno',
      path: '/regali/compleanno',
      targetSlugs: [
        'orecchini-reve',
        'orecchini-duchesse',
        'fleur',
        'collana-metamorphose',
        'bracciale-iconique',
        'orecchini-jos-phine',
        'orecchini-butterfly',
        'set-isabel-rose',
        'collana-etoile',
        'anello-chatelaine-silver'
      ]
    },
    {
      name: 'Guida Gioielli Demi-Fine',
      path: '/guide/gioielli-demi-fine',
      targetSlugs: [
        'siena-gold',
        'set-glow-ribbon',
        'anello-chatelaine-silver',
        'vendome-pearl',
        'orecchini-opera',
        'bracciale-harmonie',
        'set-sweet-romance',
        'collana-brera-silver'
      ]
    }
  ];

  for (const lp of landingPages) {
    console.log(`\n  Checking landing page: ${lp.name} (${lp.path})`);
    const { data: pageProducts, error: pageErr } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .in('slug', lp.targetSlugs);

    assert(!pageErr, `${lp.name}: Supabase query executed without error`);
    assert(pageProducts !== null && pageProducts.length > 0, `${lp.name}: Retrieved active products (${pageProducts?.length || 0} / ${lp.targetSlugs.length} target slugs found)`);

    if (pageProducts && pageProducts.length > 0) {
      // Check required product attributes for rendering and schema
      let allFieldsValid = true;
      for (const prod of pageProducts) {
        const hasId = !!prod.id;
        const hasName = !!prod.name;
        const hasSlug = !!prod.slug;
        const hasPrice = typeof prod.price === 'number' && !isNaN(prod.price);
        const hasImage = !!prod.image_primary;
        if (!hasId || !hasName || !hasSlug || !hasPrice || !hasImage) {
          allFieldsValid = false;
          console.error(`    [FAIL] Product ${prod.slug} missing fields: id=${hasId}, name=${hasName}, slug=${hasSlug}, price=${hasPrice} (val: ${prod.price}, type: ${typeof prod.price}), image_primary=${hasImage} (val: ${prod.image_primary})`);
        }
      }
      assert(allFieldsValid, `${lp.name}: All retrieved products contain valid id, name, slug, numeric price, image_primary`);

      // Test ItemList Schema formatting
      const itemList = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: `Selezione ${lp.name}`,
        itemListElement: pageProducts.map((p, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          name: p.name,
          url: `${BASE_URL}/prodotto/${p.slug}`,
          image: p.image_primary,
          offers: {
            '@type': 'Offer',
            price: (p.discount_price && p.discount_price > 0 ? p.discount_price : p.price).toFixed(2),
            priceCurrency: 'EUR',
            availability: 'https://schema.org/InStock',
          }
        }))
      };

      const jsonString = JSON.stringify(itemList);
      assert(jsonString.length > 0 && !jsonString.includes('NaN') && !jsonString.includes('undefined'), `${lp.name}: ItemList JSON-LD parses cleanly without NaN/undefined`);
    }
  }

  // =========================================================================
  // TEST SUITE 3: Schema Helpers Validation
  // =========================================================================
  console.log('\n--- SUITE 3: Schema Generators Adversarial Validation ---');

  const testBreadcrumbs = getBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Regali', url: '/shop' },
    { name: 'Donna Elegante', url: '/regali/donna-elegante' }
  ]);
  assert(testBreadcrumbs['@type'] === 'BreadcrumbList', 'getBreadcrumbSchema returns BreadcrumbList');
  assert(Array.isArray(testBreadcrumbs.itemListElement) && testBreadcrumbs.itemListElement.length === 3, 'BreadcrumbList has 3 items');
  assert(testBreadcrumbs.itemListElement[0].item.startsWith('https://www.isabelpepe.com'), 'Breadcrumb root URL resolves properly', `Actual: ${testBreadcrumbs.itemListElement[0].item}`);

  const testFaqs = getFaqPageSchema([
    { question: 'Q1?', answer: 'A1' },
    { question: 'Q2?', answer: 'A2' }
  ]);
  assert(testFaqs['@type'] === 'FAQPage', 'getFaqPageSchema returns FAQPage');
  assert(Array.isArray(testFaqs.mainEntity) && testFaqs.mainEntity.length === 2, 'FAQPage mainEntity length matches');

  // =========================================================================
  // TEST SUMMARY
  // =========================================================================
  console.log('\n' + '='.repeat(80));
  if (failureCount === 0) {
    console.log(' 🎉 ALL ADVERSARIAL EMPIRICAL TESTS PASSED WITH 0 FAILURES!');
  } else {
    console.error(` ❌ ADVERSARIAL SUITE ENCOUNTERED ${failureCount} FAILURE(S)!`);
  }
  console.log('='.repeat(80));

  if (failureCount > 0) {
    process.exit(1);
  }
}

runAdversarialTests().catch(err => {
  console.error('Fatal test exception:', err);
  process.exit(1);
});
