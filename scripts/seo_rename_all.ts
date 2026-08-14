import * as fs from 'fs';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';
import { S3Client, CopyObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

// Carica variabili d'ambiente
const envFile = fs.readFileSync('.env.local', 'utf8');
const env: Record<string, string> = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1]] = match[2].replace(/['"\r]/g, '').trim();
});

const supabaseAdmin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true,
});

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

async function renameR2Object(oldKey: string, newKey: string): Promise<boolean> {
  try {
    const bucket = env.R2_BUCKET_NAME;
    if (!bucket) return false;

    // Se la chiave è già quella attesa, salta
    if (oldKey === newKey) return true;

    // 1. Copia l'oggetto
    await r2Client.send(new CopyObjectCommand({
      Bucket: bucket,
      CopySource: `${bucket}/${oldKey}`,
      Key: newKey
    }));

    // 2. Cancella il vecchio oggetto
    await r2Client.send(new DeleteObjectCommand({
      Bucket: bucket,
      Key: oldKey
    }));

    return true;
  } catch (error: any) {
    console.error(`Errore ridenominazione da ${oldKey} a ${newKey}:`, error.message);
    return false;
  }
}

async function seoRenameAll() {
  console.log("🚀 Avvio Ottimizzazione SEO Immagini Pregresse...");
  
  const { data: products, error } = await supabaseAdmin.from('products').select('*');
  if (error || !products) {
    console.error("Errore fetch prodotti:", error);
    return;
  }

  const publicUrlBase = env.R2_PUBLIC_URL || '';
  let updatedCount = 0;

  for (const product of products) {
    let changed = false;
    const productSlug = slugify(product.name);
    
    // Controlliamo la galleria (5 slot)
    let gallery = product.gallery || ["", "", "", "", ""];
    let newGallery = [...gallery];

    for (let i = 0; i < gallery.length; i++) {
      const currentUrl = gallery[i];
      if (!currentUrl) continue;
      
      // Controlliamo se è un URL di Cloudflare R2
      if (currentUrl.startsWith(publicUrlBase)) {
        const oldKey = decodeURIComponent(currentUrl.replace(`${publicUrlBase}/`, ''));
        const ext = oldKey.split('.').pop();
        const expectedName = `isabel-pepe-${productSlug}-slot${i+1}`;
        const expectedKey = `products/${expectedName}.${ext}`;
        
        // Se il nome non è già SEO-friendly
        if (oldKey !== expectedKey) {
          console.log(`⏳ Rinomino: ${oldKey} -> ${expectedKey}`);
          const success = await renameR2Object(oldKey, expectedKey);
          if (success) {
            newGallery[i] = `${publicUrlBase}/${expectedKey}`;
            changed = true;
          }
        }
      }
    }

    if (changed) {
      // Dobbiamo aggiornare anche image_primary e image_secondary se sono i primi due slot
      const updateData: any = { gallery: newGallery };
      if (newGallery[0]) updateData.image_secondary = newGallery[0];
      if (newGallery[1]) updateData.image_primary = newGallery[1];

      const { error: updateError } = await supabaseAdmin.from('products').update(updateData).eq('id', product.id);
      
      if (updateError) {
        console.error(`❌ Errore aggiornamento DB per ${product.name}:`, updateError.message);
      } else {
        console.log(`✅ SEO aggiornata per: ${product.name}`);
        updatedCount++;
      }
    }
  }

  console.log(`\n🎉 Processo completato! Aggiornati ${updatedCount} prodotti.`);
}

seoRenameAll();
