import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { supabaseAdmin } from '../lib/supabase';

async function listProductImages() {
  const { data: products, error } = await supabaseAdmin
    .from('products')
    .select('id, name, category, images');
  
  if (error || !products) {
    console.error('Error:', error);
    return;
  }

  console.log('--- PRODUCTS BY CATEGORY ---');
  ['Anelli', 'Orecchini', 'Set', 'Collane', 'Bracciali'].forEach(cat => {
    console.log(`\n=== CATEGORY: ${cat} ===`);
    const filtered = products.filter(p => p.category === cat);
    filtered.forEach(p => {
      console.log(`[${p.name}]`);
      (p.images || []).forEach((img: string, idx: number) => {
        console.log(`  ${idx}: ${img}`);
      });
    });
  });
}

listProductImages().catch(console.error);
