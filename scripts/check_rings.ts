import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { supabaseAdmin } from '../lib/supabase';

async function checkRings() {
  const { data: rings } = await supabaseAdmin.from('products').select('id, name, category, sizes, description').eq('category', 'Anelli');
  console.log(`Found ${rings?.length} rings:`);
  rings?.forEach(r => {
    console.log(`- [${r.name}] Sizes:`, r.sizes);
  });
}

checkRings();
