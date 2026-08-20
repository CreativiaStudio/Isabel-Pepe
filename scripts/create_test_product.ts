import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY || '');

async function run() {
  const productId = '3b7b5c76-3133-4f3f-b77a-560ad763390f';
  console.log('1. Checking product exists:', productId);
  const { data: prod, error: pErr } = await supabase.from('products').select('*').eq('id', productId).single();
  console.log('Product in DB:', prod ? prod.name : 'NOT FOUND', pErr || '');

  if (!prod) return;

  console.log('2. Checking references in analytics_events...');
  const { data: events, error: eErr } = await supabase.from('analytics_events').select('id').eq('product_id', productId);
  console.log('Analytics events referencing product:', events?.length || 0, eErr || '');

  console.log('3. Attempting deletion directly...');
  const delRes = await supabase.from('products').delete().eq('id', productId);
  console.log('Direct delete result:', delRes);

  console.log('4. Verifying if still in products...');
  const { data: check } = await supabase.from('products').select('id, name').eq('id', productId);
  console.log('Remaining matches:', check);
}

run().catch(console.error);
