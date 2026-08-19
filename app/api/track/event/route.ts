import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { incrementDailyMetric } from '@/lib/analytics';
import { shouldIgnoreTracking } from '@/lib/bot-filter';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function sanitizeUuid(val?: any): string | null {
  if (!val || typeof val !== 'string') return null;
  const trimmed = val.trim();
  return UUID_REGEX.test(trimmed) ? trimmed : null;
}

export async function POST(req: Request) {
  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    const { eventName, eventData, visitorId, sessionId, path } = body;

    if (!eventName || !visitorId) {
      return NextResponse.json({ error: 'Missing eventName or visitorId' }, { status: 400 });
    }

    // 1. Bot & Internal Traffic Filter
    const headers = req.headers;
    const userAgent = headers.get('user-agent') || '';
    const rawIp = headers.get('x-forwarded-for') || headers.get('x-real-ip') || '';
    const ip = rawIp.split(',')[0]?.trim() || '';

    const filterResult = shouldIgnoreTracking({
      userAgent,
      ip,
      path: path || '/',
    });

    if (filterResult.ignore) {
      return NextResponse.json(
        { success: true, ignored: true, reason: filterResult.reason || 'bot_or_internal' },
        { status: 200 }
      );
    }

    const activeSessionId = sessionId || `sid_${visitorId}_${Date.now()}`;
    const nowIso = new Date().toISOString();
    const data = eventData || {};

    const productId = sanitizeUuid(data.product_id || data.productId);
    const orderId = sanitizeUuid(data.order_id || data.orderId);
    const productName = data.product_name || data.name || null;
    const productSlug = data.product_slug || data.slug || null;
    const productCategory = data.product_category || data.category || null;
    const productPrice = typeof data.product_price === 'number' ? data.product_price : (typeof data.price === 'number' ? data.price : null);
    const quantity = typeof data.quantity === 'number' ? data.quantity : 1;
    const cartTotal = typeof data.cart_total === 'number' ? data.cart_total : (typeof data.total === 'number' ? data.total : null);
    const couponCode = data.coupon_code || data.coupon || null;

    // 2. Insert into `public.analytics_events`
    const { error: eventInsertError } = await supabaseAdmin
      .from('analytics_events')
      .insert([
        {
          session_id: activeSessionId,
          visitor_id: visitorId,
          event_name: eventName,
          path: path || '/',
          product_id: productId,
          product_name: productName,
          product_slug: productSlug,
          product_category: productCategory,
          product_price: productPrice,
          quantity: quantity,
          cart_total: cartTotal,
          coupon_code: couponCode,
          order_id: orderId,
          event_data: data,
          created_at: nowIso,
        },
      ]);

    if (eventInsertError) {
      console.error('Error inserting analytics event:', eventInsertError.message);
    }

    // 3. Update Milestone Flags on `analytics_sessions`
    const sessionUpdates: Record<string, any> = {
      last_active_at: nowIso,
      updated_at: nowIso,
    };

    if (eventName === 'view_item') {
      sessionUpdates.viewed_product = true;
    } else if (eventName === 'add_to_cart') {
      sessionUpdates.added_to_cart = true;
      sessionUpdates.viewed_product = true;
      sessionUpdates.is_bounce = false;
    } else if (eventName === 'begin_checkout') {
      sessionUpdates.started_checkout = true;
      sessionUpdates.added_to_cart = true;
      sessionUpdates.is_bounce = false;
    } else if (eventName === 'purchase') {
      sessionUpdates.completed_purchase = true;
      sessionUpdates.started_checkout = true;
      sessionUpdates.added_to_cart = true;
      sessionUpdates.is_bounce = false;
      if (orderId) sessionUpdates.order_id = orderId;
      if (typeof data.revenue === 'number') {
        sessionUpdates.revenue = data.revenue;
      } else if (typeof data.amount === 'number') {
        sessionUpdates.revenue = data.amount;
      } else if (cartTotal) {
        sessionUpdates.revenue = cartTotal;
      }
    }

    const { error: sessionUpdateError } = await supabaseAdmin
      .from('analytics_sessions')
      .update(sessionUpdates)
      .eq('session_id', activeSessionId);

    if (sessionUpdateError) {
      console.warn('Session milestone update warning:', sessionUpdateError.message);
    }

    // 4. Update Daily Analytics Metrics
    if (eventName === 'add_to_cart') {
      incrementDailyMetric({ isCart: true }).catch(() => {});
    } else if (eventName === 'purchase') {
      const revenue = typeof data.revenue === 'number' ? data.revenue : (typeof data.amount === 'number' ? data.amount : 0);
      incrementDailyMetric({ isOrder: true, amount: revenue }).catch(() => {});
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Track Event API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}
