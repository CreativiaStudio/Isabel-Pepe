import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function testFullUpdate() {
  const { data: prod } = await supabaseAdmin.from('products').select('*').eq('sku', 'PL-15-BRACELET').single();
  if (!prod) return console.log('Product not found');

  const updateData = {
    name: prod.name,
    slug: prod.slug,
    sku: prod.sku,
    description: prod.description,
    materials: prod.materials,
    plating: prod.plating,
    gemstone: prod.gemstone,
    carats: prod.carats,
    sizes: prod.sizes,
    price: 295,
    discount_price: null,
    stock: 4,
    category: 'Set Lusso', // changed to Set Lusso as in the screenshot
    gallery: prod.gallery,
    image_secondary: prod.image_secondary,
    image_primary: prod.image_primary,
  };

  console.log('Attempting update with:', updateData);
  const { data, error } = await supabaseAdmin
    .from('products')
    .update(updateData)
    .eq('id', prod.id)
    .select();

  if (error) {
    console.error('❌ Supabase update error:', error);
  } else {
    console.log('✅ Update successful:', data);
  }
}

testFullUpdate().catch(console.error);
