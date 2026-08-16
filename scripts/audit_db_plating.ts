import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { supabaseAdmin } from '../lib/supabase';

async function auditProductsPlatingAndGemstone() {
  const { data: products } = await supabaseAdmin.from('products').select('id, name, sku, category, plating, gemstone, carats, description');
  console.log(`Total products: ${products?.length}`);
  
  let nonePlating = 0;
  let noneGemstone = 0;

  products?.forEach(p => {
    const isPlatingEmpty = !p.plating || p.plating === 'Nessuna';
    const isGemstoneEmpty = !p.gemstone || p.gemstone === 'Nessuna';
    if (isPlatingEmpty) nonePlating++;
    if (isGemstoneEmpty) noneGemstone++;

    console.log(`[${p.sku || 'NO SKU'}] ${p.name}`);
    console.log(`  Plating: ${p.plating || 'EMPTY'}`);
    console.log(`  Gemstone: ${p.gemstone || 'EMPTY'}`);
    console.log(`  Carats: ${p.carats || 'EMPTY'}`);
    console.log(`---`);
  });

  console.log(`Summary: ${nonePlating} without plating, ${noneGemstone} without gemstone.`);
}

auditProductsPlatingAndGemstone();
