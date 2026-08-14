import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

const env: any = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1]] = match[2].replace(/['"\r]/g, '').trim();
});

const supabaseAdmin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

async function fixSlugs() {
  const { data: products } = await supabaseAdmin.from('products').select('*');
  if (!products) return;

  for (const product of products) {
    if (!product.slug || product.slug.trim() === '') {
      const slug = slugify(product.name);
      await supabaseAdmin.from('products').update({ slug }).eq('id', product.id);
      console.log('Generated slug for:', product.name, '->', slug);
    }
  }
}

fixSlugs().catch(console.error);
