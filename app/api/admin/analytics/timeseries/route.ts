import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { parseDateRange } from '@/lib/analytics-query';
import { TimeSeriesPoint } from '@/types/analytics';

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

    // 1. Fetch data across tables within range
    const [
      { data: sessions, error: sessionsErr },
      { data: pageViews, error: pvErr },
      { data: events, error: eventsErr },
      { data: orders, error: ordersErr },
    ] = await Promise.all([
      supabaseAdmin
        .from('analytics_sessions')
        .select('session_id, visitor_id, started_at, duration_seconds, viewed_product, added_to_cart, completed_purchase, revenue, is_bot')
        .gte('started_at', startIso)
        .lte('started_at', endIso)
        .eq('is_bot', false),
      supabaseAdmin
        .from('page_views')
        .select('id, visitor_id, path, created_at, is_bot')
        .gte('created_at', startIso)
        .lte('created_at', endIso)
        .eq('is_bot', false),
      supabaseAdmin
        .from('analytics_events')
        .select('id, session_id, visitor_id, event_name, path, created_at')
        .gte('created_at', startIso)
        .lte('created_at', endIso),
      supabaseAdmin
        .from('orders')
        .select('id, amount_total, created_at, status')
        .gte('created_at', startIso)
        .lte('created_at', endIso)
        .neq('status', 'cancelled'),
    ]);

    if (sessionsErr) console.warn('Timeseries sessions error:', sessionsErr.message);
    if (pvErr) console.warn('Timeseries pageviews error:', pvErr.message);
    if (eventsErr) console.warn('Timeseries events error:', eventsErr.message);
    if (ordersErr) console.warn('Timeseries orders error:', ordersErr.message);

    const safeSessions = sessions || [];
    const safePv = pageViews || [];
    const safeEvents = events || [];
    const safeOrders = orders || [];

    // 2. Populate Slots
    const points: TimeSeriesPoint[] = bounds.timeSlots.map((slot) => {
      const slotStartMs = slot.start.getTime();
      const slotEndMs = slot.end.getTime();

      const inSlotPv = safePv.filter((pv) => {
        const t = new Date(pv.created_at).getTime();
        return t >= slotStartMs && t <= slotEndMs;
      });

      const inSlotSessions = safeSessions.filter((s) => {
        const t = new Date(s.started_at).getTime();
        return t >= slotStartMs && t <= slotEndMs;
      });

      const inSlotEvents = safeEvents.filter((ev) => {
        const t = new Date(ev.created_at).getTime();
        return t >= slotStartMs && t <= slotEndMs;
      });

      const inSlotOrders = safeOrders.filter((ord) => {
        const t = new Date(ord.created_at).getTime();
        return t >= slotStartMs && t <= slotEndMs;
      });

      // Unique visitors in slot
      const visitorIds = new Set<string>();
      inSlotPv.forEach((pv) => pv.visitor_id && visitorIds.add(pv.visitor_id));
      inSlotSessions.forEach((s) => s.visitor_id && visitorIds.add(s.visitor_id));
      const unique_visitors = visitorIds.size;

      const page_views = inSlotPv.length;
      const sessionsCount = inSlotSessions.length > 0 ? inSlotSessions.length : unique_visitors;

      // Product views
      const productViewsFromPv = inSlotPv.filter((pv) => pv.path?.startsWith('/prodotto/')).length;
      const productViewsFromEvents = inSlotEvents.filter((ev) => ev.event_name === 'view_item').length;
      const productViewsFromSessions = inSlotSessions.filter((s) => s.viewed_product).length;
      const product_views = Math.max(productViewsFromPv, productViewsFromEvents, productViewsFromSessions);

      // Cart additions
      const cartAdditionsFromEvents = inSlotEvents.filter((ev) => ev.event_name === 'add_to_cart').length;
      const cartAdditionsFromSessions = inSlotSessions.filter((s) => s.added_to_cart).length;
      const cart_additions = Math.max(cartAdditionsFromEvents, cartAdditionsFromSessions);

      // Orders & Revenue
      let ordersCount = inSlotOrders.length;
      let revenue = inSlotOrders.reduce((sum, ord) => sum + (Number(ord.amount_total) || 0), 0);

      if (ordersCount === 0 && inSlotSessions.length > 0) {
        const converted = inSlotSessions.filter((s) => s.completed_purchase);
        ordersCount = converted.length;
        revenue = converted.reduce((sum, s) => sum + (Number(s.revenue) || 0), 0);
      }

      return {
        timestamp: slot.timestamp,
        date_label: slot.label,
        page_views,
        unique_visitors,
        sessions: sessionsCount,
        product_views,
        cart_additions,
        orders: ordersCount,
        revenue: Math.round(revenue * 100) / 100,
      };
    });

    return NextResponse.json({
      points,
      range: bounds.rangeKey,
      interval: bounds.isHourly ? 'hour' : 'day',
    });
  } catch (error: any) {
    console.error('API /admin/analytics/timeseries Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
