import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { parseDateRange } from '@/lib/analytics-query';
import { FunnelData } from '@/types/analytics';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const range = searchParams.get('range') || 'today';
    const fromParam = searchParams.get('from');
    const toParam = searchParams.get('to');
    const channelParam = searchParams.get('channel');

    const bounds = parseDateRange(range, fromParam, toParam);
    const startIso = bounds.startDate.toISOString();
    const endIso = bounds.endDate.toISOString();

    // 1. Build Query on `analytics_sessions`
    let sessionQuery = supabaseAdmin
      .from('analytics_sessions')
      .select('*')
      .gte('started_at', startIso)
      .lte('started_at', endIso)
      .eq('is_bot', false);

    if (channelParam && channelParam !== 'all') {
      // Support matching either internal key (e.g. google_organic) or formatted label (e.g. Google Organic)
      const cleanChannel = channelParam.toLowerCase().replace(/_/g, ' ');
      sessionQuery = sessionQuery.or(`traffic_channel.ilike.%${cleanChannel}%,traffic_channel.ilike.%${channelParam}%`);
    }

    const { data: sessions, error: sessErr } = await sessionQuery;
    if (sessErr) console.warn('Funnel sessions query error:', sessErr.message);

    // Also fetch page_views, events, and orders in period for fallback or cross-validation
    const [
      { data: pageViews },
      { data: events },
      { data: orders },
    ] = await Promise.all([
      supabaseAdmin
        .from('page_views')
        .select('*')
        .gte('created_at', startIso)
        .lte('created_at', endIso)
        .eq('is_bot', false),
      supabaseAdmin
        .from('analytics_events')
        .select('*')
        .gte('created_at', startIso)
        .lte('created_at', endIso),
      supabaseAdmin
        .from('orders')
        .select('*')
        .gte('created_at', startIso)
        .lte('created_at', endIso)
        .neq('status', 'cancelled'),
    ]);

    const safeSessions = sessions || [];
    const safePv = pageViews || [];
    const safeEvents = events || [];
    const safeOrders = orders || [];

    let stage_1_landing = 0;
    let stage_2_product_view = 0;
    let stage_3_add_to_cart = 0;
    let stage_4_checkout_started = 0;
    let stage_5_purchase_completed = 0;
    let total_revenue = 0;

    if (safeSessions.length > 0) {
      stage_1_landing = safeSessions.length;
      stage_2_product_view = safeSessions.filter((s) => s.viewed_product).length;
      stage_3_add_to_cart = safeSessions.filter((s) => s.added_to_cart).length;
      stage_4_checkout_started = safeSessions.filter((s) => s.started_checkout).length;
      stage_5_purchase_completed = safeSessions.filter((s) => s.completed_purchase).length;
      total_revenue = safeSessions
        .filter((s) => s.completed_purchase)
        .reduce((sum, s) => sum + (Number(s.revenue) || 0), 0);
    } else {
      // Fallback calculation from pageviews, events and orders
      const uniqueVisitors = new Set<string>();
      const productVisitors = new Set<string>();
      const cartVisitors = new Set<string>();
      const checkoutVisitors = new Set<string>();

      for (const pv of safePv) {
        if (pv.visitor_id) {
          uniqueVisitors.add(pv.visitor_id);
          if (pv.path?.startsWith('/prodotto/')) {
            productVisitors.add(pv.visitor_id);
          }
          if (pv.path?.startsWith('/checkout') || pv.path?.startsWith('/carrello')) {
            checkoutVisitors.add(pv.visitor_id);
          }
        }
      }

      for (const ev of safeEvents) {
        if (ev.event_name === 'add_to_cart' && ev.visitor_id) {
          cartVisitors.add(ev.visitor_id);
        }
        if (ev.event_name === 'begin_checkout' && ev.visitor_id) {
          checkoutVisitors.add(ev.visitor_id);
        }
      }

      stage_1_landing = uniqueVisitors.size;
      stage_2_product_view = productVisitors.size;
      stage_3_add_to_cart = cartVisitors.size;
      stage_4_checkout_started = checkoutVisitors.size;
      stage_5_purchase_completed = safeOrders.length;
      total_revenue = safeOrders.reduce((sum, ord) => sum + (Number(ord.amount_total) || 0), 0);
    }

    // Step Conversion Rates (%)
    const cr_1_to_2 = stage_1_landing > 0 ? Math.round((stage_2_product_view / stage_1_landing) * 1000) / 10 : 0;
    const cr_2_to_3 = stage_2_product_view > 0 ? Math.round((stage_3_add_to_cart / stage_2_product_view) * 1000) / 10 : 0;
    const cr_3_to_4 = stage_3_add_to_cart > 0 ? Math.round((stage_4_checkout_started / stage_3_add_to_cart) * 1000) / 10 : 0;
    const cr_4_to_5 = stage_4_checkout_started > 0 ? Math.round((stage_5_purchase_completed / stage_4_checkout_started) * 1000) / 10 : 0;
    const cr_overall = stage_1_landing > 0 ? Math.round((stage_5_purchase_completed / stage_1_landing) * 1000) / 10 : 0;

    // Drop Off Rates (%)
    const drop_off_1_to_2 = stage_1_landing > 0 ? Math.max(0, Math.round((100 - cr_1_to_2) * 10) / 10) : 0;
    const drop_off_2_to_3 = stage_2_product_view > 0 ? Math.max(0, Math.round((100 - cr_2_to_3) * 10) / 10) : 0;
    const drop_off_3_to_4 = stage_3_add_to_cart > 0 ? Math.max(0, Math.round((100 - cr_3_to_4) * 10) / 10) : 0;
    const drop_off_4_to_5 = stage_4_checkout_started > 0 ? Math.max(0, Math.round((100 - cr_4_to_5) * 10) / 10) : 0;

    const funnelData: FunnelData = {
      stage_1_landing,
      stage_2_product_view,
      stage_3_add_to_cart,
      stage_4_checkout_started,
      stage_5_purchase_completed,
      cr_1_to_2,
      cr_2_to_3,
      cr_3_to_4,
      cr_4_to_5,
      cr_overall,
      drop_off_1_to_2,
      drop_off_2_to_3,
      drop_off_3_to_4,
      drop_off_4_to_5,
      total_revenue: Math.round(total_revenue * 100) / 100,
    };

    return NextResponse.json(funnelData);
  } catch (error: any) {
    console.error('API /admin/analytics/funnel Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
