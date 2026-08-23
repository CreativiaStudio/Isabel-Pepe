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

export async function runTier3Tests(): Promise<TestRunner> {
  const runner = new TestRunner('Tier 3: Cross-Feature Combinations');
  const createdEmails: string[] = [];
  const createdMessageIds: string[] = [];

  console.log('\n\x1b[1m\x1b[36m========================================================================\x1b[0m');
  console.log('\x1b[1m\x1b[36m  TIER 3: CROSS-FEATURE COMBINATIONS (4 Full Integration Pipelines)\x1b[0m');
  console.log('\x1b[1m\x1b[36m========================================================================\x1b[0m\n');

  try {
    // =========================================================================
    // PIPELINE 1: Complete Ingestion-to-Resolution Lifecycle
    // =========================================================================
    await runner.test('T3.1: Full Concierge Ingestion-to-Resolution Lifecycle', async () => {
      const email = generateTestEmail('t3_lifecycle');
      createdEmails.push(email);

      // Step 1: Customer submits inquiry via public API
      const contactHandler = await getContactRouteHandler();
      const submitReq = createMockRequest('http://localhost:3000/api/contact', {
        body: {
          name: 'Valentina Cortese',
          email,
          subject: 'Consiglio Parure Completa Sposa',
          message: 'Cerco una parure in oro bianco e diamanti moissanite per il mio matrimonio a Ottobre.',
          privacy: true,
        },
      });

      const submitRes = await contactHandler(submitReq);
      const submitData = await submitRes.json();
      assertEqual(submitRes.status, 200, 'Step 1: Contact form submission should succeed');
      const ticketId = submitData.ticket_id;
      assertDefined(ticketId);
      createdMessageIds.push(ticketId);

      // Step 2: Message is saved with unread status
      const { data: step2Msg } = await supabaseAdmin
        .from('support_messages')
        .select('status, customer_name')
        .eq('id', ticketId)
        .single();
      assertEqual(step2Msg?.status, 'unread', 'Step 2: Initial status should be unread');

      // Step 3: Admin reviews ticket and marks it pending
      const actions = await getAdminMessageActions();
      const markPendingRes = await actions.updateMessageStatus(ticketId, 'pending');
      assertEqual(markPendingRes.success, true, 'Step 3: Admin marking pending should succeed');

      const { data: step3Msg } = await supabaseAdmin
        .from('support_messages')
        .select('status')
        .eq('id', ticketId)
        .single();
      assertEqual(step3Msg?.status, 'pending', 'Step 3: Status should be pending');

      // Step 4: Admin replies via reply engine
      const replyHandler = await getAdminReplyRouteHandler();
      const replyReq = createMockRequest('http://localhost:3000/api/admin/messages/reply', {
        headers: {
          'x-admin-test-auth': 'mario@isabelpepe.com',
        },
        body: {
          message_id: ticketId,
          reply_text: 'Gentile Valentina, congratulazioni per il matrimonio! Le consigliamo la parure Imperial Solitaire con certificato GRA.',
          subject: 'Re: Consiglio Parure Completa Sposa',
        },
      });

      const replyRes = await replyHandler(replyReq);
      const replyData = await replyRes.json();
      assertEqual(replyRes.status, 200, 'Step 4: Reply should succeed');
      assertEqual(replyData.success, true);

      // Step 5: Status automatically transitioned to replied
      const { data: step5Msg } = await supabaseAdmin
        .from('support_messages')
        .select('status, admin_reply, replied_at, replied_by')
        .eq('id', ticketId)
        .single();
      assertEqual(step5Msg?.status, 'replied', 'Step 5: Status should be replied');
      assertIncludes(step5Msg?.admin_reply || '', 'Imperial Solitaire');
      assertDefined(step5Msg?.replied_at);

      // Step 6: Case closed by admin
      const closeRes = await actions.updateMessageStatus(ticketId, 'closed');
      assertEqual(closeRes.success, true, 'Step 6: Closing ticket should succeed');

      const { data: step6Msg } = await supabaseAdmin
        .from('support_messages')
        .select('status')
        .eq('id', ticketId)
        .single();
      assertEqual(step6Msg?.status, 'closed', 'Step 6: Final status should be closed');
    });

    // =========================================================================
    // PIPELINE 2: Multi-Ticket Customer Aggregation & Independent Lifecycle
    // =========================================================================
    await runner.test('T3.2: Multi-Ticket Customer Ingestion, Search & Independent Processing', async () => {
      const email = generateTestEmail('t3_multiticket');
      createdEmails.push(email);

      const contactHandler = await getContactRouteHandler();

      // Ticket 1: Sizing inquiry
      const res1 = await contactHandler(
        createMockRequest('http://localhost:3000/api/contact', {
          body: {
            name: 'Gianluca Vacchi',
            email,
            subject: 'Misura Anello Solitaire',
            message: 'Serve la misura 20.',
            privacy: true,
          },
        })
      );
      const data1 = await res1.json();
      createdMessageIds.push(data1.ticket_id);

      // Ticket 2: Shipping inquiry
      const res2 = await contactHandler(
        createMockRequest('http://localhost:3000/api/contact', {
          body: {
            name: 'Gianluca Vacchi',
            email,
            subject: 'Spedizione Express a Porto Cervo',
            message: 'Potete spedire con consegna garantita entro 24 ore?',
            privacy: true,
          },
        })
      );
      const data2 = await res2.json();
      createdMessageIds.push(data2.ticket_id);

      // Verify both tickets are grouped by customer email in database
      const { data: customerTickets, count } = await supabaseAdmin
        .from('support_messages')
        .select('*', { count: 'exact' })
        .eq('customer_email', email)
        .order('created_at', { ascending: true });

      assertEqual(count, 2, 'Customer should have exactly 2 tickets');
      assertEqual(customerTickets?.[0].subject, 'Misura Anello Solitaire');
      assertEqual(customerTickets?.[1].subject, 'Spedizione Express a Porto Cervo');

      // Reply to Ticket 2 only
      const replyHandler = await getAdminReplyRouteHandler();
      await replyHandler(
        createMockRequest('http://localhost:3000/api/admin/messages/reply', {
          headers: { 'x-admin-test-auth': 'info@isabelpepe.com' },
          body: {
            message_id: data2.ticket_id,
            reply_text: 'Gentile Gianluca, sì, offriamo spedizione express garantita in 24h.',
          },
        })
      );

      // Verify Ticket 2 is 'replied' while Ticket 1 remains 'unread'
      const { data: t1Check } = await supabaseAdmin
        .from('support_messages')
        .select('status')
        .eq('id', data1.ticket_id)
        .single();
      const { data: t2Check } = await supabaseAdmin
        .from('support_messages')
        .select('status')
        .eq('id', data2.ticket_id)
        .single();

      assertEqual(t1Check?.status, 'unread', 'Ticket 1 must remain unread');
      assertEqual(t2Check?.status, 'replied', 'Ticket 2 must be updated to replied');
    });

    // =========================================================================
    // PIPELINE 3: Honeypot & Bot Trap Isolation During Traffic
    // =========================================================================
    await runner.test('T3.3: Honeypot & Bot Trap Isolation with Legitimate Customer Concurrency', async () => {
      const legitEmail = generateTestEmail('t3_legit');
      const botEmail = generateTestEmail('t3_spambot');
      createdEmails.push(legitEmail);

      const contactHandler = await getContactRouteHandler();

      // Parallel execution: 1 spam bot + 1 legitimate customer
      const [botRes, legitRes] = await Promise.all([
        contactHandler(
          createMockRequest('http://localhost:3000/api/contact', {
            body: {
              name: 'SEO Spammer',
              email: botEmail,
              subject: 'Cheap SEO ranking service',
              message: 'Check out our services at spam.com',
              privacy: true,
              website_hp: 'http://spam-trap-triggered.com', // Honeypot
            },
          })
        ),
        contactHandler(
          createMockRequest('http://localhost:3000/api/contact', {
            body: {
              name: 'Matilde Gioli',
              email: legitEmail,
              subject: 'Richiesta Certificato Gemmologico',
              message: 'Ogni gioiello include il certificato di autenticità?',
              privacy: true,
            },
          })
        ),
      ]);

      const legitData = await legitRes.json();
      assertEqual(legitRes.status, 200, 'Legitimate inquiry must succeed');
      assertDefined(legitData.ticket_id);
      createdMessageIds.push(legitData.ticket_id);

      // Verify Spambot was never inserted into database
      const { data: botCheck } = await supabaseAdmin
        .from('support_messages')
        .select('id')
        .eq('customer_email', botEmail)
        .maybeSingle();

      assertEqual(botCheck, null, 'Spam honeypot entry must not exist in DB');

      // Verify Legitimate customer is intact
      const { data: legitCheck } = await supabaseAdmin
        .from('support_messages')
        .select('customer_name, status')
        .eq('id', legitData.ticket_id)
        .single();

      assertEqual(legitCheck?.customer_name, 'Matilde Gioli');
      assertEqual(legitCheck?.status, 'unread');
    });

    // =========================================================================
    // PIPELINE 4: Admin Auth Guard & Multi-Actor Concurrency
    // =========================================================================
    await runner.test('T3.4: Admin Auth Guard & Multi-Actor Security Boundary Enforcement', async () => {
      const email = generateTestEmail('t3_security');
      createdEmails.push(email);

      // Seed a ticket
      const { data: msg } = await supabaseAdmin
        .from('support_messages')
        .insert({
          customer_name: 'Vittoria Puccini',
          customer_email: email,
          subject: 'Consiglio Parure',
          message: 'Richiesta assistenza',
          status: 'unread',
        })
        .select()
        .single();

      assertDefined(msg);
      createdMessageIds.push(msg.id);

      const replyHandler = await getAdminReplyRouteHandler();

      // Unauthorized attacker 1: Missing token
      const resUnauth = await replyHandler(
        createMockRequest('http://localhost:3000/api/admin/messages/reply', {
          body: { message_id: msg.id, reply_text: 'Hacked response' },
        })
      );
      assertEqual(resUnauth.status, 401, 'Unauthenticated reply must fail with 401');

      // Unauthorized attacker 2: Forged non-admin email
      const resForged = await replyHandler(
        createMockRequest('http://localhost:3000/api/admin/messages/reply', {
          headers: { 'x-admin-test-auth': 'attacker@darkweb.org' },
          body: { message_id: msg.id, reply_text: 'Forged reply' },
        })
      );
      assertEqual(resForged.status, 401, 'Forged non-admin email must fail with 401');

      // Authorized Admin: Mario Pepe
      const resAdmin = await replyHandler(
        createMockRequest('http://localhost:3000/api/admin/messages/reply', {
          headers: { 'x-admin-test-auth': 'mariopepe9@hotmail.it' },
          body: {
            message_id: msg.id,
            reply_text: 'Gentile Vittoria, ti rispondo con piacere per offrirti consulenza dedicata.',
          },
        })
      );
      assertEqual(resAdmin.status, 200, 'Authorized admin reply must succeed with 200');

      // Verify final DB state
      const { data: verified } = await supabaseAdmin
        .from('support_messages')
        .select('status, admin_reply')
        .eq('id', msg.id)
        .single();

      assertEqual(verified?.status, 'replied');
      assertIncludes(verified?.admin_reply || '', 'consulenza dedicata');
    });
  } finally {
    // Database teardown
    await cleanupTestData({ emails: createdEmails, messageIds: createdMessageIds });
  }

  return runner;
}
