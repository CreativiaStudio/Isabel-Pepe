/**
 * Adversarial Stress-Test Suite for Milestone 4 (Admin CRM & Subscribers Management Panel)
 * Run with: npx tsx scripts/test_m4_adversarial.ts
 */

import { NewsletterSubscriber } from '../app/admin/actions_newsletter';

// ---------------------------------------------------------------------------
// 1. CSV EXPORT ENGINE ADVERSARIAL STRESS TEST
// ---------------------------------------------------------------------------

function generateCsv(subscribers: NewsletterSubscriber[]): string {
  const BOM = '\uFEFF';
  const headers = [
    'Email',
    'Nome',
    'Cognome',
    'Telefono',
    'Data Iscrizione',
    'Fonte',
    'UTM Source',
    'UTM Campaign',
    'Stato',
    'IP',
  ];

  const escapeField = (val: any): string => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = subscribers.map((s) => [
    escapeField(s.email),
    escapeField(s.first_name || ''),
    escapeField(s.last_name || ''),
    escapeField(s.phone || ''),
    escapeField(s.created_at || s.consent_given_at || ''),
    escapeField(s.source || ''),
    escapeField(s.utm_source || ''),
    escapeField(s.utm_campaign || ''),
    escapeField(s.is_active ? 'Attivo' : 'Disiscritto'),
    escapeField(s.ip_address || ''),
  ]);

  return BOM + headers.join(',') + '\n' + rows.map((row) => row.join(',')).join('\n');
}

// Simple RFC-4180 CSV parser to test compliance and round-trip fidelity
function parseCsv(csv: string): string[][] {
  // Strip BOM if present
  const content = csv.startsWith('\uFEFF') ? csv.slice(1) : csv;
  const result: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let insideQuotes = false;

  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const nextChar = content[i + 1];

    if (insideQuotes) {
      if (char === '"' && nextChar === '"') {
        currentField += '"';
        i++; // skip escaped quote
      } else if (char === '"') {
        insideQuotes = false;
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        insideQuotes = true;
      } else if (char === ',') {
        currentRow.push(currentField);
        currentField = '';
      } else if (char === '\n') {
        currentRow.push(currentField);
        result.push(currentRow);
        currentRow = [];
        currentField = '';
      } else if (char === '\r') {
        // Skip CR if followed by LF
        if (nextChar === '\n') {
          i++;
          currentRow.push(currentField);
          result.push(currentRow);
          currentRow = [];
          currentField = '';
        }
      } else {
        currentField += char;
      }
    }
  }

  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField);
    result.push(currentRow);
  }

  return result;
}

// ---------------------------------------------------------------------------
// 2. TAG PARSING & PRIVILEGE CLUB RECOGNITION (from CrmTable.tsx)
// ---------------------------------------------------------------------------

function getCustomerTags(customer: any): string[] {
  if (!customer?.tags) return [];
  if (Array.isArray(customer.tags)) {
    return customer.tags.map((t: any) => String(t));
  }
  if (typeof customer.tags === 'string') {
    try {
      const parsed = JSON.parse(customer.tags);
      if (Array.isArray(parsed)) return parsed.map((t: any) => String(t));
    } catch {
      return customer.tags.split(',').map((t: string) => t.trim()).filter(Boolean);
    }
  }
  return [];
}

function isPrivilegeMember(customer: any): boolean {
  const tags = getCustomerTags(customer);
  return tags.some((t: string) => {
    const lower = String(t).toLowerCase().trim();
    return (
      lower === 'club privé' ||
      lower === 'club prive' ||
      lower === 'privilege-club' ||
      lower === 'privilege club' ||
      lower === 'isabel-pepe' ||
      lower === 'vip-club'
    );
  });
}

// ---------------------------------------------------------------------------
// 3. KPI & FILTERING SIMULATION (from NewsletterTable.tsx)
// ---------------------------------------------------------------------------

