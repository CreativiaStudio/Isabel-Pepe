const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function main() {
  const client = new Client({
    connectionString: process.env.SUPABASE_DB_URL,
  });

  try {
    await client.connect();
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS jarvis_tasks (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        category VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        action_type VARCHAR(100),
        action_label VARCHAR(100),
        impact INT,
        kpi VARCHAR(100),
        payload JSONB,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
      );
    `);
    console.log('Table jarvis_tasks created successfully');
    
    // Add RLS policy allowing reading and writing by the service role
    await client.query(`ALTER TABLE jarvis_tasks ENABLE ROW LEVEL SECURITY;`);
    
  } catch (err) {
    console.error('Error creating table:', err);
  } finally {
    await client.end();
  }
}

main();
