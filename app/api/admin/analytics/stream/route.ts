import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getVisitorIdentitiesMap } from '@/lib/analytics-query';
import { verifyAdminAuth } from '@/lib/auth-guard';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const auth = await verifyAdminAuth(req);
  if (!auth.authorized) return auth.response;

  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)));
    const search = searchParams.get('search')?.toLowerCase().trim();
    const channelFilter = searchParams.get('channel');
    const visitorFilter = searchParams.get('visitor_id');

    const offset = (page - 1) * limit;

    // 1. Query `analytics_sessions`
    let query = supabaseAdmin
      .from('analytics_sessions')
      .select('*', { count: 'exact' })
      .eq('is_bot', false)
      .order('last_active_at', { ascending: false });

    if (visitorFilter) {
      query = query.eq('visitor_id', visitorFilter);
    }

    if (channelFilter && channelFilter !== 'all') {
      const cleanChannel = channelFilter.toLowerCase().replace(/_/g, ' ');
      query = query.or(`traffic_channel.ilike.%${cleanChannel}%,traffic_channel.ilike.%${channelFilter}%`);
    }

    const { data: sessions, count: totalSessionsCount, error: sessErr } = await query
      .range(offset, offset + limit - 1);

    if (sessErr) console.warn('Stream sessions query error:', sessErr.message);

    // 2. Fallback / supplementary query on `page_views` if sessions are 0
    let streamItems: any[] = [];
    let totalCount = totalSessionsCount || 0;

    const identitiesMap = await getVisitorIdentitiesMap();

    if (sessions && sessions.length > 0) {
      streamItems = sessions.map((s) => {
        const identity = identitiesMap.get(s.visitor_id) || null;
        return {
          id: s.session_id,
          session_id: s.session_id,
          visitor_id: s.visitor_id,
          identity,
          started_at: s.started_at,
          last_active_at: s.last_active_at,
          duration_seconds: s.duration_seconds || 0,
          page_views_count: s.page_views_count || 1,
          entry_path: s.entry_path || '/',
          current_path: s.exit_path || s.entry_path || '/',
          referrer: s.referrer || null,
          referrer_host: s.referrer_host || null,
          traffic_channel: s.traffic_channel || 'Direct',
          utm_campaign: s.utm_campaign || null,
          utm_source: s.utm_source || s.traffic_source || null,
          device_type: s.device_type || 'desktop',
          browser: s.browser || null,
          os: s.os || null,
          country: s.country || 'IT',
          city: s.city || null,
          region: s.region || null,
          consent_id: s.consent_id || null,
          is_bounce: Boolean(s.is_bounce),
          viewed_product: Boolean(s.viewed_product),
          added_to_cart: Boolean(s.added_to_cart),
          started_checkout: Boolean(s.started_checkout),
          completed_purchase: Boolean(s.completed_purchase),
          order_id: s.order_id || null,
          revenue: Number(s.revenue) || 0,
        };
      });
    } else {
      // Synthesize stream from recent page views
      let pvQuery = supabaseAdmin
        .from('page_views')
        .select('*', { count: 'exact' })
        .eq('is_bot', false)
        .order('created_at', { ascending: false });

      if (visitorFilter) {
        pvQuery = pvQuery.eq('visitor_id', visitorFilter);
      }

      const { data: pageViews, count: pvTotal } = await pvQuery.range(offset, offset + limit - 1);

      totalCount = pvTotal || 0;
      streamItems = (pageViews || []).map((pv) => {
        const identity = identitiesMap.get(pv.visitor_id) || null;
        return {
          id: pv.id,
          session_id: pv.session_id || `sid_${pv.visitor_id}`,
          visitor_id: pv.visitor_id,
          identity,
          started_at: pv.created_at,
          last_active_at: pv.created_at,
          duration_seconds: pv.duration_seconds || 0,
          page_views_count: 1,
          entry_path: pv.path || '/',
          current_path: pv.path || '/',
          referrer: pv.referrer || null,
          referrer_host: pv.referrer_host || null,
          traffic_channel: pv.traffic_channel || 'Direct',
          utm_campaign: pv.utm_campaign || null,
          utm_source: pv.utm_source || pv.traffic_source || null,
          device_type: pv.device_type || 'desktop',
          browser: pv.browser || null,
          os: pv.os || null,
          country: pv.country || 'IT',
          city: pv.city || null,
          region: pv.region || null,
          consent_id: pv.consent_id || null,
          is_bounce: true,
          viewed_product: pv.path?.startsWith('/prodotto/') || false,
          added_to_cart: false,
          started_checkout: pv.path?.startsWith('/checkout') || false,
          completed_purchase: false,
          order_id: null,
          revenue: 0,
        };
      });
    }

    // Apply search filter if provided
    if (search) {
      streamItems = streamItems.filter((item) => {
        const nameMatch = item.identity?.name?.toLowerCase().includes(search);
        const emailMatch = item.identity?.email?.toLowerCase().includes(search);
        const pathMatch = item.current_path?.toLowerCase().includes(search);
        const vidMatch = item.visitor_id?.toLowerCase().includes(search);
        const cityMatch = item.city?.toLowerCase().includes(search);
        return nameMatch || emailMatch || pathMatch || vidMatch || cityMatch;
      });
    }

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      stream: streamItems,
      total: totalCount,
      page,
      limit,
      totalPages,
    });
  } catch (error: any) {
    console.error('API /admin/analytics/stream Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
