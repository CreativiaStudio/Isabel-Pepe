import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const envFile = fs.readFileSync(path.resolve(process.cwd(), '.env.local'), 'utf8');
const env: Record<string, string> = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].replace(/['"\r]/g, '').trim();
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function inspect() {
  const { data: products, error } = await supabaseAdmin
    .from('products')
    .select('*')
    .order('sku', { ascending: true });

  if (error || !products) {
    console.error('Error fetching products:', error);
    return;
  }

  fs.writeFileSync(path.resolve(process.cwd(), 'scripts/db_snapshot.json'), JSON.stringify(products, null, 2));

  console.log(`Snapshot saved. Total products: ${products.length}`);
  
  // Check for issues:
  const zeroPrices = products.filter(p => Number(p.price) === 0);
  console.log(`Products with price 0: ${zeroPrices.length}`, zeroPrices.map(p => ({ sku: p.sku, name: p.name })));

  const moissInTitle = products.filter(p => (p.seo_title || '').toLowerCase().includes('moissanite'));
  const moissInDesc = products.filter(p => (p.seo_description || '').toLowerCase().includes('moissanite'));
  const moissInBody = products.filter(p => (p.description || '').toLowerCase().includes('moissanite'));
  const moissInGem = products.filter(p => (p.gemstone || '').toLowerCase().includes('moissanite'));
  const moissInPlat = products.filter(p => (p.plating || '').toLowerCase().includes('moissanite'));
  const moissInName = products.filter(p => (p.name || '').toLowerCase().includes('moissanite'));
  const moissInSlug = products.filter(p => (p.slug || '').toLowerCase().includes('moissanite'));
  const moissInCarats = products.filter(p => (p.carats || '').toLowerCase().includes('moissanite'));

  console.log(`Moissanite occurrences:
  - seo_title: ${moissInTitle.length}
  - seo_description: ${moissInDesc.length}
  - description: ${moissInBody.length}
  - gemstone: ${moissInGem.length}
  - plating: ${moissInPlat.length}
  - name: ${moissInName.length}
  - slug: ${moissInSlug.length}
  - carats: ${moissInCarats.length}`);

  const madeInItaly = products.filter(p => 
    JSON.stringify(p).toLowerCase().includes('made in italy') || 
    JSON.stringify(p).toLowerCase().includes('alta oreficeria') ||
    JSON.stringify(p).toLowerCase().includes('manifattura italiana')
  );
  console.log(`Made in Italy / Alta oreficeria occurrences: ${madeInItaly.length}`);

  const longTitles = products.filter(p => p.seo_title && p.seo_title.length > 60);
  console.log(`SEO titles > 60 chars: ${longTitles.length}`, longTitles.map(p => ({ sku: p.sku, len: p.seo_title.length, title: p.seo_title })));

  const descLenIssues = products.filter(p => !p.seo_description || p.seo_description.length < 135 || p.seo_description.length > 165);
  console.log(`SEO descriptions outside ~140-155: ${descLenIssues.length}`, descLenIssues.map(p => ({ sku: p.sku, len: (p.seo_description || '').length, desc: p.seo_description })));

  const badSlugs = products.filter(p => p.sku === 'ASB3142' || p.sku === 'ASB4019');
  console.log(`Slugs for ASB3142 and ASB4019:`, badSlugs.map(p => ({ sku: p.sku, slug: p.slug })));
}

inspect();
