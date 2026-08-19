import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { parseDateRange, calculatePercentageChange } from '@/lib/analytics-query';
import { KpiSummary } from '@/types/analytics';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const range = searchParams.get('range') || 'today';
    const fromParam = searchParams.get('from');
    const toParam = searchParams.get('to');

    const bounds = parseDateRange(range, fromParam, toParam);
    const startIso = bounds.startDate.toISOString();
    const endIso = bounds.endDate.toISOString();
    const prevStartIso = bounds.prevStartDate.toISOString();
    const prevEndIso = bounds.prevEndDate.toISOString();

    // 1. Fetch Current Period Data
    const [
      { data: currentSessions, error: currSessionsErr },
      { data: currentPageViews, error: currPvErr },
      { data: currentOrders, error: currOrdersErr },
    ] = await Promise.all([
      supabaseAdmin
        .from('analytics_sessions')
        .select('session_id, visitor_id, duration_seconds, page_views_count, is_bounce, completed_purchase, revenue, started_at, is_bot')
        .gte('started_at', startIso)
        .lte('started_at', endIso)
        .eq('is_bot', false),
      supabaseAdmin
        .from('page_views')
        .select('id, visitor_id, session_id, duration_seconds, created_at, is_bot')
        .gte('created_at', startIso)
        .lte('created_at', endIso)
        .eq('is_bot', false),
      supabaseAdmin
        .from('orders')
        .select('id, amount_total, created_at, status')
        .gte('created_at', startIso)
        .lte('created_at', endIso)
        .neq('status', 'cancelled'),
    ]);

    if (currSessionsErr) console.warn('Current sessions query error:', currSessionsErr.message);
    if (currPvErr) console.warn('Current page_views query error:', currPvErr.message);
    if (currOrdersErr) console.warn('Current orders query error:', currOrdersErr.message);

    // 2. Fetch Previous Period Data
    const [
      { data: prevSessions },
      { data: prevPageViews },
      { data: prevOrders },
    ] = await Promise.all([
      supabaseAdmin
        .from('analytics_sessions')
        .select('session_id, visitor_id, revenue, completed_purchase, is_bot')
        .gte('started_at', prevStartIso)
        .lte('started_at', prevEndIso)
        .eq('is_bot', false),
      supabaseAdmin
        .from('page_views')
        .select('id, visitor_id, is_bot')
        .gte('created_at', prevStartIso)
        .lte('created_at', prevEndIso)
        .eq('is_bot', false),
      supabaseAdmin
        .from('orders')
        .select('id, amount_total, status')
        .gte('created_at', prevStartIso)
        .lte('created_at', prevEndIso)
        .neq('status', 'cancelled'),
    ]);

    // 3. Fetch Active Live Visitors (Last 5 minutes)
    const fiveMinAgoIso = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const [
      { data: liveSessions },
      { data: liveViews },
    ] = await Promise.all([
      supabaseAdmin
        .from('analytics_sessions')
        .select('visitor_id')
        .gte('last_active_at', fiveMinAgoIso)
        .eq('is_bot', false),
      supabaseAdmin
        .from('page_views')
        .select('visitor_id')
        .gte('created_at', fiveMinAgoIso)
        .eq('is_bot', false),
    ]);

    const activeLiveVisitorIds = new Set<string>();
    liveSessions?.forEach((s) => s.visitor_id && activeLiveVisitorIds.add(s.visitor_id));
    liveViews?.forEach((pv) => pv.visitor_id && activeLiveVisitorIds.add(pv.visitor_id));
    const active_live_visitors = activeLiveVisitorIds.size;

    // 4. Compute Current Period Metrics
    const uniqueVisitorIds = new Set<string>();
    currentSessions?.forEach((s) => s.visitor_id && uniqueVisitorIds.add(s.visitor_id));
    currentPageViews?.forEach((pv) => pv.visitor_id && uniqueVisitorIds.add(pv.visitor_id));

    const real_unique_visitors = uniqueVisitorIds.size;
    const total_page_views = currentPageViews?.length || 0;
    const total_sessions = (currentSessions?.length || 0) > 0 ? (currentSessions?.length || 0) : Math.max(real_unique_visitors, Math.ceil(total_page_views / 2.5));

    // Bounce Rate & Duration
    let bounce_rate = 0;
    let avg_session_duration_seconds = 0;

    if (currentSessions && currentSessions.length > 0) {
      const bouncedCount = currentSessions.filter((s) => s.is_bounce).length;
      bounce_rate = Math.round((bouncedCount / currentSessions.length) * 1000) / 10;

      const totalDuration = currentSessions.reduce((acc, s) => acc + (s.duration_seconds || 0), 0);
      avg_session_duration_seconds = Math.round(totalDuration / currentSessions.length);
    } else if (currentPageViews && currentPageViews.length > 0) {
      // Fallback calculation from pageviews dwell time
      const totalDuration = currentPageViews.reduce((acc, pv) => acc + (pv.duration_seconds || 0), 0);
      avg_session_duration_seconds = Math.round(totalDuration / Math.max(1, currentPageViews.length));
      bounce_rate = total_page_views === real_unique_visitors ? 100 : Math.round((real_unique_visitors / total_page_views) * 100);
    }

    // Orders and Revenue
    let total_orders = currentOrders?.length || 0;
    let total_revenue = 0;

    if (currentOrders && currentOrders.length > 0) {
      total_revenue = currentOrders.reduce((sum, ord) => sum + (Number(ord.amount_total) || 0), 0);
    } else if (currentSessions && currentSessions.length > 0) {
      const purchaseSessions = currentSessions.filter((s) => s.completed_purchase);
      total_orders = purchaseSessions.length;
      total_revenue = purchaseSessions.reduce((sum, s) => sum + (Number(s.revenue) || 0), 0);
    }

    total_revenue = Math.round(total_revenue * 100) / 100;

    // Conversion Rate (%)
    const conversion_rate = total_sessions > 0
      ? Math.round((total_orders / total_sessions) * 1000) / 10
      : 0;

    // 5. Compute Previous Period Metrics & Deltas
    const prevVisitorIds = new Set<string>();
    prevSessions?.forEach((s) => s.visitor_id && prevVisitorIds.add(s.visitor_id));
    prevPageViews?.forEach((pv) => pv.visitor_id && prevVisitorIds.add(pv.visitor_id));
    const prevVisitorsCount = prevVisitorIds.size;
    const prevViewsCount = prevPageViews?.length || 0;

    let prevOrdersCount = prevOrders?.length || 0;
    let prevRevenue = 0;
    if (prevOrders && prevOrders.length > 0) {
      prevRevenue = prevOrders.reduce((sum, ord) => sum + (Number(ord.amount_total) || 0), 0);
    } else if (prevSessions && prevSessions.length > 0) {
      prevRevenue = prevSessions.reduce((sum, s) => sum + (Number(s.revenue) || 0), 0);
    }

    const visitors_change = calculatePercentageChange(real_unique_visitors, prevVisitorsCount);
    const views_change = calculatePercentageChange(total_page_views, prevViewsCount);
    const revenue_change = calculatePercentageChange(total_revenue, prevRevenue);
    const orders_change = calculatePercentageChange(total_orders, prevOrdersCount);

    const summary: KpiSummary = {
      real_unique_visitors,
      total_page_views,
      total_sessions,
      active_live_visitors,
      bounce_rate,
      avg_session_duration_seconds,
      conversion_rate,
      total_revenue,
      total_orders,
      prev_period_change: {
        visitors_change,
        views_change,
        revenue_change,
        orders_change,
      },
    };

    return NextResponse.json(summary);
  } catch (error: any) {
    console.error('API /admin/analytics/summary Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
