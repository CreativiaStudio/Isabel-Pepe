import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { supabaseAdmin } from '../lib/supabase';

async function restoreOriginalImage() {
  console.log('Restoring original image for Anello Imperial in Supabase...');
  
  const originalUrl = 'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/isabel-pepe-anello-imperial-slot1.webp';
  
  const { data: prod, error } = await supabaseAdmin
    .from('products')
    .select('*')
    .eq('slug', 'anello-imperial')
    .single();

  if (error || !prod) {
    console.error('Error fetching product:', error);
    return;
  }

  const updatedGallery = [
    originalUrl,
    'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/isabel-pepe-anello-imperial-slot2.webp',
    'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/isabel-pepe-anello-imperial-slot3.webp',
    '',
    ''
  ];

  const { error: updateErr } = await supabaseAdmin
    .from('products')
    .update({
      image_secondary: originalUrl,
      gallery: updatedGallery
    })
    .eq('slug', 'anello-imperial');

  if (updateErr) {
    console.error('Error restoring Supabase:', updateErr);
  } else {
    console.log('✅ Successfully restored original image in Supabase!');
  }
}

restoreOriginalImage().catch(console.error);
