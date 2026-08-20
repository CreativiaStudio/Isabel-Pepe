import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { isBotUserAgent } from '@/lib/bot-filter';

export async function POST(req: Request) {
  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Formato richiesta non valido' }, { status: 400 });
    }

    const {
      email,
      gdprConsent,
      consent,
      gdpr_consent,
      source: rawSource,
      firstName,
      first_name,
      lastName,
      last_name,
      phone,
      utmSource,
      utm_source,
      utmMedium,
      utm_medium,
      utmCampaign,
      utm_campaign,
      utmContent,
      utm_content,
      utmTerm,
      utm_term,
      visitorId,
      visitor_id,
      consentId,
      consent_id,
      website_url,
      website_hp,
      confirm_hp,
    } = body || {};

    // 1. Honeypot & Bot Trapping
    const honeypot = website_url || website_hp || confirm_hp;
    const isHoneypotFilled = Boolean(honeypot && String(honeypot).trim().length > 0);

    const userAgent = req.headers.get('user-agent') || '';
    const isKnownCrawler = Boolean(
      userAgent && /googlebot|bingbot|yandex|baiduspider|ahrefsbot|semrushbot|bytespider|gptbot|claudebot|ccbot|anthropic/i.test(userAgent)
    );

    if (isHoneypotFilled || isKnownCrawler) {
      return NextResponse.json({
        success: true,
        message: 'Iscrizione completata',
        coupon: 'PRIVILEGE10',
      });
    }

    // 2. GDPR Consent Validation
    const hasConsent = gdprConsent === true || consent === true || gdpr_consent === true || gdprConsent === 'true';
    if (!hasConsent) {
      return NextResponse.json(
        { error: 'Consenso GDPR obbligatorio' },
        { status: 400 }
      );
    }

    // 3. Email Validation
    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return NextResponse.json(
        { error: 'Email non valida' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const source = rawSource === 'popup_vip' ? 'popup_vip' : (rawSource || 'footer');
    const subscriberFirstName = (firstName || first_name || '').trim() || null;
    const subscriberLastName = (lastName || last_name || '').trim() || null;
    const subscriberPhone = (phone || '').trim() || null;
    const finalUtmSource = utmSource || utm_source || null;
    const finalUtmMedium = utmMedium || utm_medium || null;
    const finalUtmCampaign = utmCampaign || utm_campaign || null;
    const finalUtmContent = utmContent || utm_content || null;
    const finalUtmTerm = utmTerm || utm_term || null;
    const finalVisitorId = visitorId || visitor_id || null;
    const finalConsentId = consentId || consent_id || null;

    // 4. Header Extraction for GDPR Audit Trail
    const ipAddress =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      req.headers.get('cf-connecting-ip') ||
      'unknown';
    const effectiveUserAgent = userAgent || 'unknown';

    // 5. Idempotent Upsert into newsletter_subscribers
    const nowIso = new Date().toISOString();
    const subscriberRecord = {
      email: normalizedEmail,
      first_name: subscriberFirstName,
      last_name: subscriberLastName,
      phone: subscriberPhone,
      source: source,
      is_active: true,
      consent_given_at: nowIso,
      ip_address: ipAddress,
      user_agent: effectiveUserAgent,
      visitor_id: finalVisitorId,
      consent_id: finalConsentId,
      utm_source: finalUtmSource,
      utm_medium: finalUtmMedium,
      utm_campaign: finalUtmCampaign,
      utm_content: finalUtmContent,
      utm_term: finalUtmTerm,
      updated_at: nowIso,
    };

    const { error: subscriberError } = await supabaseAdmin
      .from('newsletter_subscribers')
      .upsert(subscriberRecord, { onConflict: 'email' });

    if (subscriberError) {
      console.error('Error upserting newsletter subscriber in Supabase:', subscriberError);
      return NextResponse.json(
        { error: 'Errore durante la registrazione al Club Privé' },
        { status: 500 }
      );
    }

    // 6. Synchronize with crm_contacts
    try {
      const { data: existingContact } = await supabaseAdmin
        .from('crm_contacts')
        .select('tags, first_name, last_name, phone')
        .eq('email', normalizedEmail)
        .maybeSingle();

      const existingTags: string[] = Array.isArray(existingContact?.tags) ? existingContact.tags : [];
      const mergedTags = Array.from(
        new Set([
          ...existingTags,
          'isabel-pepe',
          'privilege-club',
          'newsletter',
          'gdpr-marketing-ok',
        ])
      );

      await supabaseAdmin
        .from('crm_contacts')
        .upsert(
          {
            email: normalizedEmail,
            first_name: subscriberFirstName || existingContact?.first_name || null,
            last_name: subscriberLastName || existingContact?.last_name || null,
            phone: subscriberPhone || existingContact?.phone || null,
            visitor_id: finalVisitorId,
            consent_id: finalConsentId,
            marketing_consent: true,
            tags: mergedTags,
            status: 'lead',
            last_synced_at: nowIso,
            updated_at: nowIso,
          },
          { onConflict: 'email' }
        );
    } catch (crmErr) {
      console.error('Error syncing CRM contact:', crmErr);
    }

    // 7. Synchronize with customers (add 'Club Privé' tag if customer exists)
    try {
      const { data: existingCustomer } = await supabaseAdmin
        .from('customers')
        .select('id, tags')
        .eq('email', normalizedEmail)
        .maybeSingle();

      if (existingCustomer) {
        let customerTags: string[] = [];
        if (Array.isArray(existingCustomer.tags)) {
          customerTags = existingCustomer.tags;
        } else if (typeof existingCustomer.tags === 'string') {
          try {
            const parsed = JSON.parse(existingCustomer.tags);
            if (Array.isArray(parsed)) customerTags = parsed;
          } catch {
            customerTags = [existingCustomer.tags];
          }
        }

        if (!customerTags.includes('Club Privé') && !customerTags.includes('club-prive')) {
          const updatedTags = [...customerTags, 'Club Privé'];
          await supabaseAdmin
            .from('customers')
            .update({ tags: updatedTags })
            .eq('id', existingCustomer.id);
        }
      }
    } catch (custErr) {
      console.error('Error updating customer Club Privé tag:', custErr);
    }

    // 8. Trigger Haute Joaillerie Welcome Email (Resend) if module is present
    try {
      const emailModule = await import('@/lib/email');
      if (typeof (emailModule as any).sendPrivilegeWelcomeEmail === 'function') {
        await (emailModule as any).sendPrivilegeWelcomeEmail({
          to: normalizedEmail,
          customerEmail: normalizedEmail,
          customerName: subscriberFirstName
            ? `${subscriberFirstName}${subscriberLastName ? ` ${subscriberLastName}` : ''}`
            : undefined,
          couponCode: 'PRIVILEGE10',
        });
      }
    } catch (emailErr) {
      console.warn('Welcome email trigger skipped or error (non-fatal):', emailErr);
    }

    // 9. Return Luxury Welcome Response
    return NextResponse.json({
      success: true,
      message: 'Benvenuta nel Privilege Club',
      coupon: 'PRIVILEGE10',
    });
  } catch (error: any) {
    console.error('Newsletter subscribe endpoint error:', error);
    return NextResponse.json(
      { error: error?.message || 'Errore interno del server' },
      { status: 500 }
    );
  }
}
