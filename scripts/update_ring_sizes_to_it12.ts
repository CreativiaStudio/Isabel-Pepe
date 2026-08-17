import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { supabaseAdmin } from '../lib/supabase';

async function updateRingSizes() {
  console.log('Fetching rings from Supabase...');
  const { data: rings, error } = await supabaseAdmin
    .from('products')
    .select('*')
    .eq('category', 'Anelli');

  if (error || !rings) {
    console.error('Error fetching rings:', error);
    return;
  }

  console.log(`Updating ${rings.length} rings to Taglia 12 (IT)...`);

  const it12Bullet = '• Misura Esclusiva: Taglia Unica 12 (Diametro interno 16.5 mm • Circonferenza 52 mm).';

  for (const ring of rings) {
    let desc = ring.description || '';
    
    // Replace old US 6 mentions
    desc = desc.replace(/• Misura Esclusiva:[^\n]+\n?/g, '');
    
    // Insert new size bullet before Packaging or Dono
    if (desc.includes('• Sigillo di Autenticità:')) {
      desc = desc.replace('• Sigillo di Autenticità:', `${it12Bullet}\n• Sigillo di Autenticità:`);
    } else if (desc.includes('• Packaging Esclusivo:')) {
      desc = desc.replace('• Packaging Esclusivo:', `${it12Bullet}\n• Packaging Esclusivo:`);
    } else {
      desc += `\n${it12Bullet}`;
    }

    const { error: updateErr } = await supabaseAdmin.from('products').update({
      sizes: ['Taglia 12 (IT 12 • Ø 16.5 mm)'],
      description: desc,
    }).eq('id', ring.id);

    if (updateErr) {
      console.error(`Error updating ring ${ring.name}:`, updateErr.message);
    } else {
      console.log(`✓ Updated ring [${ring.name}] to Taglia 12!`);
    }
  }

  console.log('Done updating ring sizes!');
}

updateRingSizes().catch(console.error);
