// =========================================================================
// ISABEL PEPE LUXURY E-COMMERCE - FIRST-PARTY ANALYTICS & INTELLIGENCE TYPES
// File: types/analytics.ts
// =========================================================================

export type TrafficChannel =
  | 'Google Organic'
  | 'Google Ads'
  | 'Meta Ads'
  | 'Instagram Organic'
  | 'Facebook Organic'
  | 'Direct'
  | 'Referral'
  | 'WhatsApp CRM'
  | 'Email CRM'
  | 'TikTok'
  | 'Pinterest'
  | 'Other Organic Search';

export type DeviceType = 'desktop' | 'mobile' | 'tablet';

export type DateRangeKey = 'today' | '7d' | '30d' | 'month' | 'all' | 'custom';

export interface AttributionData {
  traffic_channel: TrafficChannel;
  traffic_source: string;
  traffic_medium: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  gclid: string | null;
  fbclid: string | null;
  ttclid?: string | null;
}

export interface AttributionParams {
  referrer?: string | null;
  searchParams?: Record<string, string | null | undefined> | URLSearchParams;
  url?: string;
}

export interface ClientTelemetry {
  screen_resolution?: string;
  viewport_width?: number;
  viewport_height?: number;
  pixel_ratio?: number;
  device_type?: DeviceType;
  browser?: string;
  os?: string;
  language?: string;
  timezone?: string;
  is_webdriver?: boolean;
}

export interface VisitorSession {
  session_id: string;
  visitor_id: string;
  consent_id?: string | null;
  started_at: string;
  last_active_at: string;
  duration_seconds: number;
  page_views_count: number;
  entry_path: string;
  exit_path?: string | null;
  referrer?: string | null;
  referrer_host?: string | null;
  traffic_source: string;
  traffic_medium: string;
  traffic_channel: TrafficChannel;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_content?: string | null;
  utm_term?: string | null;
  device_type: DeviceType;
  browser?: string | null;
  os?: string | null;
  screen_resolution?: string | null;
  country: string;
  city?: string | null;
  region?: string | null;
  is_bounce: boolean;
  viewed_product: boolean;
  added_to_cart: boolean;
  started_checkout: boolean;
  completed_purchase: boolean;
  order_id?: string | null;
  revenue: number;
  is_bot: boolean;
  created_at: string;
  updated_at: string;
}

export interface AnalyticsEvent {
  id?: string;
  session_id: string;
  visitor_id: string;
  event_name:
    | 'view_page'
    | 'view_item'
    | 'add_to_cart'
    | 'remove_from_cart'
    | 'view_cart'
    | 'begin_checkout'
    | 'apply_coupon'
    | 'purchase'
    | string;
  path: string;
  product_id?: string | null;
  product_name?: string | null;
  product_slug?: string | null;
  product_category?: string | null;
  product_price?: number | null;
  quantity?: number;
  cart_total?: number | null;
  coupon_code?: string | null;
  order_id?: string | null;
  event_data?: Record<string, any>;
  created_at?: string;
}

export interface EnrichedPageView {
  id?: string;
  session_id?: string | null;
  visitor_id: string;
  consent_id?: string | null;
  path: string;
  referrer?: string | null;
  referrer_host?: string | null;
  traffic_source?: string;
  traffic_medium?: string;
  traffic_channel?: TrafficChannel;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_content?: string | null;
  utm_term?: string | null;
  gclid?: string | null;
  fbclid?: string | null;
  device_type?: DeviceType;
  browser?: string | null;
  os?: string | null;
  screen_resolution?: string | null;
  country?: string;
  city?: string | null;
  region?: string | null;
  duration_seconds?: number;
  is_bot?: boolean;
  created_at?: string;
}

export interface DailyAnalyticsRecord {
  date: string;
  total_views: number;
  unique_visitors: number;
  total_sessions: number;
  bounced_sessions: number;
  product_views: number;
  cart_additions: number;
  checkouts_started: number;
  orders_count: number;
  total_revenue: number;
  avg_duration_seconds: number;
  channel_breakdown: Record<string, number>;
  device_breakdown: Record<string, number>;
  geo_breakdown: Record<string, number>;
  top_pages: Array<{ path: string; views: number; visitors: number }>;
  top_products: Array<{
    id: string;
    name: string;
    views: number;
    sales: number;
    revenue: number;
  }>;
  created_at?: string;
  updated_at?: string;
}

export interface FunnelData {
  stage_1_landing: number;
  stage_2_product_view: number;
  stage_3_add_to_cart: number;
  stage_4_checkout_started: number;
  stage_5_purchase_completed: number;
  cr_1_to_2: number;
  cr_2_to_3: number;
  cr_3_to_4: number;
  cr_4_to_5: number;
  cr_overall: number;
  drop_off_1_to_2: number;
  drop_off_2_to_3: number;
  drop_off_3_to_4: number;
  drop_off_4_to_5: number;
  total_revenue: number;
}

export interface KpiSummary {
  real_unique_visitors: number;
  total_page_views: number;
  total_sessions: number;
  active_live_visitors: number;
  bounce_rate: number; // in %
  avg_session_duration_seconds: number;
  conversion_rate: number; // in %
  total_revenue: number;
  total_orders: number;
  prev_period_change?: {
    visitors_change: number; // % delta vs previous period
    views_change: number;
    revenue_change: number;
    orders_change: number;
  };
}

export interface TimeSeriesPoint {
  timestamp: string;
  date_label: string;
  page_views: number;
  unique_visitors: number;
  sessions: number;
  product_views: number;
  cart_additions: number;
  orders: number;
  revenue: number;
}

export interface TopProductMetric {
  product_id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  image?: string;
  views_count: number;
  unique_viewers: number;
  cart_additions_count: number;
  purchases_count: number;
  revenue: number;
  conversion_rate: number;
}

export interface TopPageMetric {
  path: string;
  page_title?: string;
  category?: string;
  views_count: number;
  unique_visitors: number;
  avg_time_seconds: number;
  bounce_rate: number;
  direct_entrances: number;
  exit_rate: number;
}

export interface GeoMetric {
  country: string;
  country_name?: string;
  city: string;
  region?: string;
  visitors_count: number;
  sessions_count: number;
  page_views_count: number;
  orders_count: number;
  revenue: number;
  conversion_rate: number;
}

export interface SearchConsoleQueryRow {
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface SearchConsolePageRow {
  page: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface SearchConsoleData {
  total_impressions: number;
  total_clicks: number;
  avg_ctr: number;
  avg_position: number;
  queries: SearchConsoleQueryRow[];
  pages: SearchConsolePageRow[];
  is_mock_fallback?: boolean;
  last_updated: string;
}

export interface VisitorIdentityRecord {
  id?: string;
  visitor_id: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  role?: string | null; // e.g. 'VIP', 'Founder', 'Customer', 'Test'
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface TrackPayload {
  path: string;
  visitorId: string;
  sessionId?: string;
  consentId?: string | null;
  referrer?: string | null;
  searchParams?: Record<string, string>;
  telemetry?: ClientTelemetry;
  eventName?: string;
  eventData?: Record<string, any>;
  durationSeconds?: number;
  isExit?: boolean;
}

export interface TrackResponse {
  success: boolean;
  ignored?: boolean;
  reason?: string;
  sessionId?: string;
  visitorId?: string;
  channel?: TrafficChannel;
}
