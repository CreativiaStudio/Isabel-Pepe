import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

const envFile = fs.readFileSync('.env.local', 'utf8');
const env: Record<string, string> = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1]] = match[2].replace(/['"\r]/g, '').trim();
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Mancano le chiavi API");
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  const updates = [
    { sku: 'ASB4054-PINK', name: 'Eden Rose', image: '/Products/Eden Rose.jpg' },
    { sku: 'BTN028', name: 'Isabel Romance', image: '/Products/Isabel Romance.jpg' },
    { sku: 'BTS018-EARRING', name: 'Glow Ribbon', image: '/Products/Glow Ribbon.jpg' },
    { sku: 'BTS018-NECKLACE', name: 'Siena Gold', image: '/Products/Siena Gold.jpg' },
    { sku: 'BTB024', name: 'Eclat Royal', image: '/Products/Eclat Royal.jpg' },
    { sku: 'PL-15-NECKLACE', name: 'Vendôme Pearl', image: '/Products/Vendome Pearl.jpg' },
    { sku: 'A180-NECKLACE', name: 'Collana Vivienne', image: '/Products/Collana Vivienne.jpg' },
    { sku: 'A180-EARRING', name: 'Orecchini Vivienne', image: '/Products/Orecchini Vivienne.jpg' },
  ];

  for (const u of updates) {
    const { error } = await supabaseAdmin.from('products').update({ 
      name: u.name, 
      image_primary: u.image 
    }).eq('sku', u.sku);
    
    if (error) {
      console.error(`Errore per ${u.sku}:`, error);
    } else {
      console.log(`Aggiornato ${u.sku} in ${u.name}`);
    }
  }
}
run();
