import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';


// Carica variabili d'ambiente
const envFile = fs.readFileSync('.env.local', 'utf8');
const env: Record<string, string> = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1]] = match[2].replace(/['"\r]/g, '').trim();
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;
const r2AccountId = env.R2_ACCOUNT_ID;
const r2AccessKey = env.R2_ACCESS_KEY_ID;
const r2SecretKey = env.R2_SECRET_ACCESS_KEY;
const r2Bucket = env.R2_BUCKET_NAME;
const r2PublicUrl = env.R2_PUBLIC_URL;

if (!supabaseUrl || !supabaseServiceKey || !r2AccountId || !r2AccessKey || !r2SecretKey || !r2Bucket || !r2PublicUrl) {
  console.error("Mancano le chiavi API per Supabase o R2");
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${r2AccountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: r2AccessKey,
    secretAccessKey: r2SecretKey,
  },
});

const baseDir = path.resolve(process.cwd(), 'public/Products');

// Mappa dei prefissi ai suffissi SEO
const suffixMap: Record<string, string> = {
  '1': '-indossato',
  '2': '-dettaglio-sfondo',
  '3': '-panoramica',
  '4': '-video-packaging',
  '5': '-video-moissanite'
};

async function seoAndSync() {
  console.log("🚀 Inizio Sincronizzazione SEO & Database 5-Slot...");

  const items = fs.readdirSync(baseDir, { withFileTypes: true });
  const folders = items.filter(i => i.isDirectory() && i.name !== 'Ispirazioni_e_Bozze' && i.name !== 'transparent_temp').map(i => i.name);

  let updatedCount = 0;

  for (const folder of folders) {
    // Estrai lo SKU dal nome della cartella prendendo la prima parola (prima dello spazio)
    // Es: "ASB3093 Orecchini Joséphine" -> "ASB3093"
    const skuMatch = folder.split(' ')[0].trim();
    if (!skuMatch) continue;

    const folderPath = path.join(baseDir, folder);
    const files = fs.readdirSync(folderPath);

    // Identifichiamo i file con i prefissi 1_, 2_, 3_, 4_, 5_ oppure con i suffissi SEO già applicati
    const slotFiles = new Map<string, string>();
    for (const file of files) {
      // Caso 1: File grezzo (es. 1_modella.png)
      const rawMatch = file.match(/^([1-5])_(.+)\.([^.]+)$/);
      if (rawMatch) {
        slotFiles.set(rawMatch[1], file);
        continue;
      }
      
      // Caso 2: File già rinominato per la SEO in precedenza (es. orecchini-josephine-indossato.webp)
      const fileNameWithoutExt = path.parse(file).name;
      for (const [slotKey, suffix] of Object.entries(suffixMap)) {
        if (fileNameWithoutExt.endsWith(suffix)) {
          slotFiles.set(slotKey, file);
          break;
        }
      }
    }

    if (slotFiles.size === 0) {
      console.log(`[SKIP] Nessun file grezzo o rinominato trovato in "${folder}".`);
      continue;
    }

    // Prendiamo i dati del prodotto dal DB per avere il nome SEO (slug)
    const { data: product, error: dbError } = await supabaseAdmin
      .from('products')
      .select('slug, name')
      .eq('sku', skuMatch)
      .single();

    if (dbError || !product) {
      console.error(`❌ Prodotto non trovato nel DB per SKU: ${skuMatch}`);
      continue;
    }

    const slug = product.slug;
    const finalPaths: string[] = [];
    let imagePrimary: string | null = null;
    let imageSecondary: string | null = null;

    // Processiamo gli slot in ordine
    for (let i = 1; i <= 5; i++) {
      const slotKey = i.toString();
      const originalFile = slotFiles.get(slotKey);
      
      if (originalFile) {
        const ext = path.extname(originalFile).toLowerCase();
        const suffix = suffixMap[slotKey];
        const newFileName = `${slug}${suffix}${ext}`;
        
        const oldPath = path.join(folderPath, originalFile);
        const newPath = path.join(folderPath, newFileName);

        // Rinominiamo il file fisicamente in locale
        try {
          fs.renameSync(oldPath, newPath);
          console.log(`   -> Rinominato: ${originalFile} in ${newFileName}`);
        } catch (e) {
          // Se fallisce, forse era già rinominato? Continuiamo col vecchio path se esiste
          if (!fs.existsSync(newPath)) {
            console.error(`   Errore nella rinominazione di ${originalFile}`);
            continue;
          }
        }

        // Ora carichiamolo su R2!
        try {
          const fileBuffer = fs.readFileSync(newPath);
          const r2Key = `products/${newFileName}`;
          let contentType = 'image/jpeg';
          if (ext === '.png') contentType = 'image/png';
          if (ext === '.webp') contentType = 'image/webp';
          if (ext === '.mp4') contentType = 'video/mp4';

          const command = new PutObjectCommand({
            Bucket: r2Bucket,
            Key: r2Key,
            Body: fileBuffer,
            ContentType: contentType,
          });

          await r2Client.send(command);
          console.log(`   -> ☁️ Uploaded su R2: ${newFileName}`);

          const finalR2Url = `${r2PublicUrl}/${r2Key}`;
          finalPaths.push(finalR2Url);

          // Assegnazioni speciali (image_secondary = Slot 1, image_primary = Slot 2)
          if (i === 1) imageSecondary = finalR2Url;
          if (i === 2) imagePrimary = finalR2Url;

        } catch (uploadError: any) {
          console.error(`   ❌ Errore caricamento su R2 per ${newFileName}:`, uploadError.message);
          finalPaths.push("");
        }
      } else {
        // Se manca lo slot, lasciamo stringa vuota per mantenere l'allineamento dell'array a 5 slot
        finalPaths.push("");
      }
    }

    // Assicuriamoci che finalPaths abbia esattamente 5 elementi
    while (finalPaths.length < 5) finalPaths.push("");

    // Se per qualche motivo manca lo slot 2 o 1, diamo un fallback
    if (!imagePrimary && finalPaths.length > 0) imagePrimary = finalPaths[0];
    if (!imageSecondary && finalPaths.length > 1) imageSecondary = finalPaths[1];

    // Aggiorniamo il database
    const { error: updateError } = await supabaseAdmin.from('products').update({
      image_primary: imagePrimary,
      image_secondary: imageSecondary,
      gallery: finalPaths
    }).eq('sku', skuMatch);

    if (updateError) {
      console.error(`❌ Errore aggiornamento DB per SKU ${skuMatch}:`, updateError.message);
    } else {
      console.log(`✅ [OK] Sincronizzato ${skuMatch} (${product.name})`);
      updatedCount++;
    }
  }

  console.log(`\n🎉 Processo completato! Rinominati e aggiornati ${updatedCount} prodotti nel database.`);
}

seoAndSync();
