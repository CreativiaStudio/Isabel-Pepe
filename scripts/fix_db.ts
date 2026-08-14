import { createClient } from '@supabase/supabase-js';
import { S3Client, ListObjectsCommand } from '@aws-sdk/client-s3';
import * as fs from 'fs';

const env: any = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1]] = match[2].replace(/['"\r]/g, '').trim();
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${(env.R2_ACCOUNT_ID || '').trim()}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: (env.R2_ACCESS_KEY_ID || '').trim(),
    secretAccessKey: (env.R2_SECRET_ACCESS_KEY || '').trim(),
  },
  requestChecksumCalculation: "WHEN_REQUIRED",
  responseChecksumValidation: "WHEN_REQUIRED",
  forcePathStyle: true,
});

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

async function fixDB() {
  console.log("Fetching products from DB...");
  const { data: products } = await supabase.from('products').select('*');
  if (!products) return;

  console.log("Fetching images from R2...");
  const command = new ListObjectsCommand({ Bucket: env.R2_BUCKET_NAME });
  const response = await r2Client.send(command);
  const objects = response.Contents || [];
  console.log(`Found ${objects.length} images in R2.`);

  const publicUrlBase = env.R2_PUBLIC_URL || '';

  for (const product of products) {
    const slug = slugify(product.name);
    // Find all images in R2 that match this product's slug
    const matchingImages = objects.filter(o => o.Key && o.Key.includes(`isabel-pepe-${slug}`));
    
    if (matchingImages.length > 0) {
      console.log(`Found ${matchingImages.length} images for ${product.name}`);
      const newGallery = ["", "", "", "", ""];
      for (const img of matchingImages) {
        if (img.Key) {
          const url = `${publicUrlBase}/${img.Key}`;
          if (img.Key.includes('slot1')) newGallery[0] = url;
          else if (img.Key.includes('slot2')) newGallery[1] = url;
          else if (img.Key.includes('slot3')) newGallery[2] = url;
          else if (img.Key.includes('slot4')) newGallery[3] = url;
          else if (img.Key.includes('slot5')) newGallery[4] = url;
        }
      }
      // Se c'è almeno un'immagine, la mettiamo nei primi slot
      if (!newGallery.find(u => u !== "")) {
         matchingImages.forEach((img, i) => { if(i<5 && img.Key) newGallery[i] = `${publicUrlBase}/${img.Key}` });
      }

      const updateData: any = { gallery: newGallery };
      if (newGallery[1]) updateData.image_primary = newGallery[1];
      else if (newGallery[0]) updateData.image_primary = newGallery[0];
      
      if (newGallery[0]) updateData.image_secondary = newGallery[0];

      await supabase.from('products').update(updateData).eq('id', product.id);
      console.log(`Updated DB for ${product.name}`);
    } else {
      console.log(`No images found in R2 for ${product.name}`);
    }
  }
}

fixDB().catch(console.error);
