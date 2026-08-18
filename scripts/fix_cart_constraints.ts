// @ts-ignore
import { Client } from 'pg';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function fixConstraints() {
  const client = new Client({ connectionString: process.env.SUPABASE_DB_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();

  const res = await client.query(`
    SELECT conname, pg_get_constraintdef(c.oid)
    FROM pg_constraint c
    JOIN pg_namespace n ON n.oid = c.connamespace
    WHERE conrelid = 'public.abandoned_carts'::regclass;
  `);
  console.log('Current constraints:', res.rows);

  // Add UNIQUE constraint on email if not exists
  await client.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'abandoned_carts_email_key'
      ) THEN
        ALTER TABLE public.abandoned_carts ADD CONSTRAINT abandoned_carts_email_key UNIQUE (email);
      END IF;
    END $$;
  `);

  console.log('✅ Unique constraint on abandoned_carts(email) verified/added!');
  await client.end();
}

fixConstraints().catch(console.error);
