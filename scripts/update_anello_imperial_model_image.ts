import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { supabaseAdmin } from '../lib/supabase';

async function updateImperialImage() {
  console.log('Fetching Anello Imperial from Supabase...');
  const { data: prod, error } = await supabaseAdmin
    .from('products')
    .select('*')
    .eq('slug', 'anello-imperial')
    .single();

  if (error || !prod) {
    console.error('Error fetching Anello Imperial:', error);
    return;
  }

  console.log('Product keys:', Object.keys(prod));
  console.log('image_primary:', prod.image_primary);
  console.log('image_secondary:', prod.image_secondary);

  const newModelImage = '/Brand/isabel-pepe-anello-imperial-slot1.webp';

  const updatePayload: Record<string, any> = {};

  if ('image_secondary' in prod) {
    updatePayload.image_secondary = newModelImage;
  }
  if ('gallery' in prod && Array.isArray(prod.gallery)) {
    updatePayload.gallery = prod.gallery.map((img: string) => img.includes('anello-imperial-slot1') ? newModelImage : img);
  }

  console.log('Updating payload:', updatePayload);

  const { error: updateErr } = await supabaseAdmin
    .from('products')
    .update(updatePayload)
    .eq('slug', 'anello-imperial');

  if (updateErr) {
    console.error('Error updating product in Supabase:', updateErr);
  } else {
    console.log('✅ Successfully updated Anello Imperial model image in Supabase!');
  }
}

updateImperialImage().catch(console.error);
