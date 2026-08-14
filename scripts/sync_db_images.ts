import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Carica variabili d'ambiente
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
const baseDir = path.resolve(process.cwd(), 'public/Products');

async function syncImages() {
  console.log("Inizio sincronizzazione Database <-> Cartelle...");

  const items = fs.readdirSync(baseDir, { withFileTypes: true });
  const folders = items.filter(i => i.isDirectory() && i.name !== 'Ispirazioni_e_Bozze').map(i => i.name);

  let updatedCount = 0;

  for (const folder of folders) {
    // Estrai lo SKU dal nome della cartella (tutto ciò che c'è prima di " - " o il nome intero se non c'è)
    const skuMatch = folder.split(' - ')[0].trim();
    if (!skuMatch) continue;

    const folderPath = path.join(baseDir, folder);
    const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.webp'));

    if (files.length === 0) {
      console.log(`[SKIP] La cartella "${folder}" è vuota. Aspetto che ci metti le foto.`);
      continue;
    }

    // Ordina i file in modo che i file _packaging o lifestyle vadano come secondari
    files.sort((a, b) => {
      const aSec = a.toLowerCase().includes('packaging') || a.toLowerCase().includes('lifestyle');
      const bSec = b.toLowerCase().includes('packaging') || b.toLowerCase().includes('lifestyle');
      if (aSec && !bSec) return 1;
      if (!aSec && bSec) return -1;
      return 0;
    });

    const imagePrimary = `/Products/${folder}/${files[0]}`;
    const imageSecondary = files.length > 1 ? `/Products/${folder}/${files[1]}` : null;

    // Aggiorna il database
    const { error } = await supabaseAdmin.from('products').update({
      image_primary: imagePrimary,
      image_secondary: imageSecondary
    }).eq('sku', skuMatch);

    if (error) {
      console.error(`Errore aggiornamento DB per SKU ${skuMatch}:`, error.message);
    } else {
      console.log(`[OK] Sincronizzato ${skuMatch} -> Primary: ${files[0]}`);
      updatedCount++;
    }
  }

  console.log(`\nSincronizzazione completata! Aggiornati ${updatedCount} prodotti nel database.`);
}

syncImages();