function simulateNewsletterKpis(subscribers: NewsletterSubscriber[]) {
  const totalSubscribers = subscribers.length;
  const activeSubscribers = subscribers.filter((s) => s.is_active).length;
  const inactiveSubscribers = totalSubscribers - activeSubscribers;
  const activeRate = totalSubscribers > 0 ? Math.round((activeSubscribers / totalSubscribers) * 100) : 0;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const last30DaysCount = subscribers.filter(
    (s) => new Date(s.created_at || s.consent_given_at || 0) >= thirtyDaysAgo
  ).length;

  const popupVipCount = subscribers.filter((s) => s.source === 'popup_vip').length;
  const footerCount = subscribers.filter((s) => s.source === 'footer').length;

  return {
    totalSubscribers,
    activeSubscribers,
    inactiveSubscribers,
    activeRate,
    last30DaysCount,
    popupVipCount,
    footerCount,
  };
}

function filterNewsletterSubscribers(
  subscribers: NewsletterSubscriber[],
  searchTerm: string,
  sourceFilter: 'all' | 'popup_vip' | 'footer',
  statusFilter: 'all' | 'active' | 'inactive'
) {
  return subscribers.filter((item) => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchEmail = item.email?.toLowerCase().includes(term);
      const matchName =
        (item.first_name && item.first_name.toLowerCase().includes(term)) ||
        (item.last_name && item.last_name.toLowerCase().includes(term));
      const matchPhone = item.phone && item.phone.includes(term);
      const matchUtm =
        (item.utm_source && item.utm_source.toLowerCase().includes(term)) ||
        (item.utm_campaign && item.utm_campaign.toLowerCase().includes(term));
      const matchIp = item.ip_address && item.ip_address.includes(term);

      if (!matchEmail && !matchName && !matchPhone && !matchUtm && !matchIp) {
        return false;
      }
    }

    if (sourceFilter === 'popup_vip' && item.source !== 'popup_vip') return false;
    if (sourceFilter === 'footer' && item.source !== 'footer') return false;

    if (statusFilter === 'active' && !item.is_active) return false;
    if (statusFilter === 'inactive' && item.is_active) return false;

    return true;
  });
}

// ---------------------------------------------------------------------------
// TEST RUNNER
// ---------------------------------------------------------------------------

