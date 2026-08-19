import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { parseDateRange } from '@/lib/analytics-query';
import { TrafficChannel } from '@/types/analytics';

export const dynamic = 'force-dynamic';

const ALL_CHANNELS: TrafficChannel[] = [
  'Google Organic',
  'Google Ads',
  'Meta Ads',
  'Instagram Organic',
  'Facebook Organic',
  'Direct',
  'Referral',
  'WhatsApp CRM',
  'Email CRM',
  'TikTok',
  'Pinterest',
  'Other Organic Search',
];

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const range = searchParams.get('range') || 'today';
    const fromParam = searchParams.get('from');
    const toParam = searchParams.get('to');

    const bounds = parseDateRange(range, fromParam, toParam);
    const startIso = bounds.startDate.toISOString();
    const endIso = bounds.endDate.toISOString();

    // 1. Fetch sessions & page_views within range
    const [
      { data: sessions, error: sessErr },
      { data: pageViews, error: pvErr },
    ] = await Promise.all([
      supabaseAdmin
        .from('analytics_sessions')
        .select('*')
        .gte('started_at', startIso)
        .lte('started_at', endIso)
        .eq('is_bot', false),
      supabaseAdmin
        .from('page_views')
        .select('*')
        .gte('created_at', startIso)
        .lte('created_at', endIso)
        .eq('is_bot', false),
    ]);

    if (sessErr) console.warn('Sources sessions error:', sessErr.message);
    if (pvErr) console.warn('Sources page_views error:', pvErr.message);

    const safeSessions = sessions || [];
    const safePv = pageViews || [];

    // 2. Channels Aggregation
    const channelMap = new Map<
      string,
      {
        channel: TrafficChannel;
        uniqueVisitors: Set<string>;
        sessionsCount: number;
        pageViewsCount: number;
        durationSum: number;
        bouncesCount: number;
        cartAdditionsCount: number;
        ordersCount: number;
        revenueSum: number;
      }
    >();

    // Initialize all standard channels
    for (const ch of ALL_CHANNELS) {
      channelMap.set(ch, {
        channel: ch,
        uniqueVisitors: new Set(),
        sessionsCount: 0,
        pageViewsCount: 0,
        durationSum: 0,
        bouncesCount: 0,
        cartAdditionsCount: 0,
        ordersCount: 0,
        revenueSum: 0,
      });
    }

    // Process sessions
    for (const s of safeSessions) {
      const ch = (s.traffic_channel || 'Direct') as TrafficChannel;
      if (!channelMap.has(ch)) {
        channelMap.set(ch, {
          channel: ch,
          uniqueVisitors: new Set(),
          sessionsCount: 0,
          pageViewsCount: 0,
          durationSum: 0,
          bouncesCount: 0,
          cartAdditionsCount: 0,
          ordersCount: 0,
          revenueSum: 0,
        });
      }

      const rec = channelMap.get(ch)!;
      if (s.visitor_id) rec.uniqueVisitors.add(s.visitor_id);
      rec.sessionsCount += 1;
      rec.pageViewsCount += s.page_views_count || 1;
      rec.durationSum += s.duration_seconds || 0;
      if (s.is_bounce) rec.bouncesCount += 1;
      if (s.added_to_cart) rec.cartAdditionsCount += 1;
      if (s.completed_purchase) rec.ordersCount += 1;
      rec.revenueSum += Number(s.revenue) || 0;
    }

    // Also process pageviews (for channels without full session or historical pageviews)
    for (const pv of safePv) {
      const ch = (pv.traffic_channel || 'Direct') as TrafficChannel;
      const rec = channelMap.get(ch);
      if (rec) {
        if (pv.visitor_id) rec.uniqueVisitors.add(pv.visitor_id);
        // If sessions table was empty, increment pageViewsCount
        if (safeSessions.length === 0) {
          rec.pageViewsCount += 1;
          rec.durationSum += pv.duration_seconds || 0;
        }
      }
    }

    const channels = Array.from(channelMap.values())
      .map((item) => {
        const unique_visitors = item.uniqueVisitors.size;
        const sessions = item.sessionsCount > 0 ? item.sessionsCount : unique_visitors;
        const page_views = item.pageViewsCount > 0 ? item.pageViewsCount : sessions;
        const pages_per_session = sessions > 0 ? Math.round((page_views / sessions) * 10) / 10 : 1;
        const avg_duration = sessions > 0 ? Math.round(item.durationSum / sessions) : 0;
        const bounce_rate = sessions > 0 ? Math.round((item.bouncesCount / sessions) * 1000) / 10 : 0;
        const conversion_rate = sessions > 0 ? Math.round((item.ordersCount / sessions) * 1000) / 10 : 0;

        return {
          channel: item.channel,
          unique_visitors,
          sessions,
          page_views,
          pages_per_session,
          avg_duration,
          bounce_rate,
          cart_additions: item.cartAdditionsCount,
          orders: item.ordersCount,
          revenue: Math.round(item.revenueSum * 100) / 100,
          conversion_rate,
        };
      })
      .sort((a, b) => b.sessions - a.sessions || b.revenue - a.revenue);

    // 3. Campaigns Aggregation
    const campaignMap = new Map<
      string,
      {
        campaign: string;
        source: string;
        medium: string;
        content: string | null;
        sessionsCount: number;
        cartAdditionsCount: number;
        ordersCount: number;
        revenueSum: number;
      }
    >();

    for (const s of safeSessions) {
      if (s.utm_campaign) {
        const key = `${s.utm_campaign}|${s.utm_source || 'none'}|${s.utm_medium || 'none'}`;
        if (!campaignMap.has(key)) {
          campaignMap.set(key, {
            campaign: s.utm_campaign,
            source: s.traffic_source || s.utm_source || 'custom',
            medium: s.traffic_medium || s.utm_medium || 'cpc',
            content: s.utm_content || null,
            sessionsCount: 0,
            cartAdditionsCount: 0,
            ordersCount: 0,
            revenueSum: 0,
          });
        }
        const cRec = campaignMap.get(key)!;
        cRec.sessionsCount += 1;
        if (s.added_to_cart) cRec.cartAdditionsCount += 1;
        if (s.completed_purchase) cRec.ordersCount += 1;
        cRec.revenueSum += Number(s.revenue) || 0;
      }
    }

    // Also check page_views with UTM campaign
    for (const pv of safePv) {
      if (pv.utm_campaign && safeSessions.length === 0) {
        const key = `${pv.utm_campaign}|${pv.utm_source || 'none'}|${pv.utm_medium || 'none'}`;
        if (!campaignMap.has(key)) {
          campaignMap.set(key, {
            campaign: pv.utm_campaign,
            source: pv.traffic_source || pv.utm_source || 'custom',
            medium: pv.traffic_medium || pv.utm_medium || 'cpc',
            content: pv.utm_content || null,
            sessionsCount: 0,
            cartAdditionsCount: 0,
            ordersCount: 0,
            revenueSum: 0,
          });
        }
        const cRec = campaignMap.get(key)!;
        cRec.sessionsCount += 1;
      }
    }

    const campaigns = Array.from(campaignMap.values())
      .map((item) => ({
        campaign: item.campaign,
        source: item.source,
        medium: item.medium,
        content: item.content,
        sessions: item.sessionsCount,
        cart_additions: item.cartAdditionsCount,
        orders: item.ordersCount,
        revenue: Math.round(item.revenueSum * 100) / 100,
        conversion_rate:
          item.sessionsCount > 0 ? Math.round((item.ordersCount / item.sessionsCount) * 1000) / 10 : 0,
      }))
      .sort((a, b) => b.sessions - a.sessions);

    // 4. External Referrers Aggregation
    const referrerMap = new Map<
      string,
      {
        referrer_host: string;
        sessionsCount: number;
        bouncesCount: number;
        ordersCount: number;
      }
    >();

    for (const s of safeSessions) {
      if (s.referrer_host && !s.referrer_host.includes('isabelpepe.com') && !s.referrer_host.includes('localhost')) {
        const host = s.referrer_host;
        if (!referrerMap.has(host)) {
          referrerMap.set(host, {
            referrer_host: host,
            sessionsCount: 0,
            bouncesCount: 0,
            ordersCount: 0,
          });
        }
        const rRec = referrerMap.get(host)!;
        rRec.sessionsCount += 1;
        if (s.is_bounce) rRec.bouncesCount += 1;
        if (s.completed_purchase) rRec.ordersCount += 1;
      }
    }

    // Also check page_views for referrer_host
    for (const pv of safePv) {
      if (pv.referrer_host && !pv.referrer_host.includes('isabelpepe.com') && !pv.referrer_host.includes('localhost') && safeSessions.length === 0) {
        const host = pv.referrer_host;
        if (!referrerMap.has(host)) {
          referrerMap.set(host, {
            referrer_host: host,
            sessionsCount: 0,
            bouncesCount: 0,
            ordersCount: 0,
          });
        }
        const rRec = referrerMap.get(host)!;
        rRec.sessionsCount += 1;
      }
    }

    const referrers = Array.from(referrerMap.values())
      .map((item) => ({
        referrer_host: item.referrer_host,
        sessions: item.sessionsCount,
        bounce_rate:
          item.sessionsCount > 0 ? Math.round((item.bouncesCount / item.sessionsCount) * 1000) / 10 : 0,
        orders: item.ordersCount,
      }))
      .sort((a, b) => b.sessions - a.sessions);

    return NextResponse.json({
      channels,
      campaigns,
      referrers,
    });
  } catch (error: any) {
    console.error('API /admin/analytics/sources Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
