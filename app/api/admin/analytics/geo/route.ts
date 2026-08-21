import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { parseDateRange } from '@/lib/analytics-query';
import { GeoMetric } from '@/types/analytics';
import { verifyAdminAuth } from '@/lib/auth-guard';

export const dynamic = 'force-dynamic';

const COUNTRY_NAMES: Record<string, string> = {
  IT: 'Italia',
  CH: 'Svizzera',
  FR: 'Francia',
  DE: 'Germania',
  GB: 'Regno Unito',
  ES: 'Spagna',
  US: 'Stati Uniti',
  AT: 'Austria',
  BE: 'Belgio',
  NL: 'Paesi Bassi',
  MC: 'Monaco',
  SM: 'San Marino',
};

export async function GET(req: Request) {
  const auth = await verifyAdminAuth(req);
  if (!auth.authorized) return auth.response;

  try {
    const { searchParams } = new URL(req.url);
    const range = searchParams.get('range') || 'today';
    const fromParam = searchParams.get('from');
    const toParam = searchParams.get('to');
    const countryFilter = searchParams.get('country');

    const bounds = parseDateRange(range, fromParam, toParam);
    const startIso = bounds.startDate.toISOString();
    const endIso = bounds.endDate.toISOString();

    // 1. Fetch Sessions and PageViews in period
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

    if (sessErr) console.warn('Geo sessions error:', sessErr.message);
    if (pvErr) console.warn('Geo page_views error:', pvErr.message);

    const safeSessions = sessions || [];
    const safePv = pageViews || [];

    // 2. Aggregate Countries
    const countryMap = new Map<
      string,
      {
        country_code: string;
        country_name: string;
        uniqueVisitors: Set<string>;
        sessionsCount: number;
        ordersCount: number;
        revenueSum: number;
      }
    >();

    for (const s of safeSessions) {
      const code = (s.country || 'IT').toUpperCase();
      if (!countryMap.has(code)) {
        countryMap.set(code, {
          country_code: code,
          country_name: COUNTRY_NAMES[code] || code,
          uniqueVisitors: new Set(),
          sessionsCount: 0,
          ordersCount: 0,
          revenueSum: 0,
        });
      }
      const rec = countryMap.get(code)!;
      if (s.visitor_id) rec.uniqueVisitors.add(s.visitor_id);
      rec.sessionsCount += 1;
      if (s.completed_purchase) rec.ordersCount += 1;
      rec.revenueSum += Number(s.revenue) || 0;
    }

    for (const pv of safePv) {
      const code = (pv.country || 'IT').toUpperCase();
      if (!countryMap.has(code)) {
        countryMap.set(code, {
          country_code: code,
          country_name: COUNTRY_NAMES[code] || code,
          uniqueVisitors: new Set(),
          sessionsCount: 0,
          ordersCount: 0,
          revenueSum: 0,
        });
      }
      const rec = countryMap.get(code)!;
      if (pv.visitor_id) rec.uniqueVisitors.add(pv.visitor_id);
    }

    // Total visitors across all countries
    const totalGlobalVisitors = Array.from(countryMap.values()).reduce(
      (acc, c) => acc + c.uniqueVisitors.size,
      0
    );

    const countries = Array.from(countryMap.values())
      .map((c) => {
        const unique_visitors = c.uniqueVisitors.size;
        const sessions = c.sessionsCount > 0 ? c.sessionsCount : unique_visitors;
        const share_percentage =
          totalGlobalVisitors > 0
            ? Math.round((unique_visitors / totalGlobalVisitors) * 1000) / 10
            : 0;

        return {
          country_code: c.country_code,
          country_name: c.country_name,
          unique_visitors,
          sessions,
          orders: c.ordersCount,
          revenue: Math.round(c.revenueSum * 100) / 100,
          share_percentage,
        };
      })
      .sort((a, b) => b.unique_visitors - a.unique_visitors);

    // 3. Aggregate Cities (Special focus on Italian cities)
    const cityMap = new Map<
      string,
      {
        city: string;
        region: string;
        country: string;
        uniqueVisitors: Set<string>;
        sessionsCount: number;
        ordersCount: number;
        revenueSum: number;
        durationSum: number;
        pageViewsCount: number;
      }
    >();

    const normalizeCityName = (cityRaw?: string | null): string => {
      if (!cityRaw || cityRaw === 'Sconosciuta') return 'Roma';
      if (cityRaw === 'Local Dev' || cityRaw === 'localhost') return 'Roma';
      return cityRaw;
    };

    for (const s of safeSessions) {
      if (countryFilter && countryFilter !== 'all' && s.country?.toUpperCase() !== countryFilter.toUpperCase()) {
        continue;
      }

      const cityName = normalizeCityName(s.city);
      const regionName = s.region || (cityName === 'Roma' ? 'Lazio' : cityName === 'Milano' ? 'Lombardia' : cityName === 'Napoli' || cityName === 'Salerno' ? 'Campania' : '');
      const key = `${cityName}|${s.country || 'IT'}`;

      if (!cityMap.has(key)) {
        cityMap.set(key, {
          city: cityName,
          region: regionName,
          country: (s.country || 'IT').toUpperCase(),
          uniqueVisitors: new Set(),
          sessionsCount: 0,
          ordersCount: 0,
          revenueSum: 0,
          durationSum: 0,
          pageViewsCount: 0,
        });
      }

      const cRec = cityMap.get(key)!;
      if (s.visitor_id) cRec.uniqueVisitors.add(s.visitor_id);
      cRec.sessionsCount += 1;
      cRec.pageViewsCount += s.page_views_count || 1;
      cRec.durationSum += s.duration_seconds || 0;
      if (s.completed_purchase) cRec.ordersCount += 1;
      cRec.revenueSum += Number(s.revenue) || 0;
    }

    for (const pv of safePv) {
      if (countryFilter && countryFilter !== 'all' && pv.country?.toUpperCase() !== countryFilter.toUpperCase()) {
        continue;
      }

      const cityName = normalizeCityName(pv.city);
      const regionName = pv.region || (cityName === 'Roma' ? 'Lazio' : cityName === 'Milano' ? 'Lombardia' : cityName === 'Napoli' || cityName === 'Salerno' ? 'Campania' : '');
      const key = `${cityName}|${pv.country || 'IT'}`;

      if (!cityMap.has(key)) {
        cityMap.set(key, {
          city: cityName,
          region: regionName,
          country: (pv.country || 'IT').toUpperCase(),
          uniqueVisitors: new Set(),
          sessionsCount: 0,
          ordersCount: 0,
          revenueSum: 0,
          durationSum: 0,
          pageViewsCount: 0,
        });
      }

      const cRec = cityMap.get(key)!;
      if (pv.visitor_id) cRec.uniqueVisitors.add(pv.visitor_id);
      if (safeSessions.length === 0) {
        cRec.pageViewsCount += 1;
        cRec.durationSum += pv.duration_seconds || 0;
      }
    }

    const cities = Array.from(cityMap.values())
      .map((c) => {
        const unique_visitors = c.uniqueVisitors.size;
        const sessions = c.sessionsCount > 0 ? c.sessionsCount : unique_visitors;
        const avg_duration = sessions > 0 ? Math.round(c.durationSum / sessions) : 0;
        const conversion_rate =
          sessions > 0 ? Math.round((c.ordersCount / sessions) * 1000) / 10 : 0;

        return {
          city: c.city,
          region: c.region,
          country: c.country,
          unique_visitors,
          sessions,
          orders: c.ordersCount,
          revenue: Math.round(c.revenueSum * 100) / 100,
          avg_duration,
          conversion_rate,
        };
      })
      .sort((a, b) => b.unique_visitors - a.unique_visitors);

    // Standard GeoMetric[] array conforming to types/analytics.ts
    const geo_metrics: GeoMetric[] = cities.map((c) => ({
      country: c.country,
      country_name: COUNTRY_NAMES[c.country] || c.country,
      city: c.city,
      region: c.region,
      visitors_count: c.unique_visitors,
      sessions_count: c.sessions,
      page_views_count: c.sessions,
      orders_count: c.orders,
      revenue: c.revenue,
      conversion_rate: c.conversion_rate,
    }));

    return NextResponse.json({
      countries,
      cities,
      geo_metrics,
    });
  } catch (error: any) {
    console.error('API /admin/analytics/geo Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
