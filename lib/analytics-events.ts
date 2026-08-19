// =========================================================================
// ISABEL PEPE LUXURY E-COMMERCE - FIRST-PARTY EVENT TRACKING HELPER
// File: lib/analytics-events.ts
// =========================================================================

import { getOrCreateVisitorId, getOrCreateSessionId, STORAGE_KEYS } from '@/lib/session';

export interface AnalyticsEventParams {
  product_id?: string | null;
  product_name?: string | null;
  product_slug?: string | null;
  product_category?: string | null;
  product_price?: number | null;
  price?: number | null;
  quantity?: number;
  cart_total?: number | null;
  coupon_code?: string | null;
  order_id?: string | null;
  revenue?: number | null;
  items_count?: number;
  [key: string]: any;
}

/**
 * Dispatches a client-side first-party analytics event to `/api/track/event`
 */
export async function trackAnalyticsEvent(
  eventName:
    | 'view_item'
    | 'add_to_cart'
    | 'remove_from_cart'
    | 'view_cart'
    | 'begin_checkout'
    | 'apply_coupon'
    | 'purchase'
    | string,
  eventData?: AnalyticsEventParams
): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    const visitorId = getOrCreateVisitorId();
    const { sessionId } = getOrCreateSessionId();
    const consentId = localStorage.getItem(STORAGE_KEYS.CONSENT_ID) || null;
    const path = window.location.pathname + window.location.search;

    const payload = {
      eventName,
      eventData: eventData || {},
      visitorId,
      sessionId,
      consentId,
      path,
    };

    // Use keepalive fetch to ensure requests complete even during quick page transitions
    await fetch('/api/track/event', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch((err) => {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Analytics event tracking error:', err);
      }
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Failed to dispatch analytics event:', error);
    }
  }
}

/**
 * Convenience helper for `add_to_cart` events
 */
export function trackAddToCart(params: {
  product_id: string;
  product_name: string;
  product_slug?: string;
  product_category?: string;
  price: number;
  quantity?: number;
}): void {
  trackAnalyticsEvent('add_to_cart', {
    product_id: params.product_id,
    product_name: params.product_name,
    product_slug: params.product_slug,
    product_category: params.product_category,
    product_price: params.price,
    quantity: params.quantity || 1,
  });
}

/**
 * Convenience helper for `begin_checkout` events
 */
export function trackBeginCheckout(params: {
  cart_total: number;
  items_count: number;
  coupon_code?: string;
}): void {
  trackAnalyticsEvent('begin_checkout', {
    cart_total: params.cart_total,
    items_count: params.items_count,
    coupon_code: params.coupon_code,
  });
}
