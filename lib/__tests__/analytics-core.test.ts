// =========================================================================
// ISABEL PEPE LUXURY E-COMMERCE - CORE ANALYTICS VERIFICATION TESTS
// File: lib/__tests__/analytics-core.test.ts
// =========================================================================

import {
  isBotUserAgent,
  isClientBotSignal,
  isExcludedIp,
  isExcludedPath,
  shouldIgnoreTracking,
} from '../bot-filter';
import {
  classifyAttribution,
  extractReferrerHost,
  isInternalDomain,
  parseUtmParams,
} from '../attribution';
import {
  generateSessionId,
  generateVisitorId,
  getDeviceType,
  getSessionDuration,
  isSessionExpired,
  SESSION_TIMEOUT_MS,
} from '../session';
import {
  AttributionData,
  TrafficChannel,
  VisitorSession,
  AnalyticsEvent,
  DailyAnalyticsRecord,
  FunnelData,
  KpiSummary,
  TimeSeriesPoint,
  TopProductMetric,
  TopPageMetric,
  GeoMetric,
  SearchConsoleData,
} from '@/types/analytics';

describe('Analytics Core Libraries Verification', () => {
  // -----------------------------------------------------------------------
  // 1. Bot Filter Tests
  // -----------------------------------------------------------------------
  describe('Bot Immune Filter (lib/bot-filter.ts)', () => {
    it('detects search bots and crawlers correctly', () => {
      expect(isBotUserAgent('Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)')).toBe(true);
      expect(isBotUserAgent('Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)')).toBe(true);
      expect(isBotUserAgent('Mozilla/5.0 (compatible; AhrefsBot/7.0; +http://ahrefs.com/robot/)')).toBe(true);
      expect(isBotUserAgent('Mozilla/5.0 (compatible; SemrushBot/7~bl; +http://www.semrush.com/bot.html)')).toBe(true);
      expect(isBotUserAgent('Bytespider; spider-feedback@bytedance.com')).toBe(true);
      expect(isBotUserAgent('Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.2; +https://openai.com/gptbot)')).toBe(true);
      expect(isBotUserAgent('ClaudeBot/1.0; +claudebot@anthropic.com')).toBe(true);
      expect(isBotUserAgent('HeadlessChrome/120.0.0.0 Safari/537.36')).toBe(true);
      expect(isBotUserAgent('curl/8.4.0')).toBe(true);
      expect(isBotUserAgent('PostmanRuntime/7.36.0')).toBe(true);
      expect(isBotUserAgent('python-requests/2.31.0')).toBe(true);
    });

    it('allows genuine human user agents', () => {
      const iPhoneUA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';
      const macChromeUA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
      const windowsUA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

      expect(isBotUserAgent(iPhoneUA)).toBe(false);
      expect(isBotUserAgent(macChromeUA)).toBe(false);
      expect(isBotUserAgent(windowsUA)).toBe(false);
    });

    it('identifies client automation signals', () => {
      expect(isClientBotSignal({ is_webdriver: true })).toBe(true);
      expect(isClientBotSignal({ viewport_width: 0, viewport_height: 0 })).toBe(true);
      expect(isClientBotSignal({ screen_resolution: '0x0' })).toBe(true);
      expect(isClientBotSignal({ viewport_width: 1440, viewport_height: 900 })).toBe(false);
    });

    it('excludes admin and internal paths', () => {
      expect(isExcludedPath('/admin')).toBe(true);
      expect(isExcludedPath('/admin/products')).toBe(true);
      expect(isExcludedPath('/api/track')).toBe(true);
      expect(isExcludedPath('/_next/static/css/app.css')).toBe(true);
      expect(isExcludedPath('/favicon.ico')).toBe(true);
      expect(isExcludedPath('/robots.txt')).toBe(true);
      expect(isExcludedPath('/')).toBe(false);
      expect(isExcludedPath('/shop')).toBe(false);
      expect(isExcludedPath('/prodotto/anello-imperial')).toBe(false);
    });

    it('evaluates shouldIgnoreTracking correctly', () => {
      expect(shouldIgnoreTracking({ isAdminSuppressed: true }).ignore).toBe(true);
      expect(shouldIgnoreTracking({ path: '/admin/analytics' }).ignore).toBe(true);
      expect(shouldIgnoreTracking({ userAgent: 'Googlebot/2.1' }).ignore).toBe(true);
      expect(shouldIgnoreTracking({ path: '/shop', userAgent: 'Mozilla/5.0 (iPhone)' }).ignore).toBe(false);
    });
  });

  // -----------------------------------------------------------------------
  // 2. Attribution Tests
  // -----------------------------------------------------------------------
  describe('Omnichannel Attribution (lib/attribution.ts)', () => {
    it('classifies Google Organic accurately', () => {
      const res = classifyAttribution('https://www.google.it/', {});
      expect(res.traffic_channel).toBe('Google Organic');
      expect(res.traffic_source).toBe('google');
      expect(res.traffic_medium).toBe('organic');
    });

    it('classifies Google Ads with gclid accurately', () => {
      const res = classifyAttribution('', { gclid: 'gclid_test_123' });
      expect(res.traffic_channel).toBe('Google Ads');
      expect(res.gclid).toBe('gclid_test_123');
    });

    it('classifies Meta Ads with fbclid and UTMs accurately', () => {
      const res = classifyAttribution('', {
        utm_source: 'instagram',
        utm_medium: 'paid_social',
        utm_campaign: 'summer_campaign',
        fbclid: 'fb_test_999',
      });
      expect(res.traffic_channel).toBe('Meta Ads');
      expect(res.utm_campaign).toBe('summer_campaign');
      expect(res.fbclid).toBe('fb_test_999');
    });

    it('classifies Instagram Organic accurately', () => {
      const res = classifyAttribution('https://l.instagram.com/', {});
      expect(res.traffic_channel).toBe('Instagram Organic');
      expect(res.traffic_source).toBe('instagram');
    });

    it('classifies Facebook Organic accurately', () => {
      const res = classifyAttribution('https://l.facebook.com/', {});
      expect(res.traffic_channel).toBe('Facebook Organic');
      expect(res.traffic_source).toBe('facebook');
    });

    it('classifies WhatsApp CRM accurately', () => {
      const res = classifyAttribution('https://api.whatsapp.com/send', {});
      expect(res.traffic_channel).toBe('WhatsApp CRM');
      expect(res.traffic_source).toBe('whatsapp');
    });

    it('classifies Email CRM accurately', () => {
      const res = classifyAttribution('', { utm_source: 'newsletter', utm_medium: 'email' });
      expect(res.traffic_channel).toBe('Email CRM');
      expect(res.traffic_source).toBe('newsletter');
    });

    it('classifies TikTok accurately', () => {
      const res = classifyAttribution('', { utm_source: 'tiktok', ttclid: 'tt_123' });
      expect(res.traffic_channel).toBe('TikTok');
      expect(res.ttclid).toBe('tt_123');
    });

    it('classifies Pinterest accurately', () => {
      const res = classifyAttribution('https://it.pinterest.com/', {});
      expect(res.traffic_channel).toBe('Pinterest');
    });

    it('classifies External Referral accurately', () => {
      const res = classifyAttribution('https://vogue.it/moda/gioielli', {});
      expect(res.traffic_channel).toBe('Referral');
      expect(res.traffic_source).toBe('vogue.it');
    });

    it('classifies Direct traffic accurately', () => {
      const res = classifyAttribution('', {});
      expect(res.traffic_channel).toBe('Direct');
      expect(res.traffic_source).toBe('direct');
      expect(res.traffic_medium).toBe('none');
    });
  });

  // -----------------------------------------------------------------------
  // 3. Session Management Tests
  // -----------------------------------------------------------------------
  describe('Session Management (lib/session.ts)', () => {
    it('generates properly formatted IDs', () => {
      const vid = generateVisitorId();
      const sid = generateSessionId();

      expect(vid.startsWith('vid_')).toBe(true);
      expect(sid.startsWith('sid_')).toBe(true);
    });

    it('correctly calculates 30-minute expiration', () => {
      const now = Date.now();
      const tenMinutesAgo = now - 10 * 60 * 1000;
      const fortyMinutesAgo = now - 40 * 60 * 1000;

      expect(isSessionExpired(tenMinutesAgo)).toBe(false);
      expect(isSessionExpired(fortyMinutesAgo)).toBe(true);
      expect(isSessionExpired(null)).toBe(true);
    });

    it('calculates session duration in seconds', () => {
      const start = Date.now() - 45 * 1000; // 45 seconds ago
      const duration = getSessionDuration(start);
      expect(duration).toBeGreaterThanOrEqual(44);
      expect(duration).toBeLessThanOrEqual(46);
    });

    it('determines device type accurately', () => {
      expect(getDeviceType('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)', 390)).toBe('mobile');
      expect(getDeviceType('Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X)', 820)).toBe('tablet');
      expect(getDeviceType('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', 1440)).toBe('desktop');
    });
  });
});
