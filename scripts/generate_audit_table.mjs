import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const envFile = fs.readFileSync(path.resolve(process.cwd(), '.env.local'), 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].replace(/['"\r]/g, '').trim();
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function generateAuditReport() {
  const { data: products, error } = await supabase.from('products').select('*').order('sku', { ascending: true });
  if (error || !products) {
    console.error('Error fetching products:', error);
    process.exit(1);
  }

  let tableLines = [];
  tableLines.push('| # | SKU | Name | Category | Price | Slug | Title Len | SEO Title | Desc Len | SEO Description | Moiss Scan |');
  tableLines.push('|---|---|---|---|---|---|---|---|---|---|---|');

  let violations = [];

  products.forEach((p, idx) => {
    const titleLen = (p.seo_title || '').length;
    const descLen = (p.seo_description || '').length;
    const price = Number(p.price);
    const jsonStr = JSON.stringify(p).toLowerCase();
    const hasMoiss = jsonStr.includes('moissanite');
    const hasMadeInItaly = jsonStr.includes('made in italy') || jsonStr.includes('manifattura italiana');

    if (titleLen > 60 || titleLen === 0) violations.push(`SKU ${p.sku}: title length invalid (${titleLen})`);
    if (descLen < 140 || descLen > 155) violations.push(`SKU ${p.sku}: desc length invalid (${descLen})`);
    if (isNaN(price) || price <= 0) violations.push(`SKU ${p.sku}: price invalid (€${p.price})`);
    if (hasMoiss) violations.push(`SKU ${p.sku}: contains moissanite`);
    if (hasMadeInItaly) violations.push(`SKU ${p.sku}: contains Made in Italy`);

    tableLines.push(`| ${idx + 1} | \`${p.sku}\` | ${p.name} | ${p.category} | €${price.toFixed(2)} | \`${p.slug}\` | ${titleLen} | ${p.seo_title} | ${descLen} | ${p.seo_description} | ${hasMoiss ? '❌ FAIL' : '✅ 0'} |`);
  });

  console.log(`Audited ${products.length} products. Violations: ${violations.length}`);
  if (violations.length > 0) {
    console.log('VIOLATIONS:', violations);
  }

  fs.writeFileSync('scripts/audit_output.txt', tableLines.join('\n'), 'utf8');
  console.log('Table written to scripts/audit_output.txt');
}

generateAuditReport();
