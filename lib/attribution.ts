// =========================================================================
// ISABEL PEPE LUXURY E-COMMERCE - OMNICHANNEL ATTRIBUTION LIBRARY
// File: lib/attribution.ts
// =========================================================================

import { AttributionData, TrafficChannel } from '@/types/analytics';

/**
 * Extracts normalized hostname from a referrer URL string.
 */
export function extractReferrerHost(referrer: string | null | undefined): string {
  if (!referrer) return '';
  const trimmed = referrer.trim();
  if (!trimmed) return '';

  try {
    const url = new URL(trimmed.startsWith('http') || trimmed.startsWith('android-app://') ? trimmed : `https://${trimmed}`);
    return url.hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    // If URL parsing fails, extract simple domain
    return trimmed
      .toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .split('/')[0]
      .split('?')[0];
  }
}

/**
 * Normalizes query parameters from object, URLSearchParams or string.
 */
export function parseUtmParams(
  input?: Record<string, string | null | undefined> | URLSearchParams | string | null
): Record<string, string> {
  const result: Record<string, string> = {};
  if (!input) return result;

  if (typeof input === 'string') {
    try {
      const search = input.includes('?') ? input.split('?')[1] : input;
      const params = new URLSearchParams(search);
      params.forEach((value, key) => {
        if (value) result[key.toLowerCase()] = value.trim();
      });
    } catch {
      // ignore parsing error
    }
    return result;
  }

  if (input instanceof URLSearchParams) {
    input.forEach((value, key) => {
      if (value) result[key.toLowerCase()] = value.trim();
    });
    return result;
  }

  if (typeof input === 'object') {
    for (const [k, v] of Object.entries(input)) {
      if (v !== null && v !== undefined && String(v).trim().length > 0) {
        result[k.toLowerCase()] = String(v).trim();
      }
    }
  }

  return result;
}

/**
 * Internal domains that should be treated as direct / internal navigations.
 */
const INTERNAL_HOSTS = [
  'isabelpepe.com',
  'www.isabelpepe.com',
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  'vercel.app',
];

export function isInternalDomain(host: string): boolean {
  if (!host) return true;
  const cleanHost = host.toLowerCase().trim();
  return INTERNAL_HOSTS.some((internal) => cleanHost === internal || cleanHost.endsWith('.' + internal));
}

/**
 * Omnichannel Attribution Classifier
 * Standardizes traffic into the 12 defined channels with complete UTM capture.
 */
