// @ts-ignore
import { Client } from 'pg';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function setupSchema() {
  const dbUrl = process.env.SUPABASE_DB_URL;
  if (!dbUrl) {
    throw new Error('SUPABASE_DB_URL not found in .env.local');
  }

  const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();
  console.log('Connected to Supabase PostgreSQL database.');

  // 1. Table cookie_consents
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.cookie_consents (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      consent_id TEXT NOT NULL UNIQUE,
      visitor_id TEXT NOT NULL,
      essential BOOLEAN NOT NULL DEFAULT TRUE,
      functional BOOLEAN NOT NULL DEFAULT FALSE,
      analytics BOOLEAN NOT NULL DEFAULT FALSE,
      marketing BOOLEAN NOT NULL DEFAULT FALSE,
      consent_type TEXT NOT NULL DEFAULT 'all', -- 'all', 'essential', 'custom'
      ip_address TEXT,
      user_agent TEXT,
      policy_version TEXT NOT NULL DEFAULT '1.0',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_cookie_consents_visitor ON public.cookie_consents(visitor_id);
    CREATE INDEX IF NOT EXISTS idx_cookie_consents_cid ON public.cookie_consents(consent_id);
  `);
  console.log('✅ public.cookie_consents table & indexes created.');

  // 2. Add columns to abandoned_carts
  await client.query(`
    ALTER TABLE public.abandoned_carts 
    ADD COLUMN IF NOT EXISTS visitor_id TEXT,
    ADD COLUMN IF NOT EXISTS consent_id TEXT,
    ADD COLUMN IF NOT EXISTS marketing_consent BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS crm_synced BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS crm_synced_at TIMESTAMPTZ;

    CREATE INDEX IF NOT EXISTS idx_abandoned_carts_visitor ON public.abandoned_carts(visitor_id);
    CREATE INDEX IF NOT EXISTS idx_abandoned_carts_email ON public.abandoned_carts(email);
  `);
  console.log('✅ public.abandoned_carts updated with tracking and consent columns.');

  // 3. Add consent_id to page_views
  await client.query(`
    ALTER TABLE public.page_views 
    ADD COLUMN IF NOT EXISTS consent_id TEXT;

    CREATE INDEX IF NOT EXISTS idx_page_views_visitor ON public.page_views(visitor_id);
  `);
  console.log('✅ public.page_views updated with consent_id.');

  // 4. Table crm_contacts (local mirror / logs)
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.crm_contacts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT NOT NULL UNIQUE,
      phone TEXT,
      first_name TEXT,
      last_name TEXT,
      visitor_id TEXT,
      consent_id TEXT,
      marketing_consent BOOLEAN DEFAULT FALSE,
      tags TEXT[] DEFAULT ARRAY['isabel-pepe']::TEXT[],
      status TEXT DEFAULT 'lead', -- 'lead', 'abandoned_cart', 'customer'
      last_synced_at TIMESTAMPTZ DEFAULT NOW(),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_crm_contacts_email ON public.crm_contacts(email);
  `);
  console.log('✅ public.crm_contacts table created.');

  await client.end();
  console.log('🚀 Database Migration Complete!');
}

setupSchema().catch(console.error);
