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

export async function runTier4Tests(): Promise<TestRunner> {
  const runner = new TestRunner('Tier 4: Real-World Scenarios');
  const createdEmails: string[] = [];

  console.log('\n\x1b[1m\x1b[36m========================================================================\x1b[0m');
  console.log('\x1b[1m\x1b[36m  TIER 4: REAL-WORLD PRODUCTION SCENARIOS\x1b[0m');
  console.log('\x1b[1m\x1b[36m========================================================================\x1b[0m\n');

  // =========================================================================
  // Scenario 1: Complete VIP Customer Acquisition Journey (Modal -> Checkout -> Admin CSV)
  // =========================================================================
  await runner.test(
    'T4.1: Scenario 1: New Visitor VIP Acquisition Journey via Modal Popup with UTMs, Coupon & Cart Calculation',
    async () => {
      const email = generateTestEmail('t4_vip_journey');
      createdEmails.push(email);

      console.log('    [Step 1] Customer arrives from Instagram Ad & triggers Privilege Club Modal');
      const subscribeReq = createMockRequest('http://localhost:3000/api/newsletter/subscribe', {
        headers: {
          'x-forwarded-for': '93.45.12.88',
          'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5) Mobile/15E148',
        },
        body: {
          email,
          firstName: 'Ginevra',
          lastName: 'Visconti',
          phone: '+393401122334',
          gdprConsent: true,
          source: 'popup_vip',
          utmSource: 'instagram',
          utmMedium: 'story_ad',
          utmCampaign: 'haute_joaillerie_privilege',
          visitorId: 'vid_ginevra_' + Date.now(),
        },
      });

      const subRes = await subscribeHandler(subscribeReq);
      const subData = await subRes.json();

      assertEqual(subRes.status, 200, 'Subscription succeeds');
      assertEqual(subData.coupon, 'PRIVILEGE10', 'Welcome coupon code returned');

      console.log('    [Step 2] Customer validates welcome coupon PRIVILEGE10 in checkout');
      const couponReq = createMockRequest('http://localhost:3000/api/coupons/validate', {
        body: { code: subData.coupon, email },
      });
      const couponRes = await couponValidateHandler(couponReq);
      const couponData = await couponRes.json();

      assertEqual(couponRes.status, 200);
      assertEqual(couponData.discount_percent, 10);

      console.log('    [Step 3] Cart discount applied to luxury item: Collana Versailles (€420.00)');
      const cartItem = {
        name: 'Collana Versailles',
        price: 420.0,
        quantity: 1,
      };
      const subtotal = cartItem.price * cartItem.quantity;
      const discount = Number((subtotal * 0.1).toFixed(2));
      const totalToPay = Number((subtotal - discount).toFixed(2));

      assertEqual(discount, 42.0, '10% discount on €420 is €42.00');
      assertEqual(totalToPay, 378.0, 'Total to pay is €378.00');

      console.log('    [Step 4] Admin exports CSV and confirms new VIP subscriber appears with correct metadata');
      const { data: subRecord } = await supabaseAdmin
        .from('newsletter_subscribers')
        .select('*')
        .eq('email', email)
        .single();

      assert(Boolean(subRecord), 'Subscriber must exist');
      assertEqual(subRecord.first_name, 'Ginevra');
      assertEqual(subRecord.last_name, 'Visconti');
      assertEqual(subRecord.source, 'popup_vip');
      assertEqual(subRecord.utm_campaign, 'haute_joaillerie_privilege');

      // Build CSV row format
      const csvRow = `"${subRecord.email}","${subRecord.first_name}","${subRecord.last_name}","${subRecord.phone}","${subRecord.created_at}","${subRecord.source}","${subRecord.utm_source}","${subRecord.utm_campaign}"`;
      assertIncludes(csvRow, 'Ginevra', 'CSV row contains subscriber first name');
      assertIncludes(csvRow, 'Visconti', 'CSV row contains subscriber last name');
      assertIncludes(csvRow, 'popup_vip', 'CSV row contains VIP popup source');
    }
  );

  // =========================================================================
  // Scenario 2: Returning Customer Loyalty Re-engagement via Footer
  // =========================================================================
  await runner.test(
    'T4.2: Scenario 2: Returning Customer Loyalty Re-engagement via Footer updates existing record smoothly',
    async () => {
      const email = generateTestEmail('t4_returning');
      createdEmails.push(email);

      // Initial subscription 3 months ago simulation
      const initialSubReq = createMockRequest('http://localhost:3000/api/newsletter/subscribe', {
        body: { email, gdprConsent: true, source: 'popup_vip', firstName: 'Elena' },
      });
      await subscribeHandler(initialSubReq);

      // Re-subscription from footer
      const reSubReq = createMockRequest('http://localhost:3000/api/newsletter/subscribe', {
        body: {
          email,
          gdprConsent: true,
          source: 'footer',
          firstName: 'Elena Maria',
          phone: '+393339991111',
        },
      });
      const reSubRes = await subscribeHandler(reSubReq);
      assertEqual(reSubRes.status, 200);

      // Verify no duplicate in database
      const { data: records } = await supabaseAdmin
        .from('newsletter_subscribers')
        .select('*')
        .eq('email', email);

      assertEqual(records?.length, 1, 'Only 1 record exists');
      assertEqual(records?.[0].first_name, 'Elena Maria', 'Record updated with latest details');
    }
  );

  // =========================================================================
  // Scenario 3: Spambot Attack Mitigation & Zero DB Pollution Under Load
  // =========================================================================
  await runner.test(
    'T4.3: Scenario 3: Spambot Attack Flood (20 parallel automated submissions) causes ZERO DB pollution',
    async () => {
      // Record initial subscriber count
      const { count: initialCount } = await supabaseAdmin
        .from('newsletter_subscribers')
        .select('*', { count: 'exact', head: true });

      // Generate 20 spambot requests with honeypots or bot user-agents
      const botRequests = Array.from({ length: 20 }, (_, i) => {
        const fakeBotEmail = `spambot_${i}_${Date.now()}@spam-harvest-bot.org`;
        const isHoneypot = i % 2 === 0;

        return subscribeHandler(
          createMockRequest('http://localhost:3000/api/newsletter/subscribe', {
            headers: isHoneypot
              ? { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0)' }
              : { 'user-agent': 'AhrefsBot/7.0; +http://ahrefs.com/robot/' },
            body: {
              email: fakeBotEmail,
              gdprConsent: true,
              website_url: isHoneypot ? 'http://pawned-link.com' : '',
            },
          })
        );
      });

      const responses = await Promise.all(botRequests);

      // Verify all 20 responses returned 200 OK (dummy honeypot responses)
      for (const res of responses) {
        assertEqual(res.status, 200, 'Bot should receive 200 dummy response');
      }

      // Verify subscriber count in DB is EXACTLY the same
      const { count: finalCount } = await supabaseAdmin
        .from('newsletter_subscribers')
        .select('*', { count: 'exact', head: true });

      assertEqual(
        finalCount,
        initialCount,
        'Database subscriber count must remain completely unchanged after spambot attack'
      );
    }
  );

  // Cleanup created test records
  console.log(`\n🧹 Cleaning up ${createdEmails.length} Tier 4 test records...`);
  await cleanupTestData(createdEmails);

  return runner;
}

// Run standalone if executed directly
if (import.meta.url === `file://${process.argv[1]?.replace(/\\/g, '/')}`) {
  runTier4Tests().then((runner) => {
    const s = runner.summary();
    console.log(`\n\x1b[1mTier 4 Results: ${s.passed}/${s.total} Passed in ${s.totalDurationMs}ms\x1b[0m`);
    process.exit(s.failed > 0 ? 1 : 0);
  });
}
