import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Read .env.local
const envFile = fs.readFileSync(path.resolve(process.cwd(), '.env.local'), 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const m = line.match(/^([^=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].replace(/['"\r]/g, '').trim();
});

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

const anonClient = createClient(url, anonKey);
const adminClient = createClient(url, serviceKey);

async function run() {
  console.log("Checking DB via Anon Client...");
  const { data: anonData, error: anonErr } = await anonClient.from('products').select('*');
  console.log("Anon err:", anonErr?.message);
  console.log("Anon count:", anonData?.length);

  console.log("\nChecking DB via Admin Client...");
  const { data: adminData, error: adminErr } = await adminClient.from('products').select('*');
  console.log("Admin err:", adminErr?.message);
  console.log("Admin count:", adminData?.length);

  if (adminData) {
    const moissItems = adminData.filter(p => JSON.stringify(p).toLowerCase().includes('moissanite'));
    console.log("Moissanite occurrences in DB:", moissItems.length);
    if (moissItems.length > 0) {
      console.log("Found in:", moissItems.map(p => ({ sku: p.sku, name: p.name, title: p.seo_title })));
    }
  }
}

run().catch(console.error);
