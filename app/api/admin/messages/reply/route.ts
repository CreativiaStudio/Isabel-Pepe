import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyAdminAuth, isAdminEmail } from '@/lib/auth-guard';
import { sendSupportReplyEmail } from '@/lib/email';

export async function POST(req: Request | NextRequest) {
  try {
    // 1. Verify Admin Authentication
    const auth = await verifyAdminAuth(req);
    let adminEmail = auth.user?.email || null;

    if (!auth.authorized) {
      // Support test authentication header for E2E / integration tests only in test mode
      const isTestEnv = process.env.NODE_ENV === 'test' || process.env.ENABLE_TEST_AUTH_HEADER === 'true';
      const testEmail = req.headers.get('x-admin-test-auth');
      if (isTestEnv && testEmail && isAdminEmail(testEmail)) {
        adminEmail = testEmail.trim().toLowerCase();
      } else {
        return auth.response || NextResponse.json(
          { success: false, error: 'Non autorizzato: privilegi admin richiesti' },
          { status: 401 }
        );
      }
    }

    // 2. Parse & Validate Payload
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Formato richiesta non valido (JSON atteso)' },
        { status: 400 }
      );
    }

    const { message_id, reply_text, subject } = body || {};

    if (!message_id || typeof message_id !== 'string' || message_id.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'ID messaggio mancante o non valido' },
        { status: 400 }
      );
    }

    if (!reply_text || typeof reply_text !== 'string' || reply_text.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Il testo della risposta non può essere vuoto' },
        { status: 400 }
      );
    }

    const trimmedReply = reply_text.trim();
    const customSubject = typeof subject === 'string' && subject.trim().length > 0 ? subject.trim() : undefined;

    // 3. Fetch Message from Database
    const { data: existingMessage, error: fetchError } = await supabaseAdmin
      .from('support_messages')
      .select('*')
      .eq('id', message_id.trim())
      .maybeSingle();

    if (fetchError || !existingMessage) {
      return NextResponse.json(
        { success: false, error: 'Messaggio non trovato' },
        { status: 404 }
      );
    }

    // 4. Send Branded Support Reply Email to Customer
    const emailResult = await sendSupportReplyEmail({
      customerEmail: existingMessage.customer_email,
      customerName: existingMessage.customer_name,
      originalSubject: existingMessage.subject,
      originalMessage: existingMessage.message,
      replyText: trimmedReply,
      ticketId: existingMessage.id,
      subject: customSubject,
    });

    if (!emailResult.success) {
      console.warn('⚠️ Warning: Email dispatch error during reply:', emailResult.error);
    }

    // 5. Update Database Record to 'replied'
    const nowIso = new Date().toISOString();
    const finalRepliedBy = adminEmail || 'info@isabelpepe.com';

    const { data: updatedMessage, error: updateError } = await supabaseAdmin
      .from('support_messages')
      .update({
        status: 'replied',
        admin_reply: trimmedReply,
        replied_at: nowIso,
        replied_by: finalRepliedBy,
        updated_at: nowIso,
      })
      .eq('id', existingMessage.id)
      .select('*')
      .single();

    if (updateError) {
      console.error('❌ Errore aggiornamento database supporto:', updateError);
      return NextResponse.json(
        { success: false, error: 'Errore durante il salvataggio della risposta nel database' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Risposta inviata con successo',
        replied_at: nowIso,
        ticket_id: existingMessage.id,
        data: updatedMessage,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error('❌ Eccezione route admin messages reply:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Errore interno del server' },
      { status: 500 }
    );
  }
}
