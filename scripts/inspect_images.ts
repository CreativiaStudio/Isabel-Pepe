import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const envFile = fs.readFileSync(path.resolve(process.cwd(), '.env.local'), 'utf8');
const env: Record<string, string> = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].replace(/['"\r]/g, '').trim();
});

const supabaseAdmin = createClient(env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function inspectImages() {
  const { data } = await supabaseAdmin
    .from('products')
    .select('sku, name, slug, image_primary, image_secondary, gallery')
    .in('sku', ['MSR1075', 'MS1105', 'MS1208', 'ASB3035', 'MSR1089', 'MS12242']);

  console.log("Diagnostic products:", JSON.stringify(data, null, 2));
}

inspectImages();
