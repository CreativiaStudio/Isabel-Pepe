// =========================================================================
// ISABEL PEPE LUXURY E-COMMERCE - MILESTONE 2 PIPELINE & HOOKS TESTS
// File: lib/__tests__/analytics-pipeline.test.ts
// =========================================================================

import { shouldIgnoreTracking, isBotUserAgent, isExcludedPath } from '../bot-filter';
import { classifyAttribution, parseUtmParams } from '../attribution';
import { getOrCreateSessionId, getOrCreateVisitorId, isSessionExpired } from '../session';
import { TrackPayload, AnalyticsEvent } from '@/types/analytics';

describe('Milestone 2: First-Party Tracker & Ingestion Pipeline Verification', () => {
  describe('Payload and Attribution Integrity', () => {
    it('accurately parses complex multi-param UTM campaign URLs', () => {
      const search = '?utm_source=instagram&utm_medium=story_ad&utm_campaign=summer_sparkle_2026&utm_content=video_1080x1920&utm_term=moissanite_ring&fbclid=fb_click_998877';
      const parsed = parseUtmParams(search);

      expect(parsed.utm_source).toBe('instagram');
      expect(parsed.utm_medium).toBe('story_ad');
      expect(parsed.utm_campaign).toBe('summer_sparkle_2026');
      expect(parsed.utm_content).toBe('video_1080x1920');
      expect(parsed.utm_term).toBe('moissanite_ring');
      expect(parsed.fbclid).toBe('fb_click_998877');

      const attribution = classifyAttribution('https://l.instagram.com/', parsed);
      expect(attribution.traffic_channel).toBe('Meta Ads');
      expect(attribution.traffic_source).toBe('instagram');
      expect(attribution.traffic_medium).toBe('story_ad');
      expect(attribution.utm_campaign).toBe('summer_sparkle_2026');
      expect(attribution.fbclid).toBe('fb_click_998877');
    });

    it('classifies Google Organic without paid parameters', () => {
      const attr = classifyAttribution('https://www.google.it/search?q=gioielli+argento+925', {});
      expect(attr.traffic_channel).toBe('Google Organic');
      expect(attr.traffic_source).toBe('google');
      expect(attr.traffic_medium).toBe('organic');
      expect(attr.gclid).toBeNull();
    });

    it('filters out bot search traffic and test agents', () => {
      const botPayload: TrackPayload = {
        path: '/prodotto/anello-imperial',
        visitorId: 'vid_test_bot',
        telemetry: {
          is_webdriver: true,
          viewport_width: 0,
          viewport_height: 0,
        },
      };

      const filterResult = shouldIgnoreTracking({
        userAgent: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        clientTelemetry: botPayload.telemetry,
        path: botPayload.path,
      });

      expect(filterResult.ignore).toBe(true);
    });

    it('allows genuine consumer visits on product and shop paths', () => {
      const consumerPayload: TrackPayload = {
        path: '/prodotto/collana-solitaire',
        visitorId: 'vid_consumer_12345',
        telemetry: {
          is_webdriver: false,
          viewport_width: 390,
          viewport_height: 844,
          screen_resolution: '390x844',
          device_type: 'mobile',
        },
      };

      const filterResult = shouldIgnoreTracking({
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
        clientTelemetry: consumerPayload.telemetry,
        path: consumerPayload.path,
      });

      expect(filterResult.ignore).toBe(false);
    });
  });

  describe('Funnel Events & Schema Compatibility', () => {
    it('validates structure of analytics events', () => {
      const event: AnalyticsEvent = {
        session_id: 'sid_xyz_123',
        visitor_id: 'vid_abc_456',
        event_name: 'add_to_cart',
        path: '/prodotto/orecchini-eternity',
        product_name: 'Orecchini Eternity',
        product_slug: 'orecchini-eternity',
        product_price: 89.0,
        quantity: 1,
        event_data: { source: 'quick_add_card' },
      };

      expect(event.event_name).toBe('add_to_cart');
      expect(event.product_price).toBe(89.0);
      expect(event.quantity).toBe(1);
    });
  });
});
