// @ts-ignore
import { Client } from 'pg';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function setupDailyAnalytics() {
  const dbUrl = process.env.SUPABASE_DB_URL;
  if (!dbUrl) throw new Error('SUPABASE_DB_URL not found');

  const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();
  console.log('Connected to Supabase PostgreSQL...');

  await client.query(`
    CREATE TABLE IF NOT EXISTS public.daily_analytics (
      date DATE PRIMARY KEY,
      total_views INTEGER NOT NULL DEFAULT 0,
      unique_visitors INTEGER NOT NULL DEFAULT 0,
      product_views INTEGER NOT NULL DEFAULT 0,
      cart_additions INTEGER NOT NULL DEFAULT 0,
      orders_count INTEGER NOT NULL DEFAULT 0,
      total_revenue NUMERIC NOT NULL DEFAULT 0,
      top_products JSONB DEFAULT '[]'::JSONB,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_daily_analytics_date ON public.daily_analytics(date);
  `);

  console.log('✅ public.daily_analytics table created successfully!');
  await client.end();
}

setupDailyAnalytics().catch(console.error);
