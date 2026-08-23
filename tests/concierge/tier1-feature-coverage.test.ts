import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { supabaseAdmin } from '../../lib/supabase';
import { verifyAdminAuth, isAdminEmail, ADMIN_EMAILS } from '../../lib/auth-guard';
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

export async function runTier1Tests(): Promise<TestRunner> {
  const runner = new TestRunner('Tier 1: Exhaustive Feature Coverage');
  const createdEmails: string[] = [];
  const createdMessageIds: string[] = [];

  console.log('\n\x1b[1m\x1b[36m========================================================================\x1b[0m');
  console.log('\x1b[1m\x1b[36m  TIER 1: EXHAUSTIVE FEATURE COVERAGE (4 Core Features x >=5 Tests)\x1b[0m');
  console.log('\x1b[1m\x1b[36m========================================================================\x1b[0m\n');

  try {
    // =========================================================================
    // FEATURE 1: Contact Form Ingestion API (POST /api/contact)
    // =========================================================================
    console.log('\x1b[1m\x1b[33m--- Feature 1: Contact Form Ingestion API (POST /api/contact) ---\x1b[0m');

    await runner.test('T1.1.1: Standard valid customer support inquiry submission', async () => {
      const email = generateTestEmail('t1_standard');
      createdEmails.push(email);

      const contactHandler = await getContactRouteHandler();
      const req = createMockRequest('http://localhost:3000/api/contact', {
        body: {
          name: 'Elena Rostova',
          email,
          subject: 'Consiglio Misura Anello Imperial',
          message: 'Vorrei sapere la disponibilità della misura IT 14 per l anello Imperial.',
          privacy: true,
        },
      });

      const res = await contactHandler(req);
      const data = await res.json();

      assertEqual(res.status, 200, 'Response status should be 200 OK');
      assertEqual(data.success, true, 'success field should be true');
      assertDefined(data.ticket_id, 'ticket_id should be returned');
      createdMessageIds.push(data.ticket_id);

      // Verify in Supabase
      const { data: dbMsg, error } = await supabaseAdmin
        .from('support_messages')
        .select('*')
        .eq('id', data.ticket_id)
        .single();

      assert(!error && dbMsg !== null, 'Support message must exist in database');
      assertEqual(dbMsg.customer_name, 'Elena Rostova', 'customer_name must match');
      assertEqual(dbMsg.customer_email, email.toLowerCase().trim(), 'customer_email must match');
      assertEqual(dbMsg.subject, 'Consiglio Misura Anello Imperial', 'subject must match');
      assertEqual(dbMsg.status, 'unread', 'Default status must be unread');
    });

    await runner.test('T1.1.2: Valid inquiry with custom metadata and referrer source', async () => {
      const email = generateTestEmail('t1_meta');
      createdEmails.push(email);

      const contactHandler = await getContactRouteHandler();
      const req = createMockRequest('http://localhost:3000/api/contact', {
        body: {
          name: 'Marco Valenti',
          email,
          subject: 'Richiesta Personalizzazione Collana',
          message: 'Desidero incidere le iniziali M & G sulla chiusura della collana.',
          privacy: true,
          metadata: {
            source_page: '/prodotti/collana-solitaire',
            utm_source: 'instagram',
            vip_inquiry: true,
          },
        },
      });

      const res = await contactHandler(req);
      const data = await res.json();

      assertEqual(res.status, 200);
      assertEqual(data.success, true);
      createdMessageIds.push(data.ticket_id);

      const { data: dbMsg } = await supabaseAdmin
        .from('support_messages')
        .select('metadata, status')
        .eq('id', data.ticket_id)
        .single();

      assertDefined(dbMsg?.metadata);
      assertEqual(dbMsg.metadata?.source_page, '/prodotti/collana-solitaire');
      assertEqual(dbMsg.metadata?.vip_inquiry, true);
      assertEqual(dbMsg.status, 'unread');
    });

    await runner.test('T1.1.3: Verification of IP address and user-agent ingestion', async () => {
      const email = generateTestEmail('t1_telemetry');
      createdEmails.push(email);

      const contactHandler = await getContactRouteHandler();
      const req = createMockRequest('http://localhost:3000/api/contact', {
        headers: {
          'x-forwarded-for': '198.51.100.42',
          'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 LuxuryClient/2.0',
        },
        body: {
          name: 'Giulia De Angelis',
          email,
          subject: 'Informazioni Cofanetto Regalo',
          message: 'Il cofanetto luxury è compreso con la collana?',
          privacy: true,
        },
      });

      const res = await contactHandler(req);
      const data = await res.json();
      assertEqual(res.status, 200);
      createdMessageIds.push(data.ticket_id);

      const { data: dbMsg } = await supabaseAdmin
        .from('support_messages')
        .select('ip_address, user_agent')
        .eq('id', data.ticket_id)
        .single();

      assert(dbMsg?.ip_address !== null && dbMsg?.ip_address !== undefined, 'ip_address should be recorded');
      assertIncludes(dbMsg?.user_agent || '', 'LuxuryClient/2.0', 'user_agent should be captured');
    });

    await runner.test('T1.1.4: Automatic trimming and email case-normalization', async () => {
      const baseEmail = generateTestEmail('t1_norm');
      const untrimmedEmail = `  ${baseEmail.toUpperCase()}  `;
      createdEmails.push(baseEmail.toLowerCase());

      const contactHandler = await getContactRouteHandler();
      const req = createMockRequest('http://localhost:3000/api/contact', {
        body: {
          name: '  Sofia Loren  ',
          email: untrimmedEmail,
          subject: '  Curiosità Diamanti Moissanite  ',
          message: '  Vorrei informazioni sul certificato di autenticità.  ',
          privacy: true,
        },
      });

      const res = await contactHandler(req);
      const data = await res.json();
      assertEqual(res.status, 200);
      createdMessageIds.push(data.ticket_id);

      const { data: dbMsg } = await supabaseAdmin
        .from('support_messages')
        .select('customer_name, customer_email, subject, message')
        .eq('id', data.ticket_id)
        .single();

      assertEqual(dbMsg?.customer_name, 'Sofia Loren', 'Name should be trimmed');
      assertEqual(dbMsg?.customer_email, baseEmail.toLowerCase(), 'Email should be normalized');
      assertEqual(dbMsg?.subject, 'Curiosità Diamanti Moissanite', 'Subject should be trimmed');
      assertEqual(dbMsg?.message, 'Vorrei informazioni sul certificato di autenticità.', 'Message should be trimmed');
    });

    await runner.test('T1.1.5: Database timestamps integrity (created_at & updated_at)', async () => {
      const email = generateTestEmail('t1_timestamps');
      createdEmails.push(email);

      const contactHandler = await getContactRouteHandler();
      const req = createMockRequest('http://localhost:3000/api/contact', {
        body: {
          name: 'Laura Bianchi',
          email,
          subject: 'Richiesta Info Garanzia',
          message: 'La garanzia di 24 mesi copre anche le placcature in oro?',
          privacy: true,
        },
      });

      const res = await contactHandler(req);
      const data = await res.json();
      assertEqual(res.status, 200);
      createdMessageIds.push(data.ticket_id);

      const { data: dbMsg } = await supabaseAdmin
        .from('support_messages')
        .select('created_at, updated_at')
        .eq('id', data.ticket_id)
        .single();

      assertDefined(dbMsg?.created_at, 'created_at should exist');
      assertDefined(dbMsg?.updated_at, 'updated_at should exist');
      const createdAtTime = new Date(dbMsg.created_at).getTime();
      assert(Date.now() - createdAtTime < 60000, 'created_at should be recent');
    });

    // =========================================================================
    // FEATURE 2: Admin Direct Reply Engine (POST /api/admin/messages/reply)
    // =========================================================================
    console.log('\n\x1b[1m\x1b[33m--- Feature 2: Admin Direct Reply Engine (POST /api/admin/messages/reply) ---\x1b[0m');

    await runner.test('T1.2.1: Authorized admin reply updates ticket to replied with metadata', async () => {
      const email = generateTestEmail('t1_reply_exec');
      createdEmails.push(email);

      // Seed a test message directly
      const { data: insertedMsg, error: insertErr } = await supabaseAdmin
        .from('support_messages')
        .insert({
          customer_name: 'Beatrice Valli',
          customer_email: email,
          subject: 'Consiglio Taglia Orecchini',
          message: 'Gli orecchini Eclipse sono pesanti da indossare tutto il giorno?',
          status: 'unread',
        })
        .select()
        .single();

      assert(!insertErr && insertedMsg !== null, 'Seeding message must succeed');
      createdMessageIds.push(insertedMsg.id);

      // Reply as admin (using mock admin session / header)
      const replyHandler = await getAdminReplyRouteHandler();
      const req = createMockRequest('http://localhost:3000/api/admin/messages/reply', {
        headers: {
          'x-admin-test-auth': 'sviluppo@creativiastudio.com',
        },
        body: {
          message_id: insertedMsg.id,
          reply_text: 'Gentile Beatrice, gli orecchini Eclipse pesano solo 3.2 grammi e sono ultra-confortevoli.',
          subject: 'Re: Consiglio Taglia Orecchini',
        },
      });

      const res = await replyHandler(req);
      const data = await res.json();

      assertEqual(res.status, 200, 'Reply status should be 200 OK');
      assertEqual(data.success, true, 'Reply success should be true');

      // Verify database updates
      const { data: updatedMsg } = await supabaseAdmin
        .from('support_messages')
        .select('*')
        .eq('id', insertedMsg.id)
        .single();

      assertEqual(updatedMsg?.status, 'replied', 'Status must transition to replied');
      assertIncludes(updatedMsg?.admin_reply || '', '3.2 grammi', 'Admin reply text must be saved');
      assertDefined(updatedMsg?.replied_at, 'replied_at timestamp must be set');
    });

    await runner.test('T1.2.2: Reply to pending message transitions status to replied', async () => {
      const email = generateTestEmail('t1_pending_reply');
      createdEmails.push(email);

      const { data: msg } = await supabaseAdmin
        .from('support_messages')
        .insert({
          customer_name: 'Chiara Ferrandi',
          customer_email: email,
          subject: 'Stato Ordine #IP-9842',
          message: 'Quando verrà spedito il mio ordine?',
          status: 'pending',
        })
        .select()
        .single();

      assertDefined(msg);
      createdMessageIds.push(msg.id);

      const replyHandler = await getAdminReplyRouteHandler();
      const req = createMockRequest('http://localhost:3000/api/admin/messages/reply', {
        headers: {
          'x-admin-test-auth': 'info@isabelpepe.com',
        },
        body: {
          message_id: msg.id,
          reply_text: 'Gentile Chiara, il tuo ordine è in fase di imballaggio e partirà oggi con corriere espresso.',
        },
      });

      const res = await replyHandler(req);
      assertEqual(res.status, 200);

      const { data: updatedMsg } = await supabaseAdmin
        .from('support_messages')
        .select('status, replied_by')
        .eq('id', msg.id)
        .single();

      assertEqual(updatedMsg?.status, 'replied');
    });

    await runner.test('T1.2.3: Non-existent message ID returns 404 Not Found', async () => {
      const replyHandler = await getAdminReplyRouteHandler();
      const fakeUuid = '00000000-0000-0000-0000-000000000000';
      const req = createMockRequest('http://localhost:3000/api/admin/messages/reply', {
        headers: {
          'x-admin-test-auth': 'mario@isabelpepe.com',
        },
        body: {
          message_id: fakeUuid,
          reply_text: 'Risposta di prova per ID inesistente.',
        },
      });

      const res = await replyHandler(req);
      assertEqual(res.status, 404, 'Non-existent ID must return 404');
    });

    await runner.test('T1.2.4: Direct reply preserves original customer inquiry intact', async () => {
      const email = generateTestEmail('t1_integrity');
      createdEmails.push(email);

      const { data: msg } = await supabaseAdmin
        .from('support_messages')
        .insert({
          customer_name: 'Francesca Neri',
          customer_email: email,
          subject: 'Richiesta Personalizzazione Incisione',
          message: 'Messaggio originale immutabile del cliente.',
          status: 'unread',
        })
        .select()
        .single();

      assertDefined(msg);
      createdMessageIds.push(msg.id);

      const replyHandler = await getAdminReplyRouteHandler();
      const req = createMockRequest('http://localhost:3000/api/admin/messages/reply', {
        headers: {
          'x-admin-test-auth': 'mario@isabelpepe.com',
        },
        body: {
          message_id: msg.id,
          reply_text: 'Possiamo effettuare l incisione senza costi aggiuntivi.',
        },
      });

      await replyHandler(req);

      const { data: verified } = await supabaseAdmin
        .from('support_messages')
        .select('message, customer_name, customer_email')
        .eq('id', msg.id)
        .single();

      assertEqual(verified?.message, 'Messaggio originale immutabile del cliente.');
      assertEqual(verified?.customer_name, 'Francesca Neri');
      assertEqual(verified?.customer_email, email);
    });

    await runner.test('T1.2.5: Support reply email template generation in lib/email.ts', async () => {
      // Test the email generator function dynamically from lib/email
      const emailMod = await import('../../lib/email');
      assertDefined(emailMod.sendSupportReplyEmail, 'sendSupportReplyEmail must be exported');

      // Test with mock parameters
      const emailResult = await emailMod.sendSupportReplyEmail({
        customerEmail: 'test_client@example.com',
        customerName: 'Cliente Test',
        originalSubject: 'Richiesta Informazioni',
        replyText: 'Gentile Cliente, la ringraziamo per il messaggio.',
      });

      // Result should be an object with success boolean
      assert(typeof emailResult === 'object', 'sendSupportReplyEmail should return a status object');
    });

    // =========================================================================
    // FEATURE 3: Security & Admin Auth Guard
    // =========================================================================
    console.log('\n\x1b[1m\x1b[33m--- Feature 3: Security & Admin Auth Guard ---\x1b[0m');

    await runner.test('T1.3.1: Unauthenticated request without session or token returns 401', async () => {
      const replyHandler = await getAdminReplyRouteHandler();
      const req = createMockRequest('http://localhost:3000/api/admin/messages/reply', {
        headers: {}, // No auth header
        body: {
          message_id: '00000000-0000-0000-0000-000000000000',
          reply_text: 'Unauthorized attempt',
        },
      });

      const res = await replyHandler(req);
      assertEqual(res.status, 401, 'Unauthenticated request must return 401');
    });

    await runner.test('T1.3.2: Request with unauthorized Bearer token returns 401', async () => {
      const replyHandler = await getAdminReplyRouteHandler();
      const req = createMockRequest('http://localhost:3000/api/admin/messages/reply', {
        headers: {
          authorization: 'Bearer fake_unauthorized_token_12345',
        },
        body: {
          message_id: '00000000-0000-0000-0000-000000000000',
          reply_text: 'Unauthorized hacker reply',
        },
      });

      const res = await replyHandler(req);
      assertEqual(res.status, 401, 'Invalid token must return 401');
    });

    await runner.test('T1.3.3: Whitelisted admin emails verification (isAdminEmail)', () => {
      assertEqual(isAdminEmail('sviluppo@creativiastudio.com'), true);
      assertEqual(isAdminEmail('info@isabelpepe.com'), true);
      assertEqual(isAdminEmail('mario@isabelpepe.com'), true);
      assertEqual(isAdminEmail('mariopepe9@hotmail.it'), true);
      assertEqual(isAdminEmail('hacker@evil.com'), false);
      assertEqual(isAdminEmail('random_customer@gmail.com'), false);
      assertEqual(isAdminEmail(null), false);
      assertEqual(isAdminEmail(undefined), false);
    });

    await runner.test('T1.3.4: Rejection of malformed Authorization header strings', async () => {
      const replyHandler = await getAdminReplyRouteHandler();
      const req = createMockRequest('http://localhost:3000/api/admin/messages/reply', {
        headers: {
          authorization: 'Basic dXNlcjpwYXNz', // Basic auth not supported
        },
        body: {
          message_id: '00000000-0000-0000-0000-000000000000',
          reply_text: 'Basic auth attempt',
        },
      });

      const res = await replyHandler(req);
      assertEqual(res.status, 401);
    });

    await runner.test('T1.3.5: verifyAdminAuth guard rejects null request or empty token gracefully', async () => {
      const req = createMockRequest('http://localhost:3000/api/admin/messages/reply', {
        headers: {
          authorization: 'Bearer ',
        },
      });

      const result = await verifyAdminAuth(req as any);
      assertEqual(result.authorized, false);
      assertEqual(result.user, null);
    });

    // =========================================================================
    // FEATURE 4: Admin Inbox State Transitions & Message Management
    // =========================================================================
    console.log('\n\x1b[1m\x1b[33m--- Feature 4: Admin Inbox State Transitions & Server Actions ---\x1b[0m');

    await runner.test('T1.4.1: updateMessageStatus transitions unread -> pending', async () => {
      const email = generateTestEmail('t1_action_pend');
      createdEmails.push(email);

      const { data: msg } = await supabaseAdmin
        .from('support_messages')
        .insert({
          customer_name: 'Alessia Marcuzzi',
          customer_email: email,
          subject: 'Domanda Spedizione',
          message: 'Quanto tempo ci vuole per la consegna?',
          status: 'unread',
        })
        .select()
        .single();

      assertDefined(msg);
      createdMessageIds.push(msg.id);

      const actions = await getAdminMessageActions();
      const res = await actions.updateMessageStatus(msg.id, 'pending');
      assertEqual(res.success, true);

      const { data: updated } = await supabaseAdmin
        .from('support_messages')
        .select('status')
        .eq('id', msg.id)
        .single();

      assertEqual(updated?.status, 'pending');
    });

    await runner.test('T1.4.2: updateMessageStatus transitions pending -> closed', async () => {
      const email = generateTestEmail('t1_action_close');
      createdEmails.push(email);

      const { data: msg } = await supabaseAdmin
        .from('support_messages')
        .insert({
          customer_name: 'Paolo Bonolis',
          customer_email: email,
          subject: 'Risoluzione Richiesta',
          message: 'Tutto chiaro, grazie.',
          status: 'pending',
        })
        .select()
        .single();

      assertDefined(msg);
      createdMessageIds.push(msg.id);

      const actions = await getAdminMessageActions();
      const res = await actions.updateMessageStatus(msg.id, 'closed');
      assertEqual(res.success, true);

      const { data: updated } = await supabaseAdmin
        .from('support_messages')
        .select('status')
        .eq('id', msg.id)
        .single();

      assertEqual(updated?.status, 'closed');
    });

    await runner.test('T1.4.3: Reopening closed ticket (closed -> unread)', async () => {
      const email = generateTestEmail('t1_action_reopen');
      createdEmails.push(email);

      const { data: msg } = await supabaseAdmin
        .from('support_messages')
        .insert({
          customer_name: 'Gerry Scotti',
          customer_email: email,
          subject: 'Ticket Riaperto',
          message: 'Ho una seconda domanda.',
          status: 'closed',
        })
        .select()
        .single();

      assertDefined(msg);
      createdMessageIds.push(msg.id);

      const actions = await getAdminMessageActions();
      const res = await actions.updateMessageStatus(msg.id, 'unread');
      assertEqual(res.success, true);

      const { data: updated } = await supabaseAdmin
        .from('support_messages')
        .select('status')
        .eq('id', msg.id)
        .single();

      assertEqual(updated?.status, 'unread');
    });

    await runner.test('T1.4.4: deleteMessage permanently deletes ticket record', async () => {
      const email = generateTestEmail('t1_action_del');
      createdEmails.push(email);

      const { data: msg } = await supabaseAdmin
        .from('support_messages')
        .insert({
          customer_name: 'Messaggio Da Eliminare',
          customer_email: email,
          subject: 'Eliminami',
          message: 'Questo messaggio deve essere rimosso.',
          status: 'unread',
        })
        .select()
        .single();

      assertDefined(msg);

      const actions = await getAdminMessageActions();
      const res = await actions.deleteMessage(msg.id);
      assertEqual(res.success, true);

      const { data: checkMsg } = await supabaseAdmin
        .from('support_messages')
        .select('id')
        .eq('id', msg.id)
        .maybeSingle();

      assertEqual(checkMsg, null, 'Message should not exist after deletion');
    });

    await runner.test('T1.4.5: Unread counter accurately tallies unread messages', async () => {
      const email1 = generateTestEmail('t1_counter_1');
      const email2 = generateTestEmail('t1_counter_2');
      createdEmails.push(email1, email2);

      const { data: msg1 } = await supabaseAdmin
        .from('support_messages')
        .insert({
          customer_name: 'Counter Test 1',
          customer_email: email1,
          subject: 'Unread 1',
          message: 'Test msg 1',
          status: 'unread',
        })
        .select()
        .single();

      const { data: msg2 } = await supabaseAdmin
        .from('support_messages')
        .insert({
          customer_name: 'Counter Test 2',
          customer_email: email2,
          subject: 'Unread 2',
          message: 'Test msg 2',
          status: 'unread',
        })
        .select()
        .single();

      assertDefined(msg1);
      assertDefined(msg2);
      createdMessageIds.push(msg1.id, msg2.id);

      const { count, error } = await supabaseAdmin
        .from('support_messages')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'unread');

      assert(!error);
      assertDefined(count);
      assert(count >= 2, 'Unread count must be at least 2');
    });
  } finally {
    // Database teardown
    await cleanupTestData({ emails: createdEmails, messageIds: createdMessageIds });
  }

  return runner;
}
