import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { POST } from '../app/api/newsletter/subscribe/route';
import { supabaseAdmin } from '../lib/supabase';

async function runM1Verification() {
  console.log('💎 ========================================================');
  console.log('💎 ISABEL PEPE - PRIVILEGE CLUB M1 BACKEND VERIFICATION SUITE');
  console.log('💎 ========================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, testName: string, details?: string) {
    totalTests++;
    if (condition) {
      passedTests++;
      console.log(`✅ [PASS] ${testName}`);
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      if (details) console.error(`   Details: ${details}`);
    }
  }

  const testEmail = `privilege.test.${Date.now()}@isabelpepe-audit.com`;
  const spamEmail = `spam.bot.${Date.now()}@isabelpepe-audit.com`;
  const crawlerEmail = `crawler.bot.${Date.now()}@isabelpepe-audit.com`;
  const noConsentEmail = `noconsent.${Date.now()}@isabelpepe-audit.com`;

  try {
    // ------------------------------------------------------------------------
    // TEST 1: COUPON DB INTEGRITY
    // ------------------------------------------------------------------------
    console.log('\n--- 1. Testing PRIVILEGE10 Coupon in Database ---');
    const { data: coupon, error: couponErr } = await supabaseAdmin
      .from('coupons')
      .select('*')
      .eq('code', 'PRIVILEGE10')
      .single();

    assert(!couponErr && Boolean(coupon), 'PRIVILEGE10 exists in coupons table', JSON.stringify(couponErr));
    assert(coupon?.is_active === true, 'PRIVILEGE10 is active');
    assert(coupon?.discount_percent === 10, 'PRIVILEGE10 discount_percent is 10%');

    // ------------------------------------------------------------------------
    // TEST 2: HONEYPOT BOT TRAP
    // ------------------------------------------------------------------------
    console.log('\n--- 2. Testing Honeypot Bot Trap ---');
    const honeypotReq = new Request('http://localhost:3000/api/newsletter/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
      body: JSON.stringify({
        email: spamEmail,
        gdprConsent: true,
        source: 'footer',
        website_url: 'https://spam-farm-auto.ru',
      }),
    });

    const honeypotRes = await POST(honeypotReq);
    const honeypotJson = await honeypotRes.json();
    assert(honeypotRes.status === 200, 'Honeypot returns 200 OK');
    assert(honeypotJson.success === true, 'Honeypot response has success: true');

    const { data: spamInDb } = await supabaseAdmin
      .from('newsletter_subscribers')
      .select('id')
      .eq('email', spamEmail)
      .maybeSingle();
    assert(!spamInDb, 'Honeypot submission is silently dropped and NOT saved to database');

    // ------------------------------------------------------------------------
    // TEST 3: CRAWLER USER-AGENT BOT TRAP
    // ------------------------------------------------------------------------
    console.log('\n--- 3. Testing Crawler User-Agent Bot Filter ---');
    const crawlerReq = new Request('http://localhost:3000/api/newsletter/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
      },
      body: JSON.stringify({
        email: crawlerEmail,
        gdprConsent: true,
        source: 'footer',
      }),
    });

    const crawlerRes = await POST(crawlerReq);
    const crawlerJson = await crawlerRes.json();
    assert(crawlerRes.status === 200, 'Crawler request returns 200 OK trap response');
    assert(crawlerJson.success === true, 'Crawler response indicates success');

    const { data: crawlerInDb } = await supabaseAdmin
      .from('newsletter_subscribers')
      .select('id')
      .eq('email', crawlerEmail)
      .maybeSingle();
    assert(!crawlerInDb, 'Crawler submission is NOT saved to database');

    // ------------------------------------------------------------------------
    // TEST 4: MISSING GDPR CONSENT (400 BAD REQUEST)
    // ------------------------------------------------------------------------
    console.log('\n--- 4. Testing GDPR Consent Enforcement ---');
    const noConsentReq = new Request('http://localhost:3000/api/newsletter/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
      },
      body: JSON.stringify({
        email: noConsentEmail,
        gdprConsent: false,
        source: 'footer',
      }),
    });

    const noConsentRes = await POST(noConsentReq);
    const noConsentJson = await noConsentRes.json();
    assert(noConsentRes.status === 400, 'Missing GDPR consent returns 400 Bad Request');
    assert(
      noConsentJson.error === 'Consenso GDPR obbligatorio',
      'Error message is "Consenso GDPR obbligatorio"',
      `Received: ${noConsentJson.error}`
    );

    const { data: noConsentInDb } = await supabaseAdmin
      .from('newsletter_subscribers')
      .select('id')
      .eq('email', noConsentEmail)
      .maybeSingle();
    assert(!noConsentInDb, 'Rejected consent request is NOT saved to database');

    // ------------------------------------------------------------------------
    // TEST 5: INVALID EMAIL FORMAT (400 BAD REQUEST)
    // ------------------------------------------------------------------------
    console.log('\n--- 5. Testing Email Validation ---');
    const badEmailReq = new Request('http://localhost:3000/api/newsletter/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
      },
      body: JSON.stringify({
        email: 'not-a-valid-email',
        gdprConsent: true,
        source: 'footer',
      }),
    });

    const badEmailRes = await POST(badEmailReq);
    const badEmailJson = await badEmailRes.json();
    assert(badEmailRes.status === 400, 'Invalid email returns 400 Bad Request');
    assert(
      badEmailJson.error === 'Email non valida',
      'Error message is "Email non valida"',
      `Received: ${badEmailJson.error}`
    );

    // ------------------------------------------------------------------------
    // TEST 6: VALID REGISTRATION & MULTI-TABLE SYNCHRONIZATION
    // ------------------------------------------------------------------------
    console.log('\n--- 6. Testing Valid Subscription & Unified CRM Sync ---');
    
    // Seed existing customer in customers table
    await supabaseAdmin
      .from('customers')
      .upsert({
        email: testEmail,
        first_name: 'Elena',
        last_name: 'Moretti',
        tags: ['VIP', 'Gold Member'],
        acquisition_source: 'organic',
      }, { onConflict: 'email' });

    const validReq = new Request('http://localhost:3000/api/newsletter/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148',
        'x-forwarded-for': '93.144.120.45, 10.0.0.1',
      },
      body: JSON.stringify({
        email: testEmail,
        gdprConsent: true,
        source: 'footer',
        firstName: 'Elena',
        lastName: 'Moretti',
        phone: '+393401234567',
        utmSource: 'meta_ads',
        utmMedium: 'cpc',
        utmCampaign: 'privilege_club_launch',
      }),
    });

    const validRes = await POST(validReq);
    const validJson = await validRes.json();
    assert(validRes.status === 200, 'Valid subscription returns 200 OK');
    assert(validJson.success === true, 'Response contains success: true');
    assert(validJson.coupon === 'PRIVILEGE10', 'Response contains coupon: "PRIVILEGE10"');
    assert(validJson.message === 'Benvenuta nel Privilege Club', 'Response contains Italian welcome message');

    // Verify newsletter_subscribers row
    const { data: subRecord, error: subErr } = await supabaseAdmin
      .from('newsletter_subscribers')
      .select('*')
      .eq('email', testEmail)
      .single();

    assert(!subErr && Boolean(subRecord), 'Record successfully created in newsletter_subscribers');
    assert(subRecord?.is_active === true, 'Subscriber is_active is true');
    assert(subRecord?.source === 'footer', 'Subscriber source is "footer"');
    assert(subRecord?.first_name === 'Elena', 'Subscriber first_name stored correctly');
    assert(subRecord?.ip_address === '93.144.120.45', 'Client IP extracted correctly from x-forwarded-for');
    assert(subRecord?.utm_source === 'meta_ads', 'UTM source tracked');
    assert(subRecord?.utm_campaign === 'privilege_club_launch', 'UTM campaign tracked');

    // Verify crm_contacts sync
    const { data: crmContact, error: crmErr } = await supabaseAdmin
      .from('crm_contacts')
      .select('*')
      .eq('email', testEmail)
      .single();

    assert(!crmErr && Boolean(crmContact), 'Record synced to crm_contacts');
    assert(crmContact?.marketing_consent === true, 'CRM contact marketing_consent is true');
    assert(
      crmContact?.tags?.includes('privilege-club') && crmContact?.tags?.includes('isabel-pepe'),
      'CRM contact has privilege-club and isabel-pepe tags',
      `Tags: ${JSON.stringify(crmContact?.tags)}`
    );

    // Verify customers Club Privé tag sync
    const { data: customerRecord, error: custErr } = await supabaseAdmin
      .from('customers')
      .select('*')
      .eq('email', testEmail)
      .single();

    assert(!custErr && Boolean(customerRecord), 'Customer record retrieved');
    const custTags = Array.isArray(customerRecord?.tags)
      ? customerRecord.tags
      : typeof customerRecord?.tags === 'string'
      ? JSON.parse(customerRecord.tags)
      : [];
    assert(
      custTags.includes('Club Privé'),
      'Customer record in customers table tagged with "Club Privé"',
      `Tags: ${JSON.stringify(custTags)}`
    );

    // ------------------------------------------------------------------------
    // TEST 7: IDEMPOTENT UPSERT & RE-SUBSCRIPTION
    // ------------------------------------------------------------------------
    console.log('\n--- 7. Testing Idempotence on Repeated Subscription ---');
    const repeatReq = new Request('http://localhost:3000/api/newsletter/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
        'x-real-ip': '93.144.120.50',
      },
      body: JSON.stringify({
        email: testEmail.toUpperCase(), // Test case-insensitivity & uppercase normalization
        gdprConsent: true,
        source: 'popup_vip',
      }),
    });

    const repeatRes = await POST(repeatReq);
    const repeatJson = await repeatRes.json();
    assert(repeatRes.status === 200, 'Duplicate submission returns 200 OK without error');
    assert(repeatJson.success === true, 'Duplicate submission returns success: true');

    const { data: allSubscribersForEmail } = await supabaseAdmin
      .from('newsletter_subscribers')
      .select('*')
      .eq('email', testEmail);

    assert(
      allSubscribersForEmail?.length === 1,
      'No duplicate rows created in newsletter_subscribers (count = 1)',
      `Count: ${allSubscribersForEmail?.length}`
    );
    assert(
      allSubscribersForEmail?.[0]?.source === 'popup_vip',
      'Subscriber source updated to "popup_vip"'
    );

    // ------------------------------------------------------------------------
    // CLEANUP TEST DATA
    // ------------------------------------------------------------------------
    console.log('\n--- Cleanup Test Audit Data ---');
    await supabaseAdmin.from('newsletter_subscribers').delete().eq('email', testEmail);
    await supabaseAdmin.from('crm_contacts').delete().eq('email', testEmail);
    await supabaseAdmin.from('customers').delete().eq('email', testEmail);
    console.log('🧹 Cleaned up temporary test records.');

    // ------------------------------------------------------------------------
    // SUMMARY
    // ------------------------------------------------------------------------
    console.log('\n========================================================');
    console.log(`SUMMARY: ${passedTests}/${totalTests} TESTS PASSED`);
    console.log('========================================================\n');

    if (passedTests === totalTests) {
      console.log('🎉 ALL M1 BACKEND VERIFICATION TESTS PASSED WITH 100% SUCCESS!');
      process.exit(0);
    } else {
      console.error(`💥 ${totalTests - passedTests} TESTS FAILED!`);
      process.exit(1);
    }

  } catch (err: any) {
    console.error('Fatal error during test execution:', err);
    process.exit(1);
  }
}

runM1Verification();
