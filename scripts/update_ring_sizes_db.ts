import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { supabaseAdmin } from '../lib/supabase';

async function updateRingsInDb() {
  const { data: rings, error } = await supabaseAdmin.from('products').select('*').eq('category', 'Anelli');
  if (error || !rings) {
    console.error('Error fetching rings:', error);
    return;
  }

  console.log(`Updating ${rings.length} rings in Supabase...`);

  for (const ring of rings) {
    let desc = ring.description || '';
    
    // Add size bullet point if not already present
    if (!desc.includes('Misura Esclusiva:')) {
      const sizeBullet = '• Misura Esclusiva: Taglia Unica Standard US 6 (IT 12 • Diametro interno 16.5 mm • Circonferenza 52 mm).\n';
      // Insert after DETTAGLI ESCLUSIVI & ARTIGIANALITÀ:
      if (desc.includes('DETTAGLI ESCLUSIVI & ARTIGIANALITÀ:\n')) {
        desc = desc.replace('DETTAGLI ESCLUSIVI & ARTIGIANALITÀ:\n', `DETTAGLI ESCLUSIVI & ARTIGIANALITÀ:\n${sizeBullet}`);
      } else {
        desc += `\n\n${sizeBullet}`;
      }
    }

    const { error: updateErr } = await supabaseAdmin.from('products').update({
      sizes: ['US 6 (IT 12)'],
      description: desc,
    }).eq('id', ring.id);

    if (updateErr) {
      console.error(`Error updating ring ${ring.name}:`, updateErr.message);
    } else {
      console.log(`✓ Updated ring [${ring.name}] with size US 6 (IT 12).`);
    }
  }
}

updateRingsInDb().catch(console.error);