export function classifyAttribution(
  referrer?: string | null,
  searchParamsInput?: Record<string, string | null | undefined> | URLSearchParams | string | null
): AttributionData {
  const params = parseUtmParams(searchParamsInput);
  const ref = (referrer || '').trim();
  const refHost = extractReferrerHost(ref);

  const utm_source = params['utm_source'] ? params['utm_source'].toLowerCase() : null;
  const utm_medium = params['utm_medium'] ? params['utm_medium'].toLowerCase() : null;
  const utm_campaign = params['utm_campaign'] || null;
  const utm_content = params['utm_content'] || null;
  const utm_term = params['utm_term'] || null;

  const gclid = params['gclid'] || params['gbraid'] || params['wbraid'] || null;
  const fbclid = params['fbclid'] || null;
  const ttclid = params['ttclid'] || null;

  // 1. Google Ads (Paid Search / Performance Max / Shopping)
  const isGooglePaidMedium = ['cpc', 'ppc', 'paid', 'paidsearch', 'adwords', 'search', 'pmax', 'shopping'].includes(
    utm_medium || ''
  );
  if (gclid || (utm_source?.includes('google') && isGooglePaidMedium)) {
    return {
      traffic_channel: 'Google Ads',
      traffic_source: utm_source || 'google',
      traffic_medium: utm_medium || 'cpc',
      utm_source,
      utm_medium,
      utm_campaign,
      utm_content,
      utm_term,
      gclid,
      fbclid,
      ttclid,
    };
  }

  // 2. Meta Ads (Instagram Ads / Facebook Ads / Paid Social)
  const isMetaSource = ['meta', 'facebook', 'instagram', 'fb', 'ig', 'an'].includes(utm_source || '');
  const isPaidSocialMedium = [
    'cpc',
    'paid_social',
    'paid',
    'ad',
    'ads',
    'paidsocial',
    'story_ad',
    'stories',
    'story',
    'reel',
    'reels',
    'feed',
    'post_ad',
  ].includes(utm_medium || '');

  if (fbclid || (isMetaSource && isPaidSocialMedium) || (utm_campaign && isMetaSource)) {
    return {
      traffic_channel: 'Meta Ads',
      traffic_source: utm_source || (refHost.includes('instagram') ? 'instagram' : 'meta'),
      traffic_medium: utm_medium || 'paid_social',
      utm_source,
      utm_medium,
      utm_campaign,
      utm_content,
      utm_term,
      gclid,
      fbclid,
      ttclid,
    };
  }

  // 3. Email CRM / Newsletter
  const isEmailMedium = ['email', 'newsletter', 'crm', 'mail', 'transactional', 'automation'].includes(
    utm_medium || ''
  );
  const isEmailSource = [
    'newsletter',
    'klaviyo',
    'mailchimp',
    'swipeone',
    'resend',
    'brevo',
    'sendgrid',
    'email',
  ].includes(utm_source || '');

  if (isEmailMedium || isEmailSource) {
    return {
      traffic_channel: 'Email CRM',
      traffic_source: utm_source || 'email',
      traffic_medium: utm_medium || 'email',
      utm_source,
      utm_medium,
      utm_campaign,
      utm_content,
      utm_term,
      gclid,
      fbclid,
      ttclid,
    };
  }

  // 4. WhatsApp CRM / Direct Messaging
  const isWhatsAppReferrer =
    refHost.includes('whatsapp') ||
    refHost.includes('wa.me') ||
    ref.includes('whatsapp://') ||
    ['api.whatsapp.com', 'web.whatsapp.com', 'l.whatsapp.com'].includes(refHost);
  const isWhatsAppSource = ['whatsapp', 'wa', 'wapp'].includes(utm_source || '');

  if (isWhatsAppReferrer || isWhatsAppSource) {
    return {
      traffic_channel: 'WhatsApp CRM',
      traffic_source: utm_source || 'whatsapp',
      traffic_medium: utm_medium || 'chat',
      utm_source,
      utm_medium,
      utm_campaign,
      utm_content,
      utm_term,
      gclid,
      fbclid,
      ttclid,
    };
  }

  // 5. Instagram Organic
  const isInstagramHost = refHost.includes('instagram.com') || refHost === 'l.instagram.com';
  const isInstagramSource = ['instagram', 'ig'].includes(utm_source || '');
  if ((isInstagramHost || isInstagramSource) && !fbclid && utm_medium !== 'cpc') {
    return {
      traffic_channel: 'Instagram Organic',
      traffic_source: 'instagram',
      traffic_medium: utm_medium || 'organic_social',
      utm_source,
      utm_medium,
      utm_campaign,
      utm_content,
      utm_term,
      gclid,
      fbclid,
      ttclid,
    };
  }

  // 6. Facebook Organic
  const isFacebookHost = refHost.includes('facebook.com') || refHost === 'l.facebook.com' || refHost === 'm.facebook.com';
  const isFacebookSource = ['facebook', 'fb'].includes(utm_source || '');
  if ((isFacebookHost || isFacebookSource) && !fbclid && utm_medium !== 'cpc') {
    return {
      traffic_channel: 'Facebook Organic',
      traffic_source: 'facebook',
      traffic_medium: utm_medium || 'organic_social',
      utm_source,
      utm_medium,
      utm_campaign,
      utm_content,
      utm_term,
      gclid,
      fbclid,
      ttclid,
    };
  }

  // 7. Google Organic Search
  const isGoogleSearch =
    /(^|\.)google\.(com|it|fr|de|es|co\.uk|ch|at|be|nl|ca|com\.au|pt|pl|gr)$/i.test(refHost) ||
    ref.startsWith('android-app://com.google.android.googlequicksearchbox');

  if (isGoogleSearch && !isGooglePaidMedium && !gclid) {
    return {
      traffic_channel: 'Google Organic',
      traffic_source: 'google',
      traffic_medium: 'organic',
      utm_source,
      utm_medium,
      utm_campaign,
      utm_content,
      utm_term,
      gclid,
      fbclid,
      ttclid,
    };
  }

  // 8. Other Organic Search (Bing, Yahoo, DuckDuckGo, Ecosia, Qwant, Brave, Baidu, Yandex)
  const isOtherSearch =
    /(^|\.)(bing\.com|yahoo\.com|duckduckgo\.com|ecosia\.org|qwant\.com|yandex\.(ru|com)|baidu\.com|ask\.com|search\.brave\.com)$/i.test(
      refHost
    );

  if (isOtherSearch) {
    const searchEngineName = refHost.replace('www.', '').split('.')[0] || 'search';
    return {
      traffic_channel: 'Other Organic Search',
      traffic_source: utm_source || searchEngineName,
      traffic_medium: utm_medium || 'organic',
      utm_source,
      utm_medium,
      utm_campaign,
      utm_content,
      utm_term,
      gclid,
      fbclid,
      ttclid,
    };
  }

  // 9. TikTok
  const isTikTok = ttclid || refHost.includes('tiktok.com') || utm_source === 'tiktok';
  if (isTikTok) {
    return {
      traffic_channel: 'TikTok',
      traffic_source: 'tiktok',
      traffic_medium: utm_medium || (ttclid ? 'paid_social' : 'organic_social'),
      utm_source,
      utm_medium,
      utm_campaign,
      utm_content,
      utm_term,
      gclid,
      fbclid,
      ttclid,
    };
  }

  // 10. Pinterest
  const isPinterest = refHost.includes('pinterest.') || utm_source === 'pinterest';
  if (isPinterest) {
    return {
      traffic_channel: 'Pinterest',
      traffic_source: 'pinterest',
      traffic_medium: utm_medium || 'organic_social',
      utm_source,
      utm_medium,
      utm_campaign,
      utm_content,
      utm_term,
      gclid,
      fbclid,
      ttclid,
    };
  }

  // 11. Referral / PR / Partner Sites
  if (refHost && !isInternalDomain(refHost)) {
    return {
      traffic_channel: 'Referral',
      traffic_source: utm_source || refHost,
      traffic_medium: utm_medium || 'referral',
      utm_source,
      utm_medium,
      utm_campaign,
      utm_content,
      utm_term,
      gclid,
      fbclid,
      ttclid,
    };
  }

  // 12. Direct Traffic (Default)
  return {
    traffic_channel: 'Direct',
    traffic_source: utm_source || 'direct',
    traffic_medium: utm_medium || 'none',
    utm_source: null,
    utm_medium: null,
    utm_campaign: null,
    utm_content: null,
    utm_term: null,
    gclid: null,
    fbclid: null,
    ttclid: null,
  };
}
