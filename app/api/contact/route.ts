import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { isBotUserAgent } from '@/lib/bot-filter';
import { sendSupportAdminNotificationEmail } from '@/lib/email';

// In-memory rate limiter: max 5 requests per 10 minutes per IP
interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

function checkRateLimit(ip: string): boolean {
  const now = Date.now();

  // Prune expired entries if the map grows
  if (rateLimitMap.size > 500) {
    for (const [key, record] of rateLimitMap.entries()) {
      if (now > record.resetTime) {
        rateLimitMap.delete(key);
      }
    }
  }

  const record = rateLimitMap.get(ip);
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return false;
  }

  record.count += 1;
  return true;
}

export async function POST(req: Request) {
  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: 'Formato richiesta non valido (JSON richiesto)' },
        { status: 400 }
      );
    }

    const {
      name,
      customer_name,
      customerName,
      email,
      customer_email,
      customerEmail,
      subject,
      message,
      privacy,
      gdpr_consent,
      consent,
      website_hp,
      website_url,
      confirm_hp,
      metadata = {},
    } = body || {};

    // 1. Honeypot & Bot Trapping
    const honeypot = website_hp || website_url || confirm_hp;
    const isHoneypotFilled = Boolean(honeypot && String(honeypot).trim().length > 0);

    const userAgent = req.headers.get('user-agent') || '';
    const isBot = isBotUserAgent(userAgent);

    // If bot detected or honeypot filled, silently return success so bots don't adapt
    if (isHoneypotFilled || isBot) {
      return NextResponse.json({
        success: true,
        message: 'Messaggio inviato con successo',
      });
    }

    // 2. IP Extraction & Rate Limiting
    const ipAddress =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      req.headers.get('cf-connecting-ip') ||
      '127.0.0.1';

    const isAllowed = checkRateLimit(ipAddress);
    if (!isAllowed) {
      return NextResponse.json(
        { error: 'Troppe richieste. Riprova tra qualche minuto.' },
        { status: 429 }
      );
    }

    // 3. Strict Input Validation
    const rawName = name || customer_name || customerName;
    const rawEmail = email || customer_email || customerEmail;
    const hasPrivacyConsent =
      privacy === true ||
      privacy === 'true' ||
      gdpr_consent === true ||
      consent === true;

    if (!hasPrivacyConsent) {
      return NextResponse.json(
        { error: 'È necessario accettare l\'informativa sulla privacy per inviare un messaggio.' },
        { status: 400 }
      );
    }

    if (!rawName || typeof rawName !== 'string' || rawName.trim().length < 2) {
      return NextResponse.json(
        { error: 'Il nome inserito non è valido o troppo breve.' },
        { status: 400 }
      );
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!rawEmail || typeof rawEmail !== 'string' || rawEmail.includes('..') || !emailRegex.test(rawEmail.trim())) {
      return NextResponse.json(
        { error: 'L\'indirizzo email inserito non è valido.' },
        { status: 400 }
      );
    }

    if (!subject || typeof subject !== 'string' || subject.trim().length < 2) {
      return NextResponse.json(
        { error: 'L\'oggetto del messaggio è obbligatorio.' },
        { status: 400 }
      );
    }

    if (!message || typeof message !== 'string' || message.trim().length < 5) {
      return NextResponse.json(
        { error: 'Il messaggio deve contenere almeno 5 caratteri.' },
        { status: 400 }
      );
    }

    const cleanName = rawName.trim();
    const cleanEmail = rawEmail.trim().toLowerCase();
    const cleanSubject = subject.trim();
    const cleanMessage = message.trim();
    const effectiveUserAgent = userAgent || 'unknown';

    // 4. Insert into Supabase support_messages table
    const nowIso = new Date().toISOString();
    const insertPayload = {
      customer_name: cleanName,
      customer_email: cleanEmail,
      subject: cleanSubject,
      message: cleanMessage,
      status: 'unread',
      ip_address: ipAddress,
      user_agent: effectiveUserAgent,
      metadata: {
        source: 'contact_form',
        submitted_at: nowIso,
        ...(typeof metadata === 'object' && metadata !== null ? metadata : {}),
      },
    };

    const { data: ticketRecord, error: dbError } = await supabaseAdmin
      .from('support_messages')
      .insert(insertPayload)
      .select()
      .single();

    if (dbError || !ticketRecord) {
      console.error('❌ Errore inserimento messaggio di supporto in Supabase:', dbError);
      return NextResponse.json(
        { error: 'Si è verificato un errore durante l\'invio del messaggio. Riprova più tardi.' },
        { status: 500 }
      );
    }

    // 5. Send Admin Alert Email via Resend
    try {
      await sendSupportAdminNotificationEmail({
        ticketId: ticketRecord.id,
        customerName: cleanName,
        customerEmail: cleanEmail,
        subject: cleanSubject,
        message: cleanMessage,
        ipAddress,
        userAgent: effectiveUserAgent,
        createdAt: ticketRecord.created_at || nowIso,
      });
    } catch (emailError) {
      console.warn('⚠️ Errore non bloccante durante l\'invio dell\'email di notifica admin:', emailError);
    }

    // 6. Return Success Response
    return NextResponse.json(
      {
        success: true,
        message: 'Messaggio inviato con successo',
        ticket_id: ticketRecord.id,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('❌ Eccezione non gestita in /api/contact:', error);
    return NextResponse.json(
      { error: error?.message || 'Errore interno del server' },
      { status: 500 }
    );
  }
}
