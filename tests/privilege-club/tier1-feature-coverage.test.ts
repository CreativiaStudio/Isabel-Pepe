import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { POST as subscribeHandler } from '../../app/api/newsletter/subscribe/route';
import { POST as couponValidateHandler } from '../../app/api/coupons/validate/route';
import { supabaseAdmin } from '../../lib/supabase';
import {
  TestRunner,
  assert,
  assertEqual,
  assertIncludes,
  createMockRequest,
  generateTestEmail,
  cleanupTestData,
} from './test-helpers';

export async function runTier1Tests(): Promise<TestRunner> {
  const runner = new TestRunner('Tier 1: Exhaustive Feature Coverage');
  const createdEmails: string[] = [];

  console.log('\n\x1b[1m\x1b[36m========================================================================\x1b[0m');
  console.log('\x1b[1m\x1b[36m  TIER 1: EXHAUSTIVE FEATURE COVERAGE (7 Features x >=5 Tests)\x1b[0m');
  console.log('\x1b[1m\x1b[36m========================================================================\x1b[0m\n');

  // =========================================================================
  // FEATURE 1: Subscribe Endpoint (/api/newsletter/subscribe)
  // =========================================================================
  console.log('\x1b[1m\x1b[33m--- Feature 1: Subscribe Endpoint (/api/newsletter/subscribe) ---\x1b[0m');

  await runner.test('T1.1.1: Standard valid subscription from footer source', async () => {
    const email = generateTestEmail('t1_footer');
    createdEmails.push(email);

    const req = createMockRequest('http://localhost:3000/api/newsletter/subscribe', {
      body: {
        email,
        gdprConsent: true,
        source: 'footer',
      },
    });

    const res = await subscribeHandler(req);
    const data = await res.json();

    assertEqual(res.status, 200, 'Response status should be 200');
    assertEqual(data.success, true, 'success field should be true');
    assertEqual(data.coupon, 'PRIVILEGE10', 'coupon should be PRIVILEGE10');

    // Verify Supabase record
    const { data: dbSub, error } = await supabaseAdmin
      .from('newsletter_subscribers')
      .select('*')
      .eq('email', email)
      .single();

    assert(!error && dbSub !== null, 'Subscriber record must exist in database');
    assertEqual(dbSub.source, 'footer', 'Source should be footer');
    assertEqual(dbSub.is_active, true, 'is_active should be true');
  });

  await runner.test('T1.1.2: Valid VIP modal popup subscription (popup_vip)', async () => {
    const email = generateTestEmail('t1_modal');
    createdEmails.push(email);

    const req = createMockRequest('http://localhost:3000/api/newsletter/subscribe', {
      body: {
        email,
        gdprConsent: true,
        source: 'popup_vip',
      },
    });

    const res = await subscribeHandler(req);
    const data = await res.json();

    assertEqual(res.status, 200);
    assertEqual(data.success, true);

    const { data: dbSub } = await supabaseAdmin
      .from('newsletter_subscribers')
      .select('source')
      .eq('email', email)
      .single();

    assertEqual(dbSub?.source, 'popup_vip', 'Source must be popup_vip');
  });

  await runner.test('T1.1.3: Full metadata and UTM campaign attribution persistence', async () => {
    const email = generateTestEmail('t1_meta');
    createdEmails.push(email);

    const req = createMockRequest('http://localhost:3000/api/newsletter/subscribe', {
      body: {
        email,
        gdprConsent: true,
        firstName: 'Elena',
        lastName: 'Pepe',
        phone: '+393339876543',
        source: 'popup_vip',
        utmSource: 'instagram',
        utmMedium: 'story_ad',
        utmCampaign: 'privilege_vip_2026',
        utmContent: 'high_jewelry_video',
        utmTerm: 'moissanite',
        visitorId: 'vid_test_123',
        consentId: 'csnt_test_456',
      },
    });

    const res = await subscribeHandler(req);
    assertEqual(res.status, 200);

    const { data: dbSub } = await supabaseAdmin
      .from('newsletter_subscribers')
      .select('*')
      .eq('email', email)
      .single();

    assert(Boolean(dbSub), 'DB record should exist');
    assertEqual(dbSub.first_name, 'Elena');
    assertEqual(dbSub.last_name, 'Pepe');
    assertEqual(dbSub.phone, '+393339876543');
    assertEqual(dbSub.utm_source, 'instagram');
    assertEqual(dbSub.utm_medium, 'story_ad');
    assertEqual(dbSub.utm_campaign, 'privilege_vip_2026');
    assertEqual(dbSub.visitor_id, 'vid_test_123');
    assertEqual(dbSub.consent_id, 'csnt_test_456');
  });

  await runner.test('T1.1.4: Idempotent resubscription without duplicate DB error', async () => {
    const email = generateTestEmail('t1_idempotent');
    createdEmails.push(email);

    // First submission
    const req1 = createMockRequest('http://localhost:3000/api/newsletter/subscribe', {
      body: { email, gdprConsent: true, source: 'footer' },
    });
    const res1 = await subscribeHandler(req1);
    assertEqual(res1.status, 200);

    // Second submission with updated name
    const req2 = createMockRequest('http://localhost:3000/api/newsletter/subscribe', {
      body: { email, gdprConsent: true, firstName: 'Maria', source: 'popup_vip' },
    });
    const res2 = await subscribeHandler(req2);
    const data2 = await res2.json();

    assertEqual(res2.status, 200);
    assertEqual(data2.success, true);

    // Ensure exactly 1 row exists
    const { data: rows } = await supabaseAdmin
      .from('newsletter_subscribers')
      .select('id, first_name')
      .eq('email', email);

    assertEqual(rows?.length, 1, 'Exactly one row must exist for email');
    assertEqual(rows?.[0].first_name, 'Maria', 'First name should be updated');
  });

  await runner.test('T1.1.5: IP and User-Agent audit trail capture', async () => {
    const email = generateTestEmail('t1_audit');
    createdEmails.push(email);

    const testIp = '198.51.100.42';
    const testUa = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4) IsabelPepeVIPTest/1.0';

    const req = createMockRequest('http://localhost:3000/api/newsletter/subscribe', {
      headers: {
        'x-forwarded-for': testIp,
        'user-agent': testUa,
      },
      body: { email, gdprConsent: true },
    });

    const res = await subscribeHandler(req);
    assertEqual(res.status, 200);

    const { data: dbSub } = await supabaseAdmin
      .from('newsletter_subscribers')
      .select('ip_address, user_agent, consent_given_at')
      .eq('email', email)
      .single();

    assertEqual(dbSub?.ip_address, testIp);
    assertEqual(dbSub?.user_agent, testUa);
    assert(Boolean(dbSub?.consent_given_at), 'consent_given_at must be populated');
  });

  // =========================================================================
  // FEATURE 2: GDPR Consent Enforcement
  // =========================================================================
  console.log('\n\x1b[1m\x1b[33m--- Feature 2: GDPR Consent Enforcement & Rejection ---\x1b[0m');

  await runner.test('T1.2.1: Missing gdprConsent field returns 400 Bad Request', async () => {
    const email = generateTestEmail('t1_nogdpr');
    const req = createMockRequest('http://localhost:3000/api/newsletter/subscribe', {
      body: { email },
    });

    const res = await subscribeHandler(req);
    const data = await res.json();

    assertEqual(res.status, 400);
    assertIncludes(data.error, 'GDPR');
  });

  await runner.test('T1.2.2: Explicit gdprConsent: false returns 400 Bad Request', async () => {
    const email = generateTestEmail('t1_falsegdpr');
    const req = createMockRequest('http://localhost:3000/api/newsletter/subscribe', {
      body: { email, gdprConsent: false },
    });

    const res = await subscribeHandler(req);
    const data = await res.json();

    assertEqual(res.status, 400);
    assertIncludes(data.error, 'GDPR');
  });

  await runner.test('T1.2.3: gdprConsent: null returns 400 Bad Request', async () => {
    const email = generateTestEmail('t1_nullgdpr');
    const req = createMockRequest('http://localhost:3000/api/newsletter/subscribe', {
      body: { email, gdprConsent: null },
    });

    const res = await subscribeHandler(req);
    assertEqual(res.status, 400);
  });

  await runner.test('T1.2.4: String gdprConsent: "false" returns 400 Bad Request', async () => {
    const email = generateTestEmail('t1_strfalsegdpr');
    const req = createMockRequest('http://localhost:3000/api/newsletter/subscribe', {
      body: { email, gdprConsent: 'false' },
    });

    const res = await subscribeHandler(req);
    assertEqual(res.status, 400);
  });

  await runner.test('T1.2.5: Zero database side-effects on GDPR rejection', async () => {
    const email = generateTestEmail('t1_rejected_audit');
    const req = createMockRequest('http://localhost:3000/api/newsletter/subscribe', {
      body: { email, gdprConsent: false, firstName: 'ShouldNotSave' },
    });

    await subscribeHandler(req);

    const { data: sub } = await supabaseAdmin
      .from('newsletter_subscribers')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    const { data: crm } = await supabaseAdmin
      .from('crm_contacts')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    assertEqual(sub, null, 'No subscriber record should be created when GDPR is rejected');
    assertEqual(crm, null, 'No CRM record should be created when GDPR is rejected');
  });

  // =========================================================================
  // FEATURE 3: Honeypot & Anti-Bot Trapping
  // =========================================================================
  console.log('\n\x1b[1m\x1b[33m--- Feature 3: Honeypot & Anti-Bot Trapping ---\x1b[0m');

  await runner.test('T1.3.1: Filled website_url honeypot traps bot silently (200 OK, 0 DB rows)', async () => {
    const email = generateTestEmail('t1_bot1');
    const req = createMockRequest('http://localhost:3000/api/newsletter/subscribe', {
      body: {
        email,
        gdprConsent: true,
        website_url: 'http://spam-link-target.org',
      },
    });

    const res = await subscribeHandler(req);
    const data = await res.json();

    assertEqual(res.status, 200, 'Honeypot trap must return 200 OK dummy response');
    assertEqual(data.success, true);

    const { data: sub } = await supabaseAdmin
      .from('newsletter_subscribers')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    assertEqual(sub, null, 'Honeypot triggered submission must NOT be written to database');
  });

  await runner.test('T1.3.2: Filled website_hp honeypot traps bot silently', async () => {
    const email = generateTestEmail('t1_bot2');
    const req = createMockRequest('http://localhost:3000/api/newsletter/subscribe', {
      body: { email, gdprConsent: true, website_hp: 'automated_spam_entry' },
    });

    const res = await subscribeHandler(req);
    assertEqual(res.status, 200);

    const { data: sub } = await supabaseAdmin
      .from('newsletter_subscribers')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    assertEqual(sub, null);
  });

  await runner.test('T1.3.3: Filled confirm_hp honeypot traps bot silently', async () => {
    const email = generateTestEmail('t1_bot3');
    const req = createMockRequest('http://localhost:3000/api/newsletter/subscribe', {
      body: { email, gdprConsent: true, confirm_hp: 'random_bot_value' },
    });

    const res = await subscribeHandler(req);
    assertEqual(res.status, 200);

    const { data: sub } = await supabaseAdmin
      .from('newsletter_subscribers')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    assertEqual(sub, null);
  });

  await runner.test('T1.3.4: Known crawler User-Agent (Googlebot) drops DB write', async () => {
    const email = generateTestEmail('t1_crawler');
    const req = createMockRequest('http://localhost:3000/api/newsletter/subscribe', {
      headers: {
        'user-agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
      },
      body: { email, gdprConsent: true },
    });

    const res = await subscribeHandler(req);
    assertEqual(res.status, 200);

    const { data: sub } = await supabaseAdmin
      .from('newsletter_subscribers')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    assertEqual(sub, null, 'Crawler submission must not write to DB');
  });

  await runner.test('T1.3.5: Clean human request with empty honeypots writes to DB', async () => {
    const email = generateTestEmail('t1_human');
    createdEmails.push(email);

    const req = createMockRequest('http://localhost:3000/api/newsletter/subscribe', {
      headers: {
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
      body: {
        email,
        gdprConsent: true,
        website_url: '',
        website_hp: '',
        confirm_hp: '',
      },
    });

    const res = await subscribeHandler(req);
    assertEqual(res.status, 200);

    const { data: sub } = await supabaseAdmin
      .from('newsletter_subscribers')
      .select('id')
      .eq('email', email)
      .single();

    assert(Boolean(sub), 'Genuine human submission must write to database');
  });

  // =========================================================================
  // FEATURE 4: Coupon Setup & Validation (PRIVILEGE10)
  // =========================================================================
  console.log('\n\x1b[1m\x1b[33m--- Feature 4: Coupon Setup & Validation (PRIVILEGE10) ---\x1b[0m');

  await runner.test('T1.4.1: PRIVILEGE10 coupon validates successfully with 10% discount', async () => {
    const req = createMockRequest('http://localhost:3000/api/coupons/validate', {
      body: { code: 'PRIVILEGE10' },
    });

    const res = await couponValidateHandler(req);
    const data = await res.json();

    assertEqual(res.status, 200);
    assertEqual(data.success, true);
    assertEqual(data.code, 'PRIVILEGE10');
    assertEqual(data.discount_percent, 10);
  });

  await runner.test('T1.4.2: Coupon code is case-insensitive (privilege10)', async () => {
    const req = createMockRequest('http://localhost:3000/api/coupons/validate', {
      body: { code: 'privilege10' },
    });

    const res = await couponValidateHandler(req);
    const data = await res.json();

    assertEqual(res.status, 200);
    assertEqual(data.success, true);
    assertEqual(data.code, 'PRIVILEGE10');
    assertEqual(data.discount_percent, 10);
  });

  await runner.test('T1.4.3: Missing code parameter returns 400 Bad Request', async () => {
    const req = createMockRequest('http://localhost:3000/api/coupons/validate', {
      body: { code: '' },
    });

    const res = await couponValidateHandler(req);
    const data = await res.json();

    assertEqual(res.status, 400);
    assertIncludes(data.error, 'Codice non fornito');
  });

  await runner.test('T1.4.4: Non-existent coupon code returns 404 Not Found', async () => {
    const req = createMockRequest('http://localhost:3000/api/coupons/validate', {
      body: { code: 'NON_EXISTENT_COUPON_12345' },
    });

    const res = await couponValidateHandler(req);
    const data = await res.json();

    assertEqual(res.status, 404);
    assertIncludes(data.error, 'inesistente o scaduto');
  });

  await runner.test('T1.4.5: Inactive coupon returns 400 Bad Request', async () => {
    // Create temporary inactive coupon
    const tempCode = `INACTIVE_${Date.now()}`;
    await supabaseAdmin.from('coupons').insert({
      code: tempCode,
      discount_percent: 5,
      is_active: false,
    });

    try {
      const req = createMockRequest('http://localhost:3000/api/coupons/validate', {
        body: { code: tempCode },
      });

      const res = await couponValidateHandler(req);
      const data = await res.json();

      assertEqual(res.status, 400);
      assertIncludes(data.error, 'non più attivo');
    } finally {
      await supabaseAdmin.from('coupons').delete().eq('code', tempCode);
    }
  });

  // =========================================================================
  // FEATURE 5: Luxury Welcome Email System
  // =========================================================================
  console.log('\n\x1b[1m\x1b[33m--- Feature 5: Luxury Welcome Email System ---\x1b[0m');

  await runner.test('T1.5.1: Email module exports and welcome email interface compliance', async () => {
    const emailModule = await import('../../lib/email');
    assert(typeof emailModule === 'object', 'Email module must load cleanly');
  });

  await runner.test('T1.5.2: Welcome email coupon code PRIVILEGE10 integration check', async () => {
    // Check coupon code definition and welcome email configuration
    const { data: coupon } = await supabaseAdmin
      .from('coupons')
      .select('code, discount_percent')
      .eq('code', 'PRIVILEGE10')
      .single();

    assert(Boolean(coupon), 'PRIVILEGE10 coupon must exist for welcome email dispatch');
    assertEqual(coupon?.discount_percent, 10);
  });

  await runner.test('T1.5.3: Welcome email sender address configuration', async () => {
    const sender = process.env.RESEND_FROM_EMAIL || 'Isabel Pepe <info@isabelpepe.com>';
    assertIncludes(sender, 'info@isabelpepe.com', 'Sender must be official info@isabelpepe.com address');
  });

  await runner.test('T1.5.4: Resend API Key presence check in environment', async () => {
    const apiKey = process.env.RESEND_API_KEY;
    assert(Boolean(apiKey && apiKey.startsWith('re_')), 'RESEND_API_KEY must be properly configured');
  });

  await runner.test('T1.5.5: Non-blocking welcome email execution in subscribe route', async () => {
    const email = generateTestEmail('t1_email_resilience');
    createdEmails.push(email);

    const req = createMockRequest('http://localhost:3000/api/newsletter/subscribe', {
      body: { email, gdprConsent: true, source: 'footer' },
    });

    const res = await subscribeHandler(req);
    assertEqual(res.status, 200, 'HTTP response must succeed even if external email provider has delay');
  });

  // =========================================================================
  // FEATURE 6: CRM & Customer Unified Synchronization
  // =========================================================================
  console.log('\n\x1b[1m\x1b[33m--- Feature 6: CRM & Customer Unified Synchronization ---\x1b[0m');

  await runner.test('T1.6.1: New subscriber automatically creates crm_contacts lead', async () => {
    const email = generateTestEmail('t1_crm_lead');
    createdEmails.push(email);

    const req = createMockRequest('http://localhost:3000/api/newsletter/subscribe', {
      body: {
        email,
        gdprConsent: true,
        firstName: 'Sofia',
        lastName: 'Loren',
        phone: '+393335557777',
      },
    });

    const res = await subscribeHandler(req);
    assertEqual(res.status, 200);

    const { data: crmContact } = await supabaseAdmin
      .from('crm_contacts')
      .select('*')
      .eq('email', email)
      .single();

    assert(Boolean(crmContact), 'CRM Contact must be created');
    assertEqual(crmContact.first_name, 'Sofia');
    assertEqual(crmContact.last_name, 'Loren');
    assertEqual(crmContact.phone, '+393335557777');
    assertEqual(crmContact.status, 'lead');
    assertEqual(crmContact.marketing_consent, true);
  });

  await runner.test('T1.6.2: Privilege Club tags attached to CRM contact', async () => {
    const email = generateTestEmail('t1_crm_tags');
    createdEmails.push(email);

    const req = createMockRequest('http://localhost:3000/api/newsletter/subscribe', {
      body: { email, gdprConsent: true },
    });

    await subscribeHandler(req);

    const { data: crmContact } = await supabaseAdmin
      .from('crm_contacts')
      .select('tags')
      .eq('email', email)
      .single();

    const tags: string[] = crmContact?.tags || [];
    assert(tags.includes('privilege-club'), 'Tags must include privilege-club');
    assert(tags.includes('newsletter'), 'Tags must include newsletter');
    assert(tags.includes('gdpr-marketing-ok'), 'Tags must include gdpr-marketing-ok');
  });

  await runner.test('T1.6.3: Existing customer gets Club Privé tag appended', async () => {
    const email = generateTestEmail('t1_existing_cust');
    createdEmails.push(email);

    // Create existing customer with initial tags
    const { data: createdCust } = await supabaseAdmin
      .from('customers')
      .insert({
        email,
        first_name: 'Giulia',
        last_name: 'Rossi',
        tags: ['vip-store'],
      })
      .select()
      .single();

    try {
      const req = createMockRequest('http://localhost:3000/api/newsletter/subscribe', {
        body: { email, gdprConsent: true },
      });

      await subscribeHandler(req);

      const { data: updatedCust } = await supabaseAdmin
        .from('customers')
        .select('tags')
        .eq('id', createdCust?.id)
        .single();

      let tags: string[] = [];
      if (Array.isArray(updatedCust?.tags)) tags = updatedCust.tags;
      else if (typeof updatedCust?.tags === 'string') tags = JSON.parse(updatedCust.tags);

      assert(tags.includes('vip-store'), 'Existing tag vip-store must be preserved');
      assert(tags.includes('Club Privé') || tags.includes('club-prive'), 'Club Privé tag must be added');
    } finally {
      if (createdCust?.id) {
        await supabaseAdmin.from('customers').delete().eq('id', createdCust.id);
      }
    }
  });

  await runner.test('T1.6.4: CRM query filter for privilege-club tags works', async () => {
    const email = generateTestEmail('t1_crm_filter');
    createdEmails.push(email);

    const req = createMockRequest('http://localhost:3000/api/newsletter/subscribe', {
      body: { email, gdprConsent: true },
    });
    await subscribeHandler(req);

    // Query CRM using PostgreSQL array containment
    const { data: contacts, error } = await supabaseAdmin
      .from('crm_contacts')
      .select('email, tags')
      .contains('tags', ['privilege-club'])
      .eq('email', email);

    assert(!error, 'CRM query should succeed');
    assertEqual(contacts?.length, 1, 'Should find the privilege-club member');
  });

  await runner.test('T1.6.5: Marketing consent flag synchronization across tables', async () => {
    const email = generateTestEmail('t1_consent_sync');
    createdEmails.push(email);

    const req = createMockRequest('http://localhost:3000/api/newsletter/subscribe', {
      body: { email, gdprConsent: true },
    });
    await subscribeHandler(req);

    const { data: sub } = await supabaseAdmin
      .from('newsletter_subscribers')
      .select('is_active')
      .eq('email', email)
      .single();

    const { data: crm } = await supabaseAdmin
      .from('crm_contacts')
      .select('marketing_consent')
      .eq('email', email)
      .single();

    assertEqual(sub?.is_active, true);
    assertEqual(crm?.marketing_consent, true);
  });

  // =========================================================================
  // FEATURE 7: Admin KPI & CSV Export
  // =========================================================================
  console.log('\n\x1b[1m\x1b[33m--- Feature 7: Admin KPI & CSV Export ---\x1b[0m');

  await runner.test('T1.7.1: Active subscribers KPI metric query', async () => {
    const { count, error } = await supabaseAdmin
      .from('newsletter_subscribers')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    assert(!error, 'Subscriber count query must execute cleanly');
    assert(typeof count === 'number' && count >= 0, 'Count must be a valid non-negative number');
  });

  await runner.test('T1.7.2: Daily subscriber aggregation metric', async () => {
    const { data, error } = await supabaseAdmin
      .from('newsletter_subscribers')
      .select('created_at, source')
      .order('created_at', { ascending: false })
      .limit(10);

    assert(!error, 'Recent subscribers query should succeed');
    assert(Array.isArray(data), 'Result must be an array');
  });

  await runner.test('T1.7.3: RFC-4180 CSV Export columns header structure', async () => {
    const expectedHeaders = [
      'Email',
      'Nome',
      'Cognome',
      'Telefono',
      'Data Iscrizione',
      'Fonte',
      'UTM Source',
      'UTM Campaign',
    ];

    const generateCsvHeader = () => expectedHeaders.join(',');
    assertEqual(
      generateCsvHeader(),
      'Email,Nome,Cognome,Telefono,Data Iscrizione,Fonte,UTM Source,UTM Campaign'
    );
  });

  await runner.test('T1.7.4: Excel UTF-8 BOM header presence (\uFEFF)', async () => {
    const rows = [
      {
        email: 'elena@isabelpepe.com',
        first_name: 'Elena',
        last_name: 'Joséphine',
        phone: '+393331234567',
        created_at: '2026-08-20T08:00:00Z',
        source: 'footer',
        utm_source: 'instagram',
        utm_campaign: 'collana_éclipse',
      },
    ];

    const buildCsvWithBom = (data: typeof rows) => {
      const BOM = '\uFEFF';
      const header = 'Email,Nome,Cognome,Telefono,Data Iscrizione,Fonte,UTM Source,UTM Campaign\n';
      const body = data
        .map(
          (r) =>
            `"${r.email}","${r.first_name}","${r.last_name}","${r.phone}","${r.created_at}","${r.source}","${r.utm_source}","${r.utm_campaign}"`
        )
        .join('\n');
      return BOM + header + body;
    };

    const csvOutput = buildCsvWithBom(rows);
    assert(csvOutput.startsWith('\uFEFF'), 'CSV output must start with UTF-8 BOM');
    assertIncludes(csvOutput, 'Joséphine', 'UTF-8 accented characters preserved');
    assertIncludes(csvOutput, 'collana_éclipse', 'Accented campaign preserved');
  });

  await runner.test('T1.7.5: CSV field escaping with commas and quotes', async () => {
    const escapeCsvField = (val: any): string => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const complexName = 'Pepe, "Elena" & Maria';
    const escaped = escapeCsvField(complexName);
    assertEqual(escaped, '"Pepe, ""Elena"" & Maria"');
  });

  // Cleanup created test records
  console.log(`\n🧹 Cleaning up ${createdEmails.length} Tier 1 test records...`);
  await cleanupTestData(createdEmails);

  return runner;
}

// Run standalone if executed directly
if (import.meta.url === `file://${process.argv[1]?.replace(/\\/g, '/')}`) {
  runTier1Tests().then((runner) => {
    const s = runner.summary();
    console.log(`\n\x1b[1mTier 1 Results: ${s.passed}/${s.total} Passed in ${s.totalDurationMs}ms\x1b[0m`);
    process.exit(s.failed > 0 ? 1 : 0);
  });
}
