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

export async function runTier2Tests(): Promise<TestRunner> {
  const runner = new TestRunner('Tier 2: Boundary & Corner Cases');
  const createdEmails: string[] = [];

  console.log('\n\x1b[1m\x1b[36m========================================================================\x1b[0m');
  console.log('\x1b[1m\x1b[36m  TIER 2: BOUNDARY, CORNER & ADVERSARIAL CASES\x1b[0m');
  console.log('\x1b[1m\x1b[36m========================================================================\x1b[0m\n');

  // =========================================================================
  // 1. Email Format & Normalization Boundaries
  // =========================================================================
  console.log('\x1b[1m\x1b[33m--- 1. Email Format & Normalization Boundaries ---\x1b[0m');

  await runner.test('T2.1: Email with whitespace padding is trimmed and normalized', async () => {
    const rawEmail = generateTestEmail('t2_padded');
    createdEmails.push(rawEmail.toLowerCase());
    const paddedEmail = `   ${rawEmail}   `;

    const req = createMockRequest('http://localhost:3000/api/newsletter/subscribe', {
      body: { email: paddedEmail, gdprConsent: true },
    });

    const res = await subscribeHandler(req);
    assertEqual(res.status, 200);

    const { data: dbSub } = await supabaseAdmin
      .from('newsletter_subscribers')
      .select('email')
      .eq('email', rawEmail.toLowerCase())
      .single();

    assertEqual(dbSub?.email, rawEmail.toLowerCase(), 'Email must be trimmed in database');
  });

  await runner.test('T2.2: Mixed-case email is normalized to lowercase', async () => {
    const rawEmail = generateTestEmail('T2_MixedCase');
    const lowerEmail = rawEmail.toLowerCase();
    createdEmails.push(lowerEmail);

    const req = createMockRequest('http://localhost:3000/api/newsletter/subscribe', {
      body: { email: rawEmail, gdprConsent: true },
    });

    const res = await subscribeHandler(req);
    assertEqual(res.status, 200);

    const { data: dbSub } = await supabaseAdmin
      .from('newsletter_subscribers')
      .select('email')
      .eq('email', lowerEmail)
      .single();

    assertEqual(dbSub?.email, lowerEmail);
  });

  await runner.test('T2.3: Plus-addressing email is accepted as valid (RFC 5322)', async () => {
    const baseEmail = generateTestEmail('t2_plus');
    const [user, domain] = baseEmail.split('@');
    const plusEmail = `${user}+privilege2026@${domain}`;
    createdEmails.push(plusEmail.toLowerCase());

    const req = createMockRequest('http://localhost:3000/api/newsletter/subscribe', {
      body: { email: plusEmail, gdprConsent: true },
    });

    const res = await subscribeHandler(req);
    assertEqual(res.status, 200);

    const { data: dbSub } = await supabaseAdmin
      .from('newsletter_subscribers')
      .select('email')
      .eq('email', plusEmail.toLowerCase())
      .single();

    assertEqual(dbSub?.email, plusEmail.toLowerCase());
  });

  await runner.test('T2.4: Malformed email formats return 400 Bad Request', async () => {
    const invalidEmails = [
      'plainaddress',
      '@missingusername.com',
      'username@.com',
      'username@com',
      'username@domain..com',
      '',
    ];

    for (const inv of invalidEmails) {
      const req = createMockRequest('http://localhost:3000/api/newsletter/subscribe', {
        body: { email: inv, gdprConsent: true },
      });
      const res = await subscribeHandler(req);
      assertEqual(res.status, 400, `Email "${inv}" must return 400`);
    }
  });

  await runner.test('T2.5: Email containing embedded spaces returns 400 Bad Request', async () => {
    const req = createMockRequest('http://localhost:3000/api/newsletter/subscribe', {
      body: { email: 'elena pepe@isabelpepe.com', gdprConsent: true },
    });

    const res = await subscribeHandler(req);
    assertEqual(res.status, 400);
  });

  // =========================================================================
  // 2. Security Hardening: SQL Injection & XSS Payloads
  // =========================================================================
  console.log('\n\x1b[1m\x1b[33m--- 2. Security Hardening: SQL Injection & XSS Payloads ---\x1b[0m');

  await runner.test('T2.6: SQL Injection payload in email is safely rejected by validator', async () => {
    const req = createMockRequest('http://localhost:3000/api/newsletter/subscribe', {
      body: { email: "admin' OR '1'='1", gdprConsent: true },
    });

    const res = await subscribeHandler(req);
    assertEqual(res.status, 400, 'SQL injection string in email field must be rejected');
  });

  await runner.test('T2.7: SQL Injection payload in name fields is stored safely without execution', async () => {
    const email = generateTestEmail('t2_sqli_name');
    createdEmails.push(email);

    const maliciousName = "Elena'); DROP TABLE newsletter_subscribers;--";

    const req = createMockRequest('http://localhost:3000/api/newsletter/subscribe', {
      body: {
        email,
        gdprConsent: true,
        firstName: maliciousName,
      },
    });

    const res = await subscribeHandler(req);
    assertEqual(res.status, 200);

    // Verify database table still exists and data was stored literally
    const { data: dbSub } = await supabaseAdmin
      .from('newsletter_subscribers')
      .select('first_name')
      .eq('email', email)
      .single();

    assertEqual(dbSub?.first_name, maliciousName, 'SQL statement must be stored as literal text');
  });

  await runner.test('T2.8: XSS script tags in first_name stored as literal text', async () => {
    const email = generateTestEmail('t2_xss');
    createdEmails.push(email);

    const xssPayload = "<script>alert('XSS_AUDIT_2026')</script>";

    const req = createMockRequest('http://localhost:3000/api/newsletter/subscribe', {
      body: {
        email,
        gdprConsent: true,
        firstName: xssPayload,
      },
    });

    const res = await subscribeHandler(req);
    assertEqual(res.status, 200);

    const { data: dbSub } = await supabaseAdmin
      .from('newsletter_subscribers')
      .select('first_name')
      .eq('email', email)
      .single();

    assertEqual(dbSub?.first_name, xssPayload);
  });

  await runner.test('T2.9: HTML and formatting payload in UTM fields stored safely', async () => {
    const email = generateTestEmail('t2_xss_utm');
    createdEmails.push(email);

    const maliciousUtm = '<img src=x onerror=alert(1)>';

    const req = createMockRequest('http://localhost:3000/api/newsletter/subscribe', {
      body: {
        email,
        gdprConsent: true,
        utmCampaign: maliciousUtm,
      },
    });

    const res = await subscribeHandler(req);
    assertEqual(res.status, 200);

    const { data: dbSub } = await supabaseAdmin
      .from('newsletter_subscribers')
      .select('utm_campaign')
      .eq('email', email)
      .single();

    assertEqual(dbSub?.utm_campaign, maliciousUtm);
  });

  // =========================================================================
  // 3. Unicode, Emojis & Extreme Lengths
  // =========================================================================
  console.log('\n\x1b[1m\x1b[33m--- 3. Unicode, Emojis & Extreme Lengths ---\x1b[0m');

  await runner.test('T2.10: Accented and international unicode characters preserved', async () => {
    const email = generateTestEmail('t2_unicode');
    createdEmails.push(email);

    const unicodeFirst = 'Éléonore';
    const unicodeLast = 'Nuvolari-München';

    const req = createMockRequest('http://localhost:3000/api/newsletter/subscribe', {
      body: {
        email,
        gdprConsent: true,
        firstName: unicodeFirst,
        lastName: unicodeLast,
      },
    });

    const res = await subscribeHandler(req);
    assertEqual(res.status, 200);

    const { data: dbSub } = await supabaseAdmin
      .from('newsletter_subscribers')
      .select('first_name, last_name')
      .eq('email', email)
      .single();

    assertEqual(dbSub?.first_name, unicodeFirst);
    assertEqual(dbSub?.last_name, unicodeLast);
  });

  await runner.test('T2.11: Emoji characters in metadata preserved (UTF-8 4-byte)', async () => {
    const email = generateTestEmail('t2_emoji');
    createdEmails.push(email);

    const emojiName = 'Elena 💎✨ Haute Joaillerie 👑';

    const req = createMockRequest('http://localhost:3000/api/newsletter/subscribe', {
      body: {
        email,
        gdprConsent: true,
        firstName: emojiName,
      },
    });

    const res = await subscribeHandler(req);
    assertEqual(res.status, 200);

    const { data: dbSub } = await supabaseAdmin
      .from('newsletter_subscribers')
      .select('first_name')
      .eq('email', email)
      .single();

    assertEqual(dbSub?.first_name, emojiName);
  });

  await runner.test('T2.12: Long 500-character UTM campaign parameter handled cleanly', async () => {
    const email = generateTestEmail('t2_long_utm');
    createdEmails.push(email);

    const longUtm = 'privilege_campaign_' + 'A'.repeat(450);

    const req = createMockRequest('http://localhost:3000/api/newsletter/subscribe', {
      body: {
        email,
        gdprConsent: true,
        utmCampaign: longUtm,
      },
    });

    const res = await subscribeHandler(req);
    assertEqual(res.status, 200);

    const { data: dbSub } = await supabaseAdmin
      .from('newsletter_subscribers')
      .select('utm_campaign')
      .eq('email', email)
      .single();

    assertEqual(dbSub?.utm_campaign, longUtm);
  });

  await runner.test('T2.13: Empty string optional fields stored as null', async () => {
    const email = generateTestEmail('t2_empty_strings');
    createdEmails.push(email);

    const req = createMockRequest('http://localhost:3000/api/newsletter/subscribe', {
      body: {
        email,
        gdprConsent: true,
        firstName: '   ',
        lastName: '',
        phone: '',
      },
    });

    const res = await subscribeHandler(req);
    assertEqual(res.status, 200);

    const { data: dbSub } = await supabaseAdmin
      .from('newsletter_subscribers')
      .select('first_name, last_name, phone')
      .eq('email', email)
      .single();

    assertEqual(dbSub?.first_name, null);
    assertEqual(dbSub?.last_name, null);
    assertEqual(dbSub?.phone, null);
  });

  // =========================================================================
  // 4. Concurrency & Race Conditions
  // =========================================================================
  console.log('\n\x1b[1m\x1b[33m--- 4. Concurrency & Race Conditions ---\x1b[0m');

  await runner.test('T2.14: 5 parallel concurrent requests for identical email return 200 OK (0 race crashes)', async () => {
    const email = generateTestEmail('t2_concurrent');
    createdEmails.push(email);

    // Fire 5 identical requests simultaneously
    const requests = Array.from({ length: 5 }, (_, i) =>
      subscribeHandler(
        createMockRequest('http://localhost:3000/api/newsletter/subscribe', {
          body: {
            email,
            gdprConsent: true,
            firstName: `ConcurrentWorker_${i}`,
            source: 'footer',
          },
        })
      )
    );

    const responses = await Promise.all(requests);
    for (const res of responses) {
      assertEqual(res.status, 200, 'All parallel requests should return 200 OK');
    }

    // Verify exactly 1 row exists
    const { data: rows } = await supabaseAdmin
      .from('newsletter_subscribers')
      .select('id')
      .eq('email', email);

    assertEqual(rows?.length, 1, 'Exactly one subscriber record must exist in DB');
  });

  // =========================================================================
  // 5. Coupon Boundary Rules
  // =========================================================================
  console.log('\n\x1b[1m\x1b[33m--- 5. Coupon Boundary Rules ---\x1b[0m');

  await runner.test('T2.15: Expired coupon code returns 400 Bad Request', async () => {
    const expiredCode = `EXPIRED_${Date.now()}`;
    await supabaseAdmin.from('coupons').insert({
      code: expiredCode,
      discount_percent: 15,
      is_active: true,
      expires_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    });

    try {
      const req = createMockRequest('http://localhost:3000/api/coupons/validate', {
        body: { code: expiredCode },
      });

      const res = await couponValidateHandler(req);
      const data = await res.json();

      assertEqual(res.status, 400);
      assertIncludes(data.error, 'scaduto');
    } finally {
      await supabaseAdmin.from('coupons').delete().eq('code', expiredCode);
    }
  });

  await runner.test('T2.16: Targeted coupon with mismatched email returns 403 Forbidden', async () => {
    const targetedCode = `TARGETED_${Date.now()}`;
    const authorizedEmail = 'authorized.vip@isabelpepe.com';

    await supabaseAdmin.from('coupons').insert({
      code: targetedCode,
      discount_percent: 20,
      is_active: true,
      target_email: authorizedEmail,
    });

    try {
      const req = createMockRequest('http://localhost:3000/api/coupons/validate', {
        body: { code: targetedCode, email: 'impostor@example.com' },
      });

      const res = await couponValidateHandler(req);
      const data = await res.json();

      assertEqual(res.status, 403);
      assertIncludes(data.error, 'riservato a un altro account');
    } finally {
      await supabaseAdmin.from('coupons').delete().eq('code', targetedCode);
    }
  });

  await runner.test('T2.17: Targeted coupon with matching email succeeds (200 OK)', async () => {
    const targetedCode = `TARGETED_OK_${Date.now()}`;
    const authorizedEmail = 'authorized.vip@isabelpepe.com';

    await supabaseAdmin.from('coupons').insert({
      code: targetedCode,
      discount_percent: 20,
      is_active: true,
      target_email: authorizedEmail,
    });

    try {
      const req = createMockRequest('http://localhost:3000/api/coupons/validate', {
        body: { code: targetedCode, email: authorizedEmail },
      });

      const res = await couponValidateHandler(req);
      const data = await res.json();

      assertEqual(res.status, 200);
      assertEqual(data.discount_percent, 20);
    } finally {
      await supabaseAdmin.from('coupons').delete().eq('code', targetedCode);
    }
  });

  // Cleanup created test records
  console.log(`\n🧹 Cleaning up ${createdEmails.length} Tier 2 test records...`);
  await cleanupTestData(createdEmails);

  return runner;
}

// Run standalone if executed directly
if (import.meta.url === `file://${process.argv[1]?.replace(/\\/g, '/')}`) {
  runTier2Tests().then((runner) => {
    const s = runner.summary();
    console.log(`\n\x1b[1mTier 2 Results: ${s.passed}/${s.total} Passed in ${s.totalDurationMs}ms\x1b[0m`);
    process.exit(s.failed > 0 ? 1 : 0);
  });
}
