import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { supabaseAdmin } from '../lib/supabase';

async function updateAllProducts() {
  console.log('Fetching all products from Supabase...');
  const { data: products, error } = await supabaseAdmin.from('products').select('*');
  if (error || !products) {
    console.error('Error fetching products:', error);
    return;
  }

  console.log(`Found ${products.length} products. Updating descriptions...`);
  let updatedCount = 0;

  for (const p of products) {
    let desc = p.description || '';
    let seoDesc = p.seo_description || '';

    // Replace Packaging Signature / Cofanetto Signature / Garanzia 24 mesi mentions
    desc = desc
      .replace(/Packaging Signature: Cofanetto rigido luxury Isabel Pepe, panno in microfibra lucidante e Certificato Ufficiale di Garanzia 24 mesi inclusi\./g,
        'Packaging Esclusivo: Cofanetto Luxury Isabel Pepe, panno in microfibra lucidante e Certificato Ufficiale di Autenticità inclusi.')
      .replace(/Packaging Signature: Cofanetto rigido luxury Isabel Pepe[^\n]+/g,
        'Packaging Esclusivo: Cofanetto Luxury Isabel Pepe, panno in microfibra lucidante e Certificato Ufficiale di Autenticità inclusi.')
      .replace(/Cofanetto Regalo Signature/g, 'Cofanetto Luxury')
      .replace(/cofanetto regalo signature/g, 'Cofanetto Luxury')
      .replace(/garanzia ufficiale 24 mesi inclusi/gi, 'Certificato di Autenticità e Cofanetto Luxury inclusi')
      .replace(/garanzia 24 mesi inclusi/gi, 'Certificato di Autenticità e Cofanetto Luxury inclusi');

    seoDesc = seoDesc
      .replace(/Cofanetto regalo luxury e garanzia 24 mesi inclusi\./gi, 'Cofanetto Luxury e Certificato di Autenticità inclusi.')
      .replace(/garanzia ufficiale 24 mesi inclusi\./gi, 'Certificato di Autenticità e Cofanetto Luxury inclusi.')
      .replace(/garanzia 24 mesi inclusi\./gi, 'Certificato di Autenticità e Cofanetto Luxury inclusi.')
      .replace(/garanzia 24 mesi/gi, 'Certificato di Autenticità');

    const { error: updateErr } = await supabaseAdmin.from('products').update({
      description: desc,
      seo_description: seoDesc,
    }).eq('id', p.id);

    if (updateErr) {
      console.error(`Failed to update ${p.name}:`, updateErr.message);
    } else {
      updatedCount++;
    }
  }

  console.log(`✓ Successfully updated ${updatedCount}/${products.length} products in Supabase!`);
}

updateAllProducts().catch(console.error);
