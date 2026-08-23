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

export async function runTier4Tests(): Promise<TestRunner> {
  const runner = new TestRunner('Tier 4: Real-World Luxury Concierge Scenarios');
  const createdEmails: string[] = [];
  const createdMessageIds: string[] = [];

  console.log('\n\x1b[1m\x1b[36m========================================================================\x1b[0m');
  console.log('\x1b[1m\x1b[36m  TIER 4: REAL-WORLD LUXURY CONCIERGE SCENARIOS (4 Customer Personas)\x1b[0m');
  console.log('\x1b[1m\x1b[36m========================================================================\x1b[0m\n');

  try {
    // =========================================================================
    // SCENARIO 1: Consiglio Misura Anello (Ring Sizing Consultation)
    // =========================================================================
    await runner.test('T4.1: Scenario "Consiglio Misura Anello" — Solitaire / Imperial Sizing Guide', async () => {
      const email = generateTestEmail('t4_ring_sizing');
      createdEmails.push(email);

      // Customer fills form on /assistenza-clienti
      const contactHandler = await getContactRouteHandler();
      const req = createMockRequest('http://localhost:3000/api/contact', {
        body: {
          name: 'Camilla Baresi',
          email,
          subject: 'Consiglio Misura Anello Solitaire',
          message: 'Buongiorno, vorrei acquistare l Anello Solitaire ma non sono sicura tra la taglia 12 e 14. Come posso misurare con precisione la circonferenza?',
          privacy: true,
          metadata: {
            category: 'ring_sizing',
            product_interest: 'anello-solitaire-moissanite',
          },
        },
      });

      const res = await contactHandler(req);
      const data = await res.json();
      assertEqual(res.status, 200);
      createdMessageIds.push(data.ticket_id);

      // Admin uses quick-reply template for sizing advice
      const sizingTemplateReply = `Gentile Camilla,\n\nGrazie per il suo interesse per l'Anello Solitaire Isabel Pepe.\n\nPer misurare con precisione il suo dito le consigliamo di misurare il diametro interno di un anello che già possiede:\n- Misura IT 12 = diametro interno 16.5 mm\n- Misura IT 14 = diametro interno 17.2 mm\n\nInoltre, offriamo il cambio taglia gratuito entro 14 giorni dalla consegna con ritiro a nostro carico tramite corriere espresso.\n\nRestiamo a sua completa disposizione,\nElena & Mario Pepe — Isabel Pepe Concierge`;

      const replyHandler = await getAdminReplyRouteHandler();
      const replyReq = createMockRequest('http://localhost:3000/api/admin/messages/reply', {
        headers: { 'x-admin-test-auth': 'info@isabelpepe.com' },
        body: {
          message_id: data.ticket_id,
          reply_text: sizingTemplateReply,
          subject: 'Re: Consiglio Misura Anello Solitaire — Guida Taglie Isabel Pepe',
        },
      });

      const replyRes = await replyHandler(replyReq);
      const replyData = await replyRes.json();
      assertEqual(replyRes.status, 200);
      assertEqual(replyData.success, true);

      // Verify DB record
      const { data: dbMsg } = await supabaseAdmin
        .from('support_messages')
        .select('*')
        .eq('id', data.ticket_id)
        .single();

      assertEqual(dbMsg?.status, 'replied');
      assertIncludes(dbMsg?.admin_reply || '', 'diametro interno 16.5 mm');
    });

    // =========================================================================
    // SCENARIO 2: Informazioni Spedizione & Tracking
    // =========================================================================
    await runner.test('T4.2: Scenario "Spedizione & Tracking" — Packlink / Poste Italiane Express Delivery', async () => {
      const email = generateTestEmail('t4_shipping');
      createdEmails.push(email);

      const contactHandler = await getContactRouteHandler();
      const req = createMockRequest('http://localhost:3000/api/contact', {
        body: {
          name: 'Federico Balzaretti',
          email,
          subject: 'Tracking Spedizione Ordine #IP-1029',
          message: 'Salve, vorrei avere il tracking del mio pacco ordinato ieri sera. Quando è prevista la consegna a Roma?',
          privacy: true,
          metadata: {
            order_id: 'IP-1029',
            shipping_carrier: 'Poste Italiane / SDA',
          },
        },
      });

      const res = await contactHandler(req);
      const data = await res.json();
      assertEqual(res.status, 200);
      createdMessageIds.push(data.ticket_id);

      const trackingReply = `Gentile Federico,\n\nIl suo ordine #IP-1029 è stato affidato al corriere espresso Poste Italiane / SDA con codice di tracciamento:\n📦 2705001293847\n\nLa consegna a Roma è programmata per domani entro le ore 18:00 in confezione sigillata con Cofanetto Luxury Isabel Pepe.\n\nCordiali saluti,\nServizio Clienti Isabel Pepe`;

      const replyHandler = await getAdminReplyRouteHandler();
      const replyRes = await replyHandler(
        createMockRequest('http://localhost:3000/api/admin/messages/reply', {
          headers: { 'x-admin-test-auth': 'sviluppo@creativiastudio.com' },
          body: {
            message_id: data.ticket_id,
            reply_text: trackingReply,
          },
        })
      );

      assertEqual(replyRes.status, 200);

      const { data: dbMsg } = await supabaseAdmin
        .from('support_messages')
        .select('*')
        .eq('id', data.ticket_id)
        .single();

      assertEqual(dbMsg?.status, 'replied');
      assertIncludes(dbMsg?.admin_reply || '', '2705001293847');
    });

    // =========================================================================
    // SCENARIO 3: Richiesta Reso / Cambio Gioiello
    // =========================================================================
    await runner.test('T4.3: Scenario "Reso & Garanzia 24 Mesi" — 14-Day Return / Exchange Protocol', async () => {
      const email = generateTestEmail('t4_return');
      createdEmails.push(email);

      const contactHandler = await getContactRouteHandler();
      const req = createMockRequest('http://localhost:3000/api/contact', {
        body: {
          name: 'Serena Grandi',
          email,
          subject: 'Richiesta Reso e Sostituzione con Modello Gold',
          message: 'Ho ricevuto il bracciale Tennis ieri ma vorrei sostituirlo con la versione placcata in oro giallo 18k.',
          privacy: true,
        },
      });

      const res = await contactHandler(req);
      const data = await res.json();
      assertEqual(res.status, 200);
      createdMessageIds.push(data.ticket_id);

      // Admin transitions to pending while coordinating return pickup
      const actions = await getAdminMessageActions();
      await actions.updateMessageStatus(data.ticket_id, 'pending');

      const returnReply = `Gentile Serena,\n\nNessun problema, la procedura di cambio con il modello in oro giallo 18k è semplice e gratuita.\n\nLe inviamo in allegato la lettera di vettura prepagata. Sarà sufficiente inserire il bracciale nel suo cofanetto originale con il certificato GRA e consegnarlo al corriere.\n\nAppena ricevuto, spediremo immediatamente la variante desiderata.\n\nUn cordiale saluto,\nIsabel Pepe Concierge`;

      const replyHandler = await getAdminReplyRouteHandler();
      const replyRes = await replyHandler(
        createMockRequest('http://localhost:3000/api/admin/messages/reply', {
          headers: { 'x-admin-test-auth': 'mariopepe9@hotmail.it' },
          body: {
            message_id: data.ticket_id,
            reply_text: returnReply,
          },
        })
      );

      assertEqual(replyRes.status, 200);

      const { data: dbMsg } = await supabaseAdmin
        .from('support_messages')
        .select('*')
        .eq('id', data.ticket_id)
        .single();

      assertEqual(dbMsg?.status, 'replied');
      assertIncludes(dbMsg?.admin_reply || '', 'lettera di vettura prepagata');
    });

    // =========================================================================
    // SCENARIO 4: VIP Bespoke Custom Jewelry Commission
    // =========================================================================
    await runner.test('T4.4: Scenario "VIP Bespoke Custom Commission" — High-Value Private Client', async () => {
      const email = generateTestEmail('t4_vip_bespoke');
      createdEmails.push(email);

      const contactHandler = await getContactRouteHandler();
      const req = createMockRequest('http://localhost:3000/api/contact', {
        body: {
          name: 'Contessa Maria Teresa Visconti',
          email,
          subject: 'Progetto Gioiello su Misura — Parure Alta Gioielleria',
          message: 'Desidero commissionare una parure esclusiva su disegno personalizzato con Moissanite VVS1 D-Color e montatura in platino 950.',
          privacy: true,
          metadata: {
            vip_tier: 'platinum',
            estimated_budget: '5000+',
          },
        },
      });

      const res = await contactHandler(req);
      const data = await res.json();
      assertEqual(res.status, 200);
      createdMessageIds.push(data.ticket_id);

      const vipReply = `Gentilissima Contessa Visconti,\n\nÈ un vero onore accogliere la sua richiesta di alta gioielleria su misura.\n\nSarei felice di fissare una video-consulenza privata dedicata per discutere i bozzetti e la selezione delle pietre certificate GRA.\n\nLe lascio il mio recapito diretto per qualsiasi dettaglio.\n\nCon i miei più cordiali saluti,\nMario Pepe — Founder & Creative Director Isabel Pepe`;

      const replyHandler = await getAdminReplyRouteHandler();
      const replyRes = await replyHandler(
        createMockRequest('http://localhost:3000/api/admin/messages/reply', {
          headers: { 'x-admin-test-auth': 'mario@isabelpepe.com' },
          body: {
            message_id: data.ticket_id,
            reply_text: vipReply,
            subject: 'Re: Progetto Gioiello su Misura — Parure Alta Gioielleria Isabel Pepe',
          },
        })
      );

      assertEqual(replyRes.status, 200);

      const { data: dbMsg } = await supabaseAdmin
        .from('support_messages')
        .select('*')
        .eq('id', data.ticket_id)
        .single();

      assertEqual(dbMsg?.status, 'replied');
      assertEqual(dbMsg?.replied_by, 'mario@isabelpepe.com');
      assertIncludes(dbMsg?.admin_reply || '', 'Founder & Creative Director');
    });
  } finally {
    // Database teardown
    await cleanupTestData({ emails: createdEmails, messageIds: createdMessageIds });
  }

  return runner;
}
