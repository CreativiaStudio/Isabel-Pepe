const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function run() {
  const client = new Client({
    connectionString: process.env.SUPABASE_DB_URL,
  });

  try {
    await client.connect();
    
    console.log('Connected to DB. Running setup script...');

    const res = await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          stripe_session_id VARCHAR(255) UNIQUE,
          customer_email VARCHAR(255) NOT NULL,
          customer_name VARCHAR(255) NOT NULL,
          amount_total DECIMAL(10,2) NOT NULL,
          status VARCHAR(50) DEFAULT 'pending',
          shipping_address JSONB,
          items JSONB NOT NULL,
          tracking_code VARCHAR(255),
          shipped_at TIMESTAMPTZ,
          created_at TIMESTAMPTZ DEFAULT now()
      );

      ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_code VARCHAR(255);
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMPTZ;
    `);

    console.log('Orders table ready!');

  } catch (e) {
    console.error('Error:', e);
  } finally {
    await client.end();
  }
}

run();
