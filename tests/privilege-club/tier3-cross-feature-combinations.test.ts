import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { POST as subscribeHandler } from '../../app/api/newsletter/subscribe/route';
import { POST as couponValidateHandler } from '../../app/api/coupons/validate/route';
import { supabaseAdmin } from '../../lib/supabase';
import {
  TestRunner,
  assert,
  assertEqual,
  createMockRequest,
  generateTestEmail,
  cleanupTestData,
} from './test-helpers';

export async function runTier3Tests(): Promise<TestRunner> {
  const runner = new TestRunner('Tier 3: Cross-Feature Combinations');
  const createdEmails: string[] = [];

  console.log('\n\x1b[1m\x1b[36m========================================================================\x1b[0m');
  console.log('\x1b[1m\x1b[36m  TIER 3: CROSS-FEATURE INTEGRATION COMBINATIONS\x1b[0m');
  console.log('\x1b[1m\x1b[36m========================================================================\x1b[0m\n');

  // =========================================================================
  // Integration 1: Subscribe -> Validate Coupon -> Cart Discount -> CRM Verify
  // =========================================================================
  await runner.test(
    'T3.1: Full VIP Acquisition Flow: Subscribe -> Validate PRIVILEGE10 -> Cart Discount -> CRM Sync',
    async () => {
      const email = generateTestEmail('t3_full_vip');
      createdEmails.push(email);

      // 1. Subscribe to Privilege Club via VIP Modal
      const subReq = createMockRequest('http://localhost:3000/api/newsletter/subscribe', {
        body: {
          email,
          gdprConsent: true,
          firstName: 'Elena',
          lastName: 'Pepe',
          phone: '+393338889999',
          source: 'popup_vip',
          utmSource: 'instagram',
          utmMedium: 'story_ad',
          utmCampaign: 'summer_sparkle_2026',
        },
      });

      const subRes = await subscribeHandler(subReq);
      const subData = await subRes.json();

      assertEqual(subRes.status, 200, 'Subscription should succeed');
      assertEqual(subData.coupon, 'PRIVILEGE10', 'Received welcome coupon');

      // 2. Validate Received Coupon via API
      const coupReq = createMockRequest('http://localhost:3000/api/coupons/validate', {
        body: { code: subData.coupon, email },
      });
      const coupRes = await couponValidateHandler(coupReq);
      const coupData = await coupRes.json();

      assertEqual(coupRes.status, 200, 'Coupon validation should succeed');
      assertEqual(coupData.discount_percent, 10, 'Coupon gives 10% discount');

      // 3. Cart Calculation Simulation: 1x "Collana Éclipse" (€262.00)
      const itemPrice = 262.0;
      const quantity = 1;
      const subtotal = itemPrice * quantity;
      const discountRate = (coupData.discount_percent || 0) / 100;
      const discountAmount = Number((subtotal * discountRate).toFixed(2));
      const finalTotal = Number((subtotal - discountAmount).toFixed(2));

      assertEqual(discountAmount, 26.2, 'Discount for €262 @ 10% is €26.20');
      assertEqual(finalTotal, 235.8, 'Final discounted total is €235.80');

      // 4. Verify CRM Contacts Sync
      const { data: crmContact, error: crmErr } = await supabaseAdmin
        .from('crm_contacts')
        .select('*')
        .eq('email', email)
        .single();

      assert(!crmErr && Boolean(crmContact), 'CRM Contact must be created and linked');
      assertEqual(crmContact.first_name, 'Elena');
      assertEqual(crmContact.last_name, 'Pepe');
      assertEqual(crmContact.phone, '+393338889999');
      assertEqual(crmContact.marketing_consent, true);
      assert(crmContact.tags.includes('privilege-club'), 'Tags include privilege-club');

      // 5. Verify Newsletter Subscribers Table
      const { data: subRecord } = await supabaseAdmin
        .from('newsletter_subscribers')
        .select('*')
        .eq('email', email)
        .single();

      assertEqual(subRecord.source, 'popup_vip');
      assertEqual(subRecord.utm_campaign, 'summer_sparkle_2026');
      assertEqual(subRecord.is_active, true);
    }
  );

  // =========================================================================
  // Integration 2: Honeypot Trap Short-Circuiting with Malformed Inputs
  // =========================================================================
  await runner.test(
    'T3.2: Honeypot Trap intercepts bot before checking invalid email or missing GDPR',
    async () => {
      const email = 'definitely_not_a_valid_email';

      const req = createMockRequest('http://localhost:3000/api/newsletter/subscribe', {
        body: {
          email,
          gdprConsent: false, // Invalid GDPR
          website_url: 'http://spambot.attack.net', // Honeypot filled
        },
      });

      const res = await subscribeHandler(req);
      const data = await res.json();

      // Honeypot must short-circuit and return 200 dummy response without exposing 400 validation error
      assertEqual(res.status, 200, 'Honeypot short-circuits with 200 OK');
      assertEqual(data.success, true);

      // Verify zero rows in database
      const { data: sub } = await supabaseAdmin
        .from('newsletter_subscribers')
        .select('id')
        .eq('email', email)
        .maybeSingle();

      assertEqual(sub, null, 'No DB row created');
    }
  );

  // =========================================================================
  // Integration 3: Existing Customer Tag Merging & Preservation
  // =========================================================================
  await runner.test(
    'T3.3: Existing high-value customer re-subscribes without losing existing tags',
    async () => {
      const email = generateTestEmail('t3_merge_tags');
      createdEmails.push(email);

      // Pre-populate customer in crm_contacts with special tags
      await supabaseAdmin.from('crm_contacts').insert({
        email,
        first_name: 'Beatrice',
        tags: ['vip-platinum', 'boutique-private-client', 'high-spender'],
        status: 'customer',
      });

      // Customer now subscribes to Privilege Club
      const req = createMockRequest('http://localhost:3000/api/newsletter/subscribe', {
        body: {
          email,
          gdprConsent: true,
          firstName: 'Beatrice',
          lastName: 'Borromeo',
          source: 'footer',
        },
      });

      const res = await subscribeHandler(req);
      assertEqual(res.status, 200);

      // Verify tags in crm_contacts
      const { data: crmContact } = await supabaseAdmin
        .from('crm_contacts')
        .select('*')
        .eq('email', email)
        .single();

      const tags: string[] = crmContact?.tags || [];
      assert(tags.includes('vip-platinum'), 'Existing tag vip-platinum must remain');
      assert(tags.includes('boutique-private-client'), 'Existing tag boutique-private-client must remain');
      assert(tags.includes('high-spender'), 'Existing tag high-spender must remain');
      assert(tags.includes('privilege-club'), 'New tag privilege-club must be added');
      assert(tags.includes('newsletter'), 'New tag newsletter must be added');
      assert(tags.includes('gdpr-marketing-ok'), 'New tag gdpr-marketing-ok must be added');
    }
  );

  // =========================================================================
  // Integration 4: Cart Identity Sync to Privilege Club Flow
  // =========================================================================
  await runner.test(
    'T3.4: Visitor with visitorId links newsletter subscription to analytics session identity',
    async () => {
      const email = generateTestEmail('t3_vid_sync');
      createdEmails.push(email);
      const testVisitorId = 'vid_luxury_visitor_' + Date.now();
      const testConsentId = 'csnt_gdpr_all_' + Date.now();

      const req = createMockRequest('http://localhost:3000/api/newsletter/subscribe', {
        body: {
          email,
          gdprConsent: true,
          visitorId: testVisitorId,
          consentId: testConsentId,
          source: 'footer',
        },
      });

      const res = await subscribeHandler(req);
      assertEqual(res.status, 200);

      const { data: sub } = await supabaseAdmin
        .from('newsletter_subscribers')
        .select('visitor_id, consent_id')
        .eq('email', email)
        .single();

      assertEqual(sub?.visitor_id, testVisitorId);
      assertEqual(sub?.consent_id, testConsentId);
    }
  );

  // Cleanup created test records
  console.log(`\n🧹 Cleaning up ${createdEmails.length} Tier 3 test records...`);
  await cleanupTestData(createdEmails);

  return runner;
}

// Run standalone if executed directly
if (import.meta.url === `file://${process.argv[1]?.replace(/\\/g, '/')}`) {
  runTier3Tests().then((runner) => {
    const s = runner.summary();
    console.log(`\n\x1b[1mTier 3 Results: ${s.passed}/${s.total} Passed in ${s.totalDurationMs}ms\x1b[0m`);
    process.exit(s.failed > 0 ? 1 : 0);
  });
}
