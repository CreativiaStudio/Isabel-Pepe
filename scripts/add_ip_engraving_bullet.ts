import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { supabaseAdmin } from '../lib/supabase';

async function addIpEngravingToAllProducts() {
  console.log('Fetching all products from Supabase...');
  const { data: products, error } = await supabaseAdmin.from('products').select('*');
  if (error || !products) {
    console.error('Error fetching products:', error);
    return;
  }

  console.log(`Adding "Incisione Iniziali IP" to ${products.length} products...`);

  let count = 0;
  const ipBullet = '• Sigillo di Autenticità: Incisione ufficiale con iniziali "IP" (Isabel Pepe) e punzone "S925" su ogni gioiello.';

  for (const p of products) {
    let desc = p.description || '';

    // Remove existing if already present
    desc = desc.replace(/• Sigillo di Autenticità:[^\n]+\n?/g, '');
    desc = desc.replace(/• Punzonatura & Autenticità:[^\n]+\n?/g, '');

    // Insert before Packaging Esclusivo or L'Arte del Dono
    if (desc.includes('• Packaging Esclusivo:')) {
      desc = desc.replace('• Packaging Esclusivo:', `${ipBullet}\n• Packaging Esclusivo:`);
    } else if (desc.includes("• L'Arte del Dono:")) {
      desc = desc.replace("• L'Arte del Dono:", `${ipBullet}\n• L'Arte del Dono:`);
    } else {
      desc += `\n${ipBullet}`;
    }

    const { error: updateErr } = await supabaseAdmin.from('products').update({
      description: desc,
    }).eq('id', p.id);

    if (updateErr) {
      console.error(`Error on ${p.name}:`, updateErr.message);
    } else {
      count++;
    }
  }

  console.log(`✓ Successfully updated ${count}/${products.length} products with IP initials engraving!`);
}

addIpEngravingToAllProducts().catch(console.error);
