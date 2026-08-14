const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function run() {
  const client = new Client({
    connectionString: process.env.SUPABASE_DB_URL,
  });

  try {
    await client.connect();
    
    console.log('Connected to DB. Creating customers and abandoned_carts tables...');

    await client.query(`
      CREATE TABLE IF NOT EXISTS customers (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email VARCHAR(255) UNIQUE NOT NULL,
          phone VARCHAR(50),
          first_name VARCHAR(100),
          last_name VARCHAR(100),
          total_spent DECIMAL(10,2) DEFAULT 0,
          orders_count INT DEFAULT 0,
          last_purchase_date TIMESTAMPTZ,
          acquisition_source VARCHAR(100),
          campaign_name VARCHAR(255),
          tags JSONB,
          internal_notes TEXT,
          created_at TIMESTAMPTZ DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS abandoned_carts (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email VARCHAR(255) NOT NULL,
          phone VARCHAR(50),
          cart_items JSONB NOT NULL,
          total_amount DECIMAL(10,2) NOT NULL,
          status VARCHAR(50) DEFAULT 'abandoned', -- 'abandoned', 'recovered', 'lost'
          recovery_token VARCHAR(255),
          created_at TIMESTAMPTZ DEFAULT now(),
          updated_at TIMESTAMPTZ DEFAULT now()
      );
    `);

    console.log('Schema updated successfully!');

  } catch (e) {
    console.error('Error:', e);
  } finally {
    await client.end();
  }
}

run();