async function runAdversarialTests() {
  console.log('\n============================================================');
  console.log('💎 ISABEL PEPE PRIVILEGE CLUB — M4 ADVERSARIAL CHALLENGER');
  console.log('============================================================\n');

  let passedTests = 0;
  let failedTests = 0;

  function assert(condition: boolean, testName: string, details?: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passedTests++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      if (details) console.error(`     Details: ${details}`);
      failedTests++;
    }
  }

  // --- SUITE 1: CSV EXPORT ROBUSTNESS ---
  console.log('--- TEST SUITE 1: CSV Export Robustness & RFC-4180 Compliance ---');

  const adversarialSubscribers: NewsletterSubscriber[] = [
    {
      id: 'sub-1',
      email: 'eleonore.dupont@hautegems.fr',
      first_name: 'Éléonore',
      last_name: 'Joséphine-d\'Orléans',
      phone: '+33 6 12 34 56 78',
      is_active: true,
      source: 'popup_vip',
      utm_source: 'instagram',
      utm_campaign: '💎_luxury_fall_drop',
      consent_given_at: '2026-08-20T08:00:00.000Z',
      created_at: '2026-08-20T08:00:00.000Z',
      updated_at: '2026-08-20T08:00:00.000Z',
      ip_address: '192.168.1.1',
    },
    {
      id: 'sub-2',
      email: 'quoted"email"@example.com',
      first_name: 'Elena "La Magnifica"',
      last_name: 'Rossi, dei Conti di Milano',
      phone: '+39 333 9876543',
      is_active: false,
      source: 'footer',
      utm_source: 'newsletter,promo',
      utm_campaign: 'summer\nprivate\nsale',
      consent_given_at: '2026-07-01T10:00:00.000Z',
      created_at: '2026-07-01T10:00:00.000Z',
      updated_at: '2026-07-01T10:00:00.000Z',
      ip_address: '10.0.0.1',
    },
    {
      id: 'sub-3',
      email: 'xss@security-test.com',
      first_name: '<script>alert("XSS")</script>',
      last_name: "'; DROP TABLE newsletter_subscribers; --",
      phone: null,
      is_active: true,
      source: 'custom_source',
      utm_source: null,
      utm_campaign: undefined,
      consent_given_at: null,
      created_at: '2026-08-19T12:00:00.000Z',
      updated_at: '2026-08-19T12:00:00.000Z',
      ip_address: null,
    },
  ];

  const csvOutput = generateCsv(adversarialSubscribers);

  assert(csvOutput.startsWith('\uFEFF'), 'CSV output starts with UTF-8 BOM (\\uFEFF) for Excel compatibility');

  const parsedRows = parseCsv(csvOutput);
  assert(parsedRows.length === 4, 'CSV parses to exactly 4 rows (1 header + 3 data rows)', `Got ${parsedRows.length} rows`);
  assert(parsedRows[0].length === 10, 'Header contains exactly 10 columns');

  // Verify Row 1: Accents and emojis
  const row1 = parsedRows[1];
  assert(row1[0] === 'eleonore.dupont@hautegems.fr', 'Row 1 email preserved');
  assert(row1[1] === 'Éléonore', 'Row 1 accented first name preserved (Éléonore)');
  assert(row1[2] === "Joséphine-d'Orléans", 'Row 1 accented last name preserved');
  assert(row1[7] === '💎_luxury_fall_drop', 'Row 1 emoji in UTM campaign preserved (💎)');
  assert(row1[8] === 'Attivo', 'Row 1 active status mapped to "Attivo"');

  // Verify Row 2: Quotes, commas, newlines
  const row2 = parsedRows[2];
  assert(row2[1] === 'Elena "La Magnifica"', 'Row 2 embedded double quotes unescaped correctly');
  assert(row2[2] === 'Rossi, dei Conti di Milano', 'Row 2 embedded comma handled without column split');
  assert(row2[6] === 'newsletter,promo', 'Row 2 comma in UTM source preserved');
  assert(row2[7] === 'summer\nprivate\nsale', 'Row 2 multiline newline preserved inside quotes');
  assert(row2[8] === 'Disiscritto', 'Row 2 inactive status mapped to "Disiscritto"');

  // Verify Row 3: Nulls, XSS, SQL injection strings
  const row3 = parsedRows[3];
  assert(row3[1] === '<script>alert("XSS")</script>', 'Row 3 HTML/XSS preserved without distortion');
  assert(row3[2] === "'; DROP TABLE newsletter_subscribers; --", 'Row 3 SQL injection preserved as raw text');
  assert(row3[3] === '', 'Row 3 null phone rendered as empty string');
  assert(row3[6] === '', 'Row 3 null UTM source rendered as empty string');
  assert(row3[9] === '', 'Row 3 null IP rendered as empty string');

  // Benchmark 10,000 rows generation
  const largeSubscribers: NewsletterSubscriber[] = Array.from({ length: 10000 }, (_, i) => ({
    id: `sub-bench-${i}`,
    email: `vip.client.${i}@isabelpepe.com`,
    first_name: `VIP_${i}`,
    last_name: `Conti_${i}`,
    phone: `+39 333 ${String(i).padStart(7, '0')}`,
    is_active: i % 2 === 0,
    source: i % 3 === 0 ? 'popup_vip' : 'footer',
    utm_source: 'meta_ads',
    utm_campaign: 'haute_joaillerie_2026',
    consent_given_at: '2026-08-20T00:00:00Z',
    created_at: '2026-08-20T00:00:00Z',
    updated_at: '2026-08-20T00:00:00Z',
    ip_address: '127.0.0.1',
  }));

  const startBench = performance.now();
  const largeCsv = generateCsv(largeSubscribers);
  const benchDuration = performance.now() - startBench;
  assert(largeCsv.length > 500000, `10,000 subscribers CSV generated successfully (${(largeCsv.length / 1024 / 1024).toFixed(2)} MB)`);
  assert(benchDuration < 500, `CSV generation of 10,000 rows took ${benchDuration.toFixed(2)}ms (< 500ms threshold)`);

  // --- SUITE 2: TAG PARSING & PRIVILEGE CLUB RESILIENCE ---
  console.log('\n--- TEST SUITE 2: Tag Parsing & Privilege Club Membership Resilience ---');

  const testCases = [
    { customer: { tags: null }, expectedTags: [], expectedPrivilege: false, desc: 'null tags' },
    { customer: { tags: undefined }, expectedTags: [], expectedPrivilege: false, desc: 'undefined tags' },
    { customer: {}, expectedTags: [], expectedPrivilege: false, desc: 'empty customer object' },
    { customer: null, expectedTags: [], expectedPrivilege: false, desc: 'null customer' },
    { customer: { tags: [] }, expectedTags: [], expectedPrivilege: false, desc: 'empty array tags' },
    { customer: { tags: ['Club Privé'] }, expectedTags: ['Club Privé'], expectedPrivilege: true, desc: 'array with "Club Privé"' },
    { customer: { tags: ['club prive'] }, expectedTags: ['club prive'], expectedPrivilege: true, desc: 'array with lowercase "club prive"' },
    { customer: { tags: ['PRIVILEGE-CLUB'] }, expectedTags: ['PRIVILEGE-CLUB'], expectedPrivilege: true, desc: 'array with uppercase "PRIVILEGE-CLUB"' },
    { customer: { tags: ['isabel-pepe', 'newsletter'] }, expectedTags: ['isabel-pepe', 'newsletter'], expectedPrivilege: true, desc: 'array with "isabel-pepe"' },
    { customer: { tags: ['vip-club'] }, expectedTags: ['vip-club'], expectedPrivilege: true, desc: 'array with "vip-club"' },
    { customer: { tags: ['standard-customer', 'gold'] }, expectedTags: ['standard-customer', 'gold'], expectedPrivilege: false, desc: 'non-privilege tags' },
    { customer: { tags: '["Club Privé", "VIP"]' }, expectedTags: ['Club Privé', 'VIP'], expectedPrivilege: true, desc: 'valid JSON string array' },
    { customer: { tags: 'Club Privé, VIP, Gioielli' }, expectedTags: ['Club Privé', 'VIP', 'Gioielli'], expectedPrivilege: true, desc: 'comma-separated string' },
    { customer: { tags: '{"invalid": "json_object"}' }, expectedTags: [], expectedPrivilege: false, desc: 'JSON object string (non-array)' },
    { customer: { tags: { someObj: 123 } }, expectedTags: [], expectedPrivilege: false, desc: 'unexpected object' },
    { customer: { tags: 12345 }, expectedTags: [], expectedPrivilege: false, desc: 'number value' },
    { customer: { tags: true }, expectedTags: [], expectedPrivilege: false, desc: 'boolean value' },
    { customer: { tags: [123, null, undefined, 'Club Privé', { nested: 'obj' }] }, expectedTags: ['123', 'null', 'undefined', 'Club Privé', '[object Object]'], expectedPrivilege: true, desc: 'mixed type array elements' },
  ];

  for (const tc of testCases) {
    let tagsResult: string[] = [];
    let privResult = false;
    let crashed = false;

    try {
      tagsResult = getCustomerTags(tc.customer);
      privResult = isPrivilegeMember(tc.customer);
    } catch (err: any) {
      crashed = true;
      console.error(`Crash on test case ${tc.desc}:`, err);
    }

    assert(!crashed, `Tag parser did not crash on ${tc.desc}`);
    assert(privResult === tc.expectedPrivilege, `Privilege status for ${tc.desc} matched expected (${tc.expectedPrivilege})`);
  }

  // --- SUITE 3: FILTERING & KPI METRICS EDGE CASES ---
  console.log('\n--- TEST SUITE 3: Filtering & KPI Metrics Edge Cases ---');

  // Test 0 subscribers
  const zeroKpis = simulateNewsletterKpis([]);
  assert(zeroKpis.totalSubscribers === 0, 'Zero subscribers total count is 0');
  assert(zeroKpis.activeSubscribers === 0, 'Zero subscribers active count is 0');
  assert(zeroKpis.activeRate === 0, 'Zero subscribers active rate is 0% (no NaN or division by zero)');
  assert(!isNaN(zeroKpis.activeRate), 'Zero subscribers active rate is a valid number');

  // Test search filtering edge cases
  const testSubscribers: NewsletterSubscriber[] = [
    {
      id: 'sub-a',
      email: 'mario.rossi@creativiastudio.com',
      first_name: 'Mario',
      last_name: 'Rossi',
      phone: '+39 340 1234567',
      is_active: true,
      source: 'popup_vip',
      utm_source: 'facebook_ads',
      utm_campaign: 'anelli_solitari_2026',
      consent_given_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ip_address: '93.42.100.5',
    },
    {
      id: 'sub-b',
      email: 'elena.pepe@isabelpepe.com',
      first_name: 'Elena',
      last_name: 'Pepe',
      phone: '+39 349 9876543',
      is_active: false,
      source: 'footer',
      utm_source: 'google_organic',
      utm_campaign: 'collane_oro_18k',
      consent_given_at: '2025-01-01T00:00:00Z',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
      ip_address: '151.20.50.80',
    },
    {
      id: 'sub-c',
      email: 'giulia.bianchi@gmail.com',
      first_name: null,
      last_name: null,
      phone: null,
      is_active: true,
      source: 'popup_vip',
      utm_source: null,
      utm_campaign: null,
      consent_given_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ip_address: null,
    },
  ];

  // 1. Search by email substring
  const search1 = filterNewsletterSubscribers(testSubscribers, 'creativia', 'all', 'all');
  assert(search1.length === 1 && search1[0].id === 'sub-a', 'Search by email domain matches correctly');

  // 2. Search by phone
  const search2 = filterNewsletterSubscribers(testSubscribers, '9876543', 'all', 'all');
  assert(search2.length === 1 && search2[0].id === 'sub-b', 'Search by phone number matches correctly');

  // 3. Search by UTM campaign
  const search3 = filterNewsletterSubscribers(testSubscribers, 'anelli_solitari', 'all', 'all');
  assert(search3.length === 1 && search3[0].id === 'sub-a', 'Search by UTM campaign matches correctly');

  // 4. Search by IP
  const search4 = filterNewsletterSubscribers(testSubscribers, '151.20', 'all', 'all');
  assert(search4.length === 1 && search4[0].id === 'sub-b', 'Search by IP address matches correctly');

  // 5. Search with no results
  const search5 = filterNewsletterSubscribers(testSubscribers, 'nonexistent_query_xyz', 'all', 'all');
  assert(search5.length === 0, 'Search with no matches returns empty array without error');

  // 6. Source filtering: popup_vip
  const sourcePopup = filterNewsletterSubscribers(testSubscribers, '', 'popup_vip', 'all');
  assert(sourcePopup.length === 2, 'Filter by popup_vip matches exactly 2 subscribers');

  // 7. Source filtering: footer
  const sourceFooter = filterNewsletterSubscribers(testSubscribers, '', 'footer', 'all');
  assert(sourceFooter.length === 1 && sourceFooter[0].id === 'sub-b', 'Filter by footer matches exactly 1 subscriber');

  // 8. Status filtering: active
  const statusActive = filterNewsletterSubscribers(testSubscribers, '', 'all', 'active');
  assert(statusActive.length === 2, 'Filter by active matches exactly 2 active subscribers');

  // 9. Status filtering: inactive
  const statusInactive = filterNewsletterSubscribers(testSubscribers, '', 'all', 'inactive');
  assert(statusInactive.length === 1 && statusInactive[0].id === 'sub-b', 'Filter by inactive matches exactly 1 subscriber');

  // 10. Combined search + source + status
  const combined = filterNewsletterSubscribers(testSubscribers, 'mario', 'popup_vip', 'active');
  assert(combined.length === 1 && combined[0].id === 'sub-a', 'Combined multi-criteria filter works seamlessly');

  // --- FINAL SUMMARY ---
  console.log('\n============================================================');
  console.log(`🏁 TEST RESULTS: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log('============================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runAdversarialTests().catch((err) => {
  console.error('Fatal error during adversarial tests:', err);
  process.exit(1);
});
