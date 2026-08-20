// @ts-ignore
import { Client } from 'pg';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function setupNewsletterAndPrivilegeSchema() {
  const dbUrl = process.env.SUPABASE_DB_URL;
  if (!dbUrl) {
    throw new Error('SUPABASE_DB_URL not found in .env.local');
  }

  const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  console.log('Connected to Supabase PostgreSQL database.');

  // 1. Table newsletter_subscribers
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(255) NOT NULL,
      first_name VARCHAR(100),
      last_name VARCHAR(100),
      phone VARCHAR(50),
      source VARCHAR(50) NOT NULL DEFAULT 'footer',
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      consent_given_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      unsubscribed_at TIMESTAMPTZ,
      ip_address TEXT,
      user_agent TEXT,
      visitor_id TEXT,
      consent_id TEXT,
      utm_source TEXT,
      utm_medium TEXT,
      utm_campaign TEXT,
      utm_content TEXT,
      utm_term TEXT,
      metadata JSONB DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT uq_newsletter_subscribers_email UNIQUE (email)
    );

    CREATE UNIQUE INDEX IF NOT EXISTS idx_subscribers_email_lower 
      ON public.newsletter_subscribers (LOWER(email));
    CREATE INDEX IF NOT EXISTS idx_subscribers_visitor_id 
      ON public.newsletter_subscribers (visitor_id);
    CREATE INDEX IF NOT EXISTS idx_subscribers_source 
      ON public.newsletter_subscribers (source);
    CREATE INDEX IF NOT EXISTS idx_subscribers_is_active 
      ON public.newsletter_subscribers (is_active);
    CREATE INDEX IF NOT EXISTS idx_subscribers_created_at 
      ON public.newsletter_subscribers (created_at DESC);

    ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'newsletter_subscribers' 
        AND policyname = 'Service role full access on newsletter_subscribers'
      ) THEN
        CREATE POLICY "Service role full access on newsletter_subscribers"
          ON public.newsletter_subscribers
          FOR ALL
          TO service_role
          USING (true)
          WITH CHECK (true);
      END IF;
    END
    $$;
  `);
  console.log('✅ public.newsletter_subscribers table & indexes created.');

  // 2. Upsert PRIVILEGE10 coupon
  await client.query(`
    INSERT INTO public.coupons (
      code,
      discount_percent,
      discount_amount,
      target_email,
      is_active,
      expires_at
    ) VALUES (
      'PRIVILEGE10',
      10,
      NULL,
      NULL,
      TRUE,
      NULL
    ) ON CONFLICT (code) DO UPDATE SET
      discount_percent = 10,
      discount_amount = NULL,
      target_email = NULL,
      is_active = TRUE,
      expires_at = NULL;
  `);
  console.log('✅ PRIVILEGE10 coupon setup verified.');

  await client.end();
  console.log('🚀 M1 Schema Migration Complete!');
}

setupNewsletterAndPrivilegeSchema().catch(console.error);
