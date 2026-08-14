import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

const env: any = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1]] = match[2].replace(/['"\r]/g, '').trim();
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
const publicBase = env.R2_PUBLIC_URL + '/products';

async function fix() {
  const { data: products } = await supabase.from('products').select('*');
  if (!products) return;

  for (const product of products) {
    const update: any = {};
    let changed = false;

    if (product.image_primary && product.image_primary.startsWith('/Products/')) {
      update.image_primary = product.image_primary.replace('/Products', publicBase);
      changed = true;
    }
    if (product.image_secondary && product.image_secondary.startsWith('/Products/')) {
      update.image_secondary = product.image_secondary.replace('/Products', publicBase);
      changed = true;
    }
    
    if (product.gallery) {
      const newGallery = product.gallery.map((g: string) => {
        if (g && g.startsWith('/Products/')) {
          changed = true;
          return g.replace('/Products', publicBase);
        }
        return g;
      });
      if (changed) update.gallery = newGallery;
    }

    if (changed) {
      await supabase.from('products').update(update).eq('id', product.id);
      console.log('Fixed DB for', product.name);
    }
  }
}

fix().catch(console.error);
