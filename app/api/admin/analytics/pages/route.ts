import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { parseDateRange, classifyPageType, getPageTitleFromPath } from '@/lib/analytics-query';
import { TopPageMetric, TopProductMetric } from '@/types/analytics';
import { verifyAdminAuth } from '@/lib/auth-guard';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const auth = await verifyAdminAuth(req);
  if (!auth.authorized) return auth.response;

  try {
    const { searchParams } = new URL(req.url);
    const range = searchParams.get('range') || 'today';
    const fromParam = searchParams.get('from');
    const toParam = searchParams.get('to');
    const typeFilter = searchParams.get('type') || 'all';
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const sortBy = searchParams.get('sort_by') || 'views';

    const bounds = parseDateRange(range, fromParam, toParam);
    const startIso = bounds.startDate.toISOString();
    const endIso = bounds.endDate.toISOString();

    // 1. Query Page Views, Sessions, Events & Products
    const [
      { data: pageViews, error: pvErr },
      { data: sessions, error: sessErr },
      { data: events, error: evErr },
      { data: products, error: prodErr },
    ] = await Promise.all([
      supabaseAdmin
        .from('page_views')
        .select('id, visitor_id, session_id, path, duration_seconds, created_at, is_bot')
        .gte('created_at', startIso)
        .lte('created_at', endIso)
        .eq('is_bot', false),
      supabaseAdmin
        .from('analytics_sessions')
        .select('session_id, visitor_id, entry_path, exit_path, is_bounce, started_at, is_bot')
        .gte('started_at', startIso)
        .lte('started_at', endIso)
        .eq('is_bot', false),
      supabaseAdmin
        .from('analytics_events')
        .select('id, session_id, visitor_id, event_name, path, product_id, product_slug, product_price, quantity, order_id, created_at')
        .gte('created_at', startIso)
        .lte('created_at', endIso),
      supabaseAdmin
        .from('products')
        .select('id, name, slug, price, discount_price, category, image_primary, gallery')
        .order('created_at', { ascending: false }),
    ]);

    if (pvErr) console.warn('Pages pv error:', pvErr.message);
    if (sessErr) console.warn('Pages sessions error:', sessErr.message);
    if (evErr) console.warn('Pages events error:', evErr.message);
    if (prodErr) console.warn('Pages products error:', prodErr.message);

    const safePv = pageViews || [];
    const safeSessions = sessions || [];
    const safeEvents = events || [];
    const safeProducts = products || [];

    // 2. Aggregate Pages Metrics
    const pageMap = new Map<
      string,
      {
        path: string;
        viewsCount: number;
        visitors: Set<string>;
        durationSum: number;
        durationCount: number;
      }
    >();

    for (const pv of safePv) {
      const cleanPath = pv.path?.split('?')[0] || '/';
      if (!pageMap.has(cleanPath)) {
        pageMap.set(cleanPath, {
          path: cleanPath,
          viewsCount: 0,
          visitors: new Set(),
          durationSum: 0,
          durationCount: 0,
        });
      }
      const rec = pageMap.get(cleanPath)!;
      rec.viewsCount += 1;
      if (pv.visitor_id) rec.visitors.add(pv.visitor_id);
      if (pv.duration_seconds && pv.duration_seconds > 0) {
        rec.durationSum += pv.duration_seconds;
        rec.durationCount += 1;
      }
    }

    // Direct entrances and bounces by path
    const entryMap = new Map<string, { entrances: number; bounces: number; exits: number }>();
    for (const s of safeSessions) {
      const entry = s.entry_path?.split('?')[0] || '/';
      if (!entryMap.has(entry)) {
        entryMap.set(entry, { entrances: 0, bounces: 0, exits: 0 });
      }
      const eRec = entryMap.get(entry)!;
      eRec.entrances += 1;
      if (s.is_bounce) eRec.bounces += 1;

      const exit = s.exit_path?.split('?')[0] || entry;
      if (!entryMap.has(exit)) {
        entryMap.set(exit, { entrances: 0, bounces: 0, exits: 0 });
      }
      entryMap.get(exit)!.exits += 1;
    }

    // Build pages list
    let pages: TopPageMetric[] = Array.from(pageMap.values()).map((item) => {
      const cat = classifyPageType(item.path);
      const title = getPageTitleFromPath(item.path);
      const unique_visitors = item.visitors.size;
      const avg_time_seconds =
        item.durationCount > 0 ? Math.round(item.durationSum / item.durationCount) : 0;

      const entryInfo = entryMap.get(item.path) || { entrances: 0, bounces: 0, exits: 0 };
      const direct_entrances = entryInfo.entrances;
      const bounce_rate =
        direct_entrances > 0 ? Math.round((entryInfo.bounces / direct_entrances) * 1000) / 10 : 0;
      const exit_rate =
        item.viewsCount > 0 ? Math.round((entryInfo.exits / item.viewsCount) * 1000) / 10 : 0;

      return {
        path: item.path,
        page_title: title,
        category: cat,
        views_count: item.viewsCount,
        unique_visitors,
        avg_time_seconds,
        bounce_rate,
        direct_entrances,
        exit_rate,
      };
    });

    // Apply type filter
    if (typeFilter && typeFilter !== 'all') {
      pages = pages.filter((p) => p.category === typeFilter);
    }

    // Sort pages
    pages.sort((a, b) => {
      if (sortBy === 'visitors') return b.unique_visitors - a.unique_visitors;
      if (sortBy === 'avg_time') return b.avg_time_seconds - a.avg_time_seconds;
      if (sortBy === 'bounce_rate') return b.bounce_rate - a.bounce_rate;
      return b.views_count - a.views_count;
    });

    pages = pages.slice(0, limit);

    // 3. Aggregate Top Products Metrics
    const productsList: TopProductMetric[] = safeProducts.map((prod) => {
      const prodPath = `/prodotto/${prod.slug}`;
      const matchingPv = safePv.filter(
        (pv) => pv.path === prodPath || pv.path?.startsWith(`${prodPath}?`)
      );

      const uniqueViewers = new Set<string>();
      matchingPv.forEach((pv) => pv.visitor_id && uniqueViewers.add(pv.visitor_id));

      const matchingEvents = safeEvents.filter(
        (ev) =>
          ev.product_id === prod.id ||
          ev.product_slug === prod.slug ||
          ev.path === prodPath ||
          ev.path?.startsWith(`${prodPath}?`)
      );

      matchingEvents.forEach((ev) => {
        if (ev.event_name === 'view_item' && ev.visitor_id) {
          uniqueViewers.add(ev.visitor_id);
        }
      });

      const cartAdditions = matchingEvents.filter((ev) => ev.event_name === 'add_to_cart').length;
      const purchases = matchingEvents.filter((ev) => ev.event_name === 'purchase');
      const purchases_count = purchases.length;

      const effectivePrice = Number(prod.discount_price) || Number(prod.price) || 0;
      const revenue = purchases.reduce((sum, ev) => {
        const itemRev = (typeof ev.product_price === 'number' ? ev.product_price : effectivePrice) * (ev.quantity || 1);
        return sum + itemRev;
      }, 0);

      const views_count = Math.max(matchingPv.length, uniqueViewers.size);
      const conversion_rate =
        views_count > 0 ? Math.round((purchases_count / views_count) * 1000) / 10 : 0;

      const image = prod.image_primary || (Array.isArray(prod.gallery) && prod.gallery.length > 0 ? prod.gallery[0] : undefined);

      return {
        product_id: prod.id,
        name: prod.name,
        slug: prod.slug,
        category: prod.category || 'Gioielli',
        price: effectivePrice,
        image,
        views_count,
        unique_viewers: uniqueViewers.size,
        cart_additions_count: cartAdditions,
        purchases_count,
        revenue: Math.round(revenue * 100) / 100,
        conversion_rate,
      };
    });

    productsList.sort((a, b) => b.views_count - a.views_count || b.revenue - a.revenue);

    return NextResponse.json({
      pages,
      products: productsList.slice(0, limit),
    });
  } catch (error: any) {
    console.error('API /admin/analytics/pages Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
