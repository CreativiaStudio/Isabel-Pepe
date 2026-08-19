import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { incrementDailyMetric } from '@/lib/analytics';
import { shouldIgnoreTracking } from '@/lib/bot-filter';
import { classifyAttribution, extractReferrerHost } from '@/lib/attribution';
import { TrackPayload } from '@/types/analytics';

export async function POST(req: Request) {
  try {
    let payload: TrackPayload;
    try {
      payload = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    const { path, visitorId, sessionId, consentId, referrer, searchParams, telemetry, durationSeconds, isExit } = payload;

    if (!path || !visitorId) {
      return NextResponse.json({ error: 'Missing required parameters: path or visitorId' }, { status: 400 });
    }

    // 1. Extract Geo, IP & User-Agent Headers
    const headers = req.headers;
    const userAgent = headers.get('user-agent') || '';
    const rawIp = headers.get('x-forwarded-for') || headers.get('x-real-ip') || '';
    const ip = rawIp.split(',')[0]?.trim() || '';

    // Geolocation Resolution
    const country =
      headers.get('x-vercel-ip-country') ||
      headers.get('cf-ipcountry') ||
      (process.env.NODE_ENV === 'development' ? 'IT' : 'IT');

    const city =
      headers.get('x-vercel-ip-city') ||
      (process.env.NODE_ENV === 'development' ? 'Local Dev' : 'Sconosciuta');

    const region =
      headers.get('x-vercel-ip-country-region') ||
      headers.get('x-vercel-ip-region') ||
      '';

    // 2. Multi-Level Bot & Internal Route Immune Filter
    const filterResult = shouldIgnoreTracking({
      userAgent,
      ip,
      path,
      clientTelemetry: telemetry,
    });

    if (filterResult.ignore) {
      return NextResponse.json(
        { success: true, ignored: true, reason: filterResult.reason || 'bot_or_internal' },
        { status: 200 }
      );
    }

    // 3. Omnichannel Attribution Engine
    const attribution = classifyAttribution(referrer, searchParams || path);
    const referrerHost = extractReferrerHost(referrer);
    const activeSessionId = sessionId || `sid_${visitorId}_${Date.now()}`;
    const isProduct = path.startsWith('/prodotto/');

    // Extract product slug if on product detail view
    const productSlugMatch = path.match(/^\/prodotto\/([^/?#]+)/);
    const productSlug = productSlugMatch ? decodeURIComponent(productSlugMatch[1]) : null;

    // 4. Manage Session Lifecycle in `analytics_sessions`
    const { data: existingSession, error: sessionFetchError } = await supabaseAdmin
      .from('analytics_sessions')
      .select('*')
      .eq('session_id', activeSessionId)
      .maybeSingle();

    if (sessionFetchError) {
      console.warn('Session query error (non-fatal):', sessionFetchError.message);
    }

    const nowIso = new Date().toISOString();

    if (!existingSession) {
      // Create new session record
      const newSessionRecord = {
        session_id: activeSessionId,
        visitor_id: visitorId,
        consent_id: consentId || null,
        started_at: nowIso,
        last_active_at: nowIso,
        duration_seconds: durationSeconds || 0,
        page_views_count: 1,
        entry_path: path,
        exit_path: path,
        referrer: referrer || null,
        referrer_host: referrerHost || null,
        traffic_source: attribution.traffic_source,
        traffic_medium: attribution.traffic_medium,
        traffic_channel: attribution.traffic_channel,
        utm_source: attribution.utm_source,
        utm_medium: attribution.utm_medium,
        utm_campaign: attribution.utm_campaign,
        utm_content: attribution.utm_content,
        utm_term: attribution.utm_term,
        device_type: telemetry?.device_type || 'desktop',
        browser: telemetry?.browser || null,
        os: telemetry?.os || null,
        screen_resolution: telemetry?.screen_resolution || null,
        country,
        city,
        region,
        is_bounce: true,
        viewed_product: isProduct,
        added_to_cart: false,
        started_checkout: false,
        completed_purchase: false,
        revenue: 0,
        is_bot: false,
        created_at: nowIso,
        updated_at: nowIso,
      };

      const { error: insertSessionError } = await supabaseAdmin
        .from('analytics_sessions')
        .insert([newSessionRecord]);

      if (insertSessionError) {
        console.error('Error creating analytics session:', insertSessionError.message);
      }
    } else {
      // Update existing session record
      if (isExit) {
        // Beacon exit update: update dwell time & exit path
        const updatedDuration = Math.max(
          existingSession.duration_seconds || 0,
          durationSeconds || 0
        );

        await supabaseAdmin
          .from('analytics_sessions')
          .update({
            last_active_at: nowIso,
            exit_path: path,
            duration_seconds: updatedDuration,
            updated_at: nowIso,
          })
          .eq('session_id', activeSessionId);
      } else {
        // New pageview within active session
        const newPageViewsCount = (existingSession.page_views_count || 1) + 1;
        const sessionStartedAt = new Date(existingSession.started_at).getTime();
        const elapsedSeconds = Math.max(0, Math.floor((Date.now() - sessionStartedAt) / 1000));
        const updatedDuration = Math.max(existingSession.duration_seconds || 0, elapsedSeconds);

        await supabaseAdmin
          .from('analytics_sessions')
          .update({
            last_active_at: nowIso,
            page_views_count: newPageViewsCount,
            exit_path: path,
            is_bounce: false, // More than 1 pageview => not a bounce
            duration_seconds: updatedDuration,
            viewed_product: isProduct || Boolean(existingSession.viewed_product),
            updated_at: nowIso,
          })
          .eq('session_id', activeSessionId);
      }
    }

    // 5. Insert Enriched Page View (if not an exit-only beacon)
    if (!isExit) {
      const pageViewRecord = {
        session_id: activeSessionId,
        visitor_id: visitorId,
        consent_id: consentId || null,
        path,
        referrer: referrer || null,
        referrer_host: referrerHost || null,
        traffic_source: attribution.traffic_source,
        traffic_medium: attribution.traffic_medium,
        traffic_channel: attribution.traffic_channel,
        utm_source: attribution.utm_source,
        utm_medium: attribution.utm_medium,
        utm_campaign: attribution.utm_campaign,
        utm_content: attribution.utm_content,
        utm_term: attribution.utm_term,
        gclid: attribution.gclid,
        fbclid: attribution.fbclid,
        device_type: telemetry?.device_type || 'desktop',
        browser: telemetry?.browser || null,
        os: telemetry?.os || null,
        screen_resolution: telemetry?.screen_resolution || null,
        country,
        city,
        region,
        duration_seconds: durationSeconds || 0,
        is_bot: false,
        created_at: nowIso,
      };

      const { error: pageViewError } = await supabaseAdmin
        .from('page_views')
        .insert([pageViewRecord]);

      if (pageViewError) {
        console.error('Error inserting enriched page view:', pageViewError.message);
      }

      // 6. Record `view_item` event if landing on product page
      if (isProduct && productSlug) {
        // Query product details for rich event metadata
        let productName: string | null = null;
        let productId: string | null = null;
        let productPrice: number | null = null;
        let productCategory: string | null = null;

        try {
          const { data: prod } = await supabaseAdmin
            .from('products')
            .select('id, name, price, discount_price, category')
            .eq('slug', productSlug)
            .maybeSingle();

          if (prod) {
            productId = prod.id;
            productName = prod.name;
            productPrice = prod.discount_price || prod.price;
            productCategory = prod.category;
          }
        } catch {
          // ignore error
        }

        await supabaseAdmin.from('analytics_events').insert([
          {
            session_id: activeSessionId,
            visitor_id: visitorId,
            event_name: 'view_item',
            path,
            product_id: productId,
            product_name: productName,
            product_slug: productSlug,
            product_category: productCategory,
            product_price: productPrice,
            quantity: 1,
            event_data: {
              source: attribution.traffic_source,
              channel: attribution.traffic_channel,
            },
            created_at: nowIso,
          },
        ]);
      }

      // 7. Update Daily Aggregates
      incrementDailyMetric({ isProduct }).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      sessionId: activeSessionId,
      visitorId,
      channel: attribution.traffic_channel,
    });
  } catch (error: any) {
    console.error('Tracker Ingestion Route Error:', error);
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}
