const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function run() {
  const client = new Client({
    connectionString: process.env.SUPABASE_DB_URL,
  });

  try {
    await client.connect();
    
    console.log('Creazione tabelle per Jarvis e Coupons...');

    // 1. Tabella page_views
    await client.query(`
      CREATE TABLE IF NOT EXISTS page_views (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        visitor_id TEXT NOT NULL,
        path TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    
    // Indice per velocizzare le query analitiche
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_page_views_path ON page_views(path);
      CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views(created_at);
      CREATE INDEX IF NOT EXISTS idx_page_views_visitor ON page_views(visitor_id);
    `);

    console.log('Tabella page_views creata.');

    // 2. Tabella coupons
    await client.query(`
      CREATE TABLE IF NOT EXISTS coupons (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        code TEXT UNIQUE NOT NULL,
        discount_percent INTEGER DEFAULT 0,
        discount_amount NUMERIC(10, 2) DEFAULT 0,
        target_email TEXT,
        is_active BOOLEAN DEFAULT true,
        expires_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    console.log('Tabella coupons creata.');

    // 3. Inserimento coupon di test
    await client.query(`
      INSERT INTO coupons (code, discount_percent, discount_amount, target_email, is_active)
      VALUES 
      ('BENVENUTO10', 10, 0, NULL, true),
      ('REGALO20', 0, 20.00, NULL, true),
      ('MARIOVIP', 15, 0, 'mario.rossi@email.com', true)
      ON CONFLICT (code) DO NOTHING;
    `);

    console.log('Coupons di test inseriti.');

  } catch (e) {
    console.error('Error:', e);
  } finally {
    await client.end();
  }
}

run();
