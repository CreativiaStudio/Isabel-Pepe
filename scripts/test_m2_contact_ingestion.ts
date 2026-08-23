import { POST } from '../app/api/contact/route';
import { supabaseAdmin } from '../lib/supabase';
import {
  generateSupportAdminNotificationEmailHtml,
  generateSupportAdminNotificationEmailText,
  sendSupportAdminNotificationEmail,
} from '../lib/email';

async function runTests() {
  console.log('🧪 Starting Milestone 2 Verification Suite...\n');
  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, testName: string) {
    totalTests++;
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passedTests++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
    }
  }

  // TEST 1: Email HTML & Text Template Generation
  console.log('--- Test Group 1: Luxury Email Template Generation ---');
  const mockEmailParams = {
    ticketId: '12345678-abcd-ef01-2345-6789abcdef01',
    customerName: 'Elena Visconti',
    customerEmail: 'elena@example.com',
    subject: 'Richiesta Personalizzazione Collana Luna',
    message: 'Salve, vorrei sapere se è possibile incidere le iniziali sul retro del ciondolo.',
    ipAddress: '93.45.12.89',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    createdAt: new Date().toISOString(),
  };

  const htmlOutput = generateSupportAdminNotificationEmailHtml(mockEmailParams);
  const textOutput = generateSupportAdminNotificationEmailText(mockEmailParams);

  assert(htmlOutput.includes('ISABEL PEPE'), 'HTML template includes ISABEL PEPE brand header');
  assert(htmlOutput.includes('Elena Visconti'), 'HTML template contains customer name');
  assert(htmlOutput.includes('elena@example.com'), 'HTML template contains customer email');
  assert(htmlOutput.includes('Richiesta Personalizzazione Collana Luna'), 'HTML template contains subject');
  assert(htmlOutput.includes('incidere le iniziali sul retro'), 'HTML template contains message body');
  assert(htmlOutput.includes('/admin?tab=messages'), 'HTML template links to Concierge Inbox');
  assert(htmlOutput.includes('#C0A09A') || htmlOutput.includes('#8A5E58'), 'HTML template uses brand luxury palette');
  assert(textOutput.includes('ISABEL PEPE — CONCIERGE'), 'Plaintext template includes header');
  assert(textOutput.includes('/admin?tab=messages'), 'Plaintext template contains Concierge Inbox link');

  // TEST 2: Email Function Invocation (Safe / Non-throwing)
  console.log('\n--- Test Group 2: Email Function Execution ---');
  const emailRes = await sendSupportAdminNotificationEmail(mockEmailParams);
  assert(typeof emailRes === 'object' && ('success' in emailRes), 'sendSupportAdminNotificationEmail returns result object');

  // TEST 3: Route Validation - Missing Privacy Consent
  console.log('\n--- Test Group 3: Contact API Input Validation ---');
  const browserHeaders = {
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  };

  const reqNoPrivacy = new Request('http://localhost:3000/api/contact', {
    method: 'POST',
    headers: browserHeaders,
    body: JSON.stringify({
      name: 'Maria Rossi',
      email: 'maria@example.com',
      subject: 'Info spedizione',
      message: 'Vorrei info sui tempi di spedizione.',
      privacy: false,
    }),
  });
  const resNoPrivacy = await POST(reqNoPrivacy);
  const jsonNoPrivacy = await resNoPrivacy.json();
  assert(resNoPrivacy.status === 400, 'Rejects missing privacy consent with HTTP 400');
  assert(Boolean(jsonNoPrivacy.error), 'Returns descriptive error message for missing privacy');

  // TEST 4: Route Validation - Invalid Email
  const reqBadEmail = new Request('http://localhost:3000/api/contact', {
    method: 'POST',
    headers: browserHeaders,
    body: JSON.stringify({
      name: 'Maria Rossi',
      email: 'maria-invalid-email',
      subject: 'Info spedizione',
      message: 'Vorrei info sui tempi di spedizione.',
      privacy: true,
    }),
  });
  const resBadEmail = await POST(reqBadEmail);
  assert(resBadEmail.status === 400, 'Rejects invalid email format with HTTP 400');

  // TEST 5: Route Validation - Empty Message
  const reqEmptyMsg = new Request('http://localhost:3000/api/contact', {
    method: 'POST',
    headers: browserHeaders,
    body: JSON.stringify({
      name: 'Maria Rossi',
      email: 'maria@example.com',
      subject: 'Info',
      message: 'hi',
      privacy: true,
    }),
  });
  const resEmptyMsg = await POST(reqEmptyMsg);
  assert(resEmptyMsg.status === 400, 'Rejects too short message with HTTP 400');

  // TEST 6: Bot Protection - Honeypot Trap
  console.log('\n--- Test Group 4: Bot Trapping & Honeypot ---');
  const reqHoneypot = new Request('http://localhost:3000/api/contact', {
    method: 'POST',
    headers: browserHeaders,
    body: JSON.stringify({
      name: 'Spam Bot',
      email: 'bot@spam.com',
      subject: 'Buy cheap watches',
      message: 'Visit our link for cheap watches now!',
      privacy: true,
      website_hp: 'http://spam-link.com',
    }),
  });
  const resHoneypot = await POST(reqHoneypot);
  const jsonHoneypot = await resHoneypot.json();
  assert(resHoneypot.status === 200, 'Honeypot submission returns HTTP 200 silently');
  assert(jsonHoneypot.success === true, 'Honeypot returns success: true without exposing trap');

  // TEST 7: Bot Protection - User-Agent Bot Filter
  const reqBotUa = new Request('http://localhost:3000/api/contact', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
    },
    body: JSON.stringify({
      name: 'Google Crawler',
      email: 'crawler@google.com',
      subject: 'Crawl subject',
      message: 'Crawl message body content here.',
      privacy: true,
    }),
  });
  const resBotUa = await POST(reqBotUa);
  assert(resBotUa.status === 200, 'Bot User-Agent returns HTTP 200 silently');

  // TEST 7b: Bot Protection - Empty User-Agent
  const reqEmptyUa = new Request('http://localhost:3000/api/contact', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': '',
    },
    body: JSON.stringify({
      name: 'Automated Bot',
      email: 'bot@automated.com',
      subject: 'Spam subject',
      message: 'Spam message content.',
      privacy: true,
    }),
  });
  const resEmptyUa = await POST(reqEmptyUa);
  assert(resEmptyUa.status === 200, 'Empty User-Agent (crawler) returns HTTP 200 silently');

  // TEST 8: In-Memory IP Rate Limiter
  console.log('\n--- Test Group 5: IP Rate Limiting ---');
  const testIp = '192.0.2.42'; // TEST-NET-1 IP
  let rateLimitHit = false;

  for (let i = 1; i <= 7; i++) {
    const rateReq = new Request('http://localhost:3000/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': testIp,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      body: JSON.stringify({
        name: `Rate Test User ${i}`,
        email: `ratetest${i}@example.com`,
        subject: `Rate test attempt ${i}`,
        message: `This is rate limit test message number ${i}.`,
        privacy: true,
      }),
    });
    const rateRes = await POST(rateReq);
    if (i <= 5) {
      assert(rateRes.status === 200, `Request ${i}/5 within limit returns 200`);
    } else {
      if (rateRes.status === 429) {
        rateLimitHit = true;
      }
    }
  }
  assert(rateLimitHit, '6th request from same IP returns HTTP 429 Too Many Requests');

  // TEST 9: Genuine Supabase DB Ingestion & Retrieval
  console.log('\n--- Test Group 6: Live Supabase DB Ingestion ---');
  const testUniqueTag = `test-${Date.now()}`;
  const validSubmissionReq = new Request('http://localhost:3000/api/contact', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-forwarded-for': '198.51.100.25',
      'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)',
    },
    body: JSON.stringify({
      name: 'Chiara Ferragamo',
      email: 'chiara.ferragamo@luxury-test.com',
      subject: `Richiesta Gioiello Su Misura [${testUniqueTag}]`,
      message: 'Vorrei realizzare un anello solitario in oro rosa 18 carati con diamante etico.',
      privacy: true,
      metadata: {
        locale: 'it',
        test_tag: testUniqueTag,
      },
    }),
  });

  const validRes = await POST(validSubmissionReq);
  const validJson = await validRes.json();
  assert(validRes.status === 200, 'Valid submission returns HTTP 200');
  assert(validJson.success === true, 'Response contains success: true');
  assert(Boolean(validJson.ticket_id), 'Response contains created ticket_id');

  const ticketId = validJson.ticket_id;
  if (ticketId) {
    // Verify row in Supabase
    const { data: fetchedMessage, error: fetchErr } = await supabaseAdmin
      .from('support_messages')
      .select('*')
      .eq('id', ticketId)
      .single();

    assert(!fetchErr && Boolean(fetchedMessage), 'Record successfully retrieved from Supabase support_messages');
    assert(fetchedMessage?.customer_name === 'Chiara Ferragamo', 'Record customer_name matches');
    assert(fetchedMessage?.customer_email === 'chiara.ferragamo@luxury-test.com', 'Record customer_email matches');
    assert(fetchedMessage?.status === 'unread', 'Record default status is "unread"');
    assert(fetchedMessage?.ip_address === '198.51.100.25', 'Record stores ip_address');
    assert(fetchedMessage?.metadata?.test_tag === testUniqueTag, 'Record stores metadata correctly');

    // Cleanup test record
    const { error: deleteErr } = await supabaseAdmin
      .from('support_messages')
      .delete()
      .eq('id', ticketId);
    assert(!deleteErr, 'Test record successfully cleaned up from Supabase');
  }

  console.log(`\n========================================`);
  console.log(`🎉 TEST SUMMARY: ${passedTests}/${totalTests} tests passed`);
  console.log(`========================================\n`);

  if (passedTests === totalTests) {
    console.log('✅ ALL M2 CHECKS PASSED PERFECTLY.');
  } else {
    console.error('❌ SOME TESTS FAILED.');
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test runner exception:', err);
  process.exit(1);
});
