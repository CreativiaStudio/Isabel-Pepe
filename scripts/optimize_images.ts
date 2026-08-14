import * as fs from 'fs';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const env = process.env as Record<string, string>;

const supabaseAdmin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${(env.R2_ACCOUNT_ID || '').trim()}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: (env.R2_ACCESS_KEY_ID || '').trim(),
    secretAccessKey: (env.R2_SECRET_ACCESS_KEY || '').trim(),
  },
  requestChecksumCalculation: "WHEN_REQUIRED",
  responseChecksumValidation: "WHEN_REQUIRED",
});


async function optimizeImages() {
  console.log("🚀 Avvio Ottimizzazione Immagini (Conversione WebP + Resize)...");
  
  const { data: products, error } = await supabaseAdmin.from('products').select('*');
  if (error || !products) {
    console.error("Errore fetch prodotti:", error);
    return;
  }

  const publicUrlBase = env.R2_PUBLIC_URL || '';
  let optimizedCount = 0;
  const bucket = env.R2_BUCKET_NAME;

  for (const product of products) {
    let changed = false;
    let gallery = product.gallery || ["", "", "", "", ""];
    let newGallery = [...gallery];

    for (let i = 0; i < gallery.length; i++) {
      const currentUrl = gallery[i];
      if (!currentUrl) continue;
      
      // Se è già un webp, potremmo saltarlo, ma per sicurezza se l'utente ha caricato un webp pesante
      // lo ottimizziamo comunque. Qui ci basiamo sull'URL
      if (currentUrl.startsWith(publicUrlBase)) {
        const oldKey = decodeURIComponent(currentUrl.replace(`${publicUrlBase}/`, ''));
        const ext = oldKey.split('.').pop()?.toLowerCase();
        
        // Saltiamo i video
        if (ext === 'mp4' || ext === 'webm' || ext === 'mov') continue;
        
        // Se è già webp e l'abbiamo appena fatto, potremmo saltarlo, ma per sicurezza (le vecchie foto non lo erano)
        if (!oldKey.includes('.webp') || product.name.includes("Rêve")) {
          console.log(`⏳ Ottimizzo: ${oldKey}`);
          
          try {
            // 1. Scarica immagine originale via HTTP pubblico
            console.log(`⬇️ Download da: ${currentUrl}`);
            const response = await fetch(currentUrl);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const arrayBuffer = await response.arrayBuffer();
            const originalBuffer = Buffer.from(arrayBuffer);
            
            // 2. Comprimi con Sharp
            const optimizedBuffer = await sharp(originalBuffer)
              .resize({ width: 1500, withoutEnlargement: true })
              .webp({ quality: 80, effort: 4 })
              .toBuffer();
              
            const newKey = oldKey.substring(0, oldKey.lastIndexOf('.')) + '.webp';
            
            // 3. Carica la nuova versione
            const uint8Array = new Uint8Array(optimizedBuffer);
            const putCommand = new PutObjectCommand({
              Bucket: bucket,
              Key: newKey,
              Body: uint8Array,
              ContentLength: uint8Array.length,
              ContentType: 'image/webp'
            });
            await r2Client.send(putCommand);
            
            // 4. Se la chiave è cambiata (es da .jpeg a .webp), elimina il vecchio e aggiorna URL
            if (oldKey !== newKey) {
              await r2Client.send(new DeleteObjectCommand({
                Bucket: bucket,
                Key: oldKey
              }));
            }
            
            newGallery[i] = `${publicUrlBase}/${newKey}`;
            changed = true;
            
            const savedKB = ((originalBuffer.length - optimizedBuffer.length) / 1024).toFixed(2);
            console.log(`✅ Ottimizzata: ${newKey} (Risparmiati ${savedKB} KB)`);
            
          } catch (err: any) {
            console.error(`❌ Errore durante l'ottimizzazione di ${oldKey}:`, err.message);
          }
        }
      }
    }

    if (changed) {
      const updateData: any = { gallery: newGallery };
      if (newGallery[0]) updateData.image_secondary = newGallery[0];
      if (newGallery[1]) updateData.image_primary = newGallery[1];

      await supabaseAdmin.from('products').update(updateData).eq('id', product.id);
      console.log(`🔄 Aggiornato Database per prodotto: ${product.name}`);
      optimizedCount++;
    }
  }

  console.log(`\n🎉 Ottimizzazione completata! Aggiornati ${optimizedCount} prodotti.`);
}

optimizeImages();
