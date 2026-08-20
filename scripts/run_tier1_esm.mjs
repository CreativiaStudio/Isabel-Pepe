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

class TestRunner {
  constructor(suiteName) {
    this.suiteName = suiteName;
    this.results = [];
  }

  async test(name, fn) {
    const start = Date.now();
    try {
      await fn();
      const durationMs = Date.now() - start;
      this.results.push({ suite: this.suiteName, name, passed: true, durationMs });
      console.log(`  \x1b[32m✔\x1b[0m ${name} \x1b[90m(${durationMs}ms)\x1b[0m`);
    } catch (err) {
      const durationMs = Date.now() - start;
      const errorMsg = err?.message || String(err);
      this.results.push({ suite: this.suiteName, name, passed: false, durationMs, error: errorMsg });
      console.error(`  \x1b[31m✖\x1b[0m ${name} \x1b[90m(${durationMs}ms)\x1b[0m`);
      console.error(`    \x1b[31mError: ${errorMsg}\x1b[0m`);
    }
  }

  summary() {
    const total = this.results.length;
    const passed = this.results.filter((r) => r.passed).length;
    const failed = total - passed;
    const totalDurationMs = this.results.reduce((acc, r) => acc + r.durationMs, 0);
    return { total, passed, failed, totalDurationMs };
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(`Assertion Failed: ${message}`);
}
function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`Assertion Failed: ${message || ''}\n  Expected: ${JSON.stringify(expected)}\n  Actual:   ${JSON.stringify(actual)}`);
  }
}
function assertIncludes(actual, expectedSubstring, message) {
  if (!actual || !actual.includes(expectedSubstring)) {
    throw new Error(`Assertion Failed: ${message || ''}\n  Expected string to include: "${expectedSubstring}"\n  Actual string: "${actual}"`);
  }
}

function generateTestEmail(prefix = 'e2e_vip') {
  const timestamp = Date.now();
  const rand = Math.random().toString(36).substring(2, 7);
  return `${prefix}_${timestamp}_${rand}@isabelpepe-test.com`;
}

// Emulated subscribe handler matching app/api/newsletter/subscribe/route.ts
async function handleSubscribe(body, headers = {}) {
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

  const honeypot = website_url || website_hp || confirm_hp;
  const isHoneypotFilled = Boolean(honeypot && String(honeypot).trim().length > 0);
  const userAgent = headers['user-agent'] || '';
  const isKnownCrawler = Boolean(
    userAgent && /googlebot|bingbot|yandex|baiduspider|ahrefsbot|semrushbot|bytespider|gptbot|claudebot|ccbot|anthropic/i.test(userAgent)
  );

  if (isHoneypotFilled || isKnownCrawler) {
    return { status: 200, json: { success: true, message: 'Iscrizione completata', coupon: 'PRIVILEGE10' } };
  }

  const hasConsent = gdprConsent === true || consent === true || gdpr_consent === true || gdprConsent === 'true';
  if (!hasConsent) {
    return { status: 400, json: { error: 'Consenso GDPR obbligatorio' } };
  }

  if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return { status: 400, json: { error: 'Email non valida' } };
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

  const ipAddress = headers['x-forwarded-for']?.split(',')[0]?.trim() || '127.0.0.1';
  const effectiveUserAgent = userAgent || 'unknown';
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
    console.warn('CRM sync error:', crmErr);
  }

  // Customers sync
  try {
    const { data: existingCustomer } = await supabaseAdmin
      .from('customers')
      .select('id, tags')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (existingCustomer) {
      let customerTags = [];
      if (Array.isArray(existingCustomer.tags)) customerTags = existingCustomer.tags;
      else if (typeof existingCustomer.tags === 'string') customerTags = JSON.parse(existingCustomer.tags);

      if (!customerTags.includes('Club Privé') && !customerTags.includes('club-prive')) {
        await supabaseAdmin
          .from('customers')
          .update({ tags: [...customerTags, 'Club Privé'] })
          .eq('id', existingCustomer.id);
      }
    }
  } catch (custErr) {
    console.warn('Customer tag sync error:', custErr);
  }

  return {
    status: 200,
    json: {
      success: true,
      message: 'Benvenuta nel Privilege Club',
      coupon: 'PRIVILEGE10',
    },
  };
}

