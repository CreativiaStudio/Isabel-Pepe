import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { runTier1Tests } from '../tests/privilege-club/tier1-feature-coverage.test';
import { POST as subscribeHandler } from '../app/api/newsletter/subscribe/route';
import { supabaseAdmin } from '../lib/supabase';
import {
  generatePrivilegeWelcomeEmailHtml,
  generatePrivilegeWelcomeEmailText,
  sendPrivilegeWelcomeEmail,
} from '../lib/email';
import {
  TestRunner,
  assert,
  assertEqual,
  assertIncludes,
  createMockRequest,
  generateTestEmail,
  cleanupTestData,
} from '../tests/privilege-club/test-helpers';

async function runChallenger2Suite() {
  console.log('\n\x1b[1m\x1b[35m========================================================================\x1b[0m');
  console.log('\x1b[1m\x1b[35m  ISABEL PEPE — CHALLENGER 2: M2 EMPIRICAL VERIFICATION SUITE           \x1b[0m');
  console.log('\x1b[1m\x1b[35m========================================================================\x1b[0m\n');

  // STEP 1: Execute Tier 1 E2E Test Suite
  console.log('\x1b[1m\x1b[34m>>> PHASE 1: Running Tier 1 E2E Feature Coverage Suite <<<\x1b[0m');
  const tier1Runner = await runTier1Tests();
  const t1Summary = tier1Runner.summary();
  console.log(`\n\x1b[1mPhase 1 Summary: ${t1Summary.passed}/${t1Summary.total} Passed (${t1Summary.failed} Failed) in ${t1Summary.totalDurationMs}ms\x1b[0m\n`);

  if (t1Summary.failed > 0) {
    console.error('❌ Tier 1 E2E test suite failed!');
  }

  // STEP 2: Dedicated Challenger 2 Integration & Stress Suite
  console.log('\x1b[1m\x1b[34m>>> PHASE 2: Running Challenger 2 Deep Integration & Stress Suite <<<\x1b[0m');
  const challengerRunner = new TestRunner('Challenger 2: Deep Integration & Adversarial Stress');
  const createdEmails: string[] = [];

  const originalFetch = globalThis.fetch;

  // C2.1: Valid subscription triggers welcome email integration with exact parameters
  await challengerRunner.test('C2.1: Valid subscription invokes Resend API with correct payload & headers', async () => {
    const testEmail = generateTestEmail('c2_valid_dispatch');
    createdEmails.push(testEmail);

    let fetchCalled = false;
    let fetchUrl = '';
    let fetchPayload: any = null;
    let fetchAuthHeader = '';

    globalThis.fetch = (async (input: any, init?: any) => {
      const url = typeof input === 'string' ? input : input.url;
      if (url.includes('api.resend.com')) {
        fetchCalled = true;
        fetchUrl = url;
        fetchAuthHeader = init?.headers?.Authorization || '';
        fetchPayload = JSON.parse(init?.body || '{}');
        return new Response(JSON.stringify({ id: 'resend_msg_test_mock_12345' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return originalFetch(input, init);
    }) as typeof fetch;

    try {
      const req = createMockRequest('http://localhost:3000/api/newsletter/subscribe', {
        body: {
          email: testEmail,
          gdprConsent: true,
          firstName: 'Ginevra',
          lastName: 'de Benci',
          source: 'footer',
        },
      });

      const res = await subscribeHandler(req);
      const data = await res.json();

      assertEqual(res.status, 200, 'HTTP status should be 200');
      assertEqual(data.success, true, 'success must be true');
      assertEqual(data.coupon, 'PRIVILEGE10', 'coupon must be PRIVILEGE10');

      assert(fetchCalled, 'Resend fetch must be called on valid subscription');
      assertEqual(fetchUrl, 'https://api.resend.com/emails', 'Must call Resend emails endpoint');
      assertIncludes(fetchAuthHeader, 'Bearer ', 'Must include Bearer token in Authorization header');
      assertEqual(fetchPayload?.to, [testEmail], 'Recipient must match normalized subscriber email');
      assertIncludes(fetchPayload?.from, 'info@isabelpepe.com', 'Sender must be official info@isabelpepe.com');
      assertIncludes(fetchPayload?.subject, "Benvenuta nell'Atelier Privé", 'Subject must match Atelier Privé luxury welcome');
      assertIncludes(fetchPayload?.html, 'PRIVILEGE10', 'HTML must contain coupon PRIVILEGE10');
      assertIncludes(fetchPayload?.html, 'Ginevra', 'HTML must contain personalized name');
      assertIncludes(fetchPayload?.html, 'Accesso Anticipato 48h', 'HTML must contain Perk 1');
      assertIncludes(fetchPayload?.html, 'Vendite Private Stagionali', 'HTML must contain Perk 2');
      assert(
        fetchPayload?.html.includes('Servizio di Cura & Pulizia Gratuita') ||
        fetchPayload?.html.includes('Servizio di Cura &amp; Pulizia Gratuita'),
        'HTML must contain Perk 3'
      );
      assertIncludes(fetchPayload?.text, 'PRIVILEGE10', 'Text fallback must contain coupon PRIVILEGE10');
      assertIncludes(fetchPayload?.text, 'Ginevra', 'Text fallback must contain personalized name');

      // Verify DB persistence
      const { data: sub } = await supabaseAdmin
        .from('newsletter_subscribers')
        .select('*')
        .eq('email', testEmail)
        .single();
      assert(Boolean(sub), 'Subscriber must be saved in database');
      assertEqual(sub.email, testEmail);
      assertEqual(sub.first_name, 'Ginevra');
      assertEqual(sub.is_active, true);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  // C2.2: Resend API failure resilience (Network error / DNS failure)
  await challengerRunner.test('C2.2: Simulated network failure during email dispatch does NOT break subscription (returns 200 OK)', async () => {
    const testEmail = generateTestEmail('c2_net_err');
    createdEmails.push(testEmail);

    globalThis.fetch = (async (input: any, init?: any) => {
      const url = typeof input === 'string' ? input : input.url;
      if (url.includes('api.resend.com')) {
        throw new TypeError('fetch failed: getaddrinfo ENOTFOUND api.resend.com (Simulated Network Down)');
      }
      return originalFetch(input, init);
    }) as typeof fetch;

    try {
      const req = createMockRequest('http://localhost:3000/api/newsletter/subscribe', {
        body: {
          email: testEmail,
          gdprConsent: true,
          firstName: 'Vittoria',
          source: 'popup_vip',
        },
      });

      const res = await subscribeHandler(req);
      const data = await res.json();

      assertEqual(res.status, 200, 'HTTP status must be 200 OK even when email delivery throws network error');
      assertEqual(data.success, true);
      assertEqual(data.coupon, 'PRIVILEGE10');

      // Verify subscriber was still saved in DB
      const { data: sub } = await supabaseAdmin
        .from('newsletter_subscribers')
        .select('*')
        .eq('email', testEmail)
        .single();
      assert(Boolean(sub), 'Database write must succeed even if email delivery fails');
      assertEqual(sub.source, 'popup_vip');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  // C2.3: Resend HTTP 422 / 500 error response resilience
  await challengerRunner.test('C2.3: Resend API 422/500 error response returns 200 OK to subscriber without crashing', async () => {
    const testEmail = generateTestEmail('c2_resend_500');
    createdEmails.push(testEmail);

    globalThis.fetch = (async (input: any, init?: any) => {
      const url = typeof input === 'string' ? input : input.url;
      if (url.includes('api.resend.com')) {
        return new Response(
          JSON.stringify({
            statusCode: 422,
            name: 'validation_error',
            message: 'Domain not verified or rate limit reached',
          }),
          {
            status: 422,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
      return originalFetch(input, init);
    }) as typeof fetch;

    try {
      const req = createMockRequest('http://localhost:3000/api/newsletter/subscribe', {
        body: {
          email: testEmail,
          gdprConsent: true,
          source: 'footer',
        },
      });

      const res = await subscribeHandler(req);
      const data = await res.json();

      assertEqual(res.status, 200, 'Route must return 200 OK');
      assertEqual(data.success, true);
      assertEqual(data.coupon, 'PRIVILEGE10');

      const { data: sub } = await supabaseAdmin
        .from('newsletter_subscribers')
        .select('id')
        .eq('email', testEmail)
        .single();
      assert(Boolean(sub), 'Subscriber must be recorded in DB');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  // C2.4: Honeypot submission suppresses email dispatch entirely
  await challengerRunner.test('C2.4: Honeypot-triggered bot submission NEVER triggers Resend API call', async () => {
    const testEmail = generateTestEmail('c2_bot_honeypot');
    let emailSentToBot = false;

    globalThis.fetch = (async (input: any, init?: any) => {
      const url = typeof input === 'string' ? input : input.url;
      if (url.includes('api.resend.com')) {
        emailSentToBot = true;
        return new Response(JSON.stringify({ id: 'should_never_happen' }), { status: 200 });
      }
      return originalFetch(input, init);
    }) as typeof fetch;

    try {
      const req = createMockRequest('http://localhost:3000/api/newsletter/subscribe', {
        body: {
          email: testEmail,
          gdprConsent: true,
          website_url: 'https://spambot-target.com',
        },
      });

      const res = await subscribeHandler(req);
      const data = await res.json();

      assertEqual(res.status, 200, 'Honeypot returns 200 OK dummy response');
      assertEqual(data.success, true);
      assertEqual(emailSentToBot, false, 'Email dispatch MUST be suppressed for bots');

      const { data: sub } = await supabaseAdmin
        .from('newsletter_subscribers')
        .select('id')
        .eq('email', testEmail)
        .maybeSingle();
      assertEqual(sub, null, 'No DB entry for honeypot bot');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  // C2.5: GDPR rejection suppresses email dispatch entirely
  await challengerRunner.test('C2.5: Missing/rejected GDPR consent NEVER triggers Resend API call', async () => {
    const testEmail = generateTestEmail('c2_gdpr_rejected');
    let emailSent = false;

    globalThis.fetch = (async (input: any, init?: any) => {
      const url = typeof input === 'string' ? input : input.url;
      if (url.includes('api.resend.com')) {
        emailSent = true;
        return new Response(JSON.stringify({ id: 'should_never_happen' }), { status: 200 });
      }
      return originalFetch(input, init);
    }) as typeof fetch;

    try {
      const req = createMockRequest('http://localhost:3000/api/newsletter/subscribe', {
        body: {
          email: testEmail,
          gdprConsent: false,
        },
      });

      const res = await subscribeHandler(req);
      assertEqual(res.status, 400, 'Rejection must return 400 Bad Request');
      assertEqual(emailSent, false, 'Email dispatch MUST be suppressed when GDPR is not given');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  // C2.6: Parameter polymorphism of sendPrivilegeWelcomeEmail
  await challengerRunner.test('C2.6: sendPrivilegeWelcomeEmail handles all argument aliases seamlessly', async () => {
    let capturedTo = '';
    let capturedHtml = '';

    globalThis.fetch = (async (input: any, init?: any) => {
      const url = typeof input === 'string' ? input : input.url;
      if (url.includes('api.resend.com')) {
        const payload = JSON.parse(init?.body || '{}');
        capturedTo = Array.isArray(payload.to) ? payload.to[0] : payload.to;
        capturedHtml = payload.html;
        return new Response(JSON.stringify({ id: 'mock_poly_1' }), { status: 200 });
      }
      return originalFetch(input, init);
    }) as typeof fetch;

    try {
      // Signature 1: { to, firstName, couponCode }
      const res1 = await sendPrivilegeWelcomeEmail({
        to: 'poly1@isabelpepe.com',
        firstName: 'Beatrice',
        couponCode: 'PRIVILEGE10',
      });
      assertEqual(res1.success, true);
      assertEqual(capturedTo, 'poly1@isabelpepe.com');
      assertIncludes(capturedHtml, 'Beatrice');

      // Signature 2: { customerEmail, customerName, couponCode }
      const res2 = await sendPrivilegeWelcomeEmail({
        customerEmail: 'poly2@isabelpepe.com',
        customerName: 'Laura',
        couponCode: 'PRIVILEGE10',
      } as any);
      assertEqual(res2.success, true);
      assertEqual(capturedTo, 'poly2@isabelpepe.com');
      assertIncludes(capturedHtml, 'Laura');

      // Signature 3: { email, firstName }
      const res3 = await sendPrivilegeWelcomeEmail({
        email: 'poly3@isabelpepe.com',
        firstName: 'Eleonora',
      } as any);
      assertEqual(res3.success, true);
      assertEqual(capturedTo, 'poly3@isabelpepe.com');
      assertIncludes(capturedHtml, 'Eleonora');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  // C2.7: Invalid email strings error handling in sendPrivilegeWelcomeEmail
  await challengerRunner.test('C2.7: sendPrivilegeWelcomeEmail handles invalid, empty, or non-string emails safely', async () => {
    const r1 = await sendPrivilegeWelcomeEmail({ to: '' });
    assertEqual(r1.success, false);
    assert(Boolean(r1.error), 'Expected r1.error to be truthy');

    const r2 = await sendPrivilegeWelcomeEmail({ to: 'not_an_email' });
    assertEqual(r2.success, false);

    const r3 = await sendPrivilegeWelcomeEmail({} as any);
    assertEqual(r3.success, false);

    const r4 = await sendPrivilegeWelcomeEmail(null as any);
    assertEqual(r4.success, false);
  });

  // C2.8: HTML template luxury brand fidelity & security
  await challengerRunner.test('C2.8: HTML template contains all 3 perks, color palette, and handles special characters safely', async () => {
    const rawHtml = generatePrivilegeWelcomeEmailHtml({
      firstName: 'Maria & Chiara <VIP>',
      couponCode: 'PRIVILEGE10',
    });

    assertIncludes(rawHtml, 'ISABEL PEPE');
    assertIncludes(rawHtml, 'HAUTE JOAILLERIE');
    assertIncludes(rawHtml, "L'ATELIER PRIVÉ");
    assertIncludes(rawHtml, '10% di Privilegio Riservato');
    assertIncludes(rawHtml, 'PRIVILEGE10');
    assertIncludes(rawHtml, 'Accesso Anticipato 48h');
    assertIncludes(rawHtml, 'Vendite Private Stagionali');
    assert(
      rawHtml.includes('Servizio di Cura & Pulizia Gratuita') ||
      rawHtml.includes('Servizio di Cura &amp; Pulizia Gratuita')
    );
    assertIncludes(rawHtml, 'ESPLORA LA COLLEZIONE');
    assertIncludes(rawHtml, '/shop');
    assertIncludes(rawHtml, '/privacy');
    assertIncludes(rawHtml, '/privacy#unsubscribe');
    assertIncludes(rawHtml, '#FAF8F5');
    assertIncludes(rawHtml, '#C0A09A');
    assertIncludes(rawHtml, '#8A5E58');
    assertIncludes(rawHtml, '#0D0D0D');
  });

  // C2.9: DB coupon PRIVILEGE10 active verification in Supabase
  await challengerRunner.test('C2.9: PRIVILEGE10 coupon is active and configured for 10% in database', async () => {
    const { data: coupon, error } = await supabaseAdmin
      .from('coupons')
      .select('*')
      .eq('code', 'PRIVILEGE10')
      .single();

    assert(!error && Boolean(coupon), 'PRIVILEGE10 must exist in coupons table');
    assertEqual(coupon.is_active, true, 'Coupon must be active');
    assertEqual(coupon.discount_percent, 10, 'Coupon discount must be 10%');
  });

  // Cleanup test data
  console.log(`\n🧹 Cleaning up ${createdEmails.length} Challenger 2 test records...`);
  await cleanupTestData(createdEmails);

  const c2Summary = challengerRunner.summary();
  console.log(`\n\x1b[1m\x1b[32mPhase 2 Summary: ${c2Summary.passed}/${c2Summary.total} Passed (${c2Summary.failed} Failed) in ${c2Summary.totalDurationMs}ms\x1b[0m\n`);

  console.log('\x1b[1m\x1b[35m========================================================================\x1b[0m');
  console.log(`👑 FINAL VERDICT: ${t1Summary.failed === 0 && c2Summary.failed === 0 ? 'ALL CHECKS PASSED (APPROVE)' : 'FAILURES DETECTED (REQUEST_CHANGES)'} 👑`);
  console.log('========================================================================\n');

  if (t1Summary.failed > 0 || c2Summary.failed > 0) {
    process.exit(1);
  }
}

runChallenger2Suite().catch((err) => {
  console.error('❌ Fatal error in Challenger 2 suite:', err);
  process.exit(1);
});
