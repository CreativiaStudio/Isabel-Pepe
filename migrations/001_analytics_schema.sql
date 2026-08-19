-- =========================================================================
-- ISABEL PEPE LUXURY E-COMMERCE - FIRST-PARTY ANALYTICS & INTELLIGENCE SCHEMA
-- Migration: 001_analytics_schema.sql
-- =========================================================================

-- 1. UPGRADE TABELLA public.page_views
ALTER TABLE public.page_views
ADD COLUMN IF NOT EXISTS session_id TEXT,
ADD COLUMN IF NOT EXISTS referrer TEXT,
ADD COLUMN IF NOT EXISTS referrer_host TEXT,
ADD COLUMN IF NOT EXISTS traffic_source TEXT DEFAULT 'direct',
ADD COLUMN IF NOT EXISTS traffic_medium TEXT DEFAULT 'none',
ADD COLUMN IF NOT EXISTS traffic_channel TEXT DEFAULT 'Direct',
ADD COLUMN IF NOT EXISTS utm_source TEXT,
ADD COLUMN IF NOT EXISTS utm_medium TEXT,
ADD COLUMN IF NOT EXISTS utm_campaign TEXT,
ADD COLUMN IF NOT EXISTS utm_content TEXT,
ADD COLUMN IF NOT EXISTS utm_term TEXT,
ADD COLUMN IF NOT EXISTS gclid TEXT,
ADD COLUMN IF NOT EXISTS fbclid TEXT,
ADD COLUMN IF NOT EXISTS device_type TEXT DEFAULT 'desktop',
ADD COLUMN IF NOT EXISTS browser TEXT,
ADD COLUMN IF NOT EXISTS os TEXT,
ADD COLUMN IF NOT EXISTS screen_resolution TEXT,
ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'IT',
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS region TEXT,
ADD COLUMN IF NOT EXISTS duration_seconds INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_bot BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON public.page_views(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_views_session ON public.page_views(session_id);
CREATE INDEX IF NOT EXISTS idx_page_views_visitor ON public.page_views(visitor_id);
CREATE INDEX IF NOT EXISTS idx_page_views_path ON public.page_views(path);
CREATE INDEX IF NOT EXISTS idx_page_views_channel ON public.page_views(traffic_channel);
CREATE INDEX IF NOT EXISTS idx_page_views_city ON public.page_views(city, country);
CREATE INDEX IF NOT EXISTS idx_page_views_bot ON public.page_views(is_bot);

-- 2. CREAZIONE TABELLA public.analytics_sessions
CREATE TABLE IF NOT EXISTS public.analytics_sessions (
  session_id TEXT PRIMARY KEY,
  visitor_id TEXT NOT NULL,
  consent_id TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_active_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  duration_seconds INTEGER DEFAULT 0,
  page_views_count INTEGER DEFAULT 1,
  entry_path TEXT NOT NULL,
  exit_path TEXT,
  referrer TEXT,
  referrer_host TEXT,
  traffic_source TEXT NOT NULL DEFAULT 'direct',
  traffic_medium TEXT NOT NULL DEFAULT 'none',
  traffic_channel TEXT NOT NULL DEFAULT 'Direct',
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,
  device_type TEXT DEFAULT 'desktop',
  browser TEXT,
  os TEXT,
  screen_resolution TEXT,
  country TEXT DEFAULT 'IT',
  city TEXT,
  region TEXT,
  is_bounce BOOLEAN DEFAULT TRUE,
  viewed_product BOOLEAN DEFAULT FALSE,
  added_to_cart BOOLEAN DEFAULT FALSE,
  started_checkout BOOLEAN DEFAULT FALSE,
  completed_purchase BOOLEAN DEFAULT FALSE,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  revenue NUMERIC DEFAULT 0,
  is_bot BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_started_at ON public.analytics_sessions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_visitor ON public.analytics_sessions(visitor_id);
CREATE INDEX IF NOT EXISTS idx_sessions_channel ON public.analytics_sessions(traffic_channel);
CREATE INDEX IF NOT EXISTS idx_sessions_campaign ON public.analytics_sessions(utm_campaign);
CREATE INDEX IF NOT EXISTS idx_sessions_city ON public.analytics_sessions(city, country);
CREATE INDEX IF NOT EXISTS idx_sessions_conversion ON public.analytics_sessions(completed_purchase);
CREATE INDEX IF NOT EXISTS idx_sessions_bot ON public.analytics_sessions(is_bot);

-- 3. CREAZIONE TABELLA public.analytics_events
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  visitor_id TEXT NOT NULL,
  event_name TEXT NOT NULL,
  path TEXT NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT,
  product_slug TEXT,
  product_category TEXT,
  product_price NUMERIC,
  quantity INTEGER DEFAULT 1,
  cart_total NUMERIC,
  coupon_code TEXT,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  event_data JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_session ON public.analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_events_visitor ON public.analytics_events(visitor_id);
CREATE INDEX IF NOT EXISTS idx_events_name_created ON public.analytics_events(event_name, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_product ON public.analytics_events(product_id);

-- 4. UPGRADE TABELLA public.daily_analytics
ALTER TABLE public.daily_analytics
ADD COLUMN IF NOT EXISTS total_sessions INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS bounced_sessions INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS checkouts_started INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS avg_duration_seconds INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS channel_breakdown JSONB DEFAULT '{}'::JSONB,
ADD COLUMN IF NOT EXISTS device_breakdown JSONB DEFAULT '{}'::JSONB,
ADD COLUMN IF NOT EXISTS geo_breakdown JSONB DEFAULT '{}'::JSONB,
ADD COLUMN IF NOT EXISTS top_pages JSONB DEFAULT '[]'::JSONB;