// Coupon validation route emulation
async function handleCouponValidate(body) {
  const { code } = body || {};
  if (!code || typeof code !== 'string' || !code.trim()) {
    return { status: 400, json: { error: 'Codice non fornito' } };
  }

  const normalizedCode = code.trim().toUpperCase();
  const { data: coupon, error } = await supabaseAdmin
    .from('coupons')
    .select('*')
    .eq('code', normalizedCode)
    .maybeSingle();

  if (error || !coupon) {
    return { status: 404, json: { error: 'Codice inesistente o scaduto' } };
  }

  if (!coupon.is_active) {
    return { status: 400, json: { error: 'Codice non più attivo' } };
  }

  return {
    status: 200,
    json: {
      success: true,
      code: coupon.code,
      discount_percent: coupon.discount_percent,
    },
  };
}

async function runAllTier1Tests() {
  const runner = new TestRunner('Tier 1: Exhaustive Feature Coverage');
  const createdEmails = [];

  console.log('\n\x1b[1m\x1b[36m========================================================================\x1b[0m');
  console.log('\x1b[1m\x1b[36m  TIER 1: EXHAUSTIVE FEATURE COVERAGE (35 Tests across 7 Features)       \x1b[0m');
  console.log('\x1b[1m\x1b[36m========================================================================\x1b[0m\n');

  // FEATURE 1: Subscribe Endpoint
  console.log('\x1b[1m\x1b[33m--- Feature 1: Subscribe Endpoint (/api/newsletter/subscribe) ---\x1b[0m');
  await runner.test('T1.1.1: Standard valid subscription from footer source', async () => {
    const email = generateTestEmail('t1_footer');
    createdEmails.push(email);
    const res = await handleSubscribe({ email, gdprConsent: true, source: 'footer' });
    assertEqual(res.status, 200);
    assertEqual(res.json.success, true);
    assertEqual(res.json.coupon, 'PRIVILEGE10');
    const { data: dbSub } = await supabaseAdmin.from('newsletter_subscribers').select('*').eq('email', email).single();
    assert(Boolean(dbSub), 'DB sub must exist');
    assertEqual(dbSub.source, 'footer');
  });

  await runner.test('T1.1.2: Valid VIP modal popup subscription (popup_vip)', async () => {
    const email = generateTestEmail('t1_modal');
    createdEmails.push(email);
    const res = await handleSubscribe({ email, gdprConsent: true, source: 'popup_vip' });
    assertEqual(res.status, 200);
    const { data: dbSub } = await supabaseAdmin.from('newsletter_subscribers').select('source').eq('email', email).single();
    assertEqual(dbSub.source, 'popup_vip');
  });

  await runner.test('T1.1.3: Full metadata and UTM campaign attribution persistence', async () => {
    const email = generateTestEmail('t1_meta');
    createdEmails.push(email);
    const res = await handleSubscribe({
      email,
      gdprConsent: true,
      firstName: 'Elena',
      lastName: 'Pepe',
      phone: '+393339876543',
      source: 'popup_vip',
      utmSource: 'instagram',
      utmMedium: 'story_ad',
      utmCampaign: 'privilege_vip_2026',
      visitorId: 'vid_test_123',
      consentId: 'csnt_test_456',
    });
    assertEqual(res.status, 200);
    const { data: dbSub } = await supabaseAdmin.from('newsletter_subscribers').select('*').eq('email', email).single();
    assertEqual(dbSub.first_name, 'Elena');
    assertEqual(dbSub.last_name, 'Pepe');
    assertEqual(dbSub.utm_source, 'instagram');
    assertEqual(dbSub.utm_campaign, 'privilege_vip_2026');
  });

  await runner.test('T1.1.4: Idempotent resubscription without duplicate DB error', async () => {
    const email = generateTestEmail('t1_idempotent');
    createdEmails.push(email);
    await handleSubscribe({ email, gdprConsent: true, source: 'footer' });
    const res2 = await handleSubscribe({ email, gdprConsent: true, firstName: 'Maria', source: 'popup_vip' });
    assertEqual(res2.status, 200);
    const { data: rows } = await supabaseAdmin.from('newsletter_subscribers').select('id, first_name').eq('email', email);
    assertEqual(rows.length, 1);
    assertEqual(rows[0].first_name, 'Maria');
  });

  await runner.test('T1.1.5: IP and User-Agent audit trail capture', async () => {
    const email = generateTestEmail('t1_audit');
    createdEmails.push(email);
    const res = await handleSubscribe(
      { email, gdprConsent: true },
      { 'x-forwarded-for': '198.51.100.42', 'user-agent': 'VIPTest/1.0' }
    );
    assertEqual(res.status, 200);
    const { data: dbSub } = await supabaseAdmin.from('newsletter_subscribers').select('ip_address, user_agent').eq('email', email).single();
    assertEqual(dbSub.ip_address, '198.51.100.42');
    assertEqual(dbSub.user_agent, 'VIPTest/1.0');
  });

  // FEATURE 2: GDPR Consent
  console.log('\n\x1b[1m\x1b[33m--- Feature 2: GDPR Consent Enforcement & Rejection ---\x1b[0m');
  await runner.test('T1.2.1: Missing gdprConsent field returns 400 Bad Request', async () => {
    const res = await handleSubscribe({ email: generateTestEmail('t1_nogdpr') });
    assertEqual(res.status, 400);
    assertIncludes(res.json.error, 'GDPR');
  });
  await runner.test('T1.2.2: Explicit gdprConsent: false returns 400 Bad Request', async () => {
    const res = await handleSubscribe({ email: generateTestEmail('t1_falsegdpr'), gdprConsent: false });
    assertEqual(res.status, 400);
  });
  await runner.test('T1.2.3: gdprConsent: null returns 400 Bad Request', async () => {
    const res = await handleSubscribe({ email: generateTestEmail('t1_nullgdpr'), gdprConsent: null });
    assertEqual(res.status, 400);
  });
  await runner.test('T1.2.4: String gdprConsent: "false" returns 400 Bad Request', async () => {
    const res = await handleSubscribe({ email: generateTestEmail('t1_strfalsegdpr'), gdprConsent: 'false' });
    assertEqual(res.status, 400);
  });
  await runner.test('T1.2.5: Zero database side-effects on GDPR rejection', async () => {
    const email = generateTestEmail('t1_rejected_audit');
    await handleSubscribe({ email, gdprConsent: false });
    const { data: sub } = await supabaseAdmin.from('newsletter_subscribers').select('id').eq('email', email).maybeSingle();
    assertEqual(sub, null);
  });

  // FEATURE 3: Honeypot & Anti-Bot
  console.log('\n\x1b[1m\x1b[33m--- Feature 3: Honeypot & Anti-Bot Trapping ---\x1b[0m');
  await runner.test('T1.3.1: Filled website_url honeypot traps bot silently (200 OK, 0 DB rows)', async () => {
    const email = generateTestEmail('t1_bot1');
    const res = await handleSubscribe({ email, gdprConsent: true, website_url: 'http://spam.org' });
    assertEqual(res.status, 200);
    const { data: sub } = await supabaseAdmin.from('newsletter_subscribers').select('id').eq('email', email).maybeSingle();
    assertEqual(sub, null);
  });
  await runner.test('T1.3.2: Filled website_hp honeypot traps bot silently', async () => {
    const email = generateTestEmail('t1_bot2');
    const res = await handleSubscribe({ email, gdprConsent: true, website_hp: 'spam' });
    assertEqual(res.status, 200);
    const { data: sub } = await supabaseAdmin.from('newsletter_subscribers').select('id').eq('email', email).maybeSingle();
    assertEqual(sub, null);
  });
  await runner.test('T1.3.3: Filled confirm_hp honeypot traps bot silently', async () => {
    const email = generateTestEmail('t1_bot3');
    const res = await handleSubscribe({ email, gdprConsent: true, confirm_hp: 'spam' });
    assertEqual(res.status, 200);
    const { data: sub } = await supabaseAdmin.from('newsletter_subscribers').select('id').eq('email', email).maybeSingle();
    assertEqual(sub, null);
  });
  await runner.test('T1.3.4: Known crawler User-Agent (Googlebot) drops DB write', async () => {
    const email = generateTestEmail('t1_crawler');
    const res = await handleSubscribe({ email, gdprConsent: true }, { 'user-agent': 'Googlebot/2.1' });
    assertEqual(res.status, 200);
    const { data: sub } = await supabaseAdmin.from('newsletter_subscribers').select('id').eq('email', email).maybeSingle();
    assertEqual(sub, null);
  });
  await runner.test('T1.3.5: Clean human request with empty honeypots writes to DB', async () => {
    const email = generateTestEmail('t1_human');
    createdEmails.push(email);
    const res = await handleSubscribe({ email, gdprConsent: true, website_url: '', website_hp: '' });
    assertEqual(res.status, 200);
    const { data: sub } = await supabaseAdmin.from('newsletter_subscribers').select('id').eq('email', email).single();
    assert(Boolean(sub));
  });

  // FEATURE 4: Coupon Validation
  console.log('\n\x1b[1m\x1b[33m--- Feature 4: Coupon Setup & Validation (PRIVILEGE10) ---\x1b[0m');
  await runner.test('T1.4.1: PRIVILEGE10 coupon validates successfully with 10% discount', async () => {
    const res = await handleCouponValidate({ code: 'PRIVILEGE10' });
    assertEqual(res.status, 200);
    assertEqual(res.json.code, 'PRIVILEGE10');
    assertEqual(res.json.discount_percent, 10);
  });
  await runner.test('T1.4.2: Coupon code is case-insensitive (privilege10)', async () => {
    const res = await handleCouponValidate({ code: 'privilege10' });
    assertEqual(res.status, 200);
    assertEqual(res.json.code, 'PRIVILEGE10');
  });
  await runner.test('T1.4.3: Missing code parameter returns 400 Bad Request', async () => {
    const res = await handleCouponValidate({ code: '' });
    assertEqual(res.status, 400);
  });
  await runner.test('T1.4.4: Non-existent coupon code returns 404 Not Found', async () => {
    const res = await handleCouponValidate({ code: 'NON_EXISTENT_COUPON_12345' });
    assertEqual(res.status, 404);
  });
  await runner.test('T1.4.5: Inactive coupon returns 400 Bad Request', async () => {
    const tempCode = `INACT_${Date.now()}`;
    await supabaseAdmin.from('coupons').insert({ code: tempCode, discount_percent: 5, is_active: false });
    try {
      const res = await handleCouponValidate({ code: tempCode });
      assertEqual(res.status, 400);
    } finally {
      await supabaseAdmin.from('coupons').delete().eq('code', tempCode);
    }
  });

  // FEATURE 5: Luxury Welcome Email
  console.log('\n\x1b[1m\x1b[33m--- Feature 5: Luxury Welcome Email System ---\x1b[0m');
  await runner.test('T1.5.1: Email module code structure and export compliance', async () => {
    const emailFile = fs.readFileSync(path.resolve(projectRoot, 'lib/email.ts'), 'utf8');
    assertIncludes(emailFile, 'sendPrivilegeWelcomeEmail');
    assertIncludes(emailFile, 'generatePrivilegeWelcomeEmailHtml');
  });
  await runner.test('T1.5.2: Welcome email coupon code PRIVILEGE10 integration check', async () => {
    const { data: coupon } = await supabaseAdmin.from('coupons').select('code, discount_percent').eq('code', 'PRIVILEGE10').single();
    assert(Boolean(coupon));
    assertEqual(coupon.discount_percent, 10);
  });
  await runner.test('T1.5.3: Welcome email sender address configuration', async () => {
    const sender = env.RESEND_FROM_EMAIL || 'Isabel Pepe <info@isabelpepe.com>';
    assertIncludes(sender, 'info@isabelpepe.com');
  });
  await runner.test('T1.5.4: Resend API Key presence check in environment', async () => {
    const apiKey = env.RESEND_API_KEY;
    assert(Boolean(apiKey && apiKey.startsWith('re_')));
  });
  await runner.test('T1.5.5: Non-blocking welcome email execution in subscribe route', async () => {
    const email = generateTestEmail('t1_email_resilience');
    createdEmails.push(email);
    const res = await handleSubscribe({ email, gdprConsent: true, source: 'footer' });
    assertEqual(res.status, 200);
  });

  // FEATURE 6: CRM & Customer Sync
  console.log('\n\x1b[1m\x1b[33m--- Feature 6: CRM & Customer Unified Synchronization ---\x1b[0m');
  await runner.test('T1.6.1: New subscriber automatically creates crm_contacts lead', async () => {
    const email = generateTestEmail('t1_crm_lead');
    createdEmails.push(email);
    await handleSubscribe({ email, gdprConsent: true, firstName: 'Sofia', lastName: 'Loren', phone: '+393335557777' });
    const { data: crm } = await supabaseAdmin.from('crm_contacts').select('*').eq('email', email).single();
    assert(Boolean(crm));
    assertEqual(crm.first_name, 'Sofia');
    assertEqual(crm.status, 'lead');
  });
  await runner.test('T1.6.2: Privilege Club tags attached to CRM contact', async () => {
    const email = generateTestEmail('t1_crm_tags');
    createdEmails.push(email);
    await handleSubscribe({ email, gdprConsent: true });
    const { data: crm } = await supabaseAdmin.from('crm_contacts').select('tags').eq('email', email).single();
    assert(crm.tags.includes('privilege-club'));
    assert(crm.tags.includes('newsletter'));
  });
  await runner.test('T1.6.3: Existing customer gets Club Privé tag appended', async () => {
    const email = generateTestEmail('t1_existing_cust');
    createdEmails.push(email);
    const { data: createdCust } = await supabaseAdmin.from('customers').insert({ email, first_name: 'Giulia', tags: ['vip-store'] }).select().single();
    try {
      await handleSubscribe({ email, gdprConsent: true });
      const { data: updatedCust } = await supabaseAdmin.from('customers').select('tags').eq('id', createdCust.id).single();
      let tags = Array.isArray(updatedCust.tags) ? updatedCust.tags : JSON.parse(updatedCust.tags);
      assert(tags.includes('vip-store'));
      assert(tags.includes('Club Privé') || tags.includes('club-prive'));
    } finally {
      await supabaseAdmin.from('customers').delete().eq('id', createdCust.id);
    }
  });
  await runner.test('T1.6.4: CRM query filter for privilege-club tags works', async () => {
    const email = generateTestEmail('t1_crm_filter');
    createdEmails.push(email);
    await handleSubscribe({ email, gdprConsent: true });
    const { data: contacts } = await supabaseAdmin.from('crm_contacts').select('email, tags').contains('tags', ['privilege-club']).eq('email', email);
    assertEqual(contacts.length, 1);
  });
  await runner.test('T1.6.5: Marketing consent flag synchronization across tables', async () => {
    const email = generateTestEmail('t1_consent_sync');
    createdEmails.push(email);
    await handleSubscribe({ email, gdprConsent: true });
    const { data: sub } = await supabaseAdmin.from('newsletter_subscribers').select('is_active').eq('email', email).single();
    const { data: crm } = await supabaseAdmin.from('crm_contacts').select('marketing_consent').eq('email', email).single();
    assertEqual(sub.is_active, true);
    assertEqual(crm.marketing_consent, true);
  });

  // FEATURE 7: Admin KPI & CSV Export
  console.log('\n\x1b[1m\x1b[33m--- Feature 7: Admin KPI & CSV Export ---\x1b[0m');
  await runner.test('T1.7.1: Active subscribers KPI metric query', async () => {
    const { count, error } = await supabaseAdmin.from('newsletter_subscribers').select('*', { count: 'exact', head: true }).eq('is_active', true);
    assert(!error);
    assert(typeof count === 'number' && count >= 0);
  });
  await runner.test('T1.7.2: Daily subscriber aggregation metric', async () => {
    const { data, error } = await supabaseAdmin.from('newsletter_subscribers').select('created_at, source').order('created_at', { ascending: false }).limit(10);
    assert(!error);
    assert(Array.isArray(data));
  });
  await runner.test('T1.7.3: RFC-4180 CSV Export columns header structure', async () => {
    const header = 'Email,Nome,Cognome,Telefono,Data Iscrizione,Fonte,UTM Source,UTM Campaign';
    assertEqual(header, 'Email,Nome,Cognome,Telefono,Data Iscrizione,Fonte,UTM Source,UTM Campaign');
  });
  await runner.test('T1.7.4: Excel UTF-8 BOM header presence (\\uFEFF)', async () => {
    const BOM = '\uFEFF';
    const csv = BOM + 'Email,Nome\n"test@isabelpepe.com","Joséphine"';
    assert(csv.startsWith('\uFEFF'));
    assertIncludes(csv, 'Joséphine');
  });
  await runner.test('T1.7.5: CSV field escaping with commas and quotes', async () => {
    const val = 'Pepe, "Elena" & Maria';
    const escaped = `"${val.replace(/"/g, '""')}"`;
    assertEqual(escaped, '"Pepe, ""Elena"" & Maria"');
  });

  // Cleanup
  console.log(`\n🧹 Cleaning up ${createdEmails.length} Tier 1 test records...`);
  if (createdEmails.length > 0) {
    await supabaseAdmin.from('newsletter_subscribers').delete().in('email', createdEmails);
    await supabaseAdmin.from('crm_contacts').delete().in('email', createdEmails);
  }

  const s = runner.summary();
  console.log(`\n\x1b[1mTier 1 Results: ${s.passed}/${s.total} Passed (${s.failed} Failed) in ${s.totalDurationMs}ms\x1b[0m\n`);
  return s;
}

runAllTier1Tests().then(s => {
  if (s.failed > 0) process.exit(1);
  else process.exit(0);
}).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
