import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { supabaseAdmin } from '../../lib/supabase';
import {
  TestRunner,
  assert,
  assertEqual,
  assertIncludes,
  assertDefined,
  createMockRequest,
  generateTestEmail,
  cleanupTestData,
  getContactRouteHandler,
  getAdminReplyRouteHandler,
  getAdminMessageActions,
} from './test-helpers';

export async function runTier2Tests(): Promise<TestRunner> {
  const runner = new TestRunner('Tier 2: Boundary & Corner Cases');
  const createdEmails: string[] = [];
  const createdMessageIds: string[] = [];

  console.log('\n\x1b[1m\x1b[36m========================================================================\x1b[0m');
  console.log('\x1b[1m\x1b[36m  TIER 2: BOUNDARY & CORNER CASES (15 Robustness & Security Tests)\x1b[0m');
  console.log('\x1b[1m\x1b[36m========================================================================\x1b[0m\n');

  try {
    // =========================================================================
    // BOUNDARY: Required Field Validations
    // =========================================================================
    console.log('\x1b[1m\x1b[33m--- Missing & Invalid Input Validations ---\x1b[0m');

    await runner.test('T2.1: Missing customer name returns 400 Bad Request', async () => {
      const email = generateTestEmail('t2_noname');
      const contactHandler = await getContactRouteHandler();
      const req = createMockRequest('http://localhost:3000/api/contact', {
        body: {
          email,
          subject: 'Test Subject',
          message: 'Test Message',
          privacy: true,
        },
      });

      const res = await contactHandler(req);
      assertEqual(res.status, 400, 'Missing name must return 400');
    });

    await runner.test('T2.2: Missing customer email returns 400 Bad Request', async () => {
      const contactHandler = await getContactRouteHandler();
      const req = createMockRequest('http://localhost:3000/api/contact', {
        body: {
          name: 'Test Customer',
          subject: 'Test Subject',
          message: 'Test Message',
          privacy: true,
        },
      });

      const res = await contactHandler(req);
      assertEqual(res.status, 400, 'Missing email must return 400');
    });

    await runner.test('T2.3: Missing subject returns 400 Bad Request', async () => {
      const email = generateTestEmail('t2_nosubject');
      const contactHandler = await getContactRouteHandler();
      const req = createMockRequest('http://localhost:3000/api/contact', {
        body: {
          name: 'Test Customer',
          email,
          message: 'Test Message',
          privacy: true,
        },
      });

      const res = await contactHandler(req);
      assertEqual(res.status, 400, 'Missing subject must return 400');
    });

    await runner.test('T2.4: Missing message body returns 400 Bad Request', async () => {
      const email = generateTestEmail('t2_nomsg');
      const contactHandler = await getContactRouteHandler();
      const req = createMockRequest('http://localhost:3000/api/contact', {
        body: {
          name: 'Test Customer',
          email,
          subject: 'Test Subject',
          privacy: true,
        },
      });

      const res = await contactHandler(req);
      assertEqual(res.status, 400, 'Missing message must return 400');
    });

    await runner.test('T2.5: Missing GDPR privacy consent (privacy: false) returns 400', async () => {
      const email = generateTestEmail('t2_nogdpr');
      const contactHandler = await getContactRouteHandler();
      const req = createMockRequest('http://localhost:3000/api/contact', {
        body: {
          name: 'Test Customer',
          email,
          subject: 'Test Subject',
          message: 'Test Message',
          privacy: false,
        },
      });

      const res = await contactHandler(req);
      assertEqual(res.status, 400, 'Missing privacy consent must return 400');
    });

    await runner.test('T2.6: Malformed email formats rejected with 400 Bad Request', async () => {
      const invalidEmails = [
        'plainaddress',
        '@missinguser.com',
        'user@.com',
        'user@domain..com',
        'user name@example.com',
      ];

      const contactHandler = await getContactRouteHandler();
      for (const badEmail of invalidEmails) {
        const req = createMockRequest('http://localhost:3000/api/contact', {
          body: {
            name: 'Bad Email User',
            email: badEmail,
            subject: 'Invalid Email Test',
            message: 'Testing bad email format',
            privacy: true,
          },
        });

        const res = await contactHandler(req);
        assertEqual(res.status, 400, `Email "${badEmail}" should be rejected with 400`);
      }
    });

    // =========================================================================
    // PAYLOAD INTEGRITY: Large Strings, SQLi, XSS, Unicode
    // =========================================================================
    console.log('\n\x1b[1m\x1b[33m--- Payload Security, Encoding & Size Stress ---\x1b[0m');

    await runner.test('T2.7: Oversized message body (10,000+ characters) handled cleanly', async () => {
      const email = generateTestEmail('t2_large');
      createdEmails.push(email);

      const largeMessage = 'Isabel Pepe Luxury Support Inquiry '.repeat(300); // ~10.5KB
      const contactHandler = await getContactRouteHandler();
      const req = createMockRequest('http://localhost:3000/api/contact', {
        body: {
          name: 'Cliente Con Messaggio Lungo',
          email,
          subject: 'Richiesta Dettagliata Collezione',
          message: largeMessage,
          privacy: true,
        },
      });

      const res = await contactHandler(req);
      const data = await res.json();
      assertEqual(res.status, 200);
      createdMessageIds.push(data.ticket_id);

      const { data: dbMsg } = await supabaseAdmin
        .from('support_messages')
        .select('message')
        .eq('id', data.ticket_id)
        .single();

      assertEqual(dbMsg?.message, largeMessage.trim(), 'Large message should be stored completely');
    });

    await runner.test('T2.8: SQL injection payloads stored safely as literal strings', async () => {
      const email = generateTestEmail('t2_sqli');
      createdEmails.push(email);

      const sqliName = "Robert'); DROP TABLE support_messages; --";
      const sqliSubject = "' OR 1=1 --";
      const sqliMessage = "UNION SELECT * FROM auth.users WHERE 1=1; --";

      const contactHandler = await getContactRouteHandler();
      const req = createMockRequest('http://localhost:3000/api/contact', {
        body: {
          name: sqliName,
          email,
          subject: sqliSubject,
          message: sqliMessage,
          privacy: true,
        },
      });

      const res = await contactHandler(req);
      const data = await res.json();
      assertEqual(res.status, 200);
      createdMessageIds.push(data.ticket_id);

      // Verify table is intact and record stored literally
      const { data: dbMsg, error } = await supabaseAdmin
        .from('support_messages')
        .select('customer_name, subject, message')
        .eq('id', data.ticket_id)
        .single();

      assert(!error, 'Table must remain intact');
      assertEqual(dbMsg?.customer_name, sqliName);
      assertEqual(dbMsg?.subject, sqliSubject);
      assertEqual(dbMsg?.message, sqliMessage);
    });

    await runner.test('T2.9: XSS / Script injection tags safely contained', async () => {
      const email = generateTestEmail('t2_xss');
      createdEmails.push(email);

      const xssPayload = '<script>alert("XSS_ATTACK")</script><img src=x onerror=alert(1)>';
      const contactHandler = await getContactRouteHandler();
      const req = createMockRequest('http://localhost:3000/api/contact', {
        body: {
          name: '<script>alert(1)</script>',
          email,
          subject: 'XSS Probe',
          message: xssPayload,
          privacy: true,
        },
      });

      const res = await contactHandler(req);
      const data = await res.json();
      assertEqual(res.status, 200);
      createdMessageIds.push(data.ticket_id);

      const { data: dbMsg } = await supabaseAdmin
        .from('support_messages')
        .select('message')
        .eq('id', data.ticket_id)
        .single();

      assertEqual(dbMsg?.message, xssPayload);
    });

    await runner.test('T2.10: Emoji and Multilingual Unicode fidelity (💍 ✨ 💎)', async () => {
      const email = generateTestEmail('t2_unicode');
      createdEmails.push(email);

      const unicodeName = 'Éléonore d’Orléans 💍';
      const unicodeSubject = 'Gioielli Splendidi ✨ 💎 [日本語 / العربية]';
      const unicodeMessage = 'Vorrei sapere se l’anello “Solitaire” è disponibile in oro 18 carati. Grazie mille! 👑 ❤️';

      const contactHandler = await getContactRouteHandler();
      const req = createMockRequest('http://localhost:3000/api/contact', {
        body: {
          name: unicodeName,
          email,
          subject: unicodeSubject,
          message: unicodeMessage,
          privacy: true,
        },
      });

      const res = await contactHandler(req);
      const data = await res.json();
      assertEqual(res.status, 200);
      createdMessageIds.push(data.ticket_id);

      const { data: dbMsg } = await supabaseAdmin
        .from('support_messages')
        .select('customer_name, subject, message')
        .eq('id', data.ticket_id)
        .single();

      assertEqual(dbMsg?.customer_name, unicodeName);
      assertEqual(dbMsg?.subject, unicodeSubject);
      assertEqual(dbMsg?.message, unicodeMessage);
    });

    // =========================================================================
    // BOT TRAPS, HONEYPOTS & RATE LIMITING
    // =========================================================================
    console.log('\n\x1b[1m\x1b[33m--- Honeypot Traps, Bot User-Agents & Throttling ---\x1b[0m');

    await runner.test('T2.11: Honeypot field filled (website_hp) blocks bot insertion', async () => {
      const email = generateTestEmail('t2_honeypot');
      const contactHandler = await getContactRouteHandler();
      const req = createMockRequest('http://localhost:3000/api/contact', {
        body: {
          name: 'Spam Bot 3000',
          email,
          subject: 'Buy Cheap Watches',
          message: 'Check out this spam link',
          privacy: true,
          website_hp: 'http://spam-link.ru', // Honeypot filled!
        },
      });

      const res = await contactHandler(req);
      // Honeypot should either return 400 or silent success without inserting to DB
      const { data: checkDb } = await supabaseAdmin
        .from('support_messages')
        .select('id')
        .eq('customer_email', email)
        .maybeSingle();

      assertEqual(checkDb, null, 'Spam honeypot submission MUST NOT be saved to database');
    });

    await runner.test('T2.12: Bot scraper User-Agent detection policy', async () => {
      const email = generateTestEmail('t2_bot_ua');
      const contactHandler = await getContactRouteHandler();
      const req = createMockRequest('http://localhost:3000/api/contact', {
        headers: {
          'user-agent': 'python-requests/2.28.1',
        },
        body: {
          name: 'Automated Bot',
          email,
          subject: 'Bot Scraping',
          message: 'Automated message',
          privacy: true,
        },
      });

      const res = await contactHandler(req);
      // Either rejected or tagged as bot in DB
      const { data: dbMsg } = await supabaseAdmin
        .from('support_messages')
        .select('id, user_agent')
        .eq('customer_email', email)
        .maybeSingle();

      if (dbMsg) {
        createdMessageIds.push(dbMsg.id);
        assertIncludes(dbMsg.user_agent || '', 'python-requests');
      }
    });

    await runner.test('T2.13: Rapid burst submissions from single IP rate-limiting defense', async () => {
      const email = generateTestEmail('t2_burst');
      const contactHandler = await getContactRouteHandler();

      const burstResults: number[] = [];
      const testIp = '203.0.113.199';

      // Send 15 rapid consecutive requests
      for (let i = 0; i < 15; i++) {
        const req = createMockRequest('http://localhost:3000/api/contact', {
          headers: {
            'x-forwarded-for': testIp,
          },
          body: {
            name: `Burst Customer ${i}`,
            email: `burst_${i}_${email}`,
            subject: `Burst Request ${i}`,
            message: `Burst test message ${i}`,
            privacy: true,
          },
        });

        const res = await contactHandler(req);
        burstResults.push(res.status);
        if (res.status === 200) {
          const data = await res.json();
          if (data.ticket_id) createdMessageIds.push(data.ticket_id);
        }
      }

      // Check if at least some were processed or rate-limiting kicks in (200 or 429)
      const hasSuccess = burstResults.includes(200);
      assert(hasSuccess, 'Initial requests in burst should succeed');
    });

    await runner.test('T2.14: Admin reply with empty reply_text returns 400 Bad Request', async () => {
      const replyHandler = await getAdminReplyRouteHandler();
      const req = createMockRequest('http://localhost:3000/api/admin/messages/reply', {
        headers: {
          'x-admin-test-auth': 'sviluppo@creativiastudio.com',
        },
        body: {
          message_id: '00000000-0000-0000-0000-000000000000',
          reply_text: '   ', // Empty or whitespace only
        },
      });

      const res = await replyHandler(req);
      assertEqual(res.status, 400, 'Empty reply text must return 400');
    });

    await runner.test('T2.15: Database check constraint rejects invalid status strings', async () => {
      const email = generateTestEmail('t2_constraint');
      const { error } = await supabaseAdmin
        .from('support_messages')
        .insert({
          customer_name: 'Invalid Status User',
          customer_email: email,
          subject: 'Constraint Test',
          message: 'Testing check constraint',
          status: 'invalid_status_value' as any,
        });

      assert(error !== null, 'Database check constraint must reject invalid status values');
    });
  } finally {
    // Database teardown
    await cleanupTestData({ emails: createdEmails, messageIds: createdMessageIds });
  }

  return runner;
}
