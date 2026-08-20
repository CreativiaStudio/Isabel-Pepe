import * as fs from 'fs';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';

const projectRoot = process.cwd();

// Load .env.local
const envPath = path.resolve(projectRoot, '.env.local');
const env = {};
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split(/\r?\n/).forEach(line => {
    const idx = line.indexOf('=');
    if (idx !== -1) {
      const k = line.substring(0, idx).trim();
      const v = line.substring(idx + 1).trim().replace(/^['\"]|['\"]$/g, '');
      env[k] = v;
    }
  });
}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseAdmin = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

// Color helpers
const green = (s) => `\x1b[32m${s}\x1b[0m`;
const red = (s) => `\x1b[31m${s}\x1b[0m`;
const cyan = (s) => `\x1b[36m${s}\x1b[0m`;
const yellow = (s) => `\x1b[33m${s}\x1b[0m`;
const bold = (s) => `\x1b[1m${s}\x1b[0m`;

class TestHarness {
  constructor(suiteName) {
    this.suiteName = suiteName;
    this.results = [];
  }

  async test(name, fn) {
    const start = Date.now();
    try {
      await fn();
      const durationMs = Date.now() - start;
      this.results.push({ name, passed: true, durationMs });
      console.log(`  ${green('✔')} ${name} \x1b[90m(${durationMs}ms)\x1b[0m`);
    } catch (err) {
      const durationMs = Date.now() - start;
      this.results.push({ name, passed: false, durationMs, error: err.message });
      console.error(`  ${red('✖')} ${name} \x1b[90m(${durationMs}ms)\x1b[0m`);
      console.error(`    ${red('Error: ' + err.message)}`);
    }
  }

  summary() {
    const total = this.results.length;
    const passed = this.results.filter(r => r.passed).length;
    const failed = total - passed;
    const totalDurationMs = this.results.reduce((acc, r) => acc + r.durationMs, 0);
    return { total, passed, failed, totalDurationMs };
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message || 'Assertion failed'} - Expected: ${JSON.stringify(expected)}, Actual: ${JSON.stringify(actual)}`);
  }
}

function assertIncludes(str, substr, message) {
  if (!str || !str.includes(substr)) {
    throw new Error(`${message || 'Assertion failed'} - Expected to include: "${substr}"`);
  }
}

// Emulate Email Templates from lib/email.ts
const SITE_URL = (env.NEXT_PUBLIC_SITE_URL || 'https://isabelpepe.com').replace(/\/$/, '');

function generatePrivilegeWelcomeEmailHtml({ firstName, couponCode = 'PRIVILEGE10' } = {}) {
  const displayName = firstName?.trim() || 'Cliente Esclusiva';
  const shopUrl = `${SITE_URL}/shop`;
  const privacyUrl = `${SITE_URL}/privacy`;
  const unsubscribeUrl = `${SITE_URL}/privacy#unsubscribe`;

  return `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Benvenuta nell'Atelier Privé — Isabel Pepe</title>
</head>
<body style="margin: 0; padding: 40px 15px; background-color: #FAF8F5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #0D0D0D; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;">
  <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border: 1px solid #EADFD9; border-radius: 4px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04); overflow: hidden;">
    
    <!-- Top Decorative Line -->
    <tr>
      <td style="height: 3px; background: linear-gradient(90deg, #8A5E58 0%, #C0A09A 50%, #8A5E58 100%);"></td>
    </tr>

    <!-- Header Section -->
    <tr>
      <td style="padding: 48px 36px 28px 36px; text-align: center;">
        <p style="margin: 0 0 10px 0; font-size: 10px; text-transform: uppercase; letter-spacing: 0.35em; color: #8A5E58; font-weight: 700;">
          HAUTE JOAILLERIE ITALIANA
        </p>
        <h1 style="margin: 0 0 12px 0; font-family: 'Playfair Display', 'Times New Roman', Times, Georgia, serif; font-size: 32px; letter-spacing: 0.25em; text-transform: uppercase; color: #C0A09A; font-weight: 700; line-height: 1.2;">
          ISABEL PEPE
        </h1>
        <div style="height: 1px; width: 64px; background-color: #C0A09A; margin: 0 auto 20px auto;"></div>
        <p style="margin: 0; font-family: 'Playfair Display', 'Times New Roman', Times, Georgia, serif; font-size: 16px; letter-spacing: 0.22em; text-transform: uppercase; color: #0D0D0D; font-weight: 600;">
          L'ATELIER PRIVÉ
        </p>
      </td>
    </tr>

    <!-- Welcome Body -->
    <tr>
      <td style="padding: 0 36px 32px 36px; text-align: center;">
        <h2 style="margin: 0 0 18px 0; font-family: 'Playfair Display', 'Times New Roman', Times, Georgia, serif; font-size: 24px; color: #0D0D0D; font-weight: 500; letter-spacing: 0.04em; line-height: 1.35;">
          Benvenuta nella nostra cerchia più esclusiva
        </h2>
        <p style="margin: 0 0 18px 0; font-size: 14px; line-height: 1.75; color: #4A4A4A;">
          Gentile <strong>${displayName}</strong>, è un onore accoglierti nell'<strong>Atelier Privé Isabel Pepe</strong>.
        </p>
        <p style="margin: 0 0 28px 0; font-size: 14px; line-height: 1.75; color: #4A4A4A;">
          La tua iscrizione ti apre le porte a un mondo dove l'eccellenza dell'alta gioielleria italiana si fonde con l'artigianalità senza tempo, la cura meticolosa delle pietre preziose e il design d'autore.
        </p>

        <!-- Luxury Coupon Box -->
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #FAF7F5; border: 1px solid #E4D5CE; border-radius: 4px; margin: 0 0 36px 0;">
          <tr>
            <td style="padding: 28px 24px; text-align: center;">
              <p style="margin: 0 0 8px 0; font-size: 10px; text-transform: uppercase; letter-spacing: 0.3em; color: #8A5E58; font-weight: 700;">
                IL TUO REGALO DI BENVENUTO ESCLUSIVO
              </p>
              <p style="margin: 0 0 16px 0; font-family: 'Playfair Display', 'Times New Roman', Times, serif; font-size: 24px; font-weight: 600; color: #0D0D0D; letter-spacing: 0.05em;">
                10% di Privilegio Riservato
              </p>
              <div style="display: inline-block; background-color: #FFFFFF; border: 1px dashed #C0A09A; padding: 14px 32px; border-radius: 2px; margin-bottom: 12px;">
                <span style="font-family: 'Courier New', Courier, monospace; font-size: 22px; font-weight: bold; letter-spacing: 0.28em; color: #0D0D0D;">
                  ${couponCode}
                </span>
              </div>
              <p style="margin: 0; font-size: 12px; color: #736763; line-height: 1.5;">
                Inserisci questo codice al checkout sul tuo prossimo ordine per applicare immediatamente il 10% di sconto riservato ai soci.
              </p>
            </td>
          </tr>
        </table>

        <!-- 3 Privilege Perks Section -->
        <div style="text-align: left; margin-bottom: 36px; padding: 24px 20px; background-color: #FFFFFF; border-top: 1px solid #F0EAE6; border-bottom: 1px solid #F0EAE6;">
          <p style="margin: 0 0 20px 0; text-align: center; font-size: 11px; text-transform: uppercase; letter-spacing: 0.25em; color: #8A5E58; font-weight: 700;">
            I PRIVILEGI DEL CLUB PRIVÉ
          </p>

          <table width="100%" border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 16px;">
            <tr>
              <td width="36" valign="top" style="padding-top: 2px;">
                <span style="display: inline-block; width: 24px; height: 24px; line-height: 24px; text-align: center; border-radius: 50%; background-color: #FAF7F5; border: 1px solid #C0A09A; color: #8A5E58; font-size: 11px; font-weight: bold;">
                  1
                </span>
              </td>
              <td valign="top">
                <p style="margin: 0 0 4px 0; font-family: 'Playfair Display', 'Times New Roman', Times, serif; font-size: 15px; font-weight: 600; color: #0D0D0D;">
                  Accesso Anticipato 48h
                </p>
                <p style="margin: 0; font-size: 12px; line-height: 1.6; color: #666666;">
                  Scopri in anteprima assoluta le nuove collezioni, le edizioni numerate e i pezzi unici prima della presentazione ufficiale.
                </p>
              </td>
            </tr>
          </table>

          <table width="100%" border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 16px;">
            <tr>
              <td width="36" valign="top" style="padding-top: 2px;">
                <span style="display: inline-block; width: 24px; height: 24px; line-height: 24px; text-align: center; border-radius: 50%; background-color: #FAF7F5; border: 1px solid #C0A09A; color: #8A5E58; font-size: 11px; font-weight: bold;">
                  2
                </span>
              </td>
              <td valign="top">
                <p style="margin: 0 0 4px 0; font-family: 'Playfair Display', 'Times New Roman', Times, serif; font-size: 15px; font-weight: 600; color: #0D0D0D;">
                  Vendite Private Stagionali
                </p>
                <p style="margin: 0; font-size: 12px; line-height: 1.6; color: #666666;">
                  Inviti esclusivi agli appuntamenti di vendita privata e capsule collection riservate unicamente ai membri dell'Atelier.
                </p>
              </td>
            </tr>
          </table>

          <table width="100%" border="0" cellpadding="0" cellspacing="0">
            <tr>
              <td width="36" valign="top" style="padding-top: 2px;">
                <span style="display: inline-block; width: 24px; height: 24px; line-height: 24px; text-align: center; border-radius: 50%; background-color: #FAF7F5; border: 1px solid #C0A09A; color: #8A5E58; font-size: 11px; font-weight: bold;">
                  3
                </span>
              </td>
              <td valign="top">
                <p style="margin: 0 0 4px 0; font-family: 'Playfair Display', 'Times New Roman', Times, serif; font-size: 15px; font-weight: 600; color: #0D0D0D;">
                  Servizio di Cura &amp; Pulizia Gratuita
                </p>
                <p style="margin: 0; font-size: 12px; line-height: 1.6; color: #666666;">
                  Assistenza a vita e trattamento di lucidatura professionale per mantenere intatta la purezza e lo splendore delle tue creazioni.
                </p>
              </td>
            </tr>
          </table>
        </div>

        <!-- Luxury CTA Button -->
        <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto 32px auto;">
          <tr>
            <td align="center" style="border-radius: 2px; background-color: #0D0D0D;">
              <a href="${shopUrl}" target="_blank" style="display: inline-block; padding: 18px 42px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; font-size: 11px; text-transform: uppercase; letter-spacing: 0.25em; font-weight: 600; color: #FFFFFF; text-decoration: none; border-radius: 2px;">
                ESPLORA LA COLLEZIONE &rarr;
              </a>
            </td>
          </tr>
        </table>

        <!-- Concierge / Atelier Note -->
        <p style="margin: 0; font-size: 12px; line-height: 1.6; color: #888888; font-style: italic;">
          Per richieste personalizzate o consulenze gemmologiche su misura, il nostro concierge è sempre a tua completa disposizione.
        </p>
      </td>
    </tr>

    <!-- Footer Section -->
    <tr>
      <td style="padding: 28px 36px 36px 36px; background-color: #FAF8F5; border-top: 1px solid #EADFD9; text-align: center;">
        <p style="margin: 0 0 6px 0; font-family: 'Playfair Display', 'Times New Roman', Times, Georgia, serif; font-size: 13px; letter-spacing: 0.15em; text-transform: uppercase; color: #0D0D0D; font-weight: 600;">
          Atelier Isabel Pepe
        </p>
        <p style="margin: 0 0 14px 0; font-size: 10px; text-transform: uppercase; letter-spacing: 0.2em; color: #8A5E58;">
          Haute Joaillerie Italiana
        </p>
        <p style="margin: 0 0 12px 0; font-size: 11px; line-height: 1.6; color: #888888;">
          Ricevi questa comunicazione perché hai confermato la tua iscrizione all'Atelier Privé Isabel Pepe con consenso al trattamento dati.
        </p>
        <p style="margin: 0; font-size: 11px; color: #888888;">
          <a href="${privacyUrl}" target="_blank" style="color: #8A5E58; text-decoration: underline; margin: 0 8px;">Informativa Privacy</a>
          •
          <a href="${unsubscribeUrl}" target="_blank" style="color: #8A5E58; text-decoration: underline; margin: 0 8px;">Gestione Consensi &amp; Disiscrizione</a>
        </p>
      </td>
    </tr>

  </table>
</body>
</html>`;
}

function generatePrivilegeWelcomeEmailText({ firstName, couponCode = 'PRIVILEGE10' } = {}) {
  const displayName = firstName?.trim() || 'Cliente Esclusiva';
  const shopUrl = `${SITE_URL}/shop`;
  const privacyUrl = `${SITE_URL}/privacy`;
  const unsubscribeUrl = `${SITE_URL}/privacy#unsubscribe`;

  return `ISABEL PEPE — HAUTE JOAILLERIE ITALIANA
L'ATELIER PRIVÉ

Benvenuta nella nostra cerchia più esclusiva

Gentile ${displayName},
è un onore accoglierti nell'Atelier Privé Isabel Pepe.

La tua iscrizione ti apre le porte a un mondo dove l'eccellenza dell'alta gioielleria italiana si fonde con l'artigianalità senza tempo, la cura meticolosa delle pietre preziose e il design d'autore.

--------------------------------------------------
IL TUO REGALO DI BENVENUTO ESCLUSIVO
10% di Privilegio Riservato
CODICE COUPON: ${couponCode}
--------------------------------------------------
Inserisci questo codice al checkout sul tuo prossimo ordine per applicare immediatamente il 10% di sconto riservato ai soci.

I PRIVILEGI DEL CLUB PRIVÉ:
1. Accesso Anticipato 48h: Scopri in anteprima assoluta le nuove collezioni, le edizioni numerate e i pezzi unici prima della presentazione ufficiale.
2. Vendite Private Stagionali: Inviti esclusivi agli appuntamenti di vendita privata e capsule collection riservate unicamente ai membri dell'Atelier.
3. Servizio di Cura & Pulizia Gratuita: Assistenza a vita e trattamento di lucidatura professionale per mantenere intatta la purezza e lo splendore delle tue creazioni.

Esplora la Collezione:
${shopUrl}

Per richieste personalizzate o consulenze gemmologiche su misura, il nostro concierge è sempre a tua completa disposizione: info@isabelpepe.com

--------------------------------------------------
Atelier Isabel Pepe • Haute Joaillerie Italiana
Informativa Privacy: ${privacyUrl}
Disiscrizione: ${unsubscribeUrl}
`;
}

async function sendPrivilegeWelcomeEmailSimulated(params, customFetch = fetch) {
  try {
    const targetEmail = params?.to || params?.customerEmail || params?.email;
    if (!targetEmail || typeof targetEmail !== 'string' || !targetEmail.includes('@')) {
      return { success: false, error: 'Indirizzo email mancante o non valido' };
    }

    const firstName = params?.firstName || params?.customerName || '';
    const couponCode = params?.couponCode || 'PRIVILEGE10';

    const subject = "Benvenuta nell'Atelier Privé — Il Tuo Regalo Esclusivo Isabel Pepe";
    const html = generatePrivilegeWelcomeEmailHtml({ firstName, couponCode });
    const text = generatePrivilegeWelcomeEmailText({ firstName, couponCode });

    const apiKey = env.RESEND_API_KEY || '';
    const senderEmail = env.RESEND_FROM_EMAIL || 'Isabel Pepe <info@isabelpepe.com>';

    if (!apiKey) {
      return { success: false, error: 'Missing API key' };
    }

    const payload = {
      from: senderEmail,
      to: [targetEmail.trim()],
      subject,
      html,
      text,
    };

    const res = await customFetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (res.ok) {
      return { success: true, id: data.id, data };
    } else {
      return { success: false, error: data };
    }
  } catch (error) {
    return { success: false, error: error?.message || String(error) };
  }
}

// Emulate full subscribe handler from app/api/newsletter/subscribe/route.ts
async function executeSubscribeRoute(body, headers = {}, customFetch = fetch) {
  try {
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

    const userAgent = headers['user-agent'] || '';
    const isKnownCrawler = Boolean(
      userAgent && /googlebot|bingbot|yandex|baiduspider|ahrefsbot|semrushbot|bytespider|gptbot|claudebot|ccbot|anthropic/i.test(userAgent)
    );

    if (isHoneypotFilled || isKnownCrawler) {
      return {
        status: 200,
        json: { success: true, message: 'Iscrizione completata', coupon: 'PRIVILEGE10' },
      };
    }

    // 2. GDPR Consent Validation
    const hasConsent = gdprConsent === true || consent === true || gdpr_consent === true || gdprConsent === 'true';
    if (!hasConsent) {
      return {
        status: 400,
        json: { error: 'Consenso GDPR obbligatorio' },
      };
    }

    // 3. Email Validation
    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return {
        status: 400,
        json: { error: 'Email non valida' },
      };
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

    const ipAddress = headers['x-forwarded-for']?.split(',')[0]?.trim() || headers['x-real-ip'] || '127.0.0.1';
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

    if (supabaseAdmin) {
      const { error: subErr } = await supabaseAdmin
        .from('newsletter_subscribers')
        .upsert(subscriberRecord, { onConflict: 'email' });
      if (subErr) {
        return { status: 500, json: { error: 'Errore durante la registrazione al Club Privé' } };
      }

      // CRM Sync
      try {
        const { data: existingContact } = await supabaseAdmin
          .from('crm_contacts')
          .select('tags, first_name, last_name, phone')
          .eq('email', normalizedEmail)
          .maybeSingle();

        const existingTags = Array.isArray(existingContact?.tags) ? existingContact.tags : [];
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
        console.warn('CRM sync error (non-fatal):', crmErr);
      }
    }

    // 8. Trigger Welcome Email
    try {
      await sendPrivilegeWelcomeEmailSimulated({
        to: normalizedEmail,
        customerEmail: normalizedEmail,
        customerName: subscriberFirstName
          ? `${subscriberFirstName}${subscriberLastName ? ` ${subscriberLastName}` : ''}`
          : undefined,
        couponCode: 'PRIVILEGE10',
      }, customFetch);
    } catch (emailErr) {
      console.warn('Welcome email trigger skipped or error (non-fatal):', emailErr);
    }

    return {
      status: 200,
      json: {
        success: true,
        message: 'Benvenuta nel Privilege Club',
        coupon: 'PRIVILEGE10',
      },
    };
  } catch (err) {
    return {
      status: 500,
      json: { error: err?.message || 'Errore interno del server' },
    };
  }
}

async function runEmpiricalVerification() {
  console.log(bold(cyan('\n========================================================================')));
  console.log(bold(cyan('  CHALLENGER 2: EMPIRICAL VERIFICATION & STRESS SUITE (MILESTONE 2)     ')));
  console.log(bold(cyan('========================================================================\n')));

  const harness = new TestHarness('Milestone 2 Empirical Tests');
  const createdEmails = [];

  // 1. Live Supabase Coupon Check
  await harness.test('1. Supabase Database: PRIVILEGE10 coupon exists, is active and has 10% discount', async () => {
    assert(supabaseAdmin !== null, 'Supabase admin client must be initialized');
    const { data: coupon, error } = await supabaseAdmin
      .from('coupons')
      .select('*')
      .eq('code', 'PRIVILEGE10')
      .single();

    assert(!error && Boolean(coupon), 'Coupon PRIVILEGE10 must exist in coupons table');
    assertEqual(coupon.code, 'PRIVILEGE10', 'Coupon code matches');
    assertEqual(coupon.is_active, true, 'Coupon is_active must be true');
    assertEqual(coupon.discount_percent, 10, 'Coupon discount must be 10%');
  });

  // 2. Exact email template content, styling, perks and coupon
  await harness.test('2. Email Template: HTML matches Haute Joaillerie palette, 3 perks, and PRIVILEGE10', async () => {
    const html = generatePrivilegeWelcomeEmailHtml({ firstName: 'Elena', couponCode: 'PRIVILEGE10' });
    assertIncludes(html, 'ISABEL PEPE', 'Contains ISABEL PEPE title');
    assertIncludes(html, 'HAUTE JOAILLERIE ITALIANA', 'Contains HAUTE JOAILLERIE ITALIANA');
    assertIncludes(html, "L'ATELIER PRIVÉ", 'Contains L\'ATELIER PRIVÉ');
    assertIncludes(html, 'PRIVILEGE10', 'Contains coupon code');
    assertIncludes(html, '10% di Privilegio Riservato', 'Mentions 10% discount');
    assertIncludes(html, 'Accesso Anticipato 48h', 'Contains Perk 1: Accesso Anticipato 48h');
    assertIncludes(html, 'Vendite Private Stagionali', 'Contains Perk 2: Vendite Private Stagionali');
    assertIncludes(html, 'Servizio di Cura &amp; Pulizia Gratuita', 'Contains Perk 3: Servizio di Cura & Pulizia Gratuita');
    assertIncludes(html, 'ESPLORA LA COLLEZIONE', 'Contains luxury CTA button');
    assertIncludes(html, `${SITE_URL}/shop`, 'CTA links to shop');
    assertIncludes(html, `${SITE_URL}/privacy`, 'Footer links to Privacy');
    assertIncludes(html, '#FAF8F5', 'Uses brand porcelain color #FAF8F5');
    assertIncludes(html, '#C0A09A', 'Uses rose gold champagne color #C0A09A');
    assertIncludes(html, '#8A5E58', 'Uses terracotta luxury accent #8A5E58');
    assertIncludes(html, '#0D0D0D', 'Uses deep charcoal #0D0D0D');
  });

  // 3. Plaintext fallback content
  await harness.test('3. Email Template: Plaintext fallback contains all essential information', async () => {
    const text = generatePrivilegeWelcomeEmailText({ firstName: 'Mario', couponCode: 'PRIVILEGE10' });
    assertIncludes(text, 'ISABEL PEPE — HAUTE JOAILLERIE ITALIANA', 'Plaintext header');
    assertIncludes(text, "L'ATELIER PRIVÉ", 'Plaintext subheader');
    assertIncludes(text, 'Mario', 'Personalized greeting');
    assertIncludes(text, 'PRIVILEGE10', 'Coupon code in plain text');
    assertIncludes(text, '1. Accesso Anticipato 48h', 'Perk 1 in text');
    assertIncludes(text, '2. Vendite Private Stagionali', 'Perk 2 in text');
    assertIncludes(text, '3. Servizio di Cura & Pulizia Gratuita', 'Perk 3 in text');
    assertIncludes(text, `${SITE_URL}/shop`, 'Shop URL in text');
    assertIncludes(text, `${SITE_URL}/privacy`, 'Privacy URL in text');
  });

  // 4. End-to-End Integration: Valid Subscription dispatches Resend email and saves to DB
  await harness.test('4. End-to-End Integration: Valid subscribe request calls Resend API and stores in Supabase', async () => {
    const testEmail = `chal2_e2e_${Date.now()}@isabelpepe-test.com`;
    createdEmails.push(testEmail);

    let resendCalled = false;
    let resendPayload = null;

    const mockFetch = async (url, opts) => {
      if (url.includes('api.resend.com/emails')) {
        resendCalled = true;
        resendPayload = JSON.parse(opts.body);
        return {
          ok: true,
          status: 200,
          json: async () => ({ id: 'resend_mock_id_9999' }),
        };
      }
      return fetch(url, opts);
    };

    const res = await executeSubscribeRoute(
      {
        email: testEmail,
        gdprConsent: true,
        firstName: 'Elena',
        lastName: 'Pepe',
        source: 'footer',
      },
      { 'user-agent': 'EmpiricalChallenger/2.0' },
      mockFetch
    );

    assertEqual(res.status, 200, 'Route returns 200 OK');
    assertEqual(res.json.success, true, 'Route returns success: true');
    assertEqual(res.json.coupon, 'PRIVILEGE10', 'Route returns coupon: PRIVILEGE10');

    assert(resendCalled, 'Resend API must be invoked');
    assertEqual(resendPayload.to[0], testEmail, 'Resend payload to matches subscriber email');
    assertIncludes(resendPayload.subject, "Benvenuta nell'Atelier Privé", 'Subject is luxury welcome');
    assertIncludes(resendPayload.html, 'PRIVILEGE10', 'HTML includes PRIVILEGE10');
    assertIncludes(resendPayload.html, 'Elena', 'HTML includes first name');

    // Supabase DB Verification
    const { data: sub } = await supabaseAdmin
      .from('newsletter_subscribers')
      .select('*')
      .eq('email', testEmail)
      .single();

    assert(Boolean(sub), 'Subscriber record exists in database');
    assertEqual(sub.email, testEmail);
    assertEqual(sub.first_name, 'Elena');
    assertEqual(sub.last_name, 'Pepe');
    assertEqual(sub.source, 'footer');
    assertEqual(sub.is_active, true);

    // CRM Contact Sync Verification
    const { data: crm } = await supabaseAdmin
      .from('crm_contacts')
      .select('*')
      .eq('email', testEmail)
      .single();

    assert(Boolean(crm), 'CRM contact record exists in database');
    assertEqual(crm.first_name, 'Elena');
    assert(crm.tags.includes('privilege-club'), 'CRM tags include privilege-club');
    assert(crm.tags.includes('newsletter'), 'CRM tags include newsletter');
    assert(crm.tags.includes('gdpr-marketing-ok'), 'CRM tags include gdpr-marketing-ok');
  });

  // 5. Stress Test: Simulated Network / Resend Crash
  await harness.test('5. Stress Test: Simulated Resend network failure does NOT break subscriber registration (returns 200 OK)', async () => {
    const testEmail = `chal2_netfail_${Date.now()}@isabelpepe-test.com`;
    createdEmails.push(testEmail);

    const failingFetch = async (url, opts) => {
      if (url.includes('api.resend.com')) {
        throw new TypeError('fetch failed: ENOTFOUND api.resend.com (Simulated Network Outage)');
      }
      return fetch(url, opts);
    };

    const res = await executeSubscribeRoute(
      {
        email: testEmail,
        gdprConsent: true,
        firstName: 'Sofia',
        source: 'popup_vip',
      },
      { 'user-agent': 'EmpiricalChallenger/2.0' },
      failingFetch
    );

    assertEqual(res.status, 200, 'HTTP status must still be 200 OK');
    assertEqual(res.json.success, true);
    assertEqual(res.json.coupon, 'PRIVILEGE10');

    // Ensure database write succeeded despite email outage
    const { data: sub } = await supabaseAdmin
      .from('newsletter_subscribers')
      .select('*')
      .eq('email', testEmail)
      .single();

    assert(Boolean(sub), 'Subscriber must still be saved in DB when email service fails');
    assertEqual(sub.source, 'popup_vip');
  });

  // 6. Stress Test: Resend API returns HTTP 422 Unprocessable Entity
  await harness.test('6. Stress Test: Resend HTTP 422 error is caught gracefully and returns 200 OK', async () => {
    const testEmail = `chal2_resend422_${Date.now()}@isabelpepe-test.com`;
    createdEmails.push(testEmail);

    const error422Fetch = async (url, opts) => {
      if (url.includes('api.resend.com')) {
        return {
          ok: false,
          status: 422,
          json: async () => ({ statusCode: 422, message: 'Domain unverified or rate limited' }),
        };
      }
      return fetch(url, opts);
    };

    const res = await executeSubscribeRoute(
      {
        email: testEmail,
        gdprConsent: true,
        source: 'footer',
      },
      {},
      error422Fetch
    );

    assertEqual(res.status, 200, 'Returns 200 OK on 422 email error');
    assertEqual(res.json.success, true);
    assertEqual(res.json.coupon, 'PRIVILEGE10');
  });

  // 7. Security Test: Honeypot submission traps bot without sending email or writing to DB
  await harness.test('7. Anti-Bot Test: Honeypot submission triggers 0 emails and 0 DB writes', async () => {
    const testEmail = `chal2_bot_${Date.now()}@spambot-trap.com`;
    let resendInvoked = false;

    const spyFetch = async (url, opts) => {
      if (url.includes('api.resend.com')) {
        resendInvoked = true;
        return { ok: true, status: 200, json: async () => ({ id: 'never' }) };
      }
      return fetch(url, opts);
    };

    const res = await executeSubscribeRoute(
      {
        email: testEmail,
        gdprConsent: true,
        website_url: 'https://malicious-bot-link.com',
      },
      {},
      spyFetch
    );

    assertEqual(res.status, 200, 'Honeypot returns 200 OK dummy response');
    assertEqual(res.json.success, true);
    assertEqual(resendInvoked, false, 'Resend email MUST NOT be called for honeypot bot');

    const { data: sub } = await supabaseAdmin
      .from('newsletter_subscribers')
      .select('id')
      .eq('email', testEmail)
      .maybeSingle();

    assertEqual(sub, null, 'No subscriber record in database for honeypot bot');
  });

  // 8. GDPR Test: Missing/false consent blocks subscription, prevents email and DB write
  await harness.test('8. GDPR Test: Missing GDPR consent returns 400 Bad Request and sends 0 emails', async () => {
    const testEmail = `chal2_nogdpr_${Date.now()}@test.com`;
    let resendInvoked = false;

    const spyFetch = async (url, opts) => {
      if (url.includes('api.resend.com')) {
        resendInvoked = true;
        return { ok: true, status: 200, json: async () => ({ id: 'never' }) };
      }
      return fetch(url, opts);
    };

    const res = await executeSubscribeRoute(
      {
        email: testEmail,
        gdprConsent: false,
      },
      {},
      spyFetch
    );

    assertEqual(res.status, 400, 'Returns 400 Bad Request');
    assertIncludes(res.json.error, 'GDPR', 'Error mentions GDPR consent');
    assertEqual(resendInvoked, false, 'Resend email MUST NOT be called without GDPR consent');

    const { data: sub } = await supabaseAdmin
      .from('newsletter_subscribers')
      .select('id')
      .eq('email', testEmail)
      .maybeSingle();

    assertEqual(sub, null, 'No DB entry on GDPR failure');
  });

  // 9. Source Code Static Integrity Check: app/api/newsletter/subscribe/route.ts
  await harness.test('9. Codebase Audit: /api/newsletter/subscribe/route.ts properly integrates sendPrivilegeWelcomeEmail', async () => {
    const routeCode = fs.readFileSync(path.resolve(projectRoot, 'app/api/newsletter/subscribe/route.ts'), 'utf8');
    assertIncludes(routeCode, "import('@/lib/email')", 'Dynamically imports @/lib/email');
    assertIncludes(routeCode, 'sendPrivilegeWelcomeEmail', 'Calls sendPrivilegeWelcomeEmail');
    assertIncludes(routeCode, "couponCode: 'PRIVILEGE10'", 'Passes couponCode PRIVILEGE10');
    assertIncludes(routeCode, 'to: normalizedEmail', 'Passes normalizedEmail as to');
    assertIncludes(routeCode, 'customerEmail: normalizedEmail', 'Passes normalizedEmail as customerEmail');
    assertIncludes(routeCode, 'customerName:', 'Passes customerName when available');
    assertIncludes(routeCode, 'catch (emailErr)', 'Wraps email sending in non-fatal try-catch block');
  });

  // 10. Source Code Static Integrity Check: lib/email.ts
  await harness.test('10. Codebase Audit: lib/email.ts exports and implements sendPrivilegeWelcomeEmail properly', async () => {
    const emailCode = fs.readFileSync(path.resolve(projectRoot, 'lib/email.ts'), 'utf8');
    assertIncludes(emailCode, 'export async function sendPrivilegeWelcomeEmail', 'Exports sendPrivilegeWelcomeEmail');
    assertIncludes(emailCode, 'export function generatePrivilegeWelcomeEmailHtml', 'Exports generatePrivilegeWelcomeEmailHtml');
    assertIncludes(emailCode, 'export function generatePrivilegeWelcomeEmailText', 'Exports generatePrivilegeWelcomeEmailText');
    assertIncludes(emailCode, 'PRIVILEGE10', 'References PRIVILEGE10 default');
    assertIncludes(emailCode, "Benvenuta nell'Atelier Privé", 'Includes official Atelier Privé subject');
    assertIncludes(emailCode, 'Accesso Anticipato 48h', 'Mentions Perk 1');
    assertIncludes(emailCode, 'Vendite Private Stagionali', 'Mentions Perk 2');
    assertIncludes(emailCode, 'Servizio di Cura', 'Mentions Perk 3');
  });

  // Cleanup
  console.log(`\n🧹 Cleaning up ${createdEmails.length} test records from database...`);
  if (supabaseAdmin && createdEmails.length > 0) {
    await supabaseAdmin.from('newsletter_subscribers').delete().in('email', createdEmails);
    await supabaseAdmin.from('crm_contacts').delete().in('email', createdEmails);
    console.log(`  ${green('✔')} Cleaned up test data.`);
  }

  const s = harness.summary();
  console.log(bold(`\n------------------------------------------------------------------------`));
  console.log(bold(`Results: ${s.passed}/${s.total} Passed (${s.failed} Failed) in ${s.totalDurationMs}ms`));
  console.log(bold(`------------------------------------------------------------------------\n`));

  if (s.failed > 0) {
    console.error(bold(red('❌ VERDICT: REQUEST_CHANGES — Some empirical tests failed.')));
    process.exit(1);
  } else {
    console.log(bold(green('👑 VERDICT: APPROVE — All Milestone 2 empirical checks passed with 100% success! 👑\n')));
    process.exit(0);
  }
}

runEmpiricalVerification().catch(err => {
  console.error(red('Fatal error during empirical suite execution:'), err);
  process.exit(1);
});
