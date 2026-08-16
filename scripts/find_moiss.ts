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

async function findMoissaniteFields() {
  const { data: products, error } = await supabaseAdmin.from('products').select('*');
  if (error || !products) return;

  for (const p of products) {
    for (const [key, val] of Object.entries(p)) {
      if (typeof val === 'string' && val.toLowerCase().includes('moissanite')) {
        console.log(`[SKU ${p.sku}] Column "${key}": "${val}"`);
      } else if (Array.isArray(val)) {
        val.forEach((item, idx) => {
          if (typeof item === 'string' && item.toLowerCase().includes('moissanite')) {
            console.log(`[SKU ${p.sku}] Column "${key}[${idx}]": "${item}"`);
          }
        });
      }
    }
  }
}

findMoissaniteFields();
