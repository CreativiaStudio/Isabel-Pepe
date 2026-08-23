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

export async function runTier5Tests(): Promise<TestRunner> {
  const runner = new TestRunner('Tier 5: Adversarial Data, State & Concurrency');
  const createdEmails: string[] = [];
  const createdMessageIds: string[] = [];

  console.log('\n\x1b[1m\x1b[36m========================================================================\x1b[0m');
  console.log('\x1b[1m\x1b[36m  TIER 5: ADVERSARIAL DATA, STATE & CONCURRENCY STRESS TESTING          \x1b[0m');
  console.log('\x1b[1m\x1b[36m========================================================================\x1b[0m\n');

  try {
    const contactHandler = await getContactRouteHandler();
    const replyHandler = await getAdminReplyRouteHandler();
    const { updateMessageStatus, deleteMessage } = await getAdminMessageActions();

    // =========================================================================
    // SECTION 1: CONCURRENCY & RACE CONDITIONS
    // =========================================================================
    console.log('\x1b[1m\x1b[33m--- Section 1: Concurrency & Race Conditions ---\x1b[0m');

    await runner.test('T5.1.1: Parallel 10-actor contact form ingestion (No lost updates or collisions)', async () => {
      const actorCount = 10;
      const promises: Promise<Response>[] = [];
      const batchEmails: string[] = [];

      for (let i = 0; i < actorCount; i++) {
        const email = generateTestEmail(`t5_concur_${i}`);
        batchEmails.push(email);
        createdEmails.push(email);

        const customIp = `198.51.100.${i + 10}`;
        const req = createMockRequest('http://localhost:3000/api/contact', {
          ip: customIp,
          body: {
            name: `Parallel Customer ${i + 1}`,
            email,
            subject: `Parallel Inquiry #${i + 1} - Anello Imperial`,
            message: `Messaggio simultaneo per test di concorrenza numero ${i + 1}`,
            privacy: true,
            metadata: {
              batch_id: 't5_parallel_10',
              actor_index: i,
            },
          },
        });

        promises.push(contactHandler(req));
      }

      const responses = await Promise.all(promises);
      const ticketIds: string[] = [];

      for (let i = 0; i < responses.length; i++) {
        const res = responses[i];
        assertEqual(res.status, 200, `Response ${i} must return HTTP 200`);
        const json = await res.json();
        assertEqual(json.success, true, `Response ${i} success must be true`);
        assertDefined(json.ticket_id, `Response ${i} must have ticket_id`);
        ticketIds.push(json.ticket_id);
        createdMessageIds.push(json.ticket_id);
      }

      // Verify all ticketIds are unique (no UUID collisions)
      const uniqueIds = new Set(ticketIds);
      assertEqual(uniqueIds.size, actorCount, 'All 10 generated ticket IDs must be unique UUIDs');

      // Verify all 10 records exist in Supabase with status 'unread'
      const { data: dbRecords, error } = await supabaseAdmin
        .from('support_messages')
        .select('*')
        .in('id', ticketIds);

      assert(!error, `Supabase select should succeed: ${error?.message}`);
      assertEqual(dbRecords?.length, actorCount, 'All 10 records must be persisted in Supabase');

      for (const rec of dbRecords || []) {
        assertEqual(rec.status, 'unread', 'All parallel records must have status "unread"');
        assertDefined(rec.created_at, 'created_at timestamp must be present');
      }
    });

    await runner.test('T5.1.2: Burst submissions on single IP enforces rate-limiting threshold', async () => {
      const burstIp = `203.0.113.${Math.floor(Math.random() * 200) + 10}`;
      const burstCount = 8;
      const burstStatuses: number[] = [];

      for (let i = 0; i < burstCount; i++) {
        const email = generateTestEmail(`t5_burst_${i}`);
        createdEmails.push(email);

        const req = createMockRequest('http://localhost:3000/api/contact', {
          ip: burstIp,
          body: {
            name: `Burst Actor ${i}`,
            email,
            subject: `Burst Test Subject ${i}`,
            message: `Burst test message payload ${i}`,
            privacy: true,
          },
        });

        const res = await contactHandler(req);
        burstStatuses.push(res.status);

        if (res.status === 200) {
          const json = await res.json();
          if (json.ticket_id) createdMessageIds.push(json.ticket_id);
        }
      }

      // In-memory rate limiter allows 5 per IP
      const successfulCount = burstStatuses.filter((s) => s === 200).length;
      const throttledCount = burstStatuses.filter((s) => s === 429).length;

      assertEqual(successfulCount, 5, 'Exactly 5 requests should succeed within rate limit');
      assertEqual(throttledCount, 3, 'Remaining 3 requests in burst should be rejected with 429');
    });

    await runner.test('T5.1.3: Concurrent Admin Status Updates (Race Condition resilience)', async () => {
      // Seed a ticket
      const email = generateTestEmail('t5_status_race');
      createdEmails.push(email);

      const { data: seedMsg, error: seedErr } = await supabaseAdmin
        .from('support_messages')
        .insert({
          customer_name: 'Race Condition Customer',
          customer_email: email,
          subject: 'Race Condition Test',
          message: 'Testing concurrent admin status updates',
          status: 'unread',
        })
        .select()
        .single();

      assert(!seedErr && Boolean(seedMsg), 'Seed message must be created');
      const ticketId = seedMsg!.id;
      createdMessageIds.push(ticketId);

      // Fire 12 simultaneous status update actions with random valid statuses
      const validStatuses = ['pending', 'replied', 'closed', 'unread'] as const;
      const updatePromises: Promise<{ success: boolean; error?: string }>[] = [];

      for (let i = 0; i < 12; i++) {
        const targetStatus = validStatuses[i % validStatuses.length];
        updatePromises.push(updateMessageStatus(ticketId, targetStatus));
      }

      const results = await Promise.all(updatePromises);
      for (let i = 0; i < results.length; i++) {
        assertEqual(results[i].success, true, `Update ${i} should succeed without DB lock error`);
      }

      // Verify row state in Supabase is valid and not corrupted
      const { data: finalRecord, error: finalErr } = await supabaseAdmin
        .from('support_messages')
        .select('*')
        .eq('id', ticketId)
        .single();

      assert(!finalErr && Boolean(finalRecord), 'Final record must exist');
      assert(
        validStatuses.includes(finalRecord!.status as any),
        `Final status must be a valid enum value, got: ${finalRecord!.status}`
      );
      assertDefined(finalRecord!.updated_at, 'updated_at must be populated');
    });

    await runner.test('T5.1.4: Concurrent Reply vs Status Update Race Condition', async () => {
      // Seed a ticket
      const email = generateTestEmail('t5_reply_status_race');
      createdEmails.push(email);

      const { data: seedMsg, error: seedErr } = await supabaseAdmin
        .from('support_messages')
        .insert({
          customer_name: 'Concurrent Actor',
          customer_email: email,
          subject: 'Disponibilità Parure Diamanti',
          message: 'Richiesta informazioni su disponibilità immediata.',
          status: 'unread',
          metadata: { initial_source: 'vip_banner' },
        })
        .select()
        .single();

      assert(!seedErr && Boolean(seedMsg), 'Seed message must be created');
      const ticketId = seedMsg!.id;
      createdMessageIds.push(ticketId);

      // Simultaneously trigger reply API and updateMessageStatus('closed')
      const replyReq = createMockRequest('http://localhost:3000/api/admin/messages/reply', {
        headers: { 'x-admin-test-auth': 'sviluppo@creativiastudio.com' },
        body: {
          message_id: ticketId,
          reply_text: 'Gentile cliente, la parure è disponibile nel nostro showroom.',
        },
      });

      const [replyRes, statusRes] = await Promise.all([
        replyHandler(replyReq),
        updateMessageStatus(ticketId, 'closed'),
      ]);

      assertEqual(replyRes.status, 200, 'Reply request should return 200');
      assertEqual(statusRes.success, true, 'Status update action should return success: true');

      // Fetch final record from DB
      const { data: finalRecord, error: fetchErr } = await supabaseAdmin
        .from('support_messages')
        .select('*')
        .eq('id', ticketId)
        .single();

      assert(!fetchErr && Boolean(finalRecord), 'Record must exist in DB');
      // Status must be either 'replied' or 'closed' (both valid terminal states)
      assert(
        ['replied', 'closed'].includes(finalRecord!.status),
        `Status must be replied or closed, got: ${finalRecord!.status}`
      );
      assertEqual(finalRecord!.admin_reply, 'Gentile cliente, la parure è disponibile nel nostro showroom.');
      assertDefined(finalRecord!.replied_at, 'replied_at must be populated');
      assertEqual(finalRecord!.metadata?.initial_source, 'vip_banner', 'Metadata must remain intact');
    });

    // =========================================================================
    // SECTION 2: STATUS TRANSITION STATE-MACHINE STRESS & CONSTRAINTS
    // =========================================================================
    console.log('\x1b[1m\x1b[33m--- Section 2: Status Transition State-Machine & Constraint Stress ---\x1b[0m');

    await runner.test('T5.2.1: Server action strictly rejects illegal status strings', async () => {
      const email = generateTestEmail('t5_illegal_status');
      createdEmails.push(email);

      const { data: seedMsg } = await supabaseAdmin
        .from('support_messages')
        .insert({
          customer_name: 'Test Illegal Status',
          customer_email: email,
          subject: 'Status Stress Test',
          message: 'Testing illegal status string rejections',
          status: 'unread',
        })
        .select()
        .single();

      const ticketId = seedMsg!.id;
      createdMessageIds.push(ticketId);

      const illegalStatuses = [
        'invalid_status',
        'deleted',
        'archived',
        'null',
        'undefined',
        'DROPTABLE',
        'in_progress',
        'resolved',
        'open',
        '123',
        '',
        '   ',
        'UNREAD', // Case-insensitivity test: uppercase 'UNREAD' should normalize or reject
      ];

      for (const badStatus of illegalStatuses) {
        const res = await updateMessageStatus(ticketId, badStatus);
        const normalized = badStatus.trim().toLowerCase();
        const isValid = ['unread', 'pending', 'replied', 'closed'].includes(normalized);

        if (isValid) {
          assertEqual(res.success, true, `Normalized status "${normalized}" should be accepted`);
        } else {
          assertEqual(res.success, false, `Illegal status "${badStatus}" must be rejected`);
          assertDefined(res.error, `Error message must be present for illegal status "${badStatus}"`);
        }
      }

      // Verify the record in DB was not set to any illegal value
      const { data: checkMsg } = await supabaseAdmin
        .from('support_messages')
        .select('status')
        .eq('id', ticketId)
        .single();

      assert(
        ['unread', 'pending', 'replied', 'closed'].includes(checkMsg!.status),
        `DB status must remain a valid enum, got: ${checkMsg!.status}`
      );
    });

    await runner.test('T5.2.2: Database check constraint enforces valid enum values at PostgreSQL level', async () => {
      const email = generateTestEmail('t5_db_check');
      createdEmails.push(email);

      // 1. Direct Supabase insert with illegal status
      const { error: insertErr } = await supabaseAdmin
        .from('support_messages')
        .insert({
          customer_name: 'DB Constraint Test',
          customer_email: email,
          subject: 'Constraint check',
          message: 'Direct DB insert with invalid status',
          status: 'hacked_status' as any,
        });

      assertDefined(insertErr, 'Direct DB insert with invalid status must fail at PostgreSQL level');
      assertIncludes(
        insertErr.message.toLowerCase(),
        'check constraint',
        'Database error must mention check constraint violation'
      );

      // 2. Direct Supabase update with illegal status 'deleted'
      const { data: validMsg } = await supabaseAdmin
        .from('support_messages')
        .insert({
          customer_name: 'Valid Customer',
          customer_email: email,
          subject: 'Valid subject',
          message: 'Valid message body',
          status: 'unread',
        })
        .select()
        .single();

      createdMessageIds.push(validMsg!.id);

      const { error: updateErr } = await supabaseAdmin
        .from('support_messages')
        .update({ status: 'deleted' as any })
        .eq('id', validMsg!.id);

      assertDefined(updateErr, 'Direct DB update with status "deleted" must fail PostgreSQL check constraint');
      assertIncludes(
        updateErr.message.toLowerCase(),
        'check constraint',
        'Database update error must mention check constraint'
      );
    });

    await runner.test('T5.2.3: Full State-Machine Lifecycle Cycle (unread -> pending -> replied -> closed -> reopened)', async () => {
      const email = generateTestEmail('t5_lifecycle');
      createdEmails.push(email);

      const { data: seedMsg } = await supabaseAdmin
        .from('support_messages')
        .insert({
          customer_name: 'Lifecycle Persona',
          customer_email: email,
          subject: 'Lifecycle Verification',
          message: 'Tracking all state transitions end-to-end',
          status: 'unread',
        })
        .select()
        .single();

      const ticketId = seedMsg!.id;
      createdMessageIds.push(ticketId);

      const transitions: Array<{ to: string; expected: string }> = [
        { to: 'pending', expected: 'pending' },
        { to: 'replied', expected: 'replied' },
        { to: 'closed', expected: 'closed' },
        { to: 'pending', expected: 'pending' }, // Reopened
        { to: 'unread', expected: 'unread' },   // Reset to unread
        { to: 'replied', expected: 'replied' }, // Directly replied
        { to: 'closed', expected: 'closed' },   // Closed again
      ];

      for (const step of transitions) {
        const res = await updateMessageStatus(ticketId, step.to);
        assertEqual(res.success, true, `Transition to "${step.to}" should succeed`);
        assertEqual(res.status, step.expected, `Action should return status "${step.expected}"`);

        const { data: currentRecord } = await supabaseAdmin
          .from('support_messages')
          .select('status, updated_at')
          .eq('id', ticketId)
          .single();

        assertEqual(currentRecord!.status, step.expected, `Supabase status must match "${step.expected}"`);
      }
    });

    await runner.test('T5.2.4: State transition idempotency (updating to same status)', async () => {
      const email = generateTestEmail('t5_idempotent');
      createdEmails.push(email);

      const { data: seedMsg } = await supabaseAdmin
        .from('support_messages')
        .insert({
          customer_name: 'Idempotency Customer',
          customer_email: email,
          subject: 'Idempotency Test',
          message: 'Testing updating to current status',
          status: 'unread',
        })
        .select()
        .single();

      const ticketId = seedMsg!.id;
      createdMessageIds.push(ticketId);

      // Update to 'unread' when already 'unread'
      const res1 = await updateMessageStatus(ticketId, 'unread');
      assertEqual(res1.success, true, 'Updating unread -> unread must succeed');
      assertEqual(res1.status, 'unread');

      // Update to 'closed', then update to 'closed' again
      await updateMessageStatus(ticketId, 'closed');
      const res2 = await updateMessageStatus(ticketId, 'closed');
      assertEqual(res2.success, true, 'Updating closed -> closed must succeed');
      assertEqual(res2.status, 'closed');
    });

    // =========================================================================
    // SECTION 3: REPLY PERSISTENCE & METADATA INTEGRITY
    // =========================================================================
    console.log('\x1b[1m\x1b[33m--- Section 3: Reply Persistence & Metadata Integrity ---\x1b[0m');

    await runner.test('T5.3.1: Metadata preservation across multiple replies and re-replies', async () => {
      const email = generateTestEmail('t5_meta_preserve');
      createdEmails.push(email);

      const initialMetadata = {
        source: 'vip_concierge_dialog',
        utm_source: 'instagram_story',
        utm_medium: 'cpc',
        utm_campaign: 'luxury_alta_gioielleria_2026',
        client_tier: 'Diamond VIP',
        referrer: 'https://isabelpepe.com/collezioni',
        device: 'iPhone 16 Pro Max',
        custom_notes: {
          preferred_gold: 'Oro Bianco 18k',
          budget_range: '€5.000 - €10.000',
        },
      };

      const { data: seedMsg } = await supabaseAdmin
        .from('support_messages')
        .insert({
          customer_name: 'Principessa Isabella',
          customer_email: email,
          subject: 'Richiesta Personalizzazione Collana Solitaire',
          message: 'Desidero commissionare una collana personalizzata in oro bianco con diamante taglio brillante.',
          status: 'unread',
          metadata: initialMetadata,
        })
        .select()
        .single();

      const ticketId = seedMsg!.id;
      createdMessageIds.push(ticketId);

      // Reply #1
      const reply1Req = createMockRequest('http://localhost:3000/api/admin/messages/reply', {
        headers: { 'x-admin-test-auth': 'mario@isabelpepe.com' },
        body: {
          message_id: ticketId,
          reply_text: 'Prima risposta: Abbiamo ricevuto la sua richiesta, stiamo preparando il bozzetto.',
        },
      });

      const reply1Res = await replyHandler(reply1Req);
      assertEqual(reply1Res.status, 200, 'Reply 1 must succeed');

      // Verify DB state after Reply 1
      const { data: msgAfterReply1 } = await supabaseAdmin
        .from('support_messages')
        .select('*')
        .eq('id', ticketId)
        .single();

      assertEqual(msgAfterReply1!.status, 'replied');
      assertEqual(msgAfterReply1!.admin_reply, 'Prima risposta: Abbiamo ricevuto la sua richiesta, stiamo preparando il bozzetto.');
      assertEqual(msgAfterReply1!.replied_by, 'mario@isabelpepe.com');
      assertDefined(msgAfterReply1!.replied_at);
      assertEqual(msgAfterReply1!.metadata?.client_tier, 'Diamond VIP', 'Metadata client_tier must be preserved');
      assertEqual(msgAfterReply1!.metadata?.custom_notes?.preferred_gold, 'Oro Bianco 18k', 'Nested metadata must be preserved');

      // Reply #2 (Re-reply / follow-up reply)
      const reply2Req = createMockRequest('http://localhost:3000/api/admin/messages/reply', {
        headers: { 'x-admin-test-auth': 'info@isabelpepe.com' },
        body: {
          message_id: ticketId,
          reply_text: 'Seconda risposta: Il bozzetto è pronto e disponibile per la sua approvazione.',
        },
      });

      const reply2Res = await replyHandler(reply2Req);
      assertEqual(reply2Res.status, 200, 'Reply 2 must succeed');

      // Verify DB state after Reply 2
      const { data: msgAfterReply2 } = await supabaseAdmin
        .from('support_messages')
        .select('*')
        .eq('id', ticketId)
        .single();

      assertEqual(msgAfterReply2!.status, 'replied');
      assertEqual(msgAfterReply2!.admin_reply, 'Seconda risposta: Il bozzetto è pronto e disponibile per la sua approvazione.');
      assertEqual(msgAfterReply2!.replied_by, 'info@isabelpepe.com');
      assertDefined(msgAfterReply2!.replied_at);
      assertEqual(msgAfterReply2!.metadata?.utm_campaign, 'luxury_alta_gioielleria_2026', 'Metadata UTM campaign must be intact');
      assertEqual(msgAfterReply2!.metadata?.custom_notes?.budget_range, '€5.000 - €10.000', 'Nested budget range must be intact');
    });

    await runner.test('T5.3.2: High-Fidelity luxury reply payloads (Accents, brackets, quotes, and unicode emojis)', async () => {
      const email = generateTestEmail('t5_luxury_payload');
      createdEmails.push(email);

      const { data: seedMsg } = await supabaseAdmin
        .from('support_messages')
        .insert({
          customer_name: 'Dottoressa Elena De Luca',
          customer_email: email,
          subject: 'Consiglio Gioielli Alta Sartoria',
          message: 'Vorrei un abbinamento per un evento di gala.',
          status: 'unread',
        })
        .select()
        .single();

      const ticketId = seedMsg!.id;
      createdMessageIds.push(ticketId);

      const luxuryReplyText = `Gentilissima Dott.ssa De Luca,
La ringraziamo per aver contattato la Maison Isabel Pepe <info@isabelpepe.com>.

Per la Sua serata speciale, raccomandiamo l'anello "Imperial" abbinato agli orecchini 'Luce di Diamante' (Oro Bianco 18kt & Diamanti F-VS1).
È nostra cura garantirLe la spedizione espressa assicurata e il certificato gemmologico internazionale.

Cordiali Saluti,
Mario Pepe — Fondatore & Creative Director 💎 ✨ 💍 👑`;

      const req = createMockRequest('http://localhost:3000/api/admin/messages/reply', {
        headers: { 'x-admin-test-auth': 'mario@isabelpepe.com' },
        body: {
          message_id: ticketId,
          reply_text: luxuryReplyText,
          subject: 'Re: Consiglio Gioielli Alta Sartoria — Isabel Pepe Concierge VIP',
        },
      });

      const res = await replyHandler(req);
      assertEqual(res.status, 200, 'Luxury reply with complex unicode must succeed');

      const { data: savedRecord } = await supabaseAdmin
        .from('support_messages')
        .select('*')
        .eq('id', ticketId)
        .single();

      assertEqual(savedRecord!.admin_reply, luxuryReplyText, 'Stored admin reply must match luxury text verbatim');
      assertEqual(savedRecord!.status, 'replied');
    });

    await runner.test('T5.3.3: Rapid sequential re-replies with updated timestamps', async () => {
      const email = generateTestEmail('t5_rapid_replies');
      createdEmails.push(email);

      const { data: seedMsg } = await supabaseAdmin
        .from('support_messages')
        .insert({
          customer_name: 'Sequential Client',
          customer_email: email,
          subject: 'Sequential Reply Test',
          message: 'Testing sequential replies',
          status: 'unread',
        })
        .select()
        .single();

      const ticketId = seedMsg!.id;
      createdMessageIds.push(ticketId);

      for (let i = 1; i <= 3; i++) {
        const req = createMockRequest('http://localhost:3000/api/admin/messages/reply', {
          headers: { 'x-admin-test-auth': 'sviluppo@creativiastudio.com' },
          body: {
            message_id: ticketId,
            reply_text: `Sequential reply revision #${i} content.`,
          },
        });

        const res = await replyHandler(req);
        assertEqual(res.status, 200, `Sequential reply ${i} should return 200`);
      }

      const { data: finalMsg } = await supabaseAdmin
        .from('support_messages')
        .select('*')
        .eq('id', ticketId)
        .single();

      assertEqual(finalMsg!.admin_reply, 'Sequential reply revision #3 content.');
      assertEqual(finalMsg!.status, 'replied');
    });

    // =========================================================================
    // SECTION 4: DELETION RESILIENCE & ENTITY HARDENING
    // =========================================================================
    console.log('\x1b[1m\x1b[33m--- Section 4: Deletion Resilience & Entity Hardening ---\x1b[0m');

    await runner.test('T5.4.1: Deleted message ID returns strict HTTP 404 on reply attempt', async () => {
      const email = generateTestEmail('t5_deleted_reply');
      createdEmails.push(email);

      // 1. Create a ticket
      const { data: seedMsg } = await supabaseAdmin
        .from('support_messages')
        .insert({
          customer_name: 'Delete Target',
          customer_email: email,
          subject: 'To be deleted',
          message: 'This message will be deleted before reply attempt',
          status: 'unread',
        })
        .select()
        .single();

      const deletedId = seedMsg!.id;

      // 2. Delete the ticket via deleteMessage action
      const deleteResult = await deleteMessage(deletedId);
      assertEqual(deleteResult.success, true, 'deleteMessage should succeed');

      // Verify it no longer exists in Supabase
      const { data: checkDeleted } = await supabaseAdmin
        .from('support_messages')
        .select('id')
        .eq('id', deletedId)
        .maybeSingle();

      assertEqual(checkDeleted, null, 'Message should no longer exist in Supabase');

      // 3. Attempt reply to the deleted message ID
      const replyReq = createMockRequest('http://localhost:3000/api/admin/messages/reply', {
        headers: { 'x-admin-test-auth': 'sviluppo@creativiastudio.com' },
        body: {
          message_id: deletedId,
          reply_text: 'Tentativo di risposta a messaggio eliminato.',
        },
      });

      const replyRes = await replyHandler(replyReq);
      const replyJson = await replyRes.json();

      assertEqual(replyRes.status, 404, 'Reply to deleted message ID must return HTTP 404');
      assertEqual(replyJson.success, false, 'Reply to deleted ID success must be false');
      assertIncludes(replyJson.error, 'non trovato', 'Error message must state message was not found');
    });

    await runner.test('T5.4.2: Non-existent random UUID returns HTTP 404 on reply', async () => {
      const nonExistentUuid = 'e8b4e723-0000-4000-8000-000000000000';

      const replyReq = createMockRequest('http://localhost:3000/api/admin/messages/reply', {
        headers: { 'x-admin-test-auth': 'sviluppo@creativiastudio.com' },
        body: {
          message_id: nonExistentUuid,
          reply_text: 'Risposta a UUID inesistente.',
        },
      });

      const res = await replyHandler(replyReq);
      const json = await res.json();

      assertEqual(res.status, 404, 'Random non-existent UUID must return 404');
      assertEqual(json.success, false);
      assertIncludes(json.error, 'non trovato');
    });

    await runner.test('T5.4.3: Malformed & Empty message_id values rejected with 400 or 404', async () => {
      const badIds = [
        { id: '', expectedStatus: 400 },
        { id: '   ', expectedStatus: 400 },
        { id: null, expectedStatus: 400 },
        { id: undefined, expectedStatus: 400 },
        { id: 'not-a-valid-uuid', expectedStatus: 404 }, // Passes string check, fails DB lookup with 404
      ];

      for (const item of badIds) {
        const req = createMockRequest('http://localhost:3000/api/admin/messages/reply', {
          headers: { 'x-admin-test-auth': 'sviluppo@creativiastudio.com' },
          body: {
            message_id: item.id,
            reply_text: 'Valid reply text',
          },
        });

        const res = await replyHandler(req);
        assertEqual(
          res.status,
          item.expectedStatus,
          `Message ID "${item.id}" should return HTTP ${item.expectedStatus}, got ${res.status}`
        );
      }
    });

    await runner.test('T5.4.4: Idempotent message deletion (Deleting already-deleted or non-existent ID)', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';

      // First delete attempt on non-existent ID
      const res1 = await deleteMessage(nonExistentId);
      assertEqual(res1.success, true, 'Deleting non-existent ID should return success: true (idempotent SQL DELETE)');

      // Invalid ID input checks
      const badIdRes = await deleteMessage('');
      assertEqual(badIdRes.success, false, 'Deleting empty string ID must return error');
      assertDefined(badIdRes.error);
    });

    await runner.test('T5.4.5: Attempting status update on non-existent ID fails gracefully or returns success: true', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      const res = await updateMessageStatus(nonExistentId, 'pending');

      // Supabase update on 0 matching rows succeeds without SQL error in PostgreSQL
      assertEqual(res.success, true, 'Update status on 0 rows is safe and does not crash');

      // Invalid status on non-existent ID must still fail validation
      const badStatusRes = await updateMessageStatus(nonExistentId, 'invalid_status');
      assertEqual(badStatusRes.success, false, 'Invalid status must fail validation regardless of ID existence');
    });

  } finally {
    // Cleanup generated test data
    console.log('\n\x1b[90mCleaning up Tier 5 test data...\x1b[0m');
    await cleanupTestData({
      emails: createdEmails,
      messageIds: createdMessageIds,
    });
    console.log('\x1b[90mTier 5 test data cleanup complete.\x1b[0m\n');
  }

  return runner;
}
