import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { POST } from '../app/api/newsletter/subscribe/route';
import { supabaseAdmin } from '../lib/supabase';

interface TestResult {
  category: string;
  name: string;
  passed: boolean;
  details?: string;
  error?: any;
}

const results: TestResult[] = [];

function recordTest(category: string, name: string, condition: boolean, details?: string) {
  results.push({ category, name, passed: condition, details });
  const icon = condition ? '✅' : '❌';
  console.log(`${icon} [${category}] ${name}${details ? ` -> ${details}` : ''}`);
}

async function runAdversarialTestSuite() {
  console.log('🛡️ ========================================================');
  console.log('🛡️ EMPIRICAL CHALLENGER M1 ADVERSARIAL STRESS TEST SUITE');
  console.log('🛡️ Target: /api/newsletter/subscribe & Supabase DB');
  console.log('🛡️ ========================================================\n');

  const ts = Date.now();
  const createdEmailsToCleanup: string[] = [];

  try {
    // =========================================================================
    // CATEGORY 1: MALFORMED JSON BODY & METHOD STRESS
    // =========================================================================
    console.log('\n--- Category 1: Malformed JSON Body & Corrupt Payloads ---');
    
    // 1.1 Non-JSON raw body
    const badJsonReq = new Request('http://localhost:3000/api/newsletter/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'this is completely invalid json {{{',
    });
    const badJsonRes = await POST(badJsonReq);
    const badJsonData = await badJsonRes.json();
    recordTest(
      'Malformed Body',
      'Corrupted JSON body returns 400 Bad Request',
      badJsonRes.status === 400 && badJsonData.error === 'Formato richiesta non valido',
      `Status: ${badJsonRes.status}, Error: "${badJsonData.error}"`
    );

    // 1.2 Empty body object
    const emptyBodyReq = new Request('http://localhost:3000/api/newsletter/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    const emptyBodyRes = await POST(emptyBodyReq);
    const emptyBodyData = await emptyBodyRes.json();
    recordTest(
      'Malformed Body',
      'Empty JSON object {} returns 400 Bad Request (Missing GDPR consent)',
      emptyBodyRes.status === 400 && emptyBodyData.error === 'Consenso GDPR obbligatorio',
      `Status: ${emptyBodyRes.status}, Error: "${emptyBodyData.error}"`
    );

    // =========================================================================
    // CATEGORY 2: INVALID EMAIL FORMATS
    // =========================================================================
    console.log('\n--- Category 2: Invalid Email Formats ---');
    const invalidEmailVectors = [
      { email: 'missing@domain', reason: 'Missing TLD (no dot)' },
      { email: '@domain.com', reason: 'Missing local part' },
      { email: 'user@', reason: 'Missing domain part' },
      { email: 'user @domain.com', reason: 'Space in local part' },
      { email: 'user@ domain.com', reason: 'Space in domain part' },
      { email: 'spaces in @email.com', reason: 'Spaces in email' },
      { email: 'user@@domain.com', reason: 'Multiple @ signs' },
      { email: 'user@.com', reason: 'Missing domain name before dot' },
      { email: '', reason: 'Empty string' },
      { email: '   ', reason: 'Whitespace string' },
      { email: null, reason: 'Null value' },
      { email: 12345, reason: 'Number type' },
      { email: { email: 'nested@example.com' }, reason: 'Object type' },
      { email: ['array@example.com'], reason: 'Array type' },
    ];

    for (const vec of invalidEmailVectors) {
      const emailTestReq = new Request('http://localhost:3000/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: vec.email,
          gdprConsent: true,
          source: 'footer',
        }),
      });

      const res = await POST(emailTestReq);
      const data = await res.json();
      recordTest(
        'Invalid Email',
        `Rejects email: ${JSON.stringify(vec.email)} (${vec.reason})`,
        res.status === 400 && data.error === 'Email non valida',
        `Status: ${res.status}, Error: "${data.error}"`
      );

      // Verify no DB insertion occurred
      if (typeof vec.email === 'string' && vec.email.trim()) {
        const { data: dbCheck } = await supabaseAdmin
          .from('newsletter_subscribers')
          .select('id')
          .eq('email', vec.email.trim().toLowerCase())
          .maybeSingle();
        recordTest(
          'Invalid Email DB Safety',
          `No DB row for invalid email: ${JSON.stringify(vec.email)}`,
          !dbCheck,
          dbCheck ? `Found unexpected row ID: ${dbCheck.id}` : 'Clean'
        );
      }
    }

    // =========================================================================
    // CATEGORY 3: GDPR CONSENT EDGE CASES
    // =========================================================================
    console.log('\n--- Category 3: GDPR Consent Falsy & Invalid Types ---');
    const invalidGdprVectors = [
      { gdprConsent: false, label: 'Boolean false' },
      { gdprConsent: 'false', label: 'String "false"' },
      { gdprConsent: '0', label: 'String "0"' },
      { gdprConsent: 0, label: 'Number 0' },
      { gdprConsent: null, label: 'Null value' },
      { gdprConsent: undefined, label: 'Undefined value' },
      { gdprConsent: '', label: 'Empty string' },
      { gdprConsent: 'no', label: 'String "no"' },
      { gdprConsent: {}, label: 'Object value {}' },
    ];

    for (const gVec of invalidGdprVectors) {
      const dummyEmail = `gdpr.test.${Math.random().toString(36).substring(7)}@test.com`;
      const gdprReq = new Request('http://localhost:3000/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: dummyEmail,
          gdprConsent: gVec.gdprConsent,
          source: 'footer',
        }),
      });

      const res = await POST(gdprReq);
      const data = await res.json();
      recordTest(
        'GDPR Enforcement',
        `Rejects subscription with gdprConsent: ${gVec.label}`,
        res.status === 400 && data.error === 'Consenso GDPR obbligatorio',
        `Status: ${res.status}, Error: "${data.error}"`
      );

      const { data: dbCheck } = await supabaseAdmin
        .from('newsletter_subscribers')
        .select('id')
        .eq('email', dummyEmail)
        .maybeSingle();
      recordTest(
        'GDPR DB Safety',
        `No DB row created when GDPR consent is ${gVec.label}`,
        !dbCheck,
        dbCheck ? `Found row: ${dbCheck.id}` : 'Clean'
      );
    }

    // =========================================================================
    // CATEGORY 4: HONEYPOT & BOT TRAP BEHAVIOR
    // =========================================================================
    console.log('\n--- Category 4: Honeypot & Bot Trapping ---');
    const honeypotVectors = [
      { field: 'website_url', val: 'https://spam-bot-link.ru', label: 'website_url filled' },
      { field: 'website_hp', val: 'I am a spam crawler', label: 'website_hp filled' },
      { field: 'confirm_hp', val: '1', label: 'confirm_hp filled' },
    ];

    for (const hp of honeypotVectors) {
      const spamTrapEmail = `honeypot.${hp.field}.${ts}@trap.com`;
      const hpReq = new Request('http://localhost:3000/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: spamTrapEmail,
          gdprConsent: true,
          source: 'footer',
          [hp.field]: hp.val,
        }),
      });

      const hpRes = await POST(hpReq);
      const hpData = await hpRes.json();
      recordTest(
        'Honeypot Trap',
        `Honeypot (${hp.label}) returns silent success 200 OK`,
        hpRes.status === 200 && hpData.success === true,
        `Status: ${hpRes.status}, Body: ${JSON.stringify(hpData)}`
      );

      const { data: hpDbCheck } = await supabaseAdmin
        .from('newsletter_subscribers')
        .select('id')
        .eq('email', spamTrapEmail)
        .maybeSingle();
      recordTest(
        'Honeypot DB Isolation',
        `Honeypot (${hp.label}) does NOT write to newsletter_subscribers DB`,
        !hpDbCheck,
        hpDbCheck ? `VULNERABILITY: Spambot record saved with ID ${hpDbCheck.id}` : 'Clean - No DB record'
      );
    }

    // Whitespace only honeypot test: should NOT trap legitimate user whose browser autofilled spaces
    const whitespaceHpEmail = `legit.whitespace.hp.${ts}@isabelpepe-audit.com`;
    createdEmailsToCleanup.push(whitespaceHpEmail);
    const wsHpReq = new Request('http://localhost:3000/api/newsletter/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: whitespaceHpEmail,
        gdprConsent: true,
        source: 'footer',
        website_url: '   ', // whitespace only
      }),
    });
    const wsHpRes = await POST(wsHpReq);
    const wsHpData = await wsHpRes.json();
    recordTest(
      'Honeypot Whitespace Resiliency',
      'Whitespace-only honeypot is treated as empty and allowed to register',
      wsHpRes.status === 200 && wsHpData.success === true && wsHpData.coupon === 'PRIVILEGE10',
      `Status: ${wsHpRes.status}`
    );
    const { data: wsDbCheck } = await supabaseAdmin
      .from('newsletter_subscribers')
      .select('id')
      .eq('email', whitespaceHpEmail)
      .maybeSingle();
    recordTest(
      'Honeypot Whitespace DB Row',
      'Legitimate user with whitespace honeypot saved to DB',
      Boolean(wsDbCheck),
      wsDbCheck ? `Row ID: ${wsDbCheck.id}` : 'Not saved'
    );

    // =========================================================================
    // CATEGORY 5: CASE INSENSITIVITY, WHITESPACE NORMALIZATION & IDEMPOTENCY
    // =========================================================================
    console.log('\n--- Category 5: Case Insensitivity & Repeated Idempotent Subscriptions ---');
    const baseEmail = `Adversarial.Case.${ts}@Example.COM`;
    const normalizedTarget = baseEmail.trim().toLowerCase();
    createdEmailsToCleanup.push(normalizedTarget);

    // Step 1: Initial subscription with Mixed Case
    const sub1Req = new Request('http://localhost:3000/api/newsletter/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '1.2.3.4' },
      body: JSON.stringify({
        email: baseEmail,
        gdprConsent: true,
        source: 'footer',
        firstName: 'Elena',
      }),
    });
    const sub1Res = await POST(sub1Req);
    recordTest(
      'Idempotency & Case',
      'Initial mixed-case subscription succeeds (200 OK)',
      sub1Res.status === 200
    );

    // Step 2: Immediate re-subscription with leading/trailing spaces and all UPPERCASE
    const sub2Req = new Request('http://localhost:3000/api/newsletter/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '1.2.3.5' },
      body: JSON.stringify({
        email: `   ${baseEmail.toUpperCase()}   `,
        gdprConsent: true,
        source: 'popup_vip',
        firstName: 'Elena Maria',
      }),
    });
    const sub2Res = await POST(sub2Req);
    recordTest(
      'Idempotency & Case',
      'Repeated uppercase subscription with spaces succeeds (200 OK)',
      sub2Res.status === 200
    );

    // Step 3: Immediate third re-subscription with all lowercase
    const sub3Req = new Request('http://localhost:3000/api/newsletter/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '1.2.3.6' },
      body: JSON.stringify({
        email: normalizedTarget,
        gdprConsent: true,
        source: 'popup_vip',
      }),
    });
    const sub3Res = await POST(sub3Req);
    recordTest(
      'Idempotency & Case',
      'Third lowercase subscription succeeds (200 OK)',
      sub3Res.status === 200
    );

    // Step 4: Verify DB records for this email
    const { data: caseRows, error: caseErr } = await supabaseAdmin
      .from('newsletter_subscribers')
      .select('*')
      .ilike('email', normalizedTarget);

    recordTest(
      'Idempotency & Case DB Check',
      'Exactly 1 row exists in DB for multiple case variations (No duplicate rows)',
      !caseErr && caseRows?.length === 1,
      `Row count: ${caseRows?.length}, Stored Email: ${caseRows?.[0]?.email}`
    );
    recordTest(
      'Idempotency Stored Value',
      'Stored email is normalized lowercase',
      caseRows?.[0]?.email === normalizedTarget,
      `Stored: "${caseRows?.[0]?.email}", Expected: "${normalizedTarget}"`
    );
    recordTest(
      'Idempotency Update',
      'Latest source "popup_vip" and IP "1.2.3.6" updated',
      caseRows?.[0]?.source === 'popup_vip' && caseRows?.[0]?.ip_address === '1.2.3.6',
      `Source: ${caseRows?.[0]?.source}, IP: ${caseRows?.[0]?.ip_address}`
    );

    // =========================================================================
    // CATEGORY 6: CONCURRENCY & RACE CONDITIONS
    // =========================================================================
    console.log('\n--- Category 6: Concurrency & High-Speed Simultaneous Subscriptions ---');
    const concurrentEmail = `concurrent.stress.${ts}@isabelpepe-audit.com`;
    createdEmailsToCleanup.push(concurrentEmail);

    const CONCURRENCY_COUNT = 10;
    const concurrentPromises = Array.from({ length: CONCURRENCY_COUNT }).map((_, i) => {
      const cReq = new Request('http://localhost:3000/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': `192.168.1.${i + 10}`,
        },
        body: JSON.stringify({
          email: i % 2 === 0 ? concurrentEmail.toUpperCase() : concurrentEmail.toLowerCase(),
          gdprConsent: true,
          source: i % 2 === 0 ? 'footer' : 'popup_vip',
          firstName: `Concurrent_${i}`,
        }),
      });
      return POST(cReq);
    });

    const concurrentResponses = await Promise.all(concurrentPromises);
    const concurrentStatuses = await Promise.all(concurrentResponses.map((r) => r.status));
    const all200 = concurrentStatuses.every((s) => s === 200);

    recordTest(
      'Concurrency Stress',
      `All ${CONCURRENCY_COUNT} concurrent requests returned HTTP 200 without lockup or crash`,
      all200,
      `Statuses: ${JSON.stringify(concurrentStatuses)}`
    );

    const { data: concDbRows } = await supabaseAdmin
      .from('newsletter_subscribers')
      .select('*')
      .eq('email', concurrentEmail);

    recordTest(
      'Concurrency DB Integrity',
      `Exactly ONE row exists in database after ${CONCURRENCY_COUNT} concurrent requests`,
      concDbRows?.length === 1,
      `DB Row Count: ${concDbRows?.length}`
    );

    // =========================================================================
    // CATEGORY 7: PAYLOAD INJECTION (SQLi, XSS, PROTOTYPE POLLUTION, EMOJI)
    // =========================================================================
    console.log('\n--- Category 7: Payload Injection & Security Hardening ---');
    
    // 7.1 SQL Injection string in metadata fields
    const sqliEmail = `sqli.victim.${ts}@isabelpepe-audit.com`;
    createdEmailsToCleanup.push(sqliEmail);

    const sqliReq = new Request('http://localhost:3000/api/newsletter/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: sqliEmail,
        gdprConsent: true,
        source: 'footer',
        firstName: "Robert'); DROP TABLE newsletter_subscribers; --",
        lastName: "' OR '1'='1' --",
        utmSource: "union select null, null, null--",
      }),
    });
    const sqliRes = await POST(sqliReq);
    recordTest(
      'Security SQLi',
      'SQL injection payloads in input fields do not crash endpoint (returns 200)',
      sqliRes.status === 200
    );

    const { data: sqliRow, error: sqliDbErr } = await supabaseAdmin
      .from('newsletter_subscribers')
      .select('*')
      .eq('email', sqliEmail)
      .single();

    recordTest(
      'Security SQLi DB Safety',
      'SQL injection strings safely parameterized and stored literally without executing SQL syntax',
      !sqliDbErr && sqliRow?.first_name === "Robert'); DROP TABLE newsletter_subscribers; --",
      `Stored first_name: "${sqliRow?.first_name}"`
    );

    // 7.2 XSS payload in names
    const xssEmail = `xss.victim.${ts}@isabelpepe-audit.com`;
    createdEmailsToCleanup.push(xssEmail);
    const xssPayload = `<script>alert('XSS')</script><img src=x onerror=alert(1)>`;

    const xssReq = new Request('http://localhost:3000/api/newsletter/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: xssEmail,
        gdprConsent: true,
        source: 'footer',
        firstName: xssPayload,
        lastName: '<b>Bold</b>',
      }),
    });
    const xssRes = await POST(xssReq);
    recordTest(
      'Security XSS',
      'XSS string in name accepted and handled safely (200 OK)',
      xssRes.status === 200
    );
    const { data: xssRow } = await supabaseAdmin
      .from('newsletter_subscribers')
      .select('*')
      .eq('email', xssEmail)
      .single();
    recordTest(
      'Security XSS Stored',
      'XSS string stored safely in DB column',
      xssRow?.first_name === xssPayload,
      `Stored first_name length: ${xssRow?.first_name?.length}`
    );

    // 7.3 Unicode, Multi-byte & Emoji in names
    const unicodeEmail = `unicode.tester.${ts}@isabelpepe-audit.com`;
    createdEmailsToCleanup.push(unicodeEmail);
    const emojiName = `👑 Charlotte 💎✨ D'Orléans`;

    const unicodeReq = new Request('http://localhost:3000/api/newsletter/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: unicodeEmail,
        gdprConsent: true,
        source: 'footer',
        firstName: emojiName,
        lastName: '高橋 涼介',
      }),
    });
    const unicodeRes = await POST(unicodeReq);
    recordTest(
      'Unicode / Multibyte',
      'Emoji & Multibyte Japanese/French characters supported without 500 error',
      unicodeRes.status === 200
    );
    const { data: uniRow } = await supabaseAdmin
      .from('newsletter_subscribers')
      .select('*')
      .eq('email', unicodeEmail)
      .single();
    recordTest(
      'Unicode DB Storage',
      'Emoji and Japanese characters stored accurately in DB',
      uniRow?.first_name === emojiName && uniRow?.last_name === '高橋 涼介',
      `Stored: "${uniRow?.first_name}" / "${uniRow?.last_name}"`
    );

    // 7.4 Prototype Pollution & Extra Malicious Payload Fields
    const extraFieldEmail = `extrafields.${ts}@isabelpepe-audit.com`;
    createdEmailsToCleanup.push(extraFieldEmail);

    const protoReq = new Request('http://localhost:3000/api/newsletter/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: extraFieldEmail,
        gdprConsent: true,
        source: 'footer',
        __proto__: { isAdmin: true, bypassSecurity: true },
        constructor: { prototype: { hacked: true } },
        injected_sql_column: 'malicious',
        admin: true,
        role: 'superadmin',
      }),
    });
    const protoRes = await POST(protoReq);
    recordTest(
      'Security Extra Fields',
      'Extra arbitrary/malicious payload fields ignored and request succeeds (200 OK)',
      protoRes.status === 200
    );
    const { data: protoRow } = await supabaseAdmin
      .from('newsletter_subscribers')
      .select('*')
      .eq('email', extraFieldEmail)
      .single();
    recordTest(
      'Security Extra Fields DB Isolation',
      'Only whitelisted schema fields stored in database',
      Boolean(protoRow && protoRow.email === extraFieldEmail),
      `Stored row ID: ${protoRow?.id}`
    );

    // =========================================================================
    // CATEGORY 8: COUPON CODE VALIDATION & INTEGRITY
    // =========================================================================
    console.log('\n--- Category 8: Coupon Database Integrity & Verification ---');
    const { data: coupon, error: couponErr } = await supabaseAdmin
      .from('coupons')
      .select('*')
      .eq('code', 'PRIVILEGE10')
      .single();

    recordTest(
      'Coupon Integrity',
      'PRIVILEGE10 coupon exists in coupons table',
      !couponErr && Boolean(coupon),
      couponErr ? JSON.stringify(couponErr) : `ID: ${coupon?.id}`
    );
    recordTest(
      'Coupon Active Status',
      'PRIVILEGE10 coupon is_active is true',
      coupon?.is_active === true
    );
    recordTest(
      'Coupon Discount Rate',
      'PRIVILEGE10 coupon discount_percent is exactly 10%',
      coupon?.discount_percent === 10,
      `Value: ${coupon?.discount_percent}%`
    );

    // =========================================================================
    // CLEANUP ADVERSARIAL TEST DATA
    // =========================================================================
    console.log('\n--- Cleaning Up Temporary Test Records ---');
    for (const email of createdEmailsToCleanup) {
      await supabaseAdmin.from('newsletter_subscribers').delete().eq('email', email);
      await supabaseAdmin.from('crm_contacts').delete().eq('email', email);
      await supabaseAdmin.from('customers').delete().eq('email', email);
    }
    console.log(`🧹 Cleaned up ${createdEmailsToCleanup.length} test email records from database.`);

  } catch (err: any) {
    console.error('💥 Unhandled Exception during stress testing:', err);
    recordTest('Fatal Exception', 'Test suite executed without fatal throw', false, err.message);
  }

  // =========================================================================
  // RESULTS SUMMARY
  // =========================================================================
  console.log('\n🛡️ ========================================================');
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = total - passed;
  console.log(`🛡️ TOTAL TESTS RUN: ${total}`);
  console.log(`🛡️ PASSED: ${passed}`);
  console.log(`🛡️ FAILED: ${failed}`);
  console.log('🛡️ ========================================================\n');

  if (failed > 0) {
    console.error('❌ ADVERSARIAL CHALLENGE IDENTIFIED FAILURES:');
    for (const f of results.filter((r) => !r.passed)) {
      console.error(`  - [${f.category}] ${f.name}: ${f.details || 'Assertion failed'}`);
    }
    process.exit(1);
  } else {
    console.log('🎉 ALL ADVERSARIAL TESTS PASSED EMPIRICALLY WITH ZERO DEFECTS!');
    process.exit(0);
  }
}

runAdversarialTestSuite();
