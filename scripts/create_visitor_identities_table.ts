// @ts-ignore
import { Client } from 'pg';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function setupVisitorIdentities() {
  const dbUrl = process.env.SUPABASE_DB_URL;
  if (!dbUrl) throw new Error('SUPABASE_DB_URL not found');

  const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();
  console.log('Connected to Supabase PostgreSQL...');

  await client.query(`
    CREATE TABLE IF NOT EXISTS public.visitor_identities (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      visitor_id TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      role TEXT DEFAULT 'guest', -- 'founder', 'vip', 'team', 'customer', 'guest'
      notes TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_visitor_identities_vid ON public.visitor_identities(visitor_id);
  `);

  console.log('✅ public.visitor_identities table created successfully!');
  await client.end();
}

setupVisitorIdentities().catch(console.error);
