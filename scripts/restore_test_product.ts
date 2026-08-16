import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { supabaseAdmin } from '../lib/supabase';

async function restore() {
  const { data: product } = await supabaseAdmin.from('products').select('id, name, gallery').eq('name', 'Orecchini Rivière').single();
  if (product) {
    const cleanGallery = [
      'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/Orecchini_Riviere_frontale.png',
      'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/Orecchini_Riviere_lifestyle.png',
      '',
      '',
      ''
    ];
    await supabaseAdmin.from('products').update({ gallery: cleanGallery }).eq('id', product.id);
    console.log('Restored [Orecchini Rivière] gallery cleanly.');
  }
}
restore();
