import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function testUpdateProduct() {
  console.log('Testing direct update on products table with service role:');
  const { data, error } = await supabaseAdmin
    .from('products')
    .update({ stock: 4, updated_at: new Date().toISOString() })
    .eq('sku', 'PL-15-BRACELET')
    .select();

  if (error) {
    console.error('❌ Supabase Admin Update Error:', error);
  } else {
    console.log('✅ Supabase Admin Update Success:', data);
  }
}

testUpdateProduct().catch(console.error);
